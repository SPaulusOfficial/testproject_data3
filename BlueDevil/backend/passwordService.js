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
      parameters: {
        USER_NAME: 'User', // Will be replaced with actual user name
        RESET_URL: `${resetUrl}?token=${token}`,
        EXPIRY_HOURS: '1'
      }
    };
  }

  // Generate email content for admin password set
  generateAdminPasswordEmailContent(email, temporaryPassword) {
    return {
      subject: 'Your Account Has Been Created - Salesfive Platform',
      parameters: {
        USER_NAME: 'User', // Will be replaced with actual user name
        USER_EMAIL: email,
        USERNAME: email.split('@')[0], // Simple username from email
        TEMP_PASSWORD: temporaryPassword,
        LOGIN_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
      }
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
