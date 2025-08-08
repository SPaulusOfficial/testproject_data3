import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useProject } from '@/contexts/ProjectContext';
import { NotificationItem } from './NotificationItem';
import { Trash2, CheckCheck, Bell } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAllAsRead, clearAll, isLoading } = useNotifications();
  const { currentProject } = useProject();

  // Filter notifications based on current project
  const filteredNotifications = notifications.filter(n => 
    !n.projectId || n.projectId === currentProject?.id
  );

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const getProjectName = (projectId: string) => {
    // This would be replaced with actual project lookup
    return projectId || 'Global';
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-black">Notifications</h3>
            <p className="text-sm text-gray-600">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              {currentProject && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {currentProject.name}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              className="p-2 text-gray-400 hover:text-digital-blue transition-colors"
              title="Mark all as read"
              disabled={filteredNotifications.length === 0}
            >
              <CheckCheck size={16} />
            </button>
            <button
              onClick={handleClearAll}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Clear all notifications"
              disabled={filteredNotifications.length === 0}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-digital-blue mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No notifications</p>
            <p className="text-sm text-gray-400 mt-1">
              {currentProject ? `No notifications for ${currentProject.name}` : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                projectName={notification.projectId ? getProjectName(notification.projectId) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
            <button
              onClick={onClose}
              className="text-digital-blue hover:text-deep-blue-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
