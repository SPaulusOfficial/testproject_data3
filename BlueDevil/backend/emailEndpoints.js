const express = require('express');
const emailService = require('./emailService');
const { authenticateToken } = require('./auth');

const app = express();

// =====================================================
// EMAIL TEMPLATE MANAGEMENT ENDPOINTS
// =====================================================

// Get all email templates for a project
app.get('/api/projects/:projectId/email-templates', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const pool = await global.getPool();
    
    const templates = await emailService.getProjectTemplates(projectId, pool);
    
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

// Get email template by process name from project configuration
app.get('/api/projects/:projectId/email-templates/:processName', authenticateToken, async (req, res) => {
  try {
    const { projectId, processName } = req.params;
    const pool = await global.getPool();
    
    // Get template from project configuration
    const template = await emailService.getTemplate(processName, projectId, pool);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Get user info for created_by and updated_by
    let createdByUser = null;
    let updatedByUser = null;
    
    if (template.created_by) {
      const userResult = await pool.query(`
        SELECT first_name, last_name FROM users WHERE id = $1
      `, [template.created_by]);
      if (userResult.rows.length > 0) {
        createdByUser = userResult.rows[0];
      }
    }
    
    if (template.updated_by) {
      const userResult = await pool.query(`
        SELECT first_name, last_name FROM users WHERE id = $1
      `, [template.updated_by]);
      if (userResult.rows.length > 0) {
        updatedByUser = userResult.rows[0];
      }
    }
    
    const templateWithUserInfo = {
      ...template,
      created_by_name: createdByUser ? `${createdByUser.first_name} ${createdByUser.last_name}` : null,
      updated_by_name: updatedByUser ? `${updatedByUser.first_name} ${updatedByUser.last_name}` : null
    };
    
    res.json({ success: true, template: templateWithUserInfo });
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
});

// Create or update email template in project configuration
app.post('/api/projects/:projectId/email-templates', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, processName, subject, htmlContent, textContent, description, isActive } = req.body;
    const userId = req.user.id;
    
    if (!name || !processName || !subject || !htmlContent || !textContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const pool = await global.getPool();
    
    const result = await emailService.saveTemplateToProjectConfig(projectId, processName, {
      name,
      subject,
      htmlContent,
      textContent,
      description,
      isActive
    }, pool, userId);
    
    res.json({ success: true, template: result.template });
  } catch (error) {
    console.error('Error creating/updating email template:', error);
    res.status(500).json({ error: 'Failed to create/update email template' });
  }
});

// Delete email template from project configuration
app.delete('/api/projects/:projectId/email-templates/:processName', authenticateToken, async (req, res) => {
  try {
    const { projectId, processName } = req.params;
    const userId = req.user.id;
    const pool = await global.getPool();
    
    await emailService.deleteTemplateFromProjectConfig(projectId, processName, pool, userId);
    
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
});

// Toggle email template active status
app.patch('/api/projects/:projectId/email-templates/:processName/toggle', authenticateToken, async (req, res) => {
  try {
    const { projectId, processName } = req.params;
    const pool = await global.getPool();
    
    // Get current templates
    const templates = await emailService.getProjectTemplates(projectId, pool);
    const template = templates.find(t => t.process_name === processName);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Toggle status
    const newStatus = !template.is_active;
    
    // Update template
    await emailService.saveTemplateToProjectConfig(projectId, processName, {
      ...template,
      isActive: newStatus
    }, pool, req.user.id);
    
    res.json({ success: true, isActive: newStatus });
  } catch (error) {
    console.error('Error toggling email template status:', error);
    res.status(500).json({ error: 'Failed to toggle email template status' });
  }
});

// =====================================================
// EMAIL CONFIGURATION ENDPOINTS
// =====================================================

// Get email configuration for a project
app.get('/api/projects/:projectId/email-config', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const pool = await global.getPool();
    
    const result = await pool.query(`
      SELECT * FROM email_configurations 
      WHERE project_id = $1
    `, [projectId]);
    
    const config = result.rows[0] || null;
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching email configuration:', error);
    res.status(500).json({ error: 'Failed to fetch email configuration' });
  }
});

// Create or update email configuration
app.post('/api/projects/:projectId/email-config', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name } = req.body;
    const pool = await global.getPool();
    
    const result = await pool.query(`
      INSERT INTO email_configurations (project_id, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (project_id) 
      DO UPDATE SET 
        smtp_host = EXCLUDED.smtp_host,
        smtp_port = EXCLUDED.smtp_port,
        smtp_user = EXCLUDED.smtp_user,
        smtp_pass = EXCLUDED.smtp_pass,
        smtp_secure = EXCLUDED.smtp_secure,
        from_email = EXCLUDED.from_email,
        from_name = EXCLUDED.from_name,
        updated_at = NOW()
      RETURNING *
    `, [projectId, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name]);
    
    res.json({ success: true, config: result.rows[0] });
  } catch (error) {
    console.error('Error creating/updating email configuration:', error);
    res.status(500).json({ error: 'Failed to create/update email configuration' });
  }
});

