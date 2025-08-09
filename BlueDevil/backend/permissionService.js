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

  // Get effective permissions for a user (including sets)
  getEffectivePermissions(userPermissions, userPermissionSets = []) {
    let effectivePermissions = [...userPermissions];
    
    // Add permissions from all assigned sets
    userPermissionSets.forEach(setName => {
      effectivePermissions = this.addPermissionSetToUser(effectivePermissions, setName);
    });
    
    return [...new Set(effectivePermissions)];
  }

  // Validate permissions
  validatePermissions(permissions) {
    const validPermissions = this.permissions.map(p => p.id);
    return permissions.every(permission => validPermissions.includes(permission));
  }

  // Validate permission sets
  validatePermissionSets(permissionSets) {
    const validSets = Object.keys(this.permissionSets);
    return permissionSets.every(set => validSets.includes(set));
  }
}

module.exports = new PermissionService();
