const { hasPermission, getUserPermissions } = require('../permissionMiddleware');

// Simple permission check function for backend
const checkPermission = (user, permission) => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.globalRole === 'admin') return true;
  
  return hasPermission(user, permission);
};

// Permission check middleware factory
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (checkPermission(req.user, permission)) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Access denied', 
        message: `Permission '${permission}' required`,
        user: req.user.username,
        requiredPermission: permission
      });
    }
  };
};

// Multiple permissions check (ANY)
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    for (const permission of permissions) {
      if (checkPermission(req.user, permission)) {
        return next();
      }
    }
    
    res.status(403).json({ 
      error: 'Access denied', 
      message: `One of permissions required: ${permissions.join(', ')}`,
      user: req.user.username,
      requiredPermissions: permissions
    });
  };
};

// Multiple permissions check (ALL)
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    for (const permission of permissions) {
      if (!checkPermission(req.user, permission)) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: `All permissions required: ${permissions.join(', ')}`,
          user: req.user.username,
          requiredPermissions: permissions,
          missingPermission: permission
        });
      }
    }
    
    next();
  };
};

// Permission check in route handlers
const withPermission = (permission, handler) => {
  return (req, res, next) => {
    if (!checkPermission(req.user, permission)) {
      return res.status(403).json({ 
        error: 'Access denied', 
        message: `Permission '${permission}' required`,
        user: req.user?.username,
        requiredPermission: permission
      });
    }
    
    return handler(req, res, next);
  };
};

// Permission check in business logic
const hasPermissionFor = (user, permission) => {
  return checkPermission(user, permission);
};

// Get user permissions for business logic
const getUserPermissionsFor = (user) => {
  return getUserPermissions(user);
};

// Permission-based response helper
const respondWithPermission = (req, res, permission, successHandler) => {
  if (!checkPermission(req.user, permission)) {
    return res.status(403).json({ 
      error: 'Access denied', 
      message: `Permission '${permission}' required`,
      user: req.user?.username,
      requiredPermission: permission
    });
  }
  
  return successHandler(req, res);
};

module.exports = {
  checkPermission,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  withPermission,
  hasPermissionFor,
  getUserPermissionsFor,
  respondWithPermission
};
