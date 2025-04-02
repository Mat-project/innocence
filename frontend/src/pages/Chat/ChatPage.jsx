import React from 'react';
import { ChatProvider } from '../../context/ChatContext';
import ChatLayout from './components/ChatLayout';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ChatPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return (
    <ChatProvider>
      <div className="h-full bg-gray-50 dark:bg-gray-800">
        <ChatLayout />
      </div>
    </ChatProvider>
  );
};

export default ChatPage;