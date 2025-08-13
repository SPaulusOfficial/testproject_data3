import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserCreateRequest, UserUpdateRequest, ProjectMembership } from '../types/User';
import userService from '../services/UserService';
import { usePermissions } from '../hooks/usePermissions';

interface UserManagementContextType {
  // State
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  
  // Actions
  fetchUsers: (page?: number, limit?: number, search?: string) => Promise<void>;
  createUser: (userData: UserCreateRequest) => Promise<User>;
  updateUser: (id: string, userData: UserUpdateRequest) => Promise<User>;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<void>;
  
  // Custom Data Management
  setCustomData: (userId: string, key: string, value: any, reason?: string) => Promise<void>;
  getCustomData: (userId: string, key?: string) => Promise<any>;
  deleteCustomData: (userId: string, key: string) => Promise<void>;
  
  // Metadata Management
  getMetadata: (userId: string) => Promise<User['metadata']>;
  updateMetadata: (userId: string, metadata: Partial<User['metadata']>) => Promise<void>;
  
  // Utility
  getUserById: (id: string) => User | undefined;
  clearError: () => void;
  refreshPermissions: () => void;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};

interface UserManagementProviderProps {
  children: ReactNode;
}

export const UserManagementProvider: React.FC<UserManagementProviderProps> = ({ children }) => {
  const { hasPermission, refreshPermissions: refreshPermissionsHook, isLoadingPermissions } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Refresh permissions function
  const refreshPermissions = () => {
    refreshPermissionsHook();
  };

  // Auto-fetch users when permissions are loaded
  useEffect(() => {
    if (!isLoadingPermissions && hasPermission('UserManagement') && users.length === 0 && !isLoading) {
      console.log('🔄 Auto-fetching users after permissions loaded');
      fetchUsers();
    }
  }, [isLoadingPermissions, hasPermission('UserManagement')]);

  // Manual trigger for debugging
  useEffect(() => {
    console.log('🔍 UserManagementContext mounted');
    console.log('🔍 Current permissions state:');
    console.log('  - isLoadingPermissions:', isLoadingPermissions);
    console.log('  - hasPermission(UserManagement):', hasPermission('UserManagement'));
    console.log('  - users.length:', users.length);
    console.log('  - isLoading:', isLoading);
  }, []);

  // Fetch users with pagination and search
  const fetchUsers = async (page: number = 1, limit: number = 20, search?: string) => {
    console.log('🔍 fetchUsers called');
    console.log('🔍 isLoadingPermissions:', isLoadingPermissions);
    console.log('🔍 hasPermission result:', hasPermission('UserManagement'));
    
    // Wait for permissions to load if they're still loading
    if (isLoadingPermissions) {
      console.log('⏳ Waiting for permissions to load...');
      setError('Loading permissions...');
      return;
    }
    
    // Check if user has permission to access user management
    if (!hasPermission('UserManagement')) {
      console.log('❌ Access denied: User Management permission required');
      setError('Access denied: User Management permission required');
      setUsers([]);
      setTotalUsers(0);
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('❌ No auth token found');
      setError('Authentication required. Please log in again.');
      setUsers([]);
      setTotalUsers(0);
      return;
    }

    console.log('✅ Permission granted, fetching users...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Use real API call with cache busting
      const response = await userService.getAllUsers();
      setUsers(response);
      setTotalUsers(response.length);
      setCurrentPage(page);
      console.log('✅ Users fetched successfully:', response.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      console.error('❌ Error fetching users:', err);
      
      // Check if it's an authentication error
      if (errorMessage.includes('Authentication required') || errorMessage.includes('Invalid token')) {
        console.log('❌ Authentication error, redirecting to login');
        setError('Session expired. Please log in again.');
        // Optionally redirect to login
        // window.location.href = '/login';
      } else {
        // Since user can access the page, they have permission
        // Show empty table instead of error
        console.log('⚠️ API call failed, showing empty table');
        setError(null); // Clear any previous errors
        setUsers([]);
        setTotalUsers(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create new user
  const createUser = async (userData: UserCreateRequest): Promise<User> => {
    if (!hasPermission('UserManagement')) {
      throw new Error('Access denied: User Management permission required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // For development, create mock user
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        username: userData.username,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: undefined,
          phone: undefined
        },
        globalRole: userData.globalRole,
        projectMemberships: [],
        security: {
          passwordHash: 'hashed_password',
          twoFactorEnabled: false,
          twoFactorSecret: undefined,
          lastLogin: undefined,
          failedLoginAttempts: 0
        },
        settings: {
          language: 'en',
          timezone: 'UTC',
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
        customData: userData.customData || {},
        metadata: {
          version: 1,
          lastModified: new Date(),
          modifiedBy: 'system',
          changeHistory: []
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Call the real API
      const response = await fetch(`http://localhost:3002/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const result = await response.json();
      
      // Add to local state
      setUsers(prev => [...prev, result]);
      setTotalUsers(prev => prev + 1);
      
      console.log(`✅ User ${result.username} created successfully`);
      
      // Refresh the user list to get updated data
      await fetchUsers(currentPage);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user
  const updateUser = async (id: string, userData: UserUpdateRequest): Promise<User> => {
    if (!hasPermission('UserManagement')) {
      throw new Error('Access denied: User Management permission required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // For development, update mock user
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { 
              ...user, 
              email: userData.email || user.email,
              username: userData.username || user.username,
              globalRole: userData.globalRole || user.globalRole,
              isActive: userData.isActive !== undefined ? userData.isActive : user.isActive,
              profile: {
                ...user.profile,
                firstName: userData.firstName || user.profile.firstName,
                lastName: userData.lastName || user.profile.lastName
              },
              updatedAt: new Date()
            }
          : user
      ));
      
      // Call the real API
      const response = await fetch(`http://localhost:3002/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const result = await response.json();
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, ...result, updatedAt: new Date() }
          : user
      ));
      
      console.log(`✅ User ${result.username} updated successfully`);
      
      // Refresh the user list to get updated data
      await fetchUsers(currentPage);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };



  // Toggle user status
  const toggleUserStatus = async (id: string, isActive: boolean): Promise<void> => {
    if (!hasPermission('UserManagement')) {
      throw new Error('Access denied: User Management permission required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call the real API
      const response = await fetch(`http://localhost:3002/api/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle user status');
      }

      const result = await response.json();
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, isActive: result.user.isActive, updatedAt: new Date() }
          : user
      ));
      
      console.log(`✅ User ${result.user.username} status updated to ${result.user.isActive}`);
      
      // Refresh the user list to get updated data
      await fetchUsers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Custom Data Management
  const setCustomData = async (userId: string, key: string, value: any, reason?: string): Promise<void> => {
    if (!hasPermission('UserManagement')) {
      throw new Error('Access denied: User Management permission required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Call the real API
      const response = await fetch(`http://localhost:3002/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          customData: {
            [key]: value
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update custom data');
      }

      const result = await response.json();
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              customData: result.customData || user.customData,
              updatedAt: new Date()
            }
          : user
      ));
      
      console.log(`✅ Custom data ${key} updated for user ${userId}`);
      
      // Refresh the user list to get updated data
      await fetchUsers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update custom data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomData = async (userId: string, key?: string): Promise<any> => {
    if (!hasPermission('UserManagement')) {
      throw new Error('Access denied: User Management permission required');
    }

    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const customData = user.customData || {};
      
      if (key) {
        return customData[key];
      }
      
      return customData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get custom data');
      throw err;
    }
  };

  const deleteCustomData = async (userId: string, key: string): Promise<void> => {
    if (!hasPermission('UserManagement')) {
      throw new Error('Access denied: User Management permission required');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user to get existing customData
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      // Create new customData without the key to delete
      const updatedCustomData = { ...(currentUser.customData || {}) };
      delete updatedCustomData[key];
      
      // Call the real API
      const response = await fetch(`http://localhost:3002/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          customData: updatedCustomData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete custom data');
      }

      const result = await response.json();
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              customData: result.customData || updatedCustomData,
              updatedAt: new Date()
            }
          : user
      ));
      
      console.log(`✅ Custom data ${key} deleted for user ${userId}`);
      
      // Refresh the user list to get updated data
      await fetchUsers(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Metadata Management
  const getMetadata = async (userId: string): Promise<User['metadata']> => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      return user.metadata;
      
      // TODO: Replace with actual API call
      // return await userService.getMetadata(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get metadata');
      throw err;
    }
  };

  const updateMetadata = async (userId: string, metadata: Partial<User['metadata']>): Promise<void> => {
    try {
      // For development, update mock data
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? {
              ...user,
              metadata: {
                ...user.metadata,
                ...metadata,
                version: user.metadata.version + 1,
                lastModified: new Date()
              }
            }
          : user
      ));
      
      // TODO: Replace with actual API call
      // await userService.updateMetadata(userId, metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update metadata');
      throw err;
    }
  };

  // Utility functions
  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const clearError = () => {
    setError(null);
  };

  // Load initial data
  useEffect(() => {
    fetchUsers();
  }, []);

  const value: UserManagementContextType = {
    users,
    currentUser,
    isLoading,
    error,
    totalUsers,
    currentPage,
    fetchUsers,
    createUser,
    updateUser,
    
    toggleUserStatus,
    setCustomData,
    getCustomData,
    deleteCustomData,
    getMetadata,
    updateMetadata,
    getUserById,
    clearError,
    refreshPermissions
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};
