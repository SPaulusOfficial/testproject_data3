const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

class ProjectService {
  constructor() {
    this.pool = null;
    this.initializePool();
  }

  async initializePool() {
    if (!this.pool) {
      this.pool = new Pool({
        host: process.env.VITE_DB_HOST || process.env.DB_HOST,
        port: process.env.VITE_DB_PORT || process.env.DB_PORT,
        database: process.env.VITE_DB_NAME || process.env.DB_NAME,
        user: process.env.VITE_DB_USER || process.env.DB_USER,
        password: process.env.VITE_DB_PASSWORD || process.env.DB_PASSWORD,
        ssl: process.env.VITE_DB_SSL_MODE === 'require' ? { rejectUnauthorized: false } : false
      });
    }
  }

  // =====================================================
  // PROJECT MANAGEMENT METHODS
  // =====================================================

  async createProject(projectData, createdBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO projects (
          name, slug, description, owner_id, settings, metadata, environment_config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          projectData.name,
          projectData.slug,
          projectData.description || '',
          createdBy,
          JSON.stringify(projectData.settings || {}),
          JSON.stringify({
            version: 1,
            lastModified: new Date(),
            modifiedBy: createdBy,
            changeHistory: []
          }),
          JSON.stringify(projectData.environmentConfig || {})
        ]
      );

      const project = result.rows[0];

      // Add creator as owner
      await client.query(
        `INSERT INTO project_memberships (user_id, project_id, role)
         VALUES ($1, $2, 'owner')`,
        [createdBy, project.id]
      );

      // Log project creation
      await this.logAuditEvent(client, {
        userId: createdBy,
        action: 'project_created',
        resourceType: 'project',
        resourceId: project.id,
        details: { projectName: project.name, projectSlug: project.slug },
        severity: 'info',
        category: 'project_management'
      });

