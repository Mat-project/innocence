import React from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';

const ChatEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-800 p-4">
      <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-sm max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No conversation selected
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Choose an existing conversation or start a new one to begin messaging
        </p>
        
        <div className="flex justify-center">
          <button 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
            onClick={() => {
              // This needs to be connected to the "New Chat" action in the parent component
              // We'll use a pattern where the parent provides this callback
              document.querySelector('[data-new-chat-button]')?.click();
            }}
          >
            New Conversation
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>Your messages are end-to-end encrypted</p>
      </div>
    </div>
  );
};

export default ChatEmptyState;