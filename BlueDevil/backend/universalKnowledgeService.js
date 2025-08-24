const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')
const { Pool } = require('pg')
const gitService = require('./gitService.js')

class UniversalKnowledgeService {
  constructor(pool) {
    this.pool = pool
    this.baseDir = path.join(__dirname, 'uploads', 'knowledge')
    this.ensureBaseDir()
  }

  async ensureBaseDir() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true })
    } catch (error) {
      console.error('Error creating base directory:', error)
    }
  }

  getProjectDir(projectId) {
    return path.join(this.baseDir, projectId)
  }

  async ensureProjectDir(projectId) {
    const projectDir = this.getProjectDir(projectId)
    try {
      await fs.mkdir(projectDir, { recursive: true })
      return projectDir
    } catch (error) {
      console.error(`Error creating project directory for ${projectId}:`, error)
      throw error
    }
  }

  // ===== INTERNAL API METHODS (for direct service usage) =====

  /**
   * Internal method to create or update content without API overhead
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @param {Object} content - Content data
   * @param {string} userId - User ID
   * @param {string} commitMessage - Git commit message
   * @returns {Object} Created/updated content
   */
  async createOrUpdateContentInternal(projectId, contentType, contentId, content, userId, commitMessage) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Ensure project directory exists
      const projectDir = await this.ensureProjectDir(projectId)
      const contentDir = path.join(projectDir, contentType, contentId)
      await fs.mkdir(contentDir, { recursive: true })

      // Create content metadata
      const now = new Date();
      const metadata = {
        id: contentId,
        type: contentType,
        projectId,
        createdBy: userId,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        version: '1.0.0',
        status: 'active',
        ...content.metadata
      }

      // Save metadata
      const metadataPath = path.join(contentDir, 'metadata.json')
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

      // Save content data
      const contentPath = path.join(contentDir, 'content.json')
      await fs.writeFile(contentPath, JSON.stringify(content.data, null, 2))

      // Create README
      const readmePath = path.join(contentDir, 'README.md')
      const readme = `# ${content.name || contentId}

**Type:** ${contentType}
**Project:** ${projectId}
**Created:** ${metadata.createdAt}
**Updated:** ${metadata.updatedAt}

${content.description || 'No description provided'}

## Content Structure
This content is managed by the Universal Knowledge Service.
- \`metadata.json\` - Content metadata and versioning information
- \`content.json\` - Actual content data
- \`README.md\` - This file
`
      await fs.writeFile(readmePath, readme)

      // Commit to git - use the content.json file path
      await gitService.addFile(projectId, contentPath, `${contentType}/${contentId}/content.json`, 
        JSON.stringify({ metadata, content: content.data }, null, 2), 
        commitMessage, 
        { name: 'Salesfive Platform', email: 'platform@salesfive.com' }
      )

      // Store in database - let the database generate the id automatically
      const result = await client.query(
        `INSERT INTO knowledge_content (project_id, content_type, name, description, metadata, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (project_id, content_type, name) 
         DO UPDATE SET 
           description = EXCLUDED.description,
           metadata = EXCLUDED.metadata,
           updated_by = EXCLUDED.updated_by,
           updated_at = NOW()
         RETURNING *`,
        [projectId, contentType, content.name, content.description, metadata, userId, userId]
      )

      await client.query('COMMIT')
      return result.rows[0]
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Internal method to get content without API overhead
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @returns {Object} Content data
   */
  async getContentInternal(projectId, contentType, contentId) {
    const projectDir = this.getProjectDir(projectId)
    const contentDir = path.join(projectDir, contentType, contentId)

    try {
      const metadataPath = path.join(contentDir, 'metadata.json')
      const contentPath = path.join(contentDir, 'content.json')

      const [metadata, contentData] = await Promise.all([
        fs.readFile(metadataPath, 'utf8').then(JSON.parse),
        fs.readFile(contentPath, 'utf8').then(JSON.parse)
      ])

      return {
        metadata,
        content: contentData
      }
    } catch (error) {
      throw new Error(`Content not found: ${contentType}/${contentId}`)
    }
  }

  /**
   * Internal method to list content without API overhead
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @returns {Array} List of content items
   */
  async listContentInternal(projectId, contentType) {
    const client = await this.pool.connect()
    try {
      // Load from database for better performance and consistency
      const result = await client.query(
        `SELECT id, name, description, metadata, created_by, updated_by, created_at, updated_at
         FROM knowledge_content 
         WHERE project_id = $1 AND content_type = $2 AND is_active = true
         ORDER BY updated_at DESC`,
        [projectId, contentType]
      )

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        version: row.metadata?.version || '1.0.0',
        status: row.metadata?.status || 'active',
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by,
        updated_by: row.updated_by,
        metadata: row.metadata
      }))
    } catch (error) {
      console.error('Error listing content from database:', error)
      // Fallback to file system if database fails
      const projectDir = this.getProjectDir(projectId)
      const typeDir = path.join(projectDir, contentType)

      try {
        const items = await fs.readdir(typeDir, { withFileTypes: true })
        const contentList = []

        for (const item of items) {
          if (item.isDirectory()) {
            try {
              const metadataPath = path.join(typeDir, item.name, 'metadata.json')
              const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'))
              contentList.push(metadata)
            } catch (error) {
              console.warn(`Error reading metadata for ${item.name}:`, error.message)
            }
          }
        }

        return contentList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      } catch (fsError) {
        if (fsError.code === 'ENOENT') {
          return []
        }
        throw fsError
      }
    } finally {
      client.release()
    }
  }

  /**
   * Internal method to delete content without API overhead
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @param {string} userId - User ID
   * @param {string} commitMessage - Git commit message
   */
  async deleteContentInternal(projectId, contentType, contentId, userId, commitMessage) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      const projectDir = this.getProjectDir(projectId)
      const contentDir = path.join(projectDir, contentType, contentId)

      // Remove from filesystem
      await fs.rm(contentDir, { recursive: true, force: true })

      // Commit deletion to git - use git rm instead of addFile
      try {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);
        
        await execAsync(`git rm -r "${contentType}/${contentId}"`, { cwd: projectDir });
        await execAsync(`git commit -m "${commitMessage}" --author="Salesfive Platform <platform@salesfive.com>"`, { cwd: projectDir });
      } catch (error) {
        console.warn(`Error removing from git: ${error.message}`)
      }

      // Remove from database
      await client.query(
        'DELETE FROM knowledge_content WHERE id = $1 AND project_id = $2 AND content_type = $3',
        [contentId, projectId, contentType]
      )

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Internal method to get content history without API overhead
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @returns {Array} Git history
   */
  async getContentHistoryInternal(projectId, contentType, contentId) {
    const projectDir = this.getProjectDir(projectId)
    const contentPath = `${contentType}/${contentId}/content.json`

    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const { stdout } = await execAsync(
        `git log --oneline --follow --pretty=format:"%h - %an, %ar : %s" -- "${contentPath}"`,
        { cwd: projectDir }
      )

      return stdout.split('\n').filter(line => line.trim()).map(line => {
        const [hash, ...rest] = line.split(' - ')
        const [author, date, ...messageParts] = rest.join(' - ').split(', ')
        const message = messageParts.join(', ')
        return { hash, author, date, message }
      })
    } catch (error) {
      console.warn(`Error getting history for ${contentPath}:`, error.message)
      return []
    }
  }

  // ===== UNIVERSAL CONTENT MANAGEMENT (API wrapper methods) =====

  /**
   * Create or update content in the knowledge base
   * @param {string} projectId - Project ID
   * @param {string} contentType - 'document', 'data-model', 'diagram', etc.
   * @param {string} contentId - Unique content ID
   * @param {Object} content - Content data
   * @param {string} userId - User ID
   * @param {string} commitMessage - Git commit message
   * @returns {Object} Created/updated content
   */
  async createOrUpdateContent(projectId, contentType, contentId, content, userId, commitMessage) {
    return this.createOrUpdateContentInternal(projectId, contentType, contentId, content, userId, commitMessage)
  }

  /**
   * Get content by ID
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @returns {Object} Content data
   */
  async getContent(projectId, contentType, contentId) {
    return this.getContentInternal(projectId, contentType, contentId)
  }

  /**
   * List all content of a specific type
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @returns {Array} List of content items
   */
  async listContent(projectId, contentType) {
    return this.listContentInternal(projectId, contentType)
  }

  /**
   * Delete content
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @param {string} userId - User ID
   * @param {string} commitMessage - Git commit message
   */
  async deleteContent(projectId, contentType, contentId, userId, commitMessage) {
    return this.deleteContentInternal(projectId, contentType, contentId, userId, commitMessage)
  }

  /**
   * Get git history for content
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @returns {Array} Git history
   */
  async getContentHistory(projectId, contentType, contentId) {
    return this.getContentHistoryInternal(projectId, contentType, contentId)
  }

  // ===== DATA MODEL SPECIFIC METHODS =====

  /**
   * Create or update a data model
   * @param {string} projectId - Project ID
   * @param {string} modelId - Model ID
   * @param {Object} modelData - Model data
   * @param {string} userId - User ID
   * @returns {Object} Created/updated model
   */
  async createOrUpdateDataModel(projectId, modelId, modelData, userId) {
    const content = {
      name: modelData.name,
      description: modelData.description || '',
      metadata: {
        version: modelData.version || '1.0.0',
        status: modelData.status || 'draft',
        objects: modelData.objects || [],
        relationships: modelData.relationships || []
      },
      data: modelData
    }

    const commitMessage = `Update data model: ${modelData.name}`
    return this.createOrUpdateContentInternal(projectId, 'data-models', modelId, content, userId, commitMessage)
  }

  /**
   * Get data model
   * @param {string} projectId - Project ID
   * @param {string} modelId - Model ID
   * @returns {Object} Model data
   */
  async getDataModel(projectId, modelId) {
    return this.getContentInternal(projectId, 'data-models', modelId)
  }

  /**
   * List all data models
   * @param {string} projectId - Project ID
   * @returns {Array} List of data models
   */
  async listDataModels(projectId) {
    return this.listContentInternal(projectId, 'data-models')
  }

  /**
   * Delete data model
   * @param {string} projectId - Project ID
   * @param {string} modelId - Model ID
   * @param {string} userId - User ID
   */
  async deleteDataModel(projectId, modelId, userId) {
    const commitMessage = `Delete data model: ${modelId}`
    return this.deleteContentInternal(projectId, 'data-models', modelId, userId, commitMessage)
  }

  // ===== DOCUMENT SPECIFIC METHODS =====

  /**
   * Create or update a document
   * @param {string} projectId - Project ID
   * @param {string} documentId - Document ID
   * @param {Object} documentData - Document data
   * @param {string} userId - User ID
   * @returns {Object} Created/updated document
   */
  async createOrUpdateDocument(projectId, documentId, documentData, userId) {
    const content = {
      name: documentData.name,
      description: documentData.description || '',
      metadata: {
        version: documentData.version || '1.0.0',
        status: documentData.status || 'active',
        fileType: documentData.fileType,
        fileSize: documentData.fileSize
      },
      data: documentData
    }

    const commitMessage = `Update document: ${documentData.name}`
    return this.createOrUpdateContentInternal(projectId, 'documents', documentId, content, userId, commitMessage)
  }

  /**
   * Get document
   * @param {string} projectId - Project ID
   * @param {string} documentId - Document ID
   * @returns {Object} Document data
   */
  async getDocument(projectId, documentId) {
    return this.getContentInternal(projectId, 'documents', documentId)
  }

  /**
   * List all documents
   * @param {string} projectId - Project ID
   * @returns {Array} List of documents
   */
  async listDocuments(projectId) {
    return this.listContentInternal(projectId, 'documents')
  }

  /**
   * Delete document
   * @param {string} projectId - Project ID
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID
   */
  async deleteDocument(projectId, documentId, userId) {
    const commitMessage = `Delete document: ${documentId}`
    return this.deleteContentInternal(projectId, 'documents', documentId, userId, commitMessage)
  }

  // ===== EXPORT METHODS =====

  /**
   * Export content as JSON
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @returns {Object} Exported content
   */
  async exportContent(projectId, contentType, contentId) {
    const content = await this.getContentInternal(projectId, contentType, contentId)
    const history = await this.getContentHistoryInternal(projectId, contentType, contentId)
    
    return {
      ...content,
      history,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0'
    }
  }

  /**
   * Export all content of a type
   * @param {string} projectId - Project ID
   * @param {string} contentType - Content type
   * @returns {Object} Exported content collection
   */
  async exportAllContent(projectId, contentType) {
    const contentList = await this.listContentInternal(projectId, contentType)
    const exportedContent = []

    for (const item of contentList) {
      try {
        const content = await this.getContentInternal(projectId, contentType, item.id)
        const history = await this.getContentHistoryInternal(projectId, contentType, item.id)
        
        exportedContent.push({
          ...content,
          history
        })
      } catch (error) {
        console.warn(`Error exporting ${contentType}/${item.id}:`, error.message)
      }
    }

    return {
      projectId,
      contentType,
      content: exportedContent,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0',
      totalItems: exportedContent.length
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get project statistics
   * @param {string} projectId - Project ID
   * @returns {Object} Project statistics
   */
  async getProjectStats(projectId) {
    const [dataModels, documents] = await Promise.all([
      this.listContentInternal(projectId, 'data-models'),
      this.listContentInternal(projectId, 'documents')
    ])

    return {
      projectId,
      contentTypes: {
        'data-models': dataModels.length,
        'documents': documents.length
      },
      totalItems: dataModels.length + documents.length,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Check if project directory exists
   * @param {string} projectId - Project ID
   * @returns {boolean} True if exists
   */
  async projectExists(projectId) {
    const projectDir = this.getProjectDir(projectId)
    try {
      await fs.access(projectDir)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get project health status
   * @param {string} projectId - Project ID
   * @returns {Object} Health status
   */
  async getProjectHealth(projectId) {
    const projectDir = this.getProjectDir(projectId)
    const exists = await this.projectExists(projectId)

    return {
      projectId,
      projectDir,
      exists,
      timestamp: new Date().toISOString()
    }
  }
}

module.exports = UniversalKnowledgeService
