const express = require('express')
const UniversalKnowledgeService = require('./universalKnowledgeService.js')
const userService = require('./userService.js')
const { requirePermission } = require('./permissionMiddleware.js')
const crypto = require('crypto')

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
      req.user = decoded
      next()
    } catch (userServiceError) {
      console.log('🔐 authenticateToken - userService failed, trying jwt directly:', userServiceError.message);
      
      // Fallback: try direct JWT verification
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('🔐 authenticateToken - Token verified with direct JWT, user:', decoded?.userId || decoded?.id || 'unknown');
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
async function getUniversalKnowledgeService() {
  if (typeof global.getPool === 'function') {
    const pool = await global.getPool()
    return new UniversalKnowledgeService(pool)
  }
  // Fallback: construct without pool (will fail fast if used before server init)
  return new UniversalKnowledgeService(null)
}

// Middleware to get current project
const getCurrentProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.headers['x-project-id'] || req.query.project_id
    console.log('📁 getCurrentProject - projectId:', projectId);
    
    if (!projectId) {
      console.log('📁 getCurrentProject - No project ID found');
      return res.status(400).json({ error: 'Project ID is required' })
    }
    
    console.log('📁 getCurrentProject - Using project ID:', projectId);
    req.currentProjectId = projectId
    next()
  } catch (error) {
    console.error('📁 getCurrentProject - Error:', error.message);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// ===== UNIVERSAL CONTENT ENDPOINTS =====

/**
 * @route POST /api/knowledge/:projectId/content/:contentType
 * @desc Create or update content
 */
router.post('/:projectId/content/:contentType', 
  authenticateToken, 
  getCurrentProject, 
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, contentType } = req.params
      const { contentId, content, commitMessage } = req.body
      const userId = req.user?.userId || req.user?.id

      console.log(`📝 Creating/updating ${contentType} content:`, { projectId, contentId, userId })

      if (!contentId || !content) {
        return res.status(400).json({ error: 'contentId and content are required' })
      }

      const service = await getUniversalKnowledgeService()
      const result = await service.createOrUpdateContent(
        projectId, 
        contentType, 
        contentId, 
        content, 
        userId, 
        commitMessage || `Update ${contentType}: ${content.name || contentId}`
      )

      res.json({ success: true, data: result })
    } catch (error) {
      console.error('Error creating/updating content:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/content/:contentType/:contentId
 * @desc Get content by ID
 */
router.get('/:projectId/content/:contentType/:contentId',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, contentType, contentId } = req.params

      console.log(`📖 Getting ${contentType} content:`, { projectId, contentId })

      const service = await getUniversalKnowledgeService()
      const content = await service.getContent(projectId, contentType, contentId)

      res.json({ success: true, data: content })
    } catch (error) {
      console.error('Error getting content:', error)
      res.status(404).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/content/:contentType
 * @desc List all content of a type
 */
router.get('/:projectId/content/:contentType',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, contentType } = req.params

      console.log(`📋 Listing ${contentType} content for project:`, projectId)

      const service = await getUniversalKnowledgeService()
      const contentList = await service.listContent(projectId, contentType)

      res.json({ success: true, data: contentList })
    } catch (error) {
      console.error('Error listing content:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route DELETE /api/knowledge/:projectId/content/:contentType/:contentId
 * @desc Delete content
 */
router.delete('/:projectId/content/:contentType/:contentId',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, contentType, contentId } = req.params
      const { commitMessage } = req.body
      const userId = req.user?.userId || req.user?.id

      console.log(`🗑️ Deleting ${contentType} content:`, { projectId, contentId, userId })

      const service = await getUniversalKnowledgeService()
      await service.deleteContent(
        projectId, 
        contentType, 
        contentId, 
        userId, 
        commitMessage || `Delete ${contentType}: ${contentId}`
      )

      res.json({ success: true, message: 'Content deleted successfully' })
    } catch (error) {
      console.error('Error deleting content:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/content/:contentType/:contentId/history
 * @desc Get content history
 */
router.get('/:projectId/content/:contentType/:contentId/history',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, contentType, contentId } = req.params

      console.log(`📜 Getting history for ${contentType} content:`, { projectId, contentId })

      const service = await getUniversalKnowledgeService()
      const history = await service.getContentHistory(projectId, contentType, contentId)

      res.json({ success: true, data: history })
    } catch (error) {
      console.error('Error getting content history:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

// ===== DATA MODEL SPECIFIC ENDPOINTS =====

/**
 * @route POST /api/knowledge/:projectId/data-models
 * @desc Create or update data model
 */
router.post('/:projectId/data-models',
  authenticateToken,
  getCurrentProject,
  requirePermission('DataModeling'),
  async (req, res) => {
    try {
      const { projectId } = req.params
      const { modelId, modelData } = req.body
      const userId = req.user?.userId || req.user?.id

      console.log(`📊 Creating/updating data model:`, { projectId, modelId, userId })

      if (!modelId || !modelData) {
        return res.status(400).json({ error: 'modelId and modelData are required' })
      }

      const service = await getUniversalKnowledgeService()
      const result = await service.createOrUpdateDataModel(projectId, modelId, modelData, userId)

      res.json({ success: true, data: result })
    } catch (error) {
      console.error('Error creating/updating data model:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/data-models/:modelId
 * @desc Get data model
 */
router.get('/:projectId/data-models/:modelId',
  authenticateToken,
  getCurrentProject,
  requirePermission('DataModeling'),
  async (req, res) => {
    try {
      const { projectId, modelId } = req.params

      console.log(`📊 Getting data model:`, { projectId, modelId })

      const service = await getUniversalKnowledgeService()
      const model = await service.getDataModel(projectId, modelId)

      res.json({ success: true, data: model })
    } catch (error) {
      console.error('Error getting data model:', error)
      res.status(404).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/data-models
 * @desc List all data models
 */
router.get('/:projectId/data-models',
  authenticateToken,
  getCurrentProject,
  requirePermission('DataModeling'),
  async (req, res) => {
    try {
      const { projectId } = req.params

      console.log(`📋 Listing data models for project:`, projectId)

      const service = await getUniversalKnowledgeService()
      const models = await service.listDataModels(projectId)

      res.json({ success: true, data: models })
    } catch (error) {
      console.error('Error listing data models:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route DELETE /api/knowledge/:projectId/data-models/:modelId
 * @desc Delete data model
 */
router.delete('/:projectId/data-models/:modelId',
  authenticateToken,
  getCurrentProject,
  requirePermission('DataModeling'),
  async (req, res) => {
    try {
      const { projectId, modelId } = req.params
      const userId = req.user?.userId || req.user?.id

      console.log(`🗑️ Deleting data model:`, { projectId, modelId, userId })

      const service = await getUniversalKnowledgeService()
      await service.deleteDataModel(projectId, modelId, userId)

      res.json({ success: true, message: 'Data model deleted successfully' })
    } catch (error) {
      console.error('Error deleting data model:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

// ===== DOCUMENT SPECIFIC ENDPOINTS =====

/**
 * @route POST /api/knowledge/:projectId/documents
 * @desc Create or update document
 */
router.post('/:projectId/documents',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId } = req.params
      const { documentId, documentData } = req.body
      const userId = req.user?.userId || req.user?.id

      console.log(`📄 Creating/updating document:`, { projectId, documentId, userId })

      if (!documentId || !documentData) {
        return res.status(400).json({ error: 'documentId and documentData are required' })
      }

      const service = await getUniversalKnowledgeService()
      const result = await service.createOrUpdateDocument(projectId, documentId, documentData, userId)

      res.json({ success: true, data: result })
    } catch (error) {
      console.error('Error creating/updating document:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/documents/:documentId
 * @desc Get document
 */
router.get('/:projectId/documents/:documentId',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, documentId } = req.params

      console.log(`📄 Getting document:`, { projectId, documentId })

      const service = await getUniversalKnowledgeService()
      const document = await service.getDocument(projectId, documentId)

      res.json({ success: true, data: document })
    } catch (error) {
      console.error('Error getting document:', error)
      res.status(404).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/documents
 * @desc List all documents
 */
router.get('/:projectId/documents',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId } = req.params

      console.log(`📋 Listing documents for project:`, projectId)

      const service = await getUniversalKnowledgeService()
      const documents = await service.listDocuments(projectId)

      res.json({ success: true, data: documents })
    } catch (error) {
      console.error('Error listing documents:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route DELETE /api/knowledge/:projectId/documents/:documentId
 * @desc Delete document
 */
router.delete('/:projectId/documents/:documentId',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, documentId } = req.params
      const userId = req.user?.userId || req.user?.id

      console.log(`🗑️ Deleting document:`, { projectId, documentId, userId })

      const service = await getUniversalKnowledgeService()
      await service.deleteDocument(projectId, documentId, userId)

      res.json({ success: true, message: 'Document deleted successfully' })
    } catch (error) {
      console.error('Error deleting document:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

// ===== EXPORT ENDPOINTS =====

/**
 * @route GET /api/knowledge/:projectId/export/:contentType/:contentId
 * @desc Export content as JSON
 */
router.get('/:projectId/export/:contentType/:contentId',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, contentType, contentId } = req.params

      console.log(`📦 Exporting ${contentType} content:`, { projectId, contentId })

      const service = await getUniversalKnowledgeService()
      const exportedContent = await service.exportContent(projectId, contentType, contentId)

      res.json({ success: true, data: exportedContent })
    } catch (error) {
      console.error('Error exporting content:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/export/:contentType
 * @desc Export all content of a type
 */
router.get('/:projectId/export/:contentType',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId, contentType } = req.params

      console.log(`📦 Exporting all ${contentType} content for project:`, projectId)

      const service = await getUniversalKnowledgeService()
      const exportedContent = await service.exportAllContent(projectId, contentType)

      res.json({ success: true, data: exportedContent })
    } catch (error) {
      console.error('Error exporting content:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

// ===== UTILITY ENDPOINTS =====

/**
 * @route GET /api/knowledge/:projectId/health
 * @desc Health check for knowledge base
 */
router.get('/:projectId/health',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId } = req.params

      console.log(`🏥 Health check for knowledge base:`, projectId)

      const service = await getUniversalKnowledgeService()
      
      // Check if project directory exists
      const projectDir = service.getProjectDir(projectId)
      const exists = await fs.access(projectDir).then(() => true).catch(() => false)

      res.json({ 
        success: true, 
        data: {
          projectId,
          projectDir,
          exists,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error in health check:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

/**
 * @route GET /api/knowledge/:projectId/stats
 * @desc Get knowledge base statistics
 */
router.get('/:projectId/stats',
  authenticateToken,
  getCurrentProject,
  requirePermission('KnowledgeManagement'),
  async (req, res) => {
    try {
      const { projectId } = req.params

      console.log(`📊 Getting stats for knowledge base:`, projectId)

      const service = await getUniversalKnowledgeService()
      
      // Get counts for different content types
      const [dataModels, documents] = await Promise.all([
        service.listDataModels(projectId),
        service.listDocuments(projectId)
      ])

      res.json({ 
        success: true, 
        data: {
          projectId,
          contentTypes: {
            'data-models': dataModels.length,
            'documents': documents.length
          },
          totalItems: dataModels.length + documents.length,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error getting stats:', error)
      res.status(500).json({ error: error.message })
    }
  }
)

module.exports = router
