export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  settings: Record<string, any>;
  metadata: {
    version: number;
    lastModified: Date;
    modifiedBy?: string;
    changeHistory: ChangeRecord[];
  };
  environmentConfig: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Record<string, any>;
  profileData: Record<string, any>;
  settings: Record<string, any>;
  lastAccessed?: Date;
  joinedAt: Date;
  user: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    globalRole: string;
  };
}

export interface ProjectMembership {
  id: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  projectDescription?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Record<string, any>;
  profileData: Record<string, any>;
  settings: Record<string, any>;
  lastAccessed?: Date;
  joinedAt: Date;
}

export interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  modifiedBy: string;
  reason?: string;
}

export interface ProjectData {
  id: string;
  projectId: string;
  dataType: string;
  data: any;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCreateRequest {
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
  environmentConfig?: Record<string, any>;
}

export interface ProjectUpdateRequest {
  name?: string;
  slug?: string;
  description?: string;
  settings?: Record<string, any>;
  environmentConfig?: Record<string, any>;
  isActive?: boolean;
}

export interface ProjectMemberRequest {
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface ProjectSwitchResponse {
  project: Project;
  membership: ProjectMembership;
}

