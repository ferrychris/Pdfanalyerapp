import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Import axios for API calls
import { supabase } from "./lib/resupabase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Upload,
  FileText,
  LogOut,
  Copy,
  ChevronLeft,
  ChevronRight,
  Trash,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Highlight from "react-highlight-words";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Define types
interface Session {
  user: {
    id: string;
  };
}

interface FileObject {
  id: string;
  name: string;
}

interface SummaryResponse {
  summary: string;
}
type SearchResult = {
  page: number;
  context: string;
  term: string;
  fullText: string;
  summary: string;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [files, setFiles] = useState<FileObject[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [foundResults, setFoundResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(
    null
  );
  const [summary, setSummary] = useState<string>(""); // State for summary
  const pageRef = useRef<HTMLDivElement | null>(null);
  const apiKey = "AIzaSyCQ-PBg8StgQn--3pd30gjiKI1SrbwEOfg"; // Replace with your actual API key
  const genAI = new GoogleGenerativeAI(apiKey);

  const defaultSearchTerms = ["breach", "training"];
  const summarizeText = async (text: string): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const response = await model.generateContent(`Summarize this: ${text}`);
      const summary = response.response.text();
      return summary;
    } catch (error) {
      console.error("Error fetching summary:", error);
      return "Failed to generate summary.";
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadFiles();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadFiles();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (selectedResult && pageRef.current) {
      // Check for null
      const highlightText = () => {
        const textLayer = pageRef.current.querySelector(
          ".react-pdf__Page__textContent"
        );
        if (!textLayer) return;

        // Remove any existing highlights
        const existingHighlights =
          textLayer.querySelectorAll(".text-highlight");
        existingHighlights.forEach((el) => {
          el.classList.remove("text-highlight");
        });

        const textElements = Array.from(textLayer.querySelectorAll("span"));
        const fullText = textElements.map((el) => el.textContent).join(" ");

        // Find the paragraph boundaries
        let paragraphStart = -1;
        let paragraphEnd = -1;
        let foundParagraph = false;

        textElements.forEach((element, index) => {
          const elementText = element.textContent || ""; // Default to empty string if null
          if (
            elementText
              .toLowerCase()
              .includes(selectedResult.term.toLowerCase()) &&
            !foundParagraph
          ) {
            // Found the term, now find paragraph boundaries
            foundParagraph = true;

            // Find paragraph start (look backwards)
            for (let i = index; i >= 0; i--) {
              const prevText = textElements[i].textContent;
              if (prevText?.trim() === "") {
                paragraphStart = i + 1;
                break;
              }
            }
            if (paragraphStart === -1) paragraphStart = 0;

            // Find paragraph end (look forwards)
            for (let i = index; i < textElements.length; i++) {
              const nextText = textElements[i].textContent;
              if (nextText?.trim() === "") {
                paragraphEnd = i - 1;
                break;
              }
            }
            if (paragraphEnd === -1) paragraphEnd = textElements.length - 1;
          }
        });

        // Highlight the entire paragraph
        if (paragraphStart !== -1 && paragraphEnd !== -1) {
          for (let i = paragraphStart; i <= paragraphEnd; i++) {
            textElements[i].classList.add("text-highlight");
          }
        }

        // Highlight the search term within the paragraph
        textElements.forEach((element) => {
          const elementText = element.textContent || ""; // Default to empty string if null
          if (
            elementText
              .toLowerCase()
              .includes(selectedResult.term.toLowerCase())
          ) {
            element.classList.add("term-highlight");
          }
        });
      };

      // Wait for the text layer to be rendered
      setTimeout(highlightText, 100);
    }
  }, [selectedResult, currentPage]);

  const loadFiles = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase.storage
      .from("filestorage")
      .list(session.user.id);
    if (error) {
      console.error("Error loading files:", error);
      return;
    }
    setFiles(data || []);
    return data;
  };
  const handleCopyResults = () => {
    if (foundResults.length === 0) {
      alert("No search results to copy!");
      return;
    }

    const textToCopy = foundResults
      .map((result) => `Page ${result.page}: ${result.context}`)
      .join("\n\n");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        alert("Search results copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(""); // Reset summary on file upload
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${session?.user?.id}/${fileName}`;
    setUploading(true);

    try {
      const { error } = await supabase.storage
        .from("filestorage")
        .upload(filePath, file);
      if (error) throw error;

      const updatedFiles = await loadFiles();
      if (updatedFiles && updatedFiles.length > 0) {
        const newFile = updatedFiles.find((f) => f.name === fileName);
        if (newFile) {
          const url = await getFileUrl(newFile.name);
          setSelectedFileUrl(url);
          setCurrentPage(1);
          setFoundResults([]);
          setSelectedResult(null);
          setSearchTerm(defaultSearchTerms.join("|"));

          // Execute search immediately after setting the file URL
          await searchPDF(url, defaultSearchTerms.join("|"));

          // Fetch summary from Gemini API
          await fetchSummary(defaultSearchTerms.join("|"));
        }
      }
    } catch (error) {
      alert((error as Error).message); // Explicitly type the error
    } finally {
      setUploading(false);
    }
  };

  // Define searchPDF function outside of handleFileUpload
  const searchPDF = async (url: string, searchTerm: string) => {
    if (!url || !searchTerm) return;
    setIsLoading(true);
    setIsSearching(true);
    setSelectedResult(null);
    try {
      const pdf = await pdfjs.getDocument(url).promise;
      const results: SearchResult[] = [];
      const searchTerms = searchTerm.toLowerCase().split("|");

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item) => (item as any).str);
        const fullText = textItems.join(" ");

        for (const term of searchTerms) {
          const regex = new RegExp(`[^,]*${term}[^,]*`, "gi");
          let match;
          while ((match = regex.exec(fullText)) !== null) {
            const startIndex = Math.max(0, match.index);
            const endIndex = Math.min(fullText.length, regex.lastIndex);

            // Find the start of the phrase (previous comma or start of text)
            let contextStart = startIndex;
            while (contextStart > 0 && fullText[contextStart - 1] !== ",") {
              contextStart--;
            }

            // Find the end of the phrase (next comma or end of text)
            let contextEnd = endIndex;
            while (
              contextEnd < fullText.length &&
              fullText[contextEnd] !== ","
            ) {
              contextEnd++;
            }
            if (contextEnd < fullText.length) contextEnd++; // Include the comma

            const context = fullText.slice(contextStart, contextEnd).trim();
            const summary = await summarizeText(context);

            results.push({
              page: i,
              context: context,
              term: term,
              fullText: context,
              summary,
            });
          }
        }
      }

      setFoundResults(results);
      setIsLoading(false);
      if (results.length > 0) {
        setCurrentPage(results[0].page);
        setSelectedResult(results[0]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchSummary = async (searchTerm: string) => {
    if (!searchTerm) return;
    try {
      const response = await axios.post<SummaryResponse>(
        "https://api.gemini.com/summary",
        { query: searchTerm }
      );

      // Trim the summary to 20 words
      const trimmedSummary = response.data.summary
        .split(" ")
        .slice(0, 10)
        .join(" ");

      // Add ellipsis if the summary was trimmed
      const finalSummary =
        trimmedSummary +
        (response.data.summary.split(" ").length > 10 ? "..." : "");

      setSummary(finalSummary);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };
  const handleDeleteFile = async (fileName: string) => {
    const { error } = await supabase.storage
      .from("filestorage")
      .remove([`${session?.user?.id}/${fileName}`]);

    if (error) {
      alert("Error deleting file: " + error.message);
      return;
    }

    setFiles(files.filter((file) => file.name !== fileName));
    if (selectedFileUrl) {
      const currentFileUrl = await getFileUrl(fileName);
      if (currentFileUrl === selectedFileUrl) {
        setSelectedFileUrl(null);
        setSearchTerm("");
        setFoundResults([]);
        setSelectedResult(null);
      }
    }
  };

  const getFileUrl = async (fileName: string) => {
    const { data } = await supabase.storage
      .from("filestorage")
      .getPublicUrl(`${session?.user?.id}/${fileName}`);
    return data.publicUrl;
  };

  const previewFile = async (fileName: string) => {
    const url = await getFileUrl(fileName);
    setSelectedFileUrl(url);
    setCurrentPage(1);
    setFoundResults([]);
    setSelectedResult(null);
    setSearchTerm(defaultSearchTerms.join("|"));
  };

  const handleResultClick = (result: SearchResult) => {
    setCurrentPage(result.page);
    setSelectedResult(result);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex ">
        <div className="bg-white p-1 rounded-lg shadow-md w-[100%]">
          <h1 className="text-2xl font-bold mb-6 text-center">Welcome</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              supabase.auth.signInWithPassword({ email, password });
            }}
            className="space-y-4 px-[550px] justify-center mt-[150px]"
          >
            <div className=" ">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[30px]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[30px]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>
          <div className="px-[550px] justify-center">
            <button
              onClick={() => supabase.auth.signUp({ email, password })}
              className="mt-4 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-1">
      <div className="max-w-1xl mx-auto">
        <div className="flex justify-between items-center mb-8 px-[60px] pt-[10px]">
          <h1 className="text-2xl font-bold">File Storage</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block cursor-pointer">
            <div className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
              <Upload className="w-6 h-6" /> Upload PDF File
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf"
            />
          </label>
        </div>

        {selectedFileUrl &&
          summary && ( // Display summary if it exists
            <div className="mb-4 p-2 border rounded bg-gray-100">
              <h3 className="font-semibold">Summary:</h3>
              <p>{summary}</p>
            </div>
          )}
        {selectedFileUrl && (
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="bg-white rounded-lg shadow-md p-6 mt-8 flex-1">
              <h2 className="text-xl font-semibold mb-4">PDF Preview</h2>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search terms (separate with | for multiple terms)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="hidden border px-3 py-2 rounded-md w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically searching for: breach, training
                  </p>
                </div>
              </div>

              <div ref={pageRef} className="pdf-container relative">
                <Document
                  file={selectedFileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                >
                  <Page pageNumber={currentPage} />
                </Document>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft />
                </button>
                <p>
                  Page {currentPage} of {numPages !== null ? numPages : 0}
                </p>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, numPages || 1))
                  }
                  className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage >= (numPages || 1)}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center items-center mt-8 absolute justify-center ml-[800px] mt-[230px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
                <p>Result Loading</p>
              </div>
            )}

            {!isLoading && foundResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-[80px] mt-8 flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Search Results ({foundResults.length})
                </h3>

                <div className="overflow-y-auto h-[750px] w-[550px]">
                  <ul className="space-y-2">
                    <button
                      onClick={handleCopyResults}
                      className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md mb-4 hover:bg-gray-300"
                    >
                      <Copy size={18} /> Copy Results
                    </button>
                    {foundResults.map((result, index) => (
                      <li
                        key={index}
                        className="p-3"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex justify-between mb-1">
                          <p className="text-sm text-gray-600">{index + 1}.</p>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Found: {result.term}
                          </span>
                        </div>
                        <div className="text-gray-800">
                          <p className="text-sm mt-2">{result.summary}</p>
                          <Highlight
                            searchWords={searchTerm
                              .split("|")
                              .map((term) => term.trim())}
                            autoEscape={true}
                            textToHighlight={result.context}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Files</h2>
          <div className="grid grid-cols-1 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="border rounded-lg p-4 flex items-center gap-3"
              >
                <FileText className="w-6 h-6 text-gray-500" />
                <p className="flex-1 text-sm font-medium truncate">
                  {file.name}
                </p>
                <button
                  onClick={() => previewFile(file.name)}
                  className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleDeleteFile(file.name)}
                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}
            {files.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No files uploaded yet
              </p>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .text-highlight {
          background-color: rgba(255, 255, 0, 0.4) !important;
          border-radius: 2px;
        }
        .term-highlight {
          background-color: black !important;
          color: white !important;
          border-radius: 2px;
        }
        .pdf-container .react-pdf__Page__textContent {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

export default App;
