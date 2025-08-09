import React from 'react';
import { useUserManagement } from '../../contexts/UserManagementContext';
import { User } from '../../types/User';

export const UserManagementDashboard: React.FC = () => {
  const { users, isLoading } = useUserManagement();

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const adminUsers = users.filter(user => user.globalRole === 'admin').length;
  const usersWith2FA = users.filter(user => user.security?.twoFactorEnabled).length;
  const usersWithCustomData = users.filter(user => Object.keys(user.customData || {}).length > 0).length;

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentActivity = users.filter(user => 
    user.metadata.lastModified && new Date(user.metadata.lastModified) > sevenDaysAgo
  ).length;

  // Get users by role
  const usersByRole = users.reduce((acc, user) => {
    acc[user.globalRole] = (acc[user.globalRole] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get most common custom data keys
  const customDataKeys = users.reduce((acc, user) => {
    Object.keys(user.customData).forEach(key => {
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topCustomDataKeys = Object.entries(customDataKeys)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; color?: string }> = ({ 
    title, 
    value, 
    subtitle, 
    color = 'blue' 
  }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management Overview</h2>
        <p className="text-gray-600 mt-1">Key metrics and statistics for user management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtitle="All registered users"
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          subtitle={`${((activeUsers / totalUsers) * 100).toFixed(1)}% of total`}
          color="green"
        />
        <StatCard
          title="Admin Users"
          value={adminUsers}
          subtitle={`${((adminUsers / totalUsers) * 100).toFixed(1)}% of total`}
          color="red"
        />
        <StatCard
          title="2FA Enabled"
          value={usersWith2FA}
          subtitle={`${((usersWith2FA / totalUsers) * 100).toFixed(1)}% of total`}
          color="purple"
        />
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Roles Distribution</h3>
          <div className="space-y-3">
            {Object.entries(usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(count / totalUsers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Data Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Data Usage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Users with Custom Data</span>
              <span className="text-sm text-gray-600">{usersWithCustomData}</span>
            </div>
            {topCustomDataKeys.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Most Common Custom Fields:</p>
                <div className="space-y-2">
                  {topCustomDataKeys.map(([key, count]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{key}</span>
                      <span className="text-gray-900 font-medium">{count} users</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity (Last 7 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{recentActivity}</div>
            <div className="text-sm text-gray-600">Users Modified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{inactiveUsers}</div>
            <div className="text-sm text-gray-600">Inactive Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(user => user.projectMemberships.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Users in Projects</div>
          </div>
        </div>
      </div>

      {/* Security Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Enabled</span>
                <span className="text-sm font-medium text-green-600">{usersWith2FA}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disabled</span>
                <span className="text-sm font-medium text-red-600">{totalUsers - usersWith2FA}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">User Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-sm font-medium text-green-600">{activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inactive</span>
                <span className="text-sm font-medium text-red-600">{inactiveUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
