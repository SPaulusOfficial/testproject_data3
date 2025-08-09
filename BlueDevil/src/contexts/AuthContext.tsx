import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import authService from '../services/AuthService'
import { Permission } from '../types/User'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'agent'
  permissions?: Permission[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const token = authService.getAuthToken();
        if (token) {
          // Validate token with backend and get current user
          const response = await fetch('http://localhost:3002/api/debug/token', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const userData = data.user;
            
            // Create user object from token data
            const user: User = {
              id: userData.userId || userData.id,
              name: userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
              email: userData.email,
              role: (userData.globalRole || userData.role) as 'admin' | 'user' | 'agent',
              permissions: userData.permissions || []
            }
            
            console.log('🔍 Token validation successful, user:', user);
            
            setUser(user);
          } else {
            // Token is invalid, clear it
            authService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        authService.logout()
        setUser(null);
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await authService.login(email, password);
      
      // Create user object from login result
      const user: User = {
        id: result.user.id,
        name: result.user.username || `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim(),
        email: result.user.email,
        role: result.user.globalRole || result.user.role,
        permissions: result.user.permissions || []
      }
      
      setUser(user)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 