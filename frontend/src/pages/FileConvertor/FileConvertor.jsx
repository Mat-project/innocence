//// filepath: d:/project/innovsence/frontend/src/pages/FileConvertor/FileConvertor.jsx
import React, { useState } from 'react';
import { fileConverterAPI } from '../../service/api';

export default function FileConvertor() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
  const [conversionType, setConversionType] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !fileType || !conversionType) {
      setError("Please provide a file, file type, and conversion type.");
      return;
    }
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);
    formData.append("conversion_type", conversionType);
    
    console.log("File:", file);
    console.log("File Type:", fileType);
    console.log("Conversion Type:", conversionType);
    
    try {
      const response = await fileConverterAPI.convertFile(formData);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (err) {
      setError(err.response.data.error || "Conversion failed");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">File Converter</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">File:</label>
          <input type="file" onChange={handleFileChange} className="border px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1">File Type:</label>
          <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="border px-2 py-1">
            <option value="">Select file type</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
            <option value="html">HTML</option>
            <option value="word">Word</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Conversion Type:</label>
          <select value={conversionType} onChange={(e) => setConversionType(e.target.value)} className="border px-2 py-1">
            <option value="">Select conversion</option>
            <option value="image_to_pdf">Image to PDF</option>
            <option value="pdf_to_img">PDF to Image</option>
            <option value="pdf_to_word">PDF to Word</option>
            <option value="html_to_pdf">HTML to PDF</option>
            <option value="pdf_to_pptx">PDF to PPTX</option>
            <option value="word_to_pdf">Word to PDF</option>
          </select>
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
          Convert
        </button>
      </form>
      {downloadUrl && (
        <div className="mt-4">
          <a href={downloadUrl} download="converted_file" className="text-indigo-600 underline">
            Download Converted File
          </a>
        </div>
      )}
    </div>
  );
}