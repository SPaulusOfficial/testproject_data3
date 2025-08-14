# Password Management System

## Overview

The Salesfive Platform includes a comprehensive password management system with multiple features for secure user authentication and password management.

## Features

### 1. Domain Whitelist System
- **File**: `backend/domain-whitelist.def`
- **Purpose**: Restricts password reset functionality to company email domains only
- **Security**: Prevents unauthorized password resets from external email addresses

### 2. Email-Based Password Reset (User-Initiated)
- **Endpoint**: `POST /api/auth/request-password-reset`
- **Process**:
  1. User enters email address
  2. System validates email domain against whitelist
  3. Generates secure reset token (32-byte hex)
  4. Sends email with reset link (1-hour expiration)
  5. User clicks link and sets new password

### 3. Admin Password Set
- **Endpoint**: `POST /api/admin/users/:id/set-password`
- **Features**:
  - Generate secure temporary passwords
  - Option to send email or display password manually
  - Automatic password hashing with bcrypt
  - Permission-based access control

### 4. Profile Password Change
- **Endpoint**: `POST /api/auth/change-password`
- **Features**:
  - Users can change their own passwords
  - Current password verification required
  - Password strength validation
  - Secure password hashing

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Token Security
- 32-byte random hex tokens
- 1-hour expiration
- Single-use tokens
- Automatic cleanup of expired tokens

### Domain Validation
- Whitelist-based email domain validation
- Prevents password resets for unauthorized domains
- Configurable domain list

## API Endpoints

### Password Reset Request
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "user@company.com"
}
```

### Password Reset with Token
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewSecurePassword123!"
}
```

### Admin Set Password
```http
POST /api/admin/users/:id/set-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "sendEmail": true
}
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

### Validate Reset Token
```http
GET /api/auth/validate-reset-token/:token
```

### Get Password Requirements
```http
GET /api/auth/password-requirements
```

## Frontend Components

### PasswordResetRequest
- Clean, professional UI for requesting password reset
- Domain validation feedback
- Security notice about company email requirement

### PasswordReset
- Token validation on page load
- Password strength requirements display
- Confirmation password field
- Success/error messaging

### AdminPasswordSet
- Modal dialog for admin password setting
- Option to send email or display password
- Temporary password display with show/hide toggle
- User information display

### ProfilePasswordChange
- Integrated into user profile page
- Current password verification
- Password strength validation
- Success/error feedback

## Configuration

### Domain Whitelist
Edit `backend/domain-whitelist.def`:
```
# Add your company domains
yourcompany.com
yourcompany.de
yourcompany.eu

# Development domains (remove in production)
localhost
test.com
```

### Password Requirements
Modify in `backend/passwordService.js`:
```javascript
validatePasswordStrength(password) {
  const minLength = 8; // Change minimum length
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  // ...
}
```

### Token Expiration
Modify in `backend/passwordService.js`:
```javascript
storeResetToken(email, token) {
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour - change as needed
  // ...
}
```

## Email Integration

### Current Implementation
- Email content generation with HTML and text versions
- Professional email templates with company branding
- Token logging for development (remove in production)

### Production Email Setup
Replace the TODO comments in `passwordService.js`:
```javascript
// Replace this:
console.log(`📧 Password reset email would be sent to: ${email}`);

// With actual email service:
await emailService.sendEmail(email, emailContent.subject, emailContent.html, emailContent.text);
```

## Usage Examples

### User Requests Password Reset
1. User clicks "Passwort zurücksetzen" on login page
2. Enters company email address
3. Receives email with reset link
4. Clicks link and sets new password

### Admin Sets User Password
1. Admin navigates to User Management
2. Clicks "Set Password" for specific user
3. Chooses to send email or display password
4. User receives temporary password
5. User changes password on first login

### User Changes Own Password
1. User navigates to Profile page
2. Scrolls to "Change Password" section
3. Enters current password
4. Sets new password meeting requirements
5. Confirms new password

## Security Considerations

### Production Deployment
1. **Email Service**: Implement actual email sending service
2. **HTTPS**: Ensure all endpoints use HTTPS
3. **Rate Limiting**: Add rate limiting for password reset requests
4. **Logging**: Implement secure logging for password operations
5. **Monitoring**: Monitor for suspicious password reset patterns

### Token Storage
- Current implementation uses in-memory storage
- For production, consider Redis or database storage
- Implement token cleanup jobs

### Password History
- Consider implementing password history to prevent reuse
- Add minimum password age requirements

## Troubleshooting

### Common Issues

1. **Email not received**
   - Check domain whitelist configuration
   - Verify email service is configured
   - Check server logs for email errors

2. **Token validation fails**
   - Check token expiration (1 hour default)
   - Verify token format (32-byte hex)
   - Check if token was already used

3. **Password validation fails**
   - Ensure password meets all requirements
   - Check for special character requirements
   - Verify minimum length (8 characters)

### Debug Mode
Enable debug logging in `passwordService.js`:
```javascript
console.log('🔍 Password validation:', passwordValidation);
console.log('🔍 Token validation:', tokenValidation);
```

## Future Enhancements

1. **Two-Factor Authentication**: Add 2FA for password changes
2. **Password History**: Prevent password reuse
3. **Account Lockout**: Lock accounts after failed attempts
4. **Password Expiration**: Force password changes periodically
5. **SSO Integration**: Support for single sign-on
6. **Audit Trail**: Comprehensive logging of password operations
