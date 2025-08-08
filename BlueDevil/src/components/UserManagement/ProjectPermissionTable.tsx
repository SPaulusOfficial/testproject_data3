import React, { useState } from 'react';
import { Permission } from '../../types/User';

interface ProjectPermissionTableProps {
  permissions: Permission[];
  onPermissionsChange: (permissions: Permission[]) => void;
  title?: string;
}

export const ProjectPermissionTable: React.FC<ProjectPermissionTableProps> = ({ 
  permissions, 
  onPermissionsChange,
  title = "Project Permissions"
}) => {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);

  // Define resources with icons and descriptions
  const resources = [
    { 
      id: 'projects', 
      name: 'Projects', 
      icon: '📋',
      description: 'Project management and settings',
      color: 'bg-blue-50 border-blue-200'
    },
    { 
      id: 'agents', 
      name: 'AI Agents', 
      icon: '🤖',
      description: 'AI agent configuration and execution',
      color: 'bg-purple-50 border-purple-200'
    },
    { 
      id: 'workflows', 
      name: 'Workflows', 
      icon: '⚡',
      description: 'Workflow creation and management',
      color: 'bg-green-50 border-green-200'
    },
    { 
      id: 'data', 
      name: 'Data', 
      icon: '📊',
      description: 'Data access and manipulation',
      color: 'bg-orange-50 border-orange-200'
    },
    { 
      id: 'users', 
      name: 'Users', 
      icon: '👥',
      description: 'User management within project',
      color: 'bg-red-50 border-red-200'
    },
    { 
      id: 'reports', 
      name: 'Reports', 
      icon: '📈',
      description: 'Report generation and viewing',
      color: 'bg-indigo-50 border-indigo-200'
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: '⚙️',
      description: 'Project configuration',
      color: 'bg-gray-50 border-gray-200'
    },
    { 
      id: 'files', 
      name: 'Files', 
      icon: '📁',
      description: 'File upload and management',
      color: 'bg-yellow-50 border-yellow-200'
    }
  ];

  const actions = [
    { id: 'read', name: 'Read', icon: '👁️', description: 'View and access' },
    { id: 'write', name: 'Write', icon: '✏️', description: 'Create and modify' },
    { id: 'delete', name: 'Delete', icon: '🗑️', description: 'Remove and destroy' },
    { id: 'execute', name: 'Execute', icon: '▶️', description: 'Run and trigger' },
    { id: 'approve', name: 'Approve', icon: '✅', description: 'Approve changes' },
    { id: 'export', name: 'Export', icon: '📤', description: 'Export data' }
  ];

  const scopes = [
    { id: 'all', name: 'All', description: 'Access to all items', color: 'bg-green-100 text-green-800' },
    { id: 'own', name: 'Own', description: 'Access to own items only', color: 'bg-blue-100 text-blue-800' },
    { id: 'none', name: 'None', description: 'No access', color: 'bg-gray-100 text-gray-800' }
  ];

  const getPermissionForResource = (resourceId: string) => {
    return permissions.find(p => p.resource === resourceId) || {
      resource: resourceId,
      actions: [],
      scope: 'none'
    };
  };

  const updatePermission = (resourceId: string, field: 'actions' | 'scope', value: string[] | string) => {
    const existingPermission = getPermissionForResource(resourceId);
    const updatedPermission = {
      ...existingPermission,
      [field]: value
    };

    const newPermissions = permissions.filter(p => p.resource !== resourceId);
    if (updatedPermission.actions.length > 0 || updatedPermission.scope !== 'none') {
      newPermissions.push(updatedPermission);
    }

    onPermissionsChange(newPermissions);
  };

  const toggleAction = (resourceId: string, actionId: string) => {
    const permission = getPermissionForResource(resourceId);
    const currentActions = permission.actions;
    
    let newActions: string[];
    if (currentActions.includes(actionId)) {
      newActions = currentActions.filter(a => a !== actionId);
    } else {
      newActions = [...currentActions, actionId];
    }

    updatePermission(resourceId, 'actions', newActions);
  };

  const isActionEnabled = (resourceId: string, actionId: string) => {
    const permission = getPermissionForResource(resourceId);
    return permission.actions.includes(actionId);
  };

  const getScopeForResource = (resourceId: string) => {
    const permission = getPermissionForResource(resourceId);
    return permission.scope;
  };

  const getResourceInfo = (resourceId: string) => {
    return resources.find(r => r.id === resourceId);
  };

  const getActionInfo = (actionId: string) => {
    return actions.find(a => a.id === actionId);
  };

  const getScopeInfo = (scopeId: string) => {
    return scopes.find(s => s.id === scopeId);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">Manage permissions for different project resources</p>
      </div>

      <div className="p-6">
        {/* Permission Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                {actions.map(action => (
                  <th key={action.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{action.icon}</span>
                      <span>{action.name}</span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scope
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map(resource => (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${resource.color}`}>
                        {resource.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                        <div className="text-xs text-gray-500">{resource.description}</div>
                      </div>
                    </div>
                  </td>
                  {actions.map(action => (
                    <td key={action.id} className="px-2 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleAction(resource.id, action.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          isActionEnabled(resource.id, action.id)
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={`${action.name}: ${action.description}`}
                      >
                        {isActionEnabled(resource.id, action.id) ? '✓' : '○'}
                      </button>
                    </td>
                  ))}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={getScopeForResource(resource.id)}
                      onChange={(e) => updatePermission(resource.id, 'scope', e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {scopes.map(scope => (
                        <option key={scope.id} value={scope.id}>
                          {scope.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
            <div className="space-y-2">
              {actions.map(action => (
                <div key={action.id} className="flex items-center space-x-2">
                  <span className="text-lg">{action.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{action.name}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Scopes</h4>
            <div className="space-y-2">
              {scopes.map(scope => (
                <div key={scope.id} className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${scope.color}`}>
                    {scope.name}
                  </span>
                  <div>
                    <div className="text-xs text-gray-500">{scope.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const allPermissions = resources.map(resource => ({
                    resource: resource.id,
                    actions: actions.map(a => a.id),
                    scope: 'all' as const
                  }));
                  onPermissionsChange(allPermissions);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                🎯 Grant All Permissions
              </button>
              <button
                onClick={() => {
                  const readOnlyPermissions = resources.map(resource => ({
                    resource: resource.id,
                    actions: ['read'],
                    scope: 'all' as const
                  }));
                  onPermissionsChange(readOnlyPermissions);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                👁️ Read-Only Access
              </button>
              <button
                onClick={() => {
                  onPermissionsChange([]);
                }}
                className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
              >
                🚫 No Access
              </button>
            </div>
          </div>
        </div>

        {/* Permission Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Permission Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {permissions.filter(p => p.actions.includes('read')).length}
              </div>
              <div className="text-gray-600">Read Access</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {permissions.filter(p => p.actions.includes('write')).length}
              </div>
              <div className="text-gray-600">Write Access</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {permissions.filter(p => p.actions.includes('execute')).length}
              </div>
              <div className="text-gray-600">Execute Access</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {permissions.filter(p => p.scope === 'all').length}
              </div>
              <div className="text-gray-600">Full Scope</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
