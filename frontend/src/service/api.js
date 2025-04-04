import api from './axios';

export const authAPI = {
  login: (data) => {
    console.log("Calling: /api/auth/login/");
    return api.post('/api/auth/login/', data);
  },
  register: (data) => {
    console.log("Calling: /api/auth/register/");
    return api.post('/api/auth/register/', data);
  },
  checkUsername: (username) => {
    console.log(`Checking username availability: ${username}`);
    return api.get(`/api/auth/check-username/?username=${encodeURIComponent(username)}`);
  },
  logout: () => {
    console.log("Calling: /api/auth/logout/");
    return api.post('/api/auth/logout/');
  },
  getProfile: () => {
    console.log("Calling: /api/auth/profile/");
    return api.get('/api/auth/profile/');
  },
  updateProfile: (data) => {
    console.log("Updating profile with data:", data);
    
    // Check if we're dealing with FormData (for images)
    const isFormData = data instanceof FormData;
    
    if (isFormData) {
      // For FormData (file uploads), don't transform anything
      console.log("Sending FormData directly");
      return api.patch('/api/auth/profile/', data, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
    }
    
    // Handle regular JSON data
    // Check if there are image fields that need special handling
    const hasImageFields = data.profile_image || data.cover_image || 
      (data.profile_image_preview || data.cover_image_preview);
    
    if (hasImageFields) {
      // Convert to FormData for mixed content (JSON + files)
      const formData = new FormData();
      
      // Add all non-preview fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        // Skip preview fields and null/undefined values
        if (!key.endsWith('_preview') && value !== null && value !== undefined) {
          // If it's a File object, add it directly
          if (value instanceof File) {
            formData.append(key, value);
          } 
          // For JSON data that needs to be inside FormData
          else if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          }
          // For primitive values
          else {
            formData.append(key, value);
          }
        }
      });
      
      console.log("Sending mixed FormData");
      return api.patch('/api/auth/profile/', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
    }
    
    // For plain JSON with no files, proceed normally
    console.log("Sending plain JSON data");
    return api.patch('/api/auth/profile/', data);
  },
  forgotPassword: (data) => {
    console.log("Calling: /api/auth/forgot-password/");
    return api.post('/api/auth/forgot-password/', data);
  },
  resetPassword: (data) => {
    console.log("Calling: /api/auth/reset-password/");
    return api.post('/api/auth/reset-password/', data);
  },
};

export const taskAPI = {
  getTasks: () => {
    console.log("Calling: /api/tasks/");
    return api.get('/api/tasks/');
  },
  createTask: (data) => api.post('/api/tasks/', data),
  updateTask: (id, data) => api.patch(`/api/tasks/${id}/`, data),
  deleteTask: (id) => api.delete(`/api/tasks/${id}/`),
};

export const notificationAPI = {
  getNotifications: async () => {
    console.log("Fetching notifications");
    return await api.get('/api/notifications/');
  },
  markAsRead: async (id) => {
    console.log(`Marking notification ${id} as read`);
    return await api.patch(`/api/notifications/${id}/read/`);
  }
};

export const fileConverterAPI = {
  convertFile: (formData) => {
    console.log("Calling: /api/convert/");
    return api.post('/api/convert/', formData, { 
      headers: { 'Content-Type': 'multipart/form-data' }, 
      responseType: 'blob' 
    });
  },
};

