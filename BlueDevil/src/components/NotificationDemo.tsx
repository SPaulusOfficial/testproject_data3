import React from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

export const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications();

  const createSampleNotifications = () => {
    // System notification
    addNotification({
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur at 2:00 AM tonight. Please save your work.',
      type: 'warning',
      priority: 'medium',
      metadata: {
        category: 'system',
        actionUrl: '/settings',
        actionText: 'View Details'
      }
    });

    // Project notification
    addNotification({
      title: 'Project Updated',
      message: 'Project "Salesforce Migration 2024" has been updated with new requirements.',
      type: 'info',
      priority: 'medium',
      projectId: 'project-1',
      metadata: {
        category: 'project',
        actionUrl: '/projects/project-1',
        actionText: 'View Project'
      }
    });

    // Workflow notification
    addNotification({
      title: 'Workflow Completed',
      message: 'Workflow "Data Migration Process" has been completed successfully.',
      type: 'success',
      priority: 'high',
      metadata: {
        category: 'workflow',
        actionUrl: '/workflows',
        actionText: 'View Results'
      }
    });

    // Agent error notification
    addNotification({
      title: 'Agent Error',
      message: 'AI Agent "Data Analysis Agent" encountered an error during processing.',
      type: 'error',
      priority: 'urgent',
      metadata: {
        category: 'agent',
        actionUrl: '/agents',
        actionText: 'Check Agent'
      }
    });

    // Action notification
    addNotification({
      title: 'Action Required',
      message: 'Please review and approve the new data model design for Project Alpha.',
      type: 'action',
      priority: 'high',
      projectId: 'project-2',
      metadata: {
        category: 'action',
        actionUrl: '/solution/data-modeling/design',
        actionText: 'Review Design'
      }
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-black mb-4">Notification System Demo</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the button below to create sample notifications and test the notification system.
      </p>
      <button 
        onClick={createSampleNotifications}
        className="inline-flex items-center justify-center px-6 h-11 rounded-full bg-digital-blue text-white font-bold shadow-sm transition hover:bg-deep-blue-2 focus:outline-none focus:ring-2 focus:ring-open-blue"
      >
        Create Sample Notifications
      </button>
    </div>
  );
};
