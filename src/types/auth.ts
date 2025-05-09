// Define user type to replace 'any'
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  institution_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}
