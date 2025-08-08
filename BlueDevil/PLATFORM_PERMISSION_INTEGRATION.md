# Platform Permission Integration Guide

## 🎯 Übersicht

Dieses Dokument beschreibt die vollständige Integration des Permission-Systems in alle Platform-Funktionen. Es dient als Roadmap für die systematische Implementierung von Zugriffskontrollen.

## 🏗️ Systemarchitektur

### **Permission-Hierarchie**
```
Global Admin (Bypass All)
├── Project Owner (Full Project Access)
├── Project Admin (Admin Project Access)
├── Project Member (Limited Project Access)
└── Project Viewer (Read-Only Project Access)
```

### **Resource-Matrix**
| Resource | Read | Write | Delete | Execute | Approve | Export |
|----------|------|-------|--------|---------|---------|--------|
| projects | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| agents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| workflows | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| data | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| users | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| settings | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| files | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

## 📋 Integration Roadmap

### **Phase 1: Core Platform Functions** (Priorität: Hoch)

#### **1.1 Navigation & Routing**
**Datei**: `src/components/Sidebar.tsx`

```typescript
import { ReadPermissionGuard } from '../components/PermissionGuard';

// Navigation Items mit Permission-Guards
const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: DashboardIcon,
    // Keine Permission erforderlich - immer sichtbar
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: ProjectsIcon,
    permission: { resource: 'projects', action: 'read' }
  },
  {
    name: 'AI Agents',
    href: '/agents',
    icon: AgentsIcon,
    permission: { resource: 'agents', action: 'read' }
  },
  {
    name: 'Workflows',
    href: '/workflows',
    icon: WorkflowsIcon,
    permission: { resource: 'workflows', action: 'read' }
  },
  {
    name: 'Data',
    href: '/data',
    icon: DataIcon,
    permission: { resource: 'data', action: 'read' }
  },
  {
    name: 'Users',
    href: '/user-management',
    icon: UsersIcon,
    permission: { resource: 'users', action: 'read' }
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ReportsIcon,
    permission: { resource: 'reports', action: 'read' }
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    permission: { resource: 'settings', action: 'read' }
  }
];

// Sidebar-Komponente erweitern
const Sidebar = () => {
  return (
    <nav>
      {navigationItems.map(item => {
        if (item.permission) {
          return (
            <ReadPermissionGuard 
              key={item.name}
              resource={item.permission.resource}
              action={item.permission.action}
            >
              <SidebarItem {...item} />
            </ReadPermissionGuard>
          );
        }
        return <SidebarItem key={item.name} {...item} />;
      })}
    </nav>
  );
};
```

#### **1.2 Dashboard Integration**
**Datei**: `src/pages/Dashboard.tsx`

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { ReadPermissionGuard, ProjectAdminGuard } from '../components/PermissionGuard';
import { ReadButton, WriteButton, ExecuteButton } from '../components/PermissionButton';

const Dashboard = () => {
  const { canRead, canWrite, canExecute, isProjectAdmin } = usePermissions();
  const currentProjectId = useCurrentProject(); // Hook für aktuelles Projekt

  return (
    <div className="dashboard">
      {/* Projekt-Übersicht */}
      <ReadPermissionGuard resource="projects" projectId={currentProjectId}>
        <ProjectOverview />
      </ReadPermissionGuard>

      {/* AI Agents Section */}
      <div className="section">
        <div className="section-header">
          <h2>AI Agents</h2>
          <WriteButton 
            resource="agents" 
            projectId={currentProjectId}
            onClick={createAgent}
          >
            Create Agent
          </WriteButton>
        </div>
        
        <ReadPermissionGuard resource="agents" projectId={currentProjectId}>
          <AgentsList />
        </ReadPermissionGuard>
      </div>

      {/* Workflows Section */}
      <div className="section">
        <div className="section-header">
          <h2>Workflows</h2>
          <WriteButton 
            resource="workflows" 
            projectId={currentProjectId}
            onClick={createWorkflow}
          >
            Create Workflow
          </WriteButton>
        </div>
        
        <ReadPermissionGuard resource="workflows" projectId={currentProjectId}>
          <WorkflowsList />
        </ReadPermissionGuard>
      </div>

      {/* Data Section */}
      <ReadPermissionGuard resource="data" projectId={currentProjectId}>
        <div className="section">
          <h2>Data</h2>
          <DataOverview />
        </div>
      </ReadPermissionGuard>

      {/* Admin Section */}
      <ProjectAdminGuard projectId={currentProjectId}>
        <div className="section admin-section">
          <h2>Admin Controls</h2>
          <AdminControls />
        </div>
      </ProjectAdminGuard>
    </div>
  );
};
```

#### **1.3 User Management Integration**
**Datei**: `src/pages/UserManagement.tsx`

```typescript
import { AdminGuard } from '../components/PermissionGuard';
import { WriteButton, DeleteButton } from '../components/PermissionButton';

