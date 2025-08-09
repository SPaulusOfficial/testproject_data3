import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useProject } from './ProjectContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export interface Notification {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'action';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  readAt?: Date;
  deletedAt?: Date;
  metadata?: {
    actionUrl?: string;
    actionText?: string;
    icon?: string;
    category?: string;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}

interface NotificationContextType extends NotificationState, NotificationActions {}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

import { NotificationService } from '@/services/NotificationService';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeProjectId, projects } = useProject();
  
  // Get current project from activeProjectId
  const currentProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  });

  const notificationService = NotificationService.getInstance();

  // Initialize the notification service
  useEffect(() => {
    notificationService.initialize().catch(error => {
      console.error('Failed to initialize notification service:', error);
    });
  }, []);

  const refreshNotifications = async () => {
    if (!user) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const notifications = await notificationService.getUserNotifications(user.id, currentProject?.id);
      const unreadCount = await notificationService.getUnreadCount(user.id);
      
      setState(prev => ({
        ...prev,
        notifications,
        unreadCount,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load notifications',
        isLoading: false
      }));
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      await notificationService.markAsRead(user.id, id);
      await refreshNotifications();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      }));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      await refreshNotifications();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
      }));
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    
    try {
      await notificationService.deleteNotification(user.id, id);
      await refreshNotifications();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete notification'
      }));
    }
  };

  const clearAll = async () => {
    if (!user) return;
    
    try {
      await notificationService.clearAll(user.id);
      await refreshNotifications();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clear all notifications'
      }));
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    notificationService.createNotification({
      ...notification,
      userId: user.id
    });
    refreshNotifications();
  };

  // Start polling when user is authenticated
  useEffect(() => {
    if (user && user.id) {
      console.log('🔔 Starting notification polling for user:', user.id);
      
      // Ensure notification service has the current token
      const token = localStorage.getItem('authToken');
      if (token) {
        console.log('🔔 Setting token for notification service');
        // Access the private api property and set token
        const apiClient = (notificationService as any).api;
        if (apiClient && typeof apiClient.setToken === 'function') {
          apiClient.setToken(token);
        }
      } else {
        console.warn('🔔 No auth token found in localStorage');
      }
      
      refreshNotifications();
      notificationService.startPolling(user.id, (notifications, unreadCount) => {
        setState(prev => ({
          ...prev,
          notifications,
          unreadCount
        }));
      });

      return () => {
        console.log('🔔 Stopping notification polling');
        notificationService.stopPolling();
      };
    } else {
      console.log('🔔 No user authenticated, skipping notification polling');
    }
  }, [user?.id, currentProject?.id]);

  const contextValue: NotificationContextType = {
    ...state,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications,
    addNotification
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
