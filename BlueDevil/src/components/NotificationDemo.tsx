import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';

export const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const { activeProjectId, projects } = useProject();
  
  const currentProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

  const createSampleNotification = (type: 'info' | 'success' | 'warning' | 'error' | 'action', priority: 'low' | 'medium' | 'high' | 'urgent') => {
    if (!user) return;

    const notifications = [
      {
        title: 'Project Update Available',
        message: 'A new update has been released for your current project. Please review the changes.',
        type: 'info' as const,
        priority: 'medium' as const,
        metadata: {
          actionUrl: '/projects',
          actionText: 'View Project',
          category: 'project'
        }
      },
      {
        title: 'Workflow Completed Successfully',
        message: 'The data processing workflow has completed successfully. All tasks are now finished.',
        type: 'success' as const,
        priority: 'high' as const,
        metadata: {
          actionUrl: '/workflows',
          actionText: 'View Results',
          category: 'workflow'
        }
      },
      {
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur tomorrow at 2:00 AM. Expect 30 minutes of downtime.',
        type: 'warning' as const,
        priority: 'medium' as const,
        metadata: {
          actionUrl: '/settings',
          actionText: 'View Details',
          category: 'system'
        }
      },
      {
        title: 'Agent Error Detected',
        message: 'The AI agent encountered an error while processing your request. Please try again.',
        type: 'error' as const,
        priority: 'urgent' as const,
        metadata: {
          actionUrl: '/agents',
          actionText: 'Check Agent',
          category: 'agent'
        }
      },
      {
        title: 'New Feature Available',
        message: 'Advanced analytics dashboard is now available. Explore new insights and metrics.',
        type: 'action' as const,
        priority: 'high' as const,
        metadata: {
          actionUrl: '/analytics',
          actionText: 'Explore Now',
          category: 'feature'
        }
      }
    ];

    const notification = notifications.find(n => n.type === type && n.priority === priority) || notifications[0];
    
    addNotification({
      userId: user.id,
      projectId: currentProject?.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      isRead: false,
      isDeleted: false,
      metadata: notification.metadata
    });
  };

  const createProjectSpecificNotification = () => {
    if (!user || !currentProject) return;

    addNotification({
      userId: user.id,
      projectId: currentProject.id,
      title: `${currentProject.name} - Milestone Reached`,
      message: `Congratulations! You've reached a major milestone in the ${currentProject.name} project.`,
      type: 'success',
      priority: 'high',
      isRead: false,
      isDeleted: false,
      metadata: {
        actionUrl: `/projects/${currentProject.id}`,
        actionText: 'View Project',
        category: 'milestone'
      }
    });
  };

  const createGlobalNotification = () => {
    if (!user) return;

    addNotification({
      userId: user.id,
      title: 'Platform Update',
      message: 'The Salesfive AI Platform has been updated with new features and improvements.',
      type: 'info',
      priority: 'medium',
      isRead: false,
      isDeleted: false,
      metadata: {
        actionUrl: '/changelog',
        actionText: 'View Changes',
        category: 'platform'
      }
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Demo</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Create Sample Notifications</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => createSampleNotification('info', 'medium')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Info Notification
            </button>
            <button
              onClick={() => createSampleNotification('success', 'high')}
              className="px-4 py-2 text-sm border border-green-300 rounded-md text-green-600 hover:bg-green-50 transition-colors"
            >
              Success Notification
            </button>
            <button
              onClick={() => createSampleNotification('warning', 'medium')}
              className="px-4 py-2 text-sm border border-yellow-300 rounded-md text-yellow-600 hover:bg-yellow-50 transition-colors"
            >
              Warning Notification
            </button>
            <button
              onClick={() => createSampleNotification('error', 'urgent')}
              className="px-4 py-2 text-sm border border-red-300 rounded-md text-red-600 hover:bg-red-50 transition-colors"
            >
              Error Notification
            </button>
            <button
              onClick={() => createSampleNotification('action', 'high')}
              className="px-4 py-2 text-sm border border-blue-300 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Action Notification
            </button>
          </div>
        </div>

        {currentProject && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Project-Specific Notifications</h4>
            <button
              onClick={createProjectSpecificNotification}
              className="px-4 py-2 text-sm border border-purple-300 rounded-md text-purple-600 hover:bg-purple-50 transition-colors"
            >
              Create {currentProject.name} Notification
            </button>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Global Notifications</h4>
                      <button
              onClick={createGlobalNotification}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Create Global Notification
            </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Click the bell icon in the header to view your notifications. 
            Notifications are stored in the database and will persist between sessions.
          </p>
        </div>
      </div>
    </div>
  );
};
