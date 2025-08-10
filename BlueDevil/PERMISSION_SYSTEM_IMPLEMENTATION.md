# 🔐 Permission Management System Implementation

## 📋 Overview

Das neue Permission-Management-System basiert vollständig auf der Datenbank und bietet eine zentrale, konsistente Verwaltung von Benutzerberechtigungen. Sowohl Frontend als auch Backend greifen über dieselben Backend-Funktionen auf die Datenbank zu.

## 🗄️ Database Schema

### Neue Tabellen

#### `user_permissions`
```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(user_id, permission_id)
);
```

#### `user_permission_sets`
```sql
CREATE TABLE user_permission_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_set_id VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(user_id, permission_set_id)
);
```

### Views

#### `user_effective_permissions`
```sql
CREATE VIEW user_effective_permissions AS
SELECT 
  u.id as user_id,
  u.username,
  u.email,
  u.global_role,
  array_agg(DISTINCT up.permission_id) FILTER (WHERE up.permission_id IS NOT NULL) as direct_permissions,
  array_agg(DISTINCT ups.permission_set_id) FILTER (WHERE ups.permission_set_id IS NOT NULL) as permission_sets
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id AND up.is_active = true
LEFT JOIN user_permission_sets ups ON u.id = ups.user_id AND ups.is_active = true
GROUP BY u.id, u.username, u.email, u.global_role;
```

## 🔧 Backend Implementation

### PermissionService (permissionService.js)

#### Zentrale Datenbank-Funktionen

```javascript
// Get user permissions from database (CENTRAL FUNCTION)
async getUserPermissionsFromDatabase(userId, pool)

// Check if user has specific permission (CENTRAL FUNCTION)
async checkUserPermission(userId, requiredPermission, pool)

// Update user permissions in database (CENTRAL FUNCTION)
async updateUserPermissions(userId, permissions, permissionSets, grantedBy, pool)

// Get all users with their permissions (for admin interface)
async getAllUsersWithPermissions(pool)

// Get available permissions and permission sets (for admin interface)
async getAvailablePermissionsAndSets()

// Validate permissions before saving
validatePermissionsForSave(permissions, permissionSets)
```

### API Endpoints

#### Permission Check
```javascript
POST /api/permissions/check
{
  "permission": "UserManagement"
}
```

#### Get User Permissions
```javascript
GET /api/users/:userId/permissions
```

#### Update User Permissions
```javascript
PUT /api/users/:userId/permissions
{
  "permissions": ["UserManagement", "ProjectManagement"],
  "permissionSets": ["UserManagementAdministrator"]
}
```

#### Admin Endpoints
```javascript
GET /api/admin/users/permissions
GET /api/admin/permissions/available
```

## 🎨 Frontend Implementation

### UserPermissionManager Component

```typescript
// Vollständige Permission-Verwaltung mit:
- Benutzerliste mit aktuellen Permissions
- Modal für Permission-Bearbeitung
- Kategorisierte Permission-Anzeige
- Permission-Set-Verwaltung
- Echtzeit-Validierung
- Transaction-basierte Updates
```

### Features

1. **Benutzerliste**: Zeigt alle Benutzer mit ihren aktuellen Permissions
2. **Permission-Editor**: Modal für detaillierte Permission-Bearbeitung
3. **Kategorisierung**: Permissions sind nach Kategorien gruppiert
4. **Permission-Sets**: Verwaltung von vordefinierten Permission-Paketen
5. **Validierung**: Echtzeit-Validierung vor dem Speichern
6. **Audit-Trail**: Tracking von Permission-Änderungen

## 🔐 Permission Flow

### 1. Permission Check
```javascript
// Frontend
const hasPermission = usePermissions().hasPermission('UserManagement');

// Backend
const hasPermission = await permissionService.checkUserPermission(userId, 'UserManagement', pool);
```

### 2. Permission Update
```javascript
// Frontend -> Backend
PUT /api/users/:userId/permissions
{
  "permissions": ["UserManagement"],
  "permissionSets": ["UserManagementAdministrator"]
}

// Backend -> Database
await permissionService.updateUserPermissions(userId, permissions, permissionSets, grantedBy, pool);
```

### 3. Effective Permissions
```javascript
// Berechnung der effektiven Permissions
const effectivePermissions = permissionService.getEffectivePermissions(
  directPermissions, 
  permissionSets
);
```

