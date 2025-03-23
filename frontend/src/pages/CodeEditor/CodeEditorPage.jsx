// src/pages/CodeEditor/CodeEditorPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../service/axios';

const CodeEditorPage = () => {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fileName, setFileName] = useState('untitled.js');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [userInput, setUserInput] = useState('');
  const { fileId } = useParams();
  const navigate = useNavigate();
  const outputRef = useRef(null);
  
  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: 'js' },
    { value: 'typescript', label: 'TypeScript', extension: 'ts' },
    { value: 'html', label: 'HTML', extension: 'html' },
    { value: 'css', label: 'CSS', extension: 'css' },
    { value: 'python', label: 'Python', extension: 'py' },
    { value: 'java', label: 'Java', extension: 'java' },
    { value: 'csharp', label: 'C#', extension: 'cs' }
  ];
  
  const themes = [
    { value: 'vs', label: 'Light' },
    { value: 'vs-dark', label: 'Dark' },
    { value: 'hc-black', label: 'High Contrast' }
  ];
  
  useEffect(() => {
    if (fileId) {
      fetchCodeFile();
    } else {
      setIsLoading(false);
    }
  }, [fileId]);
  
  const fetchCodeFile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/code-files/${fileId}/`);
      setCode(response.data.content);
      setLanguage(response.data.language);
      setFileName(response.data.name);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching code file:', error);
      setIsLoading(false);
    }
  };
  
  const handleEditorChange = (value) => {
    setCode(value);
  };
  
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    const selectedLang = languages.find(lang => lang.value === newLang);
    if (selectedLang) {
      const nameWithoutExt = fileName.split('.')[0];
      setFileName(`${nameWithoutExt}.${selectedLang.extension}`);
    }
  };
  
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };
  
  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  };
  
  const saveFile = async () => {
    setIsSaving(true);
    try {
      if (fileId) {
        await axios.put(`/api/code-files/${fileId}/`, {
          name: fileName,
          content: code,
          language: language
        });
      } else {
        const response = await axios.post('/api/code-files/', {
          name: fileName,
          content: code,
          language: language
        });
        navigate(`/code-editor/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const createNewFile = () => {
    navigate('/code-editor/new');
    setCode('// Write your code here');
    setLanguage('javascript');
    setFileName('untitled.js');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const executeJavaScript = () => {
    setIsRunning(true);
    setOutput('');
    
    setTimeout(() => {
      try {
        const originalConsole = window.console;
        let outputText = '';
        
        window.console = {
          log: (...args) => {
            const logOutput = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            outputText += logOutput + '\n';
            originalConsole.log(...args);
          },
          error: (...args) => {
            const logOutput = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            outputText += 'Error: ' + logOutput + '\n';
            originalConsole.error(...args);
          },
          warn: (...args) => {
            const logOutput = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            outputText += 'Warning: ' + logOutput + '\n';
            originalConsole.warn(...args);
          },
          info: (...args) => {
            const logOutput = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            outputText += 'Info: ' + logOutput + '\n';
            originalConsole.info(...args);
          }
        };
        
        const result = eval(code);
        
        if (result !== undefined) {
          outputText += 'Result: ' + (typeof result === 'object' ? 
            JSON.stringify(result, null, 2) : String(result));
        }
        
        window.console = originalConsole;
        setOutput(outputText || 'Code executed successfully with no output.');
      } catch (error) {
        setOutput(`Error: ${error.message}`);
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };
  
  const executePython = async () => {
    try {
      const response = await axios.post('/api/code-files/execute/', {
        code,
        language: 'python',
        input: userInput
      });
      
      if (response.data.error === true) {
        setOutput(response.data.output);
      } else {
        setOutput(response.data.output);
      }
    } catch (error) {
      console.error('Error executing Python code:', error);
      setOutput(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const executeCode = async () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      if (language === 'javascript') {
        executeJavaScript();
      } else if (language === 'python') {
        await executePython();
      } else {
        setOutput(`Language ${language} execution is not supported yet.`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-gray-800 shadow">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <input
            type="text"
            value={fileName}
            onChange={handleFileNameChange}
            className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          
          <select 
            value={language}
            onChange={handleLanguageChange}
            className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {languages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          
          <select 
            value={theme}
            onChange={handleThemeChange}
            className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {themes.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={createNewFile}
            className="px-4 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
          >
            New File
          </button>
          <button
            onClick={saveFile}
            disabled={isSaving}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded flex items-center"
            title="Download code"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </button>
        </div>
      </div>
      
      <div className="flex-grow">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          language={language}
          value={code}
          theme={theme}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            roundedSelection: false,
            padding: { top: 10 },
          }}
        />
      </div>
      
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="flex items-center mb-2">
          <button
            onClick={executeCode}
            disabled={isRunning}
            className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-2"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          {language !== 'javascript' && (
            <span className="text-sm text-yellow-600 dark:text-yellow-400">
              Note: Only JavaScript execution is supported in-browser.
            </span>
          )}
        </div>
        
        <div 
          ref={outputRef}
          className="h-40 overflow-auto p-3 font-mono text-sm bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 rounded"
        >
          <pre className="text-gray-800 dark:text-gray-300">
            {output || 'Output will appear here after running the code...'}
          </pre>
        </div>
        
        {language === 'python' && (
          <div className="p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h3 className="text-sm font-semibold mb-2 dark:text-white">Input for Python (like stdin - separate values with newlines)</h3>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white h-24"
              placeholder="Enter input values here, one per line..."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditorPage;