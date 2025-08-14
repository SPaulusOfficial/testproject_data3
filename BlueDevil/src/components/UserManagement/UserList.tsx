import React, { useState } from 'react';
import { User } from '../../types/User';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { CustomDataEditor } from './CustomDataEditor';
import { ProjectMembershipManager } from './ProjectMembershipManager';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGuard } from '../PermissionGuard';

interface UserListProps {
  onEditUser: (user: User) => void;
  onViewUser: (user: User) => void;
  onCreateUser: () => void;
  onSetPassword: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ onEditUser, onViewUser, onCreateUser, onSetPassword }) => {
  const { users, updateUser, toggleUserStatus, fetchUsers, isLoading, error } = useUserManagement();
  const { hasPermission } = usePermissions();
  const [showCustomDataModal, setShowCustomDataModal] = useState(false);
  const [showProjectMembershipModal, setShowProjectMembershipModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    if (!hasPermission('UserManagement')) {
      alert('You do not have permission to modify user status');
      return;
    }
    
    try {
      await toggleUserStatus(userId, isActive);
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };



  const handleCustomDataClick = (user: User) => {
    if (!hasPermission('UserManagement')) {
      alert('You do not have permission to edit user custom data');
      return;
    }
    setSelectedUser(user);
    setShowCustomDataModal(true);
  };

  const handleCustomDataClose = () => {
    setShowCustomDataModal(false);
    setSelectedUser(null);
    // Refresh the user list to get updated data
    fetchUsers();
  };

  const handleProjectMembershipClick = (user: User) => {
    if (!hasPermission('UserManagement')) {
      alert('You do not have permission to manage project memberships');
      return;
    }
    setSelectedUser(user);
    setShowProjectMembershipModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Users ({users.length})</h3>
          <PermissionGuard permission="UserManagement">
            <button
              onClick={onCreateUser}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create User
            </button>
          </PermissionGuard>
        </div>
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
                Projects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.profile.avatar || '/default-avatar.png'}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.profile.firstName} {user.profile.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.globalRole === 'system_admin' 
                      ? 'bg-red-100 text-red-800'
                      : user.globalRole === 'project_admin'
                      ? 'bg-orange-100 text-orange-800'
                      : user.globalRole === 'user'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.globalRole}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.projectMemberships.length} project(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.security.lastLogin 
                    ? new Date(user.security.lastLogin).toLocaleDateString()
                    : 'Never'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    
                    <PermissionGuard permission="UserManagement">
                      <button
                        onClick={() => onEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="UserManagement">
                      <button
                        onClick={() => handleCustomDataClick(user)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Custom Data
                      </button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="UserManagement">
                      <button
                        onClick={() => handleProjectMembershipClick(user)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Projects
                      </button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="UserManagement">
                      <button
                        onClick={() => handleToggleStatus(user.id, !user.isActive)}
                        className={`${
                          user.isActive 
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </PermissionGuard>
                    
                    <PermissionGuard permission="UserManagement">
                      <button
                        onClick={() => onSetPassword(user)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Set Password
                      </button>
                    </PermissionGuard>
                    

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

             {/* Custom Data Modal */}
       {showCustomDataModal && selectedUser && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
             <div className="mt-3">
               <h3 className="text-lg font-medium text-gray-900 mb-4">
                 Custom Data for {selectedUser.profile.firstName} {selectedUser.profile.lastName}
               </h3>
               <CustomDataEditor
                 userId={selectedUser.id}
                 data={selectedUser.customData || {}}
                 onClose={handleCustomDataClose}
               />
             </div>
           </div>
         </div>
       )}

       {/* Project Membership Modal */}
       {showProjectMembershipModal && selectedUser && (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
           <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
             <div className="mt-3">
               <ProjectMembershipManager
                 user={selectedUser}
                 onClose={() => setShowProjectMembershipModal(false)}
               />
             </div>
           </div>
         </div>
       )}
    </div>
  );
};
