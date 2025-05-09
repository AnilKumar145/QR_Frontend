import React, { useState, useEffect } from 'react';
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data && response.data.access_token) {
        // Save token
        const newToken = response.data.access_token;
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        
        // Set auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        
        // Get user info
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
        setIsAuthenticated(true);
        
        return true;
      } else {
        setError('Login failed. Please check your credentials.');
        return false;
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      // Type guard to safely access properties
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err.response as { data?: { detail?: string } } | undefined;
        setError(errorResponse?.data?.detail || 'Login failed. Please try again.');
      } else {
        setError('Login failed. Please try again.');
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
