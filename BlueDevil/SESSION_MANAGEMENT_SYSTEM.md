# Session Management System - Dokumentation

## 🎯 **Übersicht**

Das Session-Management-System verwaltet alle wichtigen Informationen einer User-Session zentral und persistent. Es speichert nicht nur Authentifizierungsdaten, sondern auch Projekt-Informationen, UI-Einstellungen, Navigation-Historie und mehr.

## 📊 **Session-Informationen**

### **🔐 User Information**
- ✅ User-Objekt (ID, Name, Email, Role, etc.)
- ✅ JWT-Token
- ✅ Last Activity Timestamp
- ✅ Session-Validität

### **📁 Project Information**
- ✅ Aktuell gewähltes Projekt
- ✅ Verfügbare Projekte
- ✅ Projekt-Memberships
- ✅ Projekt-spezifische Einstellungen

### **🎨 UI State**
- ✅ Sidebar Collapsed/Expanded
- ✅ Theme (Light/Dark/System)
- ✅ Language (de/en)
- ✅ UI-Präferenzen

### **🧭 Navigation State**
- ✅ Letzte besuchte Seiten (History)
- ✅ Breadcrumbs
- ✅ Navigation-Pfad

### **🔔 Notifications**
- ✅ Ungelesene Benachrichtigungen
- ✅ Notification-Einstellungen
- ✅ Email/Push-Preferences

### **🛡️ Security & Permissions**
- ✅ User-Permissions
- ✅ Security Level
- ✅ Two-Factor Authentication Status
- ✅ Access Rights

### **📈 Application State**
- ✅ Error Count & Last Error
- ✅ Session Age
- ✅ Debug Information

## 🏗️ **Architektur**

### **SessionService (Core)**
```typescript
// services/SessionService.ts
class SessionService {
  private session: UserSession;
  
  // User Management
  setUser(user: User | null): void
  getUser(): User | null
  setToken(token: string | null): void
  
  // Project Management
  setCurrentProject(project: Project | null): void
  getCurrentProject(): Project | null
  
  // UI State
  setSidebarCollapsed(collapsed: boolean): void
  setTheme(theme: 'light' | 'dark' | 'system'): void
  
  // Navigation
  addVisitedPage(page: string): void
  setBreadcrumbs(breadcrumbs: string[]): void
  
  // Security
  setPermissions(permissions: Record<string, boolean>): void
  hasPermission(permission: string): boolean
  
  // Session Management
  updateLastActivity(): void
  isSessionExpired(maxInactiveMinutes?: number): boolean
  validateSession(): boolean
}
```

### **SessionContext (React Integration)**
```typescript
// contexts/SessionContext.tsx
interface SessionContextType {
  // Session State
  session: UserSession;
  isSessionValid: boolean;
  sessionAge: number;
  
  // User Management
  setUser: (user: User | null) => void;
  getUser: () => User | null;
  
  // Project Management
  setCurrentProject: (project: Project | null) => void;
  getCurrentProject: () => Project | null;
  
  // UI State Management
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Navigation State
  addVisitedPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: string[]) => void;
  
  // Security & Permissions
  setPermissions: (permissions: Record<string, boolean>) => void;
  hasPermission: (permission: string) => boolean;
  
  // Session Management
  updateLastActivity: () => void;
  isSessionExpired: (maxInactiveMinutes?: number) => boolean;
  clearSession: () => void;
}
```

### **SessionInfo Component (Debug/Monitoring)**
```typescript
// components/SessionInfo.tsx
const SessionInfo: React.FC = () => {
  // Zeigt Session-Status an
  // Export/Import von Session-Daten
  // Real-time Monitoring
  // Debug-Informationen
}
```

## 🔄 **Integration mit bestehenden Services**

### **AuthService Integration**
```typescript
// services/AuthService.ts
async login(emailOrUsername: string, password: string) {
  const data = await response.json();
  
  // Store token in SessionService
  sessionService.setToken(data.token);
  sessionService.setUser(data.user);
  sessionService.updateLastActivity();
  
  return data;
}

logout() {
  // Clear session
  sessionService.clearSession();
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}
```

### **ProjectService Integration**
```typescript
// services/ProjectService.ts
async switchProject(projectId: string) {
  const result = await response.json();
  
  // Update session with new project
  sessionService.setCurrentProject(result.project);
  sessionService.updateLastActivity();
  
  return result;
}

getCurrentProject(): Project | null {
  return sessionService.getCurrentProject();
}
```

## 📱 **Verwendung in React Components**

### **Session Hook**
```typescript
import { useSession } from '../contexts/SessionContext';

const MyComponent: React.FC = () => {
  const { 
    session, 
    setCurrentProject, 
    addVisitedPage, 
    hasPermission 
  } = useSession();
  
  // Use session data
  const currentUser = session.user;
  const currentProject = session.currentProject;
  
  // Update session
  const handleProjectSwitch = (project: Project) => {
    setCurrentProject(project);
    addVisitedPage(`/projects/${project.id}`);
  };
  
  // Check permissions
  if (!hasPermission('project.edit')) {
    return <AccessDenied />;
  }
  
  return <ProjectEditor />;
};
```

### **Navigation Tracking**
```typescript
import { useSession } from '../contexts/SessionContext';
import { useLocation } from 'react-router-dom';

const NavigationTracker: React.FC = () => {
  const { addVisitedPage, setBreadcrumbs } = useSession();
  const location = useLocation();
  
  useEffect(() => {
    // Track page visits
    addVisitedPage(location.pathname);
    
    // Update breadcrumbs
    const breadcrumbs = location.pathname.split('/').filter(Boolean);
    setBreadcrumbs(breadcrumbs);
  }, [location.pathname]);
  
  return null;
};
```

