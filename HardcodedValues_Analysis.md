# Hardcoded Values Analysis - Salesfive AI Platform

## Executive Summary

This document provides a comprehensive analysis of all hardcoded values found in the Salesfive AI Platform codebase. The analysis covers both frontend (React/TypeScript) and backend (Node.js) code, excluding test files, documentation, and build artifacts.

**Total Hardcoded Values Found:** 150+ instances across multiple categories

## 🔴 Critical Security Issues

### JWT Secrets (HIGH PRIORITY)
- **Location:** `backend/auth.js:4`
- **Value:** `'your-super-secret-jwt-key-change-in-production'`
- **Risk:** Production security vulnerability
- **Action:** Move to environment variable `JWT_SECRET`

- **Location:** `backend/server.js:420`, `backend/knowledgeEndpoints.js:34`, `backend/universalKnowledgeEndpoints.js:34`, `backend/userService.js:134`
- **Value:** `'your-secret-key'`
- **Risk:** Production security vulnerability
- **Action:** Move to environment variable `JWT_SECRET`

### Database Credentials (HIGH PRIORITY)
- **Location:** `package.json:18`
- **Values:** 
  - `VITE_DB_USER=cas_user`
  - `VITE_DB_PASSWORD=secure_password`
  - `VITE_DB_NAME=platform_db`
- **Risk:** Credentials exposed in source code
- **Action:** Move to environment variables

- **Location:** `backend/mcpServer.js:22`
- **Value:** `'postgresql://postgres:password@localhost:5432/salesfive_ai_platform'`
- **Risk:** Database credentials in source code
- **Action:** Move to environment variable `DATABASE_URL`

## 🟡 Network & API Configuration

### Localhost URLs (MEDIUM PRIORITY)
**Frontend API Base URLs:**
- Multiple files use `'http://localhost:3002/api'` as fallback
- **Files affected:** 25+ components and services
- **Action:** Standardize to single environment variable `VITE_API_URL`

**Backend Ports:**
- `backend/server.js:207`: `PORT = 3002`
- `vite.config.ts:14`: `port: 3000`
- `backend/n8nProxy.js:16`: `N8N_BASE_URL = 'http://localhost:5678'`

**Database Ports:**
- `backend/server.js:213`: `5432` (PostgreSQL default)
- `backend/init-knowledge-table.js:7`: `5434`
- `backend/server-old.js:79`: `5434`

### External Service URLs (MEDIUM PRIORITY)
- **Location:** `src/config/n8nChat.ts:27`
- **Value:** `'https://your-n8n-instance.com'`
- **Action:** Move to environment variable `N8N_BASE_URL`

- **Location:** `src/pages/solution/ProcessMiningDemo.tsx:189`
- **Value:** `'http://localhost:5678/webhook-test/bc706961-5b3a-4634-9e5b-bd67800126e8'`
- **Action:** Move to environment variable `N8N_WEBHOOK_URL`

## 🟠 Timeout & Performance Values

### Timeout Constants (LOW PRIORITY)
- **Location:** `backend/server.js:176`
- **Value:** `30000` (30 seconds)
- **Action:** Move to environment variable `HEALTH_CHECK_INTERVAL`

- **Location:** `src/components/SystemStatusDropdown.tsx:50`
- **Value:** `30000` (30 seconds)
- **Action:** Move to environment variable `STATUS_REFRESH_INTERVAL`

- **Location:** `src/components/VersionedTextEditor/VersionedTextEditor.tsx:97`
- **Value:** `30000` (30 seconds)
- **Action:** Move to environment variable `AUTO_SAVE_INTERVAL`

### JWT Expiration (MEDIUM PRIORITY)
- **Location:** `backend/auth.js:5`
- **Value:** `'7d'` (7 days)
- **Action:** Move to environment variable `JWT_EXPIRES_IN`

- **Location:** `backend/userService.js:134`
- **Value:** `'24h'` (24 hours)
- **Action:** Move to environment variable `JWT_EXPIRES_IN`

## 🟢 File & Storage Limits

### Avatar Storage Limits (LOW PRIORITY)
- **Location:** `backend/avatarService.js:8-10`
- **Values:**
  - `MAX_DATABASE_SIZE: 100 * 1024` (100KB)
  - `MAX_FILE_SIZE: 5 * 1024 * 1024` (5MB)
  - `MAX_EXTERNAL_SIZE: 500 * 1024` (500KB)
- **Action:** Move to environment variables

