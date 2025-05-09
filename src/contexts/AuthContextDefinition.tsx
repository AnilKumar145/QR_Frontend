import { createContext } from 'react';
import { AuthContextType } from '../types/auth';

// Create the context and export it
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false, // Remove parameter names to avoid unused variable warnings
  logout: () => {},
  loading: false,
  error: null
});



