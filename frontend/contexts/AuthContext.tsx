'use client'

import React, { createContext, useState, useEffect, ReactNode } from 'react'
import api from '../utils/api'

interface User {
  id: number
  username: string
  email: string
  role: string
}

interface AuthContextProps {
  isAuthenticated: boolean
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
})

export { AuthContext }

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Optionally validate token with backend
      setIsAuthenticated(true)
      // Fetch user details
      api
        .get('/auth/me')
        .then((response) => {
          setUser(response.data)
        })
        .catch(() => {
          setIsAuthenticated(false)
          setUser(null)
        })
    }
  }, [])

  const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', response.data.token)
    setIsAuthenticated(true)
    setUser(response.data.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
