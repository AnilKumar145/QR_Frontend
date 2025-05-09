import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../api';
import { User } from '../types/auth';
import { AuthContext } from './AuthContextDefinition';

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        
        if (storedToken) {
          setToken(storedToken);
          // Set auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token with backend
          const response = await api.get('/auth/me');
          
          if (response.status === 200) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token invalid, remove it
            localStorage.removeItem('authToken');
            setToken(null);
            delete api.defaults.headers.common['Authorization'];
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear any invalid tokens
        localStorage.removeItem('authToken');
        setToken(null);
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Use FormData as the backend expects form data, not JSON
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      // Make direct request to ensure correct format
      const response = await axios.post(
        'https://qr-backend-1-pq5i.onrender.com/api/v1/admin/login',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      if (response.data && response.data.access_token) {
        // Store the token
        const token = response.data.access_token;
        localStorage.setItem('authToken', token);
        setToken(token);
        setIsAuthenticated(true);
        
        // Create a user object that matches the User interface
        setUser({
          id: response.data.user_id?.toString() || '1', // Use user_id from response if available
          email: username, // Using username as email since that's what we have
          name: username, // Optional: set name to username
          role: 'admin', // Set role to admin
        });
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return true;
      } else {
        setError('Invalid response from server');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error
          setError(error.response.data?.detail || 'Login failed. Please check your credentials.');
        } else if (error.request) {
          // No response received
          setError('No response from server. Please check your connection.');
        } else {
          // Request setup error
          setError(`Error: ${error.message}`);
        }
      } else {
        // Non-axios error
        setError('An unexpected error occurred');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem('authToken');
    setToken(null);
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      token,
      login, 
      logout, 
      loading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Re-export the AuthContext for convenience
export { AuthContext };
