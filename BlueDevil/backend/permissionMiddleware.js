const fs = require('fs');
const path = require('path');

// Load permission definitions
function loadPermissions() {
  const permissionsPath = path.join(__dirname, 'permissions.def');
  const permissionSetsPath = path.join(__dirname, 'permission-sets.def');
  
  const permissions = fs.readFileSync(permissionsPath, 'utf8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.trim());
  
  const permissionSets = {};
  const permissionSetsContent = fs.readFileSync(permissionSetsPath, 'utf8');
  const lines = permissionSetsContent.split('\n');
  
  let currentSet = null;
  for (const line of lines) {
    if (line.startsWith('[') && line.endsWith(']')) {
      currentSet = line.slice(1, -1);
      permissionSets[currentSet] = [];
    } else if (line.trim() && !line.startsWith('#') && currentSet) {
      permissionSets[currentSet].push(line.trim());
    }
  }
  
  return { permissions, permissionSets };
}

// Check if user has specific permission
function hasPermission(user, requiredPermission) {
  console.log(`🔐 Checking permission: ${requiredPermission} for user: ${user.username}`);
  
  // Admin has all permissions
  if (user.globalRole === 'admin') {
    console.log('✅ Admin user - access granted');
    return true;
  }
  
  // Get user's permission sets from custom data
  const userPermissionSets = user.customData?.permissionSets || [];
  const { permissionSets } = loadPermissions();
  
  // Check if user has any permission set that includes the required permission
  for (const permissionSet of userPermissionSets) {
    if (permissionSets[permissionSet] && permissionSets[permissionSet].includes(requiredPermission)) {
      console.log(`✅ Permission granted via set: ${permissionSet}`);
      return true;
    }
  }
  
  // Check individual permissions
  const userPermissions = user.customData?.permissions || [];
  if (userPermissions.includes(requiredPermission)) {
    console.log(`✅ Direct permission granted: ${requiredPermission}`);
    return true;
  }
  
  console.log(`❌ Permission denied: ${requiredPermission}`);
  return false;
}

// Middleware to require specific permission
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (hasPermission(req.user, permission)) {
      next();
    } else {
      console.log(`❌ Access denied: User ${req.user.username} lacks permission: ${permission}`);
      res.status(403).json({ 
        error: 'Access denied', 
        message: `Permission '${permission}' required`,
        user: req.user.username,
        requiredPermission: permission
      });
    }
  };
}

// Middleware to require any of multiple permissions
function requireAnyPermission(permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    for (const permission of permissions) {
      if (hasPermission(req.user, permission)) {
        console.log(`✅ Access granted via permission: ${permission}`);
        return next();
      }
    }
    
    console.log(`❌ Access denied: User ${req.user.username} lacks any of permissions: ${permissions.join(', ')}`);
    res.status(403).json({ 
      error: 'Access denied', 
      message: `One of permissions required: ${permissions.join(', ')}`,
      user: req.user.username,
      requiredPermissions: permissions
    });
  };
}

// Middleware to require all permissions
function requireAllPermissions(permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    for (const permission of permissions) {
      if (!hasPermission(req.user, permission)) {
        console.log(`❌ Access denied: User ${req.user.username} lacks permission: ${permission}`);
        return res.status(403).json({ 
          error: 'Access denied', 
          message: `All permissions required: ${permissions.join(', ')}`,
          user: req.user.username,
          requiredPermissions: permissions,
          missingPermission: permission
        });
      }
    }
    
    console.log(`✅ Access granted: User ${req.user.username} has all required permissions`);
    next();
  };
}

// Get user's permissions
function getUserPermissions(user) {
  const { permissionSets } = loadPermissions();
  const userPermissionSets = user.customData?.permissionSets || [];
  const userPermissions = user.customData?.permissions || [];
  
  let allPermissions = [...userPermissions];
  
  // Add permissions from permission sets
  for (const permissionSet of userPermissionSets) {
    if (permissionSets[permissionSet]) {
      allPermissions = [...allPermissions, ...permissionSets[permissionSet]];
    }
  }
  
  // Remove duplicates
  return [...new Set(allPermissions)];
}

module.exports = {
  hasPermission,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  getUserPermissions,
  loadPermissions
};
