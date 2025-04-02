import axios from './axios';

export const fetchNotes = async () => {
  const response = await axios.get('/api/notes/notes/');
  return response.data;
};

export const createNote = async (noteData) => {
  const response = await axios.post('/api/notes/notes/', noteData);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await axios.put(`/api/notes/notes/${id}/`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  await axios.delete(`/api/notes/notes/${id}/`);
  return id;
};

export const togglePinNote = async (id, isPinned) => {
  const response = await axios.patch(`/api/notes/notes/${id}/`, { is_pinned: isPinned });
  return response.data;
};