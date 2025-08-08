# User Management Solution Design

## 📋 Executive Summary

This document outlines the comprehensive User Management solution for the Salesfive AI Platform, designed to provide secure, scalable, and flexible user access control with project-based permissions, multi-factor authentication, and state-of-the-art security features.

## 🎯 Business Requirements

### Core Requirements
- **Multi-User Management**: Support for multiple users with different permission levels
- **Project-Based Access Control**: Users can be assigned to 0-n projects with specific profiles
- **Flexible Permission System**: Easy to add new permissions and configure via UI
- **Security Features**: Password reset, 2FA, profile management with images
- **Admin Interface**: Easy configuration of users and permissions through UI
- **Project Switching**: Users can switch between projects with complete state reload

### Security Requirements
- State-of-the-art security practices
- Multi-factor authentication (email + TOTP apps)
- Password reset functionality
- Profile management with image upload
- Audit trails for all user actions

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: React/TypeScript (existing BlueDevil structure)
- **Backend**: Node.js with Express/Fastify
- **Database**: PostgreSQL with row-level security
- **Authentication**: JWT + OAuth2
- **2FA**: TOTP (Time-based One-Time Password)
- **File Storage**: Local storage or cloud storage for profile images
- **Containerization**: Docker (following platform guidelines)

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/TS)    │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────►│   Auth Service  │◄────────────┘
                        │   (JWT/OAuth2)  │
                        └─────────────────┘
```

## 🔐 Authentication & Authorization

### Authentication Flow
1. **Login**: Username/Email + Password
2. **2FA Verification**: TOTP code or email verification
3. **JWT Token Generation**: With user claims and permissions
4. **Session Management**: Refresh tokens for extended sessions

### Authorization Model
```
User
├── Global Permissions (Admin, User, Guest)
├── Project Permissions (0-n projects)
│   ├── Project Role (Owner, Admin, Member, Viewer)
│   ├── Feature Permissions (Read, Write, Delete)
│   └── Data Access Level (All, Own, None)
└── Resource Permissions (Files, APIs, etc.)
```

### Permission Structure
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
  };
  globalRole: 'admin' | 'user' | 'guest';
  projectMemberships: ProjectMembership[];
  security: {
    passwordHash: string;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string;
    lastLogin?: Date;
    failedLoginAttempts: number;
  };
  settings: {
    language: string;
    timezone: string;
    notifications: NotificationSettings;
  };
  // Flexible Sub-Data Map für zukünftige Erweiterungen
  customData: {
    [key: string]: any; // Dynamische Daten für verschiedene Module/Features
  };
  // Versionierte Metadaten für Tracking von Änderungen
  metadata: {
    version: number;
    lastModified: Date;
    modifiedBy?: string;
    changeHistory: ChangeRecord[];
  };
}

interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  modifiedBy: string;
  reason?: string;
}

interface ProjectMembership {
  projectId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Permission[];
  joinedAt: Date;
}

interface Permission {
  resource: string; // 'projects', 'agents', 'workflows', etc.
  actions: string[]; // ['read', 'write', 'delete', 'execute']
  scope: 'all' | 'own' | 'none';
}
```

## 🗄️ Database Design

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  global_role VARCHAR(20) DEFAULT 'user',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(32),
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_login TIMESTAMP,
  -- Flexible Sub-Data für zukünftige Erweiterungen
  custom_data JSONB DEFAULT '{}',
  -- Versionierte Metadaten für Tracking
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

#### Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

#### Project Memberships Table
```sql
CREATE TABLE project_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);
```

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 API Design

### Custom Data Management Endpoints
```
GET    /api/users/:id/custom-data
PUT    /api/users/:id/custom-data
POST   /api/users/:id/custom-data/:key
DELETE /api/users/:id/custom-data/:key
GET    /api/users/:id/metadata
PUT    /api/users/:id/metadata
```

