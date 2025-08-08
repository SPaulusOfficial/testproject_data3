import { useContext, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/User';
import { PermissionService } from '../services/PermissionService';

export interface PermissionCheck {
  resource: string;
  action: string;
  scope?: 'all' | 'own' | 'none';
  projectId?: string;
}

export const usePermissions = () => {
  const { user } = useAuth();

  const userPermissions = useMemo(() => {
    if (!user) return [];
    
    // Combine global permissions with project-specific permissions
    const globalPermissions = user.permissions || [];
    const projectPermissions = user.projectMemberships?.flatMap(membership => 
      membership.permissions.map(permission => ({
        ...permission,
        projectId: membership.projectId
      }))
    ) || [];
    
    return [...globalPermissions, ...projectPermissions];
  }, [user]);

  const checkPermission = (check: PermissionCheck): boolean => {
    if (!user) return false;
    
    // Check if user is admin (bypass all permission checks)
    if (user.globalRole === 'admin') return true;
    
    return PermissionService.hasPermission(userPermissions, check);
  };

  const checkProjectPermission = (projectId: string, check: Omit<PermissionCheck, 'projectId'>): boolean => {
    return checkPermission({
      ...check,
      projectId
    });
  };

  const canRead = (resource: string, projectId?: string): boolean => {
    return checkPermission({ resource, action: 'read', projectId });
  };

  const canWrite = (resource: string, projectId?: string): boolean => {
    return checkPermission({ resource, action: 'write', projectId });
  };

  const canDelete = (resource: string, projectId?: string): boolean => {
    return checkPermission({ resource, action: 'delete', projectId });
  };

  const canExecute = (resource: string, projectId?: string): boolean => {
    return checkPermission({ resource, action: 'execute', projectId });
  };

  const canApprove = (resource: string, projectId?: string): boolean => {
    return checkPermission({ resource, action: 'approve', projectId });
  };

  const canExport = (resource: string, projectId?: string): boolean => {
    return checkPermission({ resource, action: 'export', projectId });
  };

  const getResourcePermissions = (resource: string, projectId?: string): Permission[] => {
    return PermissionService.getResourcePermissions(userPermissions, resource, projectId);
  };

  const hasAnyPermission = (resource: string, projectId?: string): boolean => {
    const permissions = getResourcePermissions(resource, projectId);
    return permissions.some(p => p.actions.length > 0);
  };

  const getProjectRole = (projectId: string): string | null => {
    if (!user?.projectMemberships) return null;
    
    const membership = user.projectMemberships.find(m => m.projectId === projectId);
    return membership?.role || null;
  };

  const isProjectOwner = (projectId: string): boolean => {
    return getProjectRole(projectId) === 'owner';
  };

  const isProjectAdmin = (projectId: string): boolean => {
    const role = getProjectRole(projectId);
    return role === 'owner' || role === 'admin';
  };

  const isProjectMember = (projectId: string): boolean => {
    const role = getProjectRole(projectId);
    return role === 'owner' || role === 'admin' || role === 'member';
  };

  return {
    // Permission checking
    checkPermission,
    checkProjectPermission,
    canRead,
    canWrite,
    canDelete,
    canExecute,
    canApprove,
    canExport,
    
    // Permission data
    getResourcePermissions,
    hasAnyPermission,
    userPermissions,
    
    // Project roles
    getProjectRole,
    isProjectOwner,
    isProjectAdmin,
    isProjectMember,
    
    // User info
    user,
    isAdmin: user?.globalRole === 'admin'
  };
};
