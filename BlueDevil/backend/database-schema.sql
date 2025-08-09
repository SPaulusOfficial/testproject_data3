-- =====================================================
-- Salesfive AI Platform - Database Schema
-- Combined User Management & Project Isolation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users Table (Core user management)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  global_role VARCHAR(20) DEFAULT 'user' CHECK (global_role IN ('admin', 'user', 'guest')),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(32),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_login TIMESTAMP,
  -- Flexible custom data for future extensions
  custom_data JSONB DEFAULT '{}',
  -- Versioned metadata for tracking changes
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Projects Table (Projects = Tenants in simplified model)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  environment_config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Project Memberships Table (User-Project relationships)
CREATE TABLE IF NOT EXISTS project_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  profile_data JSONB DEFAULT '{}', -- Project-specific user profile
  settings JSONB DEFAULT '{}', -- Project-specific user settings
  last_accessed TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Permission Definitions Table
CREATE TABLE IF NOT EXISTS permission_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(resource, action)
);

-- Roles Table for Permission Management
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PROJECT-SPECIFIC DATA TABLES
-- =====================================================

-- Project Data Table (Generic data storage per project)
CREATE TABLE IF NOT EXISTS project_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  data_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_global_role ON users(global_role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- Project memberships indexes
CREATE INDEX IF NOT EXISTS idx_project_memberships_user_id ON project_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_project_id ON project_memberships(project_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_role ON project_memberships(role);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);

-- Project data indexes
CREATE INDEX IF NOT EXISTS idx_project_data_project_id ON project_data(project_id);
CREATE INDEX IF NOT EXISTS idx_project_data_data_type ON project_data(data_type);
CREATE INDEX IF NOT EXISTS idx_project_data_created_by ON project_data(created_by);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Project access policies
DROP POLICY IF EXISTS project_access_policy ON projects;
CREATE POLICY project_access_policy ON projects
  FOR ALL USING (
    -- Admin can access all projects
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user_id')::UUID 
      AND users.global_role = 'admin'
    )
    OR
    -- User can access projects they're members of
    EXISTS (
      SELECT 1 FROM project_memberships 
      WHERE project_memberships.project_id = projects.id 
      AND project_memberships.user_id = current_setting('app.current_user_id')::UUID
    )
  );

-- Project membership policies
DROP POLICY IF EXISTS membership_access_policy ON project_memberships;
CREATE POLICY membership_access_policy ON project_memberships
  FOR ALL USING (
    -- Admin can see all memberships
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user_id')::UUID 
      AND users.global_role = 'admin'
    )
    OR
    -- Users can see their own memberships
    user_id = current_setting('app.current_user_id')::UUID
    OR
    -- Project admins can see memberships in their projects
    EXISTS (
      SELECT 1 FROM project_memberships pm
      WHERE pm.project_id = project_memberships.project_id
      AND pm.user_id = current_setting('app.current_user_id')::UUID
      AND pm.role IN ('owner', 'admin')
    )
  );

-- Project data policies
DROP POLICY IF EXISTS project_data_access_policy ON project_data;
CREATE POLICY project_data_access_policy ON project_data
  FOR ALL USING (
    -- Admin can access all data
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user_id')::UUID 
      AND users.global_role = 'admin'
    )
    OR
    -- Users can access data in projects they're members of
    EXISTS (
      SELECT 1 FROM project_memberships 
      WHERE project_memberships.project_id = project_data.project_id 
      AND project_memberships.user_id = current_setting('app.current_user_id')::UUID
    )
  );