### Custom Data Service
```typescript
class CustomDataService {
  // Speichern von benutzerdefinierten Daten
  async setCustomData(userId: string, key: string, value: any): Promise<void> {
    const user = await db.users.findByPk(userId);
    const customData = user.customData || {};
    customData[key] = value;
    
    await db.users.update(
      { customData },
      { where: { id: userId } }
    );
    
    // Audit log
    await this.auditService.logAction({
      userId: userId,
      action: 'custom_data_updated',
      resourceType: 'user',
      resourceId: userId,
      details: { key, value }
    });
  }

  // Abrufen von benutzerdefinierten Daten
  async getCustomData(userId: string, key?: string): Promise<any> {
    const user = await db.users.findByPk(userId);
    const customData = user.customData || {};
    
    return key ? customData[key] : customData;
  }

  // Löschen von benutzerdefinierten Daten
  async deleteCustomData(userId: string, key: string): Promise<void> {
    const user = await db.users.findByPk(userId);
    const customData = user.customData || {};
    delete customData[key];
    
    await db.users.update(
      { customData },
      { where: { id: userId } }
    );
  }

  // Metadaten aktualisieren
  async updateMetadata(userId: string, metadata: any): Promise<void> {
    const user = await db.users.findByPk(userId);
    const currentMetadata = user.metadata || {};
    
    const updatedMetadata = {
      ...currentMetadata,
      ...metadata,
      version: (currentMetadata.version || 0) + 1,
      lastModified: new Date()
    };
    
    await db.users.update(
      { metadata: updatedMetadata },
      { where: { id: userId } }
    );
  }
}
```

### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/2fa/verify
POST /api/auth/2fa/setup
POST /api/auth/password/reset
POST /api/auth/password/change
```

### User Management Endpoints
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/:id/profile
PUT    /api/users/:id/profile
POST   /api/users/:id/avatar
GET    /api/users/:id/custom-data
PUT    /api/users/:id/custom-data
POST   /api/users/:id/custom-data/:key
DELETE /api/users/:id/custom-data/:key
GET    /api/users/:id/metadata
PUT    /api/users/:id/metadata
```

### Project Management Endpoints
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/members
POST   /api/projects/:id/members
PUT    /api/projects/:id/members/:userId
DELETE /api/projects/:id/members/:userId
```

### Permission Management Endpoints
```
GET    /api/permissions
GET    /api/permissions/roles
POST   /api/permissions/roles
PUT    /api/permissions/roles/:id
DELETE /api/permissions/roles/:id
```

## 🎨 Frontend Implementation

### User Management Components

#### UserList Component
```typescript
interface UserListProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string, isActive: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEditUser, onDeleteUser, onToggleUserStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Users</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table implementation */}
        </table>
      </div>
    </div>
  );
};
```

#### UserForm Component
```typescript
interface UserFormProps {
  user?: User;
  onSubmit: (userData: Partial<User>) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
    firstName: user?.profile?.firstName || '',
    lastName: user?.profile?.lastName || '',
    globalRole: user?.globalRole || 'user',
    isActive: user?.isActive ?? true
  });

  const [customData, setCustomData] = useState(user?.customData || {});

  const handleCustomDataChange = (key: string, value: any) => {
    setCustomData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Standard form fields */}
      <div className="space-y-4">
        {/* Existing form fields implementation */}
      </div>
      
      {/* Custom Data Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Data</h3>
        <CustomDataEditor 
          data={customData}
          onChange={handleCustomDataChange}
        />
      </div>
    </form>
  );
};
```

#### CustomDataEditor Component
```typescript
interface CustomDataEditorProps {
  data: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const CustomDataEditor: React.FC<CustomDataEditorProps> = ({ data, onChange }) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (newKey.trim()) {
      onChange(newKey.trim(), newValue);
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemove = (key: string) => {
    const newData = { ...data };
    delete newData[key];
    Object.keys(newData).forEach(k => onChange(k, newData[k]));
  };

  return (
    <div className="space-y-4">
      {/* Existing Custom Data */}
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">{key}:</span>
          <span className="text-sm text-gray-500">{JSON.stringify(value)}</span>
          <button
            type="button"
            onClick={() => handleRemove(key)}
            className="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      ))}
      
      {/* Add New Custom Data */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  );
};
```

#### ProjectMembership Component
```typescript
interface ProjectMembershipProps {
  project: Project;
  members: ProjectMembership[];
  onAddMember: (email: string, role: string) => void;
  onUpdateMemberRole: (userId: string, role: string) => void;
  onRemoveMember: (userId: string) => void;
}

