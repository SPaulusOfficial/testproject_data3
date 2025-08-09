# UserManagement Permission Implementation Guide 🔐

## 🎯 **Was du implementiert hast:**

### **1. Backend Permission Middleware**
```javascript
// permissionMiddleware.js
const { requirePermission, requireAnyPermission, requireAllPermissions } = require('./permissionMiddleware');

// UserManagement Endpoint mit Permission-Check
app.get('/api/users', authenticateToken, requirePermission('UserManagement'), async (req, res) => {
  // Nur User mit UserManagement Permission können alle User sehen
});
```

### **2. Frontend Permission Hook**
```typescript
// usePermissions.ts
const { canAccessUserManagement, hasPermission } = usePermissions();

// Permission-Check in Komponenten
if (canAccessUserManagement()) {
  // Zeige UserManagement Features
}
```

### **3. PermissionGuard Komponente**
```typescript
// PermissionGuard.tsx
<UserManagementGuard>
  <UserManagementPage />
</UserManagementGuard>
```

## 🔧 **Wie du einen User UserManagement Permission gibst:**

### **Option 1: Über Permission Sets (Empfohlen)**
```sql
-- User mit UserManagementAdministrator Permission Set
UPDATE users 
SET custom_data = jsonb_set(
  custom_data, 
  '{permissionSets}', 
  '["UserManagementAdministrator"]'::jsonb
) 
WHERE username = 'user1';
```

### **Option 2: Direkte Permission**
```sql
-- User mit direkter UserManagement Permission
UPDATE users 
SET custom_data = jsonb_set(
  custom_data, 
  '{permissions}', 
  '["UserManagement"]'::jsonb
) 
WHERE username = 'user1';
```

### **Option 3: Über Backend API**
```bash
# User mit UserManagement Permission erstellen
curl -X POST http://localhost:3002/api/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usermanager",
    "email": "usermanager@salesfive.com",
    "password": "password123",
    "firstName": "User",
    "lastName": "Manager",
    "globalRole": "user",
    "customData": {
      "permissionSets": ["UserManagementAdministrator"],
      "permissions": []
    }
  }'
```

## 📋 **Verfügbare Permission Sets:**

### **UserManagementAdministrator**
```ini
[UserManagementAdministrator]
UserManagement
UserProfile
UserRoles
UserPermissions
ProjectManagement
ProjectCreation
ProjectMembers
Notifications
NotificationSettings
AuditLogs
KnowledgeBase
WorkshopManagement
```

### **FullAdministrator**
```ini
[FullAdministrator]
UserManagement
UserProfile
UserRoles
UserPermissions
ProjectManagement
ProjectCreation
ProjectDeletion
ProjectMembers
SystemSettings
SystemConfiguration
SystemMonitoring
SystemLogs
Notifications
NotificationSettings
NotificationTemplates
AuditLogs
SecuritySettings
AccessControl
KnowledgeBase
WorkshopManagement
APIAccess
```

## 🧪 **Teste die Permission:**

### **1. User ohne Permission testen:**
```bash
# Login als normaler User
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"admin123"}'

# Versuche UserManagement API zu nutzen
curl -X GET http://localhost:3002/api/users \
  -H "Authorization: Bearer <user-token>"

# Expected: 403 Forbidden
{
  "error": "Access denied",
  "message": "Permission 'UserManagement' required",
  "user": "user1",
  "requiredPermission": "UserManagement"
}
```

### **2. User mit Permission testen:**
```bash
# Login als User mit UserManagement Permission
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"usermanager","password":"password123"}'

# Nutze UserManagement API
curl -X GET http://localhost:3002/api/users \
  -H "Authorization: Bearer <usermanager-token>"

# Expected: 200 OK mit User-Liste
```

## 🎯 **Frontend Integration:**

### **1. Sidebar zeigt UserManagement nur mit Permission:**
```typescript
// Sidebar.tsx
const { canAccessUserManagement } = usePermissions();

// User Management - only shown if user has permission
...(canAccessUserManagement ? [{
  label: 'User Management',
  icon: Users,
  path: '/user-management',
  type: 'link'
}] : []),
```

### **2. UserManagement Page mit PermissionGuard:**
```typescript
// UserManagement.tsx
return (
  <UserManagementGuard>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderContent()}
    </div>
  </UserManagementGuard>
);
```

### **3. Permission-Check in Komponenten:**
```typescript
// In beliebiger Komponente
const { hasPermission } = usePermissions();

if (hasPermission('UserManagement')) {
  return <UserManagementButton />;
} else {
  return <AccessDeniedMessage />;
}
```

## 🔍 **Debugging Permissions:**

### **1. Backend Logs:**
```bash
# Permission-Check Logs
tail -f logs/server.log | grep "Permission"

# Expected Output:
🔐 Checking permission: UserManagement for user: usermanager
✅ Permission granted via set: UserManagementAdministrator
```

### **2. Frontend Console:**
```javascript
// Permission-Check in Browser Console
const { canAccessUserManagement } = usePermissions();
console.log('Can access UserManagement:', canAccessUserManagement());
```

### **3. User Permissions anzeigen:**
```typescript
// In React Component
const { getUserPermissions } = usePermissions();
console.log('User permissions:', getUserPermissions());
```

## 🚀 **Nächste Schritte:**

### **1. Weitere Endpoints mit Permission-Check:**
```javascript
// Weitere UserManagement Endpoints
app.post('/api/users', authenticateToken, requirePermission('UserManagement'), ...);
app.put('/api/users/:id', authenticateToken, requirePermission('UserManagement'), ...);
app.delete('/api/users/:id', authenticateToken, requirePermission('UserManagement'), ...);
```

### **2. Projekt-spezifische Permissions:**
```javascript
// Projekt-spezifische UserManagement
app.get('/api/projects/:projectId/users', authenticateToken, requireProjectAccess, requirePermission('UserManagement'), ...);
```

### **3. Granulare Permissions:**
```javascript
// Spezifische UserManagement Actions
app.get('/api/users', authenticateToken, requirePermission('UserManagement'), ...);
app.post('/api/users', authenticateToken, requirePermission('UserManagement'), ...);
app.put('/api/users/:id', authenticateToken, requirePermission('UserManagement'), ...);
app.delete('/api/users/:id', authenticateToken, requirePermission('UserManagement'), ...);
```

**Das UserManagement Permission-System ist jetzt vollständig implementiert! 🎉**