const UserManagement = () => {
  return (
    <AdminGuard>
      <div className="user-management">
        <div className="header">
          <h1>User Management</h1>
          <WriteButton 
            resource="users"
            onClick={createUser}
          >
            Add User
          </WriteButton>
        </div>

        <UserList />
      </div>
    </AdminGuard>
  );
};

// UserList Komponente erweitern
const UserList = () => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <div className="actions">
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

### **Phase 2: Feature-Specific Functions** (Priorität: Mittel)

#### **2.1 AI Agents Management**
**Datei**: `src/pages/Agents.tsx`

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { ReadPermissionGuard, WritePermissionGuard } from '../components/PermissionGuard';
import { WriteButton, DeleteButton, ExecuteButton } from '../components/PermissionButton';

const Agents = () => {
  const { canRead, canWrite, canExecute } = usePermissions();
  const currentProjectId = useCurrentProject();

  return (
    <div className="agents-page">
      <div className="header">
        <h1>AI Agents</h1>
        <WriteButton 
          resource="agents" 
          projectId={currentProjectId}
          onClick={createAgent}
        >
          Create Agent
        </WriteButton>
      </div>

      <ReadPermissionGuard resource="agents" projectId={currentProjectId}>
        <div className="agents-grid">
          {agents.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent}
              canEdit={canWrite('agents', currentProjectId)}
              canDelete={canDelete('agents', currentProjectId)}
              canExecute={canExecute('agents', currentProjectId)}
            />
          ))}
        </div>
      </ReadPermissionGuard>
    </div>
  );
};

const AgentCard = ({ agent, canEdit, canDelete, canExecute }) => {
  return (
    <div className="agent-card">
      <h3>{agent.name}</h3>
      <p>{agent.description}</p>
      
      <div className="actions">
        {canExecute && (
          <ExecuteButton 
            resource="agents" 
            projectId={agent.projectId}
            size="sm"
            onClick={() => executeAgent(agent.id)}
          >
            Execute
          </ExecuteButton>
        )}
        
        {canEdit && (
          <WriteButton 
            resource="agents" 
            projectId={agent.projectId}
            size="sm"
            onClick={() => editAgent(agent.id)}
          >
            Edit
          </WriteButton>
        )}
        
        {canDelete && (
          <DeleteButton 
            resource="agents" 
            projectId={agent.projectId}
            size="sm"
            onClick={() => deleteAgent(agent.id)}
          >
            Delete
          </DeleteButton>
        )}
      </div>
    </div>
  );
};
```

#### **2.2 Workflows Management**
**Datei**: `src/pages/Workflows.tsx`

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { ReadPermissionGuard } from '../components/PermissionGuard';
import { WriteButton, DeleteButton, ExecuteButton } from '../components/PermissionButton';

const Workflows = () => {
  const { canRead, canWrite, canExecute } = usePermissions();
  const currentProjectId = useCurrentProject();

  return (
    <div className="workflows-page">
      <div className="header">
        <h1>Workflows</h1>
        <WriteButton 
          resource="workflows" 
          projectId={currentProjectId}
          onClick={createWorkflow}
        >
          Create Workflow
        </WriteButton>
      </div>

      <ReadPermissionGuard resource="workflows" projectId={currentProjectId}>
        <div className="workflows-list">
          {workflows.map(workflow => (
            <WorkflowItem 
              key={workflow.id} 
              workflow={workflow}
              canEdit={canWrite('workflows', currentProjectId)}
              canDelete={canDelete('workflows', currentProjectId)}
              canExecute={canExecute('workflows', currentProjectId)}
            />
          ))}
        </div>
      </ReadPermissionGuard>
    </div>
  );
};
```

