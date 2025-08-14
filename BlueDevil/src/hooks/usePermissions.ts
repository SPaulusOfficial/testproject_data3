import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

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
  const [dynamicPermissions, setDynamicPermissions] = useState<string[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // Fetch dynamic permissions from backend
  const fetchUserPermissions = async () => {
    if (!user?.id) return;

    try {
      setIsLoadingPermissions(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:3002/api/users/${user.id}/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userPermissions = await response.json();
        // Extract permission strings from the backend response
        const permissionStrings: string[] = [];
        
        // Add individual permissions
        if (userPermissions.permissions && Array.isArray(userPermissions.permissions)) {
          userPermissions.permissions.forEach((perm: any) => {
            if (typeof perm === 'string') {
              permissionStrings.push(perm);
            } else if (perm && typeof perm === 'object' && perm.name) {
              permissionStrings.push(perm.name);
            }
          });
        }
        
        // Add effective permissions
        if (userPermissions.effectivePermissions && Array.isArray(userPermissions.effectivePermissions)) {
          userPermissions.effectivePermissions.forEach((perm: any) => {
            if (typeof perm === 'string') {
              permissionStrings.push(perm);
            } else if (perm && typeof perm === 'object' && perm.name) {
              permissionStrings.push(perm.name);
            }
          });
        }
        
        // Combine static permissions from user object with dynamic permissions from backend
        const staticPerms = (user.permissions || []).map((p: any) => typeof p === 'string' ? p : p.name);
        const allPermissions = [
          ...staticPerms,
          ...permissionStrings
        ];
        setDynamicPermissions(allPermissions);
      }
    } catch (error) {
      console.error('Failed to fetch dynamic permissions:', error);
      // Fallback to static permissions
      const staticPerms = (user.permissions || []).map((p: any) => typeof p === 'string' ? p : p.name);
      setDynamicPermissions(staticPerms);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  // Fetch permissions when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserPermissions();
    }
  }, [user?.id]);

  // Listen for permission updates
  useEffect(() => {
    const handlePermissionUpdate = () => {
      console.log('Permission update detected, refreshing permissions...');
      fetchUserPermissions();
    };

    window.addEventListener('permissionsUpdated', handlePermissionUpdate);
    
    return () => {
      window.removeEventListener('permissionsUpdated', handlePermissionUpdate);
    };
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    console.log('🔍 Checking permission:', permission, 'for user:', user);
    console.log('🔍 User role:', user.role);
    console.log('🔍 Static permissions:', user.permissions);
    console.log('🔍 Dynamic permissions:', dynamicPermissions);
    
    // System Admin and Project Admin have all permissions
    if (user.role === 'system_admin' || user.role === 'project_admin') {
      console.log('✅ Admin user - access granted');
      return true;
    }
    
    // Check static permissions from user object
    const staticPermissions = (user.permissions || []).map((p: any) => typeof p === 'string' ? p : p.name);
    console.log('🔍 Static permissions (processed):', staticPermissions);
    
    if (staticPermissions.includes(permission)) {
      console.log('✅ Permission granted via static permissions');
      return true;
    }
    
    // Check dynamic permissions from backend
    if (dynamicPermissions.includes(permission)) {
      console.log('✅ Permission granted via dynamic permissions');
      return true;
    }
    
    console.log('❌ Permission denied:', permission);
    return false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const getUserPermissions = (): string[] => {
    if (!user) return [];
    const staticPerms = (user.permissions || []).map((p: any) => typeof p === 'string' ? p : p.name);
    return [...staticPerms, ...dynamicPermissions];
  };

  const canAccessUserManagement = (): boolean => {
    const result = hasPermission('UserManagement');
    console.log('🔍 canAccessUserManagement result:', result);
    return result;
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

  // Function to refresh permissions (can be called after permission changes)
  const refreshPermissions = () => {
    fetchUserPermissions();
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
    isAdmin: user?.role === 'system_admin' || user?.role === 'project_admin',
    isLoadingPermissions,
    refreshPermissions
  };
};
