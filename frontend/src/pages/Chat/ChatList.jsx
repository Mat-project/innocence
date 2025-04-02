import React, { useState } from 'react';
import { Search, Plus, Bell, Settings, MessageSquare, Users, User } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { formatDistanceToNow } from 'date-fns';

export default function ChatList() {
  const { chats, activeChat, selectChat, unreadCounts } = useChat();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'direct', 'group'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chats based on filter type and search query
  const filteredChats = chats.filter(chat => {
    // Type filter (direct vs group)
    if (filterType === 'direct' && chat.is_group) return false;
    if (filterType === 'group' && !chat.is_group) return false;
    
    // Search filter
    if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      // For direct messages, also search recipient name
      if (!chat.is_group) {
        const recipientName = chat.participants.find(p => p.id !== chat.creator_id)?.name || '';
        if (!recipientName.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      } else {
        return false;
      }
    }
    
    return true;
  });

  // Function to get appropriate chat name
  const getChatName = (chat) => {
    if (chat.is_group) return chat.name;
    
    // For direct messages, show the other person's name
    const otherUser = chat.participants.find(p => p.id !== chat.creator_id);
    return otherUser ? otherUser.name : 'Unknown User';
  };

  // Function to get avatar for the chat
  const getChatAvatar = (chat) => {
    if (chat.is_group) {
      return chat.avatar || <Users className="w-full h-full text-gray-400 p-1" />;
    }
    
    // For direct messages, show the other person's avatar
    const otherUser = chat.participants.find(p => p.id !== chat.creator_id);
    return otherUser?.avatar || <User className="w-full h-full text-gray-400 p-1" />;
  };

  // Format the timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Get the message preview text
  const getMessagePreview = (chat) => {
    if (!chat.last_message) return 'No messages yet';
    
    if (chat.last_message.attachment) {
      return `📎 ${chat.last_message.attachment.name || 'Attachment'}`;
    }
    
    return chat.last_message.content.length > 40
      ? `${chat.last_message.content.substring(0, 40)}...`
      : chat.last_message.content;
  };

  // Handle new chat creation
  const handleChatCreated = (newChat) => {
    selectChat(newChat.id);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex mt-3 border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-2 text-sm font-medium border-b-2 ${
                filterType === 'all'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setFilterType('all')}
            >
              All Chats
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium border-b-2 ${
                filterType === 'direct'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setFilterType('direct')}
            >
              Direct
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium border-b-2 ${
                filterType === 'group'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setFilterType('group')}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4">
              <MessageSquare size={40} className="mb-2 opacity-40" />
              <p className="text-center">No conversations found</p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Start a chat
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    activeChat?.id === chat.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3 flex-shrink-0">
                      {typeof getChatAvatar(chat) === 'string' ? (
                        <img src={getChatAvatar(chat)} alt={getChatName(chat)} className="w-full h-full object-cover" />
                      ) : (
                        getChatAvatar(chat)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getChatName(chat)}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(chat.last_message?.created_at || chat.updated_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" style={{ maxWidth: '220px' }}>
                          {getMessagePreview(chat)}
                        </p>
                        {unreadCounts[chat.id] > 0 && (
                          <span className="inline-flex items-center justify-center bg-indigo-600 text-white text-xs font-medium rounded-full h-5 min-w-[20px] px-1">
                            {unreadCounts[chat.id]}
                          </span>
                        )}
                      </div>
                      {chat.typing_users?.length > 0 && (
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                          Typing...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium"
          >
            <Plus size={16} className="mr-1" />
            New Conversation
          </button>
        </div>
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </>
  );
}