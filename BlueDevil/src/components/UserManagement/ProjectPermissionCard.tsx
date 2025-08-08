import React from 'react';
import { Permission } from '../../types/User';

interface ProjectPermissionCardProps {
  permissions: Permission[];
  role: string;
  projectName: string;
  onPermissionsChange?: (permissions: Permission[]) => void;
  isEditable?: boolean;
}

export const ProjectPermissionCard: React.FC<ProjectPermissionCardProps> = ({ 
  permissions, 
  role, 
  projectName,
  onPermissionsChange,
  isEditable = false
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800 border-red-200';
      case 'admin': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'member': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return '👑';
      case 'admin': return '⚡';
      case 'member': return '👤';
      case 'viewer': return '👁️';
      default: return '👤';
    }
  };

  const getPermissionIcon = (resource: string) => {
    switch (resource) {
      case 'projects': return '📋';
      case 'agents': return '🤖';
      case 'workflows': return '⚡';
      case 'data': return '📊';
      case 'users': return '👥';
      case 'reports': return '📈';
      case 'settings': return '⚙️';
      case 'files': return '📁';
      default: return '📄';
    }
  };

  const getPermissionColor = (resource: string) => {
    switch (resource) {
      case 'projects': return 'bg-blue-50 text-blue-700';
      case 'agents': return 'bg-purple-50 text-purple-700';
      case 'workflows': return 'bg-green-50 text-green-700';
      case 'data': return 'bg-orange-50 text-orange-700';
      case 'users': return 'bg-red-50 text-red-700';
      case 'reports': return 'bg-indigo-50 text-indigo-700';
      case 'settings': return 'bg-gray-50 text-gray-700';
      case 'files': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getActionIcons = (actions: string[]) => {
    const actionIcons: Record<string, string> = {
      read: '👁️',
      write: '✏️',
      delete: '🗑️',
      execute: '▶️',
      approve: '✅',
      export: '📤'
    };
    
    return actions.map(action => actionIcons[action] || action).join(' ');
  };

  const getScopeBadge = (scope: string) => {
    switch (scope) {
      case 'all': return { text: 'All', color: 'bg-green-100 text-green-800' };
      case 'own': return { text: 'Own', color: 'bg-blue-100 text-blue-800' };
      case 'none': return { text: 'None', color: 'bg-gray-100 text-gray-800' };
      default: return { text: scope, color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getRoleIcon(role)}</div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{projectName}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role)}`}>
                {role}
              </span>
            </div>
          </div>
          {isEditable && (
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {permissions.map((permission) => (
            <div key={permission.resource} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getPermissionIcon(permission.resource)}</span>
                <div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {permission.resource}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getActionIcons(permission.actions)}
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPermissionColor(permission.resource)}`}>
                {getScopeBadge(permission.scope).text}
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {permissions.length} resources • {permissions.reduce((sum, p) => sum + p.actions.length, 0)} permissions
            </span>
            <span>
              {permissions.filter(p => p.scope === 'all').length} full access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
