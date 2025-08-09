import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserCreateRequest, UserUpdateRequest, UserListResponse } from '../types/User';
import userService from '../services/UserService';

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
  deleteUser: (id: string) => Promise<void>;
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
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};

interface UserManagementProviderProps {
  children: ReactNode;
}

export const UserManagementProvider: React.FC<UserManagementProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch users with pagination and search
  const fetchUsers = async (page: number = 1, limit: number = 20, search?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use real API call
      const response = await userService.getAllUsers();
      setUsers(response);
      setTotalUsers(response.length);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new user
  const createUser = async (userData: UserCreateRequest): Promise<User> => {
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
      
      setUsers(prev => [...prev, newUser]);
      setTotalUsers(prev => prev + 1);
      
      return newUser;
      
      // TODO: Replace with actual API call
      // return await userService.createUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user
  const updateUser = async (id: string, userData: UserUpdateRequest): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For development, update mock user
      setUsers(prev => prev.map(user => 
        user.id === id 
          ? { ...user, ...userData, updatedAt: new Date() }
          : user
      ));
      
      const updatedUser = users.find(u => u.id === id);
      if (!updatedUser) throw new Error('User not found');
      
      return updatedUser;
      
      // TODO: Replace with actual API call
      // return await userService.updateUser(id, userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For development, remove from mock data
      setUsers(prev => prev.filter(user => user.id !== id));
      setTotalUsers(prev => prev - 1);
      
      // TODO: Replace with actual API call
      // await userService.deleteUser(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (id: string, isActive: boolean): Promise<void> => {
    try {
      await updateUser(id, { isActive });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle user status');
      throw err;
    }
  };

  // Custom Data Management
  const setCustomData = async (userId: string, key: string, value: any, reason?: string): Promise<void> => {
    try {
      // For development, update mock data
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? {
              ...user,
              customData: { ...user.customData, [key]: value },
              metadata: {
                ...user.metadata,
                version: user.metadata.version + 1,
                lastModified: new Date(),
                modifiedBy: 'current_user',
                changeHistory: [
                  ...user.metadata.changeHistory,
                  {
                    field: `customData.${key}`,
                    oldValue: user.customData[key],
                    newValue: value,
                    timestamp: new Date(),
                    modifiedBy: 'current_user',
                    reason
                  }
                ]
              }
            }
          : user
      ));
      
      // TODO: Replace with actual API call
      // await userService.setCustomData(userId, key, value, reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set custom data');
      throw err;
    }
  };

  const getCustomData = async (userId: string, key?: string): Promise<any> => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      
      return key ? user.customData[key] : user.customData;
      
      // TODO: Replace with actual API call
      // return await userService.getCustomData(userId, key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get custom data');
      throw err;
    }
  };

  const deleteCustomData = async (userId: string, key: string): Promise<void> => {
    try {
      // For development, update mock data
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? {
              ...user,
              customData: Object.fromEntries(
                Object.entries(user.customData).filter(([k]) => k !== key)
              ),
              metadata: {
                ...user.metadata,
                version: user.metadata.version + 1,
                lastModified: new Date(),
                modifiedBy: 'current_user',
                changeHistory: [
                  ...user.metadata.changeHistory,
                  {
                    field: `customData.${key}`,
                    oldValue: user.customData[key],
                    newValue: undefined,
                    timestamp: new Date(),
                    modifiedBy: 'current_user',
                    reason: 'Deleted'
                  }
                ]
              }
            }
          : user
      ));
      
      // TODO: Replace with actual API call
      // await userService.deleteCustomData(userId, key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom data');
      throw err;
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
    deleteUser,
    toggleUserStatus,
    setCustomData,
    getCustomData,
    deleteCustomData,
    getMetadata,
    updateMetadata,
    getUserById,
    clearError
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};
