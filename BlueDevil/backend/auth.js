const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Mock users database (in production, this would be a real database)
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@salesfive.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'admin',
    projects: ['project1', 'project2']
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@salesfive.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    role: 'user',
    projects: ['project1']
  }
];

// Generate JWT token
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    projects: user.projects
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Authenticate user with username/password
async function authenticateUser(username, password) {
  const user = users.find(u => u.username === username || u.email === username);
  
  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  return user;
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Middleware to check if user has access to a specific project
function checkProjectAccess(req, res, next) {
  const { projectId } = req.params;
  const user = req.user;

  // Admin has access to all projects
  if (user.role === 'admin') {
    return next();
  }

  // Check if user has access to the project
  if (user.projects && user.projects.includes(projectId)) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied to this project' });
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateUser,
  authenticateToken,
  checkProjectAccess,
  requireAdmin,
  users
};
