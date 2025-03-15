// src/pages/CodeEditor/CodeEditorFeature.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CodeEditorPage from './CodeEditorPage';
import CodeFilesList from './CodeFilesList';

const CodeEditorFeature = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Code Editor</h1>
      
      <Routes>
        <Route path="/" element={<CodeFilesList />} />
        <Route path="/new" element={<CodeEditorPage />} />
        <Route path="/:fileId" element={<CodeEditorPage />} />
      </Routes>
    </div>
  );
};

export default CodeEditorFeature;