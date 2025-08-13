import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { useUserManagement } from '../contexts/UserManagementContext';
import { PermissionGuard } from '../components/PermissionGuard';
import { UserList } from '../components/UserManagement/UserList';
import { UserForm } from '../components/UserManagement/UserForm';
import UserPermissionManager from '../components/UserManagement/UserPermissionManager';
import { User } from '../types/User';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const { updateUser, createUser, users } = useUserManagement();
  const [activeTab, setActiveTab] = useState<'users' | 'permissions'>('users');
  const [view, setView] = useState<'list' | 'edit' | 'view' | 'create'>('list');
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

  const handleCreateUser = () => {
    setView('create');
    setSelectedUser(null);
  };

  const handleSaveUser = async (userData: any) => {
    console.log('🔄 handleSaveUser called');
    console.log('🔄 userData:', userData);
    console.log('🔄 selectedUser:', selectedUser);
    console.log('🔄 current view:', view);
    
    try {
      if (view === 'create') {
        console.log('🔄 Creating new user...');
        await createUser(userData);
        console.log('✅ User created successfully');
        setView('list');
        setSelectedUser(null);
      } else if (selectedUser) {
        console.log('🔄 Updating existing user...');
        console.log('🔄 Calling updateUser with:', selectedUser.id, userData);
        await updateUser(selectedUser.id, userData);
        console.log('✅ User updated successfully');
        setView('list');
        setSelectedUser(null);
      } else {
        console.error('❌ No user selected for update');
        return;
      }
    } catch (error) {
      console.error('❌ Failed to save user:', error);
      // You might want to show an error message to the user here
      alert('Failed to save user. Please try again.');
    }
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
          existingEmails={users.map(u => u.email).filter(email => email !== selectedUser?.email)}
        />
      </div>
    );
  }

  // Show create form
  if (view === 'create') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New User</h1>
          <p className="text-gray-600">Add a new user to the system</p>
        </div>
        <UserForm
          mode="create"
          onSubmit={handleSaveUser}
          onCancel={handleCancel}
          existingEmails={users.map(u => u.email)}
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
          mode="view"
          onSubmit={handleSaveUser}
          onCancel={handleCancel}
          existingEmails={users.map(u => u.email).filter(email => email !== selectedUser?.email)}
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
          {/* {canManageUserPermissions && (
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
          )} */}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <div>
          <PermissionGuard permission="UserManagement">
            <UserList 
              onEditUser={handleEditUser} 
              onViewUser={handleViewUser} 
              onCreateUser={handleCreateUser}
            />
          </PermissionGuard>
        </div>
      )}

      {/* {activeTab === 'permissions' && canManageUserPermissions && (
        <div>
          <UserPermissionManager />
        </div>
      )} */}
    </div>
  );
};

export default UserManagement;