### Image Processing (LOW PRIORITY)
- **Location:** `src/components/AvatarUpload.tsx:38`
- **Value:** `5 * 1024 * 1024` (5MB)
- **Action:** Move to environment variable `MAX_AVATAR_SIZE`

## 🔵 UI & Design Constants

### Layout Dimensions (LOW PRIORITY)
- **Location:** `tailwind.config.js:30-34`
- **Values:**
  - `'sidebar': '260px'`
  - `'main': '1440px'`
- **Action:** Move to CSS custom properties or theme configuration

### Typography (LOW PRIORITY)
- **Location:** `tailwind.config.js:24-25`
- **Values:**
  - `'h2': ['32px', ...]`
  - `'h3': ['24px', ...]`
- **Action:** Move to design system configuration

## 🟣 Password Generation

### Character Sets (LOW PRIORITY)
- **Location:** `backend/passwordService.js:173-179`
- **Values:**
  - `'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'`
  - `'ABCDEFGHIJKLMNOPQRSTUVWXYZ'`
  - `'abcdefghijklmnopqrstuvwxyz'`
  - `'0123456789'`
- **Action:** Move to configuration constants

## 🟤 Development & Testing

### API Keys (MEDIUM PRIORITY)
- **Location:** `src/config/n8nChat.ts:26`
- **Value:** `'dev-api-key'`
- **Action:** Move to environment variable `N8N_API_KEY`

### Database Names (LOW PRIORITY)
- **Location:** Multiple backend files
- **Value:** `'platform_db'`
- **Action:** Move to environment variable `DB_NAME`

## 📋 Recommended Action Plan

### Phase 1: Critical Security (Immediate)
1. **JWT Secrets**
   - Create environment variable `JWT_SECRET`
   - Update all JWT signing/verification code
   - Generate secure random secret for production

2. **Database Credentials**
   - Move all database credentials to environment variables
   - Update connection strings
   - Remove credentials from package.json

### Phase 2: Network Configuration (High Priority)
1. **API Base URLs**
   - Create `VITE_API_URL` environment variable
   - Standardize all frontend API calls
   - Update backend CORS configuration

2. **Service URLs**
   - Externalize n8n and other service URLs
   - Create environment-specific configurations

### Phase 3: Performance & Limits (Medium Priority)
1. **Timeout Values**
   - Create environment variables for all timeout constants
   - Document recommended values for different environments

2. **File Size Limits**
   - Externalize avatar and file upload limits
   - Make limits configurable per environment

### Phase 4: UI & Design (Low Priority)
1. **Layout Constants**
   - Move to CSS custom properties
   - Create design system configuration

2. **Typography**
   - Externalize font sizes and weights
   - Create theme configuration system

## 🔧 Implementation Strategy

### Environment Variables Structure
```bash
# Security
JWT_SECRET=your-secure-random-secret
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=platform_db
DB_USER=your_user
DB_PASSWORD=your_password

# API Configuration
VITE_API_URL=http://localhost:3002/api
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key

# Performance
HEALTH_CHECK_INTERVAL=30000
STATUS_REFRESH_INTERVAL=30000
AUTO_SAVE_INTERVAL=30000

# File Limits
MAX_AVATAR_SIZE=5242880
MAX_DATABASE_SIZE=102400
MAX_EXTERNAL_SIZE=512000

# Development
NODE_ENV=development
```

### Configuration Validation
- Implement configuration validation on startup
- Provide clear error messages for missing required variables
- Create configuration documentation

### Migration Guide
- Document step-by-step migration process
- Provide example .env files
- Create configuration validation script

## 📊 Impact Assessment

### Security Impact
- **Critical:** JWT secrets and database credentials
- **High:** API keys and service URLs
- **Medium:** Network configuration

### Maintenance Impact
- **High:** Reduced configuration drift
- **Medium:** Easier environment management
- **Low:** Improved deployment flexibility

### Performance Impact
- **Low:** Minimal runtime overhead
- **Medium:** Configurable performance tuning
- **High:** Environment-specific optimizations

## 🎯 Success Metrics

1. **Zero hardcoded secrets** in production code
2. **100% environment variable usage** for configuration
3. **Single source of truth** for all configuration values
4. **Automated validation** of required environment variables
5. **Comprehensive documentation** for all configuration options

---

**Next Steps:**
1. Prioritize Phase 1 (Critical Security) for immediate implementation
2. Create environment variable templates
3. Implement configuration validation
4. Update deployment documentation
5. Create migration scripts for existing deployments
