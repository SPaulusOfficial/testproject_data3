import { Permission } from '../types/User';

export interface PermissionCheck {
  resource: string;
  action: string;
  scope?: 'all' | 'own' | 'none';
  userId?: string;
  resourceId?: string;
}

export class PermissionService {
  /**
   * Check if a user has permission for a specific action on a resource
   */
  static hasPermission(
    userPermissions: Permission[],
    check: PermissionCheck
  ): boolean {
    const permission = userPermissions.find(p => p.resource === check.resource);
    
    if (!permission) return false;
    
    // Check if action is allowed
    if (!permission.actions.includes(check.action)) return false;
    
    // Check scope
    if (check.scope && permission.scope !== check.scope) {
      if (check.scope === 'own' && permission.scope === 'all') {
        // 'all' scope includes 'own' scope
        return true;
      }
      return false;
    }
    
    return true;
  }

  /**
   * Get all permissions for a specific resource
   */
  static getResourcePermissions(
    userPermissions: Permission[],
    resource: string
  ): Permission | null {
    return userPermissions.find(p => p.resource === resource) || null;
  }

  /**
   * Get all actions a user can perform on a resource
   */
  static getResourceActions(
    userPermissions: Permission[],
    resource: string
  ): string[] {
    const permission = this.getResourcePermissions(userPermissions, resource);
    return permission?.actions || [];
  }

  /**
   * Check if user can read a resource
   */
  static canRead(
    userPermissions: Permission[],
    resource: string,
    scope?: 'all' | 'own' | 'none'
  ): boolean {
    return this.hasPermission(userPermissions, {
      resource,
      action: 'read',
      scope
    });
  }

  /**
   * Check if user can write to a resource
   */
  static canWrite(
    userPermissions: Permission[],
    resource: string,
    scope?: 'all' | 'own' | 'none'
  ): boolean {
    return this.hasPermission(userPermissions, {
      resource,
      action: 'write',
      scope
    });
  }

  /**
   * Check if user can delete a resource
   */
  static canDelete(
    userPermissions: Permission[],
    resource: string,
    scope?: 'all' | 'own' | 'none'
  ): boolean {
    return this.hasPermission(userPermissions, {
      resource,
      action: 'delete',
      scope
    });
  }

  /**
   * Check if user can execute a resource
   */
  static canExecute(
    userPermissions: Permission[],
    resource: string,
    scope?: 'all' | 'own' | 'none'
  ): boolean {
    return this.hasPermission(userPermissions, {
      resource,
      action: 'execute',
      scope
    });
  }

  /**
   * Get default permissions for a role
   */
  static getDefaultPermissionsForRole(role: string): Permission[] {
    switch (role) {
      case 'owner':
        return [
          { resource: 'projects', actions: ['read', 'write', 'delete'], scope: 'all' },
          { resource: 'agents', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
          { resource: 'workflows', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
          { resource: 'data', actions: ['read', 'write', 'delete'], scope: 'all' },
          { resource: 'users', actions: ['read', 'write'], scope: 'all' },
          { resource: 'reports', actions: ['read', 'write', 'delete', 'export'], scope: 'all' },
          { resource: 'settings', actions: ['read', 'write'], scope: 'all' },
          { resource: 'files', actions: ['read', 'write', 'delete'], scope: 'all' }
        ];
      case 'admin':
        return [
          { resource: 'projects', actions: ['read', 'write'], scope: 'all' },
          { resource: 'agents', actions: ['read', 'write', 'execute'], scope: 'all' },
          { resource: 'workflows', actions: ['read', 'write', 'execute'], scope: 'all' },
          { resource: 'data', actions: ['read', 'write'], scope: 'all' },
          { resource: 'users', actions: ['read'], scope: 'all' },
          { resource: 'reports', actions: ['read', 'write', 'export'], scope: 'all' },
          { resource: 'settings', actions: ['read'], scope: 'all' },
          { resource: 'files', actions: ['read', 'write'], scope: 'all' }
        ];
      case 'member':
        return [
          { resource: 'projects', actions: ['read'], scope: 'all' },
          { resource: 'agents', actions: ['read', 'execute'], scope: 'all' },
          { resource: 'workflows', actions: ['read', 'execute'], scope: 'all' },
          { resource: 'data', actions: ['read', 'write'], scope: 'own' },
          { resource: 'reports', actions: ['read', 'export'], scope: 'all' },
          { resource: 'files', actions: ['read', 'write'], scope: 'own' }
        ];
      case 'viewer':
        return [
          { resource: 'projects', actions: ['read'], scope: 'all' },
          { resource: 'agents', actions: ['read'], scope: 'all' },
          { resource: 'workflows', actions: ['read'], scope: 'all' },
          { resource: 'data', actions: ['read'], scope: 'all' },
          { resource: 'reports', actions: ['read'], scope: 'all' },
          { resource: 'files', actions: ['read'], scope: 'all' }
        ];
      default:
        return [];
    }
  }

  /**
   * Merge permissions from multiple sources (global + project-specific)
   */
  static mergePermissions(
    globalPermissions: Permission[],
    projectPermissions: Permission[]
  ): Permission[] {
    const merged = new Map<string, Permission>();

    // Add global permissions
    globalPermissions.forEach(permission => {
      merged.set(permission.resource, { ...permission });
    });

    // Override with project-specific permissions
    projectPermissions.forEach(permission => {
      const existing = merged.get(permission.resource);
      if (existing) {
        // Merge actions
        const allActions = [...new Set([...existing.actions, ...permission.actions])];
        merged.set(permission.resource, {
          ...permission,
          actions: allActions
        });
      } else {
        merged.set(permission.resource, { ...permission });
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Validate permissions for a user
   */
  static validatePermissions(permissions: Permission[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    permissions.forEach(permission => {
      // Check for valid resource
      const validResources = ['projects', 'agents', 'workflows', 'data', 'users', 'reports', 'settings', 'files'];
      if (!validResources.includes(permission.resource)) {
        errors.push(`Invalid resource: ${permission.resource}`);
      }

      // Check for valid actions
      const validActions = ['read', 'write', 'delete', 'execute', 'approve', 'export'];
      permission.actions.forEach(action => {
        if (!validActions.includes(action)) {
          errors.push(`Invalid action: ${action} for resource ${permission.resource}`);
        }
      });

      // Check for valid scope
      const validScopes = ['all', 'own', 'none'];
      if (!validScopes.includes(permission.scope)) {
        errors.push(`Invalid scope: ${permission.scope} for resource ${permission.resource}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get permission summary for display
   */
  static getPermissionSummary(permissions: Permission[]): {
    totalResources: number;
    totalActions: number;
    resourcesWithAccess: string[];
    mostPermissiveResource: string;
  } {
    const totalResources = permissions.length;
    const totalActions = permissions.reduce((sum, p) => sum + p.actions.length, 0);
    const resourcesWithAccess = permissions.map(p => p.resource);
    
    const mostPermissiveResource = permissions.reduce((most, current) => {
      if (current.actions.length > most.actions.length) return current;
      return most;
    }, permissions[0] || { resource: 'none', actions: [], scope: 'none' });

    return {
      totalResources,
      totalActions,
      resourcesWithAccess,
      mostPermissiveResource: mostPermissiveResource.resource
    };
  }
}
