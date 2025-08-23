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
  avatar_data BYTEA,
  avatar_mime_type VARCHAR(50),
  avatar_storage_type VARCHAR(20) DEFAULT 'url' CHECK (avatar_storage_type IN ('url', 'database', 'none')),
  avatar_size INTEGER,
  phone VARCHAR(20),
  global_role VARCHAR(20) DEFAULT 'user' CHECK (global_role IN ('system_admin', 'project_admin', 'user', 'guest')),
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

-- User Permissions Table (Individual user permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(user_id, permission_id)
);

-- User Permission Sets Table (Permission set assignments)
CREATE TABLE IF NOT EXISTS user_permission_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_set_id VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(user_id, permission_set_id)
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
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_global_role ON users(global_role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- User permissions indexes
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_is_active ON user_permissions(is_active);

-- User permission sets indexes
CREATE INDEX IF NOT EXISTS idx_user_permission_sets_user_id ON user_permission_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_sets_set_id ON user_permission_sets(permission_set_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_sets_is_active ON user_permission_sets(is_active);

-- Project indexes
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- Project memberships indexes
CREATE INDEX IF NOT EXISTS idx_project_memberships_user ON project_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_project ON project_memberships(project_id);
CREATE INDEX IF NOT EXISTS idx_project_memberships_role ON project_memberships(role);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_project ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Project data indexes
CREATE INDEX IF NOT EXISTS idx_project_data_project ON project_data(project_id);
CREATE INDEX IF NOT EXISTS idx_project_data_type ON project_data(data_type);
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
    -- System Admin can access all projects
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user_id')::UUID 
      AND users.global_role = 'system_admin'
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
    -- System Admin can see all memberships
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user_id')::UUID 
      AND users.global_role = 'system_admin'
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
    -- System Admin can access all data
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user_id')::UUID 
      AND users.global_role = 'system_admin'
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
    -- System Admin can see all logs
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user_id')::UUID 
      AND users.global_role = 'system_admin'
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

-- Insert default system admin user (password: 'admin123')
INSERT INTO users (
  email, username, password_hash, first_name, last_name, 
  global_role, is_active
) VALUES (
  'admin@salesfive.com', 
  'admin', 
  '$2b$10$AcLI1.7X8vc8AWmbTo0JL.DvxPFuT4F9CR2nnFD/2LUBWeldC48mq',
  'Admin', 
  'User', 
  'system_admin', 
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

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for user permissions with effective permissions
CREATE OR REPLACE VIEW user_effective_permissions AS
SELECT 
  u.id as user_id,
  u.username,
  u.email,
  u.global_role,
  -- Direct permissions
  array_agg(DISTINCT up.permission_id) FILTER (WHERE up.permission_id IS NOT NULL) as direct_permissions,
  -- Permission sets
  array_agg(DISTINCT ups.permission_set_id) FILTER (WHERE ups.permission_set_id IS NOT NULL) as permission_sets,
  -- Combined permissions (for display)
  array_agg(DISTINCT up.permission_id) FILTER (WHERE up.permission_id IS NOT NULL) || 
  array_agg(DISTINCT ups.permission_set_id) FILTER (WHERE ups.permission_set_id IS NOT NULL) as all_permissions
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id AND up.is_active = true
LEFT JOIN user_permission_sets ups ON u.id = ups.user_id AND ups.is_active = true
GROUP BY u.id, u.username, u.email, u.global_role;

-- View for project members with permissions
CREATE OR REPLACE VIEW project_members_with_permissions AS
SELECT 
  pm.project_id,
  pm.user_id,
  u.username,
  u.email,
  pm.role,
  pm.permissions as project_permissions,
  pm.joined_at,
  pm.last_accessed
FROM project_memberships pm
JOIN users u ON pm.user_id = u.id
WHERE pm.is_active = true AND u.is_active = true;

-- =====================================================
-- KNOWLEDGE MANAGEMENT SYSTEM
-- =====================================================

-- Knowledge Folders Table
CREATE TABLE IF NOT EXISTS knowledge_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES knowledge_folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  path VARCHAR(1000) NOT NULL, -- Full path for easy querying
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Knowledge Documents Table
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES knowledge_folders(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('markdown', 'pdf', 'text', 'other')),
  content_hash VARCHAR(64), -- For content deduplication
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Document Versions Table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT, -- For markdown/text files
  file_path VARCHAR(1000), -- For PDFs and other files
  change_description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- Document Tags Table
CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(document_id, tag)
);

-- Agent Submissions Table (for MCP server)
CREATE TABLE IF NOT EXISTS agent_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_id VARCHAR(255) NOT NULL,
  agent_name VARCHAR(255),
  submission_type VARCHAR(50) NOT NULL CHECK (submission_type IN ('document', 'text', 'file')),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_path VARCHAR(1000),
  file_name VARCHAR(255),
  mime_type VARCHAR(100),
  target_folder_id UUID REFERENCES knowledge_folders(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES users(id)
);

-- Indexes for Knowledge Management
CREATE INDEX IF NOT EXISTS idx_knowledge_folders_project ON knowledge_folders(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_folders_parent ON knowledge_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_folders_path ON knowledge_folders(path);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_project ON knowledge_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_folder ON knowledge_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_type ON knowledge_documents(file_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created_by ON knowledge_documents(created_by);

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_number ON document_versions(version_number);

CREATE INDEX IF NOT EXISTS idx_document_tags_document ON document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag ON document_tags(tag);

CREATE INDEX IF NOT EXISTS idx_agent_submissions_project ON agent_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_submissions_agent ON agent_submissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_submissions_status ON agent_submissions(status);
CREATE INDEX IF NOT EXISTS idx_agent_submissions_type ON agent_submissions(submission_type);

-- RLS Policies for Knowledge Management
ALTER TABLE knowledge_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_submissions ENABLE ROW LEVEL SECURITY;

-- Knowledge folders policies
CREATE POLICY knowledge_folders_select_policy ON knowledge_folders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = knowledge_folders.project_id 
      AND pm.user_id = current_setting('app.current_user_id')::UUID
    )
  );

CREATE POLICY knowledge_folders_insert_policy ON knowledge_folders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = knowledge_folders.project_id 
      AND pm.user_id = current_setting('app.current_user_id')::UUID
      AND pm.role IN ('owner', 'admin', 'member')
    )
  );

