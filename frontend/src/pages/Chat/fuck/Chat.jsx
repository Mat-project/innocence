import React, { useEffect, useState } from "react";
import ChatRoomList from "./ChatRoomList";
import ChatMessages from "./ChatMessages";
import ChatInput from "../ChatInput";
import Modal from "./Modal";
import { fetchRooms, fetchMessages, sendMessage } from "../../../service/examChat";
import { PlusCircle } from "lucide-react";

const Chat = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Load available rooms on mount
  useEffect(() => {
    const loadRooms = async () => {
      const roomData = await fetchRooms();
      setRooms(roomData);
      if (roomData.length > 0) {
        setSelectedRoom(roomData[0].id);
      }
    };
    loadRooms();
  }, []);

  // Load messages whenever the selected room changes
  useEffect(() => {
    if (selectedRoom) {
      const loadMessages = async () => {
        const msgs = await fetchMessages(selectedRoom);
        setMessages(msgs);
      };
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  const handleSendMessage = async (messageText) => {
    // For demonstration, using a hardcoded user id. In a real application, use authentication data.
    const userId = 1;
    if (selectedRoom && messageText.trim()) {
      const sent = await sendMessage(selectedRoom, messageText, userId);
      if (sent) {
        const updatedMessages = await fetchMessages(selectedRoom);
        setMessages(updatedMessages);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Sidebar – Chat Rooms */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Conversations</h2>
          <button 
            onClick={() => setShowModal(true)} 
            className="p-2 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            title="New Conversation"
          >
            <PlusCircle size={20} />
          </button>
        </div>
        <ChatRoomList 
          rooms={rooms} 
          selectedRoom={selectedRoom} 
          onSelectRoom={setSelectedRoom} 
        />
      </div>

      {/* Main Chat Area */}
      <div className="w-3/4 flex flex-col bg-gray-50 dark:bg-gray-900">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {rooms.find(r => r.id === selectedRoom)?.name || `Room ${selectedRoom}`}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              <ChatMessages messages={messages} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center text-gray-500 dark:text-gray-400 p-8">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-1">Select a conversation</h3>
              <p className="max-w-sm">Choose a conversation from the sidebar or create a new one to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} onRoomCreated={(room) => {
        setRooms(prev => [...prev, room]);
        setSelectedRoom(room.id);
        setShowModal(false);
      }} />}
    </div>
  );
};

export default Chat;