#### **2.3 Data Management**
**Datei**: `src/pages/Data.tsx`

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { ReadPermissionGuard } from '../components/PermissionGuard';
import { WriteButton, DeleteButton } from '../components/PermissionButton';

const Data = () => {
  const { canRead, canWrite } = usePermissions();
  const currentProjectId = useCurrentProject();

  return (
    <div className="data-page">
      <div className="header">
        <h1>Data Management</h1>
        <WriteButton 
          resource="data" 
          projectId={currentProjectId}
          onClick={uploadData}
        >
          Upload Data
        </WriteButton>
      </div>

      <ReadPermissionGuard resource="data" projectId={currentProjectId}>
        <DataOverview />
        <DataTable />
      </ReadPermissionGuard>
    </div>
  );
};
```

### **Phase 3: Advanced Features** (Priorität: Niedrig)

#### **3.1 Reports & Analytics**
**Datei**: `src/pages/Reports.tsx`

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { ReadPermissionGuard, ProjectAdminGuard } from '../components/PermissionGuard';
import { ExecuteButton } from '../components/PermissionButton';

const Reports = () => {
  const { canRead, canExecute } = usePermissions();
  const currentProjectId = useCurrentProject();

  return (
    <div className="reports-page">
      <div className="header">
        <h1>Reports & Analytics</h1>
        <ExecuteButton 
          resource="reports" 
          projectId={currentProjectId}
          onClick={generateReport}
        >
          Generate Report
        </ExecuteButton>
      </div>

      <ReadPermissionGuard resource="reports" projectId={currentProjectId}>
        <ReportsList />
      </ReadPermissionGuard>

      {/* Advanced Analytics nur für Projekt-Admins */}
      <ProjectAdminGuard projectId={currentProjectId}>
        <AdvancedAnalytics />
      </ProjectAdminGuard>
    </div>
  );
};
```

#### **3.2 Settings & Configuration**
**Datei**: `src/pages/Settings.tsx`

```typescript
import { usePermissions } from '../hooks/usePermissions';
import { ReadPermissionGuard, AdminGuard } from '../components/PermissionGuard';
import { WriteButton } from '../components/PermissionButton';

const Settings = () => {
  const { canRead, canWrite } = usePermissions();

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      {/* General Settings */}
      <ReadPermissionGuard resource="settings">
        <GeneralSettings />
      </ReadPermissionGuard>

      {/* Project Settings */}
      <ReadPermissionGuard resource="settings" projectId={currentProjectId}>
        <ProjectSettings />
      </ReadPermissionGuard>

      {/* Admin Settings */}
      <AdminGuard>
        <AdminSettings />
      </AdminGuard>
    </div>
  );
};
```

## 🔧 Implementation Guidelines

### **1. Permission-Check Pattern**

```typescript
// ✅ Richtig - Hook verwenden
const { canRead, canWrite } = usePermissions();

if (canRead('projects', projectId)) {
  // Zeige Projekt-Details
}

// ❌ Falsch - Direkte Permission-Prüfung
if (user.permissions.includes('read:projects')) {
  // Zeige Projekt-Details
}
```

### **2. Guard-Pattern**

