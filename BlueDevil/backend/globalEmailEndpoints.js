const express = require('express');
const { authenticateToken } = require('./auth');
const emailService = require('./emailService');

const app = express.Router();

// =====================================================
// GLOBAL EMAIL CONFIGURATION ENDPOINTS
// =====================================================

// Get global email configuration
app.get('/api/settings/email-config', authenticateToken, async (req, res) => {
  try {
    const pool = await global.getPool();
    
    const result = await pool.query(`
      SELECT * FROM global_email_configuration 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return res.json({ 
        success: true, 
        config: {
          smtp_host: '',
          smtp_port: 587,
          smtp_user: '',
          smtp_pass: '',
          smtp_secure: false,
          from_email: '',
          from_name: ''
        }
      });
    }
    
    // Don't send password in response
    const config = { ...result.rows[0] };
    delete config.smtp_pass;
    
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error fetching global email configuration:', error);
    res.status(500).json({ error: 'Failed to fetch email configuration' });
  }
});

// Save global email configuration
app.post('/api/settings/email-config', authenticateToken, async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name } = req.body;
    const pool = await global.getPool();
    
    // Validate required fields
    if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !from_email || !from_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Deactivate all existing configurations
    await pool.query(`
      UPDATE global_email_configuration 
      SET is_active = false, updated_at = NOW()
    `);
    
    // Insert new configuration
    const result = await pool.query(`
      INSERT INTO global_email_configuration (smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, from_email, from_name]);
    
    // Don't send password in response
    const config = { ...result.rows[0] };
    delete config.smtp_pass;
    
    res.json({ success: true, config });
  } catch (error) {
    console.error('Error saving global email configuration:', error);
    res.status(500).json({ error: 'Failed to save email configuration' });
  }
});

// Test global email configuration
app.post('/api/settings/email-config/test', authenticateToken, async (req, res) => {
  try {
    const { toEmail } = req.body;
    const pool = await global.getPool();
    
    // Validate toEmail
    if (!toEmail || !toEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    
    // Get active email configuration
    const configResult = await pool.query(`
      SELECT * FROM global_email_configuration 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
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
    console.error('Error testing global email configuration:', error);
    res.status(500).json({ error: 'Failed to test email configuration', details: error.message });
  }
});

// Get global email configuration history
app.get('/api/settings/email-config/history', authenticateToken, async (req, res) => {
  try {
    const pool = await global.getPool();
    
    const result = await pool.query(`
      SELECT id, smtp_host, smtp_port, smtp_user, smtp_secure, from_email, from_name, is_active, created_at, updated_at
      FROM global_email_configuration 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    res.json({ success: true, history: result.rows });
  } catch (error) {
    console.error('Error fetching email configuration history:', error);
    res.status(500).json({ error: 'Failed to fetch configuration history' });
  }
});

module.exports = app;
