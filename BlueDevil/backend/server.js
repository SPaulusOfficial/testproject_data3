const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const userService = require('./userService');
const projectService = require('./projectService');
const notificationService = require('./notificationService');
const permissionService = require('./permissionService');
const { requirePermission, requireAnyPermission, requireAllPermissions, getUserPermissions } = require('./permissionMiddleware');
require('dotenv').config({ path: __dirname + '/../.env' });

// Debug logging setup
const debug = require('debug')('server:main');
const debugDb = require('debug')('server:database');
const debugAuth = require('debug')('server:auth');
const debugApi = require('debug')('server:api');

// Enhanced error logging
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Enhanced logging function
function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    error: error.message,
    stack: error.stack,
    code: error.code,
    sqlState: error.sqlState
  };
  
  console.error(`❌ ERROR [${timestamp}] ${context}:`, error);
  console.error('Stack trace:', error.stack);
  
  // Write to error log file
  const errorLogPath = path.join(logsDir, 'error.log');
  fs.appendFileSync(errorLogPath, JSON.stringify(errorLog) + '\n');
}

// Enhanced process monitoring
let serverStartTime = Date.now();
let requestCount = 0;
let errorCount = 0;
let lastErrorTime = null;

// Process error handlers with enhanced logging
process.on('uncaughtException', (error) => {
  const uptime = Date.now() - serverStartTime;
  const memoryUsage = process.memoryUsage();
  
  console.error('💥 CRITICAL: Server crashed due to uncaught exception');
  console.error(`📊 Server Stats:`);
  console.error(`   - Uptime: ${Math.round(uptime / 1000)}s`);
  console.error(`   - Requests handled: ${requestCount}`);
  console.error(`   - Errors encountered: ${errorCount}`);
  console.error(`   - Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
  console.error(`   - Last error: ${lastErrorTime ? new Date(lastErrorTime).toISOString() : 'None'}`);
  
  logError(error, 'UNCAUGHT_EXCEPTION');
  
  // Write crash report
  const crashReport = {
    timestamp: new Date().toISOString(),
    type: 'UNCAUGHT_EXCEPTION',
    uptime: uptime,
    requestCount: requestCount,
    errorCount: errorCount,
    memoryUsage: memoryUsage,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    }
  };
  
  const crashLogPath = path.join(logsDir, 'crash.log');
  fs.appendFileSync(crashLogPath, JSON.stringify(crashReport) + '\n');
  
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const uptime = Date.now() - serverStartTime;
  const memoryUsage = process.memoryUsage();
  
  console.error('💥 CRITICAL: Server crashed due to unhandled promise rejection');
  console.error(`📊 Server Stats:`);
  console.error(`   - Uptime: ${Math.round(uptime / 1000)}s`);
  console.error(`   - Requests handled: ${requestCount}`);
  console.error(`   - Errors encountered: ${errorCount}`);
  console.error(`   - Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
  console.error(`   - Last error: ${lastErrorTime ? new Date(lastErrorTime).toISOString() : 'None'}`);
  
  logError(reason, 'UNHANDLED_REJECTION');
  
  // Write crash report
  const crashReport = {
    timestamp: new Date().toISOString(),
    type: 'UNHANDLED_REJECTION',
    uptime: uptime,
    requestCount: requestCount,
    errorCount: errorCount,
    memoryUsage: memoryUsage,
    reason: reason instanceof Error ? {
      message: reason.message,
      stack: reason.stack,
      code: reason.code
    } : reason
  };
  
  const crashLogPath = path.join(logsDir, 'crash.log');
  fs.appendFileSync(crashLogPath, JSON.stringify(crashReport) + '\n');
  
  process.exit(1);
});

// Enhanced signal handlers
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM - Starting graceful shutdown...');
  gracefulShutdown('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT - Starting graceful shutdown...');
  gracefulShutdown('SIGINT');
});

// Monitor for other signals that might kill the process
// Note: SIGKILL cannot be caught, but we can monitor for unexpected exits
process.on('exit', (code) => {
  console.log(`🔄 Process exiting with code: ${code}`);
  const exitReport = {
    timestamp: new Date().toISOString(),
    type: 'PROCESS_EXIT',
    code: code,
    uptime: Date.now() - serverStartTime,
    requestCount: requestCount,
    errorCount: errorCount,
    memoryUsage: process.memoryUsage()
  };
  
  const exitLogPath = path.join(logsDir, 'exit.log');
  fs.appendFileSync(exitLogPath, JSON.stringify(exitReport) + '\n');
});

// Memory monitoring
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  
  if (heapUsedMB > 500) { // Warning at 500MB
    console.warn(`⚠️  High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`);
    logError(new Error(`High memory usage: ${heapUsedMB}MB`), 'MEMORY_WARNING');
  }
  
  // Log memory usage every 5 minutes
  if (Date.now() % 300000 < 1000) { // Every 5 minutes
    console.log(`📊 Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`);
  }
}, 30000); // Check every 30 seconds

// Heartbeat monitoring
setInterval(() => {
  const uptime = Date.now() - serverStartTime;
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  
  // Log heartbeat every 10 minutes
  if (Date.now() % 600000 < 1000) { // Every 10 minutes
    console.log(`💓 Heartbeat - Uptime: ${Math.round(uptime / 1000)}s, Requests: ${requestCount}, Errors: ${errorCount}, Memory: ${heapUsedMB}MB`);
    
    // Write heartbeat to log
    const heartbeatLog = {
      timestamp: new Date().toISOString(),
      type: 'HEARTBEAT',
      uptime: uptime,
      requestCount: requestCount,
      errorCount: errorCount,
      memoryUsage: memoryUsage
    };
    
    const heartbeatLogPath = path.join(logsDir, 'heartbeat.log');
    fs.appendFileSync(heartbeatLogPath, JSON.stringify(heartbeatLog) + '\n');
  }
}, 60000); // Check every minute

// Global variables
let globalPool = null;

const app = express();
const PORT = process.env.PORT || 3002;

