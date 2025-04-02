import axios from "axios";

const API_BASE = "http://localhost:8000/api/chat";

// Fetch chat rooms
export const fetchRooms = async () => {
  try {
    const response = await axios.get(`${API_BASE}/rooms/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rooms", error);
    return [];
  }
};

// Fetch messages for a given room
export const fetchMessages = async (roomId) => {
  try {
    const response = await axios.get(`${API_BASE}/${roomId}/messages/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching messages", error);
    return [];
  }
};

// Send a new message
export const sendMessage = async (roomId, message, user) => {
  try {
    const response = await axios.post(`${API_BASE}/${roomId}/messages/`, { message, user });
    return response.data;
  } catch (error) {
    console.error("Error sending message", error);
    return null;
  }
};