import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api';
import { AuthContextType, User } from '../types/auth';

// Create the context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  logout: () => {},
  loading: false,
  error: null
});

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Set auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token with backend
          const response = await api.get('/auth/me');
          
          if (response.status === 200) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            // Token invalid, remove it
            localStorage.removeItem('authToken');
            delete api.defaults.headers.common['Authorization'];
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear any invalid tokens
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data && response.data.access_token) {
        // Save token
        localStorage.setItem('authToken', response.data.access_token);
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
        
        // Get user info
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
        setIsAuthenticated(true);
        
        return true;
      } else {
        setError('Login failed. Please check your credentials.');
        return false;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token
    localStorage.removeItem('authToken');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