console.log('🔧 Starting server with configuration:');
console.log(`   - Port: ${PORT}`);
console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - Database Host: ${process.env.VITE_DB_HOST || 'localhost'}`);
console.log(`   - Database Port: ${process.env.VITE_DB_PORT || 5432}`);
console.log(`   - Database Name: ${process.env.VITE_DB_NAME || 'platform_db'}`);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  debug: true,
  useTempFiles: false,
  parseNested: true
}));

// Serve static files (avatars)
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

// Enhanced request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  requestCount++;
  
  // Log request details
  console.log(`📥 [${timestamp}] ${req.method} ${req.path} - IP: ${req.ip} - Request #${requestCount}`);
  debugApi(`${req.method} ${req.path} - Body:`, req.body);
  
  // Track response time
  const startTime = Date.now();
  
  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    console.log(`📤 [${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${statusCode} - Time: ${responseTime}ms`);
    
    // Log slow requests
    if (responseTime > 5000) { // 5 seconds
      console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${responseTime}ms`);
      logError(new Error(`Slow request: ${responseTime}ms`), `SLOW_REQUEST_${req.method}_${req.path}`);
    }
    
    // Log errors
    if (statusCode >= 400) {
      errorCount++;
      lastErrorTime = Date.now();
      console.error(`❌ Error response: ${req.method} ${req.path} - Status: ${statusCode}`);
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  logError(error, `API_ERROR_${req.method}_${req.path}`);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    debugAuth('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Load user data from database to get is_active status
    try {
      const pool = await getPool();
      const client = await pool.connect();
      
      const result = await client.query(`
        SELECT id, username, email, global_role, is_active, custom_data
        FROM users WHERE id = $1
      `, [decoded.userId]);
      
      client.release();
      
      if (result.rows.length === 0) {
        debugAuth(`User not found in database: ${decoded.userId}`);
        return res.status(401).json({ error: 'User not found' });
      }
      
      const userData = result.rows[0];
      
      // Check if user is active
      if (!userData.is_active) {
        debugAuth(`Inactive user attempted access: ${decoded.userId}`);
        return res.status(401).json({ error: 'Account is deactivated' });
      }
      
      // Merge database data with token data
      req.user = {
        ...decoded,
        isActive: userData.is_active,
        customData: userData.custom_data || {}
      };
      
      debugAuth(`Token verified for user: ${decoded.userId} (active: ${userData.is_active})`);
    } catch (dbError) {
      console.error('Database error during authentication:', dbError);
      // Fallback to token data only
      req.user = decoded;
      debugAuth(`Token verified for user: ${decoded.userId} (fallback mode)`);
    }
    
    next();
  } catch (error) {
    debugAuth(`Token verification failed: ${error.message}`);
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user.globalRole !== 'admin') {
    debugAuth(`Admin access denied for user: ${req.user.userId}`);
    return res.status(403).json({ error: 'Admin access required' });
  }
  debugAuth(`Admin access granted for user: ${req.user.userId}`);
  next();
}

// Project access middleware
async function requireProjectAccess(req, res, next) {
  const { projectId } = req.params;
  const userId = req.user.userId;

  try {
    debugDb(`Checking project access for user ${userId} to project ${projectId}`);
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT * FROM project_memberships 
      WHERE user_id = $1 AND project_id = $2
    `, [userId, projectId]);
    
    client.release();
    
    if (result.rows.length === 0 && req.user.globalRole !== 'admin') {
      debugAuth(`Project access denied for user ${userId} to project ${projectId}`);
      return res.status(403).json({ error: 'Project access denied' });
    }
    
    debugAuth(`Project access granted for user ${userId} to project ${projectId}`);
    next();
  } catch (error) {
    logError(error, `PROJECT_ACCESS_CHECK_${userId}_${projectId}`);
    res.status(500).json({ error: 'Failed to check project access' });
  }
}

// Database connection with enhanced error handling
async function getPool() {
  try {
    // Return existing pool if available
    if (globalPool) {
      return globalPool;
    }

    debugDb('Creating database pool...');
    const { Pool } = require('pg');
    globalPool = new Pool({
      host: process.env.VITE_DB_HOST || 'localhost',
      port: process.env.VITE_DB_PORT || 5432,
      database: process.env.VITE_DB_NAME || 'platform_db',
      user: process.env.VITE_DB_USER || 'postgres',
      password: process.env.VITE_DB_PASSWORD || 'password',
      ssl: process.env.VITE_DB_SSL_MODE === 'true' ? { rejectUnauthorized: false } : false,
      // Connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    const client = await globalPool.connect();
    await client.query('SELECT 1');
    client.release();
    
    debugDb('Database pool created successfully');
    return globalPool;
  } catch (error) {
    logError(error, 'DATABASE_POOL_CREATION');
    throw error;
  }
}

// Export getPool for use by other modules
// Note: This will be overridden at the end of the file
global.getPool = getPool;

// Graceful shutdown function
async function gracefulShutdown(signal = 'UNKNOWN') {
  const uptime = Date.now() - serverStartTime;
  const memoryUsage = process.memoryUsage();
  
  console.log('🛑 Shutting down server gracefully...');
  console.log(`📊 Final Server Stats:`);
  console.log(`   - Signal: ${signal}`);
  console.log(`   - Uptime: ${Math.round(uptime / 1000)}s`);
  console.log(`   - Requests handled: ${requestCount}`);
  console.log(`   - Errors encountered: ${errorCount}`);
  console.log(`   - Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
  console.log(`   - Last error: ${lastErrorTime ? new Date(lastErrorTime).toISOString() : 'None'}`);
  
  // Write shutdown report
  const shutdownReport = {
    timestamp: new Date().toISOString(),
    type: 'GRACEFUL_SHUTDOWN',
    signal: signal,
    uptime: uptime,
    requestCount: requestCount,
    errorCount: errorCount,
    memoryUsage: memoryUsage,
    lastErrorTime: lastErrorTime
  };
  
  const shutdownLogPath = path.join(logsDir, 'shutdown.log');
  fs.appendFileSync(shutdownLogPath, JSON.stringify(shutdownReport) + '\n');
  
  if (globalPool) {
    console.log('📝 Closing database pool...');
    try {
      await globalPool.end();
      console.log('✅ Database pool closed');
    } catch (error) {
      console.error('❌ Error closing database pool:', error);
      logError(error, 'SHUTDOWN_DB_POOL_ERROR');
    }
  }
  
  console.log('✅ Server shutdown complete');
  process.exit(0);
}

// Initialize database with enhanced error handling
async function initializeDatabase() {
  try {
    console.log('🗄️  Initializing database...');
    debugDb('Starting database initialization');
    
    const pool = await getPool();
    const appClient = await pool.connect();
    
    console.log('✅ Database connection established');
    debugDb('Database connection successful');
    
    // Check if database exists
    const dbCheck = await appClient.query(`
      SELECT 1 FROM pg_database WHERE datname = 'platform_db'
    `);
    
    if (dbCheck.rows.length === 0) {
      console.log('📦 Creating database...');
      debugDb('Creating platform_db database');
      await appClient.query(`CREATE DATABASE platform_db`);
    } else {
      console.log('✅ Database \'platform_db\' already exists');
      debugDb('Database platform_db already exists');
    }
    
    appClient.release();
    
    // Connect to the specific database
    const dbClient = await pool.connect();
    
    // Create tables with error handling
    console.log('📋 Creating database schema...');
    debugDb('Creating database schema');
    
    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL DEFAULT '',
        last_name VARCHAR(100) NOT NULL DEFAULT '',
        avatar_url VARCHAR(500),
        phone VARCHAR(20),
        global_role VARCHAR(20) DEFAULT 'user' CHECK (global_role IN ('system_admin', 'project_admin', 'user', 'guest')),
        two_factor_enabled BOOLEAN DEFAULT FALSE,
        two_factor_secret VARCHAR(32),
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        last_login TIMESTAMP,
        custom_data JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      );

      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id UUID REFERENCES users(id),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Project memberships table
      CREATE TABLE IF NOT EXISTS project_memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member',
        permissions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, project_id)
      );

      -- Audit logs table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id UUID,
        details JSONB,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
      CREATE INDEX IF NOT EXISTS idx_project_memberships_user ON project_memberships(user_id);
      CREATE INDEX IF NOT EXISTS idx_project_memberships_project ON project_memberships(project_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
    `;
    
    await dbClient.query(schema);
    console.log('✅ Database schema initialized successfully');
    debugDb('Database schema created successfully');
    
    // Insert default admin user if not exists
    const adminCheck = await dbClient.query(`
      SELECT id FROM users WHERE username = 'admin'
    `);
    
    if (adminCheck.rows.length === 0) {
      console.log('👤 Creating default admin user...');
      debugDb('Creating default admin user');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await dbClient.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, global_role, custom_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'admin',
        'admin@salesfive.com',
        hashedPassword,
        'Admin',
        'User',
        'admin',
        JSON.stringify({
          permissions: ['UserManagement', 'ProjectManagement', 'SystemSettings'],
          permissionSets: ['FullAdministrator']
        })
      ]);
      console.log('✅ Default admin user created');
      debugDb('Default admin user created successfully');
    }
    
    // Insert default test user if not exists
    const testUserCheck = await dbClient.query(`
      SELECT id FROM users WHERE username = 'testuser'
    `);
    
    if (testUserCheck.rows.length === 0) {
      console.log('👤 Creating default test user...');
      debugDb('Creating default test user');
      const hashedPassword = await bcrypt.hash('test123', 10);
      await dbClient.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, global_role, custom_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'testuser',
        'test@salesfive.com',
        hashedPassword,
        'Test',
        'User',
        'user',
        JSON.stringify({
          permissions: ['UserProfile', 'ProjectData'],
          permissionSets: ['BasicUser']
        })
      ]);
      console.log('✅ Default test user created');
      debugDb('Default test user created successfully');
    }

    // Insert normaluser with UserManagement permission if not exists
    const normalUserCheck = await dbClient.query(`
      SELECT id FROM users WHERE username = 'normaluser'
    `);
    
    if (normalUserCheck.rows.length === 0) {
      console.log('👤 Creating normaluser with UserManagement permission...');
      debugDb('Creating normaluser with UserManagement permission');
      const hashedPassword = await bcrypt.hash('normal123', 10);
      await dbClient.query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, global_role, custom_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        'normaluser',
        'normaluser@salesfive.com',
        hashedPassword,
        'Normal',
        'User',
        'user',
        JSON.stringify({
          permissions: ['UserManagement'],
          permissionSets: ['UserManager']
        })
      ]);
      console.log('✅ Normaluser with UserManagement permission created');
      debugDb('Normaluser created successfully');
    } else {
      // Update existing normaluser with UserManagement permission
      console.log('👤 Updating existing normaluser with UserManagement permission...');
      debugDb('Updating existing normaluser with UserManagement permission');
      await dbClient.query(`
        UPDATE users 
        SET custom_data = $1, updated_at = NOW()
        WHERE username = 'normaluser'
      `, [
        JSON.stringify({
          permissions: ['UserManagement'],
          permissionSets: ['UserManager']
        })
      ]);
      console.log('✅ Normaluser permissions updated');
      debugDb('Normaluser permissions updated successfully');
    }
    
    dbClient.release();
    console.log('✅ Database initialized successfully');
    debugDb('Database initialization completed successfully');
    
  } catch (error) {
    logError(error, 'DATABASE_INITIALIZATION');
    console.error('❌ Database initialization failed');
    throw error;
  }
}

