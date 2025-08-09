import { useAuth } from '../contexts/AuthContext';

export interface Permission {
  name: string;
  description?: string;
}

export interface PermissionSet {
  name: string;
  permissions: string[];
  description?: string;
}

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check user's permissions
    const userPermissions = user.permissions || [];
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const getUserPermissions = (): string[] => {
    if (!user) return [];
    return user.permissions || [];
  };

  const canAccessUserManagement = (): boolean => {
    return hasPermission('UserManagement');
  };

  const canAccessProjectManagement = (): boolean => {
    return hasPermission('ProjectManagement');
  };

  const canAccessSystemSettings = (): boolean => {
    return hasPermission('SystemSettings');
  };

  const canAccessNotifications = (): boolean => {
    return hasPermission('Notifications');
  };

  const canAccessAuditLogs = (): boolean => {
    return hasPermission('AuditLogs');
  };

  const canAccessKnowledgeBase = (): boolean => {
    return hasPermission('KnowledgeBase');
  };

  const canAccessWorkshopManagement = (): boolean => {
    return hasPermission('WorkshopManagement');
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    canAccessUserManagement,
    canAccessProjectManagement,
    canAccessSystemSettings,
    canAccessNotifications,
    canAccessAuditLogs,
    canAccessKnowledgeBase,
    canAccessWorkshopManagement,
    userPermissions: getUserPermissions(),
    isAdmin: user?.role === 'admin'
  };
};
