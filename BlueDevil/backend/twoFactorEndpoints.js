const express = require('express');
const { authenticateToken } = require('./auth');
const twoFactorService = require('./twoFactorService');

const app = express.Router();

// =====================================================
// TWO-FACTOR AUTHENTICATION ENDPOINTS
// =====================================================

// Send 2FA verification email
app.post('/api/auth/2fa/send', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    console.log(`🔍 2FA request for user ID: ${userId}`);
    const pool = await global.getPool();
    
    // Get user details with better error handling
    const userResult = await pool.query(`
      SELECT id, username, email, is_active FROM users WHERE id = $1
    `, [userId]);
    
    console.log(`🔍 User query result: ${userResult.rows.length} rows found`);
    
    if (userResult.rows.length === 0) {
      console.error(`❌ User not found for 2FA: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    console.log(`✅ User found: ${user.username} (${user.email}) - Active: ${user.is_active}`);
    
    if (!user.is_active) {
      console.error(`❌ User is inactive: ${userId}`);
      return res.status(403).json({ error: 'User account is inactive' });
    }
    
    // Check if user already has a pending verification
    const hasPending = await twoFactorService.hasPendingVerification(userId, pool);
    
    if (hasPending) {
      return res.status(400).json({ 
        error: 'Verification code already sent. Please check your email or wait for it to expire.' 
      });
    }
    
    // Send verification email
    const result = await twoFactorService.sendVerificationEmail(
      userId, 
      user.email, 
      user.username, 
      pool
    );
    
    res.json({
      success: true,
      message: 'Verification email sent successfully',
      expiresAt: result.expiresAt
    });
    
  } catch (error) {
    console.error('Error sending 2FA verification email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

// Verify 2FA code
app.post('/api/auth/2fa/verify', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const { code } = req.body;
    const pool = await global.getPool();
    
    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit code' });
    }
    
    // Verify the code
    const result = await twoFactorService.verifyCode(userId, code, pool);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    // Update user's last 2FA verification time
    await pool.query(`
      UPDATE users 
      SET last_2fa_verification = NOW() 
      WHERE id = $1
    `, [userId]);
    
    res.json({
      success: true,
      message: 'Verification successful'
    });
    
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Check 2FA status
app.get('/api/auth/2fa/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const pool = await global.getPool();
    
    // Check if user has pending verification
    const hasPending = await twoFactorService.hasPendingVerification(userId, pool);
    
    // Get user's last 2FA verification time
    const userResult = await pool.query(`
      SELECT last_2fa_verification FROM users WHERE id = $1
    `, [userId]);
    
    const lastVerification = userResult.rows[0]?.last_2fa_verification;
    
    res.json({
      success: true,
      hasPendingVerification: hasPending,
      lastVerification: lastVerification,
      requiresVerification: !lastVerification || hasPending
    });
    
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    res.status(500).json({ error: 'Failed to check 2FA status' });
  }
});

// Resend 2FA verification email
app.post('/api/auth/2fa/resend', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const pool = await global.getPool();
    
    // Get user details
    const userResult = await pool.query(`
      SELECT username, email FROM users WHERE id = $1
    `, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Clean up any existing codes first
    await twoFactorService.cleanupExpiredCodes(pool);
    
    // Send new verification email
    const result = await twoFactorService.sendVerificationEmail(
      userId, 
      user.email, 
      user.username, 
      pool
    );
    
    res.json({
      success: true,
      message: 'New verification email sent successfully',
      expiresAt: result.expiresAt
    });
    
  } catch (error) {
    console.error('Error resending 2FA verification email:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

module.exports = app;
