-- Drop and recreate knowledge_content table for Universal Knowledge API
DROP TABLE IF EXISTS knowledge_content CASCADE;

CREATE TABLE knowledge_content (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(project_id, content_type, name)
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_knowledge_content_project_id ON knowledge_content(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_content_type ON knowledge_content(content_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_content_created_by ON knowledge_content(created_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_content_updated_at ON knowledge_content(updated_at);

-- Add permissions for KnowledgeManagement and DataModeling
INSERT INTO permission_definitions (resource, action, description, created_at)
VALUES 
    ('KnowledgeManagement', 'view', 'View knowledge content', NOW()),
    ('KnowledgeManagement', 'create', 'Create knowledge content', NOW()),
    ('KnowledgeManagement', 'edit', 'Edit knowledge content', NOW()),
    ('KnowledgeManagement', 'delete', 'Delete knowledge content', NOW()),
    ('KnowledgeManagement', 'export', 'Export knowledge content', NOW()),
    ('DataModeling', 'view', 'View data models', NOW()),
    ('DataModeling', 'create', 'Create data models', NOW()),
    ('DataModeling', 'edit', 'Edit data models', NOW()),
    ('DataModeling', 'delete', 'Delete data models', NOW()),
    ('DataModeling', 'export', 'Export data models', NOW())
ON CONFLICT (resource, action) DO NOTHING;
