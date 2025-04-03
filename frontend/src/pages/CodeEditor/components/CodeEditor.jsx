import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Save, Play, AlertTriangle } from 'lucide-react';
import axios from '../../../services/api/axios';
import { useBeforeUnload } from 'react-router-dom';

const CodeEditor = ({ 
  selectedFile, 
  onRunCode,
  onFileContentChange 
}) => {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [language, setLanguage] = useState('python');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [theme, setTheme] = useState('vs-dark');
  
  // Track auto-save timer
  const autoSaveTimerRef = useRef(null);
  const editorRef = useRef(null);

  // Set up the beforeunload event handler for unsaved changes
  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (hasUnsavedChanges) {
          event.preventDefault();
          return "You have unsaved changes. Are you sure you want to leave?";
        }
      },
      [hasUnsavedChanges]
    )
  );

  // Load file content when selectedFile changes
  useEffect(() => {
    if (selectedFile?.id) {
      loadFileContent(selectedFile.id);
    } else {
      // No file selected, clear the editor
      setContent('');
      setOriginalContent('');
      setHasUnsavedChanges(false);
      setLanguage('python');
    }

    // Clean up auto-save timer on file change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [selectedFile]);

  // Load file content from API
  const loadFileContent = async (fileId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/code-editor/files/${fileId}/`);
      const fileData = response.data;
      
      setContent(fileData.content || '');
      setOriginalContent(fileData.content || '');
      setLanguage(fileData.language || 'python');
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error loading file:', err);
      setError('Failed to load file content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save file content to API
  const saveFileContent = async () => {
    if (!selectedFile?.id || !hasUnsavedChanges) return;

    try {
      setLoading(true);
      console.log('Saving file:', selectedFile.id);
      console.log('Content:', content.substring(0, 50) + '...'); // Log partial content for debugging
      
      // Make sure axios is correctly imported with the right path
      await axios.put(`/api/code-editor/files/${selectedFile.id}/`, {
        content: content,
        // Only include necessary fields
        name: selectedFile.name,
        language: selectedFile.language
      });
      
      setOriginalContent(content);
      setHasUnsavedChanges(false);
      setSaveMessage('File saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Error saving file:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
      }
      setError(`Failed to save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle editor content changes
  const handleEditorChange = (value) => {
    setContent(value);
    setHasUnsavedChanges(value !== originalContent);
    
    // Clear any existing auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Set up auto-save timer (save after 1.5 seconds of inactivity)
    if (value !== originalContent && selectedFile?.id) {
      autoSaveTimerRef.current = setTimeout(() => {
        console.log("Auto-saving...");
        saveFileContent();
      }, 1500);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add keyboard shortcut for save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveFileContent();
    });
    
    // Set up additional editor options
    editor.updateOptions({
      fontSize: 14,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });
  };

  // Get language for Monaco editor (convert from backend language to Monaco language)
  const getMonacoLanguage = () => {
    const languageMap = {
      'python': 'python',
      'javascript': 'javascript',
      'html': 'html',
      'css': 'css',
      'java': 'java',
      'cpp': 'cpp',
      'csharp': 'csharp',
      'php': 'php',
      'ruby': 'ruby',
      'go': 'go',
      'rust': 'rust',
      'typescript': 'typescript',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'plain_text': 'plaintext'
    };
    
    return languageMap[language] || 'plaintext';
  };

  // Run the code
  const handleRunCode = () => {
    if (onRunCode && content) {
      onRunCode(content);
    }
    
    // Save before running if there are unsaved changes
    if (hasUnsavedChanges) {
      saveFileContent();
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'vs-dark' ? 'vs-light' : 'vs-dark');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Editor toolbar */}
      <div className="bg-gray-800 dark:bg-gray-900 p-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center">
          {selectedFile ? (
            <span className="text-gray-300 text-sm">
              {selectedFile.name}
              {hasUnsavedChanges && <span className="ml-1 text-yellow-500">•</span>}
            </span>
          ) : (
            <span className="text-gray-400 text-sm italic">No file selected</span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={toggleTheme}
            className="py-1 px-2 text-xs bg-black hover:bg-gray-600 text-gray-200 rounded"
            title="Toggle light/dark theme"
          >
            {theme === 'vs-dark' ? 'Light' : 'Dark'} Theme
          </button>
          
          <button
            onClick={saveFileContent}
            disabled={!selectedFile || !hasUnsavedChanges || loading}
            className={`flex items-center py-1 px-2 text-xs rounded ${
              !selectedFile || !hasUnsavedChanges || loading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="Save file (Ctrl+S)"
          >
            <Save size={14} className="mr-1" />
            Save
          </button>
          
          <button
            onClick={handleRunCode}
            disabled={!selectedFile || loading}
            className={`flex items-center py-1 px-2 text-xs rounded ${
              !selectedFile || loading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            title="Run code (F5)"
          >
            <Play size={14} className="mr-1" />
            Run
          </button>
        </div>
      </div>
      
      {/* Status messages */}
      {(error || saveMessage) && (
        <div className={`px-3 py-2 text-sm ${
          error 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        }`}>
          {error || saveMessage}
        </div>
      )}
      
      {/* Unsaved changes warning */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 flex items-center text-sm text-yellow-800 dark:text-yellow-300">
          <AlertTriangle size={16} className="mr-2" />
          Unsaved changes
        </div>
      )}
      
      {/* Loading indicator overlaying the editor */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Editor component */}
      <div className="flex-grow">
        <Editor
          height="100%"
          language={getMonacoLanguage()}
          value={content}
          theme={theme}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly: !selectedFile || loading,
            fontSize: 14,
            wordWrap: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          loading={
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default CodeEditor;