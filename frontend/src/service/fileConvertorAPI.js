import axios from 'axios';

const FLASK_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: FLASK_BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const fileConvertorAPI = {
  // Now point to new /api/convert endpoint
  convertFile: (formData, onUploadProgress) => {
    return api.post('/api/convert', formData, { 
      onUploadProgress,
      responseType: 'json' // Ensure we're expecting JSON
    });
  },
};

export default fileConvertorAPI;