-- Knowledge documents policies
CREATE POLICY knowledge_documents_select_policy ON knowledge_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = knowledge_documents.project_id 
      AND pm.user_id = current_setting('app.current_user_id')::UUID
    )
  );

CREATE POLICY knowledge_documents_insert_policy ON knowledge_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = knowledge_documents.project_id 
      AND pm.user_id = current_setting('app.current_user_id')::UUID
      AND pm.role IN ('owner', 'admin', 'member')
    )
  );

-- Agent submissions policies (agents can submit, users can view/process)
CREATE POLICY agent_submissions_select_policy ON agent_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_memberships pm 
      WHERE pm.project_id = agent_submissions.project_id 
      AND pm.user_id = current_setting('app.current_user_id')::UUID
    )
  );

CREATE POLICY agent_submissions_insert_policy ON agent_submissions
  FOR INSERT WITH CHECK (true); -- Allow all inserts (agents)

-- =====================================================
-- EMAIL TEMPLATE SYSTEM
-- =====================================================

-- Email Templates Table (Project-specific email templates)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  process_name VARCHAR(100) NOT NULL, -- Unique process identifier (e.g., 'password_reset', 'registration_notification', '2fa_email')
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  -- Ensure unique process names per project
  UNIQUE(project_id, process_name)
);

-- Email Template Parameters Table (Available placeholders for each template)
CREATE TABLE IF NOT EXISTS email_template_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  parameter_name VARCHAR(100) NOT NULL, -- e.g., 'USER_NAME', 'RESET_URL', 'TEMP_PASSWORD'
  parameter_type VARCHAR(50) NOT NULL DEFAULT 'string', -- string, url, email, date, number
  description TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  validation_regex VARCHAR(255), -- Optional regex for validation
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique parameter names per template
  UNIQUE(template_id, parameter_name)
);

-- Email Template Usage Log Table (Audit trail for email sending)
CREATE TABLE IF NOT EXISTS email_template_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_user_id UUID REFERENCES users(id),
  process_name VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  parameters_used JSONB NOT NULL, -- Store the actual parameters used
  sent_at TIMESTAMP DEFAULT NOW(),
  sent_by UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'sent', -- sent, failed, pending
  error_message TEXT,
  email_provider VARCHAR(50), -- smtp, sendgrid, etc.
  email_id VARCHAR(255) -- External email service ID for tracking
);

