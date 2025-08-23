const express = require('express')
const KnowledgeService = require('./knowledgeService.js')
const userService = require('./userService.js')
const { requirePermission } = require('./permissionMiddleware.js')

const router = express.Router()

// Local auth middleware compatible with server token
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    console.log('🔐 authenticateToken - authHeader:', authHeader ? 'present' : 'missing');
    console.log('🔐 authenticateToken - token:', token ? 'present' : 'missing');
    
    if (!token) {
      console.log('🔐 authenticateToken - No token found in headers');
      return res.status(401).json({ error: 'Access token required' })
    }
    
    // Try to verify token with userService first
    try {
      const decoded = await userService.verifyToken(token)
      console.log('🔐 authenticateToken - Token verified with userService, user:', decoded?.userId || decoded?.id || 'unknown');
      console.log('🔐 authenticateToken - Full decoded token:', JSON.stringify(decoded, null, 2));
      req.user = decoded
      next()
    } catch (userServiceError) {
      console.log('🔐 authenticateToken - userService failed, trying jwt directly:', userServiceError.message);
      
      // Fallback: try direct JWT verification
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('🔐 authenticateToken - Token verified with direct JWT, user:', decoded?.userId || decoded?.id || 'unknown');
        console.log('🔐 authenticateToken - Full decoded token:', JSON.stringify(decoded, null, 2));
        req.user = decoded
        next()
      } catch (jwtError) {
        console.error('🔐 authenticateToken - Both verification methods failed:', jwtError.message);
        return res.status(403).json({ error: 'Invalid or expired token' })
      }
    }
  } catch (error) {
    console.error('🔐 authenticateToken - Error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// Helper to get service with DB pool
async function getKnowledgeService() {
  if (typeof global.getPool === 'function') {
    const pool = await global.getPool()
    return new KnowledgeService(pool)
  }
  // Fallback: construct without pool (will fail fast if used before server init)
  return new KnowledgeService(null)
}

// File validation function
const validateFile = (file) => {
  const allowedTypes = [
    'text/markdown',
    'application/pdf',
    'text/plain',
    'text/html',
    'application/json'
  ]
  
  if (allowedTypes.includes(file.mimetype) || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.pdf') || 
      file.name.endsWith('.txt')) {
    return true
  }
  return false
}

// Middleware to get current project
const getCurrentProject = async (req, res, next) => {
  try {
    // For GitHub endpoints, get projectId from URL params
    const projectId = req.params.projectId || req.headers['x-project-id'] || req.query.project_id
    console.log('📁 getCurrentProject - projectId:', projectId);
    console.log('📁 getCurrentProject - params:', req.params);
    console.log('📁 getCurrentProject - headers x-project-id:', req.headers['x-project-id']);
    console.log('📁 getCurrentProject - query project_id:', req.query.project_id);
    console.log('📁 getCurrentProject - user:', req.user?.userId || req.user?.id || 'unknown');
    
    if (!projectId) {
      console.log('📁 getCurrentProject - No project ID found');
      return res.status(400).json({ error: 'Project ID is required' })
    }
    
    console.log('📁 getCurrentProject - Using project ID:', projectId);
    req.currentProjectId = projectId
    next()
  } catch (error) {
    console.error('📁 getCurrentProject - Error:', error.message);
    res.status(500).json({ error: 'Failed to get current project' })
  }
}

// =====================================================
// FOLDER ENDPOINTS
// =====================================================

// Get folders
router.get('/folders', 
  authenticateToken, 
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { parent_folder_id } = req.query
      const knowledgeService = await getKnowledgeService()
      const folders = await knowledgeService.getFolders(req.currentProjectId, parent_folder_id)
      res.json(folders)
    } catch (error) {
      console.error('Error getting folders:', error)
      res.status(500).json({ error: 'Failed to get folders' })
    }
  }
)

// Create folder
router.post('/folders',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { parent_folder_id, name, description } = req.body
      
      if (!name) {
        return res.status(400).json({ error: 'Folder name is required' })
      }

      const knowledgeService = await getKnowledgeService()
      const folder = await knowledgeService.createFolder(
        req.currentProjectId,
        parent_folder_id,
        name,
        description,
        req.user.id
      )
      
      res.status(201).json(folder)
    } catch (error) {
      console.error('Error creating folder:', error)
      res.status(500).json({ error: error.message || 'Failed to create folder' })
    }
  }
)