      return this.sanitizeProject(project);

    } finally {
      client.release();
    }
  }

  async updateProject(projectId, updateData, updatedBy) {
    const client = await this.pool.connect();
    try {
      // Get current project data for audit
      const currentProject = await client.query(
        `SELECT * FROM projects WHERE id = $1`,
        [projectId]
      );

      if (currentProject.rows.length === 0) {
        throw new Error('Project not found');
      }

      const current = currentProject.rows[0];

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (updateData.name) {
        updateFields.push(`name = $${paramCount++}`);
        updateValues.push(updateData.name);
      }

      if (updateData.slug) {
        updateFields.push(`slug = $${paramCount++}`);
        updateValues.push(updateData.slug);
      }

      if (updateData.description !== undefined) {
        updateFields.push(`description = $${paramCount++}`);
        updateValues.push(updateData.description);
      }

      if (updateData.settings) {
        updateFields.push(`settings = $${paramCount++}`);
        updateValues.push(JSON.stringify(updateData.settings));
      }

      if (updateData.environmentConfig) {
        updateFields.push(`environment_config = $${paramCount++}`);
        updateValues.push(JSON.stringify(updateData.environmentConfig));
      }

      if (updateData.isActive !== undefined) {
        updateFields.push(`is_active = $${paramCount++}`);
        updateValues.push(updateData.isActive);
      }

      // Update metadata
      const metadata = JSON.parse(current.metadata || '{}');
      metadata.version = (metadata.version || 0) + 1;
      metadata.lastModified = new Date();
      metadata.modifiedBy = updatedBy;
      metadata.changeHistory = metadata.changeHistory || [];
      metadata.changeHistory.push({
        field: 'general',
        oldValue: current,
        newValue: updateData,
        timestamp: new Date(),
        modifiedBy: updatedBy
      });

      updateFields.push(`metadata = $${paramCount++}`);
      updateValues.push(JSON.stringify(metadata));

      updateValues.push(projectId);

      const result = await client.query(
        `UPDATE projects SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        updateValues
      );

      const updatedProject = result.rows[0];

      // Log project update
      await this.logAuditEvent(client, {
        userId: updatedBy,
        projectId,
        action: 'project_updated',
        resourceType: 'project',
        resourceId: projectId,
        details: { updatedFields: Object.keys(updateData) },
        severity: 'info',
        category: 'project_management'
      });

      return this.sanitizeProject(updatedProject);

    } finally {
      client.release();
    }
  }

  async deleteProject(projectId, deletedBy) {
    const client = await this.pool.connect();
    try {
      // Soft delete - set is_active to false
      const result = await client.query(
        `UPDATE projects SET is_active = false WHERE id = $1 RETURNING *`,
        [projectId]
      );

      if (result.rows.length === 0) {
        throw new Error('Project not found');
      }

      // Log project deletion
      await this.logAuditEvent(client, {
        userId: deletedBy,
        projectId,
        action: 'project_deleted',
        resourceType: 'project',
        resourceId: projectId,
        details: { deletedProject: result.rows[0].name },
        severity: 'warning',
        category: 'project_management'
      });

      return { success: true };

    } finally {
      client.release();
    }
  }

  async getAllProjects(userId, userRole) {
    const client = await this.pool.connect();
    try {
      let query;
      let params = [];

      if (userRole === 'admin') {
        // Admin can see all projects
        query = `SELECT * FROM projects ORDER BY created_at DESC`;
      } else {
        // Users can only see projects they're members of
        query = `
          SELECT p.* FROM projects p
          JOIN project_memberships pm ON p.id = pm.project_id
          WHERE pm.user_id = $1 AND p.is_active = true
          ORDER BY p.created_at DESC
        `;
        params = [userId];
      }

      const result = await client.query(query, params);
      return result.rows.map(project => this.sanitizeProject(project));

    } finally {
      client.release();
    }
  }

  async getProjectById(projectId, userId, userRole) {
    const client = await this.pool.connect();
    try {
      let query;
      let params = [];

      if (userRole === 'admin') {
        query = `SELECT * FROM projects WHERE id = $1`;
        params = [projectId];
      } else {
        query = `
          SELECT p.* FROM projects p
          JOIN project_memberships pm ON p.id = pm.project_id
          WHERE p.id = $1 AND pm.user_id = $2 AND p.is_active = true
        `;
        params = [projectId, userId];
      }

      const result = await client.query(query, params);

      if (result.rows.length === 0) {
        throw new Error('Project not found or access denied');
      }

      return this.sanitizeProject(result.rows[0]);

    } finally {
      client.release();
    }
  }

  // =====================================================
  // PROJECT MEMBERSHIP MANAGEMENT
  // =====================================================

  async getProjectMembers(projectId, userId, userRole) {
    const client = await this.pool.connect();
    try {
      // Check if user has access to this project
      if (userRole !== 'admin') {
        const accessCheck = await client.query(
          `SELECT role FROM project_memberships WHERE project_id = $1 AND user_id = $2`,
          [projectId, userId]
        );

        if (accessCheck.rows.length === 0) {
          throw new Error('Access denied to project');
        }
      }

      const result = await client.query(
        `SELECT 
          pm.*,
          u.email,
          u.username,
          u.first_name,
          u.last_name,
          u.avatar_url,
          u.global_role
        FROM project_memberships pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = $1
        ORDER BY pm.joined_at ASC`,
        [projectId]
      );

      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        projectId: row.project_id,
        role: row.role,
        permissions: row.permissions || {},
        profileData: row.profile_data || {},
        settings: row.settings || {},
        lastAccessed: row.last_accessed,
        joinedAt: row.joined_at,
        user: {
          email: row.email,
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          avatar: row.avatar_url,
          globalRole: row.global_role
        }
      }));

    } finally {
      client.release();
    }
  }

  async addMemberToProject(projectId, userEmail, role, addedBy) {
    const client = await this.pool.connect();
    try {
      // Find user by email
      const userResult = await client.query(
        `SELECT id FROM users WHERE email = $1 AND is_active = true`,
        [userEmail]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const userId = userResult.rows[0].id;

      // Add user to project
      const result = await client.query(
        `INSERT INTO project_memberships (user_id, project_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, project_id) 
         DO UPDATE SET role = $3, updated_at = NOW()
         RETURNING *`,
        [userId, projectId, role]
      );

      // Log member addition
      await this.logAuditEvent(client, {
        userId: addedBy,
        projectId,
        action: 'member_added_to_project',
        resourceType: 'project_membership',
        resourceId: result.rows[0].id,
        details: { addedUserEmail: userEmail, role },
        severity: 'info',
        category: 'project_management'
      });

      return result.rows[0];

    } finally {
      client.release();
    }
  }

  async updateMemberRole(projectId, userId, newRole, updatedBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `UPDATE project_memberships 
         SET role = $1, updated_at = NOW()
         WHERE project_id = $2 AND user_id = $3
         RETURNING *`,
        [newRole, projectId, userId]
      );

      if (result.rows.length === 0) {
        throw new Error('Project membership not found');
      }

      // Log role update
      await this.logAuditEvent(client, {
        userId: updatedBy,
        projectId,
        action: 'member_role_updated',
        resourceType: 'project_membership',
        resourceId: result.rows[0].id,
        details: { updatedUserId: userId, newRole },
        severity: 'info',
        category: 'project_management'
      });

      return result.rows[0];

    } finally {
      client.release();
    }
  }

  async removeMemberFromProject(projectId, userId, removedBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `DELETE FROM project_memberships WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId]
      );

      if (result.rowCount === 0) {
        throw new Error('Project membership not found');
      }

      // Log member removal
      await this.logAuditEvent(client, {
        userId: removedBy,
        projectId,
        action: 'member_removed_from_project',
        resourceType: 'project_membership',
        details: { removedUserId: userId },
        severity: 'warning',
        category: 'project_management'
      });

      return { success: true };

    } finally {
      client.release();
    }
  }

  // =====================================================
  // PROJECT SWITCHING & STATE MANAGEMENT
  // =====================================================

  async switchProject(userId, projectId) {
    const client = await this.pool.connect();
    try {
      // Verify user has access to this project
      const membership = await client.query(
        `SELECT * FROM project_memberships WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId]
      );

      if (membership.rows.length === 0) {
        throw new Error('Access denied to project');
      }

      // Update last accessed timestamp
      await client.query(
        `UPDATE project_memberships SET last_accessed = NOW() WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId]
      );

      // Get project details
      const project = await this.getProjectById(projectId, userId, 'user');

      // Log project switch
      await this.logAuditEvent(client, {
        userId,
        projectId,
        action: 'project_switched',
        details: { projectName: project.name },
        severity: 'info',
        category: 'project_management'
      });

      return {
        project,
        membership: membership.rows[0]
      };

    } finally {
      client.release();
    }
  }

  // =====================================================
  // PROJECT-SPECIFIC DATA MANAGEMENT
  // =====================================================

  async saveProjectData(projectId, dataType, data, createdBy) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO project_data (project_id, data_type, data, created_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (project_id, data_type) 
         DO UPDATE SET data = $3, updated_at = NOW()
         RETURNING *`,
        [projectId, dataType, JSON.stringify(data), createdBy]
      );

      // Log data save
      await this.logAuditEvent(client, {
        userId: createdBy,
        projectId,
        action: 'project_data_saved',
        resourceType: 'project_data',
        resourceId: result.rows[0].id,
        details: { dataType },
        severity: 'info',
        category: 'data_management'
      });

      return result.rows[0];

    } finally {
      client.release();
    }
  }

  async getProjectData(projectId, dataType, userId, userRole) {
    const client = await this.pool.connect();
    try {
      // Check access
      if (userRole !== 'admin') {
        const accessCheck = await client.query(
          `SELECT 1 FROM project_memberships WHERE project_id = $1 AND user_id = $2`,
          [projectId, userId]
        );

        if (accessCheck.rows.length === 0) {
          throw new Error('Access denied to project data');
        }
      }

      const result = await client.query(
        `SELECT * FROM project_data WHERE project_id = $1 AND data_type = $2`,
        [projectId, dataType]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        ...result.rows[0],
        data: JSON.parse(result.rows[0].data)
      };

    } finally {
      client.release();
    }
  }

  async getAllProjectData(projectId, userId, userRole) {
    const client = await this.pool.connect();
    try {
      // Check access
      if (userRole !== 'admin') {
        const accessCheck = await client.query(
          `SELECT 1 FROM project_memberships WHERE project_id = $1 AND user_id = $2`,
          [projectId, userId]
        );

        if (accessCheck.rows.length === 0) {
          throw new Error('Access denied to project data');
        }
      }

      const result = await client.query(
        `SELECT * FROM project_data WHERE project_id = $1 ORDER BY created_at DESC`,
        [projectId]
      );

      return result.rows.map(row => ({
        ...row,
        data: JSON.parse(row.data)
      }));

    } finally {
      client.release();
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  sanitizeProject(project) {
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      ownerId: project.owner_id,
      settings: project.settings || {},
      metadata: project.metadata || {},
      environmentConfig: project.environment_config || {},
      isActive: project.is_active,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    };
  }

  async logAuditEvent(client, eventData) {
    try {
      await client.query(
        `SELECT log_audit_event($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          eventData.userId,
          eventData.action,
          eventData.projectId || null,
          eventData.resourceType || null,
          eventData.resourceId || null,
          JSON.stringify(eventData.details || {}),
          eventData.severity || 'info',
          eventData.category || null
        ]
      );
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  async validateProjectAccess(userId, projectId, userRole) {
    if (userRole === 'admin') {
      return true;
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT 1 FROM project_memberships WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId]
      );

      return result.rows.length > 0;

    } finally {
      client.release();
    }
  }
}

module.exports = new ProjectService();
