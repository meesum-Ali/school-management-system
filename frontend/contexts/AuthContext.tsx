'use client'

'use client'

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '../utils/api';
import { User, UserRole } from '../types/user'; // Use the global User type
import { jwtDecode } from 'jwt-decode'; // Corrected import

interface DecodedJwtPayload {
  sub: string; // User ID
  username: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}

// Define what AuthContext will hold - user can be a simplified version or full User
// For now, let's use a simplified version derived from JWT for the context's user state.
interface AuthUser {
  id: string;
  username: string;
  roles: UserRole[];
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // To handle initial auth check
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
});

export { AuthContext };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

  const loadUserFromToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<DecodedJwtPayload>(token);
      // Check token expiration (optional, jwtDecode doesn't validate, api interceptor might catch it on next call)
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        api.defaults.headers.Authorization = ''; // Clear auth header
        return;
      }
      setUser({ id: decoded.sub, username: decoded.username, roles: decoded.roles });
      setIsAuthenticated(true);
      api.defaults.headers.Authorization = `Bearer ${token}`; // Set auth header for future requests
    } catch (error) {
      console.error("Failed to decode token or token expired:", error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      api.defaults.headers.Authorization = '';
    }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserFromToken(token);
    }
    // else {
    //   // No token, attempt to fetch /auth/me might be an option if using HttpOnly cookies + CSRF
    //   // For localStorage tokens, if no token, not authenticated.
    // }
    setIsLoading(false); // Done loading initial auth state
  }, [loadUserFromToken]);

  const login = async (username: string, password: string) => {
    // setIsLoading(true); // Optional: set loading true during login process
    try {
      const response = await api.post<{ access_token: string }>('/auth/login', { username, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      loadUserFromToken(access_token);
      // setIsLoading(false);
    } catch (error) {
      // setIsLoading(false);
      console.error("Login failed:", error);
      throw error; // Re-throw to allow login page to handle it
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    api.defaults.headers.Authorization = ''; // Clear auth header
    // Optionally, redirect to login page or home
    // window.location.href = '/login'; // Or use Next.js router if available here
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