// =====================================================
// DOCUMENT ENDPOINTS
// =====================================================

// Get documents
router.get('/documents',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { folder_id, search, file_type } = req.query
      const knowledgeService = await getKnowledgeService()
      const documents = await knowledgeService.getDocuments(
        req.currentProjectId,
        folder_id,
        search,
        file_type
      )
      res.json(documents)
    } catch (error) {
      console.error('Error getting documents:', error)
      res.status(500).json({ error: 'Failed to get documents' })
    }
  }
)

// Get single document
router.get('/documents/:id',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const knowledgeService = await getKnowledgeService()
      const document = await knowledgeService.getDocument(req.params.id, req.currentProjectId)
      if (!document) {
        return res.status(404).json({ error: 'Document not found' })
      }
      res.json(document)
    } catch (error) {
      console.error('Error getting document:', error)
      res.status(500).json({ error: 'Failed to get document' })
    }
  }
)

// Upload document
router.post('/documents',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      console.log('🚨 ===== DOCUMENT UPLOAD REQUEST START =====');
      console.log('🚨 Request method:', req.method);
      console.log('🚨 Request path:', req.path);
      console.log('🚨 Content-Type:', req.headers['content-type']);
      console.log('🚨 Project ID:', req.currentProjectId);
      console.log('🚨 User ID:', req.user.id);
      console.log('🚨 Request body keys:', Object.keys(req.body));
      console.log('🚨 Request files:', req.files ? Object.keys(req.files) : 'No files');
      console.log('🚨 req.files object:', req.files);
      console.log('🚨 req.body object:', req.body);
      
      if (!req.files || !req.files.file) {
        console.log('🚨 ERROR: No file uploaded!');
        console.log('🚨 req.files:', req.files);
        console.log('🚨 req.body:', req.body);
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const file = req.files.file
      console.log('🚨 File object:', {
        name: file.name,
        size: file.size,
        mimetype: file.mimetype,
        data: file.data ? 'Buffer present' : 'No data'
      });
      
      // Validate file type
      if (!validateFile(file)) {
        console.log('🚨 ERROR: Invalid file type');
        return res.status(400).json({ error: 'Invalid file type. Only markdown, PDF, and text files are allowed.' })
      }

      const { folder_id, title, description, tags } = req.body
      console.log('🚨 Form data:', { folder_id, title, description, tags });
      
      // Allow empty string or null for root folder
      if (folder_id === undefined) {
        console.log('🚨 ERROR: Folder ID is undefined');
        return res.status(400).json({ error: 'Folder ID is required' })
      }

      const metadata = {
        title: title || file.name,
        description: description || '',
        tags: tags ? tags.split(',').map(t => t.trim()) : []
      }
      console.log('🚨 Metadata:', metadata);

      console.log('🚨 Calling knowledgeService.uploadDocument...');
      const knowledgeService = await getKnowledgeService()
      const document = await knowledgeService.uploadDocument(
        req.currentProjectId,
        folder_id,
        file,
        metadata,
        req.user.id,
        req.user
      )
      console.log('🚨 Upload successful, returning document');
      console.log('🚨 ===== DOCUMENT UPLOAD REQUEST END =====');

      res.status(201).json(document)
    } catch (error) {
      console.error('🚨 ERROR in upload endpoint:', error)
      console.error('🚨 Error stack:', error.stack)
      res.status(500).json({ error: error.message || 'Failed to upload document' })
    }
  }
)

// Update document
router.put('/documents/:id',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { title, description, folder_id, content, change_description } = req.body
      
      const updates = {}
      if (title !== undefined) updates.title = title
      if (description !== undefined) updates.description = description
      if (folder_id !== undefined) updates.folder_id = folder_id
      if (content !== undefined) updates.content = content
      if (change_description !== undefined) updates.changeDescription = change_description

      const knowledgeService = await getKnowledgeService()
      const result = await knowledgeService.updateDocument(
        req.params.id,
        req.currentProjectId,
        updates,
        req.user.id
      )

      res.json(result)
    } catch (error) {
      console.error('Error updating document:', error)
      res.status(500).json({ error: error.message || 'Failed to update document' })
    }
  }
)

