# Einfaches Permission-System - Beispiele 🎯

## 🎯 **Übersicht: Einfache Permission-Checks**

Du kannst jetzt sehr einfach Permission-Checks in deinem Code einbauen:

### **Frontend (React/TypeScript):**
```typescript
if (hasPermission('UserManagement')) {
  // Code wird nur ausgeführt wenn User Permission hat
}
```

### **Backend (Node.js):**
```javascript
if (hasPermissionFor(user, 'UserManagement')) {
  // Code wird nur ausgeführt wenn User Permission hat
}
```

### **HTML/JSX:**
```jsx
<If permission="UserManagement">
  <button>User verwalten</button>
</If>
```

## 🚀 **Frontend Beispiele**

### **1. Einfache Permission-Checks in Komponenten:**
```typescript
import { usePermissionCheck } from '../utils/permissionHelpers';

const MyComponent = () => {
  const { hasPermission, canManageUsers } = usePermissionCheck();
  
  const handleUserAction = () => {
    if (hasPermission('UserManagement')) {
      // Führe User-Management Aktion aus
      console.log('User action executed');
    } else {
      console.log('Access denied');
    }
  };
  
  return (
    <div>
      {/* Einfacher Permission-Check */}
      {hasPermission('UserManagement') && (
        <button onClick={handleUserAction}>
          User verwalten
        </button>
      )}
      
      {/* Convenience Function */}
      {canManageUsers() && (
        <div>User Management Panel</div>
      )}
    </div>
  );
};
```

### **2. Permission-Komponenten für HTML:**
```jsx
import { If, Button, Link, Div } from '../components/PermissionComponents';

const UserManagementPage = () => {
  return (
    <div>
      {/* Einfache If-Bedingung */}
      <If permission="UserManagement">
        <h1>User Management</h1>
      </If>
      
      {/* Permission-Button */}
      <Button 
        permission="UserManagement" 
        onClick={() => console.log('User created')}
        className="btn btn-primary"
      >
        Neuen User erstellen
      </Button>
      
      {/* Permission-Link */}
      <Link 
        permission="UserManagement" 
        to="/user-management/create"
        className="nav-link"
      >
        User erstellen
      </Link>
      
      {/* Permission-Section */}
      <Section permission="UserManagement" className="user-section">
        <h2>User Liste</h2>
        <p>Hier werden alle User angezeigt...</p>
      </Section>
      
      {/* Mit Fallback */}
      <If 
        permission="UserManagement" 
        fallback={<p>Keine Berechtigung für User Management</p>}
      >
        <div>User Management Content</div>
      </If>
    </div>
  );
};
```

### **3. Event Handler mit Permission-Check:**
```typescript
import { checkPermission } from '../utils/permissionHelpers';

const handleDeleteUser = (userId: string) => {
  if (checkPermission('UserManagement')) {
    // Führe Delete-Operation aus
    deleteUser(userId);
  } else {
    alert('Keine Berechtigung zum Löschen von Usern');
  }
};

const handleExportData = () => {
  if (checkPermission('DataExport')) {
    // Führe Export aus
    exportUserData();
  } else {
    alert('Keine Berechtigung zum Exportieren von Daten');
  }
};
```

## 🔧 **Backend Beispiele**

### **1. Route-Level Permission-Checks:**
```javascript
const { requirePermission, requireAnyPermission } = require('./utils/permissionHelpers');

// Einzelne Permission
app.get('/api/users', 
  authenticateToken, 
  requirePermission('UserManagement'), 
  async (req, res) => {
    // Nur User mit UserManagement Permission können hierher
    const users = await getAllUsers();
    res.json(users);
  }
);

// Mehrere Permissions (ANY)
app.post('/api/users', 
  authenticateToken, 
  requireAnyPermission(['UserManagement', 'Admin']), 
  async (req, res) => {
    // User braucht UserManagement ODER Admin Permission
    const newUser = await createUser(req.body);
    res.json(newUser);
  }
);

// Mehrere Permissions (ALL)
app.delete('/api/users/:id', 
  authenticateToken, 
  requireAllPermissions(['UserManagement', 'DeleteUsers']), 
  async (req, res) => {
    // User braucht BEIDE Permissions
    await deleteUser(req.params.id);
    res.json({ success: true });
  }
);
```

