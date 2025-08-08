# Permission System Guide

## 🎯 Übersicht

Das Permission-System ermöglicht es dir, fein abgestimmte Zugriffskontrollen in deiner Platform zu implementieren. Es unterstützt sowohl globale als auch projekt-spezifische Permissions.

## 🏗️ Architektur

### 1. **usePermissions Hook**
Der zentrale Hook für alle Permission-Abfragen:

```typescript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { 
    canRead, 
    canWrite, 
    canDelete, 
    canExecute,
    checkPermission,
    isProjectAdmin,
    getProjectRole 
  } = usePermissions();

  // Verwendung
  if (canRead('projects', 'project-123')) {
    // Zeige Projekt-Details
  }
};
```

### 2. **PermissionGuard Komponenten**
Wrappen andere Komponenten basierend auf Permissions:

```typescript
import { 
  ReadPermissionGuard, 
  WritePermissionGuard,
  AdminGuard,
  ProjectAdminGuard 
} from '../components/PermissionGuard';

// Nur anzeigen wenn User Lesen kann
<ReadPermissionGuard resource="projects" projectId="project-123">
  <ProjectDetails />
</ReadPermissionGuard>

// Nur anzeigen wenn User Admin ist
<AdminGuard>
  <AdminPanel />
</AdminGuard>
```

### 3. **PermissionButton Komponenten**
Buttons die automatisch basierend auf Permissions angezeigt/versteckt werden:

```typescript
import { 
  ReadButton, 
  WriteButton, 
  DeleteButton, 
  ExecuteButton 
} from '../components/PermissionButton';

// Button wird nur angezeigt wenn User schreiben kann
<WriteButton 
  resource="projects" 
  projectId="project-123"
  onClick={handleEdit}
>
  Edit Project
</WriteButton>
```

## 📋 Verwendung in deinen Komponenten

### **Beispiel 1: Projekt-Dashboard**

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { ReadButton, WriteButton, DeleteButton } from '../components/PermissionButton';
import { ReadPermissionGuard, ProjectAdminGuard } from '../components/PermissionGuard';

const ProjectDashboard = ({ projectId }) => {
  const { canRead, canWrite, isProjectAdmin } = usePermissions();

  return (
    <div>
      <h1>Project Dashboard</h1>
      
      {/* Projekt-Info nur anzeigen wenn User lesen kann */}
      <ReadPermissionGuard resource="projects" projectId={projectId}>
        <div className="project-info">
          <h2>Project Details</h2>
          <p>Project description...</p>
        </div>
      </ReadPermissionGuard>

      {/* Edit Button nur anzeigen wenn User schreiben kann */}
      <WriteButton 
        resource="projects" 
        projectId={projectId}
        onClick={handleEditProject}
      >
        Edit Project
      </WriteButton>

      {/* Admin-Bereich nur für Projekt-Admins */}
      <ProjectAdminGuard projectId={projectId}>
        <div className="admin-section">
          <h3>Admin Controls</h3>
          <DeleteButton 
            resource="projects" 
            projectId={projectId}
            onClick={handleDeleteProject}
          >
            Delete Project
          </DeleteButton>
        </div>
      </ProjectAdminGuard>
    </div>
  );
};
```

### **Beispiel 2: Navigation mit Permissions**

```typescript
import { ReadPermissionGuard } from '../components/PermissionGuard';

const Navigation = () => {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      
      {/* Navigation-Links nur anzeigen wenn User entsprechende Permissions hat */}
      <ReadPermissionGuard resource="projects">
        <a href="/projects">Projects</a>
      </ReadPermissionGuard>
      
      <ReadPermissionGuard resource="agents">
        <a href="/agents">AI Agents</a>
      </ReadPermissionGuard>
      
      <ReadPermissionGuard resource="workflows">
        <a href="/workflows">Workflows</a>
      </ReadPermissionGuard>
      
      <ReadPermissionGuard resource="data">
        <a href="/data">Data</a>
      </ReadPermissionGuard>
      
      <ReadPermissionGuard resource="users">
        <a href="/users">Users</a>
      </ReadPermissionGuard>
    </nav>
  );
};
```

### **Beispiel 3: Tabellen mit Permission-basierten Aktionen**

```typescript
import { ReadButton, WriteButton, DeleteButton } from '../components/PermissionButton';

const UserTable = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              <div className="flex space-x-2">
                <ReadButton 
                  resource="users" 
                  size="sm"
                  onClick={() => viewUser(user.id)}
                >
                  View
                </ReadButton>
                
                <WriteButton 
                  resource="users" 
                  size="sm"
                  onClick={() => editUser(user.id)}
                >
                  Edit
                </WriteButton>
                
                <DeleteButton 
                  resource="users" 
                  size="sm"
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </DeleteButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

## 🔧 Erweiterte Verwendung

### **1. Custom Permission Checks**

