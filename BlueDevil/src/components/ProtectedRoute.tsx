import React from 'react'
import { useDemoAuth } from '@/contexts/DemoAuthContext'
import { DemoLogin } from './DemoLogin'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, login } = useDemoAuth()

  if (!isAuthenticated) {
    return <DemoLogin onLogin={login} />
  }

  return <>{children}</>
} 