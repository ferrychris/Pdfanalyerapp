import React, { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFSearchViewProps {
  fileUrl: string;
  searchTerm: string;
}

const PDFSearchView: React.FC<PDFSearchViewProps> = ({ fileUrl, searchTerm }) => {
  const [summary, setSummary] = useState<string>(""); // State for summary

  useEffect(() => {
    const fetchSummary = async () => {
      if (!searchTerm) return;
      try {
        const response = await axios.post('https://api.gemini.com/summary', { query: searchTerm });
        setSummary(response.data.summary); // Set the summary from the API response
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };
    fetchSummary();
  }, [searchTerm]);

  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [foundPages, setFoundPages] = useState<number[]>([]);
  const [pageTexts, setPageTexts] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const searchPDF = async () => {
      if (!fileUrl || !searchTerm) return;
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const results: number[] = [];
      const texts: { [key: number]: string } = {};
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item) => (item as any).str || '')
          .join(" ");
        const lowerCaseText = text.toLowerCase();
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
        // Check if the search term is present in the text
        if (lowerCaseText.includes(lowerCaseSearchTerm)) {
          results.push(i);
          texts[i] = text; // Store the entire text of the page
        }
      }
      setFoundPages(results);
      setPageTexts(texts);
      if (results.length > 0) setCurrentPage(results[0]);
    };
    searchPDF();
  }, [fileUrl, searchTerm]);

  const copyToClipboard = () => {
    const textToCopy = pageTexts[currentPage];
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert("Text copied to clipboard!");
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">PDF Search View</h2>
      <div className="flex gap-4 mb-4">
        {summary && ( // Display the summary if it exists
          <div className="mb-4 p-2 border rounded bg-gray-100">
            <h3 className="font-semibold">Summary:</h3>
            <p>{summary}</p>
          </div>
        )}
        <p className="text-gray-700">Search Term: <strong>{searchTerm}</strong></p>
      </div>
      <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        <Page pageNumber={currentPage} />
      </Document>
      <div className="flex justify-between mt-4">
        <button 
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="p-2 hover:bg-gray-100 rounded-full"
          disabled={currentPage <= 1}
        >
          <ChevronLeft />
        </button>
        <p>Page {currentPage} of {numPages}</p>
        <button 
          onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
          className="p-2 hover:bg-gray-100 rounded-full"
          disabled={currentPage >= numPages}
        >
          <ChevronRight />
        </button>
      </div>
      {foundPages.length > 0 && currentPage in pageTexts && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Search Results:</h3>
          <div className="mt-2">
            <p className="whitespace-pre-wrap">{pageTexts[currentPage]}</p> {/* Display the full text of the current page */}
          </div>
          <button onClick={copyToClipboard} className="mt-2 p-2 bg-blue-500 text-white rounded">
            Copy All Text
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFSearchView;
