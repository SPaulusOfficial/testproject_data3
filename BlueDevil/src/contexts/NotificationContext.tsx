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

// Mock API service for now - will be replaced with real API calls
class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private fullRefreshInterval: NodeJS.Timeout | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getUserNotifications(userId: string, projectId?: string): Promise<Notification[]> {
    // Mock implementation - replace with real API call
    const filteredNotifications = this.notifications.filter(n => 
      n.userId === userId && 
      !n.isDeleted &&
      (!projectId || !n.projectId || n.projectId === projectId)
    );
    
    return filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      isRead: false,
      isDeleted: false
    };
    
    this.notifications.push(newNotification);
    return newNotification;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    this.notifications
      .filter(n => n.userId === userId && !n.isRead && !n.isDeleted)
      .forEach(n => {
        n.isRead = true;
        n.readAt = new Date();
      });
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notification) {
      notification.isDeleted = true;
      notification.deletedAt = new Date();
    }
  }

  async clearAll(userId: string): Promise<void> {
    this.notifications
      .filter(n => n.userId === userId && !n.isDeleted)
      .forEach(n => {
        n.isDeleted = true;
        n.deletedAt = new Date();
      });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifications.filter(n => 
      n.userId === userId && !n.isRead && !n.isDeleted
    ).length;
  }

  startPolling(userId: string, onUpdate: (notifications: Notification[], unreadCount: number) => void) {
    // Poll for new notifications every 10 seconds
    this.pollingInterval = setInterval(async () => {
      const notifications = await this.getUserNotifications(userId);
      const unreadCount = await this.getUnreadCount(userId);
      onUpdate(notifications, unreadCount);
    }, 10000);

    // Full refresh every hour
    this.fullRefreshInterval = setInterval(async () => {
      const notifications = await this.getUserNotifications(userId);
      const unreadCount = await this.getUnreadCount(userId);
      onUpdate(notifications, unreadCount);
    }, 3600000);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.fullRefreshInterval) {
      clearInterval(this.fullRefreshInterval);
      this.fullRefreshInterval = null;
    }
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  });

  const notificationService = NotificationService.getInstance();

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
    if (user) {
      refreshNotifications();
      notificationService.startPolling(user.id, (notifications, unreadCount) => {
        setState(prev => ({
          ...prev,
          notifications,
          unreadCount
        }));
      });

      return () => {
        notificationService.stopPolling();
      };
    }
  }, [user, currentProject?.id]);

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