```typescript
const MyComponent = () => {
  const { checkPermission } = usePermissions();

  const handleAction = () => {
    // Komplexe Permission-Prüfung
    if (checkPermission({
      resource: 'data',
      action: 'export',
      projectId: 'project-123',
      scope: 'own'
    })) {
      // Führe Aktion aus
      exportData();
    } else {
      // Zeige Fehlermeldung
      showError('Keine Berechtigung zum Exportieren');
    }
  };
};
```

### **2. Conditional Rendering mit Fallbacks**

```typescript
import { ReadPermissionGuard } from '../components/PermissionGuard';

const DataView = () => {
  return (
    <ReadPermissionGuard 
      resource="data" 
      projectId="project-123"
      showFallback={true}
      fallback={
        <div className="bg-yellow-50 p-4 rounded">
          <p>Du hast keine Berechtigung, diese Daten zu sehen.</p>
        </div>
      }
    >
      <DataTable />
    </ReadPermissionGuard>
  );
};
```

### **3. Permission-basierte Buttons mit verschiedenen Varianten**

```typescript
import { PermissionButton } from '../components/PermissionButton';

const ActionButtons = () => {
  return (
    <div className="flex space-x-2">
      {/* Standard Button */}
      <PermissionButton
        permission={{ resource: 'projects', action: 'write' }}
        onClick={handleEdit}
      >
        Edit
      </PermissionButton>

      {/* Gefährliche Aktion */}
      <PermissionButton
        permission={{ resource: 'projects', action: 'delete' }}
        variant="danger"
        onClick={handleDelete}
      >
        Delete
      </PermissionButton>

      {/* Erfolgs-Aktion */}
      <PermissionButton
        permission={{ resource: 'workflows', action: 'execute' }}
        variant="success"
        onClick={handleExecute}
      >
        Execute
      </PermissionButton>

      {/* Button anzeigen auch wenn keine Permission (disabled) */}
      <PermissionButton
        permission={{ resource: 'reports', action: 'export' }}
        showWhenNoPermission={true}
        disabledWhenNoPermission={true}
        onClick={handleExport}
      >
        Export
      </PermissionButton>
    </div>
  );
};
```

## 🎨 Available Resources & Actions

### **Resources:**
- `projects` - Projekt-Management
- `agents` - AI Agent Konfiguration
- `workflows` - Workflow-Management
- `data` - Daten-Zugriff
- `users` - User-Management
- `reports` - Report-Generierung
- `settings` - Konfiguration
- `files` - Datei-Management

### **Actions:**
- `read` - Anzeigen und Zugriff
- `write` - Erstellen und Bearbeiten
- `delete` - Löschen
- `execute` - Ausführen
- `approve` - Genehmigen
- `export` - Exportieren

### **Scopes:**
- `all` - Zugriff auf alle Items
- `own` - Nur eigene Items
- `none` - Kein Zugriff

## 🚀 Integration in bestehende Komponenten

### **Schritt 1: Hook importieren**
```typescript
import { usePermissions } from '../hooks/usePermissions';
```

### **Schritt 2: Permission-Checks hinzufügen**
```typescript
const { canRead, canWrite, canDelete } = usePermissions();

// In deiner Komponente
if (canRead('projects', projectId)) {
  // Zeige Projekt-Details
}
```

### **Schritt 3: Guards verwenden**
```typescript
import { ReadPermissionGuard } from '../components/PermissionGuard';

<ReadPermissionGuard resource="projects" projectId={projectId}>
  <YourComponent />
</ReadPermissionGuard>
```

### **Schritt 4: Permission-Buttons verwenden**
```typescript
import { WriteButton, DeleteButton } from '../components/PermissionButton';

<WriteButton 
  resource="projects" 
  projectId={projectId}
  onClick={handleEdit}
>
  Edit
</WriteButton>
```

## 🔒 Sicherheitshinweise

1. **Frontend-only Protection**: Das System schützt nur das Frontend. Backend-Validierung ist immer erforderlich!
2. **Admin Bypass**: Global Admins umgehen alle Permission-Checks
3. **Project-specific**: Permissions können pro Projekt unterschiedlich sein
4. **Scope Handling**: `own` Scope erfordert zusätzliche Logik für "eigene" Items

## 📝 Best Practices

1. **Immer Fallbacks bereitstellen** für bessere UX
2. **Konsistente Resource-Namen** verwenden
3. **Project-ID immer angeben** für projekt-spezifische Checks
4. **Admin-Checks** für kritische Funktionen
5. **Backend-Validierung** parallel implementieren

## 🎯 Nächste Schritte

1. **Backend-Integration**: Permission-Service mit Backend verbinden
2. **Caching**: Permission-Checks cachen für Performance
3. **Audit-Logging**: Permission-Verletzungen loggen
4. **UI-Feedback**: Bessere Fehlermeldungen für fehlende Permissions
