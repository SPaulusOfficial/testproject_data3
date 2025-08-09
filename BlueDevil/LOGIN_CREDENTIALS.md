# Login Credentials - Dokumentation

## 🔐 **Verfügbare Test-Accounts**

### **Admin Account**
```
Username: admin
Email: admin@salesfive.com
Password: admin123
Global Role: admin
```

### **Test User Account**
```
Username: stefan.paulus@salesfive.com
Email: stefan.paulus@salesfive.com
Password: admin123
Global Role: admin
```

## 🧪 **Login Tests**

### **1. Backend Login Test**
```bash
# Test mit Username
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test mit Email
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@salesfive.com","password":"admin123"}'
```

### **2. Frontend Login Test**
```
URL: http://localhost:3000/login
Email: admin@salesfive.com
Password: admin123
```

## 🔧 **Technische Details**

### **Backend Login Endpoint**
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### **Response Format**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "439ca6e3-fdfc-4590-88b7-26761a914af2",
    "username": "admin",
    "email": "admin@salesfive.com",
    "firstName": "Stefan",
    "lastName": "Paulus",
    "globalRole": "admin",
    "customData": {
      "permissions": [],
      "permissionSets": ["FullAdministrator", "UserManagementAdministrator", "ProjectAdministrator"]
    },
    "metadata": {}
  }
}
```

## 🚨 **Bekannte Probleme**

### **1. Frontend Login Error**
```
AuthService.ts:34 Login error: Error: Invalid credentials
```

**Ursache:** Frontend verwendet `email` Feld, Backend erwartet `username` Feld

**Lösung:** AuthService wurde angepasst, um `emailOrUsername` als `username` zu senden

### **2. NavigationTracker Infinite Loop**
```
SessionContext.tsx:180 Warning: Maximum update depth exceeded
```

**Ursache:** `updateLastActivity` wurde bei jedem Render aufgerufen

**Lösung:** Activity Updates sind jetzt auf Mount beschränkt und verwenden Intervals

## ✅ **Funktionierende Credentials**

### **Für Frontend Login:**
```
Email: admin@salesfive.com
Password: admin123
```

### **Für Backend API Tests:**
```bash
# Username Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Email Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@salesfive.com","password":"admin123"}'
```

## 🎯 **Teste es jetzt:**

### **1. Frontend Login:**
1. Gehe zu: http://localhost:3000/login
2. Verwende: `admin@salesfive.com` / `admin123`
3. Klicke "Anmelden"

### **2. Backend API Test:**
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### **3. Token Validation:**
```bash
# Verwende den Token aus der Login-Response
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3002/api/debug/token
```

## 📊 **Monitoring**

### **Login Logs:**
```bash
# Backend Login Logs
tail -f logs/server.log | grep "Login"

# Expected Output:
🔐 Login attempt: { username: 'admin@salesfive.com', timestamp: '2025-08-09T13:15:00.000Z' }
✅ Login successful for user: admin
```

### **Frontend Console:**
```javascript
// Expected Output:
🔐 Attempting login with: { emailOrUsername: 'admin@salesfive.com', password: '***' }
📡 Login response status: 200
✅ Login successful: { user: 'admin', token: '***' }
```

**Login sollte jetzt funktionieren! 🎉**