-- Email Configuration Table (Project-specific email settings)
CREATE TABLE IF NOT EXISTS email_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'smtp', -- smtp, sendgrid, mailgun, etc.
  host VARCHAR(255),
  port INTEGER,
  username VARCHAR(255),
  password_encrypted TEXT,
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  reply_to_email VARCHAR(255),
  use_ssl BOOLEAN DEFAULT TRUE,
  use_tls BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  -- Ensure one configuration per project
  UNIQUE(project_id)
);

-- Default Email Templates (System-wide defaults)
CREATE TABLE IF NOT EXISTS default_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default templates for common processes
INSERT INTO default_email_templates (process_name, subject, html_content, text_content, description) VALUES
(
  'password_reset',
  'Password Reset Request - Salesfive Platform',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
      <h1>Salesfive Platform</h1>
      <h2>Password Reset Request</h2>
    </div>
    
    <div style="padding: 30px; background: #f9f9f9;">
      <p>Hello {{{USER_NAME}}},</p>
      
      <p>We received a request to reset your password for your Salesfive Platform account.</p>
      
      <p>If you didn''t request this password reset, please ignore this email.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{{RESET_URL}}}" 
           style="background: #0025D1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p><strong>Important:</strong></p>
      <ul>
        <li>This link will expire in {{{EXPIRY_HOURS}}} hours</li>
        <li>You can only use this link once</li>
        <li>If the link doesn''t work, copy and paste this URL into your browser:</li>
      </ul>
      
      <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px;">
        {{{RESET_URL}}}
      </p>
      
      <p>Best regards,<br>Salesfive Platform Team</p>
    </div>
    
    <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>',
  'Password Reset Request - Salesfive Platform

Hello {{{USER_NAME}}},

We received a request to reset your password for your Salesfive Platform account.

If you didn''t request this password reset, please ignore this email.

To reset your password, click the following link:
{{{RESET_URL}}}

Important:
- This link will expire in {{{EXPIRY_HOURS}}} hours
- You can only use this link once

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.',
  'Default template for password reset emails'
),
(
  'registration_notification',
  'Welcome to Salesfive Platform - Your Account Has Been Created',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
      <h1>Salesfive Platform</h1>
      <h2>Welcome!</h2>
    </div>
    
    <div style="padding: 30px; background: #f9f9f9;">
      <p>Hello {{{USER_NAME}}},</p>
      
      <p>Welcome to the Salesfive Platform! Your account has been created successfully.</p>
      
      <p><strong>Your login credentials:</strong></p>
      <ul>
        <li><strong>Email:</strong> {{{USER_EMAIL}}}</li>
        <li><strong>Username:</strong> {{{USERNAME}}}</li>
        <li><strong>Temporary Password:</strong> {{{TEMP_PASSWORD}}}</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{{LOGIN_URL}}}" 
           style="background: #0025D1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Login to Platform
        </a>
      </div>
      
      <p><strong>Important:</strong></p>
      <ul>
        <li>Please change your password immediately after your first login</li>
        <li>This temporary password is only valid for your first login</li>
        <li>You can change your password in your profile settings</li>
      </ul>
      
      <p>Best regards,<br>Salesfive Platform Team</p>
    </div>
    
    <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>',
  'Welcome to Salesfive Platform - Your Account Has Been Created

Hello {{{USER_NAME}}},

Welcome to the Salesfive Platform! Your account has been created successfully.

Your login credentials:
- Email: {{{USER_EMAIL}}}
- Username: {{{USERNAME}}}
- Temporary Password: {{{TEMP_PASSWORD}}}

To access the platform, visit: {{{LOGIN_URL}}}