export const profileAPI = {
  // For sections, endpoints are registered at the root level (e.g. /api/skills/)
  getSkills: () => {
    // Prevent caching with random query param
    const cacheBuster = Date.now();
    console.log("Calling: /api/skills/");
    return api.get(`/api/skills/?_=${cacheBuster}`);
  },
  addSkill: (data) => {
    console.log("Calling: /api/skills/ POST with data:", data);
    
    // Ensure required fields are present with correct format
    const skillData = {
      name: data.name?.trim() || '',
      category: data.category || 'technical',
      level: data.level || 'Beginner'
    };
    
    // Validate required fields
    if (!skillData.name) {
      console.error("Validation error: Skill name is required");
      return Promise.reject(new Error('Skill name is required'));
    }
    
    // Check if category is valid
    if (!['technical', 'soft'].includes(skillData.category)) {
      console.error("Validation error: Invalid category");
      return Promise.reject(new Error('Category must be "technical" or "soft"'));
    }
    
    // Check if level is valid
    if (!['Beginner', 'Intermediate', 'Expert'].includes(skillData.level)) {
      console.error("Validation error: Invalid level");
      return Promise.reject(new Error('Level must be "Beginner", "Intermediate", or "Expert"'));
    }
    
    return api.post('/api/skills/', skillData);
  },
  updateSkill: (id, data) => {
    console.log(`Calling: /api/skills/${id}/ PUT`, data);
    
    if (!id) {
      console.error("Validation error: Skill ID is required for updates");
      return Promise.reject(new Error('Skill ID is required for updates'));
    }
    
    // Ensure required fields are present with correct format
    const skillData = {
      name: data.name?.trim() || '',
      category: data.category || 'technical',
      level: data.level || 'Beginner'
    };
    
    // Validate required fields
    if (!skillData.name) {
      console.error("Validation error: Skill name is required");
      return Promise.reject(new Error('Skill name is required'));
    }
    
    // Check if category is valid
    if (!['technical', 'soft'].includes(skillData.category)) {
      console.error("Validation error: Invalid category");
      return Promise.reject(new Error('Category must be "technical" or "soft"'));
    }
    
    // Check if level is valid
    if (!['Beginner', 'Intermediate', 'Expert'].includes(skillData.level)) {
      console.error("Validation error: Invalid level");
      return Promise.reject(new Error('Level must be "Beginner", "Intermediate", or "Expert"'));
    }
    
    return api.put(`/api/skills/${id}/`, skillData);
  },
  deleteSkill: (id) => {
    console.log(`Calling: /api/skills/${id}/ DELETE`);
    if (!id) {
      return Promise.reject(new Error('Skill ID is required for deletion'));
    }
    return api.delete(`/api/skills/${id}/`);
  },
  
  getExperience: () => {
    const cacheBuster = new Date().getTime();
    console.log("Calling: /api/experience/");
    return api.get(`/api/experience/?_=${cacheBuster}`);
  },
  addExperience: (data) => {
    console.log("Calling: /api/experience/ POST", data);
    return api.post('/api/experience/', data);
  },
  updateExperience: (id, data) => {
    console.log(`Calling: /api/experience/${id}/ PUT with data:`, data);
    
    // Make sure ID is valid
    if (!id) {
      console.error("Missing ID for experience update");
      return Promise.reject(new Error("Missing ID for experience update"));
    }
    
    // Clone the data to avoid modifying the original
    const sanitizedData = { ...data };
    
    // Format dates properly
    if (sanitizedData.start_date) {
      try {
        const date = new Date(sanitizedData.start_date);
        if (!isNaN(date.getTime())) {
          sanitizedData.start_date = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Invalid start_date:", e);
      }
    }
    
    if (sanitizedData.end_date && !sanitizedData.current) {
      try {
        const date = new Date(sanitizedData.end_date);
        if (!isNaN(date.getTime())) {
          sanitizedData.end_date = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Invalid end_date:", e);
      }
    }
    
    // Handle current job flag
    if (sanitizedData.current) {
      sanitizedData.end_date = null;
    }
    
    return api.put(`/api/experience/${id}/`, sanitizedData);
  },
  deleteExperience: (id) => {
    console.log(`Calling: /api/experience/${id}/ DELETE`);
    return api.delete(`/api/experience/${id}/`);
  },
  
  getEducation: () => {
    const cacheBuster = new Date().getTime();
    console.log("Calling: /api/education/");
    return api.get(`/api/education/?_=${cacheBuster}`);
  },
  addEducation: (data) => {
    console.log("Calling: /api/education/ POST", data);
    return api.post('/api/education/', data);
  },
  updateEducation: (id, data) => {
    console.log(`Calling: /api/education/${id}/ PUT with data:`, data);
    
    // Make sure ID is valid
    if (!id) {
      console.error("Missing ID for education update");
      return Promise.reject(new Error("Missing ID for education update"));
    }
    
    // Clone the data to avoid modifying the original
    const sanitizedData = { ...data };
    
    // Format dates properly
    if (sanitizedData.start_date) {
      try {
        const date = new Date(sanitizedData.start_date);
        if (!isNaN(date.getTime())) {
          sanitizedData.start_date = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Invalid start_date:", e);
      }
    }
    
    if (sanitizedData.end_date) {
      try {
        const date = new Date(sanitizedData.end_date);
        if (!isNaN(date.getTime())) {
          sanitizedData.end_date = date.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error("Invalid end_date:", e);
      }
    }
    
    return api.put(`/api/education/${id}/`, sanitizedData);
  },
  deleteEducation: (id) => {
    console.log(`Calling: /api/education/${id}/ DELETE`);
    return api.delete(`/api/education/${id}/`);
  },
  
  getPortfolio: () => {
    const cacheBuster = new Date().getTime();
    console.log("Calling: /api/portfolio/");
    return api.get(`/api/portfolio/?_=${cacheBuster}`);
  },
  addPortfolio: (data) => {
    console.log("Calling: /api/portfolio/ POST", data);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'technologies' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return api.post('/api/portfolio/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updatePortfolio: (id, data) => {
    console.log(`Calling: /api/portfolio/${id}/ PUT`, data);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'technologies' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'imageFile' && value instanceof File) {
        formData.append('image', value);
      } else if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    return api.put(`/api/portfolio/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deletePortfolio: (id) => {
    console.log(`Calling: /api/portfolio/${id}/ DELETE`);
    return api.delete(`/api/portfolio/${id}/`);
  },
};