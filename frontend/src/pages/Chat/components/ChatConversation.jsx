import { useRef, useEffect } from "react";
import { useChat } from "../../../context/ChatContext";
import ChatHeader from "../ChatHeader";
import ChatInput from "../ChatInput";
import ChatMessage from "../ChatMessage";

const ChatConversation = ({ onBackClick }) => {
  const { activeChat, messages } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((msg) => {
      const dateObj = new Date(msg.created_at);
      let dateStr = "Unknown";
      if (!isNaN(dateObj.getTime())) {
        dateStr = dateObj.toDateString();
      }
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(msg);
    });
    return groups;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Unknown";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    }).format(date);
  };

  if (!activeChat) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400 dark:text-gray-500"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-1">No conversation selected</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Choose a chat or start a new conversation</p>
      </div>
    );
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-full">
      <ChatHeader conversation={activeChat} onBack={onBackClick} isMobile={true} />
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900" style={{ backgroundSize: 'cover' }}>
        <div className="max-w-3xl mx-auto py-4 px-2">
          {messages && messages.length > 0 ? (
            Object.keys(groupedMessages).map(dateStr => (
              <div key={dateStr}>
                <div className="flex justify-center my-4">
                  <div className="px-3 py-1 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs shadow-sm">
                    {formatDate(dateStr)}
                  </div>
                </div>
                {groupedMessages[dateStr].map((msg, index) => (
                  <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    showAvatar={index === 0 || groupedMessages[dateStr][index - 1]?.sender?.id !== msg.sender.id}
                  />
                ))}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-500 dark:text-gray-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">No messages yet</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Say hello to start the conversation</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <ChatInput chatId={activeChat.id} />
    </div>
  );
}

export default ChatConversation;