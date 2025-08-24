// Default Email Templates
const defaultTemplates = [
  {
    process_name: 'password_reset',
    subject: 'Password Reset Request - Salesfive Platform',
    html_content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
        <h1>Salesfive Platform</h1>
        <h2>Password Reset Request</h2>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hello {{{USER_NAME}}},</p>
        
        <p>We received a request to reset your password for your Salesfive Platform account.</p>
        
        <p>If you didn't request this password reset, please ignore this email.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{{RESET_URL}}}" 
             style="background: #0025D1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This link will expire in {{{EXPIRY_HOURS}}} hours</li>
          <li>You can only use this link once</li>
          <li>If the link doesn't work, copy and paste this URL into your browser:</li>
        </ul>
        
        <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px;">
          {{{RESET_URL}}}
        </p>
        
        <p>Best regards,<br>Salesfive Platform Team</p>
      </div>
      
      <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>`,
    text_content: `Password Reset Request - Salesfive Platform

Hello {{{USER_NAME}}},

We received a request to reset your password for your Salesfive Platform account.

If you didn't request this password reset, please ignore this email.

To reset your password, click the following link:
{{{RESET_URL}}}

Important:
- This link will expire in {{{EXPIRY_HOURS}}} hours
- You can only use this link once

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.`,
    description: 'Default template for password reset emails'
  },
  {
    process_name: 'registration_notification',
    subject: 'Welcome to Salesfive Platform - Your Account Has Been Created',
    html_content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
        <h1>Salesfive Platform</h1>
        <h2>Welcome!</h2>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hello {{{USER_NAME}}},</p>
        
        <p>Welcome to the Salesfive Platform! Your account has been created successfully.</p>
        
        <p><strong>Your login credentials:</strong></p>
        <ul>
          <li><strong>Email:</strong> {{{USER_EMAIL}}}</li>
          <li><strong>Username:</strong> {{{USERNAME}}}</li>
          <li><strong>Temporary Password:</strong> {{{TEMP_PASSWORD}}}</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{{LOGIN_URL}}}" 
             style="background: #0025D1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Platform
          </a>
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
    </div>`,
    text_content: `Welcome to Salesfive Platform - Your Account Has Been Created

Hello {{{USER_NAME}}},

Welcome to the Salesfive Platform! Your account has been created successfully.

Your login credentials:
- Email: {{{USER_EMAIL}}}
- Username: {{{USERNAME}}}
- Temporary Password: {{{TEMP_PASSWORD}}}

To access the platform, visit: {{{LOGIN_URL}}}

Important:
- Please change your password immediately after your first login
- This temporary password is only valid for your first login
- You can change your password in your profile settings

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.`,
    description: 'Default template for new user registration notifications'
  },
  {
    process_name: 'two_factor_auth',
    subject: 'Two-Factor Authentication Code - Salesfive Platform',
    html_content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
        <h1>Salesfive Platform</h1>
        <h2>Two-Factor Authentication</h2>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hello {{{USER_NAME}}},</p>
        
        <p>You have requested a two-factor authentication code for your Salesfive Platform account.</p>
        
        <p><strong>Your authentication code is:</strong></p>
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; font-family: monospace; font-size: 24px; margin: 20px 0; letter-spacing: 3px;">
          {{{AUTH_CODE}}}
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This code will expire in {{{EXPIRY_MINUTES}}} minutes</li>
          <li>If you didn't request this code, please ignore this email</li>
          <li>Never share this code with anyone</li>
        </ul>
        
        <p>Best regards,<br>Salesfive Platform Team</p>
      </div>
      
      <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>`,
    text_content: `Two-Factor Authentication Code - Salesfive Platform

Hello {{{USER_NAME}}},

You have requested a two-factor authentication code for your Salesfive Platform account.

Your authentication code is: {{{AUTH_CODE}}}

Important:
- This code will expire in {{{EXPIRY_MINUTES}}} minutes
- If you didn't request this code, please ignore this email
- Never share this code with anyone

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.`,
    description: 'Default template for two-factor authentication emails'
  },
  {
    process_name: 'admin_password_set',
    subject: 'Your Account Has Been Created - Salesfive Platform',
    html_content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0025D1; color: white; padding: 20px; text-align: center;">
        <h1>Salesfive Platform</h1>
        <h2>Account Created</h2>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Hello {{{USER_NAME}}},</p>
        
        <p>Your account has been created on the Salesfive Platform by an administrator.</p>
        
        <p><strong>Your login credentials:</strong></p>
        <ul>
          <li><strong>Email:</strong> {{{USER_EMAIL}}}</li>
          <li><strong>Username:</strong> {{{USERNAME}}}</li>
          <li><strong>Temporary Password:</strong> {{{TEMP_PASSWORD}}}</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{{LOGIN_URL}}}" 
             style="background: #0025D1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Platform
          </a>
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
    </div>`,
    text_content: `Your Account Has Been Created - Salesfive Platform

Hello {{{USER_NAME}}},

Your account has been created on the Salesfive Platform by an administrator.

Your login credentials:
- Email: {{{USER_EMAIL}}}
- Username: {{{USERNAME}}}
- Temporary Password: {{{TEMP_PASSWORD}}}

To access the platform, visit: {{{LOGIN_URL}}}

Important:
- Please change your password immediately after your first login
- This temporary password is only valid for your first login
- You can change your password in your profile settings

Best regards,
Salesfive Platform Team

This is an automated message. Please do not reply to this email.`,
    description: 'Default template for admin password set emails'
  }
];

module.exports = defaultTemplates;