Important:
- Please change your password immediately after your first login
- This temporary password is only valid for your first login
- You can change your password in your profile settings

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.',
  'Default template for new user registration notifications'
),
(
  '2fa_email',
  'Two-Factor Authentication Code - Salesfive Platform',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
      <h1>Salesfive Platform</h1>
      <h2>Two-Factor Authentication</h2>
    </div>
    
    <div style="padding: 30px; background: #f9f9f9;">
      <p>Hello {{{USER_NAME}}},</p>
      
      <p>You have requested a two-factor authentication code for your Salesfive Platform account.</p>
      
      <p><strong>Your authentication code is:</strong></p>
      <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; font-family: monospace; font-size: 24px; margin: 20px 0; letter-spacing: 3px;">
        {{{AUTH_CODE}}}
      </div>
      
      <p><strong>Important:</strong></p>
      <ul>
        <li>This code will expire in {{{EXPIRY_MINUTES}}} minutes</li>
        <li>If you didn''t request this code, please ignore this email</li>
        <li>Never share this code with anyone</li>
      </ul>
      
      <p>Best regards,<br>Salesfive Platform Team</p>
    </div>
    
    <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>',
  'Two-Factor Authentication Code - Salesfive Platform

Hello {{{USER_NAME}}},

You have requested a two-factor authentication code for your Salesfive Platform account.

Your authentication code is: {{{AUTH_CODE}}}

Important:
- This code will expire in {{{EXPIRY_MINUTES}}} minutes
- If you didn''t request this code, please ignore this email
- Never share this code with anyone

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.',
  'Default template for two-factor authentication emails'
);

-- Insert default parameters for each template
INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'USER_NAME',
  'string',
  'Full name of the user',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = 'password_reset';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'RESET_URL',
  'url',
  'Password reset URL with token',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = 'password_reset';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'EXPIRY_HOURS',
  'number',
  'Number of hours until the reset link expires',
  FALSE,
  '1'
FROM default_email_templates t WHERE t.process_name = 'password_reset';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'USER_NAME',
  'string',
  'Full name of the user',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = 'registration_notification';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'USER_EMAIL',
  'email',
  'Email address of the user',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = 'registration_notification';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'USERNAME',
  'string',
  'Username for login',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = 'registration_notification';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'TEMP_PASSWORD',
  'string',
  'Temporary password for first login',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = 'registration_notification';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'LOGIN_URL',
  'url',
  'URL to the login page',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = 'registration_notification';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'USER_NAME',
  'string',
  'Full name of the user',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = '2fa_email';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'AUTH_CODE',
  'string',
  'Six-digit authentication code',
  TRUE,
  NULL
FROM default_email_templates t WHERE t.process_name = '2fa_email';

INSERT INTO email_template_parameters (template_id, parameter_name, parameter_type, description, is_required, default_value) 
SELECT 
  t.id,
  'EXPIRY_MINUTES',
  'number',
  'Number of minutes until the code expires',
  FALSE,
  '10'
FROM default_email_templates t WHERE t.process_name = '2fa_email';

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default knowledge permissions
INSERT INTO permission_definitions (resource, action, description, category, is_system) VALUES
('Knowledge', 'view', 'View knowledge documents and folders', 'knowledge', true),
('Knowledge', 'create', 'Create new documents and folders', 'knowledge', true),
('Knowledge', 'edit', 'Edit existing documents', 'knowledge', true),
('Knowledge', 'delete', 'Delete documents and folders', 'knowledge', true),
('Knowledge', 'upload', 'Upload files to knowledge base', 'knowledge', true),
('Knowledge', 'process_agent_submissions', 'Process agent submissions', 'knowledge', true)
ON CONFLICT (resource, action) DO NOTHING;

-- Create root knowledge folder for each project
INSERT INTO knowledge_folders (project_id, name, description, path, created_by)
SELECT 
  p.id,
  'Root',
  'Root knowledge folder',
  '/',
  p.owner_id
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_folders kf 
  WHERE kf.project_id = p.id AND kf.path = '/'
);

-- Global email configuration table
CREATE TABLE IF NOT EXISTS global_email_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_user VARCHAR(255),
  smtp_pass VARCHAR(255),
  smtp_secure BOOLEAN DEFAULT FALSE,
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default global configuration if none exists
INSERT INTO global_email_configuration (smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name)
SELECT 'smtp.gmail.com', 587, 'noreply@yourcompany.com', '', false, 'noreply@yourcompany.com', 'Salesfive Platform'
WHERE NOT EXISTS (SELECT 1 FROM global_email_configuration);

-- 2FA Email Verification table
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_code VARCHAR(6) NOT NULL,
  email_sent_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_2fa_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_expires_at ON two_factor_auth(expires_at);