// Delete document
router.delete('/documents/:id',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const knowledgeService = await getKnowledgeService()
      const result = await knowledgeService.deleteDocument(req.params.id, req.currentProjectId)
      res.json(result)
    } catch (error) {
      console.error('Error deleting document:', error)
      res.status(500).json({ error: error.message || 'Failed to delete document' })
    }
  }
)

// Get document content
router.get('/documents/:id/content',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    console.log('📄 content endpoint - user:', req.user?.userId || req.user?.id || 'unknown');
    console.log('📄 content endpoint - projectId:', req.currentProjectId);
    console.log('📄 content endpoint - documentId:', req.params.id);
    console.log('📄 content endpoint - version:', req.query.version);
    
    try {
      const { version } = req.query
      const knowledgeService = await getKnowledgeService()
      
      let content
      if (version) {
        console.log('📄 content endpoint - Getting content for specific version:', version);
        content = await knowledgeService.getDocumentContentFromGit(req.params.id, req.currentProjectId, version)
      } else {
        console.log('📄 content endpoint - Getting latest content from Git HEAD');
        // Always get the latest content from Git (HEAD)
        try {
          content = await knowledgeService.getDocumentContentFromGit(req.params.id, req.currentProjectId, 'HEAD')
        } catch (error) {
          console.log('📄 content endpoint - Git content failed, falling back to database');
          const versionData = await knowledgeService.getDocumentContent(req.params.id)
          content = versionData?.content || ''
        }
      }
      
      console.log('📄 content endpoint - Content retrieved successfully, length:', content?.length || 0);
      res.json({ content })
    } catch (error) {
      console.error('📄 content endpoint - Error getting document content:', error)
      console.error('📄 content endpoint - Error stack:', error.stack)
      res.status(500).json({ error: 'Failed to get document content' })
    }
  }
)

// Get document versions
router.get('/documents/:id/versions',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    console.log('📁 versions endpoint - user:', req.user?.userId || req.user?.id || 'unknown');
    console.log('📁 versions endpoint - projectId:', req.currentProjectId);
    console.log('📁 versions endpoint - documentId:', req.params.id);
    
    try {
      const knowledgeService = await getKnowledgeService()
      
      // Use Git versions as single source of truth
      console.log('📁 versions endpoint - Using Git versions as single source of truth...');
      const versions = await knowledgeService.getDocumentVersionsFromGit(req.params.id, req.currentProjectId)
      
      console.log('📁 versions endpoint - Found versions:', versions.length);
      res.json(versions)
    } catch (error) {
      console.error('📁 versions endpoint - Error getting document versions:', error)
      res.status(500).json({ error: 'Failed to get document versions' })
    }
  }
)

// Create new document version
router.post('/documents/:id/versions',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`📝 [${timestamp}] create version endpoint - user:`, req.user?.userId || req.user?.id || 'unknown');
    console.log(`📝 [${timestamp}] create version endpoint - projectId:`, req.currentProjectId);
    console.log(`📝 [${timestamp}] create version endpoint - documentId:`, req.params.id);
    console.log(`📝 [${timestamp}] create version endpoint - body:`, req.body);
    console.log(`📝 [${timestamp}] create version endpoint - content type:`, typeof req.body.content);
    console.log(`📝 [${timestamp}] create version endpoint - content length:`, req.body.content?.length);
    console.log(`📝 [${timestamp}] create version endpoint - content preview:`, req.body.content?.substring(0, 100));
    
    try {
      const { content, change_summary, version_number } = req.body
      
      if (content === undefined || content === null) {
        console.log('📝 create version endpoint - ERROR: Content is required');
        console.log('📝 create version endpoint - req.body keys:', Object.keys(req.body));
        return res.status(400).json({ error: 'Content is required' })
      }
      
      // Allow empty content but not undefined/null
      console.log('📝 create version endpoint - Content validation passed');

      console.log('📝 create version endpoint - Getting knowledge service...');
      const knowledgeService = await getKnowledgeService()
      console.log('📝 create version endpoint - Knowledge service obtained');
      
      console.log('📝 create version endpoint - Calling updateDocumentWithGit...');
      const result = await knowledgeService.updateDocumentWithGit(
        req.params.id,
        req.currentProjectId,
        content,
        change_summary || `Version ${version_number || 'new'} - Updated content`,
        req.user?.userId || req.user?.id,
        req.user
      )

      console.log('📝 create version endpoint - result:', result);
      
      // Return success with version info
      res.json({
        success: true,
        version: result.version,
        commitHash: result.commitHash,
        message: 'Version created successfully'
      })
    } catch (error) {
      console.error('📝 create version endpoint - Error creating version:', error)
      console.error('📝 create version endpoint - Error stack:', error.stack)
      res.status(500).json({ error: error.message || 'Failed to create new version' })
    }
  }
)