const ProjectMembership: React.FC<ProjectMembershipProps> = ({ 
  project, 
  members, 
  onAddMember, 
  onUpdateMemberRole, 
  onRemoveMember 
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Implementation */}
    </div>
  );
};
```

### Permission System Components

#### PermissionMatrix Component
```typescript
interface PermissionMatrixProps {
  permissions: Permission[];
  roles: Role[];
  onUpdatePermissions: (roleId: string, permissions: Permission[]) => void;
}

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ 
  permissions, 
  roles, 
  onUpdatePermissions 
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Matrix implementation */}
    </div>
  );
};
```

## 🔒 Security Implementation

### Password Security
- **Hashing**: bcrypt with salt rounds of 12
- **Password Policy**: Minimum 8 characters, complexity requirements
- **Rate Limiting**: Max 5 failed attempts, 15-minute lockout
- **Password Reset**: Secure token-based reset via email

### Two-Factor Authentication
```typescript
// TOTP Implementation
import { authenticator } from 'otplib';

class TwoFactorService {
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  generateQRCode(email: string, secret: string): string {
    const otpauth = authenticator.keyuri(email, 'Salesfive AI Platform', secret);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  }

  verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }
}
```

### JWT Token Management
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  globalRole: string;
  projectPermissions: {
    [projectId: string]: {
      role: string;
      permissions: Permission[];
    };
  };
  iat: number;
  exp: number;
}

class TokenService {
  generateAccessToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      globalRole: user.globalRole,
      projectPermissions: this.buildProjectPermissions(user.projectMemberships),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET!);
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }
}
```

### Audit Logging
```typescript
class AuditService {
  async logAction(data: {
    userId: string;
    projectId?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await db.auditLogs.create({
      ...data,
      createdAt: new Date()
    });
  }
}
```

## 🚀 Implementation Phases

### Phase 1: Core User Management (Week 1-2)
- [ ] Database schema implementation
- [ ] Basic user CRUD operations
- [ ] Authentication system (login/logout)
- [ ] Password reset functionality
- [ ] Basic admin interface

### Phase 2: Project-Based Permissions (Week 3-4)
- [ ] Project creation and management
- [ ] User-project membership system
- [ ] Role-based access control
- [ ] Project switching functionality
- [ ] Permission matrix UI

### Phase 3: Security & 2FA (Week 5-6)
- [ ] Two-factor authentication implementation
- [ ] TOTP app integration
- [ ] Email-based 2FA
- [ ] Enhanced security features
- [ ] Session management

### Phase 4: Advanced Features (Week 7-8)
- [ ] Profile management with image upload
- [ ] Advanced permission system
- [ ] Audit logging implementation
- [ ] Admin dashboard enhancements
- [ ] User activity monitoring
- [ ] Custom data management UI
- [ ] Metadata tracking system
- [ ] Custom data validation and schemas

### Phase 5: Testing & Optimization (Week 9-10)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Deployment preparation

## 📊 Monitoring & Analytics

### Key Metrics
- **User Activity**: Login frequency, session duration
- **Security Events**: Failed login attempts, 2FA usage
- **Permission Usage**: Most/least used permissions
- **Project Engagement**: User participation per project

### Dashboard Components
```typescript
interface UserManagementDashboard {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersWith2FA: number;
  };
  securityMetrics: {
    failedLoginAttempts: number;
    passwordResets: number;
    suspiciousActivities: number;
  };
  projectMetrics: {
    totalProjects: number;
    activeProjects: number;
    averageUsersPerProject: number;
  };
}
```