-- Audit logs policies
DROP POLICY IF EXISTS audit_logs_access_policy ON audit_logs;
CREATE POLICY audit_logs_access_policy ON audit_logs
  FOR ALL USING (
    -- Admin can see all logs
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user_id')::UUID 
      AND users.global_role = 'admin'
    )
    OR
    -- Users can see their own logs
    user_id = current_setting('app.current_user_id')::UUID
    OR
    -- Project admins can see logs in their projects
    EXISTS (
      SELECT 1 FROM project_memberships pm
      WHERE pm.project_id = audit_logs.project_id
      AND pm.user_id = current_setting('app.current_user_id')::UUID
      AND pm.role IN ('owner', 'admin')
    )
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_data_updated_at ON project_data;
CREATE TRIGGER update_project_data_updated_at BEFORE UPDATE ON project_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_project_id UUID DEFAULT NULL,
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_severity VARCHAR(20) DEFAULT 'info',
  p_category VARCHAR(50) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, project_id, action, resource_type, resource_id, 
    details, severity, category, ip_address, user_agent
  ) VALUES (
    p_user_id, p_project_id, p_action, p_resource_type, p_resource_id,
    p_details, p_severity, p_category,
    current_setting('app.current_ip_address', TRUE)::TEXT,
    current_setting('app.current_user_agent', TRUE)
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA (Optional)
-- =====================================================

-- Insert default admin user (password: 'admin123')
INSERT INTO users (
  email, username, password_hash, first_name, last_name, 
  global_role, is_active
) VALUES (
  'admin@salesfive.com', 
  'admin', 
  '$2b$10$AcLI1.7X8vc8AWmbTo0JL.DvxPFuT4F9CR2nnFD/2LUBWeldC48mq',
  'Admin', 
  'User', 
  'admin', 
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert default project
INSERT INTO projects (
  name, slug, description, owner_id
) VALUES (
  'Default Project',
  'default',
  'Default project for the platform',
  (SELECT id FROM users WHERE email = 'admin@salesfive.com')
) ON CONFLICT (slug) DO NOTHING;

-- Add admin to default project
INSERT INTO project_memberships (
  user_id, project_id, role
) VALUES (
  (SELECT id FROM users WHERE email = 'admin@salesfive.com'),
  (SELECT id FROM projects WHERE slug = 'default'),
  'owner'
) ON CONFLICT (user_id, project_id) DO NOTHING;

-- Insert normal user (password: 'user123')
INSERT INTO users (
  email, username, password_hash, first_name, last_name, 
  global_role, is_active
) VALUES (
  'user@salesfive.com', 
  'user', 
  '$2b$10$RfvL8sujuwa20fD3e3ih6OfRYdeRigRCJeJ7B6kjM201lRwLRJK3O',
  'Normal', 
  'User', 
  'user', 
  true
) ON CONFLICT (email) DO NOTHING;

-- Add normal user to default project as member
INSERT INTO project_memberships (
  user_id, project_id, role
) VALUES (
  (SELECT id FROM users WHERE email = 'user@salesfive.com'),
  (SELECT id FROM projects WHERE slug = 'default'),
  'member'
) ON CONFLICT (user_id, project_id) DO NOTHING;

-- Insert permission definitions
INSERT INTO permission_definitions (resource, action, description, category, is_system) VALUES
-- Admin permissions
('admin', 'read', 'View admin panel and system information', 'Administration', true),
('admin', 'write', 'Modify admin settings', 'Administration', true),
('admin', 'delete', 'Delete admin data', 'Administration', true),
('admin', 'execute', 'Execute admin functions', 'Administration', true),

-- User Management permissions
('user_management', 'read', 'View user list and details', 'User Management', true),
('user_management', 'write', 'Create and edit users', 'User Management', true),
('user_management', 'delete', 'Delete users', 'User Management', true),
('user_management', 'execute', 'Execute user management functions', 'User Management', true),

-- Project Management permissions
('project_management', 'read', 'View projects and project details', 'Project Management', true),
('project_management', 'write', 'Create and edit projects', 'Project Management', true),
('project_management', 'delete', 'Delete projects', 'Project Management', true),
('project_management', 'execute', 'Execute project management functions', 'Project Management', true),

-- Project Members permissions
('project_members', 'read', 'View project members', 'Project Management', true),
('project_members', 'write', 'Add and edit project members', 'Project Management', true),
('project_members', 'delete', 'Remove project members', 'Project Management', true),

-- Project Data permissions
('project_data', 'read', 'View project data', 'Project Data', true),
('project_data', 'write', 'Create and edit project data', 'Project Data', true),
('project_data', 'delete', 'Delete project data', 'Project Data', true),

-- System Settings permissions
('system_settings', 'read', 'View system settings', 'System', true),
('system_settings', 'write', 'Modify system settings', 'System', true),
('system_settings', 'delete', 'Delete system settings', 'System', true),
('system_settings', 'execute', 'Execute system functions', 'System', true),

-- Audit Logs permissions
('audit_logs', 'read', 'View audit logs', 'Audit', true),
('audit_logs', 'write', 'Create audit log entries', 'Audit', true),
('audit_logs', 'delete', 'Delete audit logs', 'Audit', true),

-- Notification permissions
('notifications', 'read', 'View notifications', 'Notifications', true),
('notifications', 'write', 'Create notifications', 'Notifications', true),
('notifications', 'delete', 'Delete notifications', 'Notifications', true),

-- Custom permissions (examples for future use)
('ai_agents', 'read', 'View AI agents', 'AI Features', false),
('ai_agents', 'write', 'Create and edit AI agents', 'AI Features', false),
('ai_agents', 'execute', 'Execute AI agent functions', 'AI Features', false),
('workflows', 'read', 'View workflows', 'Workflows', false),
('workflows', 'write', 'Create and edit workflows', 'Workflows', false),
('workflows', 'execute', 'Execute workflows', 'Workflows', false),
('reports', 'read', 'View reports', 'Reports', false),
('reports', 'write', 'Create and edit reports', 'Reports', false),
('reports', 'export', 'Export reports', 'Reports', false);

-- Insert initial roles
INSERT INTO roles (name, description, permissions, is_system) VALUES
('Full Administrator', 'Complete system access including user management, project management, and system settings', 
 '[
   {"resource": "admin", "actions": ["read", "write", "delete", "execute"], "scope": "all"},
   {"resource": "user_management", "actions": ["read", "write", "delete", "execute"], "scope": "all"},
   {"resource": "project_management", "actions": ["read", "write", "delete", "execute"], "scope": "all"},
   {"resource": "system_settings", "actions": ["read", "write", "delete", "execute"], "scope": "all"},
   {"resource": "audit_logs", "actions": ["read", "write", "delete"], "scope": "all"}
 ]', true),
('User Management Administrator', 'Can manage users but not system settings',
 '[
   {"resource": "user_management", "actions": ["read", "write", "delete", "execute"], "scope": "all"},
   {"resource": "project_management", "actions": ["read", "write"], "scope": "all"},
   {"resource": "audit_logs", "actions": ["read"], "scope": "all"}
 ]', true),
('Project Administrator', 'Can manage projects and their members',
 '[
   {"resource": "project_management", "actions": ["read", "write", "delete"], "scope": "all"},
   {"resource": "project_members", "actions": ["read", "write", "delete"], "scope": "all"},
   {"resource": "project_data", "actions": ["read", "write"], "scope": "all"}
 ]', true),
('Project Member', 'Standard project access',
 '[
   {"resource": "project_data", "actions": ["read", "write"], "scope": "own"},
   {"resource": "project_members", "actions": ["read"], "scope": "all"}
 ]', true),
('Project Viewer', 'Read-only access to projects',
 '[
   {"resource": "project_data", "actions": ["read"], "scope": "all"},
   {"resource": "project_members", "actions": ["read"], "scope": "all"}
 ]', true);
