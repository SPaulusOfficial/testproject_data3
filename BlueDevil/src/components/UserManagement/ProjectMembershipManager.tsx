import React, { useState, useEffect } from 'react';
import { User, ProjectMembership, Permission } from '../../types/User';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { ProjectPermissionTable } from './ProjectPermissionTable';
import { ProjectPermissionCard } from './ProjectPermissionCard';

interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isActive: boolean;
}

interface ProjectMembershipManagerProps {
  user: User;
  onClose: () => void;
}

export const ProjectMembershipManager: React.FC<ProjectMembershipManagerProps> = ({ 
  user, 
  onClose 
}) => {
  const { updateUser } = useUserManagement();
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'member' | 'viewer'>('member');
  const [isLoading, setIsLoading] = useState(false);

  // Mock projects for development
  const mockProjects: Project[] = [
    { id: 'project-1', name: 'Salesforce Migration', description: 'Legacy to Salesforce migration project', ownerId: '1', isActive: true },
    { id: 'project-2', name: 'CRM Implementation', description: 'New CRM system implementation', ownerId: '1', isActive: true },
    { id: 'project-3', name: 'Data Analytics', description: 'Advanced analytics and reporting', ownerId: '2', isActive: true },
    { id: 'project-4', name: 'Mobile App', description: 'Mobile application development', ownerId: '1', isActive: false },
  ];

  useEffect(() => {
    setAvailableProjects(mockProjects);
  }, []);

  const getAvailableProjectsForUser = () => {
    const userProjectIds = user.projectMemberships.map(pm => pm.projectId);
    return availableProjects.filter(project => 
      !userProjectIds.includes(project.id) && project.isActive
    );
  };

  const handleAddToProject = async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      const project = availableProjects.find(p => p.id === selectedProject);
      if (!project) return;

      const newMembership: ProjectMembership = {
        projectId: selectedProject,
        role: selectedRole,
        permissions: getDefaultPermissionsForRole(selectedRole),
        joinedAt: new Date()
      };

      const updatedMemberships = [...user.projectMemberships, newMembership];
      
      await updateUser(user.id, {
        projectMemberships: updatedMemberships
      });

      setSelectedProject('');
      setSelectedRole('member');
    } catch (error) {
      console.error('Failed to add user to project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to remove this user from the project?')) return;

    setIsLoading(true);
    try {
      const updatedMemberships = user.projectMemberships.filter(
        pm => pm.projectId !== projectId
      );
      
      await updateUser(user.id, {
        projectMemberships: updatedMemberships
      });
    } catch (error) {
      console.error('Failed to remove user from project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (projectId: string, newRole: 'owner' | 'admin' | 'member' | 'viewer') => {
    setIsLoading(true);
    try {
      const updatedMemberships = user.projectMemberships.map(pm => 
        pm.projectId === projectId 
          ? { ...pm, role: newRole, permissions: getDefaultPermissionsForRole(newRole) }
          : pm
      );
      
      await updateUser(user.id, {
        projectMemberships: updatedMemberships
      });
    } catch (error) {
      console.error('Failed to update user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultPermissionsForRole = (role: string): Permission[] => {
    switch (role) {
      case 'owner':
        return [
          { resource: 'projects', actions: ['read', 'write', 'delete'], scope: 'all' },
          { resource: 'agents', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
          { resource: 'workflows', actions: ['read', 'write', 'delete', 'execute'], scope: 'all' },
          { resource: 'data', actions: ['read', 'write', 'delete'], scope: 'all' },
          { resource: 'users', actions: ['read', 'write'], scope: 'all' }
        ];
      case 'admin':
        return [
          { resource: 'projects', actions: ['read', 'write'], scope: 'all' },
          { resource: 'agents', actions: ['read', 'write', 'execute'], scope: 'all' },
          { resource: 'workflows', actions: ['read', 'write', 'execute'], scope: 'all' },
          { resource: 'data', actions: ['read', 'write'], scope: 'all' },
          { resource: 'users', actions: ['read'], scope: 'all' }
        ];
      case 'member':
        return [
          { resource: 'projects', actions: ['read'], scope: 'all' },
          { resource: 'agents', actions: ['read', 'execute'], scope: 'all' },
          { resource: 'workflows', actions: ['read', 'execute'], scope: 'all' },
          { resource: 'data', actions: ['read', 'write'], scope: 'own' }
        ];
      case 'viewer':
        return [
          { resource: 'projects', actions: ['read'], scope: 'all' },
          { resource: 'agents', actions: ['read'], scope: 'all' },
          { resource: 'workflows', actions: ['read'], scope: 'all' },
          { resource: 'data', actions: ['read'], scope: 'all' }
        ];
      default:
        return [];
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectName = (projectId: string) => {
    const project = availableProjects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Project Memberships for {user.profile.firstName} {user.profile.lastName}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage user's project access and permissions
        </p>
      </div>

      {/* Current Project Memberships */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Current Project Memberships</h4>
        {user.projectMemberships.length === 0 ? (
          <p className="text-gray-500 italic">No project memberships</p>
        ) : (
          <div className="space-y-3">
            {user.projectMemberships.map((membership) => (
              <div key={membership.projectId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      {getProjectName(membership.projectId)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(membership.role)}`}>
                      {membership.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      Joined {new Date(membership.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={membership.role}
                    onChange={(e) => handleUpdateRole(membership.projectId, e.target.value as any)}
                    disabled={isLoading}
                    className="text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => handleRemoveFromProject(membership.projectId)}
                    disabled={isLoading}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Project */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Add to Project</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a project</option>
              {getAvailableProjectsForUser().map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAddToProject}
              disabled={!selectedProject || isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add to Project'}
            </button>
          </div>
        </div>
      </div>

      {/* Role Permissions Overview */}
      <div className="mt-6 border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Role Permissions Overview</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['owner', 'admin', 'member', 'viewer'] as const).map(role => (
            <div key={role} className="bg-gray-50 p-3 rounded">
              <h5 className="text-sm font-medium text-gray-900 capitalize mb-2">{role}</h5>
              <div className="space-y-1 text-xs">
                {getDefaultPermissionsForRole(role).map((permission, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-600">{permission.resource}:</span>
                    <span className="text-gray-900">{permission.actions.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Project Permissions */}
      {user.projectMemberships.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Current Project Permissions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.projectMemberships.map((membership, index) => (
              <ProjectPermissionCard
                key={membership.projectId}
                permissions={membership.permissions}
                role={membership.role}
                projectName={getProjectName(membership.projectId)}
                isEditable={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detailed Permission Table */}
      <div className="mt-6 border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Custom Permission Matrix</h4>
        <ProjectPermissionTable
          permissions={user.projectMemberships[0]?.permissions || []}
          onPermissionsChange={(newPermissions) => {
            // Update the first project membership with new permissions
            if (user.projectMemberships.length > 0) {
              const updatedMemberships = user.projectMemberships.map((pm, index) => 
                index === 0 ? { ...pm, permissions: newPermissions } : pm
              );
              updateUser(user.id, { projectMemberships: updatedMemberships });
            }
          }}
          title="Project Permission Matrix"
        />
      </div>

      {/* Close Button */}
      <div className="flex justify-end mt-6 pt-6 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};
