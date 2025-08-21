const fs = require('fs');
const path = require('path');
const permissionService = require('./permissionService');

// Function to get pool safely - avoid circular dependency
async function getPoolSafely() {
  if (typeof global.getPool === 'function') {
    return await global.getPool();
  }
  return null;
}

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
async function hasPermission(user, requiredPermission) {
  console.log(`🔐 Checking permission: ${requiredPermission} for user: ${user.username}`);
  console.log(`🔐 User ID: ${user.userId}`);
  
  // Check if user is active first
  if (user.isActive === false) {
    console.log('❌ User is inactive - access denied');
    return false;
  }
  
  // Admins have all permissions (if active)
  if (user.globalRole === 'admin' || user.globalRole === 'system_admin' || user.globalRole === 'project_admin') {
    console.log('✅ Admin user - access granted');
    return true;
  }
  
  // Use EXACT same logic as permission API
  try {
    if (!getPool) {
      console.error('❌ getPool not available, falling back to user object');
      // Fallback to user object data
      const userPermissions = user.customData?.permissions || [];
      const userPermissionSets = user.customData?.permissionSets || [];
      const effectivePermissions = permissionService.getEffectivePermissions(userPermissions, userPermissionSets);
      
      console.log(`🔍 FALLBACK CHECK for user ${user.username}:`);
      console.log(`🔍 User permissions:`, userPermissions);
      console.log(`🔍 User permission sets:`, userPermissionSets);
      console.log(`🔍 Effective permissions:`, effectivePermissions);
      
      return effectivePermissions.includes(requiredPermission);
    }
    
    // Use the same logic as permissionService.js
    const pool = await getPoolSafely();
    console.log('🔍 Debug: pool type:', typeof pool);
    console.log('🔍 Debug: pool constructor:', pool?.constructor?.name);
    console.log('🔍 Debug: pool has connect method:', typeof pool?.connect === 'function');
    
    if (pool && typeof pool.connect === 'function') {
      const userPermissions = await permissionService.getUserPermissionsFromDatabase(user.userId, pool);
      const hasPermission = userPermissions.effectivePermissions.includes(requiredPermission);
      
      console.log(`✅ Permission check result: ${hasPermission} for '${requiredPermission}'`);
      return hasPermission;
    } else {
      console.log('⚠️ No valid pool available, using fallback');
      throw new Error('No valid database pool available');
    }
  } catch (error) {
    console.error('❌ Error checking permission:', error);
    // Fallback to user object data on error
    const userPermissions = user.customData?.permissions || [];
    const userPermissionSets = user.customData?.permissionSets || [];
    const effectivePermissions = permissionService.getEffectivePermissions(userPermissions, userPermissionSets);
    
    console.log(`🔍 ERROR FALLBACK for user ${user.username}:`);
    console.log(`🔍 User permissions:`, userPermissions);
    console.log(`🔍 User permission sets:`, userPermissionSets);
    console.log(`🔍 Effective permissions:`, effectivePermissions);
    
    return effectivePermissions.includes(requiredPermission);
  }
}

// Middleware to require specific permission
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    hasPermission(req.user, permission).then(granted => {
      if (granted) {
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
    }).catch(error => {
      console.error('Error in requirePermission middleware:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  };
}

// Middleware to require any of multiple permissions
function requireAnyPermission(permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    Promise.all(permissions.map(permission => hasPermission(req.user, permission))).then(results => {
      const granted = results.some(granted => granted);
      if (granted) {
        console.log(`✅ Access granted via permission: ${permissions.join(', ')}`);
        return next();
      }
      console.log(`❌ Access denied: User ${req.user.username} lacks any of permissions: ${permissions.join(', ')}`);
      res.status(403).json({ 
        error: 'Access denied', 
        message: `One of permissions required: ${permissions.join(', ')}`,
        user: req.user.username,
        requiredPermissions: permissions
      });
    }).catch(error => {
      console.error('Error in requireAnyPermission middleware:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  };
}

// Middleware to require all permissions
function requireAllPermissions(permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    Promise.all(permissions.map(permission => hasPermission(req.user, permission))).then(results => {
      const allGranted = results.every(granted => granted);
      if (allGranted) {
        console.log(`✅ Access granted: User ${req.user.username} has all required permissions`);
        next();
      } else {
        const missingPermissions = results.filter(granted => !granted).map(permission => permission);
        console.log(`❌ Access denied: User ${req.user.username} lacks permission: ${missingPermissions.join(', ')}`);
        res.status(403).json({ 
          error: 'Access denied', 
          message: `All permissions required: ${permissions.join(', ')}`,
          user: req.user.username,
          requiredPermissions: permissions,
          missingPermissions: missingPermissions
        });
      }
    }).catch(error => {
      console.error('Error in requireAllPermissions middleware:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
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