```typescript
// ✅ Richtig - Guard verwenden
<ReadPermissionGuard resource="projects" projectId={projectId}>
  <ProjectDetails />
</ReadPermissionGuard>

// ❌ Falsch - Conditional Rendering
{canRead('projects', projectId) && <ProjectDetails />}
```

### **3. Button-Pattern**

```typescript
// ✅ Richtig - PermissionButton verwenden
<WriteButton 
  resource="projects" 
  projectId={projectId}
  onClick={handleEdit}
>
  Edit Project
</WriteButton>

// ❌ Falsch - Manueller Button
<button 
  onClick={handleEdit}
  disabled={!canWrite('projects', projectId)}
>
  Edit Project
</button>
```

## 📋 Integration Checklist

### **Phase 1: Core Platform** ✅
- [ ] Navigation & Sidebar
- [ ] Dashboard
- [ ] User Management
- [ ] Project Overview

### **Phase 2: Feature Functions** 🔄
- [ ] AI Agents Management
- [ ] Workflows Management
- [ ] Data Management
- [ ] File Management

### **Phase 3: Advanced Features** ⏳
- [ ] Reports & Analytics
- [ ] Settings & Configuration
- [ ] Audit Logging
- [ ] Advanced Admin Features

### **Phase 4: Optimization** ⏳
- [ ] Permission Caching
- [ ] Performance Optimization
- [ ] Error Handling
- [ ] User Feedback

## 🎨 UI/UX Guidelines

### **1. Consistent Permission Indicators**

```typescript
// Permission-basierte Icons
const getPermissionIcon = (permission: string) => {
  switch (permission) {
    case 'read': return '👁️';
    case 'write': return '✏️';
    case 'delete': return '🗑️';
    case 'execute': return '▶️';
    default: return '🔒';
  }
};
```

### **2. Fallback UI**

```typescript
// Immer Fallback für bessere UX
<ReadPermissionGuard 
  resource="data" 
  projectId={projectId}
  showFallback={true}
  fallback={
    <div className="permission-denied">
      <h3>Access Denied</h3>
      <p>You don't have permission to view this data.</p>
      <button onClick={requestAccess}>Request Access</button>
    </div>
  }
>
  <DataTable />
</ReadPermissionGuard>
```

### **3. Loading States**

```typescript
// Permission-Checks während des Ladens
const { canRead, isLoading } = usePermissions();

if (isLoading) {
  return <PermissionLoadingSpinner />;
}

if (canRead('projects', projectId)) {
  return <ProjectDetails />;
}
```

## 🔒 Security Considerations

### **1. Backend Validation**
```typescript
// Frontend Permission-Check
if (canWrite('projects', projectId)) {
  updateProject(projectId, data);
}

// Backend muss auch validieren!
// API Endpoint: PUT /api/projects/:id
// Backend prüft: user.hasPermission('write', 'projects', projectId)
```

### **2. Audit Logging**
```typescript
// Permission-Verletzungen loggen
const handleAction = () => {
  if (canExecute('workflows', projectId)) {
    executeWorkflow(workflowId);
    logAudit('workflow_executed', { workflowId, projectId });
  } else {
    logAudit('permission_denied', { 
      action: 'execute', 
      resource: 'workflows', 
      projectId 
    });
    showError('Permission denied');
  }
};
```

### **3. Error Handling**
```typescript
// Graceful Error Handling
const handlePermissionError = (error: PermissionError) => {
  switch (error.type) {
    case 'INSUFFICIENT_PERMISSIONS':
      showPermissionRequestModal();
      break;
    case 'PROJECT_ACCESS_DENIED':
      redirectToProjectSelection();
      break;
    case 'ADMIN_REQUIRED':
      showAdminContactInfo();
      break;
  }
};
```

## 🚀 Performance Optimization

