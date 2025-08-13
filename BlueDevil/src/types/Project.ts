export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  ownerName?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  environmentConfig?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Record<string, any>;
  profileData?: Record<string, any>;
  settings?: Record<string, any>;
  lastAccessed?: Date;
  joinedAt: Date;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    globalRole: string;
    isActive: boolean;
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
}

export interface ProjectUpdateRequest {
  name?: string;
  slug?: string;
  description?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
}

export interface ProjectMemberRequest {
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  permissions?: Record<string, any>;
}

export interface ProjectSwitchResponse {
  project: Project;
  membership: ProjectMembership;
}

export interface ProjectWithMembers extends Project {
  memberCount: number;
  members?: ProjectMember[];
}

