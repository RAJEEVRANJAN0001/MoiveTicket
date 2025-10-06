import { create } from 'zustand';
import apiService from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('auth-token'),
  isAuthenticated: !!localStorage.getItem('auth-token'),
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await apiService.login(credentials);
      
      // Handle both real API and mock data responses
      const token = response.data.access || response.data.token;
      const user = response.data.user;
      
      if (!token || !user) {
        throw new Error('Invalid response format');
      }
      
      localStorage.setItem('auth-token', token);
      localStorage.setItem('user-data', JSON.stringify(user));
      
      set({
        user,
        token: token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Set the token for future API calls
      apiService.setAuthToken(token);
      
      return { success: true, data: response.data };
    } catch (error) {
      set({ isLoading: false });
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.non_field_errors?.[0] || 
               error.response?.data?.detail || 
               error.message ||
               'Login failed. Please check your credentials.' 
      };
    }
  },

  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await apiService.signup(userData);
      
      // Handle both real API and mock data responses
      const token = response.data.access || response.data.token;
      const user = response.data.user;
      
      if (token && user) {
        // Auto-login after successful signup (for mock data)
        localStorage.setItem('auth-token', token);
        localStorage.setItem('user-data', JSON.stringify(user));
        
        set({
          user,
          token: token,
          isAuthenticated: true,
          isLoading: false,
        });
        
        apiService.setAuthToken(token);
      } else {
        set({ isLoading: false });
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      set({ isLoading: false });
      console.error('Signup error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data || error.message || 'Signup failed. Please try again.' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    apiService.removeAuthToken();
  },

  initializeAuth: () => {
    const token = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user-data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({
          user,
          token,
          isAuthenticated: true,
        });
        apiService.setAuthToken(token);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-data');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      }
    }
  },
}));

export default useAuthStore;