import React, { useState, useEffect } from 'react';
import FileManager from './components/FileManager';
import CodeEditor from './components/CodeEditor';
import OutputConsole from './components/OutputConsole';
import axios from '../../services/api/axios';
import { Loader } from 'lucide-react';

const CodeEditorPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [userInputs, setUserInputs] = useState([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [executionQueue, setExecutionQueue] = useState(null);

  useEffect(() => {
    // Simulate loading monaco editor
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Effect to process execution when input is added
  useEffect(() => {
    // If we're waiting for input and we have a queued execution
    if (isWaitingForInput && executionQueue && userInputs.length > 0) {
      continueExecution();
    }
  }, [userInputs, isWaitingForInput, executionQueue]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleAddInput = (input) => {
    setUserInputs(prev => [...prev, input]);
  };

  const handleRunCode = async (code) => {
    if (!code) return;
    
    setIsRunning(true);
    setOutput('');
    setUserInputs([]); // Clear previous inputs
    
    try {
      const response = await axios.post('/api/code-editor/run-python/', { 
        code,
        inputs: userInputs 
      });
      
      const result = response.data;
      
      let formattedOutput = '';
      if (result.stdout) {
        formattedOutput += result.stdout;
      }
      
      if (result.stderr) {
        formattedOutput += result.stderr.length > 0 
          ? (formattedOutput.length > 0 ? '\n\n' : '') + 'Error:\n' + result.stderr 
          : '';
      }
      
      // Check if we need to handle input
      if (formattedOutput.includes('input(') && !result.stderr) {
        setIsWaitingForInput(true);
        setExecutionQueue({ code, result });
        // Update output to show we're waiting for input
        formattedOutput += '\n[Waiting for input...]';
      } else {
        setIsWaitingForInput(false);
        setExecutionQueue(null);
      }
      
      setOutput(formattedOutput || 'Code executed successfully (no output)');
    } catch (err) {
      console.error('Error running code:', err);
      setOutput(`Failed to execute code: ${err.message || 'Unknown error'}`);
      setIsWaitingForInput(false);
      setExecutionQueue(null);
    } finally {
      if (!isWaitingForInput) {
        setIsRunning(false);
      }
    }
  };

  const continueExecution = async () => {
    if (!executionQueue) return;
    
    const { code } = executionQueue;
    
    try {
      const response = await axios.post('/api/code-editor/run-python/', { 
        code,
        inputs: userInputs 
      });
      
      const result = response.data;
      
      let formattedOutput = '';
      if (result.stdout) {
        formattedOutput += result.stdout;
      }
      
      if (result.stderr) {
        formattedOutput += result.stderr.length > 0 
          ? (formattedOutput.length > 0 ? '\n\n' : '') + 'Error:\n' + result.stderr 
          : '';
      }
      
      // Check if we still need more input
      if (formattedOutput.includes('input(') && !result.stderr) {
        setIsWaitingForInput(true);
        setExecutionQueue({ code, result });
        // Update output to show we're waiting for input
        formattedOutput += '\n[Waiting for input...]';
      } else {
        setIsWaitingForInput(false);
        setExecutionQueue(null);
      }
      
      setOutput(formattedOutput || 'Code executed successfully (no output)');
    } catch (err) {
      console.error('Error running code:', err);
      setOutput(`Failed to execute code: ${err.message || 'Unknown error'}`);
      setIsWaitingForInput(false);
      setExecutionQueue(null);
    } finally {
      if (!isWaitingForInput) {
        setIsRunning(false);
      }
    }
  };

  const handleClearOutput = () => {
    setOutput('');
    setUserInputs([]);
    setIsRunning(false);
    setIsWaitingForInput(false);
    setExecutionQueue(null);
  };

  if (initializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Loader size={40} className="animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Loading Code Editor...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="flex-grow flex overflow-hidden">
        {/* File Manager - takes 20% of width */}
        <div className="w-1/5 overflow-hidden">
          <FileManager 
            onFileSelect={handleFileSelect}
            selectedFileId={selectedFile?.id}
          />
        </div>
        
        {/* Code Editor - takes 80% of width */}
        <div className="w-4/5 flex flex-col overflow-hidden">
          <div className="flex-grow">
            <CodeEditor 
              selectedFile={selectedFile}
              onRunCode={handleRunCode}
            />
          </div>
          
          <OutputConsole 
            output={output}
            isRunning={isRunning}
            onClear={handleClearOutput}
            userInputs={userInputs}
            onAddInput={handleAddInput}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;