import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

interface PermissionGuardProps {
  permission: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Convenience components for specific permissions
export const UserManagementGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = <div className="p-4 text-gray-500">Access denied: User Management permission required</div> 
}) => (
  <PermissionGuard permission="UserManagement" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ProjectManagementGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = <div className="p-4 text-gray-500">Access denied: Project Management permission required</div> 
}) => (
  <PermissionGuard permission="ProjectManagement" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const SystemSettingsGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = <div className="p-4 text-gray-500">Access denied: System Settings permission required</div> 
}) => (
  <PermissionGuard permission="SystemSettings" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const AdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = <div className="p-4 text-gray-500">Access denied: Admin privileges required</div> 
}) => {
  const { isAdmin } = usePermissions();
  
  if (!isAdmin) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export const SystemAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = <div className="p-4 text-gray-500">Access denied: System Admin privileges required</div> 
}) => {
  const { user } = useAuth();
  
  if (user?.role !== 'system_admin') {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

export const ProjectAdminGuard: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = <div className="p-4 text-gray-500">Access denied: Project Admin privileges required</div> 
}) => {
  const { user } = useAuth();
  
  if (user?.role !== 'project_admin') {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
