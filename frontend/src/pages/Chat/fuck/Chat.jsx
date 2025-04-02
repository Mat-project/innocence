import React, { useEffect, useState } from "react";
import ChatRoomList from "./ChatRoomList";
import ChatMessages from "./ChatMessages";
import ChatInput from "../ChatInput";
import Modal from "./Modal";
import { fetchRooms, fetchMessages, sendMessage } from "../../../service/examChat";

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
    <div className="flex h-screen">
      {/* Left Sidebar – Chat Rooms */}
      <div className="w-1/4 border-r overflow-y-auto bg-gray-50">
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold">Chat Rooms</h2>
          <button onClick={() => setShowModal(true)} className="text-blue-500">
            Add Room
          </button>
        </div>
        <ChatRoomList rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />
      </div>

      {/* Main Chat Area */}
      <div className="w-3/4 flex flex-col bg-white">
        <div className="p-4 border-b">
          {selectedRoom ? `Room ID: ${selectedRoom}` : "Select a room"}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ChatMessages messages={messages} />
        </div>
        <div className="p-4 border-t">
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Chat;