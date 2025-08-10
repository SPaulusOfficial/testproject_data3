import React, { useState, useEffect } from 'react';
import { Shield, Users, Settings, Plus, Save, X, Check } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface PermissionSet {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

interface UserPermissions {
  permissions: string[];
  permissionSets: string[];
  effectivePermissions: string[];
}

interface SimplePermissionManagerProps {
  userId: string;
  onPermissionsUpdate?: (permissions: UserPermissions) => void;
}

export const SimplePermissionManager: React.FC<SimplePermissionManagerProps> = ({
  userId,
  onPermissionsUpdate
}) => {
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [availablePermissionSets, setAvailablePermissionSets] = useState<PermissionSet[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions>({
    permissions: [],
    permissionSets: [],
    effectivePermissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const [permissionsResponse, setsResponse, userPermissionsResponse] = await Promise.all([
        fetch('http://localhost:3002/api/permissions', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-cache'
        }),
        fetch('http://localhost:3002/api/permissions/sets', {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-cache'
        }),
        fetch(`http://localhost:3002/api/users/${userId}/permissions`, {
          headers: { 'Authorization': `Bearer ${token}` },
          cache: 'no-cache'
        })
      ]);

      if (permissionsResponse.ok) {
        const permissions = await permissionsResponse.json();
        setAvailablePermissions(permissions);
        console.log('🔍 Available permissions:', permissions);
      }

      if (setsResponse.ok) {
        const sets = await setsResponse.json();
        setAvailablePermissionSets(sets);
        console.log('🔍 Available permission sets:', sets);
      }

      if (userPermissionsResponse.ok) {
        const userPerms = await userPermissionsResponse.json();
        // Map API response to expected format
        const mappedUserPerms = {
          permissions: userPerms.directPermissions || [],
          permissionSets: userPerms.permissionSets || [],
          effectivePermissions: userPerms.effectivePermissions || []
        };
        setUserPermissions(mappedUserPerms);
        console.log('🔍 User permissions loaded:', userPerms);
        console.log('🔍 Mapped user permissions:', mappedUserPerms);
        console.log('🔍 User permissions array:', mappedUserPerms.permissions);
        console.log('🔍 User permission sets array:', mappedUserPerms.permissionSets);
        console.log('🔍 User effective permissions:', mappedUserPerms.effectivePermissions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch permission data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Force refresh when component mounts or userId changes
  useEffect(() => {
    console.log('🔄 Component mounted or userId changed, fetching fresh data');
    fetchData();
  }, [userId]);

  // Add debug logging when userId changes
  useEffect(() => {
    console.log('🔄 User ID changed to:', userId);
    console.log('🔄 Triggering data fetch for new user');
    // Force refresh when userId changes
    fetchData();
  }, [userId]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Debug: Log what we're about to send
      console.log('🔍 About to save permissions:');
      console.log('🔍 User permissions:', userPermissions.permissions);
      console.log('🔍 User permission sets:', userPermissions.permissionSets);
      console.log('🔍 Available permission sets:', availablePermissionSets);
      
      const response = await fetch(`http://localhost:3002/api/users/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          permissions: userPermissions.permissions,
          permissionSets: userPermissions.permissionSets
        })
      });

      if (response.ok) {
        setIsEditing(false);
        await fetchData(); // Refresh data
        onPermissionsUpdate?.(userPermissions);
        
        // Trigger permission refresh in the parent context
        if (window.location.pathname.includes('/user-management')) {
          // Dispatch a custom event to refresh permissions
          window.dispatchEvent(new CustomEvent('permissionsUpdated'));
        }
      } else {
        const error = await response.json();
        console.error('❌ Backend error:', error);
        setError(error.error || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      setError('Failed to save permissions');
    }
  };

  const togglePermission = (permissionId: string) => {
    console.log('Toggling permission:', permissionId);
    setUserPermissions(prev => ({
      ...prev,
      permissions: (prev.permissions || []).includes(permissionId)
        ? (prev.permissions || []).filter(p => p !== permissionId)
        : [...(prev.permissions || []), permissionId]
    }));
  };

  const togglePermissionSet = (setName: string) => {
    console.log('Toggling permission set:', setName);
    setUserPermissions(prev => ({
      ...prev,
      permissionSets: (prev.permissionSets || []).includes(setName)
        ? (prev.permissionSets || []).filter(s => s !== setName)
        : [...(prev.permissionSets || []), setName]
    }));
  };

  const hasPermission = (permissionId: string) => {
    const has = userPermissions.effectivePermissions?.includes(permissionId) || false;
    console.log(`🔍 Checking permission ${permissionId}: ${has}`);
    return has;
  };

  const hasPermissionSet = (setName: string) => {
    const has = userPermissions.permissionSets?.includes(setName) || false;
    console.log(`🔍 Checking permission set ${setName}: ${has}`);
    return has;
  };

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit button clicked, setting isEditing to true');
    setIsEditing(true);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Cancel button clicked, setting isEditing to false');
    setIsEditing(false);
  };

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Save button clicked');
    await handleSave();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editing Mode Banner */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Editing Permissions - Make your changes and click Save when done</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">User Permissions</h3>
            <p className="text-sm text-gray-600">Manage individual permissions and permission sets</p>
          </div>
          {isEditing ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600 font-medium">Editing Mode Active</span>
                <button
                  onClick={handleSaveClick}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Edit Permissions</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permission Sets */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-lg font-medium text-gray-900">Permission Sets</span>
              </div>
              {isEditing && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Editing Mode
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Predefined permission packages</p>
          </div>
          <div className="p-6 space-y-3">
            {availablePermissionSets.map(set => (
              <div key={set.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{set.name}</h4>
                  <p className="text-sm text-gray-600">{set.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {set.permissions.length} permissions
                  </p>
                </div>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={hasPermissionSet(set.name)}
                    onChange={() => togglePermissionSet(set.name)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    {hasPermissionSet(set.name) ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 border border-gray-300 rounded" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Individual Permissions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-lg font-medium text-gray-900">Individual Permissions</span>
              </div>
              {isEditing && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Editing Mode
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">Granular permission control</p>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category} className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                <div className="space-y-2">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <span className="text-sm text-gray-900">{permission.name}</span>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={userPermissions.permissions?.includes(permission.id) || false}
                          onChange={() => togglePermission(permission.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          {hasPermission(permission.id) ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 border border-gray-300 rounded" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Effective Permissions Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Effective Permissions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {userPermissions.effectivePermissions.map(permission => (
            <div key={permission} className="bg-white px-3 py-2 rounded border text-sm">
              {permission}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Total: {userPermissions.effectivePermissions.length} effective permissions
        </p>
      </div>
    </div>
  );
};
