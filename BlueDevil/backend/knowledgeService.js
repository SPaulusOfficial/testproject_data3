const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')
const { Pool } = require('pg')
const gitService = require('./gitService.js')

class KnowledgeService {
  constructor(pool) {
    this.pool = pool
    this.baseUploadDir = path.join(__dirname, 'uploads', 'knowledge')
    this.ensureBaseUploadDir()
  }

  async ensureBaseUploadDir() {
    try {
      await fs.mkdir(this.baseUploadDir, { recursive: true })
    } catch (error) {
      console.error('Error creating base upload directory:', error)
    }
  }

  getProjectUploadDir(projectId) {
    return path.join(this.baseUploadDir, projectId)
  }

  async ensureProjectUploadDir(projectId) {
    const projectDir = this.getProjectUploadDir(projectId)
    try {
      await fs.mkdir(projectDir, { recursive: true })
      return projectDir
    } catch (error) {
      console.error(`Error creating project upload directory for ${projectId}:`, error)
      throw error
    }
  }

  // Folder Management
  async createFolder(projectId, parentFolderId, name, description, userId) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Get parent path
      let parentPath = '/'
      if (parentFolderId) {
        const parentResult = await client.query(
          'SELECT path FROM knowledge_folders WHERE id = $1 AND project_id = $2',
          [parentFolderId, projectId]
        )
        if (parentResult.rows.length === 0) {
          throw new Error('Parent folder not found')
        }
        parentPath = parentResult.rows[0].path
      }

