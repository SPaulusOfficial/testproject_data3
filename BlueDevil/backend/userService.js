const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

class UserService {
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
  // AUTHENTICATION METHODS
  // =====================================================

  async authenticateUser(emailOrUsername, password) {
    const client = await this.pool.connect();
    try {
      // Get user with password hash
      const result = await client.query(
        `SELECT * FROM users WHERE (email = $1 OR username = $1) AND is_active = true`,
        [emailOrUsername]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Check if account is locked
      if (user.locked_until && new Date() < user.locked_until) {
        throw new Error('Account is temporarily locked');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        await this.handleFailedLogin(client, user.id);
        throw new Error('Invalid password');
      }

      // Reset failed login attempts on successful login
      await this.resetFailedLoginAttempts(client, user.id);

      // Update last login
      await client.query(
        `UPDATE users SET last_login = NOW() WHERE id = $1`,
        [user.id]
      );

      // Get user's project memberships
      const memberships = await this.getUserProjectMemberships(user.id);

      // Generate JWT token
      const token = this.generateToken(user, memberships);

      // Log successful login
      try {
        await this.logAuditEvent(client, {
          userId: user.id,
          action: 'user_login_success',
          details: { email: user.email },
          severity: 'info',
          category: 'authentication'
        });
      } catch (error) {
        console.error('Failed to log audit event:', error);
      }

      return {
        user: this.sanitizeUser(user),
        token,
        memberships
      };

    } finally {
      client.release();
    }
  }

  async handleFailedLogin(client, userId) {
    // Increment failed login attempts
    await client.query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1`,
      [userId]
    );

    // Check if account should be locked
    const result = await client.query(
      `SELECT failed_login_attempts FROM users WHERE id = $1`,
      [userId]
    );

    const failedAttempts = result.rows[0].failed_login_attempts;
    if (failedAttempts >= 5) {
      // Lock account for 15 minutes
      const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await client.query(
        `UPDATE users SET locked_until = $1 WHERE id = $2`,
        [lockUntil, userId]
      );
    }
  }

  async resetFailedLoginAttempts(client, userId) {
    await client.query(
      `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
      [userId]
    );
  }

  generateToken(user, memberships) {
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      globalRole: user.global_role,
      memberships: memberships
    };
    
    return jwt.sign(payload, 'your-secret-key', { expiresIn: '24h' });
  }

  async getUserProjectMemberships(userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT pm.*, p.name as project_name, p.slug as project_slug
         FROM project_memberships pm
         JOIN projects p ON pm.project_id = p.id
         WHERE pm.user_id = $1`,
        [userId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  // =====================================================
  // USER MANAGEMENT METHODS
  // =====================================================

  async createUser(userData, createdBy) {
    const client = await this.pool.connect();
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      const result = await client.query(
        `INSERT INTO users (
          email, username, password_hash, first_name, last_name, 
          global_role, is_active, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          userData.email,
          userData.username,
          passwordHash,
          userData.first_name,
          userData.last_name,
          userData.global_role || 'user',
          userData.is_active !== false,
          createdBy
        ]
      );

      const user = result.rows[0];

      // Log user creation
      await this.logAuditEvent(client, {
        userId: createdBy,
        action: 'user_created',
        details: { email: userData.email, username: userData.username },
        severity: 'info',
        category: 'user_management'
      });

      return this.sanitizeUser(user);
    } finally {
      client.release();
    }
  }

  async updateUser(userId, updateData, updatedBy) {
    const client = await this.pool.connect();
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      // Build dynamic update query
      if (updateData.email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(updateData.email);
      }
      if (updateData.username !== undefined) {
        updates.push(`username = $${paramCount++}`);
        values.push(updateData.username);
      }
      if (updateData.first_name !== undefined) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(updateData.first_name);
      }
      if (updateData.last_name !== undefined) {
        updates.push(`last_name = $${paramCount++}`);
        values.push(updateData.last_name);
      }
      if (updateData.global_role !== undefined) {
        updates.push(`global_role = $${paramCount++}`);
        values.push(updateData.global_role);
      }
      if (updateData.is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(updateData.is_active);
      }
      if (updateData.settings !== undefined) {
        updates.push(`settings = $${paramCount++}`);
        values.push(JSON.stringify(updateData.settings));
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push(`updated_at = NOW()`);
      values.push(userId, updatedBy);

      const result = await client.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount++} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Log user update
      await this.logAuditEvent(client, {
        userId: updatedBy,
        action: 'user_updated',
        resourceType: 'user',
        resourceId: userId,
        details: { updatedFields: Object.keys(updateData) },
        severity: 'info',
        category: 'user_management'
      });

      return this.sanitizeUser(user);
    } finally {
      client.release();
    }
  }

  async deleteUser(userId, deletedBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `UPDATE users SET is_active = false, deleted_at = NOW() WHERE id = $1 RETURNING *`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Log user deletion
      await this.logAuditEvent(client, {
        userId: deletedBy,
        action: 'user_deleted',
        resourceType: 'user',
        resourceId: userId,
        severity: 'warning',
        category: 'user_management'
      });

      return this.sanitizeUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getAllUsers() {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC`
      );
      return result.rows.map(user => this.sanitizeUser(user));
    } finally {
      client.release();
    }
  }

  async getUserById(userId) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM users WHERE id = $1 AND is_active = true`,
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return this.sanitizeUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async addUserToProject(userId, projectId, role, addedBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO project_memberships (user_id, project_id, role, added_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, projectId, role, addedBy]
      );

      // Log project membership addition
      await this.logAuditEvent(client, {
        userId: addedBy,
        action: 'user_added_to_project',
        projectId: projectId,
        resourceType: 'project_membership',
        resourceId: result.rows[0].id,
        details: { targetUserId: userId, role: role },
        severity: 'info',
        category: 'project_management'
      });

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async removeUserFromProject(userId, projectId, removedBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM project_memberships WHERE user_id = $1 AND project_id = $2 RETURNING *`,
        [userId, projectId]
      );

      if (result.rows.length === 0) {
        throw new Error('Project membership not found');
      }

      // Log project membership removal
      await this.logAuditEvent(client, {
        userId: removedBy,
        action: 'user_removed_from_project',
        projectId: projectId,
        resourceType: 'project_membership',
        details: { targetUserId: userId },
        severity: 'info',
        category: 'project_management'
      });

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async updateUserCustomData(userId, customData, updatedBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `UPDATE users SET custom_data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [JSON.stringify(customData), userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // Log custom data update
      await this.logAuditEvent(client, {
        userId: updatedBy,
        action: 'user_custom_data_updated',
        resourceType: 'user',
        resourceId: userId,
        details: { customDataKeys: Object.keys(customData) },
        severity: 'info',
        category: 'user_management'
      });

      return this.sanitizeUser(result.rows[0]);
    } finally {
      client.release();
    }
  }

  sanitizeUser(user) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      global_role: user.global_role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login,
      settings: user.settings ? (typeof user.settings === 'string' ? JSON.parse(user.settings) : user.settings) : {},
      custom_data: user.custom_data ? (typeof user.custom_data === 'string' ? JSON.parse(user.custom_data) : user.custom_data) : {}
    };
  }

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
          eventData.details ? JSON.stringify(eventData.details) : null,
          eventData.severity || 'info',
          eventData.category || null
        ]
      );
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new UserService();
