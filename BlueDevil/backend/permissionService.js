const fs = require('fs');
const path = require('path');

class PermissionService {
  constructor() {
    this.permissions = this.loadPermissions();
    this.permissionSets = this.loadPermissionSets();
  }

  // Load available permissions from permissions.def
  loadPermissions() {
    try {
      const permissionsPath = path.join(__dirname, 'permissions.def');
      const content = fs.readFileSync(permissionsPath, 'utf8');
      
      return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(permission => ({
          id: permission,
          name: permission,
          category: this.getPermissionCategory(permission)
        }));
    } catch (error) {
      console.error('Error loading permissions:', error);
      return [];
    }
  }

  // Load permission sets from permission-sets.def
  loadPermissionSets() {
    try {
      const setsPath = path.join(__dirname, 'permission-sets.def');
      const content = fs.readFileSync(setsPath, 'utf8');
      
      const sets = {};
      let currentSet = null;
      
      content.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
          // New permission set
          currentSet = trimmedLine.slice(1, -1);
          sets[currentSet] = [];
        } else if (trimmedLine && !trimmedLine.startsWith('#') && currentSet) {
          // Permission in current set
          sets[currentSet].push(trimmedLine);
        }
      });
      
      return sets;
    } catch (error) {
      console.error('Error loading permission sets:', error);
      return {};
    }
  }

  // Get category for a permission
  getPermissionCategory(permission) {
    const categories = {
      'UserManagement': 'User Management',
      'UserProfile': 'User Management',
      'UserRoles': 'User Management',
      'UserPermissions': 'User Management',
      'ProjectManagement': 'Project Management',
      'ProjectCreation': 'Project Management',
      'ProjectDeletion': 'Project Management',
      'ProjectMembers': 'Project Management',
      'ProjectData': 'Project Management',
      'SystemSettings': 'System Administration',
      'SystemConfiguration': 'System Administration',
      'SystemMonitoring': 'System Administration',
      'SystemLogs': 'System Administration',
      'AIAgents': 'AI Features',
      'AIWorkflows': 'AI Features',
      'AIAnalytics': 'AI Features',
      'AITraining': 'AI Features',
      'DataModeling': 'Data Management',
      'DataImport': 'Data Management',
      'DataExport': 'Data Management',
      'DataValidation': 'Data Management',
      'Reports': 'Reporting',
      'ReportCreation': 'Reporting',
      'ReportExport': 'Reporting',
      'ReportScheduling': 'Reporting',
      'Notifications': 'Notifications',
      'NotificationSettings': 'Notifications',
      'NotificationTemplates': 'Notifications',
      'AuditLogs': 'Audit & Security',
      'SecuritySettings': 'Audit & Security',
      'AccessControl': 'Audit & Security',
      'DataPrivacy': 'Audit & Security',
      'KnowledgeBase': 'Knowledge Management',
      'WorkshopManagement': 'Knowledge Management',
      'DocumentManagement': 'Knowledge Management',
      'ContentCreation': 'Knowledge Management',
      'RfPExtraction': 'Pre-Sales Features',
      'RfPAnalysis': 'Pre-Sales Features',
      'ProjectDesign': 'Pre-Sales Features',
      'StakeholderManagement': 'Pre-Sales Features',
      'SolutionDesign': 'Solution Features',
      'ProcessMining': 'Solution Features',
      'DataModelingAssist': 'Solution Features',
      'SolutionDashboard': 'Solution Features',
      'ChatSystem': 'Communication',
      'EmailIntegration': 'Communication',
      'VideoIntegration': 'Communication',
      'AudioIntegration': 'Communication',
      'APIAccess': 'Integration',
      'ThirdPartyIntegration': 'Integration',
      'WebhookManagement': 'Integration',
      'DataSync': 'Integration'
    };
    
    return categories[permission] || 'Other';
  }

  // Get all available permissions
  getAllPermissions() {
    return this.permissions;
  }

  // Get all permission sets
  getAllPermissionSets() {
    return Object.keys(this.permissionSets).map(setName => ({
      id: setName,
      name: setName,
      permissions: this.permissionSets[setName],
      description: this.getPermissionSetDescription(setName)
    }));
  }

  // Get permissions for a specific set
  getPermissionSet(setName) {
    return this.permissionSets[setName] || [];
  }

  // Get description for a permission set
  getPermissionSetDescription(setName) {
    const descriptions = {
      'FullAdministrator': 'Complete system access including user management, project management, and system settings',
      'UserManagementAdministrator': 'Can manage users but not system settings',
      'ProjectAdministrator': 'Can manage projects and their data',
      'AISpecialist': 'Access to AI features and data management',
      'DataAnalyst': 'Access to data and reporting features',
      'PreSalesSpecialist': 'Access to pre-sales features',
      'SolutionDesigner': 'Access to solution design features',
      'CommunicationSpecialist': 'Access to communication features',
      'IntegrationSpecialist': 'Access to integration features',
      'BasicUser': 'Limited access to core features',
      'GuestUser': 'Minimal access'
    };
    
    return descriptions[setName] || 'Custom permission set';
  }

  // Check if user has a specific permission
  hasPermission(userPermissions, permission) {
    return userPermissions.includes(permission);
  }

  // Check if user has any permission from a set
  hasAnyPermissionFromSet(userPermissions, permissionSet) {
    const setPermissions = this.getPermissionSet(permissionSet);
    return setPermissions.some(permission => userPermissions.includes(permission));
  }

  // Check if user has all permissions from a set
  hasAllPermissionsFromSet(userPermissions, permissionSet) {
    const setPermissions = this.getPermissionSet(permissionSet);
    return setPermissions.every(permission => userPermissions.includes(permission));
  }

  // Add permissions from a set to user
  addPermissionSetToUser(userPermissions, permissionSet) {
    const setPermissions = this.getPermissionSet(permissionSet);
    const newPermissions = [...new Set([...userPermissions, ...setPermissions])];
    return newPermissions;
  }

  // Remove permissions from a set from user
  removePermissionSetFromUser(userPermissions, permissionSet) {
    const setPermissions = this.getPermissionSet(permissionSet);
    return userPermissions.filter(permission => !setPermissions.includes(permission));
  }

  // Validate permissions
  validatePermissions(permissions) {
    const validPermissions = this.permissions.map(p => p.id);
    return permissions.every(permission => validPermissions.includes(permission));
  }

  // Validate permission sets
  validatePermissionSets(permissionSets) {
    const validSets = Object.keys(this.permissionSets);
    
    // Map old names to new names
    const nameMapping = {
      'UserManager': 'UserManagementAdministrator',
      'ProjectManager': 'ProjectAdministrator',
      'FullAdmin': 'FullAdministrator'
    };
    
    // Check if all permission sets are valid (including mapped names)
    return permissionSets.every(set => {
      // Check if it's a valid set name
      if (validSets.includes(set)) {
        return true;
      }
      
      // Check if it's a mapped name
      const mappedName = nameMapping[set];
      if (mappedName && validSets.includes(mappedName)) {
        return true;
      }
      
      return false;
    });
  }
  
  // Get effective permissions for a user (including sets) with name mapping
  getEffectivePermissions(userPermissions, userPermissionSets = []) {
    let effectivePermissions = [...userPermissions];
    
    // Map old names to new names
    const nameMapping = {
      'UserManager': 'UserManagementAdministrator',
      'ProjectManager': 'ProjectAdministrator',
      'FullAdmin': 'FullAdministrator'
    };
    
    // Add permissions from all assigned sets
    userPermissionSets.forEach(setName => {
      // Use mapped name if available, otherwise use original name
      const actualSetName = nameMapping[setName] || setName;
      effectivePermissions = this.addPermissionSetToUser(effectivePermissions, actualSetName);
    });
    
    return [...new Set(effectivePermissions)];
  }

  // =====================================================
  // DATABASE INTEGRATION FUNCTIONS
  // =====================================================

  // Get user permissions from database (CENTRAL FUNCTION)
  async getUserPermissionsFromDatabase(userId, pool) {
    try {
      console.log(`🔐 Getting permissions from database for user ${userId}`);
      
      const client = await pool.connect();
      
      // First, try to get permissions from new tables
      try {
        // Check if new tables exist
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'user_permissions'
          );
        `);
        
        if (tableCheck.rows[0].exists) {
          // Get direct permissions from new table
          const directPermissionsResult = await client.query(`
            SELECT permission_id 
            FROM user_permissions 
            WHERE user_id = $1 AND is_active = true 
            AND (expires_at IS NULL OR expires_at > NOW())
          `, [userId]);
          
          // Get permission sets from new table
          const permissionSetsResult = await client.query(`
            SELECT permission_set_id 
            FROM user_permission_sets 
            WHERE user_id = $1 AND is_active = true 
            AND (expires_at IS NULL OR expires_at > NOW())
          `, [userId]);
          
          const directPermissions = directPermissionsResult.rows.map(row => row.permission_id);
          const permissionSets = permissionSetsResult.rows.map(row => row.permission_set_id);
          
          // Get effective permissions
          const effectivePermissions = this.getEffectivePermissions(directPermissions, permissionSets);
          
          console.log(`✅ Retrieved permissions from new tables for user ${userId}:`);
          console.log(`  Direct permissions: ${directPermissions.length}`);
          console.log(`  Permission sets: ${permissionSets.length}`);
          console.log(`  Effective permissions: ${effectivePermissions.length}`);
          
          client.release();
          return {
            directPermissions,
            permissionSets,
            effectivePermissions
          };
        }
      } catch (error) {
        console.log('⚠️ New permission tables not available, falling back to custom_data');
      }
      
      // Fallback to custom_data (old system)
      console.log(`🔄 Falling back to custom_data for user ${userId}`);
      const userResult = await client.query(`
        SELECT custom_data FROM users WHERE id = $1
      `, [userId]);
      
      client.release();
      
      if (userResult.rows.length === 0) {
        console.log('❌ User not found for permission fetch');
        return {
          directPermissions: [],
          permissionSets: [],
          effectivePermissions: []
        };
      }
      
      const userData = userResult.rows[0].custom_data || {};
      const userPermissions = userData.permissions || [];
      const userPermissionSets = userData.permissionSets || [];
      
      // Get effective permissions (including sets)
      const effectivePermissions = this.getEffectivePermissions(userPermissions, userPermissionSets);
      
      console.log(`✅ Retrieved permissions from custom_data for user ${userId}:`);
      console.log(`  Direct permissions: ${userPermissions.length}`);
      console.log(`  Permission sets: ${userPermissionSets.length}`);
      console.log(`  Effective permissions: ${effectivePermissions.length}`);
      
      return {
        directPermissions: userPermissions,
        permissionSets: userPermissionSets,
        effectivePermissions: effectivePermissions
      };
    } catch (error) {
      console.error('❌ Error getting user permissions from database:', error);
      // Return empty permissions on error
      return {
        directPermissions: [],
        permissionSets: [],
        effectivePermissions: []
      };
    }
  }

  // Check if user has specific permission (CENTRAL FUNCTION)
  // Check if user is active
  async isUserActive(userId, pool) {
    try {
      const result = await pool.query(`
        SELECT is_active FROM users WHERE id = $1
      `, [userId]);
      
      if (result.rows.length === 0) {
        return false;
      }
      
      return result.rows[0].is_active;
    } catch (error) {
      console.error('❌ Error checking user active status:', error);
      return false;
    }
  }

  async checkUserPermission(userId, requiredPermission, pool) {
    try {
      console.log(`🔐 Checking permission '${requiredPermission}' for user ${userId}`);
      
      // First check if user is active
      const isActive = await this.isUserActive(userId, pool);
      if (!isActive) {
        console.log('❌ User is inactive');
        return false;
      }
      
      const userPermissions = await this.getUserPermissionsFromDatabase(userId, pool);
      const hasPermission = userPermissions.effectivePermissions.includes(requiredPermission);
      
      console.log(`✅ Permission check result: ${hasPermission} for '${requiredPermission}'`);
      return hasPermission;
    } catch (error) {
      console.error('❌ Error checking user permission:', error);
      return false;
    }
  }

  // Update user permissions in database (CENTRAL FUNCTION)
  async updateUserPermissions(userId, permissions, permissionSets, grantedBy, pool) {
    try {
      console.log(`🔐 Updating permissions for user ${userId}`);
      console.log(`  Direct permissions: ${permissions?.length || 0}`);
      console.log(`  Permission sets: ${permissionSets?.length || 0}`);
      
      const client = await pool.connect();
      
      // First, try to update permissions in new tables
      try {
        // Check if new tables exist
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'user_permissions'
          );
        `);
        
        if (tableCheck.rows[0].exists) {
          // Start transaction
          await client.query('BEGIN');
          
          try {
            // Clear existing permissions
            await client.query(`
              UPDATE user_permissions 
              SET is_active = false 
              WHERE user_id = $1
            `, [userId]);
            
            await client.query(`
              UPDATE user_permission_sets 
              SET is_active = false 
              WHERE user_id = $1
            `, [userId]);
            
            // Add new direct permissions
            if (permissions && permissions.length > 0) {
              for (const permission of permissions) {
                await client.query(`
                  INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
                  VALUES ($1, $2, $3, NOW())
                  ON CONFLICT (user_id, permission_id) 
                  DO UPDATE SET 
                    is_active = true,
                    granted_by = $3,
                    granted_at = NOW(),
                    expires_at = NULL
                `, [userId, permission, grantedBy]);
              }
            }
            
            // Add new permission sets
            if (permissionSets && permissionSets.length > 0) {
              for (const permissionSet of permissionSets) {
                await client.query(`
                  INSERT INTO user_permission_sets (user_id, permission_set_id, granted_by, granted_at)
                  VALUES ($1, $2, $3, NOW())
                  ON CONFLICT (user_id, permission_set_id) 
                  DO UPDATE SET 
                    is_active = true,
                    granted_by = $3,
                    granted_at = NOW(),
                    expires_at = NULL
                `, [userId, permissionSet, grantedBy]);
              }
            }
            
            // Commit transaction
            await client.query('COMMIT');
            
            console.log(`✅ Successfully updated permissions in new tables for user ${userId}`);
            
            // Return updated permissions
            return await this.getUserPermissionsFromDatabase(userId, pool);
          } catch (error) {
            await client.query('ROLLBACK');
            throw error;
          } finally {
            client.release();
          }
        }
      } catch (error) {
        console.log('⚠️ New permission tables not available, falling back to custom_data');
      }
      
      // Fallback to custom_data (old system)
      console.log(`🔄 Falling back to custom_data for user ${userId}`);
      
      // Get current user data
      const userResult = await client.query(`
        SELECT custom_data FROM users WHERE id = $1
      `, [userId]);
      
      if (userResult.rows.length === 0) {
        console.log('❌ User not found for permission update');
        client.release();
        throw new Error('User not found');
      }
      
      const currentData = userResult.rows[0].custom_data || {};
      const updatedData = {
        ...currentData,
        permissions: permissions || currentData.permissions || [],
        permissionSets: permissionSets || currentData.permissionSets || []
      };
      
      console.log(`🔍 Current data:`, currentData);
      console.log(`🔍 Updated data:`, updatedData);
      
      // Update user
      await client.query(`
        UPDATE users SET custom_data = $1 WHERE id = $2
      `, [JSON.stringify(updatedData), userId]);
      
      client.release();
      
      console.log('✅ User permissions updated successfully in custom_data');
      
      // Return updated permissions
      return await this.getUserPermissionsFromDatabase(userId, pool);
    } catch (error) {
      console.error('❌ Error updating user permissions:', error);
      throw error;
    }
  }

  // Get all users with their permissions (for admin interface)
  async getAllUsersWithPermissions(pool) {
    try {
      console.log('🔐 Getting all users with permissions');
      
      const client = await pool.connect();
      
      // First, try to get permissions from new tables
      try {
        // Check if new tables exist
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'user_permissions'
          );
        `);
        
        if (tableCheck.rows[0].exists) {
          const result = await client.query(`
            SELECT 
              u.id,
              u.username,
              u.email,
              u.first_name,
              u.last_name,
              u.global_role,
              u.is_active,
              array_agg(DISTINCT up.permission_id) FILTER (WHERE up.permission_id IS NOT NULL) as direct_permissions,
              array_agg(DISTINCT ups.permission_set_id) FILTER (WHERE ups.permission_set_id IS NOT NULL) as permission_sets
            FROM users u
            LEFT JOIN user_permissions up ON u.id = up.user_id AND up.is_active = true
            LEFT JOIN user_permission_sets ups ON u.id = ups.user_id AND ups.is_active = true
            GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.global_role, u.is_active
            ORDER BY u.username
          `);
          
          client.release();
          
          // Process results to include effective permissions
          const users = result.rows.map(row => {
            const directPermissions = row.direct_permissions || [];
            const permissionSets = row.permission_sets || [];
            const effectivePermissions = this.getEffectivePermissions(directPermissions, permissionSets);
            
            return {
              id: row.id,
              username: row.username,
              email: row.email,
              firstName: row.first_name,
              lastName: row.last_name,
              globalRole: row.global_role,
              isActive: row.is_active,
              directPermissions,
              permissionSets,
              effectivePermissions
            };
          });
          
          console.log(`✅ Retrieved ${users.length} users with permissions from new tables`);
          return users;
        }
      } catch (error) {
        console.log('⚠️ New permission tables not available, falling back to custom_data');
      }
      
      // Fallback to custom_data (old system)
      console.log('🔄 Falling back to custom_data for all users');
      const result = await client.query(`
        SELECT 
          id,
          username,
          email,
          first_name,
          last_name,
          global_role,
          is_active,
          custom_data
        FROM users
        ORDER BY username
      `);
      
      client.release();
      
      // Process results to include effective permissions from custom_data
      const users = result.rows.map(row => {
        const userData = row.custom_data || {};
        const directPermissions = userData.permissions || [];
        const permissionSets = userData.permissionSets || [];
        const effectivePermissions = this.getEffectivePermissions(directPermissions, permissionSets);
        
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          globalRole: row.global_role,
          isActive: row.is_active,
          directPermissions,
          permissionSets,
          effectivePermissions
        };
      });
      
      console.log(`✅ Retrieved ${users.length} users with permissions from custom_data`);
      return users;
    } catch (error) {
      console.error('❌ Error getting all users with permissions:', error);
      return [];
    }
  }

  // Get available permissions and permission sets (for admin interface)
  async getAvailablePermissionsAndSets() {
    return {
      permissions: this.getAllPermissions(),
      permissionSets: this.getAllPermissionSets()
    };
  }

  // Validate permissions before saving
  validatePermissionsForSave(permissions, permissionSets) {
    const errors = [];
    
    // Validate individual permissions
    if (permissions && permissions.length > 0) {
      const validPermissions = this.permissions.map(p => p.id);
      const invalidPermissions = permissions.filter(p => !validPermissions.includes(p));
      if (invalidPermissions.length > 0) {
        errors.push(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }
    }
    
    // Validate permission sets
    if (permissionSets && permissionSets.length > 0) {
      const validSets = Object.keys(this.permissionSets);
      const invalidSets = permissionSets.filter(s => !validSets.includes(s));
      if (invalidSets.length > 0) {
        errors.push(`Invalid permission sets: ${invalidSets.join(', ')}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new PermissionService();
