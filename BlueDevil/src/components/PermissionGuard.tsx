import React from 'react';
import { usePermissions, PermissionCheck } from '../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: PermissionCheck;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback = null,
  showFallback = false
}) => {
  const { checkPermission } = usePermissions();
  const hasPermission = checkPermission(permission);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (showFallback) {
    return <>{fallback}</>;
  }

  return null;
};

// Specialized permission guards for common use cases
export const ReadPermissionGuard: React.FC<{
  children: React.ReactNode;
  resource: string;
  projectId?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}> = ({ children, resource, projectId, fallback, showFallback }) => (
  <PermissionGuard
    permission={{ resource, action: 'read', projectId }}
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGuard>
);

export const WritePermissionGuard: React.FC<{
  children: React.ReactNode;
  resource: string;
  projectId?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}> = ({ children, resource, projectId, fallback, showFallback }) => (
  <PermissionGuard
    permission={{ resource, action: 'write', projectId }}
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGuard>
);

export const DeletePermissionGuard: React.FC<{
  children: React.ReactNode;
  resource: string;
  projectId?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}> = ({ children, resource, projectId, fallback, showFallback }) => (
  <PermissionGuard
    permission={{ resource, action: 'delete', projectId }}
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGuard>
);

export const ExecutePermissionGuard: React.FC<{
  children: React.ReactNode;
  resource: string;
  projectId?: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}> = ({ children, resource, projectId, fallback, showFallback }) => (
  <PermissionGuard
    permission={{ resource, action: 'execute', projectId }}
    fallback={fallback}
    showFallback={showFallback}
  >
    {children}
  </PermissionGuard>
);

export const AdminGuard: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}> = ({ children, fallback, showFallback }) => {
  const { isAdmin } = usePermissions();
  
  if (isAdmin) {
    return <>{children}</>;
  }

  if (showFallback) {
    return <>{fallback}</>;
  }

  return null;
};

export const ProjectAdminGuard: React.FC<{
  children: React.ReactNode;
  projectId: string;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}> = ({ children, projectId, fallback, showFallback }) => {
  const { isProjectAdmin } = usePermissions();
  
  if (isProjectAdmin(projectId)) {
    return <>{children}</>;
  }

  if (showFallback) {
    return <>{fallback}</>;
  }

  return null;
};
