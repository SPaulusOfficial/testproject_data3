import { User, ProjectMembership } from '../types/User';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class UserService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    console.log('🔍 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token');
    
    if (!token) {
      console.warn('⚠️ No auth token found in localStorage');
    }
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // =====================================================
  // AUTHENTICATION METHODS
  // =====================================================

  async login(emailOrUsername: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token
      localStorage.setItem('authToken', data.token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentProject');
  }

  // =====================================================
  // USER MANAGEMENT METHODS
  // =====================================================

  async getAllUsers(): Promise<User[]> {
    try {
      const url = `${API_BASE_URL}/users`;
      const headers = this.getAuthHeaders();
      
      console.log('🔍 ===== USER API REQUEST =====');
      console.log('🔍 URL:', url);
      console.log('🔍 Method: GET');
      console.log('🔍 Headers:', headers);
      console.log('🔍 Token:', (headers as any).Authorization ? (headers as any).Authorization.substring(0, 50) + '...' : 'No token');
      
      const response = await fetch(url, {
        headers: headers,
        cache: 'no-cache', // Prevent caching
      });

      console.log('🔍 ===== USER API RESPONSE =====');
      console.log('🔍 Status:', response.status);
      console.log('🔍 Status Text:', response.statusText);
      console.log('🔍 OK:', response.ok);
      console.log('🔍 Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Backend error:', errorData);
        
        // Try to get response text for debugging
        const responseText = await response.text().catch(() => 'Could not read response');
        console.error('❌ Response text:', responseText);
        
        // Check if 2FA is required
        if (response.status === 403 && errorData.requires2FA === true) {
          // Dispatch a custom event to notify the app that 2FA is required
          window.dispatchEvent(new CustomEvent('2fa-required'));
          throw new Error('Two-factor authentication required');
        } else if (response.status === 403) {
          throw new Error(`Access denied: User Management permission required. Backend says: ${errorData.message || errorData.error}`);
        } else if (response.status === 401) {
          throw new Error('Authentication required');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found');
        } else if (response.status === 500) {
          throw new Error('Backend server error');
        } else {
          throw new Error(errorData.error || `Failed to fetch users (${response.status})`);
        }
      }

      const backendUsers = await response.json();
      console.log('✅ Backend users received:', backendUsers.length);
      console.log('✅ Backend users data:', backendUsers);
      console.log('🔍 ===== END USER API =====');
      
      // Transform backend user format to frontend format
      return backendUsers.map((backendUser: any) => this.transformBackendUser(backendUser));
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  private transformBackendUser(backendUser: any): User {
    return {
      id: backendUser.id,
      email: backendUser.email,
      username: backendUser.username,
      profile: {
        firstName: backendUser.firstName || backendUser.first_name || '',
        lastName: backendUser.lastName || backendUser.last_name || '',
        avatar: backendUser.avatar,
        phone: backendUser.phone
      },
      globalRole: backendUser.globalRole || backendUser.global_role,
      projectMemberships: backendUser.project_memberships || [],
      security: {
        passwordHash: backendUser.password_hash || '',
        twoFactorEnabled: backendUser.two_factor_enabled || false,
        twoFactorSecret: backendUser.two_factor_secret,
        lastLogin: backendUser.last_login ? new Date(backendUser.last_login) : undefined,
        failedLoginAttempts: backendUser.failed_login_attempts || 0
      },
      settings: {
        language: backendUser.settings?.language || 'en',
        timezone: backendUser.settings?.timezone || 'UTC',
        notifications: backendUser.settings?.notifications || {
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
      customData: backendUser.customData || backendUser.custom_data || {},
      metadata: {
        version: backendUser.metadata?.version || 1,
        lastModified: backendUser.updatedAt ? new Date(backendUser.updatedAt) : backendUser.updated_at ? new Date(backendUser.updated_at) : new Date(),
        modifiedBy: backendUser.metadata?.modified_by,
        changeHistory: backendUser.metadata?.change_history || []
      },
      isActive: backendUser.isActive !== undefined ? backendUser.isActive : backendUser.is_active,
      createdAt: backendUser.createdAt ? new Date(backendUser.createdAt) : backendUser.created_at ? new Date(backendUser.created_at) : new Date(),
      updatedAt: backendUser.updatedAt ? new Date(backendUser.updatedAt) : backendUser.updated_at ? new Date(backendUser.updated_at) : new Date()
    };
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const backendUser = await response.json();
      return this.transformBackendUser(backendUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      // Transform frontend data to backend format
      const backendData: any = {};
      
      if (updateData.email !== undefined) backendData.email = updateData.email;
      if (updateData.username !== undefined) backendData.username = updateData.username;
      if (updateData.globalRole !== undefined) backendData.globalRole = updateData.globalRole;
      if (updateData.customData !== undefined) backendData.customData = updateData.customData;
      if (updateData.metadata !== undefined) backendData.metadata = updateData.metadata;
      
      // Handle profile data
      if (updateData.profile) {
        if (updateData.profile.firstName !== undefined) backendData.firstName = updateData.profile.firstName;
        if (updateData.profile.lastName !== undefined) backendData.lastName = updateData.profile.lastName;
        if (updateData.profile.phone !== undefined) backendData.phone = updateData.profile.phone;
      }
      
      // Handle direct firstName/lastName fields (for backward compatibility)
      if (updateData.firstName !== undefined) backendData.firstName = updateData.firstName;
      if (updateData.lastName !== undefined) backendData.lastName = updateData.lastName;
      if (updateData.phone !== undefined) backendData.phone = updateData.phone;

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      const backendUser = await response.json();
      return this.transformBackendUser(backendUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateUserCustomData(userId: string, customData: Record<string, any>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/custom-data`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(customData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user custom data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user custom data:', error);
      throw error;
    }
  }

  // =====================================================
  // PROJECT MEMBERSHIP METHODS
  // =====================================================

  async getUserProjectMemberships(userId: string): Promise<ProjectMembership[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/project-memberships`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project memberships');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project memberships:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export default new UserService();
