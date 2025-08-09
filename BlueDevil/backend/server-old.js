const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
// const sqlite3 = require('sqlite3').verbose(); // Not needed for PostgreSQL
const path = require('path');
const fs = require('fs');
const userService = require('./userService');
const projectService = require('./projectService');
const notificationService = require('./notificationService');
const permissionService = require('./permissionService');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.API_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = await userService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user.globalRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Project access middleware
async function requireProjectAccess(req, res, next) {
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  try {
    const hasAccess = await projectService.validateProjectAccess(
      req.user.userId, 
      projectId, 
      req.user.globalRole
    );
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to project' });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Access denied to project' });
  }
}

// Database connection
let pool = null;

async function getPool() {
  if (!pool) {
    const dbName = process.env.VITE_DB_NAME || process.env.DB_NAME || 'platform_db';
    pool = new Pool({
      host: process.env.VITE_DB_HOST || process.env.DB_HOST || 'localhost',
      port: process.env.VITE_DB_PORT || process.env.DB_PORT || 5434,
      database: dbName,
      user: process.env.VITE_DB_USER || process.env.DB_USER || 'cas_user',
      password: process.env.VITE_DB_PASSWORD || process.env.DB_PASSWORD || 'secure_password',
      ssl: process.env.VITE_DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false
    });
  }
  return pool;
}

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create initial pool to postgres database
          const initialPool = new Pool({
        host: process.env.VITE_DB_HOST || process.env.DB_HOST,
        port: process.env.VITE_DB_PORT || process.env.DB_PORT,
        database: 'postgres',
        user: process.env.VITE_DB_USER || process.env.DB_USER,
        password: process.env.VITE_DB_PASSWORD || process.env.DB_PASSWORD,
        ssl: process.env.VITE_DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false
      });
    
    const client = await initialPool.connect();
    
    // Create database if it doesn't exist
    const dbName = process.env.VITE_DB_NAME || process.env.DB_NAME || 'platform_db';
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`✅ Database '${dbName}' already exists`);
      } else {
        console.log(`Database '${dbName}' status: ${error.message}`);
      }
    }
    
    client.release();
    await initialPool.end();
    
    // Now connect to the specific database and run schema
    const appPool = new Pool({
      host: process.env.VITE_DB_HOST || process.env.DB_HOST,
      port: process.env.VITE_DB_PORT || process.env.DB_PORT,
      database: dbName,
      user: process.env.VITE_DB_USER || process.env.DB_USER,
      password: process.env.VITE_DB_PASSWORD || process.env.DB_PASSWORD,
      ssl: process.env.VITE_DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false
    });
    
    const appClient = await appPool.connect();
    
    // Run the complete database schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'database-schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split the schema into individual statements and execute them with error handling
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await appClient.query(statement);
          } catch (error) {
            // Ignore duplicate key errors for permission_definitions
            if (error.code === '23505' && error.table === 'permission_definitions') {
              console.log('ℹ️  Permission definitions already exist, skipping...');
            } else {
              console.log('⚠️  Statement failed:', error.message);
            }
          }
        }
      }
      
      console.log('✅ Database schema initialized successfully');
    } else {
      console.log('⚠️ Schema file not found, creating basic tables...');
      
      // Create basic tables if schema file doesn't exist
      await appClient.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          project_id VARCHAR(255),
          title VARCHAR(500) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT 'info',
          priority VARCHAR(50) NOT NULL DEFAULT 'medium',
          metadata JSONB,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          read_at TIMESTAMP WITH TIME ZONE,
          deleted_at TIMESTAMP WITH TIME ZONE
        )
      `);
    }

    // Create indexes
    await appClient.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_project_id ON notifications(project_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_deleted ON notifications(is_deleted);
    `);

    appClient.release();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// API Routes

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await userService.authenticateUser(username, password);

    res.json({
      message: 'Login successful',
      token: result.token,
      user: result.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

// Get all notifications for a user
app.get('/api/notifications/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { projectId } = req.query;
    const currentUser = req.user;
    
    // Check if user is accessing their own notifications or is admin
    if (currentUser.userId !== userId && currentUser.globalRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = $1 AND is_deleted = FALSE
    `;
    let params = [userId];
    
    if (projectId) {
      query += ` AND (project_id = $2 OR project_id IS NULL)`;
      params.push(projectId);
    }
    
    query += ` ORDER BY created_at DESC LIMIT 100`;
    
    const dbPool = await getPool();
    const result = await dbPool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create a new notification
app.post('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const { user_id, project_id, title, message, type, priority, metadata } = req.body;
    const currentUser = req.user;
    
    // Check if user is creating notification for themselves or is admin
    if (currentUser.id !== user_id && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const query = `
      INSERT INTO notifications (user_id, project_id, title, message, type, priority, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [user_id, project_id, title, message, type, priority, metadata];
    const dbPool = await getPool();
    const result = await dbPool.query(query, values);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    const currentUser = req.user;
    
    // First get the notification to check ownership
    const dbPool = await getPool();
    const getQuery = `SELECT user_id FROM notifications WHERE id = $1`;
    const getResult = await dbPool.query(getQuery, [id]);
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notification = getResult.rows[0];
    
    // Check if user owns the notification or is admin
    if (notification.user_id !== currentUser.id && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const query = `
      UPDATE notifications 
      SET is_read = $1, read_at = CASE WHEN $1 = TRUE THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await dbPool.query(query, [is_read, id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete notification
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    // First get the notification to check ownership
    const dbPool = await getPool();
    const getQuery = `SELECT user_id FROM notifications WHERE id = $1`;
    const getResult = await dbPool.query(getQuery, [id]);
    
    if (getResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notification = getResult.rows[0];
    
    // Check if user owns the notification or is admin
    if (notification.user_id !== currentUser.id && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const query = `
      UPDATE notifications 
      SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await dbPool.query(query, [id]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get unread count
app.get('/api/notifications/:userId/unread-count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;
    
    // Check if user is accessing their own count or is admin
    if (currentUser.userId !== userId && currentUser.globalRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const query = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = $1 AND is_read = FALSE AND is_deleted = FALSE
    `;
    
    const dbPool = await getPool();
    const result = await dbPool.query(query, [userId]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Bulk operations
app.patch('/api/notifications/bulk', authenticateToken, async (req, res) => {
  try {
    const { userId, action, notificationIds } = req.body;
    const currentUser = req.user;
    
    // Check if user is performing bulk operation on their own notifications or is admin
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let query;
    let params;
    
    switch (action) {
      case 'mark-read':
        query = `
          UPDATE notifications 
          SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
          WHERE id = ANY($1) AND user_id = $2
        `;
        params = [notificationIds, userId];
        break;
      case 'mark-unread':
        query = `
          UPDATE notifications 
          SET is_read = FALSE, read_at = NULL
          WHERE id = ANY($1) AND user_id = $2
        `;
        params = [notificationIds, userId];
        break;
      case 'delete':
        query = `
          UPDATE notifications 
          SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP
          WHERE id = ANY($1) AND user_id = $2
        `;
        params = [notificationIds, userId];
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    const dbPool = await getPool();
    const result = await dbPool.query(query, params);
    res.json({ updated: result.rowCount });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation' });
  }
});

// =====================================================
// AUTHENTICATION ENDPOINTS
// =====================================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password required' });
    }

    const result = await userService.authenticateUser(emailOrUsername, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Test login with default admin user



// USER MANAGEMENT ENDPOINTS
// =====================================================

// Get all users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user by ID
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    // Users can only access their own data unless admin
    if (currentUser.userId !== id && currentUser.globalRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await userService.getUserById(id);
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Create user (admin only)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userData = req.body;
    const createdBy = req.user.userId;
    
    const user = await userService.createUser(userData, createdBy);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const currentUser = req.user;
    
    // Users can only update their own data unless admin
    if (currentUser.userId !== id && currentUser.globalRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await userService.updateUser(id, updateData, currentUser.userId);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user.userId;
    
    await userService.deleteUser(id, deletedBy);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user custom data
app.put('/api/users/:id/custom-data', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const customData = req.body;
    const currentUser = req.user;
    
    // Users can only update their own data unless admin
    if (currentUser.userId !== id && currentUser.globalRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const user = await userService.updateUserCustomData(id, customData, currentUser.userId);
    res.json(user);
  } catch (error) {
    console.error('Error updating user custom data:', error);
    res.status(500).json({ error: 'Failed to update user custom data' });
  }
});

// =====================================================
// PROJECT MANAGEMENT ENDPOINTS
// =====================================================

// Get all projects
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const projects = await projectService.getAllProjects(currentUser.userId, currentUser.globalRole);
    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get project by ID
app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const project = await projectService.getProjectById(id, currentUser.userId, currentUser.globalRole);
    res.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Create project
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projectData = req.body;
    const createdBy = req.user.userId;
    
    const project = await projectService.createProject(projectData, createdBy);
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const currentUser = req.user;
    
    const project = await projectService.updateProject(id, updateData, currentUser.userId);
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    await projectService.deleteProject(id, currentUser.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// =====================================================
// PROJECT MEMBERSHIP ENDPOINTS
// =====================================================

// Get project members
app.get('/api/projects/:projectId/members', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const currentUser = req.user;
    
    const members = await projectService.getProjectMembers(projectId, currentUser.userId, currentUser.globalRole);
    res.json(members);
  } catch (error) {
    console.error('Error getting project members:', error);
    res.status(500).json({ error: 'Failed to get project members' });
  }
});

// Add member to project
app.post('/api/projects/:projectId/members', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const currentUser = req.user;
    
    const membership = await projectService.addMemberToProject(projectId, email, role, currentUser.userId);
    res.status(201).json(membership);
  } catch (error) {
    console.error('Error adding member to project:', error);
    res.status(500).json({ error: 'Failed to add member to project' });
  }
});

// Update member role
app.put('/api/projects/:projectId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    const currentUser = req.user;
    
    const membership = await projectService.updateMemberRole(projectId, userId, role, currentUser.userId);
    res.json(membership);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Remove member from project
app.delete('/api/projects/:projectId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const currentUser = req.user;
    
    await projectService.removeMemberFromProject(projectId, userId, currentUser.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing member from project:', error);
    res.status(500).json({ error: 'Failed to remove member from project' });
  }
});

// =====================================================
// PROJECT SWITCHING ENDPOINTS
// =====================================================

// Switch project
app.post('/api/projects/:projectId/switch', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const currentUser = req.user;
    
    const result = await projectService.switchProject(currentUser.userId, projectId);
    res.json(result);
  } catch (error) {
    console.error('Error switching project:', error);
    res.status(500).json({ error: 'Failed to switch project' });
  }
});

// =====================================================
// PROJECT DATA ENDPOINTS
// =====================================================

// Save project data
app.post('/api/projects/:projectId/data', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { dataType, data } = req.body;
    const currentUser = req.user;
    
    const result = await projectService.saveProjectData(projectId, dataType, data, currentUser.userId);
    res.json(result);
  } catch (error) {
    console.error('Error saving project data:', error);
    res.status(500).json({ error: 'Failed to save project data' });
  }
});

// Get project data
app.get('/api/projects/:projectId/data/:dataType', authenticateToken, async (req, res) => {
  try {
    const { projectId, dataType } = req.params;
    const currentUser = req.user;
    
    const data = await projectService.getProjectData(projectId, dataType, currentUser.userId, currentUser.globalRole);
    res.json(data);
  } catch (error) {
    console.error('Error getting project data:', error);
    res.status(500).json({ error: 'Failed to get project data' });
  }
});

// Get all project data
app.get('/api/projects/:projectId/data', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const currentUser = req.user;
    
    const data = await projectService.getAllProjectData(projectId, currentUser.userId, currentUser.globalRole);
    res.json(data);
  } catch (error) {
    console.error('Error getting all project data:', error);
    res.status(500).json({ error: 'Failed to get project data' });
  }
});

// =====================================================
// NOTIFICATION ENDPOINTS (User-Integrated)
// =====================================================

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const { projectId, limit = 50, offset = 0 } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      currentUser.userId, 
      projectId, 
      parseInt(limit), 
      parseInt(offset)
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Get unread notifications
app.get('/api/notifications/unread', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const { projectId } = req.query;
    
    const notifications = await notificationService.getUnreadNotifications(
      currentUser.userId, 
      projectId
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    res.status(500).json({ error: 'Failed to get unread notifications' });
  }
});

// Get unread count
app.get('/api/notifications/unread-count', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const { projectId } = req.query;
    
    const count = await notificationService.getUnreadCount(
      currentUser.userId, 
      projectId
    );
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const notification = await notificationService.markAsRead(id, currentUser.userId);
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
app.patch('/api/notifications/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const { projectId } = req.body;
    
    const result = await notificationService.markAllAsRead(currentUser.userId, projectId);
    res.json(result);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    const notification = await notificationService.deleteNotification(id, currentUser.userId);
    res.json(notification);
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Delete all notifications
app.delete('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const { projectId } = req.body;
    
    const result = await notificationService.deleteAllNotifications(currentUser.userId, projectId);
    res.json(result);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
});

// Create notification (admin only)
app.post('/api/notifications', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const notificationData = req.body;
    const currentUser = req.user;
    
    const notification = await notificationService.createNotification(notificationData, currentUser.userId);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Create user notification
app.post('/api/notifications/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const notificationData = req.body;
    const currentUser = req.user;
    
    const notification = await notificationService.createUserNotification(userId, notificationData, currentUser.userId);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating user notification:', error);
    res.status(500).json({ error: 'Failed to create user notification' });
  }
});

// Create system notification (admin only)
app.post('/api/notifications/system', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const notificationData = req.body;
    const currentUser = req.user;
    
    const notifications = await notificationService.createSystemNotification(notificationData, currentUser.userId);
    res.status(201).json(notifications);
  } catch (error) {
    console.error('Error creating system notification:', error);
    res.status(500).json({ error: 'Failed to create system notification' });
  }
});

// Get user notification settings
app.get('/api/notifications/settings', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    
    const settings = await notificationService.getUserNotificationSettings(currentUser.userId);
    res.json(settings);
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({ error: 'Failed to get notification settings' });
  }
});

// Update user notification settings
app.put('/api/notifications/settings', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const notificationSettings = req.body;
    
    const settings = await notificationService.updateUserNotificationSettings(
      currentUser.userId, 
      notificationSettings, 
      currentUser.userId
    );
    res.json(settings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// =====================================================
// UTILITY ENDPOINTS
// =====================================================

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbPool = await getPool();
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    res.json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Temporary endpoint to fix password hashes
app.post('/api/fix-passwords', async (req, res) => {
  try {
    const pool = await getPool();
    const client = await pool.connect();
    
    // Update admin password hash
    await client.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2`,
      ['$2b$10$AcLI1.7X8vc8AWmbTo0JL.DvxPFuT4F9CR2nnFD/2LUBWeldC48mq', 'admin@salesfive.com']
    );
    
    // Update user password hash
    await client.query(
      `UPDATE users SET password_hash = $1 WHERE email = $2`,
      ['$2b$10$RfvL8sujuwa20fD3e3ih6OfRYdeRigRCJeJ7B6kjM201lRwLRJK3O', 'user@salesfive.com']
    );
    
    client.release();
    res.json({ message: 'Password hashes updated successfully' });
  } catch (error) {
    console.error('Error updating password hashes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to test token
app.get('/api/debug/token', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Token is valid',
    user: req.user,
    headers: req.headers
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    res.json({ 
      status: 'healthy',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// =====================================================
// PERMISSION MANAGEMENT ENDPOINTS
// =====================================================

// Get all roles
app.get('/api/permissions/roles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT id, name, description, permissions, is_system, created_at, updated_at
      FROM roles
      ORDER BY name
    `);
    
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Create new role
app.post('/api/permissions/roles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, permissions, isSystem = false } = req.body;
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO roles (name, description, permissions, is_system)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, JSON.stringify(permissions), isSystem]);
    
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role
app.put('/api/permissions/roles/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      UPDATE roles 
      SET name = $1, description = $2, permissions = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [name, description, JSON.stringify(permissions), id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
app.delete('/api/permissions/roles/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if role is system role
    const checkResult = await client.query(`
      SELECT is_system FROM roles WHERE id = $1
    `, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    if (checkResult.rows[0].is_system) {
      return res.status(400).json({ error: 'Cannot delete system roles' });
    }
    
    await client.query(`DELETE FROM roles WHERE id = $1`, [id]);
    client.release();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// Check user permissions
app.post('/api/permissions/check', authenticateToken, async (req, res) => {
  try {
    const { userId, resource, action, scope } = req.body;
    const currentUser = req.user;
    
    // Users can only check their own permissions unless admin
    if (currentUser.userId !== userId && currentUser.globalRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Get user's permissions from roles and project memberships
    const userResult = await client.query(`
      SELECT u.global_role, u.custom_data, pm.permissions as project_permissions
      FROM users u
      LEFT JOIN project_memberships pm ON u.id = pm.user_id
      WHERE u.id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const hasPermission = checkUserPermission(user, resource, action, scope);
    
    client.release();
    res.json({ hasPermission });
  } catch (error) {
    console.error('Error checking permissions:', error);
    res.status(500).json({ error: 'Failed to check permissions' });
  }
});

// Helper function to check user permissions
function checkUserPermission(user, resource, action, scope) {
  // Check global role permissions
  if (user.global_role === 'admin') {
    return true; // Admin has all permissions
  }
  
  // Check project-specific permissions
  if (user.project_permissions) {
    const projectPermissions = JSON.parse(user.project_permissions);
    const permission = projectPermissions.find(p => p.resource === resource);
    if (permission && permission.actions.includes(action)) {
      return permission.scope === scope || permission.scope === 'all';
    }
  }
  
  return false;
}

// =====================================================
// PERMISSION DEFINITION MANAGEMENT ENDPOINTS
// =====================================================

// Get all permission definitions
app.get('/api/permissions/definitions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT id, resource, action, description, category, is_system, created_at
      FROM permission_definitions
      ORDER BY category, resource, action
    `);
    
    client.release();
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching permission definitions:', error);
    res.status(500).json({ error: 'Failed to fetch permission definitions' });
  }
});

// Create new permission definition
app.post('/api/permissions/definitions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { resource, action, description, category, isSystem = false } = req.body;
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO permission_definitions (resource, action, description, category, is_system)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [resource, action, description, category, isSystem]);
    
    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating permission definition:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Permission definition already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create permission definition' });
    }
  }
});

// Update permission definition
app.put('/api/permissions/definitions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { resource, action, description, category } = req.body;
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if it's a system permission
    const checkResult = await client.query(`
      SELECT is_system FROM permission_definitions WHERE id = $1
    `, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Permission definition not found' });
    }
    
    if (checkResult.rows[0].is_system) {
      return res.status(400).json({ error: 'Cannot modify system permission definitions' });
    }
    
    const result = await client.query(`
      UPDATE permission_definitions 
      SET resource = $1, action = $2, description = $3, category = $4
      WHERE id = $5
      RETURNING *
    `, [resource, action, description, category, id]);
    
    client.release();
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating permission definition:', error);
    res.status(500).json({ error: 'Failed to update permission definition' });
  }
});

// Delete permission definition
app.delete('/api/permissions/definitions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if it's a system permission
    const checkResult = await client.query(`
      SELECT is_system FROM permission_definitions WHERE id = $1
    `, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Permission definition not found' });
    }
    
    if (checkResult.rows[0].is_system) {
      return res.status(400).json({ error: 'Cannot delete system permission definitions' });
    }
    
    await client.query(`DELETE FROM permission_definitions WHERE id = $1`, [id]);
    client.release();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting permission definition:', error);
    res.status(500).json({ error: 'Failed to delete permission definition' });
  }
});

// Get all available permissions
app.get('/api/permissions', authenticateToken, async (req, res) => {
  try {
    const permissions = permissionService.getAllPermissions();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Get all permission sets
app.get('/api/permissions/sets', authenticateToken, async (req, res) => {
  try {
    const permissionSets = permissionService.getAllPermissionSets();
    res.json(permissionSets);
  } catch (error) {
    console.error('Error fetching permission sets:', error);
    res.status(500).json({ error: 'Failed to fetch permission sets' });
  }
});

// Get permissions for a specific set
app.get('/api/permissions/sets/:setName', authenticateToken, async (req, res) => {
  try {
    const { setName } = req.params;
    const permissions = permissionService.getPermissionSet(setName);
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permission set:', error);
    res.status(500).json({ error: 'Failed to fetch permission set' });
  }
});

// Check if user has a specific permission
app.post('/api/permissions/check', authenticateToken, async (req, res) => {
  try {
    const { permission } = req.body;
    const currentUser = req.user;
    
    // Get user's permissions from database
    const pool = await getPool();
    const client = await pool.connect();
    
    const userResult = await client.query(`
      SELECT custom_data FROM users WHERE id = $1
    `, [currentUser.userId]);
    
    client.release();
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userResult.rows[0].custom_data || {};
    const userPermissions = userData.permissions || [];
    const userPermissionSets = userData.permissionSets || [];
    
    // Get effective permissions (including sets)
    const effectivePermissions = permissionService.getEffectivePermissions(userPermissions, userPermissionSets);
    
    const hasPermission = permissionService.hasPermission(effectivePermissions, permission);
    
    res.json({ hasPermission, effectivePermissions });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

// Update user permissions
app.put('/api/users/:userId/permissions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions, permissionSets } = req.body;
    
    // Validate permissions
    if (permissions && !permissionService.validatePermissions(permissions)) {
      return res.status(400).json({ error: 'Invalid permissions provided' });
    }
    
    // Validate permission sets
    if (permissionSets && !permissionService.validatePermissionSets(permissionSets)) {
      return res.status(400).json({ error: 'Invalid permission sets provided' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Get current user data
    const userResult = await client.query(`
      SELECT custom_data FROM users WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentData = userResult.rows[0].custom_data || {};
    const updatedData = {
      ...currentData,
      permissions: permissions || currentData.permissions || [],
      permissionSets: permissionSets || currentData.permissionSets || []
    };
    
    // Update user
    await client.query(`
      UPDATE users SET custom_data = $1 WHERE id = $2
    `, [JSON.stringify(updatedData), userId]);
    
    client.release();
    
    res.json({ 
      message: 'User permissions updated successfully',
      permissions: updatedData.permissions,
      permissionSets: updatedData.permissionSets
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ error: 'Failed to update user permissions' });
  }
});

// Get user's effective permissions
app.get('/api/users/:userId/permissions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;
    
    // Users can only check their own permissions unless admin
    if (currentUser.userId !== userId && currentUser.globalRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const userResult = await client.query(`
      SELECT custom_data FROM users WHERE id = $1
    `, [userId]);
    
    client.release();
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = userResult.rows[0].custom_data || {};
    const userPermissions = userData.permissions || [];
    const userPermissionSets = userData.permissionSets || [];
    
    // Get effective permissions (including sets)
    const effectivePermissions = permissionService.getEffectivePermissions(userPermissions, userPermissionSets);
    
    res.json({
      permissions: userPermissions,
      permissionSets: userPermissionSets,
      effectivePermissions: effectivePermissions
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Notification API Server running on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app;
