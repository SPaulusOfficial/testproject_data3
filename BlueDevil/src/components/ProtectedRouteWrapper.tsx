import React from 'react';
import { useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
}

export const ProtectedRouteWrapper: React.FC<ProtectedRouteWrapperProps> = ({ children }) => {
  const location = useLocation();
  
  // Don't protect the login route
  if (location.pathname === '/login') {
    return <>{children}</>;
  }
  
  // Protect all other routes
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

