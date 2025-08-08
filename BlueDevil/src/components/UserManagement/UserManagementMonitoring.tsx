import React, { useState, useEffect } from 'react';
import { User } from '../../types/User';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { PermissionService } from '../../services/PermissionService';

interface MonitoringEvent {
  id: string;
  timestamp: Date;
  type: 'login' | 'logout' | 'permission_change' | 'user_created' | 'user_updated' | 'user_deleted' | 'security_alert';
  userId: string;
  userName: string;
  details: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivities: number;
  usersWithWeakPasswords: number;
  inactiveUsers: number;
  usersWithout2FA: number;
}

export const UserManagementMonitoring: React.FC = () => {
  const { users } = useUserManagement();
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 0,
    suspiciousActivities: 0,
    usersWithWeakPasswords: 0,
    inactiveUsers: 0,
    usersWithout2FA: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Mock monitoring events
  const mockEvents: MonitoringEvent[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      type: 'login',
      userId: '1',
      userName: 'Stefan Paulus',
      details: 'Successful login from 192.168.1.100',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      type: 'permission_change',
      userId: '2',
      userName: 'John Doe',
      details: 'Role changed from member to admin in project CRM Implementation',
      severity: 'warning'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: 'security_alert',
      userId: '3',
      userName: 'Unknown User',
      details: 'Multiple failed login attempts from 203.0.113.0',
      severity: 'error',
      ipAddress: '203.0.113.0'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      type: 'user_created',
      userId: '4',
      userName: 'Jane Smith',
      details: 'New user account created by admin',
      severity: 'info'
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
    calculateSecurityMetrics();
  }, [users]);

  const calculateSecurityMetrics = () => {
    const metrics: SecurityMetrics = {
      failedLoginAttempts: users.reduce((sum, user) => sum + user.security.failedLoginAttempts, 0),
      suspiciousActivities: events.filter(e => e.severity === 'error' || e.severity === 'critical').length,
      usersWithWeakPasswords: 0, // Would need password strength checking
      inactiveUsers: users.filter(user => !user.isActive).length,
      usersWithout2FA: users.filter(user => !user.security.twoFactorEnabled).length
    };
    setSecurityMetrics(metrics);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'permission_change': return '🔑';
      case 'user_created': return '➕';
      case 'user_updated': return '✏️';
      case 'user_deleted': return '🗑️';
      case 'security_alert': return '⚠️';
      default: return '📝';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecentActivity = (hours: number = 24) => {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return events.filter(event => event.timestamp > cutoff);
  };

  const getPermissionDistribution = () => {
    const distribution = {
      owner: 0,
      admin: 0,
      member: 0,
      viewer: 0
    };

    users.forEach(user => {
      user.projectMemberships.forEach(membership => {
        distribution[membership.role as keyof typeof distribution]++;
      });
    });

    return distribution;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management Monitoring</h2>
        <p className="text-gray-600 mt-1">Real-time monitoring and security metrics</p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Failed Logins</p>
              <p className="text-2xl font-bold text-gray-900">{securityMetrics.failedLoginAttempts}</p>
            </div>
            <div className="text-2xl">🔒</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Suspicious Activities</p>
              <p className="text-2xl font-bold text-gray-900">{securityMetrics.suspiciousActivities}</p>
            </div>
            <div className="text-2xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{securityMetrics.inactiveUsers}</p>
            </div>
            <div className="text-2xl">😴</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Without 2FA</p>
              <p className="text-2xl font-bold text-gray-900">{securityMetrics.usersWithout2FA}</p>
            </div>
            <div className="text-2xl">🔐</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>
      </div>

      {/* Permission Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permission Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(getPermissionDistribution()).map(([role, count]) => (
            <div key={role} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity (Last 24 Hours)</h3>
        <div className="space-y-3">
          {getRecentActivity(24).map(event => (
            <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
              <div className="text-xl">{getEventIcon(event.type)}</div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{event.userName}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                    {event.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{event.details}</div>
                <div className="text-xs text-gray-500">
                  {event.timestamp.toLocaleString()}
                  {event.ipAddress && ` • IP: ${event.ipAddress}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Connection</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium text-gray-900">~120ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">{users.filter(u => u.security.lastLogin && new Date(u.security.lastLogin) > new Date(Date.now() - 1000 * 60 * 30)).length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security Alerts</h3>
          <div className="space-y-3">
            {events.filter(e => e.severity === 'error' || e.severity === 'critical').slice(0, 3).map(event => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded">
                <div className="text-red-500">⚠️</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-red-900">{event.details}</div>
                  <div className="text-xs text-red-700">{event.timestamp.toLocaleString()}</div>
                </div>
              </div>
            ))}
            {events.filter(e => e.severity === 'error' || e.severity === 'critical').length === 0 && (
              <div className="text-sm text-gray-500 italic">No security alerts</div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{events.length}</div>
            <div className="text-sm text-gray-600">Total Events (24h)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((users.filter(u => u.isActive).length / users.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((users.filter(u => u.security.twoFactorEnabled).length / users.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">2FA Adoption</div>
          </div>
        </div>
      </div>
    </div>
  );
};
