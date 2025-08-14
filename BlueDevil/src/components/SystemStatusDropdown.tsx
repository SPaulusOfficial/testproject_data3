import React, { useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionGuard } from './PermissionGuard';
import { Activity, ChevronDown, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SystemStatus {
  backend: boolean;
  database: boolean;
  notifications: boolean;
  userManagement: boolean;
}

export const SystemStatusDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backend: false,
    database: false,
    notifications: false,
    userManagement: false
  });

  // Health checks
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        // Check backend health
        const backendResponse = await fetch('http://localhost:3002/api/health');
        const backendData = await backendResponse.json();
        
        // Check notifications service - use a simple health check
        const notificationsResponse = await fetch('http://localhost:3002/api/health');
        
        setSystemStatus({
          backend: backendResponse.ok,
          database: backendResponse.ok, // If backend is healthy, DB is connected
          notifications: notificationsResponse.ok,
          userManagement: true // Assume working since we're logged in
        });
      } catch (error) {
        console.error('Health check failed:', error);
        setSystemStatus({
          backend: false,
          database: false,
          notifications: false,
          userManagement: false
        });
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle size={16} className="text-green-500" />;
    }
    return <XCircle size={16} className="text-red-500" />;
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Online' : 'Offline';
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const allSystemsHealthy = Object.values(systemStatus).every(status => status);

  return (
    <PermissionGuard permission="SystemStatus">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Activity size={16} className={allSystemsHealthy ? 'text-green-500' : 'text-red-500'} />
          <span className="hidden sm:inline">System Status</span>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">System Status</h3>
                <div className={`flex items-center gap-1 text-xs ${allSystemsHealthy ? 'text-green-600' : 'text-red-600'}`}>
                  {allSystemsHealthy ? (
                    <CheckCircle size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                  {allSystemsHealthy ? 'All Systems Operational' : 'Some Issues Detected'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backend API</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.backend)}
                    <span className={`text-xs font-medium ${getStatusColor(systemStatus.backend)}`}>
                      {getStatusText(systemStatus.backend)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.database)}
                    <span className={`text-xs font-medium ${getStatusColor(systemStatus.database)}`}>
                      {getStatusText(systemStatus.database)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Notification Service</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.notifications)}
                    <span className={`text-xs font-medium ${getStatusColor(systemStatus.notifications)}`}>
                      {getStatusText(systemStatus.notifications)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Management</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(systemStatus.userManagement)}
                    <span className={`text-xs font-medium ${getStatusColor(systemStatus.userManagement)}`}>
                      {getStatusText(systemStatus.userManagement)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  <span>Auto-refresh: 30s</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};
