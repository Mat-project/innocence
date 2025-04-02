import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useChat } from '../../../context/ChatContext';
import moment from 'moment';

const ChatRoomList = ({ onNewChat, activeRoom, setActiveRoom }) => {
  const { rooms, loading, unreadCounts, selectChat } = useChat();
  const [search, setSearch] = useState('');

  const filteredRooms = rooms.filter(room => {
    if (!search) return true;
    const roomName = room.is_group ? room.name : room.users.find(u => u.id !== room.creator_id)?.name;
    return roomName && roomName.toLowerCase().includes(search.toLowerCase());
  });

  const getRoomName = (room) => {
    if (room.is_group) return room.name;
    const otherUser = room.users.find(u => u.id !== room.creator_id);
    return otherUser ? otherUser.name : 'Unknown';
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conversations</h2>
        <button onClick={onNewChat} className="p-2 text-indigo-600 hover:text-indigo-700">
          <Plus size={20} />
        </button>
      </div>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 relative">
        <input 
          type="text" 
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No conversations found</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredRooms.map((room) => (
              <li
                key={room.id}
                onClick={() => {
                  selectChat(room.id);
                  setActiveRoom(room);
                }}
                className={`cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  activeRoom?.id === room.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden bg-gray-300 dark:bg-gray-600 mr-3">
                    {room.is_group ? (
                      room.avatar ? (
                        <img src={room.avatar} alt={room.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center text-indigo-600 font-bold">
                          G
                        </div>
                      )
                    ) : (
                      (() => {
                        const other = room.users.find(u => u.id !== room.creator_id);
                        return other && other.avatar ? (
                          <img src={other.avatar} alt={other.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center text-indigo-600 font-bold">
{other && other.name ? other.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        );
                      })()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {getRoomName(room)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {room.last_message ? moment(room.last_message.timestamp).format('h:mm A') : ''}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {room.last_message ? room.last_message.content : 'No messages yet'}
                    </p>
                    {unreadCounts[room.id] > 0 && (
                      <div className="mt-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-white text-xs">
                        {unreadCounts[room.id]}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default ChatRoomList;