// Test email configuration
app.post('/api/projects/:projectId/email-config/test', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { toEmail } = req.body;
    const pool = await global.getPool();
    
    // Validate toEmail
    if (!toEmail || !toEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    
    // Get email configuration
    const configResult = await pool.query(`
      SELECT * FROM email_configurations WHERE project_id = $1
    `, [projectId]);
    
    if (configResult.rows.length === 0) {
      return res.status(400).json({ error: 'Email configuration not found. Please save your configuration first.' });
    }
    
    const config = configResult.rows[0];
    
    // Validate required fields
    if (!config.smtp_host || !config.smtp_port || !config.smtp_user || !config.smtp_pass || !config.from_email || !config.from_name) {
      return res.status(400).json({ error: 'Incomplete email configuration. Please fill in all required fields.' });
    }
    
    // Test email sending
    const result = await emailService.sendTestEmail(config, toEmail);
    
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Error testing email configuration:', error);
    res.status(500).json({ error: 'Failed to test email configuration', details: error.message });
  }
});

// =====================================================
// EMAIL STATISTICS AND MONITORING ENDPOINTS
// =====================================================

// Get email usage statistics
app.get('/api/projects/:projectId/email-stats', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const pool = await global.getPool();
    
    // Get total emails sent
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total FROM email_template_usage_log WHERE project_id = $1
    `, [projectId]);
    
    // Get emails by status
    const statusResult = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM email_template_usage_log 
      WHERE project_id = $1 
      GROUP BY status
    `, [projectId]);
    
    // Get emails by process
    const processResult = await pool.query(`
      SELECT process_name, COUNT(*) as count 
      FROM email_template_usage_log 
      WHERE project_id = $1 
      GROUP BY process_name
    `, [projectId]);
    
    // Get recent activity
    const recentResult = await pool.query(`
      SELECT * FROM email_template_usage_log 
      WHERE project_id = $1 
      ORDER BY sent_at DESC 
      LIMIT 10
    `, [projectId]);
    
    res.json({
      success: true,
      stats: {
        total: parseInt(totalResult.rows[0].total),
        byStatus: statusResult.rows,
        byProcess: processResult.rows,
        recent: recentResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching email statistics:', error);
    res.status(500).json({ error: 'Failed to fetch email statistics' });
  }
});

// Get email usage logs with pagination
app.get('/api/projects/:projectId/email-logs', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, status, processName } = req.query;
    const pool = await global.getPool();
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = `
      SELECT etul.*, 
             u.first_name, u.last_name, u.email as user_email
      FROM email_template_usage_log etul
      LEFT JOIN users u ON etul.sent_by = u.id
      WHERE etul.project_id = $1
    `;
    
    const queryParams = [projectId];
    let paramIndex = 2;
    
    if (status) {
      query += ` AND etul.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }
    
    if (processName) {
      query += ` AND etul.process_name = $${paramIndex}`;
      queryParams.push(processName);
      paramIndex++;
    }
    
    query += ` ORDER BY etul.sent_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM email_template_usage_log etul
      WHERE etul.project_id = $1
    `;
    
    const countParams = [projectId];
    let countParamIndex = 2;
    
    if (status) {
      countQuery += ` AND etul.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    
    if (processName) {
      countQuery += ` AND etul.process_name = $${countParamIndex}`;
      countParams.push(processName);
      countParamIndex++;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    res.json({ 
      success: true, 
      logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({ error: 'Failed to fetch email logs' });
  }
});

// =====================================================
// EMAIL SENDING ENDPOINTS
// =====================================================

// Send email using template
app.post('/api/projects/:projectId/send-email', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { processName, toEmail, parameters } = req.body;
    const userId = req.user.id;
    
    if (!processName || !toEmail || !parameters) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const pool = await global.getPool();
    
    const result = await emailService.sendTemplateEmail(
      processName, 
      toEmail, 
      parameters, 
      projectId, 
      pool, 
      userId
    );
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      template: result.template,
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Get available process names
app.get('/api/email-processes', authenticateToken, async (req, res) => {
  try {
    const pool = await global.getPool();
    
    const result = await pool.query(`
      SELECT process_name, description
      FROM default_email_templates 
      WHERE is_active = true
      ORDER BY process_name
    `);
    
    res.json({ success: true, processes: result.rows });
  } catch (error) {
    console.error('Error fetching email processes:', error);
    res.status(500).json({ error: 'Failed to fetch email processes' });
  }
});

module.exports = app;