      // Create new path
      const newPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`

      // Check if folder already exists
      const existingResult = await client.query(
        'SELECT id FROM knowledge_folders WHERE project_id = $1 AND path = $2',
        [projectId, newPath]
      )
      if (existingResult.rows.length > 0) {
        throw new Error('Folder already exists')
      }

      // Create folder
      const result = await client.query(
        `INSERT INTO knowledge_folders (project_id, parent_folder_id, name, description, path, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [projectId, parentFolderId, name, description, newPath, userId]
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

  async getFolders(projectId, parentFolderId = null) {
    const result = await this.pool.query(
      `SELECT kf.*, 
              u.first_name, u.last_name,
              (SELECT COUNT(*) FROM knowledge_documents kd WHERE kd.folder_id = kf.id) as document_count,
              (SELECT COUNT(*) FROM knowledge_folders kf2 WHERE kf2.parent_folder_id = kf.id) as subfolder_count
       FROM knowledge_folders kf
       LEFT JOIN users u ON kf.created_by = u.id
       WHERE kf.project_id = $1
       AND ($2::UUID IS NULL OR kf.parent_folder_id = $2)
       ORDER BY kf.name`,
      [projectId, parentFolderId]
    )
    return result.rows
  }

  async getFolderPath(folderId) {
    const result = await this.pool.query(
      'SELECT path FROM knowledge_folders WHERE id = $1',
      [folderId]
    )
    return result.rows[0]?.path || '/'
  }

  // Document Management
  async uploadDocument(projectId, folderId, file, metadata, userId, userInfo = null) {
    console.log('KnowledgeService: uploadDocument called');
    console.log('KnowledgeService: projectId:', projectId);
    console.log('KnowledgeService: folderId:', folderId);
    console.log('KnowledgeService: fileName:', file.name);
    console.log('KnowledgeService: fileSize:', file.size);
    console.log('KnowledgeService: userInfo:', userInfo);
    
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Validate folder (allow null for root folder)
      if (folderId && folderId !== '') {
        const folderResult = await client.query(
          'SELECT path FROM knowledge_folders WHERE id = $1 AND project_id = $2',
          [folderId, projectId]
        )
        if (folderResult.rows.length === 0) {
          throw new Error('Folder not found')
        }
      }

      // Determine file type
      const fileType = this.getFileType(file.mimetype, file.name)
      
      // Ensure project upload directory exists
      const projectUploadDir = await this.ensureProjectUploadDir(projectId)
      
      // Generate file path with project isolation
      const fileName = `${Date.now()}-${file.name}`
      const filePath = path.join(projectUploadDir, fileName)
      
      // Save file
      await fs.writeFile(filePath, file.data)
      
      // Add to Git repository for versioning
      try {
        const author = {
          name: userInfo?.first_name && userInfo?.last_name ? 
            `${userInfo.first_name} ${userInfo.last_name}` : 
            userInfo?.username || 'Unknown User',
          email: userInfo?.email || 'user@salesfive.com'
        };
        
        await gitService.addFile(
          projectId,
          filePath,
          fileName,
          file.data,
          `Add ${metadata.title || file.name}`,
          author
        );
        
        // Push to GitHub if integration is set up
        try {
          console.log('📤 KnowledgeService: Attempting to push to GitHub...');
          const pushResult = await gitService.pushToGitHub(projectId);
          console.log('📤 KnowledgeService: GitHub push result:', pushResult);
        } catch (pushError) {
          console.error('📤 KnowledgeService: GitHub push failed:', pushError.message);
          console.error('📤 KnowledgeService: Push error details:', pushError);
        }
      } catch (gitError) {
        console.warn('Git integration failed, continuing without versioning:', gitError.message);
      }
      
      // Calculate content hash
      const contentHash = crypto.createHash('sha256').update(file.data).digest('hex')
      
      // Check for duplicate content
      const duplicateResult = await client.query(
        'SELECT id, title FROM knowledge_documents WHERE content_hash = $1 AND project_id = $2',
        [contentHash, projectId]
      )
      if (duplicateResult.rows.length > 0) {
        await fs.unlink(filePath) // Delete uploaded file
        const existingDoc = duplicateResult.rows[0]
        throw new Error(`Document with identical content already exists: "${existingDoc.title}"`)
      }

      // Create document record
      const result = await client.query(
        `INSERT INTO knowledge_documents 
         (project_id, folder_id, title, description, file_name, file_path, file_size, mime_type, file_type, content_hash, metadata, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          projectId,
          folderId && folderId !== '' ? folderId : null,
          metadata.title || file.name,
          metadata.description || '',
          file.name,
          filePath,
          file.size,
          file.mimetype,
          fileType,
          contentHash,
          JSON.stringify(metadata),
          userId
        ]
      )

      // Create initial version
      await client.query(
        `INSERT INTO document_versions (document_id, version_number, content, file_path, change_summary, created_by)
         VALUES ($1, 1, $2, $3, 'Initial version', $4)`,
        [
          result.rows[0].id,
          fileType === 'markdown' ? file.data.toString('utf8') : null,
          fileType !== 'markdown' ? filePath : null,
          userId
        ]
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

  async getDocuments(projectId, folderId = null, searchTerm = null, fileType = null) {
    let query = `
      SELECT kd.*, 
             u.first_name, u.last_name,
             kf.name as folder_name,
             kf.path as folder_path,
             (SELECT COUNT(*) FROM document_versions dv WHERE dv.document_id = kd.id) as version_count,
             (SELECT MAX(version_number) FROM document_versions dv WHERE dv.document_id = kd.id) as latest_version
      FROM knowledge_documents kd
      LEFT JOIN users u ON kd.created_by = u.id
      LEFT JOIN knowledge_folders kf ON kd.folder_id = kf.id
      WHERE kd.project_id = $1
    `
    const params = [projectId]
    let paramIndex = 2

    if (folderId) {
      query += ` AND kd.folder_id = $${paramIndex}`
      params.push(folderId)
      paramIndex++
    }

    if (searchTerm) {
      query += ` AND (kd.title ILIKE $${paramIndex} OR kd.description ILIKE $${paramIndex})`
      params.push(`%${searchTerm}%`)
      paramIndex++
    }

    if (fileType) {
      query += ` AND kd.file_type = $${paramIndex}`
      params.push(fileType)
    }

    query += ' ORDER BY kd.created_at DESC'

    const result = await this.pool.query(query, params)
    return result.rows
  }

  async getDocument(documentId, projectId) {
    const result = await this.pool.query(
      `SELECT kd.*, 
              u.first_name, u.last_name,
              kf.name as folder_name,
              kf.path as folder_path
       FROM knowledge_documents kd
       LEFT JOIN users u ON kd.created_by = u.id
       LEFT JOIN knowledge_folders kf ON kd.folder_id = kf.id
       WHERE kd.id = $1 AND kd.project_id = $2`,
      [documentId, projectId]
    )
    return result.rows[0]
  }

  async getDocumentContent(documentId, versionNumber = null) {
    let query = `
      SELECT dv.*, u.first_name, u.last_name
      FROM document_versions dv
      LEFT JOIN users u ON dv.created_by = u.id
      WHERE dv.document_id = $1
    `
    const params = [documentId]

    if (versionNumber) {
      query += ' AND dv.version_number = $2'
      params.push(versionNumber)
    } else {
      query += ' ORDER BY dv.version_number DESC LIMIT 1'
    }

    const result = await this.pool.query(query, params)
    return result.rows[0]
  }

  async updateDocument(documentId, projectId, updates, userId) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Get current document
      const currentDoc = await client.query(
        'SELECT * FROM knowledge_documents WHERE id = $1 AND project_id = $2',
        [documentId, projectId]
      )
      if (currentDoc.rows.length === 0) {
        throw new Error('Document not found')
      }

      const doc = currentDoc.rows[0]

      // Update document
      const updateFields = []
      const updateParams = []
      let paramIndex = 1

      if (updates.title) {
        updateFields.push(`title = $${paramIndex}`)
        updateParams.push(updates.title)
        paramIndex++
      }

      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex}`)
        updateParams.push(updates.description)
        paramIndex++
      }

      if (updates.folder_id) {
        updateFields.push(`folder_id = $${paramIndex}`)
        updateParams.push(updates.folder_id)
        paramIndex++
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = NOW()`)
        updateParams.push(documentId, projectId)

        await client.query(
          `UPDATE knowledge_documents 
           SET ${updateFields.join(', ')}
           WHERE id = $${paramIndex} AND project_id = $${paramIndex + 1}`,
          updateParams
        )
      }

      // Create new version if content changed
      if (updates.content && doc.file_type === 'markdown') {
        const latestVersion = await client.query(
          'SELECT MAX(version_number) as max_version FROM document_versions WHERE document_id = $1',
          [documentId]
        )
        const newVersionNumber = (latestVersion.rows[0].max_version || 0) + 1

        await client.query(
          `INSERT INTO document_versions (document_id, version_number, content, change_description, created_by)
           VALUES ($1, $2, $3, $4, $5)`,
          [documentId, newVersionNumber, updates.content, updates.changeDescription || 'Content updated', userId]
        )
      }

      await client.query('COMMIT')
      return { success: true }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async deleteDocument(documentId, projectId) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Get document info
      const docResult = await client.query(
        'SELECT file_path, file_name FROM knowledge_documents WHERE id = $1 AND project_id = $2',
        [documentId, projectId]
      )
      if (docResult.rows.length === 0) {
        throw new Error('Document not found')
      }

      const document = docResult.rows[0]

      // Delete from Git repository
      try {
        await gitService.deleteFile(projectId, document.file_name, `Delete ${document.file_name}`)
        
        // Push to GitHub if integration is set up
        try {
          await gitService.pushToGitHub(projectId)
        } catch (pushError) {
          console.warn('GitHub push failed after delete, but file was removed from local git:', pushError.message)
        }
      } catch (gitError) {
        console.warn('Git delete failed, continuing without versioning:', gitError.message)
      }

      // Delete physical file
      try {
        await fs.unlink(document.file_path)
      } catch (error) {
        console.warn('Could not delete file:', error.message)
      }

      // Delete document versions
      await client.query(
        'DELETE FROM document_versions WHERE document_id = $1',
        [documentId]
      )

      // Delete document tags
      await client.query(
        'DELETE FROM document_tags WHERE document_id = $1',
        [documentId]
      )

      // Hard delete document
      await client.query(
        'DELETE FROM knowledge_documents WHERE id = $1 AND project_id = $2',
        [documentId, projectId]
      )

      await client.query('COMMIT')
      return { success: true }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // Agent Submissions (MCP Server)
  async submitDocument(projectId, agentId, agentName, submission) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Validate target folder if specified
      if (submission.target_folder_id) {
        const folderResult = await client.query(
          'SELECT id FROM knowledge_folders WHERE id = $1 AND project_id = $2',
          [submission.target_folder_id, projectId]
        )
        if (folderResult.rows.length === 0) {
          throw new Error('Target folder not found')
        }
      }

      // Handle file upload if present
      let filePath = null
      let fileName = null
      let mimeType = null

      if (submission.file && submission.file.data) {
        // Ensure project upload directory exists
        const projectUploadDir = await this.ensureProjectUploadDir(projectId)
        
        const fileName = `${Date.now()}-${submission.file.name}`
        const filePath = path.join(projectUploadDir, fileName)
        await fs.writeFile(filePath, submission.file.data)
        mimeType = submission.file.mimetype
      }

      // Create submission record
      const result = await client.query(
        `INSERT INTO agent_submissions 
         (project_id, agent_id, agent_name, submission_type, title, content, file_path, file_name, mime_type, target_folder_id, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          projectId,
          agentId,
          agentName,
          submission.type,
          submission.title,
          submission.content,
          filePath,
          fileName,
          mimeType,
          submission.target_folder_id,
          JSON.stringify(submission.metadata || {})
        ]
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

  async getAgentSubmissions(projectId, status = null) {
    let query = `
      SELECT as.*, u.first_name, u.last_name
      FROM agent_submissions as
      LEFT JOIN users u ON as.processed_by = u.id
      WHERE as.project_id = $1
    `
    const params = [projectId]

    if (status) {
      query += ' AND as.status = $2'
      params.push(status)
    }

    query += ' ORDER BY as.created_at DESC'

    const result = await this.pool.query(query, params)
    return result.rows
  }

  async processSubmission(submissionId, projectId, action, userId) {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Get submission
      const submissionResult = await client.query(
        'SELECT * FROM agent_submissions WHERE id = $1 AND project_id = $2',
        [submissionId, projectId]
      )
      if (submissionResult.rows.length === 0) {
        throw new Error('Submission not found')
      }

      const submission = submissionResult.rows[0]

      if (action === 'approve') {
        // Create document from submission
        const documentData = {
          project_id: projectId,
          folder_id: submission.target_folder_id,
          title: submission.title,
          description: submission.metadata?.description || '',
          file_name: submission.file_name || `${submission.title}.md`,
          file_path: submission.file_path || null,
          file_size: submission.file_path ? (await fs.stat(submission.file_path)).size : 0,
          mime_type: submission.mime_type || 'text/markdown',
          file_type: this.getFileType(submission.mime_type, submission.file_name),
          content_hash: submission.content ? crypto.createHash('sha256').update(submission.content).digest('hex') : null,
          metadata: submission.metadata,
          created_by: userId
        }

        // Remove null values
        Object.keys(documentData).forEach(key => {
          if (documentData[key] === null) {
            delete documentData[key]
          }
        })

        const docResult = await client.query(
          `INSERT INTO knowledge_documents 
           (${Object.keys(documentData).join(', ')})
           VALUES (${Object.keys(documentData).map((_, i) => `$${i + 1}`).join(', ')})
           RETURNING *`,
          Object.values(documentData)
        )

        // Create initial version
        if (submission.content) {
          await client.query(
            `INSERT INTO document_versions (document_id, version_number, content, change_description, created_by)
             VALUES ($1, 1, $2, 'Created from agent submission', $3)`,
            [docResult.rows[0].id, submission.content, userId]
          )
        }

        // Update submission status
        await client.query(
          'UPDATE agent_submissions SET status = $1, processed_at = NOW(), processed_by = $2 WHERE id = $3',
          ['processed', userId, submissionId]
        )
      } else if (action === 'reject') {
        // Update submission status
        await client.query(
          'UPDATE agent_submissions SET status = $1, processed_at = NOW(), processed_by = $2 WHERE id = $3',
          ['rejected', userId, submissionId]
        )
      }

      await client.query('COMMIT')
      return { success: true }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // Utility methods
  getFileType(mimeType, fileName) {
    if (mimeType === 'text/markdown' || fileName?.endsWith('.md')) {
      return 'markdown'
    } else if (mimeType === 'application/pdf' || fileName?.endsWith('.pdf')) {
      return 'pdf'
    } else if (mimeType?.startsWith('text/') || fileName?.endsWith('.txt')) {
      return 'text'
    } else {
      return 'other'
    }
  }

  async getDocumentVersions(documentId) {
    const result = await this.pool.query(
      `SELECT dv.*, u.first_name, u.last_name
       FROM document_versions dv
       LEFT JOIN users u ON dv.created_by = u.id
       WHERE dv.document_id = $1
       ORDER BY dv.version_number DESC`,
      [documentId]
    )
    return result.rows
  }

  async addDocumentTag(documentId, tag, userId) {
    const result = await this.pool.query(
      `INSERT INTO document_tags (document_id, tag, created_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (document_id, tag) DO NOTHING
       RETURNING *`,
      [documentId, tag, userId]
    )
    return result.rows[0]
  }

  async removeDocumentTag(documentId, tag) {
    await this.pool.query(
      'DELETE FROM document_tags WHERE document_id = $1 AND tag = $2',
      [documentId, tag]
    )
    return { success: true }
  }

  async getDocumentTags(documentId) {
    const result = await this.pool.query(
      'SELECT tag FROM document_tags WHERE document_id = $1 ORDER BY tag',
      [documentId]
    )
    return result.rows.map(row => row.tag)
  }

  async getStatistics(projectId) {
    const result = await this.pool.query(
      `SELECT 
         (SELECT COUNT(*)::INT FROM knowledge_documents WHERE project_id = $1) AS total_documents,
         (SELECT COUNT(*)::INT FROM knowledge_folders WHERE project_id = $1) AS total_folders,
         (SELECT COALESCE(SUM(file_size),0)::BIGINT FROM knowledge_documents WHERE project_id = $1) AS total_size,
         (SELECT COUNT(*)::INT FROM knowledge_documents WHERE project_id = $1 AND created_at > NOW() - INTERVAL '7 days') AS recent_uploads,
         (SELECT COUNT(*)::INT FROM agent_submissions WHERE project_id = $1 AND status = 'pending') AS pending_submissions
       `,
      [projectId]
    )
    const row = result.rows[0]
    return {
      totalDocuments: row.total_documents || 0,
      totalFolders: row.total_folders || 0,
      totalSize: Number(row.total_size) || 0,
      recentUploads: row.recent_uploads || 0,
      pendingSubmissions: row.pending_submissions || 0
    }
  }

  // Git-based Versioning Methods
  async updateDocumentWithGit(documentId, projectId, content, description, userId, userInfo = null) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current document
      const docResult = await client.query(
        'SELECT * FROM knowledge_documents WHERE id = $1 AND project_id = $2',
        [documentId, projectId]
      );
      
      if (docResult.rows.length === 0) {
        throw new Error('Document not found');
      }

      const document = docResult.rows[0];
      
      // Update file content
      await fs.writeFile(document.file_path, content);
      
      // Update in Git repository
      const author = {
        name: userInfo?.first_name && userInfo?.last_name ? 
          `${userInfo.first_name} ${userInfo.last_name}` : 
          userInfo?.username || 'Unknown User',
        email: userInfo?.email || 'user@salesfive.com'
      };
      
      await gitService.updateFile(
        projectId,
        document.file_name,
        content,
        description || `Update ${document.title}`,
        author
      );
      
      // Push to GitHub if integration is set up
      try {
        await gitService.pushToGitHub(projectId);
      } catch (pushError) {
        console.warn('GitHub push failed, but file was updated in local git:', pushError.message);
      }
      
      // Get new version number
      const versionResult = await client.query(
        'SELECT MAX(version_number) as max_version FROM document_versions WHERE document_id = $1',
        [documentId]
      );
      const newVersion = (versionResult.rows[0].max_version || 0) + 1;
      
      // Create new version record
      await client.query(
        `INSERT INTO document_versions (document_id, version_number, content, file_path, change_summary, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [documentId, newVersion, content, document.file_path, description, userId]
      );
      
      // Update document record
      await client.query(
        `UPDATE knowledge_documents 
         SET version = $1, updated_at = NOW()
         WHERE id = $2`,
        [newVersion, documentId]
      );
      
      await client.query('COMMIT');
      
      return {
        success: true,
        version: newVersion,
        document: await this.getDocument(documentId, projectId)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getDocumentVersionsFromGit(documentId, projectId) {
    try {
      const document = await this.getDocument(documentId, projectId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      const gitHistory = await gitService.getFileHistory(projectId, document.file_name);
      
      return gitHistory.map((commit, index) => ({
        id: commit.hash,
        version_number: gitHistory.length - index,
        content: null, // Will be loaded on demand
        file_path: document.file_path,
        change_summary: commit.message,
        created_by: null,
        created_at: commit.date,
        author: commit.author,
        email: commit.email,
        commit_hash: commit.hash
      }));
    } catch (error) {
      console.error('Error getting Git versions:', error);
      // Fallback to database versions
      return this.getDocumentVersions(documentId);
    }
  }

  async getDocumentContentFromGit(documentId, projectId, commitHash = null) {
    try {
      const document = await this.getDocument(documentId, projectId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      const content = await gitService.getFileContent(projectId, document.file_name, commitHash);
      return content;
    } catch (error) {
      console.error('Error getting Git content:', error);
      // Fallback to database content
      const version = await this.getDocumentContent(documentId);
      return version?.content || '';
    }
  }

  async getDocumentDiff(documentId, projectId, oldCommit, newCommit) {
    try {
      const document = await this.getDocument(documentId, projectId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      const diff = await gitService.getFileDiff(projectId, document.file_name, oldCommit, newCommit);
      return diff;
    } catch (error) {
      console.error('Error getting Git diff:', error);
      return '';
    }
  }

  async setupGitHubIntegration(projectId, githubToken, repoName, repoUrl = null) {
    try {
      const result = await gitService.setupGitHubRepo(projectId, githubToken, repoName, repoUrl);
      
      // Store GitHub info in database
      const client = await this.pool.connect();
      try {
        await client.query(
          `UPDATE projects 
           SET settings = jsonb_set(settings, '{github}', $1)
           WHERE id = $2`,
          [JSON.stringify({
            repoUrl: result.repoUrl,
            cloneUrl: result.cloneUrl,
            repoName: repoName,
            connected: true,
            connectedAt: new Date().toISOString()
          }), projectId]
        );
      } finally {
        client.release();
      }
      
      return result;
    } catch (error) {
      console.error('Error setting up GitHub integration:', error);
      throw error;
    }
  }

  async syncWithGitHub(projectId) {
    try {
      const result = await gitService.syncWithGitHub(projectId);
      return result;
    } catch (error) {
      console.error('Error syncing with GitHub:', error);
      throw error;
    }
  }
}

module.exports = KnowledgeService