## 🔧 Configuration Management

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/salesfive
DATABASE_SSL=true

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (for password reset and 2FA)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880 # 5MB

# Security
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000 # 15 minutes
```

### Feature Flags
```typescript
interface FeatureFlags {
  enable2FA: boolean;
  require2FA: boolean;
  enableAuditLogging: boolean;
  enableAdvancedPermissions: boolean;
  enableProjectSwitching: boolean;
}
```

## 🧪 Testing Strategy

### Unit Tests
- User service functions
- Authentication logic
- Permission checking
- Password hashing/verification
- 2FA token generation/verification

### Integration Tests
- API endpoint testing
- Database operations
- JWT token flow
- Project membership operations

### E2E Tests
- User registration flow
- Login/logout process
- Project creation and management
- Permission assignment
- 2FA setup and verification

## 📚 Documentation

### API Documentation
- OpenAPI/Swagger specification
- Endpoint descriptions
- Request/response examples
- Error codes and messages

### User Guides
- Admin user management guide
- User profile management
- 2FA setup instructions
- Project permission management

### Developer Documentation
- Database schema documentation
- Authentication flow diagrams
- Permission system architecture
- Security best practices

## 🚀 Deployment Considerations

### Production Checklist
- [ ] SSL/TLS encryption
- [ ] Database backups
- [ ] Environment variable security
- [ ] Rate limiting implementation
- [ ] Monitoring and alerting
- [ ] Log aggregation
- [ ] Security headers
- [ ] CORS configuration

### Scalability Considerations
- **Database**: Connection pooling, read replicas
- **Caching**: Redis for session storage (Decision: No redis for now)
- **CDN**: For profile images and static assets
- **Load Balancing**: Multiple application instances (Bruachen wir die wirklich? Wir sind ca. 200 User die gleichzeitig aufm System arbeiten.)
- **Monitoring**: Application performance monitoring (Unbedingt! Mach mal einfach nen Vorschlag.)

## 🔄 Future Enhancements

### Planned Features
- **SSO Integration**: SAML, OAuth2 providers
- **Advanced Roles**: Custom role creation
- **Bulk Operations**: Mass user import/export
- **Advanced Analytics**: User behavior analysis
- **Mobile App**: Native mobile authentication
- **API Keys**: For service-to-service authentication
- **Custom Data Schemas**: Validierung und Typisierung für customData
- **Custom Data Templates**: Vordefinierte Templates für häufige Anwendungsfälle
- **Custom Data Migration**: Tools für Datenmigration zwischen Versionen

### Technical Debt
- **Performance**: Database query optimization
- **Security**: Regular security audits
- **Code Quality**: Automated code reviews
- **Testing**: Increased test coverage
- **Documentation**: Keeping docs up-to-date

---

## 📋 Implementation Checklist

### Phase 1: Core Setup
- [ ] Set up database schema
- [ ] Implement user model and service
- [ ] Create authentication endpoints
- [ ] Build basic admin UI
- [ ] Implement password reset

### Phase 2: Project System
- [ ] Create project model and service
- [ ] Implement project membership system
- [ ] Build project management UI
- [ ] Add role-based permissions
- [ ] Implement project switching

### Phase 3: Security Features
- [ ] Implement 2FA with TOTP
- [ ] Add email-based 2FA
- [ ] Enhance security middleware
- [ ] Implement audit logging
- [ ] Add security monitoring

### Phase 4: Advanced Features
- [ ] Profile image upload
- [ ] Advanced permission matrix
- [ ] User activity dashboard
- [ ] Bulk user operations
- [ ] API documentation
- [ ] Custom data management interface
- [ ] Metadata tracking and versioning
- [ ] Custom data validation system

### Phase 5: Testing & Deployment
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production deployment
- [ ] Monitoring setup

---

*This solution design follows the Salesfive AI Platform's technical framework and security guidelines while providing a comprehensive, scalable user management system.*
