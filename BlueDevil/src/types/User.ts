export interface User {
  id: string;
  email: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };
  globalRole: 'admin' | 'user' | 'guest';
  projectMemberships: ProjectMembership[];
  security: {
    passwordHash: string;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    lastLogin?: Date;
    failedLoginAttempts: number;
  };
  settings: {
    language: string;
    timezone: string;
    notifications: NotificationSettings;
  };

  // Versionierte Metadaten für Tracking von Änderungen
  metadata: {
    version: number;
    lastModified: Date;
    modifiedBy?: string;
    changeHistory: ChangeRecord[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMembership {
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Permission[];
  joinedAt: Date;
}

export interface Permission {
  resource: string; // 'projects', 'agents', 'workflows', 'admin', 'user_management', etc.
  actions: string[]; // ['read', 'write', 'delete', 'execute', 'admin']
  scope: 'all' | 'own' | 'none';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean; // System roles cannot be deleted
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  category: 'admin' | 'user' | 'project' | 'system';
}

// Predefined permission templates
export const PERMISSION_TEMPLATES: PermissionTemplate[] = [
  {
    id: 'admin_full',
    name: 'Full Administrator',
    description: 'Complete system access including user management, project management, and system settings',
    category: 'admin',
    permissions: [
      { resource: 'admin', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
      { resource: 'user_management', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
      { resource: 'project_management', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
      { resource: 'system_settings', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
      { resource: 'audit_logs', actions: ['read', 'write', 'delete'], scope: 'all' }
    ]
  },
  {
    id: 'user_management_admin',
    name: 'User Management Administrator',
    description: 'Can manage users but not system settings',
    category: 'admin',
    permissions: [
      { resource: 'user_management', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
      { resource: 'project_management', actions: ['read', 'write'], scope: 'all' },
      { resource: 'audit_logs', actions: ['read'], scope: 'all' }
    ]
  },
  {
    id: 'project_admin',
    name: 'Project Administrator',
    description: 'Can manage projects and their members',
    category: 'project',
    permissions: [
      { resource: 'project_management', actions: ['read', 'write', 'delete'], scope: 'all' },
      { resource: 'project_members', actions: ['read', 'write', 'delete'], scope: 'all' },
      { resource: 'project_data', actions: ['read', 'write'], scope: 'all' }
    ]
  },
  {
    id: 'project_member',
    name: 'Project Member',
    description: 'Standard project access',
    category: 'project',
    permissions: [
      { resource: 'project_data', actions: ['read', 'write'], scope: 'own' },
      { resource: 'project_members', actions: ['read'], scope: 'all' }
    ]
  },
  {
    id: 'project_viewer',
    name: 'Project Viewer',
    description: 'Read-only access to projects',
    category: 'project',
    permissions: [
      { resource: 'project_data', actions: ['read'], scope: 'all' },
      { resource: 'project_members', actions: ['read'], scope: 'all' }
    ]
  }
];

export interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  modifiedBy: string;
  reason?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  types: {
    security: boolean;
    projectUpdates: boolean;
    systemAlerts: boolean;
  };
}

// Utility types for API responses
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserCreateRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  globalRole: 'admin' | 'user' | 'guest';
  password: string;
  customData?: Record<string, any>;
}

export interface UserUpdateRequest {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  globalRole?: 'admin' | 'user' | 'guest';
  isActive?: boolean;
  customData?: Record<string, any>;
  settings?: Partial<User['settings']>;
}

export interface CustomDataUpdateRequest {
  key: string;
  value: any;
  reason?: string;
}
