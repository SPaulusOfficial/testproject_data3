import { usePermissions } from '../hooks/usePermissions';

// Simple permission check function
export const hasPermission = (permission: string): boolean => {
  // This will be used in components where usePermissions hook is available
  // For standalone functions, use checkPermission instead
  return false; // Default fallback
};

// Permission check for components
export const usePermissionCheck = () => {
  const { hasPermission: hookHasPermission } = usePermissions();
  
  return {
    hasPermission: hookHasPermission,
    // Convenience functions for common permissions
    canManageUsers: () => hookHasPermission('UserManagement'),
    canManageProjects: () => hookHasPermission('ProjectManagement'),
    canAccessSystemSettings: () => hookHasPermission('SystemSettings'),
    canAccessNotifications: () => hookHasPermission('Notifications'),
    canAccessAuditLogs: () => hookHasPermission('AuditLogs'),
    canAccessKnowledgeBase: () => hookHasPermission('KnowledgeBase'),
    canAccessWorkshopManagement: () => hookHasPermission('WorkshopManagement'),
    // Admin check
    isAdmin: () => hookHasPermission('admin') || hookHasPermission('FullAdministrator'),
  };
};

// Permission check for non-component contexts
export const checkPermission = (permission: string): boolean => {
  // This can be used in utility functions, event handlers, etc.
  // It will check localStorage or other available sources
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  
  // For now, return false as fallback
  // In a real implementation, you might decode the token and check permissions
  return false;
};

// Permission-based conditional rendering
export const withPermission = (permission: string, component: React.ReactNode, fallback?: React.ReactNode) => {
  const { hasPermission } = usePermissions();
  
  if (hasPermission(permission)) {
    return <>{component}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
};

// Permission-based button wrapper
export const PermissionButton: React.FC<{
  permission: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  fallback?: React.ReactNode;
}> = ({ permission, onClick, children, className, disabled, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return (
    <button 
      onClick={onClick} 
      className={className} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Permission-based link wrapper
export const PermissionLink: React.FC<{
  permission: string;
  to: string;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}> = ({ permission, to, children, className, fallback }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
};

// Permission-based section wrapper
export const PermissionSection: React.FC<{
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}> = ({ permission, children, fallback, className }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission)) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }
  
  return <div className={className}>{children}</div>;
};
