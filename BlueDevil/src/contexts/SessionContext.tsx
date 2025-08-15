import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import sessionService, { UserSession } from '../services/SessionService';
import { User } from '../types/User';
import { Project } from '../types/Project';

interface SessionContextType {
  // Session State
  session: UserSession;
  isSessionValid: boolean;
  sessionAge: number;
  
  // User Management
  setUser: (user: User | null) => void;
  getUser: () => User | null;
  setToken: (token: string | null) => void;
  getToken: () => string | null;
  
  // Project Management
  setCurrentProject: (project: Project | null) => void;
  getCurrentProject: () => Project | null;
  setAvailableProjects: (projects: Project[]) => void;
  getAvailableProjects: () => Project[];
  switchProject: (projectId: string) => Promise<void>;
  refreshAvailableProjects: () => Promise<void>;
  
  // UI State Management
  setSidebarCollapsed: (collapsed: boolean) => void;
  isSidebarCollapsed: () => boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  getTheme: () => 'light' | 'dark' | 'system';
  setLanguage: (language: string) => void;
  getLanguage: () => string;
  
  // Navigation State
  addVisitedPage: (page: string) => void;
  getLastVisitedPages: () => string[];
  setBreadcrumbs: (breadcrumbs: string[]) => void;
  getBreadcrumbs: () => string[];
  
