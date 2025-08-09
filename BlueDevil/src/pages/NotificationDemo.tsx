import React, { useState, useEffect } from 'react';
import { NotificationDemo } from '@/components/NotificationDemo';
import LoginForm from '@/components/LoginForm';
import { NotificationService } from '@/services/NotificationService';

export const NotificationDemoPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const notificationService = NotificationService.getInstance();
      if (notificationService.isAuthenticated()) {
        const userResponse = await notificationService.getCurrentUser();
        setCurrentUser(userResponse.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    const notificationService = NotificationService.getInstance();
    notificationService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Notification System Demo
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.username} ({currentUser?.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Test the notification system with database persistence and authentication. The system will automatically 
            create the database tables if they don't exist and store notifications permanently.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <NotificationDemo />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Database Configuration</h4>
                                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Host: {process.env.DB_HOST || import.meta.env.VITE_DB_HOST || 'Not configured'}</div>
                    <div>Port: {process.env.DB_PORT || import.meta.env.VITE_DB_PORT || 'Not configured'}</div>
                    <div>Database: {process.env.DB_NAME || import.meta.env.VITE_DB_NAME || 'Not configured'}</div>
                    <div>User: {process.env.DB_USER || import.meta.env.VITE_DB_USER || 'Not configured'}</div>
                    <div>SSL: {process.env.DB_SSL_MODE || import.meta.env.VITE_DB_SSL_MODE || 'Not configured'}</div>
                  </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Settings</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Polling Interval: {process.env.NOTIFICATION_POLLING_INTERVAL_MS || '10000'}ms</div>
                  <div>Full Refresh: {process.env.NOTIFICATION_FULL_REFRESH_INTERVAL_MS || '3600000'}ms</div>
                  <div>Retention: {process.env.NOTIFICATION_RETENTION_DAYS || '30'} days</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Database persistence</li>
                  <li>✅ Automatic table creation</li>
                  <li>✅ Real-time polling</li>
                  <li>✅ Project-specific notifications</li>
                  <li>✅ Priority levels</li>
                  <li>✅ Mark as read/unread</li>
                  <li>✅ Delete notifications</li>
                  <li>✅ Bulk operations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Test</h3>
          <ol className="text-sm text-blue-800 space-y-2">
            <li>1. Click the bell icon in the header to open the notification dropdown</li>
            <li>2. Use the demo buttons to create different types of notifications</li>
            <li>3. Test marking notifications as read and deleting them</li>
            <li>4. Switch between projects to see project-specific filtering</li>
            <li>5. Check the browser console for database connection logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
