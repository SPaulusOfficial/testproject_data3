// Password Management API Endpoints
// Add these to your server.js file

const passwordService = require('./passwordService');
const { authenticateToken, requirePermission } = require('./auth');

// Request password reset (user-initiated)
app.post('/api/auth/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(`🔄 Password reset requested for: ${email}`);
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Validate email domain against whitelist
    if (!passwordService.isEmailDomainAllowed(email)) {
      console.log(`❌ Email domain not allowed: ${email}`);
      return res.status(403).json({ 
        error: 'Email domain not allowed for password reset',
        message: 'Only company email addresses are allowed for password reset'
      });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if user exists
    const userResult = await client.query(`
      SELECT id, email, username, first_name, last_name, is_active 
      FROM users 
      WHERE email = $1
    `, [email]);
    
    client.release();
    
    if (userResult.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      // Don't reveal if user exists or not for security
      return res.json({ 
        success: true, 
        message: 'If the email address exists in our system, you will receive a password reset link shortly.' 
      });
    }
    
    const user = userResult.rows[0];
    
    if (!user.is_active) {
      console.log(`❌ Inactive user: ${email}`);
      return res.status(403).json({ error: 'Account is deactivated' });
    }
    
    // Generate reset token
    const resetToken = passwordService.generateResetToken();
    passwordService.storeResetToken(email, resetToken);
    
    // Generate reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`;
    
    // Generate email content
    const emailContent = passwordService.generateResetEmailContent(resetToken, resetUrl);
    
    // TODO: Send email using your email service
    // For now, just log the token (in production, send actual email)
    console.log(`📧 Password reset email would be sent to: ${email}`);
    console.log(`🔗 Reset URL: ${resetUrl}?token=${resetToken}`);
    
    // In production, replace this with actual email sending:
    // await emailService.sendEmail(email, emailContent.subject, emailContent.html, emailContent.text);
    
    console.log(`✅ Password reset request processed for: ${email}`);
    res.json({ 
      success: true, 
      message: 'If the email address exists in our system, you will receive a password reset link shortly.' 
    });
    
  } catch (error) {
    console.error('❌ Error requesting password reset:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log('🔄 Password reset with token requested');
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    // Validate token
    const tokenValidation = passwordService.validateResetToken(token);
    if (!tokenValidation.isValid) {
      console.log(`❌ Invalid reset token: ${tokenValidation.error}`);
      return res.status(400).json({ error: tokenValidation.error });
    }
    
    // Validate password strength
    const passwordValidation = passwordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      console.log(`❌ Password validation failed:`, passwordValidation.errors);
      return res.status(400).json({ 
        error: 'Password does not meet requirements',
        details: passwordValidation.errors 
      });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Hash new password
    const hashedPassword = await passwordService.hashPassword(newPassword);
    
    // Update user password
    const updateResult = await client.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW() 
      WHERE email = $2 
      RETURNING id, email, username
    `, [hashedPassword, tokenValidation.email]);
    
    client.release();
    
    if (updateResult.rows.length === 0) {
      console.log(`❌ User not found for password reset: ${tokenValidation.email}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Mark token as used
    passwordService.markTokenAsUsed(token);
    
    console.log(`✅ Password reset successful for: ${tokenValidation.email}`);
    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now log in with your new password.' 
    });
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Admin set password for user
app.post('/api/admin/users/:id/set-password', authenticateToken, requirePermission('UserManagement'), async (req, res) => {
  try {
    const { id } = req.params;
    const { sendEmail = true } = req.body;
    
    console.log(`🔄 Admin password set requested for user: ${id}`);
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Check if user exists
    const userResult = await client.query(`
      SELECT id, email, username, first_name, last_name, is_active 
      FROM users 
      WHERE id = $1
    `, [id]);
    
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    if (!user.is_active) {
      client.release();
      return res.status(403).json({ error: 'Cannot set password for deactivated user' });
    }
    
    // Generate temporary password
    const temporaryPassword = passwordService.generateTemporaryPassword();
    const hashedPassword = await passwordService.hashPassword(temporaryPassword);
    
    // Update user password
    await client.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW() 
      WHERE id = $2
    `, [hashedPassword, id]);
    
    client.release();
    
    // Send email if requested
    if (sendEmail) {
      const emailContent = passwordService.generateAdminPasswordEmailContent(user.email, temporaryPassword);
      
      // TODO: Send email using your email service
      console.log(`📧 Admin password set email would be sent to: ${user.email}`);
      console.log(`🔑 Temporary password: ${temporaryPassword}`);
      
      // In production, replace this with actual email sending:
      // await emailService.sendEmail(user.email, emailContent.subject, emailContent.html, emailContent.text);
    }
    
    console.log(`✅ Admin password set successful for: ${user.email}`);
    res.json({ 
      success: true, 
      message: 'Password has been set successfully',
      temporaryPassword: sendEmail ? undefined : temporaryPassword // Only return if not sending email
    });
    
  } catch (error) {
    console.error('❌ Error setting admin password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

// Change password (user-initiated from profile)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
    
    console.log(`🔄 Password change requested for user: ${userId}`);
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Validate password strength
    const passwordValidation = passwordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      console.log(`❌ Password validation failed:`, passwordValidation.errors);
      return res.status(400).json({ 
        error: 'New password does not meet requirements',
        details: passwordValidation.errors 
      });
    }
    
    const pool = await getPool();
    const client = await pool.connect();
    
    // Get current user password hash
    const userResult = await client.query(`
      SELECT password_hash, email 
      FROM users 
      WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Verify current password
    const isCurrentPasswordValid = await passwordService.verifyPassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      client.release();
      console.log(`❌ Invalid current password for user: ${userId}`);
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await passwordService.hashPassword(newPassword);
    
    // Update password
    await client.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = NOW() 
      WHERE id = $2
    `, [hashedPassword, userId]);
    
    client.release();
    
    console.log(`✅ Password change successful for user: ${userId}`);
    res.json({ 
      success: true, 
      message: 'Password has been changed successfully' 
    });
    
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Validate reset token (for frontend)
app.get('/api/auth/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const tokenValidation = passwordService.validateResetToken(token);
    
    if (tokenValidation.isValid) {
      res.json({ 
        valid: true, 
        email: tokenValidation.email 
      });
    } else {
      res.json({ 
        valid: false, 
        error: tokenValidation.error 
      });
    }
    
  } catch (error) {
    console.error('❌ Error validating reset token:', error);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

// Get password requirements (for frontend)
app.get('/api/auth/password-requirements', (req, res) => {
  res.json({
    requirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.'
  });
});
