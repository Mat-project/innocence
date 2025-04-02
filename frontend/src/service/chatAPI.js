import api from './axios';

export const chatAPI = {
  getRooms: () => api.get('/api/chat/rooms/'),
  // When creating a new room, a POST will now be allowed:
  createRoom: (data) => api.post('/api/chat/rooms/', data),
  getRoom: (roomId) => api.get(`/api/chat/rooms/${roomId}/`),
  getRoomMessages: (roomId) =>
    api.get('/api/chat/messages/', { params: { room: roomId } }),
  sendMessage: (data) => api.post('/api/chat/messages/', data),
  markMessagesRead: (roomId, messageIds) =>
    api.post(`/api/chat/rooms/${roomId}/mark_read/`, { message_ids: messageIds }),
  uploadFile: (formData) =>
    api.post('/api/chat/messages/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Search users by username:
  searchUsers: (query) =>
    api.get('/api/chat/users/search/', { params: { query } }),
};

export default chatAPI;