  // Notification Management
  setUnreadNotifications: (count: number) => void;
  getUnreadNotifications: () => number;
  setNotificationSettings: (settings: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  }) => void;
  getNotificationSettings: () => {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  
  // Permissions & Security
  setPermissions: (permissions: Record<string, boolean>) => void;
  getPermissions: () => Record<string, boolean>;
  hasPermission: (permission: string) => boolean;
  setSecurityLevel: (level: 'low' | 'medium' | 'high') => void;
  getSecurityLevel: () => 'low' | 'medium' | 'high';
  setTwoFactorEnabled: (enabled: boolean) => void;
  isTwoFactorEnabled: () => boolean;
  
  // Session Management
  updateLastActivity: () => void;
  isSessionExpired: (maxInactiveMinutes?: number) => boolean;
  clearSession: () => void;
  validateSession: () => boolean;
  
  // Error Management
  setError: (error: string) => void;
  getLastError: () => string | null;
  getErrorCount: () => number;
  clearErrors: () => void;
  
  // Debug & Monitoring
  getSessionInfo: () => {
    userLoggedIn: boolean;
    currentProject: string | null;
    lastActivity: string;
    sessionAge: number;
    errorCount: number;
    unreadNotifications: number;
  };
  
  // Session Export/Import
  exportSession: () => string;
  importSession: (sessionData: string) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSessionState] = useState<UserSession>(sessionService.getSession());
  const [isSessionValid, setIsSessionValid] = useState(sessionService.validateSession());

  // Update session state when it changes
  useEffect(() => {
    const updateSession = () => {
      const currentSession = sessionService.getSession();
      setSessionState(currentSession);
      setIsSessionValid(sessionService.validateSession());
    };

    // Update session state every 5 seconds
    const interval = setInterval(updateSession, 5000);
    
    // Also update on window focus
    const handleFocus = () => {
      sessionService.updateLastActivity();
      updateSession();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Calculate session age
  const sessionAge = Math.round(
    (new Date().getTime() - session.lastActivity.getTime()) / (1000 * 60)
  );

  // Wrapper functions that update both service and state
  const setUser = (user: User | null) => {
    sessionService.setUser(user);
    setSessionState(sessionService.getSession());
  };

  const getUser = () => sessionService.getUser();

  const setToken = (token: string | null) => {
    sessionService.setToken(token);
    setSessionState(sessionService.getSession());
  };

  const getToken = () => sessionService.getToken();

  const setCurrentProject = (project: Project | null) => {
    sessionService.setCurrentProject(project);
    setSessionState(sessionService.getSession());
  };

  const getCurrentProject = () => sessionService.getCurrentProject();

  const setAvailableProjects = (projects: Project[]) => {
    sessionService.setAvailableProjects(projects);
    setSessionState(sessionService.getSession());
  };

  const getAvailableProjects = () => sessionService.getAvailableProjects();

  const switchProject = async (projectId: string) => {
    try {
      // Call project service to switch project
      const projectService = (await import('../services/ProjectService')).default;
      const result = await projectService.switchProject(projectId);
      
      // Update session with new project
      sessionService.setCurrentProject(result.project);
      setSessionState(sessionService.getSession());
      
      // Refresh available projects
      await refreshAvailableProjects();
    } catch (error) {
      console.error('Failed to switch project:', error);
      throw error;
    }
  };

  const refreshAvailableProjects = async () => {
    try {
      // Call project service to get updated projects
      const projectService = (await import('../services/ProjectService')).default;
      const projects = await projectService.getAllProjects();
      
      // Update session with new projects
      sessionService.setAvailableProjects(projects);
      setSessionState(sessionService.getSession());
    } catch (error) {
      console.error('Failed to refresh projects:', error);
      throw error;
    }
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    sessionService.setSidebarCollapsed(collapsed);
    setSessionState(sessionService.getSession());
  };

  const isSidebarCollapsed = () => sessionService.isSidebarCollapsed();

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    sessionService.setTheme(theme);
    setSessionState(sessionService.getSession());
  };

  const getTheme = () => sessionService.getTheme();

  const setLanguage = (language: string) => {
    sessionService.setLanguage(language);
    setSessionState(sessionService.getSession());
  };

  const getLanguage = () => sessionService.getLanguage();

  const addVisitedPage = (page: string) => {
    sessionService.addVisitedPage(page);
    setSessionState(sessionService.getSession());
  };

  const getLastVisitedPages = () => sessionService.getLastVisitedPages();

  const setBreadcrumbs = (breadcrumbs: string[]) => {
    sessionService.setBreadcrumbs(breadcrumbs);
    setSessionState(sessionService.getSession());
  };

  const getBreadcrumbs = () => sessionService.getBreadcrumbs();

  const setUnreadNotifications = (count: number) => {
    sessionService.setUnreadNotifications(count);
    setSessionState(sessionService.getSession());
  };

  const getUnreadNotifications = () => sessionService.getUnreadNotifications();

  const setNotificationSettings = (settings: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  }) => {
    sessionService.setNotificationSettings(settings);
    setSessionState(sessionService.getSession());
  };

  const getNotificationSettings = () => sessionService.getNotificationSettings();

  const setPermissions = (permissions: Record<string, boolean>) => {
    sessionService.setPermissions(permissions);
    setSessionState(sessionService.getSession());
  };

  const getPermissions = () => sessionService.getPermissions();

  const hasPermission = (permission: string) => sessionService.hasPermission(permission);

  const setSecurityLevel = (level: 'low' | 'medium' | 'high') => {
    sessionService.setSecurityLevel(level);
    setSessionState(sessionService.getSession());
  };

  const getSecurityLevel = () => sessionService.getSecurityLevel();

  const setTwoFactorEnabled = (enabled: boolean) => {
    sessionService.setTwoFactorEnabled(enabled);
    setSessionState(sessionService.getSession());
  };

  const isTwoFactorEnabled = () => sessionService.isTwoFactorEnabled();

  const updateLastActivity = () => {
    sessionService.updateLastActivity();
    setSessionState(sessionService.getSession());
  };

  const isSessionExpired = (maxInactiveMinutes?: number) => 
    sessionService.isSessionExpired(maxInactiveMinutes);

  const clearSession = () => {
    sessionService.clearSession();
    setSessionState(sessionService.getSession());
  };

  const validateSession = () => sessionService.validateSession();

  const setError = (error: string) => {
    sessionService.setError(error);
    setSessionState(sessionService.getSession());
  };

  const getLastError = () => sessionService.getLastError();

  const getErrorCount = () => sessionService.getErrorCount();

  const clearErrors = () => {
    sessionService.clearErrors();
    setSessionState(sessionService.getSession());
  };

  const getSessionInfo = () => sessionService.getSessionInfo();

  const exportSession = () => sessionService.exportSession();

  const importSession = (sessionData: string) => {
    sessionService.importSession(sessionData);
    setSessionState(sessionService.getSession());
  };

  const value: SessionContextType = {
    // Session State
    session,
    isSessionValid,
    sessionAge,
    
    // User Management
    setUser,
    getUser,
    setToken,
    getToken,
    
    // Project Management
    setCurrentProject,
    getCurrentProject,
    setAvailableProjects,
    getAvailableProjects,
    switchProject,
    refreshAvailableProjects,
    
    // UI State Management
    setSidebarCollapsed,
    isSidebarCollapsed,
    setTheme,
    getTheme,
    setLanguage,
    getLanguage,
    
    // Navigation State
    addVisitedPage,
    getLastVisitedPages,
    setBreadcrumbs,
    getBreadcrumbs,
    
    // Notification Management
    setUnreadNotifications,
    getUnreadNotifications,
    setNotificationSettings,
    getNotificationSettings,
    
    // Permissions & Security
    setPermissions,
    getPermissions,
    hasPermission,
    setSecurityLevel,
    getSecurityLevel,
    setTwoFactorEnabled,
    isTwoFactorEnabled,
    
    // Session Management
    updateLastActivity,
    isSessionExpired,
    clearSession,
    validateSession,
    
    // Error Management
    setError,
    getLastError,
    getErrorCount,
    clearErrors,
    
    // Debug & Monitoring
    getSessionInfo,
    
    // Session Export/Import
    exportSession,
    importSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
