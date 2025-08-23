const Email = require('email-templates');
const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    this.transporters = new Map();
    this.emailInstances = new Map();
  }

  /**
   * Initialize email transporter for a project
   * @param {Object} config - Email configuration
   * @returns {Object} Email instance
   */
  async initializeEmailInstance(config) {
    const configKey = `${config.provider}_${config.host}_${config.port}`;
    
    if (this.emailInstances.has(configKey)) {
      return this.emailInstances.get(configKey);
    }

    let transporter;

    switch (config.provider.toLowerCase()) {
      case 'smtp':
        transporter = nodemailer.createTransporter({
          host: config.host,
          port: config.port,
          secure: config.use_ssl,
          auth: {
            user: config.username,
            pass: config.password
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        break;
      
      case 'sendgrid':
        // For SendGrid, you would use their API
        throw new Error('SendGrid integration not yet implemented');
      
      case 'mailgun':
        // For Mailgun, you would use their API
        throw new Error('Mailgun integration not yet implemented');
      
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }

    // Create email instance with email-templates
    const email = new Email({
      transport: transporter,
      send: true,
      preview: false,
      views: {
        root: path.join(__dirname, 'email-templates'),
        options: {
          extension: 'hbs'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, 'email-templates')
        }
      }
    });

    this.emailInstances.set(configKey, email);
    return email;
  }

  /**
   * Get email template for a process from project configuration
   * @param {string} processName - Process name
   * @param {string} projectId - Project ID (optional)
   * @param {Object} pool - Database connection pool
   * @returns {Object} Template object
   */
  async getTemplate(processName, projectId = null, pool) {
    let template;

    if (projectId) {
      // Try to get project-specific template from environment_config
      const projectResult = await pool.query(`
        SELECT environment_config, settings
        FROM projects 
        WHERE id = $1 AND is_active = true
      `, [projectId]);

      if (projectResult.rows.length > 0) {
        const project = projectResult.rows[0];
        const envConfig = project.environment_config || {};
        const settings = project.settings || {};
        
        // Check for email templates in environment_config
        if (envConfig.emailTemplates && envConfig.emailTemplates[processName]) {
          template = envConfig.emailTemplates[processName];
          template.source = 'project_config';
        }
        // Check for email templates in settings (fallback)
        else if (settings.emailTemplates && settings.emailTemplates[processName]) {
          template = settings.emailTemplates[processName];
          template.source = 'project_settings';
        }
      }
    }

    // If no project-specific template, get default template
    if (!template) {
      const defaultTemplateResult = await pool.query(`
        SELECT id, process_name, subject, html_content, text_content, description
        FROM default_email_templates 
        WHERE process_name = $1 AND is_active = true
      `, [processName]);

      if (defaultTemplateResult.rows.length === 0) {
        throw new Error(`No template found for process: ${processName}`);
      }

      template = defaultTemplateResult.rows[0];
      template.source = 'system_default';
    }

    return template;
  }

  /**
   * Save email template to project configuration
   * @param {string} projectId - Project ID
   * @param {string} processName - Process name
   * @param {Object} templateData - Template data
   * @param {Object} pool - Database connection pool
   * @param {string} userId - User ID who is saving the template
   * @returns {Object} Save result
   */
  async saveTemplateToProjectConfig(projectId, processName, templateData, pool, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current project configuration
      const projectResult = await client.query(`
        SELECT environment_config, settings, metadata
        FROM projects 
        WHERE id = $1
      `, [projectId]);

      if (projectResult.rows.length === 0) {
        throw new Error('Project not found');
      }

      const project = projectResult.rows[0];
      const envConfig = project.environment_config || {};
      const settings = project.settings || {};
      const metadata = project.metadata || {};

      // Initialize email templates in environment_config if not exists
      if (!envConfig.emailTemplates) {
        envConfig.emailTemplates = {};
      }

      // Save template to environment_config
      envConfig.emailTemplates[processName] = {
        name: templateData.name || processName,
        subject: templateData.subject,
        html_content: templateData.htmlContent,
        text_content: templateData.textContent,
        description: templateData.description,
        is_active: templateData.isActive !== false,
        created_at: new Date().toISOString(),
        created_by: userId,
        updated_at: new Date().toISOString(),
        updated_by: userId
      };

      // Update metadata with change history
      if (!metadata.emailTemplateHistory) {
        metadata.emailTemplateHistory = [];
      }

      metadata.emailTemplateHistory.push({
        action: 'template_updated',
        process_name: processName,
        user_id: userId,
        timestamp: new Date().toISOString(),
        template_name: templateData.name || processName
      });

      // Update project with new configuration
      await client.query(`
        UPDATE projects 
        SET environment_config = $1, metadata = $2, updated_at = NOW()
        WHERE id = $3
      `, [JSON.stringify(envConfig), JSON.stringify(metadata), projectId]);

      await client.query('COMMIT');

      return { 
        success: true, 
        message: 'Template saved to project configuration',
        template: envConfig.emailTemplates[processName]
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all email templates from project configuration and default templates
   * @param {string} projectId - Project ID
   * @param {Object} pool - Database connection pool
   * @returns {Array} List of templates
   */
  async getProjectTemplates(projectId, pool) {
    const result = await pool.query(`
      SELECT environment_config, settings
      FROM projects 
      WHERE id = $1 AND is_active = true
    `, [projectId]);

    if (result.rows.length === 0) {
      return [];
    }

    const project = result.rows[0];
    const envConfig = project.environment_config || {};
    const settings = project.settings || {};
    
    const templates = [];
    const projectTemplateProcesses = new Set();

    // Get templates from environment_config
    if (envConfig.emailTemplates) {
      for (const [processName, template] of Object.entries(envConfig.emailTemplates)) {
        projectTemplateProcesses.add(processName);
        templates.push({
          id: `${projectId}_${processName}`,
          name: template.name || processName,
          process_name: processName,
          subject: template.subject,
          description: template.description,
          is_active: template.is_active !== false,
          created_at: template.created_at,
          updated_at: template.updated_at,
          created_by: template.created_by,
          source: 'project_config'
        });
      }
    }

    // Get templates from settings (fallback)
    if (settings.emailTemplates) {
      for (const [processName, template] of Object.entries(settings.emailTemplates)) {
        // Only add if not already in environment_config
        if (!envConfig.emailTemplates || !envConfig.emailTemplates[processName]) {
          projectTemplateProcesses.add(processName);
          templates.push({
            id: `${projectId}_${processName}`,
            name: template.name || processName,
            process_name: processName,
            subject: template.subject,
            description: template.description,
            is_active: template.is_active !== false,
            created_at: template.created_at,
            updated_at: template.updated_at,
            created_by: template.created_by,
            source: 'project_settings'
          });
        }
      }
    }

    // Get default templates for processes that don't have project-specific templates
    const defaultTemplatesResult = await pool.query(`
      SELECT id, process_name, subject, html_content, text_content, description, is_active, created_at, updated_at
      FROM default_email_templates 
      WHERE is_active = true
      ORDER BY process_name
    `);

    for (const defaultTemplate of defaultTemplatesResult.rows) {
      if (!projectTemplateProcesses.has(defaultTemplate.process_name)) {
        templates.push({
          id: `default_${defaultTemplate.process_name}`,
          name: defaultTemplate.process_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          process_name: defaultTemplate.process_name,
          subject: defaultTemplate.subject,
          html_content: defaultTemplate.html_content,
          text_content: defaultTemplate.text_content,
          description: defaultTemplate.description,
          is_active: defaultTemplate.is_active,
          created_at: defaultTemplate.created_at,
          updated_at: defaultTemplate.updated_at,
          created_by: null,
          source: 'system_default'
        });
      }
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Delete email template from project configuration
   * @param {string} projectId - Project ID
   * @param {string} processName - Process name
   * @param {Object} pool - Database connection pool
   * @param {string} userId - User ID who is deleting the template
   * @returns {Object} Delete result
   */
  async deleteTemplateFromProjectConfig(projectId, processName, pool, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get current project configuration
      const projectResult = await client.query(`
        SELECT environment_config, settings, metadata
        FROM projects 
        WHERE id = $1
      `, [projectId]);

      if (projectResult.rows.length === 0) {
        throw new Error('Project not found');
      }

      const project = projectResult.rows[0];
      const envConfig = project.environment_config || {};
      const settings = project.settings || {};
      const metadata = project.metadata || {};

      let deleted = false;

      // Delete from environment_config
      if (envConfig.emailTemplates && envConfig.emailTemplates[processName]) {
        delete envConfig.emailTemplates[processName];
        deleted = true;
      }

      // Delete from settings (fallback)
      if (settings.emailTemplates && settings.emailTemplates[processName]) {
        delete settings.emailTemplates[processName];
        deleted = true;
      }

      if (!deleted) {
        throw new Error('Template not found in project configuration');
      }

      // Update metadata with change history
      if (!metadata.emailTemplateHistory) {
        metadata.emailTemplateHistory = [];
      }

      metadata.emailTemplateHistory.push({
        action: 'template_deleted',
        process_name: processName,
        user_id: userId,
        timestamp: new Date().toISOString()
      });

      // Update project with new configuration
      await client.query(`
        UPDATE projects 
        SET environment_config = $1, settings = $2, metadata = $3, updated_at = NOW()
        WHERE id = $4
      `, [JSON.stringify(envConfig), JSON.stringify(settings), JSON.stringify(metadata), projectId]);

      await client.query('COMMIT');

      return { 
        success: true, 
        message: 'Template deleted from project configuration'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Send email using template
   * @param {string} processName - Process name
   * @param {string} toEmail - Recipient email
   * @param {Object} parameters - Template parameters
   * @param {string} projectId - Project ID (optional)
   * @param {Object} pool - Database connection pool
   * @param {string} userId - User ID who triggered the email (optional)
   * @returns {Object} Send result
   */
  async sendTemplateEmail(processName, toEmail, parameters, projectId = null, pool, userId = null) {
    try {
      // Get template
      const template = await this.getTemplate(processName, projectId, pool);

      // Get email configuration
      const configResult = await pool.query(`
        SELECT provider, host, port, username, password_encrypted, from_email, from_name, 
               reply_to_email, use_ssl, use_tls
        FROM email_configurations 
        WHERE project_id = $1 AND is_active = true
      `, [projectId]);

      if (configResult.rows.length === 0) {
        throw new Error(`No email configuration found for project: ${projectId}`);
      }

      const config = configResult.rows[0];

      // Initialize email instance
      const email = await this.initializeEmailInstance(config);

      // Create template data with parameters
      const templateData = {
        ...parameters,
        subject: template.subject,
        // Add any additional data you want available in templates
        platform: 'Salesfive Platform',
        year: new Date().getFullYear()
      };

      // Send email using email-templates
      const result = await email.send({
        template: processName, // This will look for processName.hbs in email-templates folder
        message: {
          from: `"${config.from_name}" <${config.from_email}>`,
          to: toEmail,
          subject: template.subject
        },
        locals: templateData
      });

      // Log email usage
      await this.logEmailUsage(template.id, projectId, toEmail, processName, template.subject, parameters, userId, 'sent', null, config.provider, result.messageId, pool);

      return {
        success: true,
        messageId: result.messageId,
        template: template.name || template.process_name
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Log failed email
      if (pool) {
        await this.logEmailUsage(null, projectId, toEmail, processName, '', parameters, userId, 'failed', error.message, null, null, pool);
      }

      throw error;
    }
  }

  /**
   * Send email with inline template (for dynamic templates from project config)
   * @param {string} processName - Process name
   * @param {string} toEmail - Recipient email
   * @param {Object} parameters - Template parameters
   * @param {Object} template - Template object with html_content and text_content
   * @param {string} projectId - Project ID (optional)
   * @param {Object} pool - Database connection pool
   * @param {string} userId - User ID who triggered the email (optional)
   * @returns {Object} Send result
   */
  async sendInlineTemplateEmail(processName, toEmail, parameters, template, projectId = null, pool, userId = null) {
    try {
      // Get email configuration
      const configResult = await pool.query(`
        SELECT provider, host, port, username, password_encrypted, from_email, from_name, 
               reply_to_email, use_ssl, use_tls
        FROM email_configurations 
        WHERE project_id = $1 AND is_active = true
      `, [projectId]);

      if (configResult.rows.length === 0) {
        throw new Error(`No email configuration found for project: ${projectId}`);
      }

      const config = configResult.rows[0];

      // Initialize transporter
      const transporter = await this.initializeTransporter(config);

      // Replace placeholders in template content
      const subject = this.replacePlaceholders(template.subject, parameters);
      const htmlContent = this.replacePlaceholders(template.html_content, parameters);
      const textContent = this.replacePlaceholders(template.text_content, parameters);

      // Send email
      const mailOptions = {
        from: `"${config.from_name}" <${config.from_email}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
        text: textContent
      };

      if (config.reply_to_email) {
        mailOptions.replyTo = config.reply_to_email;
      }

      const result = await transporter.sendMail(mailOptions);

      // Log email usage
      await this.logEmailUsage(template.id, projectId, toEmail, processName, subject, parameters, userId, 'sent', null, config.provider, result.messageId, pool);

      return {
        success: true,
        messageId: result.messageId,
        template: template.name || template.process_name
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Log failed email
      if (pool) {
        await this.logEmailUsage(null, projectId, toEmail, processName, '', parameters, userId, 'failed', error.message, null, null, pool);
      }

      throw error;
    }
  }

  /**
   * Replace placeholders in template content using Handlebars syntax
   * @param {string} content - Template content with {{{PLACEHOLDER}}} placeholders
   * @param {Object} parameters - Parameters to replace placeholders
   * @returns {string} Content with replaced placeholders
   */
  replacePlaceholders(content, parameters) {
    const Handlebars = require('handlebars');
    
    try {
      const template = Handlebars.compile(content);
      return template(parameters);
    } catch (error) {
      console.error('Error compiling template:', error);
      // Fallback to simple replacement
      let result = content;
      for (const [key, value] of Object.entries(parameters)) {
        const placeholder = `{{{${key.toUpperCase()}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), value || '');
      }
      return result;
    }
  }

  /**
   * Initialize transporter (fallback method)
   * @param {Object} config - Email configuration
   * @returns {Object} Transporter instance
   */
  async initializeTransporter(config) {
    const configKey = `${config.provider}_${config.host}_${config.port}`;
    
    if (this.transporters.has(configKey)) {
      return this.transporters.get(configKey);
    }

    let transporter;

    switch (config.provider.toLowerCase()) {
      case 'smtp':
        transporter = nodemailer.createTransporter({
          host: config.host,
          port: config.port,
          secure: config.use_ssl,
          auth: {
            user: config.username,
            pass: config.password
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        break;
      
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }

    this.transporters.set(configKey, transporter);
    return transporter;
  }

  /**
   * Log email usage for audit trail
   * @param {string} templateId - Template ID
   * @param {string} projectId - Project ID
   * @param {string} recipientEmail - Recipient email
   * @param {string} processName - Process name
   * @param {string} subject - Email subject
   * @param {Object} parameters - Parameters used
   * @param {string} userId - User ID who triggered the email
   * @param {string} status - Email status (sent, failed, pending)
   * @param {string} errorMessage - Error message if failed
   * @param {string} emailProvider - Email provider
   * @param {string} emailId - External email service ID
   * @param {Object} pool - Database connection pool
   */
  async logEmailUsage(templateId, projectId, recipientEmail, processName, subject, parameters, userId, status, errorMessage, emailProvider, emailId, pool) {
    try {
      await pool.query(`
        INSERT INTO email_template_usage_log 
        (template_id, project_id, recipient_email, recipient_user_id, process_name, subject, 
         parameters_used, sent_at, sent_by, status, error_message, email_provider, email_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, $12)
      `, [templateId, projectId, recipientEmail, userId, processName, subject, 
          JSON.stringify(parameters), userId, status, errorMessage, emailProvider, emailId]);
    } catch (error) {
      console.error('Failed to log email usage:', error);
    }
  }

  /**
   * Get email configuration for a project (falls back to global config)
   * @param {string} projectId - Project ID
   * @param {Object} pool - Database connection pool
   * @returns {Object} Email configuration
   */
  async getEmailConfig(projectId, pool) {
    // First try to get project-specific configuration
    const projectResult = await pool.query(`
      SELECT * FROM email_configurations WHERE project_id = $1
    `, [projectId]);

    if (projectResult.rows.length > 0) {
      return projectResult.rows[0];
    }

    // Fall back to global configuration
    const globalResult = await pool.query(`
      SELECT * FROM global_email_configuration 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `, []);

    if (globalResult.rows.length > 0) {
      return globalResult.rows[0];
    }

    return null;
  }

  /**
   * Send test email to verify configuration
   * @param {Object} config - Email configuration
   * @param {string} toEmail - Recipient email
   * @returns {Object} Send result
   */
  async sendTestEmail(config, toEmail) {
    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        host: config.smtp_host,
        port: config.smtp_port,
        secure: config.smtp_secure,
        auth: {
          user: config.smtp_user,
          pass: config.smtp_pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await transporter.verify();

      // Send test email
      const info = await transporter.sendMail({
        from: `"${config.from_name}" <${config.from_email}>`,
        to: toEmail,
        subject: 'Test Email - Salesfive Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
              <h1>Salesfive Platform</h1>
              <h2>Test Email</h2>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <p>Hello,</p>
              
              <p>This is a test email to verify your email server configuration.</p>
              
              <p><strong>Configuration Details:</strong></p>
              <ul>
                <li>SMTP Host: ${config.smtp_host}</li>
                <li>SMTP Port: ${config.smtp_port}</li>
                <li>Secure Connection: ${config.smtp_secure ? 'Yes' : 'No'}</li>
                <li>From Email: ${config.from_email}</li>
                <li>From Name: ${config.from_name}</li>
              </ul>
              
              <p>If you received this email, your email server configuration is working correctly!</p>
              
              <p>Best regards,<br>Salesfive Platform Team</p>
            </div>
            
            <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p>This is a test email. Please do not reply to this email.</p>
            </div>
          </div>
        `,
        text: `Test Email - Salesfive Platform

Hello,

This is a test email to verify your email server configuration.

Configuration Details:
- SMTP Host: ${config.smtp_host}
- SMTP Port: ${config.smtp_port}
- Secure Connection: ${config.smtp_secure ? 'Yes' : 'No'}
- From Email: ${config.from_email}
- From Name: ${config.from_name}

If you received this email, your email server configuration is working correctly!

Best regards,
Salesfive Platform Team

This is a test email. Please do not reply to this email.`
      });

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };

    } catch (error) {
      console.error('Error sending test email:', error);
      throw new Error(`Failed to send test email: ${error.message}`);
    }
  }

  /**
   * Get email usage statistics
   * @param {string} projectId - Project ID (optional)
   * @param {Object} pool - Database connection pool
   * @returns {Object} Usage statistics
   */
  async getEmailUsageStats(projectId = null, pool) {
    let query = `
      SELECT 
        process_name,
        COUNT(*) as total_sent,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        MIN(sent_at) as first_sent,
        MAX(sent_at) as last_sent
      FROM email_template_usage_log
    `;

    const params = [];
    if (projectId) {
      query += ' WHERE project_id = $1';
      params.push(projectId);
    }

    query += ' GROUP BY process_name ORDER BY total_sent DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = new EmailService();
