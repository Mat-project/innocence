import React, { useState, useRef } from "react";
import axios from "axios";
import { 
  FileUp, 
  Download, 
  File, 
  Image, 
  FileText, 
  FileSpreadsheet,
  AlertCircle, 
  Check, 
  Loader, 
  X
} from "lucide-react";
import fileConvertorAPI from "../../service/fileConvertorAPI";

const conversionOptions = [
  {
    id: "word_to_pdf",
    title: "Word to PDF",
    sourceType: "word",
    sourceExt: ["docx"],
    targetExt: "pdf",
    icon: <FileText className="w-5 h-5 text-blue-500" />
  },
  {
    id: "pdf_to_word",
    title: "PDF to Word",
    sourceType: "pdf",
    sourceExt: ["pdf"],
    targetExt: "docx",
    icon: <File className="w-5 h-5 text-red-500" />
  },
  {
    id: "img_to_pdf", // CHANGE THIS FROM "image_to_pdf" to "img_to_pdf"
    title: "Image to PDF",
    sourceType: "image",
    sourceExt: ["png", "jpg", "jpeg"],
    targetExt: "pdf",
    icon: <Image className="w-5 h-5 text-purple-500" />
  },
  {
    id: "pdf_to_img",
    title: "PDF to Images",
    sourceType: "pdf",
    sourceExt: ["pdf"],
    targetExt: "zip/png",
    icon: <Image className="w-5 h-5 text-green-500" />
  },
  {
    id: "html_to_pdf",
    title: "HTML to PDF",
    sourceType: "html",
    sourceExt: ["html", "htm"],
    targetExt: "pdf",
    icon: <FileText className="w-5 h-5 text-orange-500" />
  },
  {
    id: "pdf_to_pptx",
    title: "PDF to PowerPoint",
    sourceType: "pdf",
    sourceExt: ["pdf"],
    targetExt: "pptx",
    icon: <FileSpreadsheet className="w-5 h-5 text-yellow-500" />
  },
];

export default function FileConverter() {
  const [selectedConversion, setSelectedConversion] = useState(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, uploading, success, error
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null); // Add this state at the top
  
  const fileInputRef = useRef(null);
  
  const handleConversionSelect = (conversion) => {
    setSelectedConversion(conversion);
    setFile(null);
    setStatus("idle");
    setError("");
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (!selectedConversion.sourceExt.includes(fileExt)) {
      setError(`Invalid file type. Please select a ${selectedConversion.sourceExt.join(" or ")} file.`);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError("");
    setStatus("idle");
  };
  
  const handleConvert = async () => {
    if (!file || !selectedConversion) return;

    try {
      setStatus("uploading");
      setProgress(0);
      setError("");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("file_type", selectedConversion.sourceType);
      formData.append("conversion_type", selectedConversion.id);
      
      const response = await fileConvertorAPI.convertFile(formData, (event) => {
        const progress = Math.round((event.loaded * 100) / event.total);
        setProgress(progress);
      });
      
      console.log("Server response:", response.data); // For debugging
      
      if (response.data && response.data.file_url) {
        setStatus("success");
        setDownloadUrl(response.data.file_url); // Store the URL
        
        // Try automatic download
        try {
          const link = document.createElement('a');
          link.href = response.data.file_url;
          link.download = response.data.filename || 'converted-file.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (downloadErr) {
          console.error("Auto-download failed:", downloadErr);
          // Don't set error state - we'll show the manual button instead
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setStatus("error");
      console.log("Conversion error: ", err);
      setError(err.response?.data?.error || "Failed to convert file. Please try again.");
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          File Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Convert your files between different formats with ease
        </p>
      </div>
      
      {/* Conversion Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {conversionOptions.map((option) => (
          <div
            key={option.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedConversion?.id === option.id
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            onClick={() => handleConversionSelect(option)}
          >
            <div className="flex items-center">
              <div className="mr-3">{option.icon}</div>
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">
                  {option.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.sourceExt.join(", ").toUpperCase()} → {option.targetExt.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* File Upload Area */}
      {selectedConversion && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
              {selectedConversion.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a {selectedConversion.sourceExt.join(" or ")} file to convert
            </p>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={selectedConversion.sourceExt.map(ext => `.${ext}`).join(",")}
          />
          
          {!file ? (
            <div
              onClick={triggerFileSelect}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
            >
              <FileUp className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                Click to select a file
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports {selectedConversion.sourceExt.join(", ")} files
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setFile(null)}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {error && (
                <div className="mt-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              {status === "uploading" && (
                <div className="mt-4">
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {progress}% - Converting...
                  </p>
                </div>
              )}
              
              {status === "success" && (
                <div className="mt-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-md text-sm flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  <span>Conversion complete!</span>
                </div>
              )}
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={triggerFileSelect}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  Change file
                </button>
                
                <button
                  onClick={handleConvert}
                  disabled={status === "uploading"}
                  className={`px-4 py-2 rounded-md text-white text-sm flex items-center transition-all ${
                    status === "uploading" 
                      ? "bg-indigo-400 dark:bg-indigo-600/50 cursor-not-allowed" 
                      : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  }`}
                >
                  {status === "uploading" ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Convert to {selectedConversion.targetExt.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
              
              {status === "success" && downloadUrl && (
                <button 
                  onClick={() => window.open(downloadUrl, '_blank')}
                  className="mt-4 px-4 py-2 rounded-md text-white text-sm flex items-center transition-all bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Download Converted File
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Additional Information */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-sm transition-colors">
        <h3 className="font-medium text-gray-800 dark:text-white mb-2">
          About File Conversion
        </h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li className="flex items-start">
            <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
            <span>All conversions happen securely on our servers.</span>
          </li>
          <li className="flex items-start">
            <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
            <span>Files are automatically deleted after processing.</span>
          </li>
          <li className="flex items-start">
            <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
            <span>Multi-page documents are supported with ZIP downloads.</span>
          </li>
          <li className="flex items-start">
            <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
            <span>Maximum file size: 50 MB</span>
          </li>
        </ul>
      </div>
    </div>
  );
}