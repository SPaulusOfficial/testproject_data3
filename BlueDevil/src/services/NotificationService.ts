import { Notification } from '@/contexts/NotificationContext';

interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

function getApiConfig(): ApiConfig {
  const baseUrl = process.env.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';
  const timeout = parseInt(process.env.API_TIMEOUT || import.meta.env.VITE_API_TIMEOUT || '5000');

  return {
    baseUrl,
    timeout
  };
}

class ApiClient {
  private config: ApiConfig;
  private token: string | null = null;

  constructor() {
    this.config = getApiConfig();
    // Try to get token from localStorage
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const defaultOptions: RequestInit = {
      headers
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (response.status === 401) {
        // Token expired or invalid
        this.clearToken();
        throw new Error('Authentication required');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async patch(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// API-based NotificationService implementation
export class NotificationService {
  private static instance: NotificationService;
  private api: ApiClient;
  private pollingInterval: NodeJS.Timeout | null = null;
  private fullRefreshInterval: NodeJS.Timeout | null = null;
  private updateCallbacks: Array<(notifications: Notification[], unreadCount: number) => void> = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.api = new ApiClient();
    
    // Update token from AuthService
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      this.api.setToken(authToken);
    }
  }

  // Authentication methods
  async login(username: string, password: string): Promise<any> {
    try {
      const response = await this.api.post('/api/auth/login', { username, password });
      this.api.setToken(response.token);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<any> {
    try {
      return await this.api.get('/api/auth/me');
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  logout(): void {
    this.api.clearToken();
  }

  isAuthenticated(): boolean {
    return this.api.getToken() !== null;
  }

  async initialize(): Promise<void> {
    // Test API connection
    try {
      await this.api.get('/api/health');
      console.log('✅ API connection established');
    } catch (error) {
      console.error('❌ API connection failed:', error);
      throw new Error('Failed to connect to notification API');
    }
  }

  async getUserNotifications(userId: string, projectId?: string): Promise<Notification[]> {
    try {
      let endpoint = `/api/notifications`;
      if (projectId) {
        endpoint += `?projectId=${projectId}`;
      }

      const notifications = await this.api.get(endpoint);
      
      // Transform API response to Notification objects
      return notifications.map((notification: any) => ({
        id: notification.id.toString(),
        userId: notification.user_id,
        projectId: notification.project_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        isRead: notification.is_read,
        isDeleted: notification.is_deleted,
        createdAt: new Date(notification.created_at),
        readAt: notification.read_at ? new Date(notification.read_at) : undefined,
        deletedAt: notification.deleted_at ? new Date(notification.deleted_at) : undefined,
        metadata: notification.metadata || {}
      }));
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      throw new Error('Failed to load notifications');
    }
  }

  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    try {
      const response = await this.api.post('/api/notifications', {
        user_id: notification.userId,
        project_id: notification.projectId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        metadata: notification.metadata || {}
      });

      // Transform API response to Notification object
      const createdNotification: Notification = {
        id: response.id.toString(),
        userId: response.user_id,
        projectId: response.project_id,
        title: response.title,
        message: response.message,
        type: response.type,
        priority: response.priority,
        isRead: response.is_read,
        isDeleted: response.is_deleted,
        createdAt: new Date(response.created_at),
        readAt: response.read_at ? new Date(response.read_at) : undefined,
        deletedAt: response.deleted_at ? new Date(response.deleted_at) : undefined,
        metadata: response.metadata || {}
      };

      // Notify subscribers
      this.notifySubscribers();

      return createdNotification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    try {
      await this.api.patch(`/api/notifications/${notificationId}/read`, {
        is_read: true
      });
      
      // Notify subscribers
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      // Get all unread notifications for the user
      const notifications = await this.getUserNotifications(userId);
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      if (unreadNotifications.length > 0) {
        const notificationIds = unreadNotifications.map(n => n.id);
        
        await this.api.patch('/api/notifications/bulk', {
          userId,
          action: 'mark-read',
          notificationIds
        });
      }
      
      // Notify subscribers
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      await this.api.delete(`/api/notifications/${notificationId}`);
      
      // Notify subscribers
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  async clearAll(userId: string): Promise<void> {
    try {
      // Get all notifications for the user
      const notifications = await this.getUserNotifications(userId);
      const activeNotifications = notifications.filter(n => !n.isDeleted);
      
      if (activeNotifications.length > 0) {
        const notificationIds = activeNotifications.map(n => n.id);
        
        await this.api.patch('/api/notifications/bulk', {
          userId,
          action: 'delete',
          notificationIds
        });
      }
      
      // Notify subscribers
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      throw new Error('Failed to clear all notifications');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await this.api.get(`/api/notifications/${userId}/unread-count`);
      return response.unreadCount;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      throw new Error('Failed to get unread count');
    }
  }

  // Subscription management for real-time updates
  subscribe(callback: (notifications: Notification[], unreadCount: number) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  private async notifySubscribers(): Promise<void> {
    // This would be called when notifications change
    // For now, we'll just log that subscribers should be notified
    console.log('Notifying subscribers of notification changes');
  }

  startPolling(userId: string, onUpdate: (notifications: Notification[], unreadCount: number) => void): void {
    const pollingInterval = parseInt(process.env.NOTIFICATION_POLLING_INTERVAL_MS || import.meta.env.VITE_NOTIFICATION_POLLING_INTERVAL_MS || '10000');
    const fullRefreshInterval = parseInt(process.env.NOTIFICATION_FULL_REFRESH_INTERVAL_MS || import.meta.env.VITE_NOTIFICATION_FULL_REFRESH_INTERVAL_MS || '3600000');

    // Poll for new notifications every 10 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        const notifications = await this.getUserNotifications(userId);
        const unreadCount = await this.getUnreadCount(userId);
        onUpdate(notifications, unreadCount);
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, pollingInterval);

    // Full refresh every hour
    this.fullRefreshInterval = setInterval(async () => {
      try {
        const notifications = await this.getUserNotifications(userId);
        const unreadCount = await this.getUnreadCount(userId);
        onUpdate(notifications, unreadCount);
      } catch (error) {
        console.error('Full refresh failed:', error);
      }
    }, fullRefreshInterval);
  }

  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.fullRefreshInterval) {
      clearInterval(this.fullRefreshInterval);
      this.fullRefreshInterval = null;
    }
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
  }
}
