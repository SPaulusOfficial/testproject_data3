import React, { useState } from 'react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import SessionInfo from '../components/SessionInfo';
import { User, FolderOpen, Settings, Activity, Bell, Shield, Download, Upload, RefreshCw } from 'lucide-react';

const SessionDemo: React.FC = () => {
  const { session, setCurrentProject, addVisitedPage, setSidebarCollapsed, setTheme, setLanguage, setUnreadNotifications, setPermissions, clearSession, exportSession, importSession } = useSession();
  const { user, login, logout } = useAuth();
  const [importData, setImportData] = useState('');
  const [showImport, setShowImport] = useState(false);

  const handleLogin = async () => {
    try {
      await login('admin@salesfive.com', 'admin123');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleProjectSwitch = (projectName: string) => {
    const mockProject = {
      id: `project-${Date.now()}`,
      name: projectName,
      slug: projectName.toLowerCase().replace(/\s+/g, '-'),
      description: `Mock project: ${projectName}`,
      ownerId: session.user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentProject(mockProject);
    addVisitedPage(`/projects/${mockProject.id}`);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
  };

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
  };

  const handleNotificationCount = (count: number) => {
    setUnreadNotifications(count);
  };

  const handlePermissionToggle = (permission: string) => {
    const currentPermissions = session.permissions;
    const newPermissions = {
      ...currentPermissions,
      [permission]: !currentPermissions[permission]
    };
    setPermissions(newPermissions);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!session.sidebarCollapsed);
  };

  const handleExportSession = () => {
    const sessionData = exportSession();
    const blob = new Blob([sessionData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSession = () => {
    try {
      importSession(importData);
      setImportData('');
      setShowImport(false);
    } catch (error) {
      alert('Invalid session data');
    }
  };

  const handleClearSession = () => {
    if (confirm('Are you sure you want to clear the session?')) {
      clearSession();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-600" />
          Session Management Demo
        </h1>
        
        <p className="text-gray-600 mb-6">
          Hier kannst du das Session-Management-System testen und alle Session-Informationen in Echtzeit sehen.
        </p>
      </div>

      {/* Session Info Panel */}
      <SessionInfo />

      {/* Authentication Section */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Authentication
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {user ? 'Logged In' : 'Not Logged In'}
            </span>
          </div>
          
          {user && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">User:</span>
                <span className="ml-2 font-medium">{user.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>
                <span className="ml-2 font-medium capitalize">{user.role}</span>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            {!user ? (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Login as Admin
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Project Management Section */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FolderOpen className="w-5 h-5 mr-2" />
          Project Management
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Current Project:</span>
            <span className="text-sm text-gray-900">
              {session.currentProject?.name || 'None selected'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['Project A', 'Project B', 'Project C', 'Salesfive Platform'].map((projectName) => (
              <button
                key={projectName}
                onClick={() => handleProjectSwitch(projectName)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                Switch to {projectName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* UI Settings Section */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          UI Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <div className="flex space-x-2">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    session.theme === theme
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <div className="flex space-x-2">
              {['de', 'en'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    session.language === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar</label>
            <button
              onClick={handleSidebarToggle}
              className={`px-3 py-1 rounded-md text-sm ${
                session.sidebarCollapsed
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {session.sidebarCollapsed ? 'Collapsed' : 'Expanded'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Unread Count:</span>
            <span className="text-sm text-gray-900">{session.unreadNotifications}</span>
          </div>
          
          <div className="flex space-x-2">
            {[0, 1, 3, 5, 10].map((count) => (
              <button
                key={count}
                onClick={() => handleNotificationCount(count)}
                className={`px-3 py-1 rounded-md text-sm ${
                  session.unreadNotifications === count
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Permissions
        </h2>
        
        <div className="space-y-2">
          {['project.create', 'project.edit', 'project.delete', 'user.manage', 'admin.access'].map((permission) => (
            <div key={permission} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={permission}
                checked={session.permissions[permission] || false}
                onChange={() => handlePermissionToggle(permission)}
                className="rounded border-gray-300"
              />
              <label htmlFor={permission} className="text-sm text-gray-700">
                {permission}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Session Management Section */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Session Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <button
              onClick={handleExportSession}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Session
            </button>
            
            <button
              onClick={() => setShowImport(!showImport)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Session
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleClearSession}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Session
            </button>
          </div>
        </div>
        
        {showImport && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Data (JSON):
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm font-mono"
              placeholder="Paste session JSON data here..."
            />
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleImportSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Import
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation History */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Navigation History
        </h2>
        
        <div className="space-y-2">
          {session.lastVisitedPages.length > 0 ? (
            session.lastVisitedPages.map((page, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="text-gray-700">{page}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No navigation history yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDemo;
