import React, { useState } from 'react';
import ChatEmptyState from './ChatEmptyState';
import ChatConversation from './ChatConversation';
import ChatRoomList from './ChatRoomList';
import NewChatModal from '../ChatModal';

const ChatLayout = () => {
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);

  const handleChatCreated = (newChat) => {
    setActiveRoom(newChat);
    setShowNewChatModal(false);
  };

  return (
    <div className="h-full">
      {/* Mobile View */}
      <div className="md:hidden h-full">
        {activeRoom ? (
          <ChatConversation onBackClick={() => setActiveRoom(null)} />
        ) : (
          <ChatRoomList
            onNewChat={() => setShowNewChatModal(true)}
            activeRoom={activeRoom}
            setActiveRoom={setActiveRoom}
          />
        )}
      </div>

      {/* Desktop/Tablet View */}
      <div className="hidden md:flex h-full">
        <div className="w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ChatRoomList
            onNewChat={() => setShowNewChatModal(true)}
            activeRoom={activeRoom}
            setActiveRoom={setActiveRoom}
          />
        </div>
        <div className="w-2/3 lg:w-3/4 flex flex-col">
          {activeRoom ? (
            <ChatConversation onBackClick={() => setActiveRoom(null)} />
          ) : (
            <ChatEmptyState />
          )}
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default ChatLayout;