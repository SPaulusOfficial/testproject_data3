import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from '../components/PermissionGuard';
import { UserList } from '../components/UserManagement/UserList';
import { UserForm } from '../components/UserManagement/UserForm';
import UserPermissionManager from '../components/UserManagement/UserPermissionManager';
import { User } from '../types/User';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [view, setView] = useState<'list' | 'edit' | 'view'>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Check permissions
  const canAccessUserManagement = hasPermission('UserManagement');
  const canManageUserPermissions = hasPermission('UserManagement');

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setView('edit');
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setView('view');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData: any) => {
    // Handle user save logic here
    console.log('Saving user:', userData);
    setView('list');
    setSelectedUser(null);
  };

  if (!canAccessUserManagement) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Access Denied</h3>
          <p className="text-red-600">You don't have permission to access User Management.</p>
        </div>
      </div>
    );
  }

  // Show edit form
  if (view === 'edit' && selectedUser) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit User</h1>
          <p className="text-gray-600">Edit user information and settings</p>
        </div>
        <UserForm
          user={selectedUser}
          mode="edit"
          onSubmit={handleSaveUser}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Show view form
  if (view === 'view' && selectedUser) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
          <p className="text-gray-600">View user information and settings</p>
        </div>
        <UserForm
          user={selectedUser}
          mode="edit"
          onSubmit={handleSaveUser}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage users and their permissions</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          {canManageUserPermissions && (
            <button
              onClick={() => setActiveTab('permissions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'permissions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Permissions
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div>
          <PermissionGuard permission="UserManagement">
            <UserList 
              onEditUser={handleEditUser} 
              onViewUser={handleViewUser} 
            />
          </PermissionGuard>
        </div>
      )}

      {activeTab === 'permissions' && canManageUserPermissions && (
        <div>
          <UserPermissionManager />
        </div>
      )}
    </div>
  );
};

export default UserManagement;
