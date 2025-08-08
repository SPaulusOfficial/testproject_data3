import { User, UserCreateRequest, UserUpdateRequest, CustomDataUpdateRequest, UserListResponse } from '../types/User';

class UserService {
  private baseUrl = '/api/users';

  // Get all users with pagination
  async getUsers(page: number = 1, limit: number = 20, search?: string): Promise<UserListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });

    const response = await fetch(`${this.baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    return response.json();
  }

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  }

  // Create new user
  async createUser(userData: UserCreateRequest): Promise<User> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    return response.json();
  }

  // Update user
  async updateUser(id: string, userData: UserUpdateRequest): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return response.json();
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  }

  // Toggle user active status
  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    return this.updateUser(id, { isActive });
  }

  // Custom Data Management
  async getCustomData(userId: string, key?: string): Promise<any> {
    const url = key 
      ? `${this.baseUrl}/${userId}/custom-data/${key}`
      : `${this.baseUrl}/${userId}/custom-data`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch custom data');
    }
    return response.json();
  }

  async setCustomData(userId: string, key: string, value: any, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${userId}/custom-data/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value, reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to set custom data');
    }
  }

  async updateCustomData(userId: string, customData: Record<string, any>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${userId}/custom-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customData),
    });

    if (!response.ok) {
      throw new Error('Failed to update custom data');
    }
  }

  async deleteCustomData(userId: string, key: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${userId}/custom-data/${key}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete custom data');
    }
  }

  // Metadata Management
  async getMetadata(userId: string): Promise<User['metadata']> {
    const response = await fetch(`${this.baseUrl}/${userId}/metadata`);
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    return response.json();
  }

  async updateMetadata(userId: string, metadata: Partial<User['metadata']>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${userId}/metadata`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to update metadata');
    }
  }

  // Project Membership Management
  async getProjectMemberships(userId: string): Promise<User['projectMemberships']> {
    const response = await fetch(`${this.baseUrl}/${userId}/project-memberships`);
    if (!response.ok) {
      throw new Error('Failed to fetch project memberships');
    }
    return response.json();
  }

  // Mock data for development
  getMockUsers(): User[] {
    return [
      {
        id: '1',
        email: 'stefan.paulus@salesfive.com',
        username: 'stefan.paulus',
        profile: {
          firstName: 'Stefan',
          lastName: 'Paulus',
          avatar: '/avatar.png',
          phone: '+49 123 456789'
        },
        globalRole: 'admin',
        projectMemberships: [
          {
            projectId: 'project-1',
            role: 'owner',
            permissions: [
              {
                resource: 'projects',
                actions: ['read', 'write', 'delete'],
                scope: 'all'
              }
            ],
            joinedAt: new Date('2024-01-01')
          }
        ],
        security: {
          passwordHash: 'hashed_password',
          twoFactorEnabled: true,
          twoFactorSecret: 'secret123',
          lastLogin: new Date(),
          failedLoginAttempts: 0
        },
        settings: {
          language: 'de',
          timezone: 'Europe/Berlin',
          notifications: {
            email: true,
            push: false,
            frequency: 'immediate',
            types: {
              security: true,
              projectUpdates: true,
              systemAlerts: true
            }
          }
        },
        customData: {
          salesforce_org_id: '00D123456789',
          preferred_language: 'de',
          department: 'Engineering',
          skills: ['React', 'TypeScript', 'Node.js']
        },
        metadata: {
          version: 1,
          lastModified: new Date(),
          modifiedBy: 'system',
          changeHistory: []
        },
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        email: 'john.doe@example.com',
        username: 'john.doe',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          avatar: undefined,
          phone: '+1 555 123456'
        },
        globalRole: 'user',
        projectMemberships: [
          {
            projectId: 'project-1',
            role: 'member',
            permissions: [
              {
                resource: 'projects',
                actions: ['read', 'write'],
                scope: 'own'
              }
            ],
            joinedAt: new Date('2024-01-15')
          }
        ],
        security: {
          passwordHash: 'hashed_password',
          twoFactorEnabled: false,
          twoFactorSecret: undefined,
          lastLogin: new Date('2024-01-14'),
          failedLoginAttempts: 0
        },
        settings: {
          language: 'en',
          timezone: 'America/New_York',
          notifications: {
            email: true,
            push: true,
            frequency: 'daily',
            types: {
              security: true,
              projectUpdates: false,
              systemAlerts: false
            }
          }
        },
        customData: {
          salesforce_org_id: '00D987654321',
          preferred_language: 'en',
          department: 'Sales',
          experience_level: 'senior'
        },
        metadata: {
          version: 1,
          lastModified: new Date('2024-01-15'),
          modifiedBy: 'admin',
          changeHistory: []
        },
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];
  }
}

export const userService = new UserService();
