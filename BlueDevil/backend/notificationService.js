const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

class NotificationService {
  constructor() {
    this.pool = null;
    this.initializePool();
  }

  async initializePool() {
    if (!this.pool) {
      this.pool = new Pool({
        host: process.env.VITE_DB_HOST || process.env.DB_HOST,
        port: process.env.VITE_DB_PORT || process.env.DB_PORT,
        database: process.env.VITE_DB_NAME || process.env.DB_NAME,
        user: process.env.VITE_DB_USER || process.env.DB_USER,
        password: process.env.VITE_DB_PASSWORD || process.env.DB_PASSWORD,
        ssl: process.env.VITE_DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false
      });
    }
  }

  // =====================================================
  // NOTIFICATION CREATION METHODS
  // =====================================================

  async createNotification(notificationData, createdBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO notifications (
          user_id, project_id, title, message, type, priority, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          notificationData.userId,
          notificationData.projectId || null,
          notificationData.title,
          notificationData.message,
          notificationData.type || 'info',
          notificationData.priority || 'medium',
          JSON.stringify(notificationData.metadata || {})
        ]
      );

      // Log notification creation
      await this.logAuditEvent(client, {
        userId: createdBy,
        projectId: notificationData.projectId,
        action: 'notification_created',
        resourceType: 'notification',
        resourceId: result.rows[0].id,
        details: { 
          targetUserId: notificationData.userId,
          title: notificationData.title,
          type: notificationData.type 
        },
        severity: 'info',
        category: 'notification'
      });

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Create notification for user based on their settings
  async createUserNotification(userId, notificationData, createdBy) {
    const client = await this.pool.connect();
    try {
      // Get user's notification settings
      const userResult = await client.query(
        `SELECT settings FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userSettings = userResult.rows[0].settings || {};
      const notificationSettings = userSettings.notifications || {};

      // Check if user has enabled notifications
      if (notificationSettings.inApp !== false) {
        // Create in-app notification
        const result = await client.query(
          `INSERT INTO notifications (
            user_id, project_id, title, message, type, priority, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            userId,
            notificationData.projectId || null,
            notificationData.title,
            notificationData.message,
            notificationData.type || 'info',
            notificationData.priority || 'medium',
            JSON.stringify({
              ...notificationData.metadata,
              source: 'system',
              createdBy: createdBy
            })
          ]
        );

        // Log notification creation
        await this.logAuditEvent(client, {
          userId: createdBy,
          projectId: notificationData.projectId,
          action: 'user_notification_created',
          resourceType: 'notification',
          resourceId: result.rows[0].id,
          details: { 
            targetUserId: userId,
            title: notificationData.title,
            type: notificationData.type 
          },
          severity: 'info',
          category: 'notification'
        });

        return result.rows[0];
      }

      return null; // User has disabled notifications
    } finally {
      client.release();
    }
  }

  // Create system-wide notification for all users
  async createSystemNotification(notificationData, createdBy) {
    const client = await this.pool.connect();
    try {
      // Get all active users
      const usersResult = await client.query(
        `SELECT id, settings FROM users WHERE is_active = true`
      );

      const notifications = [];
      for (const user of usersResult.rows) {
        const userSettings = user.settings || {};
        const notificationSettings = userSettings.notifications || {};

        // Check if user has enabled system notifications
        if (notificationSettings.inApp !== false) {
          const result = await client.query(
            `INSERT INTO notifications (
              user_id, project_id, title, message, type, priority, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [
              user.id,
              notificationData.projectId || null,
              notificationData.title,
              notificationData.message,
              notificationData.type || 'info',
              notificationData.priority || 'medium',
              JSON.stringify({
                ...notificationData.metadata,
                source: 'system',
                createdBy: createdBy,
                systemNotification: true
              })
            ]
          );

          notifications.push(result.rows[0]);
        }
      }

      // Log system notification creation
      await this.logAuditEvent(client, {
        userId: createdBy,
        action: 'system_notification_created',
        resourceType: 'notification',
        details: { 
          title: notificationData.title,
          type: notificationData.type,
          recipientsCount: notifications.length
        },
        severity: 'info',
        category: 'notification'
      });

      return notifications;
    } finally {
      client.release();
    }
  }

  // =====================================================
  // NOTIFICATION RETRIEVAL METHODS
  // =====================================================

  async getUserNotifications(userId, projectId = null, limit = 50, offset = 0) {
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT * FROM notifications 
        WHERE user_id = $1 AND is_deleted = false
      `;
      let params = [userId];
      let paramCount = 1;

      if (projectId) {
        paramCount++;
        query += ` AND project_id = $${paramCount}`;
        params.push(projectId);
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getUnreadNotifications(userId, projectId = null) {
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT * FROM notifications 
        WHERE user_id = $1 AND is_read = false AND is_deleted = false
      `;
      let params = [userId];

      if (projectId) {
        query += ` AND project_id = $2`;
        params.push(projectId);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getUnreadCount(userId, projectId = null) {
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT COUNT(*) as count FROM notifications 
        WHERE user_id = $1 AND is_read = false AND is_deleted = false
      `;
      let params = [userId];

      if (projectId) {
        query += ` AND project_id = $2`;
        params.push(projectId);
      }

      const result = await client.query(query, params);
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }

  // =====================================================
  // NOTIFICATION UPDATE METHODS
  // =====================================================

  async markAsRead(notificationId, userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `UPDATE notifications 
         SET is_read = true, read_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }

      // Log notification read
      await this.logAuditEvent(client, {
        userId,
        action: 'notification_marked_read',
        resourceType: 'notification',
        resourceId: notificationId,
        details: { notificationId },
        severity: 'info',
        category: 'notification'
      });

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async markAllAsRead(userId, projectId = null) {
    const client = await this.pool.connect();
    try {
      let query = `
        UPDATE notifications 
        SET is_read = true, read_at = NOW()
        WHERE user_id = $1 AND is_read = false AND is_deleted = false
      `;
      let params = [userId];

      if (projectId) {
        query += ` AND project_id = $2`;
        params.push(projectId);
      }

      const result = await client.query(query, params);

      // Log bulk read action
      await this.logAuditEvent(client, {
        userId,
        projectId,
        action: 'notifications_marked_all_read',
        details: { 
          updatedCount: result.rowCount,
          projectId: projectId || 'all'
        },
        severity: 'info',
        category: 'notification'
      });

      return { updated: result.rowCount };
    } finally {
      client.release();
    }
  }

  async deleteNotification(notificationId, userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `UPDATE notifications 
         SET is_deleted = true, deleted_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }

      // Log notification deletion
      await this.logAuditEvent(client, {
        userId,
        action: 'notification_deleted',
        resourceType: 'notification',
        resourceId: notificationId,
        details: { notificationId },
        severity: 'info',
        category: 'notification'
      });

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteAllNotifications(userId, projectId = null) {
    const client = await this.pool.connect();
    try {
      let query = `
        UPDATE notifications 
        SET is_deleted = true, deleted_at = NOW()
        WHERE user_id = $1 AND is_deleted = false
      `;
      let params = [userId];

      if (projectId) {
        query += ` AND project_id = $2`;
        params.push(projectId);
      }

      const result = await client.query(query, params);

      // Log bulk deletion
      await this.logAuditEvent(client, {
        userId,
        projectId,
        action: 'notifications_deleted_all',
        details: { 
          deletedCount: result.rowCount,
          projectId: projectId || 'all'
        },
        severity: 'warning',
        category: 'notification'
      });

      return { deleted: result.rowCount };
    } finally {
      client.release();
    }
  }

  // =====================================================
  // USER NOTIFICATION SETTINGS
  // =====================================================

  async getUserNotificationSettings(userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT settings FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const userSettings = result.rows[0].settings || {};
      return userSettings.notifications || {
        email: true,
        push: false,
        inApp: true,
        frequency: 'immediate'
      };
    } finally {
      client.release();
    }
  }

  async updateUserNotificationSettings(userId, notificationSettings, updatedBy) {
    const client = await this.pool.connect();
    try {
      // Get current user settings
      const userResult = await client.query(
        `SELECT settings FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentSettings = userResult.rows[0].settings || {};
      const updatedSettings = {
        ...currentSettings,
        notifications: notificationSettings
      };

      // Update user settings
      await client.query(
        `UPDATE users SET settings = $1 WHERE id = $2`,
        [JSON.stringify(updatedSettings), userId]
      );

      // Log settings update
      await this.logAuditEvent(client, {
        userId: updatedBy,
        action: 'notification_settings_updated',
        resourceType: 'user',
        resourceId: userId,
        details: { notificationSettings },
        severity: 'info',
        category: 'notification'
      });

      return updatedSettings;
    } finally {
      client.release();
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  async logAuditEvent(client, eventData) {
    try {
      await client.query(
        `SELECT log_audit_event($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          eventData.userId,
          eventData.action,
          eventData.projectId || null,
          eventData.resourceType || null,
          eventData.resourceId || null,
          JSON.stringify(eventData.details || {}),
          eventData.severity || 'info',
          eventData.category || null
        ]
      );
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // Clean up old notifications based on user settings
  async cleanupOldNotifications() {
    const client = await this.pool.connect();
    try {
      // Get users with retention settings
      const usersResult = await client.query(
        `SELECT id, settings FROM users WHERE is_active = true`
      );

      for (const user of usersResult.rows) {
        const userSettings = user.settings || {};
        const notificationSettings = userSettings.notifications || {};
        const retentionDays = notificationSettings.retentionDays || 30;

        // Delete notifications older than retention period
        await client.query(
          `DELETE FROM notifications 
           WHERE user_id = $1 AND created_at < NOW() - INTERVAL '${retentionDays} days'`,
          [user.id]
        );
      }

      console.log('Notification cleanup completed');
    } finally {
      client.release();
    }
  }
}

module.exports = new NotificationService();
