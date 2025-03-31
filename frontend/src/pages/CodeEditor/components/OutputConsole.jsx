import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Copy, Check } from 'lucide-react';

const OutputConsole = ({ output, isRunning, onClear }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const consoleRef = useRef(null);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  // Handle copying output to clipboard
  const handleCopy = () => {
    if (!output) return;
    
    navigator.clipboard.writeText(output)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy output:', err));
  };

  // Format the output with proper line breaks
  const renderOutput = () => {
    if (!output) return null;
    
    return output.split('\n').map((line, index) => (
      <div key={index} className="font-mono text-sm">
        {line || <br />}
      </div>
    ));
  };

  return (
    <div className={`bg-gray-900 border-t border-gray-700 flex flex-col ${
      isMaximized ? 'fixed inset-0 z-50' : 'h-48'
    }`}>
      <div className="bg-gray-800 px-3 py-2 flex justify-between items-center">
        <div className="text-gray-300 text-sm font-medium">Output</div>
        <div className="flex space-x-1">
          {output && (
            <button
              onClick={handleCopy}
              className="p-1 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700"
              title="Copy output"
            >
              {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          )}
          
          <button
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700"
            title="Clear output"
          >
            <X size={16} />
          </button>
          
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 text-gray-400 hover:text-gray-200 rounded-md hover:bg-gray-700"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
      
      <div 
        ref={consoleRef}
        className="flex-grow overflow-y-auto p-3 text-white bg-gray-900"
      >
        {isRunning ? (
          <div className="flex items-center text-yellow-400">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent mr-2"></div>
            Running code...
          </div>
        ) : output ? (
          renderOutput()
        ) : (
          <div className="text-gray-500 italic">Code output will appear here</div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;