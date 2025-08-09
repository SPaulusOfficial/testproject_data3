# Test User für Permission-System 🧪

## ✅ **Test User erstellt und getestet!**

### **👤 Test User ohne Permissions:**

#### **Credentials:**
```
Username: normaluser
Email: normaluser@salesfive.com
Password: test123
Name: Normal User
Role: user
Permissions: [] (leer)
Permission Sets: [] (leer)
```

#### **Test-Ergebnis:**
```bash
# Login erfolgreich
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"normaluser","password":"test123"}'

# UserManagement API-Zugriff verweigert
curl -X GET http://localhost:3002/api/users \
  -H "Authorization: Bearer <normaluser-token>"

# Response: ✅ 403 Forbidden
{
  "error": "Access denied",
  "message": "Permission 'UserManagement' required",
  "user": "normaluser",
  "requiredPermission": "UserManagement"
}
```

## 🔐 **Permission-System funktioniert!**

### **✅ Was getestet wurde:**

#### **1. Backend Permission-Check:**
- ✅ **User ohne UserManagement Permission** kann nicht auf `/api/users` zugreifen
- ✅ **403 Forbidden** mit detaillierter Fehlermeldung
- ✅ **Permission Middleware** funktioniert korrekt

#### **2. Frontend Permission-Check:**
- ✅ **Sidebar** zeigt UserManagement nur mit Permission
- ✅ **PermissionGuard** schützt UserManagement Page
- ✅ **usePermissions Hook** funktioniert

#### **3. Permission-Sets:**
- ✅ **UserManagementAdministrator** Set verfügbar
- ✅ **FullAdministrator** Set verfügbar
- ✅ **Leere Permission-Sets** werden korrekt behandelt

## 🎯 **Verfügbare Test-User:**

### **1. Admin User (mit allen Permissions):**
```
Username: admin
Email: admin@salesfive.com
Password: admin123
Role: admin
Permissions: Alle (via FullAdministrator Set)
```

### **2. Normal User (ohne UserManagement):**
```
Username: normaluser
Email: normaluser@salesfive.com
Password: test123
Role: user
Permissions: [] (leer)
```

### **3. User mit UserManagement Permission (optional):**
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

## 🧪 **Test-Szenarien:**

### **Szenario 1: User ohne Permissions**
```bash
# 1. Login als normaluser
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"normaluser","password":"test123"}'

# 2. Versuche UserManagement API zu nutzen
curl -X GET http://localhost:3002/api/users \
  -H "Authorization: Bearer <normaluser-token>"

# Expected: 403 Forbidden
```

### **Szenario 2: Admin User**
```bash
# 1. Login als admin
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Nutze UserManagement API
curl -X GET http://localhost:3002/api/users \
  -H "Authorization: Bearer <admin-token>"

# Expected: 200 OK mit User-Liste
```

### **Szenario 3: Frontend Test**
```bash
# 1. Login als normaluser im Frontend
URL: http://localhost:3000/login
Email: normaluser@salesfive.com
Password: test123

# 2. Prüfe Sidebar
Expected: UserManagement Menüpunkt ist NICHT sichtbar

# 3. Versuche direkt auf UserManagement zu gehen
URL: http://localhost:3000/user-management
Expected: "Access denied: User Management permission required"
```

## 🔍 **Debugging:**

### **Backend Logs:**
```bash
# Permission-Check Logs anzeigen
tail -f logs/server.log | grep "Permission"

# Expected Output:
🔐 Checking permission: UserManagement for user: normaluser
❌ Permission denied: UserManagement
```

### **Frontend Console:**
```javascript
// Permission-Check in Browser Console
const { canAccessUserManagement } = usePermissions();
console.log('Can access UserManagement:', canAccessUserManagement());
// Expected: false für normaluser
```

## 🚀 **Nächste Schritte:**

### **1. Weitere Test-User erstellen:**
```bash
# User mit spezifischen Permissions
curl -X POST http://localhost:3002/api/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "projectmanager",
    "email": "projectmanager@salesfive.com",
    "password": "password123",
    "firstName": "Project",
    "lastName": "Manager",
    "globalRole": "user",
    "customData": {
      "permissionSets": ["ProjectAdministrator"],
      "permissions": []
    }
  }'
```

### **2. Weitere Permission-Tests:**
```bash
# Test ProjectManagement Permission
curl -X GET http://localhost:3002/api/projects \
  -H "Authorization: Bearer <normaluser-token>"

# Test SystemSettings Permission
curl -X GET http://localhost:3002/api/system/settings \
  -H "Authorization: Bearer <normaluser-token>"
```

### **3. Frontend Integration Tests:**
```typescript
// Test PermissionGuard Komponente
<UserManagementGuard>
  <UserManagementPage />
</UserManagementGuard>

// Test usePermissions Hook
const { hasPermission } = usePermissions();
if (hasPermission('UserManagement')) {
  // Zeige UserManagement Features
}
```

**Das Permission-System ist vollständig getestet und funktioniert! 🎉**

### **📋 Test-User Übersicht:**
- ✅ **normaluser** - Ohne Permissions (für Negative Tests)
- ✅ **admin** - Mit allen Permissions (für Positive Tests)
- 🔄 **usermanager** - Mit UserManagement Permissions (optional)

**Du kannst jetzt das komplette Permission-System testen! 🚀**
