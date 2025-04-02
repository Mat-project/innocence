import React, { createContext, useContext, useEffect, useState } from "react";
import { chatAPI } from "../service/chatAPI";
import chatSocket from "../pages/Chat/utils/chatSocket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  // Helper: Normalize a message so sender is always an object
  const normalizeMessage = (msg) => {
    if (typeof msg.sender !== "object") {
      return { ...msg, sender: { id: msg.sender, name: msg.sender_name } };
    }
    return msg;
  };

  // Fetch all chat rooms
  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getRooms();
      // You can sort or process the rooms if needed.
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setLoading(false);
    }
  };

  // Select a chat room and load its messages
  const selectChat = async (chatId) => {
    try {
      setLoading(true);
      const chatResponse = await chatAPI.getRoom(chatId);
      setActiveChat(chatResponse.data);

      const msgResponse = await chatAPI.getRoomMessages(chatId);
      const messagesData = (msgResponse.data.results || msgResponse.data).map(normalizeMessage);
      setMessages(messagesData);
      // Optionally mark messages as read here using chatAPI.markMessagesRead
      setLoading(false);
    } catch (error) {
      console.error("Error selecting chat:", error);
      setLoading(false);
    }
  };

  // Send a message (and normalize the returned message)
// In ChatContext.jsx
const sendMessage = async (chatId, content, attachment = null) => {
  try {
    let response;
    if (attachment) {
      const formData = new FormData();
      formData.append("file", attachment);
      formData.append("content", content || ""); // Changed from "message" to "content"
      formData.append("room", chatId);
      response = await chatAPI.uploadFile(formData);
    } else {
      // Make sure your API expects these exact field names
      response = await chatAPI.sendMessage({ 
        room: chatId, 
        content: content 
      });
    }
    let newMessage = normalizeMessage(response.data);
    setMessages((prev) => [...prev, newMessage]);
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    // Log more details about the error
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    throw error;
  }
};

  // WebSocket: Real-time updates for active chat
  useEffect(() => {
    if (!activeChat || !isAuthenticated) return;
    const token = localStorage.getItem("accessToken");
    chatSocket.connect(activeChat.id, token);

    const messageHandler = (data) => {
      if (data.chat_id === activeChat.id) {
        const normalized = normalizeMessage(data);
        setMessages((prev) => [...prev, normalized]);
      }
    };
    chatSocket.on("message", messageHandler);

    // Load messages when active chat changes (API call)
    (async () => {
      try {
        const res = await chatAPI.getRoomMessages(activeChat.id);
        const messagesData = (res.data.results || res.data).map(normalizeMessage);
        setMessages(messagesData);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    })();

    return () => {
      chatSocket.off("message", messageHandler).disconnect();
    };
  }, [activeChat, isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChats();
    }
  }, [isAuthenticated]);

  const value = {
    rooms,
    activeChat,
    messages,
    loading,
    unreadCounts,
    fetchChats,
    selectChat,
    sendMessage,
    setActiveChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;