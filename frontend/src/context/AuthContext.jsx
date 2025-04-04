import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../service/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await authAPI.getProfile();
        if (response.data && response.data.id) {
          localStorage.setItem('userId', response.data.id);
        }
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setUser(userData);
      setIsAuthenticated(true);
      if (response.data.user && response.data.user.id) {
        localStorage.setItem('userId', response.data.user.id);
      }
      
      // Don't navigate here - let the component handle navigation
      return { success: true };
      
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
      
      // Return error information instead of redirecting
      if (error.message === 'Network Error') {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check if the server is running.'
        };
      }
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { tokens, user: newUser } = response.data;
      
      localStorage.setItem('accessToken', tokens.access);
      localStorage.setItem('refreshToken', tokens.refresh);
      setUser(newUser);
      setIsAuthenticated(true);
      if (response.data.user && response.data.user.id) {
        localStorage.setItem('userId', response.data.user.id);
      }
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      setIsAuthenticated(false);
      if (error.message === 'Network Error') {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check if the server is running.'
        };
      }
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserData: checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