### **1. Permission Caching**
```typescript
// Cache Permission-Results
const useCachedPermissions = () => {
  const [permissionCache, setPermissionCache] = useState({});
  
  const checkPermission = useCallback((check) => {
    const cacheKey = JSON.stringify(check);
    
    if (permissionCache[cacheKey] !== undefined) {
      return permissionCache[cacheKey];
    }
    
    const result = PermissionService.hasPermission(userPermissions, check);
    setPermissionCache(prev => ({ ...prev, [cacheKey]: result }));
    
    return result;
  }, [userPermissions, permissionCache]);
  
  return { checkPermission };
};
```

### **2. Lazy Loading**
```typescript
// Permission-basierte Lazy Loading
const LazyAdminPanel = lazy(() => import('./AdminPanel'));

const Dashboard = () => {
  const { isAdmin } = usePermissions();
  
  return (
    <div>
      <DashboardContent />
      {isAdmin && (
        <Suspense fallback={<AdminPanelSkeleton />}>
          <LazyAdminPanel />
        </Suspense>
      )}
    </div>
  );
};
```

## 📊 Monitoring & Analytics

### **1. Permission Usage Tracking**
```typescript
// Track Permission-Checks für Analytics
const usePermissionAnalytics = () => {
  const trackPermissionCheck = (check: PermissionCheck, result: boolean) => {
    analytics.track('permission_check', {
      resource: check.resource,
      action: check.action,
      projectId: check.projectId,
      granted: result,
      timestamp: new Date().toISOString()
    });
  };
  
  return { trackPermissionCheck };
};
```

### **2. Performance Monitoring**
```typescript
// Monitor Permission-Check Performance
const usePermissionPerformance = () => {
  const measurePermissionCheck = (check: PermissionCheck) => {
    const start = performance.now();
    const result = checkPermission(check);
    const duration = performance.now() - start;
    
    if (duration > 10) { // 10ms threshold
      console.warn('Slow permission check:', { check, duration });
    }
    
    return result;
  };
  
  return { measurePermissionCheck };
};
```

## 🎯 Next Steps

### **Immediate Actions (This Week)**
1. **Navigation Integration** - Sidebar mit Permission-Guards
2. **Dashboard Updates** - Permission-basierte Sections
3. **User Management** - Admin-only Access

### **Short Term (Next 2 Weeks)**
1. **AI Agents** - Permission-basierte Agent-Management
2. **Workflows** - Permission-basierte Workflow-Controls
3. **Data Management** - Permission-basierte Data-Access

### **Medium Term (Next Month)**
1. **Reports & Analytics** - Permission-basierte Reporting
2. **Settings** - Permission-basierte Configuration
3. **File Management** - Permission-basierte File-Access

### **Long Term (Next Quarter)**
1. **Advanced Features** - Complex Permission-Scenarios
2. **Performance Optimization** - Caching & Lazy Loading
3. **Analytics & Monitoring** - Permission Usage Tracking

## 📝 Documentation Standards

### **1. Code Comments**
```typescript
/**
 * Project Dashboard Component
 * 
 * Permission Requirements:
 * - READ projects: View project details
 * - WRITE projects: Edit project settings
 * - READ agents: View AI agents
 * - EXECUTE agents: Run AI agents
 * - READ workflows: View workflows
 * - WRITE workflows: Create/edit workflows
 * - READ data: View project data
 * - ADMIN: Access admin controls
 */
const ProjectDashboard = ({ projectId }) => {
  // Implementation...
};
```

### **2. Component Documentation**
```typescript
/**
 * @component ProjectCard
 * @description Displays project information with permission-based actions
 * 
 * @permissions
 * - READ projects: View project card
 * - WRITE projects: Show edit button
 * - DELETE projects: Show delete button (admin only)
 * 
 * @props {string} projectId - Project identifier
 * @props {Project} project - Project data
 */
```

### **3. API Documentation**
```typescript
/**
 * @api GET /api/projects/:id
 * @permission READ projects
 * @scope project-specific
 * 
 * Returns project details if user has read permission
 * for the specified project.
 */
```

Diese Dokumentation dient als vollständige Roadmap für die systematische Integration des Permission-Systems in alle Platform-Funktionen! 🎉
