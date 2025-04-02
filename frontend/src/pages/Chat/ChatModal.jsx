import React, { useState, useEffect, useRef } from 'react';
import { X, Search, UserPlus, Users, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { chatAPI } from '../../service/chatAPI';

const NewChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: async () => {
      const response = await chatAPI.searchUsers(searchTerm);
      return response.data;
    },
    enabled: searchTerm.length > 1,
  });

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Handle click outside to close modal
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      return isSelected ? prev.filter(u => u.id !== user.id) : [...prev, user];
    });
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const chatData = {
        users: selectedUsers.map(user => user.id),
        is_group: isGroupChat,
        name: isGroupChat ? groupName : ''
      };

      const response = await chatAPI.createRoom(chatData);
      onChatCreated(response.data);
      // Reset form
      setSelectedUsers([]);
      setSearchTerm('');
      setIsGroupChat(false);
      setGroupName('');
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      // Optionally show notification
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            New Conversation
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Toggle between direct and group chat */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            <button 
              className={`flex items-center py-2 px-3 rounded-md ${!isGroupChat ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setIsGroupChat(false)}
            >
              <User size={16} className="mr-2" />
              Direct Message
            </button>
            <button 
              className={`flex items-center py-2 px-3 rounded-md ${isGroupChat ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-600 dark:text-gray-300'}`}
              onClick={() => setIsGroupChat(true)}
            >
              <Users size={16} className="mr-2" />
              Group Chat
            </button>
          </div>
        </div>

        {/* Group name input (only for group chats) */}
        {isGroupChat && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter group name..."
            />
          </div>
        )}

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search for people..."
            />
          </div>

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedUsers.map(user => (
                <div 
                  key={user.id}
                  className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  <span>{user.username}</span>
                  <button 
                    onClick={() => toggleUserSelection(user)}
                    className="ml-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
            </div>
          ) : searchTerm.length > 1 ? (
            <div className="py-2">
              {searchResults.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No users found
                </div>
              ) : (
                searchResults.map(user => {
                  const isSelected = selectedUsers.some(u => u.id === user.id);
                  return (
                    <div 
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden mr-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                      </div>
                      <div className="ml-2">
                        {isSelected ? (
                          <div className="h-6 w-6 bg-indigo-500 text-white rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="h-6 w-6 border border-gray-300 dark:border-gray-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <UserPlus className="mx-auto h-12 w-12 opacity-30" />
              <p className="mt-2">Search for people to start a conversation</p>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm mr-2 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || (isGroupChat && !groupName)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${
              selectedUsers.length === 0 || (isGroupChat && !groupName)
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default NewChatModal;