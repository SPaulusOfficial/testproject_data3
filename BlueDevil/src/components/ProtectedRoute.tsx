import React, { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import LoginForm from './LoginForm'
import { TwoFactorAuth } from './Auth/TwoFactorAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, requires2FA, check2FAStatus, complete2FA } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      check2FAStatus();
    }
  }, [isAuthenticated, check2FAStatus]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If 2FA is required, show 2FA component
  if (requires2FA) {
    return (
      <TwoFactorAuth
        onVerificationSuccess={complete2FA}
        onCancel={() => {
          // Handle cancel - logout and redirect to login
          console.log('2FA cancelled - logging out');
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }}
      />
    );
  }

  return <>{children}</>
} 