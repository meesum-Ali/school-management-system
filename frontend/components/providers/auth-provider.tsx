'use client'

// components/providers/auth-provider.tsx
// AuthContext for Next.js - handles authentication state and token management

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'
import { usePathname } from 'next/navigation'
import api from '@/lib/api'
import { UserRole } from '@/types/user'
import { jwtDecode } from 'jwt-decode'

interface DecodedJwtPayload {
  sub: string // User ID
  email?: string
  preferred_username?: string
  username?: string
  name?: string
  roles?: UserRole[]
  'urn:zitadel:iam:org:project:roles'?: Record<string, any> // Zitadel roles
  'urn:zitadel:iam:org:id'?: string // Zitadel organization ID
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
  loadUserFromToken: (token: string) => void
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: true,
  loadUserFromToken: () => {},
})

export { AuthContext }

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname() // Track route changes
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadUserFromToken = useCallback((token: string) => {
    try {
      const decoded = jwtDecode<DecodedJwtPayload>(token)
      // Check token expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        setIsAuthenticated(false)
        setUser(null)
        api.defaults.headers.Authorization = ''
        return
      }

      // Handle both local JWT and Zitadel JWT formats
      const username =
        decoded.username ||
        decoded.preferred_username ||
        decoded.email ||
        'Unknown'
      const roles =
        decoded.roles ||
        (decoded['urn:zitadel:iam:org:project:roles']
          ? (Object.keys(decoded['urn:zitadel:iam:org:project:roles']).filter(
              (role) =>
                ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'].includes(
                  role,
                ),
            ) as UserRole[])
          : [])
      const schoolId =
        decoded.schoolId || decoded['urn:zitadel:iam:org:id'] || null

      setUser({
        id: decoded.sub,
        username,
        roles,
        schoolId,
      })
      setIsAuthenticated(true)
      api.defaults.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.error('Failed to decode token or token expired:', error)
      setIsAuthenticated(false)
      setUser(null)
      api.defaults.headers.Authorization = ''
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { 
          cache: 'no-store',
          credentials: 'include' // Include cookies in the request
        })
        if (res.ok) {
          const data = await res.json()
          if (isMounted && data?.authenticated && data?.user) {
            setUser({
              id: data.user.id,
              username: data.user.username,
              roles: data.user.roles as UserRole[],
              schoolId: data.user.schoolId || null,
            })
            setIsAuthenticated(true)
            setIsLoading(false)
            return
          }
        }
      } catch (err) {
        console.error('Failed to fetch auth from /api/auth/me:', err)
      }
      // No localStorage fallback - Zitadel-only auth via cookies
      setIsAuthenticated(false)
      setUser(null)
      if (isMounted) setIsLoading(false)
    }

    fetchAuth()

    return () => {
      isMounted = false
    }
  }, [loadUserFromToken, pathname]) // Re-run when pathname changes (route navigation)

  const login = async (
    username: string,
    password: string,
    schoolIdentifier?: string,
  ) => {
    // Redirect to Zitadel OIDC flow instead of local login
    const redirectPath = typeof window !== 'undefined' ? window.location.pathname : '/admin/dashboard';
    window.location.href = `/auth/login?redirect=${encodeURIComponent(redirectPath)}`;
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    api.defaults.headers.Authorization = ''
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
        loadUserFromToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
