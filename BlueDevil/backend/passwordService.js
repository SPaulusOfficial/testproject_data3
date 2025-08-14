const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class PasswordService {
  constructor() {
    this.resetTokens = new Map(); // In production, use Redis or database
    this.whitelistedDomains = new Set();
    this.loadDomainWhitelist();
  }

  // Load domain whitelist from file
  async loadDomainWhitelist() {
    try {
      const whitelistPath = path.join(__dirname, 'domain-whitelist.def');
      const content = await fs.readFile(whitelistPath, 'utf8');
      
      const domains = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.toLowerCase());
      
      domains.forEach(domain => this.whitelistedDomains.add(domain));
      
      console.log(`✅ Loaded ${domains.length} whitelisted domains for password reset`);
    } catch (error) {
      console.error('❌ Error loading domain whitelist:', error);
      // Fallback to default domains
      this.whitelistedDomains.add('salesfive.com');
      this.whitelistedDomains.add('salesfive.de');
    }
  }

  // Validate email domain against whitelist
  isEmailDomainAllowed(email) {
    if (!email || !email.includes('@')) {
      return false;
    }
    
    const domain = email.split('@')[1].toLowerCase();
    return this.whitelistedDomains.has(domain);
  }

  // Generate secure reset token
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Validate password strength
  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Store reset token (in production, use database)
  storeResetToken(email, token) {
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    this.resetTokens.set(token, {
      email,
      expiresAt,
      used: false
    });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
  }

  // Validate reset token
  validateResetToken(token) {
    const tokenData = this.resetTokens.get(token);
    
    if (!tokenData) {
      return { isValid: false, error: 'Invalid token' };
    }
    
    if (tokenData.used) {
      return { isValid: false, error: 'Token already used' };
    }
    
    if (Date.now() > tokenData.expiresAt) {
      this.resetTokens.delete(token);
      return { isValid: false, error: 'Token expired' };
    }
    
    return { isValid: true, email: tokenData.email };
  }

  // Mark token as used
  markTokenAsUsed(token) {
    const tokenData = this.resetTokens.get(token);
    if (tokenData) {
      tokenData.used = true;
      this.resetTokens.set(token, tokenData);
    }
  }

  // Clean up expired tokens
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of this.resetTokens.entries()) {
      if (now > data.expiresAt) {
        this.resetTokens.delete(token);
      }
    }
  }

  // Generate email content for password reset
  generateResetEmailContent(token, resetUrl) {
    return {
      subject: 'Password Reset Request - Salesfive Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
            <h1>Salesfive Platform</h1>
            <h2>Password Reset Request</h2>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your Salesfive Platform account.</p>
            
            <p>If you didn't request this password reset, please ignore this email.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}?token=${token}" 
                 style="background: #0025D1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>You can only use this link once</li>
              <li>If the link doesn't work, copy and paste this URL into your browser:</li>
            </ul>
            
            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px;">
              ${resetUrl}?token=${token}
            </p>
            
            <p>Best regards,<br>Salesfive Platform Team</p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `
Password Reset Request - Salesfive Platform

Hello,

We received a request to reset your password for your Salesfive Platform account.

If you didn't request this password reset, please ignore this email.

To reset your password, click the following link:
${resetUrl}?token=${token}

Important:
- This link will expire in 1 hour
- You can only use this link once

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.
      `
    };
  }

  // Generate email content for admin password set
  generateAdminPasswordEmailContent(email, temporaryPassword) {
    return {
      subject: 'Your Account Has Been Created - Salesfive Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
            <h1>Salesfive Platform</h1>
            <h2>Account Created</h2>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Hello,</p>
            
            <p>Your account has been created by an administrator.</p>
            
            <p><strong>Your temporary password is:</strong></p>
            <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; font-family: monospace; font-size: 18px; margin: 20px 0;">
              ${temporaryPassword}
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>Please change your password immediately after your first login</li>
              <li>This temporary password is only valid for your first login</li>
              <li>You can change your password in your profile settings</li>
            </ul>
            
            <p>Best regards,<br>Salesfive Platform Team</p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `
Your Account Has Been Created - Salesfive Platform

Hello,

Your account has been created by an administrator.

Your temporary password is: ${temporaryPassword}

Important:
- Please change your password immediately after your first login
- This temporary password is only valid for your first login
- You can change your password in your profile settings

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.
      `
    };
  }

  // Generate temporary password
  generateTemporaryPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill the rest randomly
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

module.exports = new PasswordService();