## 💾 **Persistierung**

### **localStorage Structure**
```json
{
  "userSession": {
    "user": {
      "id": "439ca6e3-fdfc-4590-88b7-26761a914af2",
      "username": "admin",
      "email": "admin@salesfive.com",
      "globalRole": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "lastActivity": "2025-08-08T20:45:00.000Z",
    "currentProject": {
      "id": "project-123",
      "name": "Salesfive Platform",
      "slug": "salesfive-platform"
    },
    "availableProjects": [...],
    "sidebarCollapsed": false,
    "theme": "system",
    "language": "de",
    "lastVisitedPages": [
      "/dashboard",
      "/projects",
      "/profile"
    ],
    "breadcrumbs": ["dashboard"],
    "unreadNotifications": 3,
    "notificationSettings": {
      "email": true,
      "push": false,
      "frequency": "immediate"
    },
    "permissions": {
      "project.create": true,
      "project.edit": true,
      "user.manage": true
    },
    "securityLevel": "medium",
    "twoFactorEnabled": false,
    "isInitialized": true,
    "errorCount": 0,
    "lastError": null
  }
}
```

## 🔍 **Session Monitoring**

### **SessionInfo Component**
```typescript
// Zeigt Session-Status in Echtzeit
<SessionInfo />
```

**Features:**
- ✅ Session-Status (Active/Inactive/Expired)
- ✅ User & Project Information
- ✅ Navigation History
- ✅ Security & Permissions
- ✅ Error Tracking
- ✅ Export/Import Session Data

### **Session Validation**
```typescript
// Automatische Session-Validierung
const validateSession = () => {
  if (!session.token) return false;
  if (!session.user) return false;
  if (session.isSessionExpired(30)) return false;
  return true;
};
```

## 🚀 **Setup & Integration**

### **1. App.tsx Integration**
```typescript
import { SessionProvider } from './contexts/SessionContext';

function App() {
  return (
    <SessionProvider>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <NavigationTracker />
            <AppRoutes />
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
```

### **2. Service Integration**
```typescript
// Update existing services to use SessionService
import sessionService from '../services/SessionService';

// AuthService
class AuthService {
  async login(email: string, password: string) {
    const data = await response.json();
    sessionService.setToken(data.token);
    sessionService.setUser(data.user);
    return data;
  }
}

// ProjectService
class ProjectService {
  async switchProject(projectId: string) {
    const result = await response.json();
    sessionService.setCurrentProject(result.project);
    return result;
  }
}
```

### **3. Component Integration**
```typescript
// Use session data in components
const Header: React.FC = () => {
  const { session, setSidebarCollapsed } = useSession();
  
  return (
    <header>
      <button onClick={() => setSidebarCollapsed(!session.sidebarCollapsed)}>
        Toggle Sidebar
      </button>
      <span>Welcome, {session.user?.username}</span>
      <span>Project: {session.currentProject?.name}</span>
    </header>
  );
};
```

## 🔧 **Konfiguration**

### **Session Settings**
```typescript
// Default session configuration
const DEFAULT_SESSION = {
  theme: 'system',
  language: 'de',
  securityLevel: 'medium',
  notificationSettings: {
    email: true,
    push: false,
    frequency: 'immediate'
  },
  maxHistory: 10,
  sessionTimeout: 30 // minutes
};
```

### **Environment Variables**
```bash
# Session Configuration
VITE_SESSION_TIMEOUT=30
VITE_MAX_HISTORY=10
VITE_DEFAULT_THEME=system
VITE_DEFAULT_LANGUAGE=de
```

## 📈 **Monitoring & Debugging**

### **Session Info Panel**
```typescript
// Debug panel for session information
<SessionInfo />
```

**Anzeige:**
- ✅ Session-Status
- ✅ User & Project Info
- ✅ Navigation History
- ✅ Security & Permissions
- ✅ Error Tracking
- ✅ Export/Import

### **Console Debugging**
```typescript
// Debug session in console
console.log('Session Info:', sessionService.getSessionInfo());
console.log('Current User:', sessionService.getUser());
console.log('Current Project:', sessionService.getCurrentProject());
console.log('Session Age:', sessionService.getSessionAge());
```

## 🎯 **Vorteile**

### **✅ Zentrale Verwaltung**
- Alle Session-Daten an einem Ort
- Konsistente Datenstruktur
- Einfache Persistierung

### **✅ React Integration**
- Context API für globale Verfügbarkeit
- Real-time Updates
- TypeScript Support

### **✅ Debugging & Monitoring**
- SessionInfo Component für Debugging
- Export/Import von Session-Daten
- Real-time Monitoring

### **✅ Erweiterbar**
- Modulare Architektur
- Einfache Integration neuer Features
- Backward-Kompatibilität

### **✅ Performance**
- Effiziente Updates
- Minimale Re-Renders
- Optimierte Persistierung

## 🔮 **Nächste Schritte**

### **Kurzfristig**
1. ✅ SessionService implementiert
2. ✅ SessionContext erstellt
3. ✅ SessionInfo Component
4. 🔄 Integration in bestehende Services
5. 🔄 Navigation Tracking

### **Mittelfristig**
1. 🔄 Session-Synchronisation zwischen Tabs
2. 🔄 Offline-Support
3. 🔄 Session-Migration
4. 🔄 Advanced Security Features

### **Langfristig**
1. 🔄 Multi-Device Session Sync
2. 🔄 Session Analytics
3. 🔄 Advanced Monitoring
4. 🔄 Session Recovery

## 🎉 **Status: Implementiert**

Das Session-Management-System ist vollständig implementiert und bereit für die Integration in die bestehende Anwendung!
