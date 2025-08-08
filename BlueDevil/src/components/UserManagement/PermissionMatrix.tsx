import React, { useState } from 'react';
import { Permission } from '../../types/User';

interface PermissionMatrixProps {
  permissions: Permission[];
  onPermissionsChange: (permissions: Permission[]) => void;
  title?: string;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ 
  permissions, 
  onPermissionsChange,
  title = "Permission Matrix"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Define available resources and actions
  const resources = [
    { id: 'projects', name: 'Projects', description: 'Project management and settings' },
    { id: 'agents', name: 'AI Agents', description: 'AI agent configuration and execution' },
    { id: 'workflows', name: 'Workflows', description: 'Workflow creation and management' },
    { id: 'data', name: 'Data', description: 'Data access and manipulation' },
    { id: 'users', name: 'Users', description: 'User management within project' },
    { id: 'reports', name: 'Reports', description: 'Report generation and viewing' },
    { id: 'settings', name: 'Settings', description: 'Project configuration' },
    { id: 'files', name: 'Files', description: 'File upload and management' }
  ];

  const actions = [
    { id: 'read', name: 'Read', description: 'View and access' },
    { id: 'write', name: 'Write', description: 'Create and modify' },
    { id: 'delete', name: 'Delete', description: 'Remove and destroy' },
    { id: 'execute', name: 'Execute', description: 'Run and trigger' },
    { id: 'approve', name: 'Approve', description: 'Approve changes' },
    { id: 'export', name: 'Export', description: 'Export data' }
  ];

  const scopes = [
    { id: 'all', name: 'All', description: 'Access to all items' },
    { id: 'own', name: 'Own', description: 'Access to own items only' },
    { id: 'none', name: 'None', description: 'No access' }
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

  const getResourceName = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    return resource?.name || resourceId;
  };

  const getActionName = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    return action?.name || actionId;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show Summary' : 'Show Details'}
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="p-6">
          {/* Detailed Permission Matrix */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  {actions.map(action => (
                    <th key={action.id} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {action.name}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scope
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resources.map(resource => (
                  <tr key={resource.id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                        <div className="text-xs text-gray-500">{resource.description}</div>
                      </div>
                    </td>
                    {actions.map(action => (
                      <td key={action.id} className="px-2 py-3 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={isActionEnabled(resource.id, action.id)}
                          onChange={() => toggleAction(resource.id, action.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={getScopeForResource(resource.id)}
                        onChange={(e) => updatePermission(resource.id, 'scope', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Actions</h4>
              <div className="space-y-1 text-xs">
                {actions.map(action => (
                  <div key={action.id} className="flex justify-between">
                    <span className="text-gray-600">{action.name}:</span>
                    <span className="text-gray-900">{action.description}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Scopes</h4>
              <div className="space-y-1 text-xs">
                {scopes.map(scope => (
                  <div key={scope.id} className="flex justify-between">
                    <span className="text-gray-600">{scope.name}:</span>
                    <span className="text-gray-900">{scope.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          {/* Summary View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map(resource => {
              const permission = getPermissionForResource(resource.id);
              const enabledActions = permission.actions.length;
              const totalActions = actions.length;
              
              return (
                <div key={resource.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{resource.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      permission.scope === 'all' ? 'bg-green-100 text-green-800' :
                      permission.scope === 'own' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {permission.scope}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{resource.description}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {enabledActions}/{totalActions} actions enabled
                    </span>
                    <div className="flex space-x-1">
                      {permission.actions.slice(0, 3).map(action => (
                        <span key={action} className="inline-flex px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                          {action}
                        </span>
                      ))}
                      {permission.actions.length > 3 && (
                        <span className="inline-flex px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          +{permission.actions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
