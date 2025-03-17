// src/pages/CodeEditor/CodeEditorPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../service/axios';

const CodeEditorPage = () => {
  const [code, setCode] = useState('# Write your Python code here');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fileName, setFileName] = useState('untitled.js');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const { fileId } = useParams();
  const navigate = useNavigate();
  const outputRef = useRef(null);
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [pendingExecution, setPendingExecution] = useState(false);

  // Supported languages - add Python to the list
  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: 'js' },
    { value: 'python', label: 'Python', extension: 'py' },
    { value: 'typescript', label: 'TypeScript', extension: 'ts' },
    { value: 'html', label: 'HTML', extension: 'html' },
    { value: 'css', label: 'CSS', extension: 'css' },
    { value: 'java', label: 'Java', extension: 'java' },
    { value: 'csharp', label: 'C#', extension: 'cs' }
  ];

  // Available themes
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
    const selectedLang = e.target.value;
    setLanguage(selectedLang);

    // Update file extension
    const nameWithoutExtension = fileName.split('.')[0];
    const newExtension = languages.find(lang => lang.value === selectedLang)?.extension || 'txt';
    setFileName(`${nameWithoutExtension}.${newExtension}`);

    // Set default code template based on language
    if (selectedLang === 'python' && code === '// Write your code here') {
      setCode('# Write your Python code here');
    } else if (selectedLang === 'javascript' && code === '# Write your Python code here') {
      setCode('// Write your code here');
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
        // Update existing file
        await axios.put(`/api/code-files/${fileId}/`, {
          name: fileName,
          content: code,
          language: language
        });
      } else {
        // Create new file
        const response = await axios.post('/api/code-files/', {
          name: fileName,
          content: code,
          language: language
        });
        // Navigate to the edit page for the new file
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
        // Create a safe console object to capture log outputs
        const originalConsole = window.console;
        let outputText = '';

        // Override console methods to capture output
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

        // Execute the code
        // Note: This is using eval which has security implications
        // For a production app, consider using a more secure approach
        // like iframe sandboxing or a server-side execution environment
        const result = eval(code);

        // Add the result to the output if it's not undefined
        if (result !== undefined) {
          outputText += 'Result: ' + (typeof result === 'object' ?
            JSON.stringify(result, null, 2) : String(result));
        }

        // Restore the original console
        window.console = originalConsole;
        setOutput(outputText || 'Code executed successfully with no output.');
      } catch (error) {
        setOutput(`Error: ${error.message}`);
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };

  // Execute code based on language
  const runCode = () => {
    if (language === 'javascript') {
      executeJavaScript();
    } else {
      setOutput(`Running ${language} code is not supported in the browser. Consider implementing a backend service for ${language} execution.`);
    }
  };

  // Add this new download function
  const handleDownload = () => {
    // Create a blob with the current code content
    const blob = new Blob([code], { type: 'text/plain' });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    // Append to the document, click it to trigger download, then clean up
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Release the object URL
    URL.revokeObjectURL(url);
  };

  const handleRunCode = async () => {
    if (language === 'python' && code.includes('input(')) {
      // If Python code contains input() function, show input modal
      setPendingExecution(true);
      setIsInputModalOpen(true);
      return;
    }

    // Otherwise run directly
    executeCode();
  };

  // New function that actually executes the code after input is provided
  const executeCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    setPendingExecution(false);

    try {
      let response;

      if (language === 'python') {
        response = await axios.post('/api/execute-python/', {
          code,
          input: userInput
        });
      } else {
        response = await axios.post('/api/execute/', { code });
      }

      setOutput(response.data.output || 'No output');

      if (outputRef?.current) {
        outputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error executing code:', error);
      setOutput(`Error: ${error.response?.data?.error || error.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Editor Header */}
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
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            title="Download code"
          >
            <i className="fas fa-download mr-2"></i> Download
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
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
      <div className="flex-grow">
        <Editor
          height="60%"  // Adjusted to make room for output panel
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

      {/* Add input section for Python */}
      {language === 'python' && (
        <div className="input-section mt-4">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-medium">Program Input</h3>
            <button
              onClick={() => setShowInput(!showInput)}
              className="ml-2 text-sm text-blue-500 hover:text-blue-600"
            >
              {showInput ? 'Hide' : 'Show'}
            </button>
          </div>

          {showInput && (
            <div className="mb-4">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter input values here (one per line)"
                className="w-full h-32 p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                For programs that use input(), enter each value on a new line
              </p>
            </div>
          )}
        </div>
      )}

      {/* Run Button and Output Panel */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="flex items-center mb-2">
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-2"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          {language !== 'javascript' && (
            <span className="text-sm text-yellow-600 dark:text-yellow-400">
              Note: Only JavaScript  and Python execution is supported in-browser.
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
      </div>

      {/* Input Modal */}
      {isInputModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Program Input</h3>
            <p className="mb-4 text-sm">
              Your code requires user input. Please provide values for each input() call (one per line):
            </p>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter input values here (one per line)"
              className="w-full h-32 p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsInputModalOpen(false);
                  setPendingExecution(false);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded dark:bg-gray-600 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsInputModalOpen(false);
                  executeCode();
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Run Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditorPage;