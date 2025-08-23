import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import authService from '../services/AuthService'
import { Permission } from '../types/User'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'system_admin' | 'project_admin' | 'user' | 'agent'
  permissions?: Permission[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  requires2FA: boolean
  check2FAStatus: () => Promise<void>
  complete2FA: () => void
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
  const [requires2FA, setRequires2FA] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
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
              role: (userData.globalRole || userData.role) as 'system_admin' | 'project_admin' | 'user' | 'agent',
              permissions: userData.permissions || []
            }
            
            console.log('🔍 Token validation successful, user:', user);
            
            setUser(user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken');
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
      
      // Check if 2FA is required
      await check2FAStatus();
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
    setRequires2FA(false)
  }

  const check2FAStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('http://localhost:3002/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequires2FA(data.requiresVerification);
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const complete2FA = () => {
    setRequires2FA(false);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    requires2FA,
    check2FAStatus,
    complete2FA
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 