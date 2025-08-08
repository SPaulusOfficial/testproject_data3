import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Info, 
  X, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import dayjs from 'dayjs';

interface NotificationItemProps {
  notification: Notification;
  projectName?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  projectName
}) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': 
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning': 
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error': 
        return <XCircle size={16} className="text-red-500" />;
      case 'action': 
        return <Zap size={16} className="text-blue-500" />;
      default: 
        return <Info size={16} className="text-gray-500" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Medium';
    }
  };

  const handleMarkAsRead = async () => {
    await markAsRead(notification.id);
  };

  const handleDelete = async () => {
    await deleteNotification(notification.id);
  };

  const formatTimeAgo = (date: Date) => {
    return dayjs(date).fromNow();
  };

  return (
    <div 
      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getTypeIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-black leading-tight">
                {notification.title}
              </h4>
              {projectName && (
                <span className="inline-block text-xs text-gray-500 mt-1">
                  Project: {projectName}
                </span>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-1 ml-2">
              {!notification.isRead && (
                <button 
                  onClick={handleMarkAsRead}
                  className="text-xs text-digital-blue hover:text-deep-blue-2 transition-colors"
                  title="Mark as read"
                >
                  Mark read
                </button>
              )}
              <button 
                onClick={handleDelete}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Delete notification"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {notification.message}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{formatTimeAgo(notification.createdAt)}</span>
              </span>
              
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getPriorityLabel(notification.priority)}
              </span>
            </div>

            {/* Action Link */}
            {notification.metadata?.actionUrl && (
              <a 
                href={notification.metadata.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-digital-blue hover:text-deep-blue-2 flex items-center space-x-1 transition-colors"
              >
                <span>{notification.metadata.actionText || 'View'}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