### **2. Business Logic Permission-Checks:**
```javascript
const { hasPermissionFor, respondWithPermission } = require('./utils/permissionHelpers');

// In Service-Funktionen
const userService = {
  async createUser(userData, currentUser) {
    if (!hasPermissionFor(currentUser, 'UserManagement')) {
      throw new Error('Keine Berechtigung zum Erstellen von Usern');
    }
    
    // Führe User-Erstellung aus
    return await db.users.create(userData);
  },
  
  async deleteUser(userId, currentUser) {
    if (!hasPermissionFor(currentUser, 'UserManagement')) {
      throw new Error('Keine Berechtigung zum Löschen von Usern');
    }
    
    // Führe User-Löschung aus
    return await db.users.delete(userId);
  }
};

// In Route-Handlers
app.get('/api/users/:id', authenticateToken, (req, res) => {
  respondWithPermission(req, res, 'UserManagement', async (req, res) => {
    const user = await getUserById(req.params.id);
    res.json(user);
  });
});
```

### **3. Middleware mit Permission-Check:**
```javascript
const { withPermission } = require('./utils/permissionHelpers');

// Custom Middleware mit Permission-Check
const userManagementHandler = withPermission('UserManagement', (req, res) => {
  // Handler wird nur ausgeführt wenn User Permission hat
  const users = getAllUsers();
  res.json(users);
});

app.get('/api/users', authenticateToken, userManagementHandler);
```

## 🎨 **HTML/JSX Beispiele**

### **1. Einfache If-Bedingungen:**
```jsx
import { If } from '../components/PermissionComponents';

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Einfache If-Bedingung */}
      <If permission="UserManagement">
        <div className="user-management-section">
          <h2>User Management</h2>
          <UserList />
        </div>
      </If>
      
      {/* Mit Fallback */}
      <If 
        permission="SystemSettings" 
        fallback={<p>Keine Berechtigung für System-Einstellungen</p>}
      >
        <SystemSettings />
      </If>
    </div>
  );
};
```

### **2. Permission-Buttons:**
```jsx
import { Button } from '../components/PermissionComponents';

const UserActions = () => {
  return (
    <div>
      <Button 
        permission="UserManagement" 
        onClick={() => createUser()}
        className="btn btn-primary"
      >
        Neuen User erstellen
      </Button>
      
      <Button 
        permission="UserManagement" 
        onClick={() => deleteUser(userId)}
        className="btn btn-danger"
        fallback={<span>Keine Berechtigung zum Löschen</span>}
      >
        User löschen
      </Button>
    </div>
  );
};
```

### **3. Permission-Forms:**
```jsx
import { Form } from '../components/PermissionComponents';

const UserForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic
  };
  
  return (
    <Form 
      permission="UserManagement" 
      onSubmit={handleSubmit}
      className="user-form"
    >
      <input type="text" placeholder="Username" />
      <input type="email" placeholder="Email" />
      <button type="submit">User erstellen</button>
    </Form>
  );
};
```

## 🔍 **Debugging & Testing**

### **1. Frontend Permission-Check:**
```javascript
// In Browser Console
const { hasPermission } = usePermissions();
console.log('Can manage users:', hasPermission('UserManagement'));
console.log('Can access system settings:', hasPermission('SystemSettings'));
```

### **2. Backend Permission-Check:**
```javascript
// In Backend Logs
console.log('User permissions:', getUserPermissionsFor(user));
console.log('Has UserManagement:', hasPermissionFor(user, 'UserManagement'));
```

### **3. Permission-Test:**
```bash
# Test User ohne Permissions
curl -X GET http://localhost:3002/api/users \
  -H "Authorization: Bearer <normaluser-token>"

# Expected: 403 Forbidden
{
  "error": "Access denied",
  "message": "Permission 'UserManagement' required"
}
```

## 🚀 **Verfügbare Permission-Namen**

### **User Management:**
- `UserManagement`
- `UserProfile`
- `UserRoles`
- `UserPermissions`

### **Project Management:**
- `ProjectManagement`
- `ProjectCreation`
- `ProjectDeletion`
- `ProjectMembers`

### **System Administration:**
- `SystemSettings`
- `SystemConfiguration`
- `SystemMonitoring`
- `SystemLogs`

### **Notifications:**
- `Notifications`
- `NotificationSettings`
- `NotificationTemplates`

### **Audit & Security:**
- `AuditLogs`
- `SecuritySettings`
- `AccessControl`

### **Knowledge Management:**
- `KnowledgeBase`
- `WorkshopManagement`

## 🎯 **Zusammenfassung**

Du kannst jetzt sehr einfach Permission-Checks einbauen:

### **Frontend:**
```typescript
if (hasPermission('UserManagement')) {
  // Code hier
}
```

### **Backend:**
```javascript
if (hasPermissionFor(user, 'UserManagement')) {
  // Code hier
}
```

### **HTML/JSX:**
```jsx
<If permission="UserManagement">
  <button>User verwalten</button>
</If>
```

**Das System ist jetzt sehr einfach zu verwenden! 🎉**