// Update document with Git versioning
router.put('/documents/:id/content',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { content, description } = req.body
      
      if (!content) {
        return res.status(400).json({ error: 'Content is required' })
      }

      const knowledgeService = await getKnowledgeService()
      const result = await knowledgeService.updateDocumentWithGit(
        req.params.id,
        req.currentProjectId,
        content,
        description,
        req.user.id,
        req.user
      )

      res.json(result)
    } catch (error) {
      console.error('Error updating document:', error)
      res.status(500).json({ error: error.message || 'Failed to update document' })
    }
  }
)

// Get document diff
router.get('/documents/:id/diff',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      console.log(`🔍 diff endpoint - START - documentId: ${req.params.id}, projectId: ${req.currentProjectId}`);
      console.log(`🔍 diff endpoint - old_commit: ${req.query.old_commit}, new_commit: ${req.query.new_commit}`);
      
      const { old_commit, new_commit } = req.query
      
      if (!old_commit || !new_commit) {
        console.error(`🔍 diff endpoint - Missing parameters: old_commit=${old_commit}, new_commit=${new_commit}`);
        return res.status(400).json({ error: 'Both old_commit and new_commit are required' })
      }

      // Validate projectId
      if (!req.currentProjectId) {
        console.error(`🔍 diff endpoint - No project ID found`);
        return res.status(400).json({ error: 'Project ID is required' })
      }

      const knowledgeService = await getKnowledgeService()
      const diff = await knowledgeService.getDocumentDiff(
        req.params.id,
        req.currentProjectId,
        old_commit,
        new_commit
      )

      console.log(`🔍 diff endpoint - Success, diff length: ${diff.length}`);
      res.json({ diff })
    } catch (error) {
      console.error('🔍 diff endpoint - Error getting document diff:', error);
      console.error('🔍 diff endpoint - Error stack:', error.stack);
      
      // Return specific error message
      const errorMessage = error.message || 'Failed to get document diff';
      res.status(400).json({ error: errorMessage })
    }
  }
)

// Download document
router.get('/documents/:id/download',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    console.log('📥 download endpoint - user:', req.user?.userId || req.user?.id || 'unknown');
    console.log('📥 download endpoint - projectId:', req.currentProjectId);
    console.log('📥 download endpoint - documentId:', req.params.id);
    
    try {
      const knowledgeService = await getKnowledgeService()
      const document = await knowledgeService.getDocument(req.params.id, req.currentProjectId)
      
      console.log('📥 download endpoint - document found:', document ? 'yes' : 'no');
      if (document) {
        console.log('📥 download endpoint - file path:', document.file_path);
        console.log('📥 download endpoint - file name:', document.file_name);
      }
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' })
      }

      res.download(document.file_path, document.file_name)
    } catch (error) {
      console.error('📥 download endpoint - Error downloading document:', error)
      res.status(500).json({ error: 'Failed to download document' })
    }
  }
)

// View document (for PDFs)
router.get('/documents/:id/view',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    console.log('📄 view endpoint - user:', req.user?.userId || req.user?.id || 'unknown');
    console.log('📄 view endpoint - projectId:', req.currentProjectId);
    console.log('📄 view endpoint - documentId:', req.params.id);
    
    try {
      const knowledgeService = await getKnowledgeService()
      const document = await knowledgeService.getDocument(req.params.id, req.currentProjectId)
      
      console.log('📄 view endpoint - document found:', document ? 'yes' : 'no');
      if (document) {
        console.log('📄 view endpoint - file path:', document.file_path);
        console.log('📄 view endpoint - file type:', document.file_type);
      }
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' })
      }

      res.sendFile(document.file_path)
    } catch (error) {
      console.error('📄 view endpoint - Error viewing document:', error)
      res.status(500).json({ error: 'Failed to view document' })
    }
  }
)

