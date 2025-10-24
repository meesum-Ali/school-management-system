'use client';

// frontend/contexts/AuthContext.tsx
// AuthContext for Next.js - handles authentication state and token management

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import api from '../utils/api'
import { UserRole } from '../types/user'
import { jwtDecode } from 'jwt-decode'

interface DecodedJwtPayload {
  sub: string // User ID
  username: string
  roles: UserRole[]
  schoolId?: string | null
  iat?: number
  exp?: number
}

// Define what AuthContext will hold
interface AuthUser {
  id: string
  username: string
  roles: UserRole[]
  schoolId?: string | null
}

interface AuthContextProps {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (
    username: string,
    password: string,
    schoolIdentifier?: string,
  ) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
})

export { AuthContext }

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadUserFromToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<DecodedJwtPayload>(token)
      // Check token expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
        setIsAuthenticated(false)
        setUser(null)
        api.defaults.headers.Authorization = ''
        return
      }
      setUser({
        id: decoded.sub,
        username: decoded.username,
        roles: decoded.roles,
        schoolId: decoded.schoolId,
      })
      setIsAuthenticated(true)
      api.defaults.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.error('Failed to decode token or token expired:', error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
      setIsAuthenticated(false)
      setUser(null)
      api.defaults.headers.Authorization = ''
    }
  }, [])

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        loadUserFromToken(token)
      }
    }
    setIsLoading(false)
  }, [loadUserFromToken])

  const login = async (
    username: string,
    password: string,
    schoolIdentifier?: string,
  ) => {
    try {
      interface LoginPayload {
        username: string
        password: string
        schoolIdentifier?: string
      }
      const loginPayload: LoginPayload = { username, password }
      if (schoolIdentifier) {
        loginPayload.schoolIdentifier = schoolIdentifier
      }
      const response = await api.post<{ access_token: string }>(
        '/auth/login',
        loginPayload,
      )
      const { access_token } = response.data
      
      // Store in both localStorage and cookie for SSR compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access_token)
        // Set cookie with 7-day expiration
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + 7)
        document.cookie = `token=${access_token}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Strict`
      }
      
      loadUserFromToken(access_token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
    setIsAuthenticated(false)
    setUser(null)
    api.defaults.headers.Authorization = ''
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
