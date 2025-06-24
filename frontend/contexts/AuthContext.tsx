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
  schoolId?: string | null; // Added schoolId
  iat?: number;
  exp?: number;
}

// Define what AuthContext will hold
interface AuthUser {
  id: string;
  username: string;
  roles: UserRole[];
  schoolId?: string | null; // Added schoolId
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password: string, schoolIdentifier?: string) => Promise<void>; // Added schoolIdentifier
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  login: async () => {}, // Default empty function
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
        setUser({
          id: decoded.sub,
          username: decoded.username,
          roles: decoded.roles,
          schoolId: decoded.schoolId
        });
      setIsAuthenticated(true);
      api.defaults.headers.Authorization = `Bearer ${token}`;
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

  const login = async (username: string, password: string, schoolIdentifier?: string) => {
    try {
      const loginPayload: any = { username, password };
      if (schoolIdentifier) {
        loginPayload.schoolIdentifier = schoolIdentifier;
      }
      const response = await api.post<{ access_token: string }>('/auth/login', loginPayload);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      loadUserFromToken(access_token);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
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