// Setup GitHub integration
router.post('/projects/:projectId/github',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      console.log('GitHub integration request body:', req.body);
      const { github_token, repo_name, repo_url, integration_type } = req.body
      
      if (!github_token) {
        return res.status(400).json({ error: 'GitHub token is required' })
      }

      if (integration_type === 'create' && !repo_name) {
        return res.status(400).json({ error: 'Repository name is required for new repositories' })
      }

      if (integration_type === 'existing' && !repo_url) {
        return res.status(400).json({ error: 'Repository URL is required for existing repositories' })
      }

      const knowledgeService = await getKnowledgeService()
      const result = await knowledgeService.setupGitHubIntegration(
        req.currentProjectId,
        github_token,
        repo_name,
        repo_url
      )

      res.json(result)
    } catch (error) {
      console.error('Error setting up GitHub integration:', error)
      res.status(500).json({ error: error.message || 'Failed to setup GitHub integration' })
    }
  }
)

// Sync with GitHub
router.post('/projects/:projectId/github/sync',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const knowledgeService = await getKnowledgeService()
      const result = await knowledgeService.syncWithGitHub(req.currentProjectId)

      res.json(result)
    } catch (error) {
      console.error('Error syncing with GitHub:', error)
      res.status(500).json({ error: error.message || 'Failed to sync with GitHub' })
    }
  }
)

// =====================================================
// TAGS ENDPOINTS
// =====================================================

// Get document tags
router.get('/documents/:id/tags',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const knowledgeService = await getKnowledgeService()
      const tags = await knowledgeService.getDocumentTags(req.params.id)
      res.json(tags)
    } catch (error) {
      console.error('Error getting document tags:', error)
      res.status(500).json({ error: 'Failed to get document tags' })
    }
  }
)

// Add document tag
router.post('/documents/:id/tags',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { tag } = req.body
      if (!tag) {
        return res.status(400).json({ error: 'Tag is required' })
      }

      const knowledgeService = await getKnowledgeService()
      const result = await knowledgeService.addDocumentTag(req.params.id, tag, req.user.id)
      res.json(result)
    } catch (error) {
      console.error('Error adding document tag:', error)
      res.status(500).json({ error: 'Failed to add document tag' })
    }
  }
)

// Remove document tag
router.delete('/documents/:id/tags/:tag',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const knowledgeService = await getKnowledgeService()
      const result = await knowledgeService.removeDocumentTag(req.params.id, req.params.tag)
      res.json(result)
    } catch (error) {
      console.error('Error removing document tag:', error)
      res.status(500).json({ error: 'Failed to remove document tag' })
    }
  }
)

// =====================================================
// AGENT SUBMISSIONS ENDPOINTS
// =====================================================

// Get agent submissions
router.get('/agent-submissions',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { status } = req.query
      const knowledgeService = await getKnowledgeService()
      const submissions = await knowledgeService.getAgentSubmissions(req.currentProjectId, status)
      res.json(submissions)
    } catch (error) {
      console.error('Error getting agent submissions:', error)
      res.status(500).json({ error: 'Failed to get agent submissions' })
    }
  }
)

// Process agent submission
router.post('/agent-submissions/:id/process',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { action } = req.body
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Action must be "approve" or "reject"' })
      }

      const knowledgeService = await getKnowledgeService()
      const result = await knowledgeService.processSubmission(
        req.params.id,
        req.currentProjectId,
        action,
        req.user.id
      )

      res.json(result)
    } catch (error) {
      console.error('Error processing agent submission:', error)
      res.status(500).json({ error: error.message || 'Failed to process agent submission' })
    }
  }
)

// =====================================================
// SEARCH ENDPOINTS
// =====================================================

// Search documents
router.get('/search',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const { q, file_type, folder_id } = req.query
      
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' })
      }

      const knowledgeService = await getKnowledgeService()
      const documents = await knowledgeService.getDocuments(
        req.currentProjectId,
        folder_id,
        q,
        file_type
      )

      res.json(documents)
    } catch (error) {
      console.error('Error searching documents:', error)
      res.status(500).json({ error: 'Failed to search documents' })
    }
  }
)

// =====================================================
// STATISTICS ENDPOINTS
// =====================================================

// Get knowledge base statistics
router.get('/statistics',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeBase'),
  async (req, res) => {
    try {
      const knowledgeService = await getKnowledgeService()
      const stats = await knowledgeService.getStatistics(req.currentProjectId)
      res.json(stats)
    } catch (error) {
      console.error('Error getting statistics:', error)
      res.status(500).json({ error: 'Failed to get statistics' })
    }
  }
)

module.exports = router
