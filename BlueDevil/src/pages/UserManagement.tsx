import React, { useState } from 'react';
import { User } from '../types/User';
import { UserList } from '../components/UserManagement/UserList';
import { UserForm } from '../components/UserManagement/UserForm';
import { UserManagementDashboard } from '../components/UserManagement/UserManagementDashboard';
import { ProjectMembershipManager } from '../components/UserManagement/ProjectMembershipManager';
import { useUserManagement } from '../contexts/UserManagementContext';

export const UserManagement: React.FC = () => {
  const { createUser, updateUser, clearError } = useUserManagement();
  const [view, setView] = useState<'dashboard' | 'list' | 'create' | 'edit' | 'view'>('dashboard');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleCreateUser = async (userData: any) => {
    try {
      await createUser(userData);
      setView('list');
      clearError();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return;
    
    try {
      await updateUser(selectedUser.id, userData);
      setView('list');
      setSelectedUser(null);
      clearError();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setView('view');
  };

  const handleEditUserClick = (user: User) => {
    setSelectedUser(user);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedUser(null);
    clearError();
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('list')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  View All Users
                </button>
                <button
                  onClick={() => setView('create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add New User
                </button>
              </div>
            </div>
            
            <UserManagementDashboard />
          </div>
        );

      case 'create':
        return (
          <UserForm
            mode="create"
            onSubmit={handleCreateUser}
            onCancel={handleCancel}
          />
        );

      case 'edit':
        return (
          <UserForm
            user={selectedUser}
            mode="edit"
            onSubmit={handleEditUser}
            onCancel={handleCancel}
          />
        );

      case 'view':
        return selectedUser ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <p className="text-gray-600 mt-1">View user information and settings</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.profile.firstName} {selectedUser.profile.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="text-sm text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.profile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Global Role</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.globalRole === 'admin' 
                        ? 'bg-red-100 text-red-800'
                        : selectedUser.globalRole === 'user'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.globalRole}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security & Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Two-Factor Auth</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.security.twoFactorEnabled 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.security.lastLogin 
                        ? new Date(selectedUser.security.lastLogin).toLocaleString()
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <p className="text-sm text-gray-900">{selectedUser.settings.language}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <p className="text-sm text-gray-900">{selectedUser.settings.timezone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Projects</label>
                    <p className="text-sm text-gray-900">{selectedUser.projectMemberships.length} project(s)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Data */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Data</h3>
              {Object.keys(selectedUser.customData).length === 0 ? (
                <p className="text-gray-500 italic">No custom data defined</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedUser.customData).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <label className="block text-sm font-medium text-gray-700">{key}</label>
                      <p className="text-sm text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Version</label>
                  <p className="text-sm text-gray-900">{selectedUser.metadata.version}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Modified</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.metadata.lastModified).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modified By</label>
                  <p className="text-sm text-gray-900">{selectedUser.metadata.modifiedBy || 'System'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back to List
              </button>
              <button
                onClick={() => handleEditUserClick(selectedUser)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit User
              </button>
            </div>
          </div>
        ) : null;

      default:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('dashboard')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setView('create')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add New User
                </button>
              </div>
            </div>
            
            <UserList
              onEditUser={handleEditUserClick}
              onViewUser={handleViewUser}
            />
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderContent()}
    </div>
  );
};
