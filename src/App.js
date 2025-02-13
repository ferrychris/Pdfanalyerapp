"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var axios_1 = require("axios"); // Import axios for API calls
var supabase_1 = require("./lib/supabase");
var generative_ai_1 = require("@google/generative-ai");
var lucide_react_1 = require("lucide-react");
var react_pdf_1 = require("react-pdf");
require("react-pdf/dist/esm/Page/AnnotationLayer.css");
require("react-pdf/dist/esm/Page/TextLayer.css");
var react_highlight_words_1 = require("react-highlight-words");
react_pdf_1.pdfjs.GlobalWorkerOptions.workerSrc = "//cdnjs.cloudflare.com/ajax/libs/pdf.js/".concat(react_pdf_1.pdfjs.version, "/pdf.worker.min.js");
function App() {
    var _this = this;
    var _a = (0, react_1.useState)(null), session = _a[0], setSession = _a[1];
    var _b = (0, react_1.useState)(""), email = _b[0], setEmail = _b[1];
    var _c = (0, react_1.useState)(""), password = _c[0], setPassword = _c[1];
    var _d = (0, react_1.useState)([]), files = _d[0], setFiles = _d[1];
    var _e = (0, react_1.useState)(false), uploading = _e[0], setUploading = _e[1];
    var _f = (0, react_1.useState)(null), selectedFileUrl = _f[0], setSelectedFileUrl = _f[1];
    var _g = (0, react_1.useState)(null), numPages = _g[0], setNumPages = _g[1];
    var _h = (0, react_1.useState)(1), currentPage = _h[0], setCurrentPage = _h[1];
    var _j = (0, react_1.useState)(""), searchTerm = _j[0], setSearchTerm = _j[1];
    var _k = (0, react_1.useState)([]), foundResults = _k[0], setFoundResults = _k[1];
    var _l = (0, react_1.useState)(false), isSearching = _l[0], setIsSearching = _l[1];
    var _m = (0, react_1.useState)(false), isLoading = _m[0], setIsLoading = _m[1];
    var _o = (0, react_1.useState)(null), selectedResult = _o[0], setSelectedResult = _o[1];
    var _p = (0, react_1.useState)(""), summary = _p[0], setSummary = _p[1]; // State for summary
    var pageRef = (0, react_1.useRef)(null);
    var apiKey = "AIzaSyCQ-PBg8StgQn--3pd30gjiKI1SrbwEOfg"; // Replace with your actual API key
    var genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    var defaultSearchTerms = ["breach", "training"];
    var summarizeText = function (text) { return __awaiter(_this, void 0, void 0, function () {
        var model, response, summary_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    model = genAI.getGenerativeModel({ model: "gemini-pro" });
                    return [4 /*yield*/, model.generateContent("Summarize this: ".concat(text))];
                case 1:
                    response = _a.sent();
                    summary_1 = response.response.text();
                    return [2 /*return*/, summary_1];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error fetching summary:", error_1);
                    return [2 /*return*/, "Failed to generate summary."];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        supabase_1.supabase.auth.getSession().then(function (_a) {
            var session = _a.data.session;
            setSession(session);
            if (session)
                loadFiles();
        });
        var subscription = supabase_1.supabase.auth.onAuthStateChange(function (_event, session) {
            setSession(session);
            if (session)
                loadFiles();
        }).data.subscription;
        return function () {
            subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe();
        };
    }, []);
    (0, react_1.useEffect)(function () {
        if (selectedResult && pageRef.current) { // Check for null
            var highlightText = function () {
                var textLayer = pageRef.current.querySelector(".react-pdf__Page__textContent");
                if (!textLayer)
                    return;
                // Remove any existing highlights
                var existingHighlights = textLayer.querySelectorAll(".text-highlight");
                existingHighlights.forEach(function (el) {
                    el.classList.remove("text-highlight");
                });
                var textElements = Array.from(textLayer.querySelectorAll("span"));
                var fullText = textElements.map(function (el) { return el.textContent; }).join(" ");
                // Find the paragraph boundaries
                var paragraphStart = -1;
                var paragraphEnd = -1;
                var foundParagraph = false;
                textElements.forEach(function (element, index) {
                    var elementText = element.textContent || ""; // Default to empty string if null
                    if (elementText
                        .toLowerCase()
                        .includes(selectedResult.term.toLowerCase()) &&
                        !foundParagraph) {
                        // Found the term, now find paragraph boundaries
                        foundParagraph = true;
                        // Find paragraph start (look backwards)
                        for (var i = index; i >= 0; i--) {
                            var prevText = textElements[i].textContent;
                            if ((prevText === null || prevText === void 0 ? void 0 : prevText.trim()) === "") {
                                paragraphStart = i + 1;
                                break;
                            }
                        }
                        if (paragraphStart === -1)
                            paragraphStart = 0;
                        // Find paragraph end (look forwards)
                        for (var i = index; i < textElements.length; i++) {
                            var nextText = textElements[i].textContent;
                            if ((nextText === null || nextText === void 0 ? void 0 : nextText.trim()) === "") {
                                paragraphEnd = i - 1;
                                break;
                            }
                        }
                        if (paragraphEnd === -1)
                            paragraphEnd = textElements.length - 1;
                    }
                });
                // Highlight the entire paragraph
                if (paragraphStart !== -1 && paragraphEnd !== -1) {
                    for (var i = paragraphStart; i <= paragraphEnd; i++) {
                        textElements[i].classList.add("text-highlight");
                    }
                }
                // Highlight the search term within the paragraph
                textElements.forEach(function (element) {
                    var elementText = element.textContent || ""; // Default to empty string if null
                    if (elementText
                        .toLowerCase()
                        .includes(selectedResult.term.toLowerCase())) {
                        element.classList.add("term-highlight");
                    }
                });
            };
            // Wait for the text layer to be rendered
            setTimeout(highlightText, 100);
        }
    }, [selectedResult, currentPage]);
    var loadFiles = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.id))
                        return [2 /*return*/];
                    return [4 /*yield*/, supabase_1.supabase.storage
                            .from("filestorage")
                            .list(session.user.id)];
                case 1:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error("Error loading files:", error);
                        return [2 /*return*/];
                    }
                    setFiles(data || []);
                    return [2 /*return*/, data];
            }
        });
    }); };
    var handleCopyResults = function () {
        if (foundResults.length === 0) {
            alert("No search results to copy!");
            return;
        }
        var textToCopy = foundResults
            .map(function (result) { return "Page ".concat(result.page, ": ").concat(result.context); })
            .join("\n\n");
        navigator.clipboard
            .writeText(textToCopy)
            .then(function () {
            alert("Search results copied to clipboard!");
        })
            .catch(function (err) {
            console.error("Failed to copy:", err);
        });
    };
    var handleFileUpload = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, fileExt, fileName, filePath, error, updatedFiles, newFile, url, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setSummary(""); // Reset summary on file upload
                    if (!e.target.files || !e.target.files[0])
                        return [2 /*return*/];
                    file = e.target.files[0];
                    fileExt = file.name.split(".").pop();
                    fileName = "".concat(Math.random(), ".").concat(fileExt);
                    filePath = "".concat((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id, "/").concat(fileName);
                    setUploading(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, 9, 10]);
                    return [4 /*yield*/, supabase_1.supabase.storage
                            .from("filestorage")
                            .upload(filePath, file)];
                case 2:
                    error = (_b.sent()).error;
                    if (error)
                        throw error;
                    return [4 /*yield*/, loadFiles()];
                case 3:
                    updatedFiles = _b.sent();
                    if (!(updatedFiles && updatedFiles.length > 0)) return [3 /*break*/, 7];
                    newFile = updatedFiles.find(function (f) { return f.name === fileName; });
                    if (!newFile) return [3 /*break*/, 7];
                    return [4 /*yield*/, getFileUrl(newFile.name)];
                case 4:
                    url = _b.sent();
                    setSelectedFileUrl(url);
                    setCurrentPage(1);
                    setFoundResults([]);
                    setSelectedResult(null);
                    setSearchTerm(defaultSearchTerms.join("|"));
                    // Execute search immediately after setting the file URL
                    return [4 /*yield*/, searchPDF(url, defaultSearchTerms.join("|"))];
                case 5:
                    // Execute search immediately after setting the file URL
                    _b.sent();
                    // Fetch summary from Gemini API
                    return [4 /*yield*/, fetchSummary(defaultSearchTerms.join("|"))];
                case 6:
                    // Fetch summary from Gemini API
                    _b.sent();
                    _b.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_2 = _b.sent();
                    alert(error_2.message); // Explicitly type the error
                    return [3 /*break*/, 10];
                case 9:
                    setUploading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    // Define searchPDF function outside of handleFileUpload
    var searchPDF = function (url, searchTerm) { return __awaiter(_this, void 0, void 0, function () {
        var pdf, results, searchTerms, i, page, textContent, textItems, fullText, _i, searchTerms_1, term, regex, match, startIndex, endIndex, contextStart, contextEnd, context, summary_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!url || !searchTerm)
                        return [2 /*return*/];
                    setIsLoading(true);
                    setIsSearching(true);
                    setSelectedResult(null);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, 13, 14]);
                    return [4 /*yield*/, react_pdf_1.pdfjs.getDocument(url).promise];
                case 2:
                    pdf = _a.sent();
                    results = [];
                    searchTerms = searchTerm.toLowerCase().split("|");
                    i = 1;
                    _a.label = 3;
                case 3:
                    if (!(i <= pdf.numPages)) return [3 /*break*/, 11];
                    return [4 /*yield*/, pdf.getPage(i)];
                case 4:
                    page = _a.sent();
                    return [4 /*yield*/, page.getTextContent()];
                case 5:
                    textContent = _a.sent();
                    textItems = textContent.items.map(function (item) { return item.str; });
                    fullText = textItems.join(" ");
                    _i = 0, searchTerms_1 = searchTerms;
                    _a.label = 6;
                case 6:
                    if (!(_i < searchTerms_1.length)) return [3 /*break*/, 10];
                    term = searchTerms_1[_i];
                    regex = new RegExp("[^,]*".concat(term, "[^,]*"), "gi");
                    match = void 0;
                    _a.label = 7;
                case 7:
                    if (!((match = regex.exec(fullText)) !== null)) return [3 /*break*/, 9];
                    startIndex = Math.max(0, match.index);
                    endIndex = Math.min(fullText.length, regex.lastIndex);
                    contextStart = startIndex;
                    while (contextStart > 0 && fullText[contextStart - 1] !== ",") {
                        contextStart--;
                    }
                    contextEnd = endIndex;
                    while (contextEnd < fullText.length && fullText[contextEnd] !== ",") {
                        contextEnd++;
                    }
                    if (contextEnd < fullText.length)
                        contextEnd++; // Include the comma
                    context = fullText.slice(contextStart, contextEnd).trim();
                    return [4 /*yield*/, summarizeText(context)];
                case 8:
                    summary_2 = _a.sent();
                    results.push({
                        page: i,
                        context: context,
                        term: term,
                        fullText: context,
                        summary: summary_2,
                    });
                    return [3 /*break*/, 7];
                case 9:
                    _i++;
                    return [3 /*break*/, 6];
                case 10:
                    i++;
                    return [3 /*break*/, 3];
                case 11:
                    setFoundResults(results);
                    setIsLoading(false);
                    if (results.length > 0) {
                        setCurrentPage(results[0].page);
                        setSelectedResult(results[0]);
                    }
                    return [3 /*break*/, 14];
                case 12:
                    error_3 = _a.sent();
                    console.error("Search error:", error_3);
                    return [3 /*break*/, 14];
                case 13:
                    setIsSearching(false);
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    }); };
    var fetchSummary = function (searchTerm) { return __awaiter(_this, void 0, void 0, function () {
        var response, trimmedSummary, finalSummary, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!searchTerm)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post("https://api.gemini.com/summary", { query: searchTerm })];
                case 2:
                    response = _a.sent();
                    trimmedSummary = response.data.summary.split(' ').slice(0, 10).join(' ');
                    finalSummary = trimmedSummary + (response.data.summary.split(' ').length > 10 ? '...' : '');
                    setSummary(finalSummary);
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error fetching summary:", error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDeleteFile = function (fileName) { return __awaiter(_this, void 0, void 0, function () {
        var error, currentFileUrl;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase.storage
                        .from("filestorage")
                        .remove(["".concat((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id, "/").concat(fileName)])];
                case 1:
                    error = (_b.sent()).error;
                    if (error) {
                        alert("Error deleting file: " + error.message);
                        return [2 /*return*/];
                    }
                    setFiles(files.filter(function (file) { return file.name !== fileName; }));
                    if (!selectedFileUrl) return [3 /*break*/, 3];
                    return [4 /*yield*/, getFileUrl(fileName)];
                case 2:
                    currentFileUrl = _b.sent();
                    if (currentFileUrl === selectedFileUrl) {
                        setSelectedFileUrl(null);
                        setSearchTerm("");
                        setFoundResults([]);
                        setSelectedResult(null);
                    }
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getFileUrl = function (fileName) { return __awaiter(_this, void 0, void 0, function () {
        var data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase.storage
                        .from("filestorage")
                        .getPublicUrl("".concat((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id, "/").concat(fileName))];
                case 1:
                    data = (_b.sent()).data;
                    return [2 /*return*/, data.publicUrl];
            }
        });
    }); };
    var previewFile = function (fileName) { return __awaiter(_this, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getFileUrl(fileName)];
                case 1:
                    url = _a.sent();
                    setSelectedFileUrl(url);
                    setCurrentPage(1);
                    setFoundResults([]);
                    setSelectedResult(null);
                    setSearchTerm(defaultSearchTerms.join("|"));
                    return [2 /*return*/];
            }
        });
    }); };
    var handleResultClick = function (result) {
        setCurrentPage(result.page);
        setSelectedResult(result);
    };
    if (!session) {
        return (<div className="min-h-screen bg-gray-100 flex ">
        <div className="bg-white p-1 rounded-lg shadow-md w-[100%]">
          <h1 className="text-2xl font-bold mb-6 text-center">Welcome</h1>
          <form onSubmit={function (e) {
                e.preventDefault();
                supabase_1.supabase.auth.signInWithPassword({ email: email, password: password });
            }} className="space-y-4 px-[550px] justify-center mt-[150px]">
            <div className=" ">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input type="email" value={email} onChange={function (e) { return setEmail(e.target.value); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[30px]" required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input type="password" value={password} onChange={function (e) { return setPassword(e.target.value); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[30px]" required/>
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Sign In
            </button>
          </form>
          <div className="px-[550px] justify-center">
            <button onClick={function () { return supabase_1.supabase.auth.signUp({ email: email, password: password }); }} className="mt-4 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Sign Up
            </button>
          </div>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-100 p-1">
      <div className="max-w-1xl mx-auto">
        <div className="flex justify-between items-center mb-8 px-[60px] pt-[10px]">
          <h1 className="text-2xl font-bold">File Storage</h1>
          <button onClick={function () { return supabase_1.supabase.auth.signOut(); }} className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-2">
            <lucide_react_1.LogOut size={20}/> Sign Out
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block cursor-pointer">
            <div className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
              <lucide_react_1.Upload className="w-6 h-6"/> Upload PDF File
            </div>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf"/>
          </label>
        </div>

        {selectedFileUrl &&
            summary && ( // Display summary if it exists
        <div className="mb-4 p-2 border rounded bg-gray-100">
              <h3 className="font-semibold">Summary:</h3>
              <p>{summary}</p>
            </div>)}
        {selectedFileUrl && (<div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="bg-white rounded-lg shadow-md p-6 mt-8 flex-1">
              <h2 className="text-xl font-semibold mb-4">PDF Preview</h2>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <input type="text" placeholder="Search terms (separate with | for multiple terms)" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="border px-3 py-2 rounded-md w-full"/>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically searching for: breach, training
                  </p>
                </div>
              </div>

              <div ref={pageRef} className="pdf-container relative">
                <react_pdf_1.Document file={selectedFileUrl} onLoadSuccess={function (_a) {
            var numPages = _a.numPages;
            return setNumPages(numPages);
        }}>
                  <react_pdf_1.Page pageNumber={currentPage}/>
                </react_pdf_1.Document>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button onClick={function () { return setCurrentPage(function (p) { return Math.max(p - 1, 1); }); }} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage <= 1}>
                  <lucide_react_1.ChevronLeft />
                </button>
                <p>
                  Page {currentPage} of {numPages !== null ? numPages : 0}
                </p>
                <button onClick={function () {
                return setCurrentPage(function (p) { return Math.min(p + 1, numPages || 1); });
            }} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={currentPage >= (numPages || 1)}>
                  <lucide_react_1.ChevronRight />
                </button>
              </div>
            </div>

            {isLoading ? (<p>Loading preview...</p> // 🔥 Show loading message
            ) : (foundResults.length > 0 && (<div className="bg-white rounded-lg shadow-md p-[80px] mt-8 flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Search Results ({foundResults.length})
                </h3>

                <div className="overflow-y-auto h-[750px] w-[550px]">
                  <ul className="space-y-2">
                    <button onClick={handleCopyResults} className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md mb-4 hover:bg-gray-300">
                      <lucide_react_1.Copy size={18}/> Copy Results
                    </button>
                    {foundResults.map(function (result, index) { return (<li key={index} className={"p-3 ".concat(selectedResult === result ? "" : "")} onClick={function () { return handleResultClick(result); }}>
                        <div className="flex justify-between mb-1">
                          <p className="text-sm text-gray-600">{index + 1}.</p>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Found: {result.term}
                          </span>
                        </div>
                        <p className="text-gray-800">
                        <p className="text-sm mt-2">
             {result.summary}
          </p>
                          <react_highlight_words_1.default searchWords={searchTerm
                        .split("|")
                        .map(function (term) { return term.trim(); })} autoEscape={true} textToHighlight={result.context}/>
                        </p>
                      </li>); })}
                  </ul>
                </div>
              </div>))}
          </div>)}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Files</h2>
          <div className="grid grid-cols-1 gap-4">
            {files.map(function (file) { return (<div key={file.id} className="border rounded-lg p-4 flex items-center gap-3">
                <lucide_react_1.FileText className="w-6 h-6 text-gray-500"/>
                <p className="flex-1 text-sm font-medium truncate">
                  {file.name}
                </p>
                <button onClick={function () { return previewFile(file.name); }} className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50">
                  Preview
                </button>
                <button onClick={function () { return handleDeleteFile(file.name); }} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
                  <lucide_react_1.Trash size={18}/>
                </button>
              </div>); })}
            {files.length === 0 && (<p className="text-gray-500 text-center py-4">
                No files uploaded yet
              </p>)}
          </div>
        </div>
      </div>
      <style>{"\n        .text-highlight {\n          background-color: rgba(255, 255, 0, 0.4) !important;\n          border-radius: 2px;\n        }\n        .term-highlight {\n          background-color: black !important;\n          color: white !important;\n          border-radius: 2px;\n        }\n        .pdf-container .react-pdf__Page__textContent {\n          pointer-events: none;\n        }\n      "}</style>
    </div>);
}
exports.default = App;