// =====================================================
// AUTHENTICATION ENDPOINTS
// =====================================================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { username: req.body.username, timestamp: new Date().toISOString() });
    debugAuth('Login attempt', { username: req.body.username });
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('❌ Login failed: Missing credentials');
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    console.log('🗄️  Connecting to database for login...');
    const pool = await getPool();
    const client = await pool.connect();
    
    console.log('🔍 Querying user in database...');
    const result = await client.query(`
      SELECT id, username, email, password_hash, first_name, last_name, global_role, custom_data, metadata, is_active
      FROM users WHERE username = $1 OR email = $1
    `, [username]);
    
    client.release();
    
    if (result.rows.length === 0) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check if user is active
    if (!user.is_active) {
      console.log('❌ Login failed: User is inactive');
      return res.status(401).json({ error: 'Account is deactivated. Please contact your administrator.' });
    }
    
    console.log('🔐 Verifying password...');
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      console.log('❌ Login failed: Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('✅ Password verified, creating JWT token...');
    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        globalRole: user.global_role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('📝 Logging audit event...');
    // Log audit event
    const auditClient = await pool.connect();
    await auditClient.query(`
      INSERT INTO audit_logs (user_id, action, resource_type, details, ip_address)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      user.id,
      'login',
      'auth',
      JSON.stringify({ method: 'password' }),
      req.ip || 'unknown'
    ]);
    auditClient.release();
    
    console.log('✅ Login successful for user:', user.username);
    res.json({
      token,
              user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          globalRole: user.global_role,
          customData: user.custom_data || {},
          metadata: user.metadata || {}
        }
    });
  } catch (error) {
    logError(error, 'LOGIN_ENDPOINT');
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Token validation endpoint
app.get('/api/debug/token', authenticateToken, (req, res) => {
  console.log('🔍 Token validation request for user:', req.user.userId);
  res.json({ valid: true, user: req.user });
});

// =====================================================
// USER MANAGEMENT ENDPOINTS
// =====================================================

// Get all users
app.get('/api/users', authenticateToken, requirePermission('UserManagement'), async (req, res) => {
  try {
    console.log('👥 Fetching all users...');
    debugApi('Fetching all users');
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT id, username, email, first_name, last_name, global_role, custom_data, metadata, created_at, updated_at, is_active
      FROM users
      ORDER BY username
    `);
    
    client.release();
    
          const users = result.rows.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        globalRole: user.global_role,
        customData: user.custom_data || {},
        metadata: user.metadata || {},
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        isActive: user.is_active
      }));
    
    console.log(`✅ Retrieved ${users.length} users`);
    res.json(users);
  } catch (error) {
    logError(error, 'GET_ALL_USERS');
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user statistics
app.get('/api/users/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching user statistics...');
    debugApi('Fetching user statistics');
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Get total users, active users, inactive users
    const userStats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
      FROM users
    `);
    
    // Get login activity from audit logs (with error handling)
    let loginActivity = { rows: [{ today: 0, yesterday: 0, last_30_days: 0 }] };
    try {
      loginActivity = await client.query(`
        SELECT 
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE - INTERVAL '1 day' THEN 1 END) as yesterday,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30_days
        FROM audit_logs 
        WHERE action = 'login'
      `);
    } catch (auditError) {
      console.log('Audit logs table not available, using default values');
    }
    
    client.release();
    
    const stats = userStats.rows[0];
    const activity = loginActivity.rows[0];
    
    console.log('✅ User statistics retrieved');
    res.json({
      totalUsers: parseInt(stats.total_users) || 0,
      activeUsers: parseInt(stats.active_users) || 0,
      inactiveUsers: parseInt(stats.inactive_users) || 0,
      loginActivity: {
        today: parseInt(activity.today) || 0,
        yesterday: parseInt(activity.yesterday) || 0,
        last30Days: parseInt(activity.last_30_days) || 0
      }
    });
  } catch (error) {
    logError(error, 'GET_USER_STATS');
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user by ID
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    console.log(`👤 Fetching user ${id} by user ${currentUser.userId}`);
    debugApi(`Fetching user ${id}`);
    
    // Users can only access their own data unless admin
    if (currentUser.userId !== id && currentUser.globalRole !== 'admin') {
      console.log('❌ Access denied: User can only access own data');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT id, username, email, first_name, last_name, global_role, custom_data, metadata, created_at, updated_at
      FROM users WHERE id = $1
    `, [id]);
    
    client.release();
    
    if (result.rows.length === 0) {
      console.log('❌ User not found:', id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    console.log('✅ User retrieved:', user.username);
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      globalRole: user.global_role,
      customData: user.custom_data || {},
      metadata: user.metadata || {},
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    logError(error, `GET_USER_BY_ID_${req.params.id}`);
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
app.post('/api/users', authenticateToken, requirePermission('UserManagement'), async (req, res) => {
  try {
    console.log('👤 Creating new user...');
    debugApi('Creating new user', req.body);
    
    const { username, email, password, firstName, lastName, globalRole = 'user', customData = {}, metadata = {} } = req.body;
    
    if (!username || !email || !password) {
      console.log('❌ User creation failed: Missing required fields');
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await getPool();
    const client = await pool.connect();
    
    console.log('💾 Inserting user into database...');
    const result = await client.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, global_role, custom_data, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, first_name, last_name, global_role, custom_data, metadata, created_at
    `, [username, email, hashedPassword, firstName, lastName, globalRole, JSON.stringify(customData), JSON.stringify(metadata)]);
    
    client.release();
    
    console.log('✅ User created successfully:', username);
    res.status(201).json({
      id: result.rows[0].id,
      username: result.rows[0].username,
      email: result.rows[0].email,
      globalRole: result.rows[0].global_role,
      customData: result.rows[0].custom_data || {},
      createdAt: result.rows[0].created_at
    });
  } catch (error) {
    logError(error, 'CREATE_USER');
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

// Update user
app.put('/api/users/:id', authenticateToken, requirePermission('UserManagement'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, phone, globalRole, customData, metadata } = req.body;
    
    console.log(`👤 Updating user ${id}...`);
    debugApi(`Updating user ${id}`, req.body);
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      UPDATE users 
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          first_name = COALESCE($3, first_name),
          last_name = COALESCE($4, last_name),
          phone = COALESCE($5, phone),
          global_role = COALESCE($6, global_role),
          custom_data = COALESCE($7, custom_data),
          metadata = COALESCE($8, metadata),
          updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `, [username, email, firstName, lastName, phone, globalRole, customData ? JSON.stringify(customData) : null, metadata ? JSON.stringify(metadata) : null, id]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found for update:', id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    client.release();
    
    const user = result.rows[0];
    console.log('✅ User updated successfully:', user.username);
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      globalRole: user.global_role,
      customData: user.custom_data || {},
      metadata: user.metadata || {},
      updatedAt: user.updated_at
    });
  } catch (error) {
    logError(error, `UPDATE_USER_${req.params.id}`);
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Toggle user active status
app.patch('/api/users/:id/status', authenticateToken, requirePermission('UserManagement'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    console.log(`🔄 Toggling user ${id} status to ${isActive}...`);
    debugApi(`Toggling user ${id} status`, { isActive });
    
    if (typeof isActive !== 'boolean') {
      console.log('❌ Invalid isActive parameter');
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }
    
    // Prevent users from deactivating themselves
    if (req.user.userId === id && !isActive) {
      console.log('❌ User cannot deactivate themselves:', id);
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      UPDATE users 
      SET is_active = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING id, username, is_active
    `, [isActive, id]);
    
    if (result.rows.length === 0) {
      console.log('❌ User not found for status update:', id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    client.release();
    const user = result.rows[0];
    console.log(`✅ User ${user.username} status updated to ${user.is_active}`);
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        isActive: user.is_active
      }
    });
  } catch (error) {
    logError(error, `TOGGLE_USER_STATUS_${req.params.id}`);
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});



// =====================================================
// PROJECT MANAGEMENT ENDPOINTS
// =====================================================

// Get all projects
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    console.log('📁 Fetching all projects...');
    debugApi('Fetching all projects');
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        p.*, 
        u.username as owner_name,
        COALESCE(member_counts.member_count, 0) as member_count
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN (
        SELECT 
          project_id, 
          COUNT(*) as member_count 
        FROM project_memberships 
        GROUP BY project_id
      ) member_counts ON p.id = member_counts.project_id
      ORDER BY p.created_at DESC
    `);
    
    client.release();
    
    const projects = result.rows.map(project => ({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      ownerId: project.owner_id,
      ownerName: project.owner_name,
      settings: project.settings || {},
      metadata: project.metadata || {},
      environmentConfig: project.environment_config || {},
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      isActive: project.is_active,
      memberCount: parseInt(project.member_count) || 0
    }));
    
    console.log(`✅ Retrieved ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    logError(error, 'GET_ALL_PROJECTS');
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project
app.post('/api/projects', authenticateToken, requirePermission('ProjectCreation'), async (req, res) => {
  try {
    const { name, slug, description, settings = {} } = req.body;
    const userId = req.user.userId;
    
    console.log('📁 Creating new project...');
    debugApi('Creating new project', { name, slug, description, userId });
    
    if (!name || !slug) {
      console.log('❌ Project creation failed: Missing name or slug');
      return res.status(400).json({ error: 'Project name and slug are required' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if slug already exists
    const slugCheck = await client.query(`
      SELECT id FROM projects WHERE slug = $1
    `, [slug]);
    
    if (slugCheck.rows.length > 0) {
      client.release();
      console.log('❌ Project creation failed: Slug already exists');
      return res.status(400).json({ error: 'Project slug already exists' });
    }
    
    const result = await client.query(`
      INSERT INTO projects (name, slug, description, owner_id, settings)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, slug, description, userId, JSON.stringify(settings)]);
    
    // Add owner as project member
    await client.query(`
      INSERT INTO project_memberships (user_id, project_id, role)
      VALUES ($1, $2, $3)
    `, [userId, result.rows[0].id, 'owner']);
    
    client.release();
    
    const project = result.rows[0];
    console.log('✅ Project created successfully:', project.name);
    res.status(201).json({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      ownerId: project.owner_id,
      settings: project.settings || {},
      metadata: project.metadata || {},
      environmentConfig: project.environment_config || {},
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      isActive: project.is_active,
      memberCount: 1
    });
  } catch (error) {
    logError(error, 'CREATE_PROJECT');
    console.error('Error creating project:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Project slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
});

// Get project details with members
app.get('/api/projects/:id', authenticateToken, requirePermission('ProjectManagement'), async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📁 Fetching project details for ${id}...`);
    debugApi(`Fetching project details for ${id}`);
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Get project details
    const projectResult = await client.query(`
      SELECT 
        p.*, 
        u.username as owner_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `, [id]);
    
    if (projectResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Get project members
    const membersResult = await client.query(`
      SELECT 
        pm.*,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.global_role,
        u.is_active
      FROM project_memberships pm
      LEFT JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      ORDER BY pm.joined_at
    `, [id]);
    
    client.release();
    
    const project = projectResult.rows[0];
    const members = membersResult.rows.map(member => ({
      id: member.id,
      userId: member.user_id,
      projectId: member.project_id,
      role: member.role,
      permissions: member.permissions || {},
      profileData: member.profile_data || {},
      settings: member.settings || {},
      lastAccessed: member.last_accessed,
      joinedAt: member.joined_at,
      user: {
        id: member.user_id,
        username: member.username,
        email: member.email,
        firstName: member.first_name,
        lastName: member.last_name,
        globalRole: member.global_role,
        isActive: member.is_active
      }
    }));
    
    console.log(`✅ Retrieved project details for ${project.name} with ${members.length} members`);
    res.json({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      ownerId: project.owner_id,
      ownerName: project.owner_name,
      settings: project.settings || {},
      metadata: project.metadata || {},
      environmentConfig: project.environment_config || {},
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      isActive: project.is_active,
      members: members,
      memberCount: members.length
    });
  } catch (error) {
    logError(error, `GET_PROJECT_DETAILS_${req.params.id}`);
    console.error('Error fetching project details:', error);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// Add member to project
app.post('/api/projects/:id/members', authenticateToken, requirePermission('ProjectManagement'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role = 'member', permissions = {} } = req.body;
    
    console.log(`👥 Adding member to project ${id}...`);
    debugApi(`Adding member to project ${id}`, { userId, role });
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if project exists
    const projectCheck = await client.query(`
      SELECT id FROM projects WHERE id = $1
    `, [id]);
    
    if (projectCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user exists
    const userCheck = await client.query(`
      SELECT id FROM users WHERE id = $1
    `, [userId]);
    
    if (userCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is already a member
    const memberCheck = await client.query(`
      SELECT id FROM project_memberships WHERE user_id = $1 AND project_id = $2
    `, [userId, id]);
    
    if (memberCheck.rows.length > 0) {
      client.release();
      return res.status(400).json({ error: 'User is already a member of this project' });
    }
    
    // Add member
    const result = await client.query(`
      INSERT INTO project_memberships (user_id, project_id, role, permissions)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [userId, id, role, JSON.stringify(permissions)]);
    
    client.release();
    
    console.log(`✅ Member added to project ${id}`);
    res.status(201).json({
      success: true,
      message: 'Member added successfully',
      membership: result.rows[0]
    });
  } catch (error) {
    logError(error, `ADD_PROJECT_MEMBER_${req.params.id}`);
    console.error('Error adding project member:', error);
    res.status(500).json({ error: 'Failed to add project member' });
  }
});

// Switch to project
app.post('/api/projects/:id/switch', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    
    console.log(`🔄 Switching to project ${id} for user ${currentUser.userId}...`);
    debugApi(`Switching to project ${id}`, { userId: currentUser.userId });
    
    const pool = await getPool();
    const client = await pool.connect();
    
    try {
      // Verify user has access to this project
      const membership = await client.query(`
        SELECT pm.*, p.name as project_name, p.description as project_description
        FROM project_memberships pm
        JOIN projects p ON p.id = pm.project_id
        WHERE pm.user_id = $1 AND pm.project_id = $2
      `, [currentUser.userId, id]);

      if (membership.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied to project' });
      }

      // Update last accessed timestamp
      await client.query(`
        UPDATE project_memberships 
        SET last_accessed = NOW() 
        WHERE user_id = $1 AND project_id = $2
      `, [currentUser.userId, id]);

      // Get project details
      const project = await client.query(`
        SELECT 
          p.*,
          u.username as owner_name,
          u.email as owner_email
        FROM projects p
        LEFT JOIN users u ON u.id = p.owner_id
        WHERE p.id = $1
      `, [id]);

      if (project.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const projectData = project.rows[0];
      const membershipData = membership.rows[0];

      // Log project switch
      await client.query(`
        INSERT INTO audit_logs (user_id, project_id, action, details, severity, category)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        currentUser.userId,
        id,
        'project_switched',
        JSON.stringify({ projectName: projectData.name }),
        'info',
        'project_management'
      ]);

      console.log(`✅ Successfully switched to project ${id}`);
      
      res.json({
        success: true,
        project: {
          id: projectData.id,
          name: projectData.name,
          slug: projectData.slug,
          description: projectData.description,
          ownerId: projectData.owner_id,
          ownerName: projectData.owner_name,
          settings: projectData.settings || {},
          metadata: projectData.metadata || {},
          environmentConfig: projectData.environment_config || {},
          createdAt: projectData.created_at,
          updatedAt: projectData.updated_at,
          isActive: projectData.is_active
        },
        membership: {
          id: membershipData.id,
          role: membershipData.role,
          permissions: membershipData.permissions,
          lastAccessed: membershipData.last_accessed,
          joinedAt: membershipData.created_at
        }
      });

    } finally {
      client.release();
    }
  } catch (error) {
    logError(error, `SWITCH_PROJECT_${req.params.id}`);
    console.error('Error switching project:', error);
    res.status(500).json({ error: 'Failed to switch project' });
  }
});

// Remove member from project
app.delete('/api/projects/:id/members/:userId', authenticateToken, requirePermission('ProjectManagement'), async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    console.log(`👥 Removing member from project ${id}...`);
    debugApi(`Removing member from project ${id}`, { userId });
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if membership exists
    const membershipCheck = await client.query(`
      SELECT role FROM project_memberships WHERE user_id = $1 AND project_id = $2
    `, [userId, id]);
    
    if (membershipCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Membership not found' });
    }
    
    // Prevent removing project owner
    if (membershipCheck.rows[0].role === 'owner') {
      client.release();
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }
    
    // Remove member
    await client.query(`
      DELETE FROM project_memberships WHERE user_id = $1 AND project_id = $2
    `, [userId, id]);
    
    client.release();
    
    console.log(`✅ Member removed from project ${id}`);
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    logError(error, `REMOVE_PROJECT_MEMBER_${req.params.id}_${req.params.userId}`);
    console.error('Error removing project member:', error);
    res.status(500).json({ error: 'Failed to remove project member' });
  }
});

// =====================================================
// SIMPLIFIED PERMISSION SYSTEM ENDPOINTS
// =====================================================

// Get all available permissions
app.get('/api/permissions', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Fetching all permissions...');
    debugApi('Fetching all permissions');
    
    const permissions = permissionService.getAllPermissions();
    console.log(`✅ Retrieved ${permissions.length} permissions`);
    res.json(permissions);
  } catch (error) {
    logError(error, 'GET_ALL_PERMISSIONS');
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Get all permission sets
app.get('/api/permissions/sets', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Fetching all permission sets...');
    debugApi('Fetching all permission sets');
    
    const permissionSets = permissionService.getAllPermissionSets();
    console.log(`✅ Retrieved ${permissionSets.length} permission sets`);
    res.json(permissionSets);
  } catch (error) {
    logError(error, 'GET_ALL_PERMISSION_SETS');
    console.error('Error fetching permission sets:', error);
    res.status(500).json({ error: 'Failed to fetch permission sets' });
  }
});

// Get permissions for a specific set
app.get('/api/permissions/sets/:setName', authenticateToken, async (req, res) => {
  try {
    const { setName } = req.params;
    console.log(`🔐 Fetching permissions for set: ${setName}`);
    debugApi(`Fetching permissions for set: ${setName}`);
    
    const permissions = permissionService.getPermissionSet(setName);
    console.log(`✅ Retrieved ${permissions.length} permissions for set: ${setName}`);
    res.json(permissions);
  } catch (error) {
    logError(error, `GET_PERMISSION_SET_${req.params.setName}`);
    console.error('Error fetching permission set:', error);
    res.status(500).json({ error: 'Failed to fetch permission set' });
  }
});

// Check if user has a specific permission
app.post('/api/permissions/check', authenticateToken, async (req, res) => {
  try {
    const { permission } = req.body;
    const currentUser = req.user;
    
    console.log(`🔐 Checking permission '${permission}' for user ${currentUser.userId}`);
    debugApi(`Checking permission: ${permission}`);
    
    // Use the central database function
    const pool = await getPool();
    const hasPermission = await permissionService.checkUserPermission(currentUser.userId, permission, pool);
    
    console.log(`✅ Permission check result: ${hasPermission} for permission '${permission}'`);
    res.json({ hasPermission });
  } catch (error) {
    logError(error, 'CHECK_PERMISSION');
    console.error('Error checking permission:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

// Update user permissions
app.put('/api/users/:userId/permissions', authenticateToken, requirePermission('UserManagement'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions, permissionSets } = req.body;
    const currentUser = req.user;
    
    console.log(`🔐 Updating permissions for user ${userId}...`);
    console.log(`🔍 Request body:`, req.body);
    console.log(`🔍 Permissions:`, permissions);
    console.log(`🔍 Permission sets:`, permissionSets);
    debugApi(`Updating permissions for user ${userId}`, { permissions, permissionSets });
    
    // Validate permissions before saving
    const validation = permissionService.validatePermissionsForSave(permissions, permissionSets);
    if (!validation.isValid) {
      console.log('❌ Validation errors:', validation.errors);
      return res.status(400).json({ 
        error: 'Invalid permissions provided', 
        details: validation.errors 
      });
    }
    
    // Use the central database function
    const pool = await getPool();
    const updatedPermissions = await permissionService.updateUserPermissions(
      userId, 
      permissions, 
      permissionSets, 
      currentUser.userId, 
      pool
    );
    
    console.log('✅ User permissions updated successfully');
    res.json({ 
      message: 'User permissions updated successfully',
      ...updatedPermissions
    });
  } catch (error) {
    logError(error, `UPDATE_USER_PERMISSIONS_${req.params.userId}`);
    console.error('Error updating user permissions:', error);
    res.status(500).json({ error: 'Failed to update user permissions' });
  }
});

// Get all available permissions
app.get('/api/permissions', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Fetching all available permissions...');
    debugApi('Fetching all available permissions');
    
    const permissions = permissionService.getAllPermissions();
    
    console.log(`✅ Retrieved ${permissions.length} available permissions`);
    res.json(permissions);
  } catch (error) {
    logError(error, 'GET_ALL_PERMISSIONS');
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Get all available permission sets
app.get('/api/permissions/sets', authenticateToken, async (req, res) => {
  try {
    console.log('🔐 Fetching all available permission sets...');
    debugApi('Fetching all available permission sets');
    
    const permissionSets = permissionService.getAllPermissionSets();
    
    console.log(`✅ Retrieved ${permissionSets.length} available permission sets`);
    res.json(permissionSets);
  } catch (error) {
    logError(error, 'GET_ALL_PERMISSION_SETS');
    console.error('Error fetching permission sets:', error);
    res.status(500).json({ error: 'Failed to fetch permission sets' });
  }
});

// Get user's effective permissions
app.get('/api/users/:userId/permissions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;
    
    console.log(`🔐 Fetching permissions for user ${userId}...`);
    debugApi(`Fetching permissions for user ${userId}`);
    
    // Users can only check their own permissions unless admin
    if (currentUser.userId !== userId && currentUser.globalRole !== 'admin') {
      console.log('❌ Access denied: User can only check own permissions');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Use the central database function
    const pool = await getPool();
    const userPermissions = await permissionService.getUserPermissionsFromDatabase(userId, pool);
    
    console.log(`✅ Retrieved permissions for user ${userId}`);
    res.json(userPermissions);
  } catch (error) {
    logError(error, `GET_USER_PERMISSIONS_${req.params.userId}`);
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

// =====================================================
// NOTIFICATION ENDPOINTS
// =====================================================

// Get user notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`🔔 Fetching notifications for user ${userId}...`);
    debugApi(`Fetching notifications for user ${userId}`);
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT * FROM notifications 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 50
    `, [userId]);
    
    client.release();
    
    const notifications = result.rows.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      data: notification.data || {},
      createdAt: notification.created_at
    }));
    
    console.log(`✅ Retrieved ${notifications.length} notifications for user ${userId}`);
    res.json(notifications);
  } catch (error) {
    logError(error, 'GET_USER_NOTIFICATIONS');
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    console.log(`🔔 Marking notification ${id} as read for user ${userId}...`);
    debugApi(`Marking notification ${id} as read`);
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [id, userId]);
    
    client.release();
    
    if (result.rows.length === 0) {
      console.log('❌ Notification not found or access denied');
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    console.log('✅ Notification marked as read successfully');
    res.json({ success: true });
  } catch (error) {
    logError(error, `MARK_NOTIFICATION_READ_${req.params.id}`);
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get unread notification count
app.get('/api/notifications/:userId/unread-count', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;
    
    console.log(`🔔 Getting unread count for user ${userId}...`);
    debugApi(`Getting unread count for user ${userId}`);
    
    // Users can only check their own unread count unless admin
    if (currentUser.userId !== userId && currentUser.globalRole !== 'admin') {
      console.log('❌ Access denied: User can only check own unread count');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT COUNT(*) as unread_count 
      FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `, [userId]);
    
    client.release();
    
    const unreadCount = parseInt(result.rows[0].unread_count);
    
    console.log(`✅ Retrieved unread count for user ${userId}: ${unreadCount}`);
    res.json({ unreadCount });
  } catch (error) {
    logError(error, `GET_UNREAD_COUNT_${req.params.userId}`);
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// =====================================================
// PASSWORD MANAGEMENT ENDPOINTS
// =====================================================

// Import services
const passwordService = require('./passwordService');
const avatarService = require('./avatarService');

// Request password reset (user-initiated)
app.post('/api/auth/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`🔄 Password reset requested for: ${email}`);
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Validate email domain against whitelist
    if (!passwordService.isEmailDomainAllowed(email)) {
      console.log(`❌ Email domain not allowed: ${email}`);
      return res.status(403).json({ 
        error: 'Email domain not allowed for password reset',
        message: 'Only company email addresses are allowed for password reset'
      });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if user exists
    const userResult = await client.query(`
      SELECT id, email, username, first_name, last_name, is_active 
      FROM users 
      WHERE email = $1
    `, [email]);
    
    client.release();
    
    if (userResult.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      // Don't reveal if user exists or not for security
      return res.json({ 
        success: true, 
        message: 'If the email address exists in our system, you will receive a password reset link shortly.' 
      });
    }
    
    const user = userResult.rows[0];
    
    if (!user.is_active) {
      console.log(`❌ Inactive user: ${email}`);
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Generate reset token
    const resetToken = passwordService.generateResetToken();
    passwordService.storeResetToken(email, resetToken);
    
    // Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`;
    
    // Generate email content
    const emailContent = passwordService.generateResetEmailContent(resetToken, resetUrl);
    
    // TODO: Send email using your email service
    // For now, just log the token (in production, send actual email)
    console.log(`📧 Password reset email would be sent to: ${email}`);
    console.log(`🔗 Reset URL: ${resetUrl}?token=${resetToken}`);
    
    // In production, replace this with actual email sending:
    // await emailService.sendEmail(email, emailContent.subject, emailContent.html, emailContent.text);
    
    console.log(`✅ Password reset request processed for: ${email}`);
    res.json({ 
      success: true, 
      message: 'If the email address exists in our system, you will receive a password reset link shortly.' 
    });
    
  } catch (error) {
    console.error('❌ Error requesting password reset:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log('🔄 Password reset with token requested');
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    // Validate token
    const tokenValidation = passwordService.validateResetToken(token);
    if (!tokenValidation.isValid) {
      console.log(`❌ Invalid reset token: ${tokenValidation.error}`);
      return res.status(400).json({ error: tokenValidation.error });
    }
    
    // Validate password strength
    const passwordValidation = passwordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      console.log(`❌ Password validation failed:`, passwordValidation.errors);
      return res.status(400).json({ 
        error: 'Password does not meet requirements',
        details: passwordValidation.errors 
      });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Hash new password
    const hashedPassword = await passwordService.hashPassword(newPassword);
    
    // Update user password
    const updateResult = await client.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW() 
      WHERE email = $2 
      RETURNING id, email, username
    `, [hashedPassword, tokenValidation.email]);
    
    client.release();
    
    if (updateResult.rows.length === 0) {
      console.log(`❌ User not found for password reset: ${tokenValidation.email}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Mark token as used
    passwordService.markTokenAsUsed(token);
    
    console.log(`✅ Password reset successful for: ${tokenValidation.email}`);
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Admin set password for user
app.post('/api/admin/users/:id/set-password', authenticateToken, requirePermission('UserManagement'), async (req, res) => {
  try {
    const { id } = req.params;
    const { sendEmail = true } = req.body;
    
    console.log(`🔄 Admin password set requested for user: ${id}`);
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if user exists
    const userResult = await client.query(`
      SELECT id, email, username, first_name, last_name, is_active 
      FROM users 
      WHERE id = $1
    `, [id]);
    
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    if (!user.is_active) {
      client.release();
      return res.status(403).json({ error: 'Cannot set password for deactivated user' });
    }
    
    // Generate temporary password
    const temporaryPassword = passwordService.generateTemporaryPassword();
    const hashedPassword = await passwordService.hashPassword(temporaryPassword);
    
    // Update user password
    await client.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW() 
      WHERE id = $2
    `, [hashedPassword, id]);
    
    client.release();
    
    // Send email if requested
    if (sendEmail) {
      const emailContent = passwordService.generateAdminPasswordEmailContent(user.email, temporaryPassword);
      
      // TODO: Send email using your email service
      console.log(`📧 Admin password set email would be sent to: ${user.email}`);
      console.log(`🔑 Temporary password: ${temporaryPassword}`);
      
      // In production, replace this with actual email sending:
      // await emailService.sendEmail(user.email, emailContent.subject, emailContent.html, emailContent.text);
    }
    
    console.log(`✅ Admin password set successful for: ${user.email}`);
    res.json({ 
      success: true, 
      message: 'Password has been set successfully',
      temporaryPassword: sendEmail ? undefined : temporaryPassword // Only return if not sending email
    });
    
  } catch (error) {
    console.error('❌ Error setting admin password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// Change password (user-initiated from profile)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    
    console.log(`🔄 Password change requested for user: ${userId}`);
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Validate password strength
    const passwordValidation = passwordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      console.log(`❌ Password validation failed:`, passwordValidation.errors);
      return res.status(400).json({ 
        error: 'New password does not meet requirements',
        details: passwordValidation.errors 
      });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Get current user password hash
    const userResult = await client.query(`
      SELECT password_hash, email 
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isCurrentPasswordValid = await passwordService.verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      client.release();
      console.log(`❌ Invalid current password for user: ${userId}`);
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await passwordService.hashPassword(newPassword);
    
    // Update password
    await client.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW() 
      WHERE id = $2
    `, [hashedPassword, userId]);
    
    client.release();
    
    console.log(`✅ Password change successful for user: ${userId}`);
    res.json({ 
      success: true, 
      message: 'Password has been changed successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Validate reset token (for frontend)
app.get('/api/auth/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const tokenValidation = passwordService.validateResetToken(token);
    
    if (tokenValidation.isValid) {
      res.json({ 
        valid: true, 
        email: tokenValidation.email 
      });
    } else {
      res.json({ 
        valid: false, 
        error: tokenValidation.error 
      });
    }
    
  } catch (error) {
    console.error('❌ Error validating reset token:', error);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

// Get password requirements (for frontend)
app.get('/api/auth/password-requirements', (req, res) => {
  res.json({
    requirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.'
  });
});

// =====================================================
// AVATAR MANAGEMENT ENDPOINTS
// =====================================================

// Upload avatar
app.post('/api/users/:id/avatar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    console.log(`🖼️ Avatar upload requested for user: ${id}`);
    console.log(`📁 Request files:`, req.files ? Object.keys(req.files) : 'No files');
    console.log(`📁 Request headers:`, Object.keys(req.headers));
    console.log(`📁 Content-Type:`, req.headers['content-type']);
    console.log(`📁 Content-Length:`, req.headers['content-length']);
    console.log(`🔑 Authorization header:`, req.headers.authorization ? 'Present' : 'Missing');
    console.log(`🔑 User from token:`, req.user);
    console.log(`📁 Request body type:`, typeof req.body);
    console.log(`📁 Request body keys:`, req.body ? Object.keys(req.body) : 'No body');
    
    // Check if user is updating their own avatar or has admin rights
    if (id !== userId && !req.user.permissions.includes('UserManagement')) {
      console.log(`❌ Authorization failed: user ${userId} trying to update ${id}`);
      return res.status(403).json({ error: 'Not authorized to update this user\'s avatar' });
    }
    
    // Check if file was uploaded
    if (!req.files || !req.files.avatar) {
      console.log(`❌ No avatar file provided in request`);
      return res.status(400).json({ error: 'No avatar file provided' });
    }
    
    const file = req.files.avatar;
    const buffer = file.data;
    const mimeType = file.mimetype;
    
    console.log(`📁 Received avatar: ${file.name}, size: ${buffer.length} bytes, type: ${mimeType}`);
    console.log(`🔍 File object keys:`, Object.keys(file));
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Get current avatar info for cleanup
    const currentAvatarResult = await client.query(`
      SELECT avatar_url, avatar_storage_type 
      FROM users 
      WHERE id = $1
    `, [id]);
    
    if (currentAvatarResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentAvatar = currentAvatarResult.rows[0];
    
    // Store new avatar
    const avatarInfo = await avatarService.storeAvatar(id, buffer, mimeType, file.name);
    
    // Update user record
    await client.query(`
      UPDATE users 
      SET 
        avatar_data = $1,
        avatar_url = $2,
        avatar_mime_type = $3,
        avatar_storage_type = $4,
        avatar_size = $5,
        updated_at = NOW()
      WHERE id = $6
    `, [
      avatarInfo.avatarData,
      avatarInfo.avatarUrl,
      avatarInfo.avatarMimeType,
      avatarInfo.avatarStorageType,
      avatarInfo.avatarSize,
      id
    ]);
    
    // Clean up old avatar if it was stored externally
    if (currentAvatar.avatar_storage_type === 'url' && currentAvatar.avatar_url) {
      await avatarService.deleteAvatar(id, currentAvatar.avatar_url, currentAvatar.avatar_storage_type);
    }
    
    client.release();
    
    console.log(`✅ Avatar uploaded successfully for user: ${id}`);
    const response = { 
      success: true, 
      message: 'Avatar uploaded successfully',
      avatarInfo: {
        storageType: avatarInfo.avatarStorageType,
        size: avatarInfo.avatarSize,
        mimeType: avatarInfo.avatarMimeType
      }
    };
    
    if (avatarInfo.optimization) {
      response.avatarInfo.optimization = avatarInfo.optimization;
    }
    
    console.log(`📤 Sending response:`, JSON.stringify(response, null, 2));
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    const errorResponse = { 
      error: 'Failed to upload avatar',
      details: error.message 
    };
    console.log(`📤 Sending error response:`, JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

// Get avatar
app.get('/api/users/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🖼️ Avatar request for user: ${id}`);
    
    const pool = await getPool();
    const client = await pool.connect();
    
    const userResult = await client.query(`
      SELECT avatar_data, avatar_url, avatar_mime_type, avatar_storage_type
      FROM users 
      WHERE id = $1
    `, [id]);
    
    client.release();
    
    if (userResult.rows.length === 0) {
      console.log(`❌ User not found: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    console.log(`📁 User avatar data:`, {
      hasData: !!user.avatar_data,
      hasUrl: !!user.avatar_url,
      mimeType: user.avatar_mime_type,
      storageType: user.avatar_storage_type
    });
    
    const avatar = await avatarService.getAvatar(
      id, 
      user.avatar_data, 
      user.avatar_url, 
      user.avatar_mime_type, 
      user.avatar_storage_type
    );
    
    console.log(`✅ Avatar retrieved successfully for user: ${id}`);
    res.json({ 
      success: true, 
      avatar 
    });
    
  } catch (error) {
    console.error('❌ Error getting avatar:', error);
    res.status(500).json({ error: 'Failed to get avatar' });
  }
});

// Delete avatar
app.delete('/api/users/:id/avatar', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user is deleting their own avatar or has admin rights
    if (id !== userId && !req.user.permissions.includes('UserManagement')) {
      return res.status(403).json({ error: 'Not authorized to delete this user\'s avatar' });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Get current avatar info
    const userResult = await client.query(`
      SELECT avatar_url, avatar_storage_type 
      FROM users 
      WHERE id = $1
    `, [id]);
    
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Delete avatar files
    await avatarService.deleteAvatar(id, user.avatar_url, user.avatar_storage_type);
    
    // Clear avatar data from database
    await client.query(`
      UPDATE users 
      SET 
        avatar_data = NULL,
        avatar_url = NULL,
        avatar_mime_type = NULL,
        avatar_storage_type = 'none',
        avatar_size = NULL,
        updated_at = NOW()
      WHERE id = $1
    `, [id]);
    
    client.release();
    
    console.log(`✅ Avatar deleted successfully for user: ${id}`);
    res.json({ 
      success: true, 
      message: 'Avatar deleted successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error deleting avatar:', error);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
});

// Get avatar storage statistics (admin only)
app.get('/api/admin/avatar-stats', authenticateToken, requirePermission('SystemConfiguration'), async (req, res) => {
  try {
    const stats = await avatarService.getStorageStats();
    res.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('❌ Error getting avatar stats:', error);
    res.status(500).json({ error: 'Failed to get avatar statistics' });
  }
});

// =====================================================
// ADMIN UTILITY ENDPOINTS
// =====================================================

// Update admin roles (temporary endpoint for migration)
app.post('/api/admin/update-roles', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Updating admin roles...');
    debugApi('Updating admin roles');
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Update all admin users to system_admin
    const updateResult = await client.query(`
      UPDATE users 
      SET global_role = 'system_admin' 
      WHERE global_role = 'admin'
    `);
    
    console.log(`✅ Updated ${updateResult.rowCount} users from 'admin' to 'system_admin'`);
    
    // Get current user distribution
    const countResult = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN global_role = 'system_admin' THEN 1 END) as system_admins,
        COUNT(CASE WHEN global_role = 'project_admin' THEN 1 END) as project_admins,
        COUNT(CASE WHEN global_role = 'user' THEN 1 END) as regular_users,
        COUNT(CASE WHEN global_role = 'guest' THEN 1 END) as guests
      FROM users
    `);
    
    const usersResult = await client.query(`
      SELECT 
        id,
        email,
        username,
        first_name,
        last_name,
        global_role,
        is_active
      FROM users 
      ORDER BY created_at
    `);
    
    client.release();
    
    console.log('✅ Admin role update completed successfully');
    res.json({
      success: true,
      message: `Updated ${updateResult.rowCount} users from 'admin' to 'system_admin'`,
      userDistribution: countResult.rows[0],
      users: usersResult.rows
    });
    
  } catch (error) {
    logError(error, 'UPDATE_ADMIN_ROLES');
    console.error('Error updating admin roles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update admin roles',
      details: error.message
    });
  }
});

// =====================================================
// HEALTH CHECK ENDPOINTS
// =====================================================

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Salesfive Platform API'
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    console.log('🏥 Database health check requested');
    debugDb('Database health check');
    
    const pool = await getPool();
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    
    console.log('✅ Database health check passed');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    logError(error, 'DATABASE_HEALTH_CHECK');
    console.error('❌ Database health check failed');
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Start server with enhanced error handling
app.listen(PORT, async () => {
  console.log(`🚀 Notification API Server running on port ${PORT}`);
  console.log('🔧 Starting database initialization...');
  
  try {
    await initializeDatabase();
    console.log('✅ Server startup completed successfully');
  } catch (error) {
    logError(error, 'SERVER_STARTUP');
    console.error('❌ Server startup failed');
    process.exit(1);
  }
});

// Export both app and getPool
module.exports = { app, getPool };