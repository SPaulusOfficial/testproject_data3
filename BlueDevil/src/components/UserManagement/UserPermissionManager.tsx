import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../PermissionGuard';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  globalRole: string;
  isActive: boolean;
  directPermissions: string[];
  permissionSets: string[];
  effectivePermissions: string[];
}

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface PermissionSet {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface AvailablePermissions {
  permissions: Permission[];
  permissionSets: PermissionSet[];
}

const UserPermissionManager: React.FC = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions>({
    permissions: [],
    permissionSets: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedPermissionSets, setSelectedPermissionSets] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Check if user has permission to manage user permissions
  const canManageUserPermissions = hasPermission('UserManagement');

  useEffect(() => {
    if (canManageUserPermissions) {
      loadUsersWithPermissions();
      loadAvailablePermissions();
    }
  }, [canManageUserPermissions]);

  const loadUsersWithPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load available permissions');
      }

      const data = await response.json();
      setAvailablePermissions(data);
    } catch (error) {
      console.error('Error loading available permissions:', error);
      setError('Failed to load available permissions');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setSelectedPermissions(user.directPermissions);
    setSelectedPermissionSets(user.permissionSets);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedPermissions([]);
    setSelectedPermissionSets([]);
  };

  const handleSavePermissions = async () => {
    if (!editingUser) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/users/${editingUser.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          permissions: selectedPermissions,
          permissionSets: selectedPermissionSets
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update permissions');
      }

      // Reload users to get updated data
      await loadUsersWithPermissions();
      setEditingUser(null);
      setSelectedPermissions([]);
      setSelectedPermissionSets([]);
    } catch (error) {
      console.error('Error saving permissions:', error);
      setError(error instanceof Error ? error.message : 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handlePermissionSetToggle = (permissionSetId: string) => {
    setSelectedPermissionSets(prev => 
      prev.includes(permissionSetId)
        ? prev.filter(p => p !== permissionSetId)
        : [...prev, permissionSetId]
    );
  };

  const getPermissionCategory = (permissionId: string) => {
    const permission = availablePermissions.permissions.find(p => p.id === permissionId);
    return permission?.category || 'Other';
  };

  const getPermissionSetDescription = (permissionSetId: string) => {
    const permissionSet = availablePermissions.permissionSets.find(p => p.id === permissionSetId);
    return permissionSet?.description || '';
  };

  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {};
    availablePermissions.permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  if (!canManageUserPermissions) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Access Denied</h3>
          <p className="text-red-600">You don't have permission to manage user permissions.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadUsersWithPermissions}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Permission Management</h2>
        <p className="text-gray-600">Manage individual user permissions and permission sets</p>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direct Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permission Sets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.globalRole === 'admin' ? 'bg-red-100 text-red-800' :
                      user.globalRole === 'user' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.globalRole}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.directPermissions.length} permissions
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.directPermissions.slice(0, 3).join(', ')}
                      {user.directPermissions.length > 3 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.permissionSets.length} sets
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.permissionSets.slice(0, 2).join(', ')}
                      {user.permissionSets.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {user.effectivePermissions.length} total
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.effectivePermissions.slice(0, 3).join(', ')}
                      {user.effectivePermissions.length > 3 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit Permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Permissions for {editingUser.firstName} {editingUser.lastName}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Direct Permissions */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Direct Permissions</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Object.entries(groupPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className="border rounded-lg p-3">
                        <h5 className="font-medium text-gray-700 mb-2">{category}</h5>
                        <div className="space-y-1">
                          {permissions.map((permission) => (
                            <label key={permission.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{permission.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permission Sets */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Permission Sets</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availablePermissions.permissionSets.map((permissionSet) => (
                      <div key={permissionSet.id} className="border rounded-lg p-3">
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            checked={selectedPermissionSets.includes(permissionSet.id)}
                            onChange={() => handlePermissionSetToggle(permissionSet.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                          />
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-700">{permissionSet.name}</div>
                            <div className="text-xs text-gray-500">{permissionSet.description}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {permissionSet.permissions.length} permissions
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Direct Permissions:</span>
                    <span className="ml-2 font-medium">{selectedPermissions.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Permission Sets:</span>
                    <span className="ml-2 font-medium">{selectedPermissionSets.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Effective:</span>
                    <span className="ml-2 font-medium">
                      {editingUser ? 
                        // Assuming permissionService is defined elsewhere or needs to be imported
                        // For now, a placeholder calculation
                        selectedPermissions.length + selectedPermissionSets.length : 
                        0
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPermissionManager;