## 🛡️ Security Features

### Permission Validation
- Alle Permissions werden vor dem Speichern validiert
- Nur gültige Permission-IDs werden akzeptiert
- Permission-Sets werden gegen definierte Sets validiert

### Access Control
- Nur Benutzer mit `UserManagement` Permission können das System nutzen
- Benutzer können nur ihre eigenen Permissions einsehen (außer Admins)
- Alle API-Calls werden authentifiziert und autorisiert

### Transaction Safety
- Permission-Updates erfolgen in Transaktionen
- Rollback bei Fehlern
- Konsistente Datenbank-Updates

## 📊 Permission Categories

### System Administration
- `SystemSettings`
- `SystemConfiguration`
- `SystemMonitoring`
- `SystemLogs`

### User Management
- `UserManagement`
- `UserProfile`
- `UserRoles`
- `UserPermissions`

### Project Management
- `ProjectManagement`
- `ProjectCreation`
- `ProjectDeletion`
- `ProjectMembers`

### AI Features
- `AIAgents`
- `AIWorkflows`
- `AIAnalytics`
- `AITraining`

### Data Management
- `DataModeling`
- `DataImport`
- `DataExport`
- `DataValidation`

## 🔄 Permission Sets

### FullAdministrator
Vollständiger Systemzugriff inklusive User Management, Project Management und System Settings

### UserManagementAdministrator
Kann Benutzer verwalten, aber keine System-Einstellungen ändern

### ProjectAdministrator
Kann Projekte und deren Daten verwalten

### AISpecialist
Zugriff auf AI-Features und Datenverwaltung

### DataAnalyst
Zugriff auf Daten- und Reporting-Features

## 🚀 Usage Examples

### Permission Check in Component
```typescript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission('UserManagement')) {
    return <div>Access Denied</div>;
  }
  
  return <div>User Management Content</div>;
};
```

### Permission Guard
```typescript
import { PermissionGuard } from '../components/PermissionGuard';

<PermissionGuard permission="UserManagement">
  <UserManagementComponent />
</PermissionGuard>
```

### Update User Permissions
```typescript
const updatePermissions = async (userId: string, permissions: string[]) => {
  const response = await fetch(`/api/users/${userId}/permissions`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ permissions, permissionSets: [] })
  });
  
  if (response.ok) {
    // Permissions updated successfully
  }
};
```

## 🔍 Debugging

### Backend Logging
```javascript
console.log(`🔐 Checking permission '${permission}' for user ${userId}`);
console.log(`✅ Permission check result: ${hasPermission}`);
console.log(`🔐 Updating permissions for user ${userId}`);
```

### Frontend Debugging
```typescript
// In usePermissions hook
console.log('Current permissions:', permissions);
console.log('Permission check:', hasPermission('UserManagement'));
```

## 📈 Performance

### Database Indexes
- `idx_user_permissions_user_id`
- `idx_user_permissions_permission_id`
- `idx_user_permission_sets_user_id`
- `idx_user_permission_sets_set_id`

### Caching
- Permissions werden im Frontend gecacht
- Automatische Aktualisierung bei Änderungen
- Event-basierte Cache-Invalidierung

## 🔄 Migration

### Von Custom Data zu Dedicated Tables
```sql
-- Migration script (to be implemented)
INSERT INTO user_permissions (user_id, permission_id, granted_by, granted_at)
SELECT 
  id as user_id,
  jsonb_array_elements_text(custom_data->'permissions') as permission_id,
  id as granted_by,
  NOW() as granted_at
FROM users 
WHERE custom_data->'permissions' IS NOT NULL;
```

## 🎯 Next Steps

1. **Testing**: Umfassende Tests des neuen Systems
2. **Migration**: Migration bestehender Custom Data Permissions
3. **Audit Logging**: Erweiterte Audit-Funktionalität
4. **Analytics**: Permission-Nutzungsstatistiken
5. **Workflows**: Permission-Genehmigungsprozesse

## ✅ Benefits

- **Konsistenz**: Einheitliche Permission-Verwaltung
- **Sicherheit**: Validierung und Access Control
- **Skalierbarkeit**: Dedicated Database Tables
- **Audit**: Vollständige Änderungsverfolgung
- **Performance**: Optimierte Datenbankabfragen
- **Flexibilität**: Erweiterbare Permission-Struktur
