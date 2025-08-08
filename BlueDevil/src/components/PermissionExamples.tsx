import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { 
  PermissionGuard, 
  ReadPermissionGuard, 
  WritePermissionGuard, 
  DeletePermissionGuard,
  ExecutePermissionGuard,
  AdminGuard,
  ProjectAdminGuard 
} from './PermissionGuard';
import { 
  PermissionButton, 
  ReadButton, 
  WriteButton, 
  DeleteButton, 
  ExecuteButton 
} from './PermissionButton';

// Example: Project Dashboard with Permission-based UI
export const ProjectDashboard: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { 
    canRead, 
    canWrite, 
    canDelete, 
    canExecute, 
    getProjectRole,
    isProjectAdmin 
  } = usePermissions();

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Project Dashboard</h2>
        <div className="flex space-x-2">
          {/* Only show if user can write to projects */}
          <WriteButton 
            resource="projects" 
            projectId={projectId}
            onClick={() => console.log('Edit project')}
          >
            Edit Project
          </WriteButton>
          
          {/* Only show if user is project admin */}
          <ProjectAdminGuard projectId={projectId}>
            <button className="bg-purple-600 text-white px-4 py-2 rounded">
              Project Settings
            </button>
          </ProjectAdminGuard>
        </div>
      </div>

      {/* Project Info - Readable by anyone with read permission */}
      <ReadPermissionGuard resource="projects" projectId={projectId}>
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Project Information</h3>
          <p>Project details and statistics...</p>
        </div>
      </ReadPermissionGuard>

      {/* AI Agents Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">AI Agents</h3>
          <ExecuteButton 
            resource="agents" 
            projectId={projectId}
            onClick={() => console.log('Create new agent')}
          >
            Create Agent
          </ExecuteButton>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Agent Cards - Only show if user can read agents */}
          <ReadPermissionGuard resource="agents" projectId={projectId}>
            <div className="p-4 border rounded">
              <h4 className="font-medium">Data Processing Agent</h4>
              <p className="text-sm text-gray-600">Processes customer data</p>
              <div className="mt-3 flex space-x-2">
                <ExecuteButton 
                  resource="agents" 
                  projectId={projectId}
                  size="sm"
                  onClick={() => console.log('Run agent')}
                >
                  Run
                </ExecuteButton>
                <WriteButton 
                  resource="agents" 
                  projectId={projectId}
                  size="sm"
                  onClick={() => console.log('Edit agent')}
                >
                  Edit
                </WriteButton>
                <DeleteButton 
                  resource="agents" 
                  projectId={projectId}
                  size="sm"
                  onClick={() => console.log('Delete agent')}
                >
                  Delete
                </DeleteButton>
              </div>
            </div>
          </ReadPermissionGuard>
        </div>
      </div>

      {/* Workflows Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Workflows</h3>
          <WriteButton 
            resource="workflows" 
            projectId={projectId}
            onClick={() => console.log('Create workflow')}
          >
            Create Workflow
          </WriteButton>
        </div>
        
        <ReadPermissionGuard resource="workflows" projectId={projectId}>
          <div className="space-y-2">
            <div className="p-3 border rounded flex items-center justify-between">
              <span>Customer Onboarding Workflow</span>
              <div className="flex space-x-2">
                <ExecuteButton 
                  resource="workflows" 
                  projectId={projectId}
                  size="sm"
                  onClick={() => console.log('Execute workflow')}
                >
                  Execute
                </ExecuteButton>
                <WriteButton 
                  resource="workflows" 
                  projectId={projectId}
                  size="sm"
                  onClick={() => console.log('Edit workflow')}
                >
                  Edit
                </WriteButton>
              </div>
            </div>
          </div>
        </ReadPermissionGuard>
      </div>

      {/* Data Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Data</h3>
        <ReadPermissionGuard resource="data" projectId={projectId}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-medium">Customer Data</h4>
              <p className="text-sm text-gray-600">1,234 records</p>
              <div className="mt-3">
                <WriteButton 
                  resource="data" 
                  projectId={projectId}
                  size="sm"
                  onClick={() => console.log('Export data')}
                >
                  Export
                </WriteButton>
              </div>
            </div>
          </div>
        </ReadPermissionGuard>
      </div>

      {/* Reports Section - Only for project admins */}
      <ProjectAdminGuard projectId={projectId}>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-medium">Monthly Report</h4>
              <p className="text-sm text-gray-600">Generated 2 days ago</p>
              <div className="mt-3">
                <ExecuteButton 
                  resource="reports" 
                  projectId={projectId}
                  size="sm"
                  onClick={() => console.log('Generate report')}
                >
                  Generate
                </ExecuteButton>
              </div>
            </div>
          </div>
        </div>
      </ProjectAdminGuard>

      {/* Admin Only Section */}
      <AdminGuard>
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-lg font-semibold text-red-800">Admin Controls</h3>
          <p className="text-sm text-red-600 mb-3">These controls are only visible to global admins</p>
          <div className="flex space-x-2">
            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
              Delete Project
            </button>
            <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
              Transfer Ownership
            </button>
          </div>
        </div>
      </AdminGuard>
    </div>
  );
};

// Example: User Management with Permissions
export const UserManagementWithPermissions: React.FC = () => {
  const { canRead, canWrite, canDelete, isAdmin } = usePermissions();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <WriteButton 
          resource="users" 
          onClick={() => console.log('Add user')}
        >
          Add User
        </WriteButton>
      </div>

      <ReadPermissionGuard resource="users">
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                <td className="px-6 py-4 whitespace-nowrap">john@example.com</td>
                <td className="px-6 py-4 whitespace-nowrap">Member</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <WriteButton 
                      resource="users" 
                      size="sm"
                      onClick={() => console.log('Edit user')}
                    >
                      Edit
                    </WriteButton>
                    <DeleteButton 
                      resource="users" 
                      size="sm"
                      onClick={() => console.log('Delete user')}
                    >
                      Delete
                    </DeleteButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ReadPermissionGuard>
    </div>
  );
};

// Example: Conditional Navigation
export const NavigationWithPermissions: React.FC = () => {
  const { canRead, hasAnyPermission } = usePermissions();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex space-x-6">
        <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
        
        {/* Only show if user can read projects */}
        <ReadPermissionGuard resource="projects">
          <a href="/projects" className="hover:text-gray-300">Projects</a>
        </ReadPermissionGuard>
        
        {/* Only show if user can read agents */}
        <ReadPermissionGuard resource="agents">
          <a href="/agents" className="hover:text-gray-300">AI Agents</a>
        </ReadPermissionGuard>
        
        {/* Only show if user can read workflows */}
        <ReadPermissionGuard resource="workflows">
          <a href="/workflows" className="hover:text-gray-300">Workflows</a>
        </ReadPermissionGuard>
        
        {/* Only show if user can read data */}
        <ReadPermissionGuard resource="data">
          <a href="/data" className="hover:text-gray-300">Data</a>
        </ReadPermissionGuard>
        
        {/* Only show if user can read users */}
        <ReadPermissionGuard resource="users">
          <a href="/users" className="hover:text-gray-300">Users</a>
        </ReadPermissionGuard>
        
        {/* Only show if user can read reports */}
        <ReadPermissionGuard resource="reports">
          <a href="/reports" className="hover:text-gray-300">Reports</a>
        </ReadPermissionGuard>
        
        {/* Only show if user can read settings */}
        <ReadPermissionGuard resource="settings">
          <a href="/settings" className="hover:text-gray-300">Settings</a>
        </ReadPermissionGuard>
      </div>
    </nav>
  );
};
