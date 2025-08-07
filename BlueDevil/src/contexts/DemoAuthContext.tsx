import React, { createContext, useContext, useState, useEffect } from 'react'

interface DemoAuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined)

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext)
  if (!context) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider')
  }
  return context
}

interface DemoAuthProviderProps {
  children: React.ReactNode
}

export const DemoAuthProvider: React.FC<DemoAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Prüfe beim Laden, ob bereits authentifiziert
    const authStatus = localStorage.getItem('demoAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const login = () => {
    setIsAuthenticated(true)
    localStorage.setItem('demoAuthenticated', 'true')
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('demoAuthenticated')
  }

  return (
    <DemoAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </DemoAuthContext.Provider>
  )
} 