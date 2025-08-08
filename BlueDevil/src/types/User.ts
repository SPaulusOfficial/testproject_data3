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
  // Flexible Sub-Data Map für zukünftige Erweiterungen
  customData: {
    [key: string]: any; // Dynamische Daten für verschiedene Module/Features
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
  resource: string; // 'projects', 'agents', 'workflows', etc.
  actions: string[]; // ['read', 'write', 'delete', 'execute']
  scope: 'all' | 'own' | 'none';
}

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
