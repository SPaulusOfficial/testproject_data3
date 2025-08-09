import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Activity, TrendingUp } from 'lucide-react';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  loginActivity: {
    today: number;
    yesterday: number;
    last30Days: number;
  };
}

export const UserOverview: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    loginActivity: {
      today: 0,
      yesterday: 0,
      last30Days: 0
    }
  });
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Please log in to view user statistics');
        return;
      }
      
      const response = await fetch('http://localhost:3002/api/users/stats', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Stats fetch error:', errorData);
        
        if (response.status === 403) {
          setError('Admin access required to view user statistics');
        } else if (response.status === 401) {
          setError('Please log in to view user statistics');
        } else {
          setError(`Failed to fetch user statistics: ${errorData.error || response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Failed to fetch user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Activity Graph */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Login Activity</h3>
              <p className="text-sm text-gray-600">User activity over time</p>
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.loginActivity.today}
            </div>
            <div className="text-sm text-gray-600">Today</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.loginActivity.today / Math.max(stats.totalUsers, 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Yesterday */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.loginActivity.yesterday}
            </div>
            <div className="text-sm text-gray-600">Yesterday</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.loginActivity.yesterday / Math.max(stats.totalUsers, 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Last 30 Days */}
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.loginActivity.last30Days}
            </div>
            <div className="text-sm text-gray-600">Last 30 Days</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((stats.loginActivity.last30Days / Math.max(stats.totalUsers * 30, 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Active Rate</div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Avg Daily Logins</div>
              <div className="text-lg font-semibold text-gray-900">
                {Math.round(stats.loginActivity.last30Days / 30)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
