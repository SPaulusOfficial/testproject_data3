const crypto = require('crypto');
const emailService = require('./emailService');

class TwoFactorService {
  /**
   * Generate a 6-digit verification code
   * @returns {string} 6-digit code
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send 2FA verification email
   * @param {string} userId - User ID
   * @param {string} userEmail - User email
   * @param {string} username - Username
   * @param {Object} pool - Database connection pool
   * @returns {Object} Result with code and expiry
   */
  async sendVerificationEmail(userId, userEmail, username, pool) {
    try {
      // Check if there's a recent code that was sent (within last 2 minutes)
      const recentCodeResult = await pool.query(`
        SELECT email_sent_at, email_code 
        FROM two_factor_auth 
        WHERE user_id = $1 
        AND is_used = false 
        AND expires_at > NOW()
        AND email_sent_at > NOW() - INTERVAL '2 minutes'
        ORDER BY email_sent_at DESC 
        LIMIT 1
      `, [userId]);
      
      if (recentCodeResult.rows.length > 0) {
        const recentCode = recentCodeResult.rows[0];
        const timeSinceSent = Date.now() - new Date(recentCode.email_sent_at).getTime();
        const minutesSinceSent = Math.floor(timeSinceSent / (1000 * 60));
        
        console.log(`⏰ Recent 2FA code found, sent ${minutesSinceSent} minutes ago`);
        
        // If code was sent less than 2 minutes ago, don't send a new one
        if (minutesSinceSent < 2) {
          throw new Error(`Verification code already sent. Please check your email or wait for it to expire. (Sent ${minutesSinceSent} minutes ago)`);
        } else {
          console.log(`✅ Code is old enough (${minutesSinceSent} minutes), sending new code`);
        }
      }
      
      // Generate verification code
      const code = this.generateVerificationCode();
      
      // Set expiry time (10 minutes from now)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      // Save to database with current timestamp
      await pool.query(`
        INSERT INTO two_factor_auth (user_id, email_code, expires_at, email_sent_at)
        VALUES ($1, $2, $3, NOW())
      `, [userId, code, expiresAt]);
      
      // Get global email configuration for 2FA
      const globalEmailResult = await pool.query(`
        SELECT * FROM global_email_configuration 
        WHERE is_active = true 
        ORDER BY created_at DESC 
        LIMIT 1
      `);
      
      let emailConfig;
      if (globalEmailResult.rows.length === 0) {
        console.log('⚠️ No global email configuration found, using fallback configuration');
        // Use fallback configuration (same as password reset)
        emailConfig = {
          smtp_host: 'smtp.gmail.com',
          smtp_port: 587,
          smtp_secure: false,
          smtp_user: 'test@example.com',
          smtp_pass: 'testpass',
          from_name: 'Salesfive Platform',
          from_email: 'noreply@salesfive.com'
        };
      } else {
        emailConfig = globalEmailResult.rows[0];
      }
      
      // Send verification email directly using nodemailer
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: emailConfig.smtp_host,
        port: emailConfig.smtp_port,
        secure: emailConfig.smtp_secure,
        auth: {
          user: emailConfig.smtp_user,
          pass: emailConfig.smtp_pass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
            <h1>Salesfive Platform</h1>
            <h2>Two-Factor Authentication</h2>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Hello ${username},</p>
            
            <p>You have requested to log in to your Salesfive Platform account. To complete the login process, please enter the following verification code:</p>
            
            <div style="background: #e8f4fd; border: 2px solid #0025D1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #0025D1; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h2>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This code will expire in 10 minutes</li>
              <li>If you didn't request this code, please ignore this email</li>
              <li>Never share this code with anyone</li>
            </ul>
            
            <p>For security reasons, this code can only be used once.</p>
            
            <p>Best regards,<br>Salesfive Platform Team</p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is a security verification email. Please do not reply to this email.</p>
          </div>
        </div>
      `;

      const textContent = `Your Verification Code - Salesfive Platform

Hello ${username},

You have requested to log in to your Salesfive Platform account. To complete the login process, please enter the following verification code:

${code}

Important:
- This code will expire in 10 minutes
- If you didn't request this code, please ignore this email
- Never share this code with anyone

For security reasons, this code can only be used once.

Best regards,
Salesfive Platform Team

This is a security verification email. Please do not reply to this email.`;

      console.log(`📧 Sending 2FA email to: ${userEmail}`);
      console.log(`📧 Using SMTP: ${emailConfig.smtp_host}:${emailConfig.smtp_port}`);
      console.log(`📧 From: ${emailConfig.from_name} <${emailConfig.from_email}>`);
      
      await transporter.sendMail({
        from: `"${emailConfig.from_name}" <${emailConfig.from_email}>`,
        to: userEmail,
        subject: 'Your Verification Code - Salesfive Platform',
        html: htmlContent,
        text: textContent
      });
      
      console.log(`✅ 2FA email sent successfully to: ${userEmail}`);
      
      return {
        success: true,
        message: 'Verification email sent',
        expiresAt: expiresAt
      };
      
    } catch (error) {
      console.error('Error sending 2FA verification email:', error);
      throw error;
    }
  }

  /**
   * Verify 2FA code
   * @param {string} userId - User ID
   * @param {string} code - Verification code
   * @param {Object} pool - Database connection pool
   * @returns {Object} Verification result
   */
  async verifyCode(userId, code, pool) {
    try {
      // Get the most recent unused code for this user
      const result = await pool.query(`
        SELECT * FROM two_factor_auth 
        WHERE user_id = $1 
        AND email_code = $2 
        AND is_used = false 
        AND expires_at > NOW()
        ORDER BY created_at DESC 
        LIMIT 1
      `, [userId, code]);
      
      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid or expired verification code'
        };
      }
      
      const twoFactorRecord = result.rows[0];
      
      // Mark code as used
      await pool.query(`
        UPDATE two_factor_auth 
        SET is_used = true 
        WHERE id = $1
      `, [twoFactorRecord.id]);
      
      // Update user's last 2FA verification timestamp
      await pool.query(`
        UPDATE users 
        SET last_2fa_verification = NOW() 
        WHERE id = $1
      `, [userId]);
      
      // Clean up expired codes
      await pool.query(`
        DELETE FROM two_factor_auth 
        WHERE user_id = $1 
        AND (expires_at <= NOW() OR is_used = true)
      `, [userId]);
      
      return {
        success: true,
        message: 'Verification successful'
      };
      
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      throw error;
    }
  }

  /**
   * Check if user has pending 2FA verification
   * @param {string} userId - User ID
   * @param {Object} pool - Database connection pool
   * @returns {boolean} True if verification is pending
   */
  async hasPendingVerification(userId, pool) {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM two_factor_auth 
        WHERE user_id = $1 
        AND is_used = false 
        AND expires_at > NOW()
      `, [userId]);
      
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking pending 2FA verification:', error);
      return false;
    }
  }

  /**
   * Clean up expired 2FA codes
   * @param {Object} pool - Database connection pool
   */
  async cleanupExpiredCodes(pool) {
    try {
      await pool.query(`
        DELETE FROM two_factor_auth 
        WHERE expires_at <= NOW() OR is_used = true
      `);
    } catch (error) {
      console.error('Error cleaning up expired 2FA codes:', error);
    }
  }
}

module.exports = new TwoFactorService();
