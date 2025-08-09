import { User } from '../types/User';
import { Project } from '../types/Project';

export interface UserSession {
  // User Information
  user: User | null;
  token: string | null;
  lastActivity: Date;
  
  // Project Information
  currentProject: Project | null;
  availableProjects: Project[];
  
  // UI State
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  
  // Navigation State
  lastVisitedPages: string[];
  breadcrumbs: string[];
  
  // Notifications
  unreadNotifications: number;
  notificationSettings: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  
  // Permissions & Security
  permissions: Record<string, boolean>;
  securityLevel: 'low' | 'medium' | 'high';
  twoFactorEnabled: boolean;
  
  // Application State
  isInitialized: boolean;
  errorCount: number;
  lastError: string | null;
}

class SessionService {
  private readonly SESSION_KEY = 'userSession';
  private readonly MAX_HISTORY = 10;
  private session: UserSession;

  constructor() {
    this.session = this.loadSession();
    this.initializeSession();
  }

  // =====================================================
  // SESSION INITIALIZATION
  // =====================================================

  private initializeSession(): void {
    if (!this.session.isInitialized) {
      this.session = {
        user: null,
        token: localStorage.getItem('authToken'),
        lastActivity: new Date(),
        currentProject: null,
        availableProjects: [],
        sidebarCollapsed: false,
        theme: 'system',
        language: 'de',
        lastVisitedPages: [],
        breadcrumbs: [],
        unreadNotifications: 0,
        notificationSettings: {
          email: true,
          push: false,
          frequency: 'immediate'
        },
        permissions: {},
        securityLevel: 'medium',
        twoFactorEnabled: false,
        isInitialized: true,
        errorCount: 0,
        lastError: null
      };
      this.saveSession();
    }
  }

  // =====================================================
  // SESSION PERSISTENCE
  // =====================================================

  private loadSession(): UserSession {
    try {
      const sessionStr = localStorage.getItem(this.SESSION_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        // Convert date strings back to Date objects
        session.lastActivity = new Date(session.lastActivity);
        return session;
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
    
    return {
      user: null,
      token: null,
      lastActivity: new Date(),
      currentProject: null,
      availableProjects: [],
      sidebarCollapsed: false,
      theme: 'system',
      language: 'de',
      lastVisitedPages: [],
      breadcrumbs: [],
      unreadNotifications: 0,
      notificationSettings: {
        email: true,
        push: false,
        frequency: 'immediate'
      },
      permissions: {},
      securityLevel: 'medium',
      twoFactorEnabled: false,
      isInitialized: false,
      errorCount: 0,
      lastError: null
    };
  }

  private saveSession(): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.session));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  // =====================================================
  // USER MANAGEMENT
  // =====================================================

  setUser(user: User | null): void {
    this.session.user = user;
    this.session.lastActivity = new Date();
    this.saveSession();
  }

  getUser(): User | null {
    return this.session.user;
  }

  setToken(token: string | null): void {
    this.session.token = token;
    this.session.lastActivity = new Date();
    this.saveSession();
  }

  getToken(): string | null {
    return this.session.token;
  }

  updateLastActivity(): void {
    this.session.lastActivity = new Date();
    this.saveSession();
  }

  getLastActivity(): Date {
    return this.session.lastActivity;
  }

  isSessionExpired(maxInactiveMinutes: number = 30): boolean {
    const now = new Date();
    const diffInMinutes = (now.getTime() - this.session.lastActivity.getTime()) / (1000 * 60);
    return diffInMinutes > maxInactiveMinutes;
  }

  // =====================================================
  // PROJECT MANAGEMENT
  // =====================================================

  setCurrentProject(project: Project | null): void {
    this.session.currentProject = project;
    this.session.lastActivity = new Date();
    this.saveSession();
  }

  getCurrentProject(): Project | null {
    return this.session.currentProject;
  }

  setAvailableProjects(projects: Project[]): void {
    this.session.availableProjects = projects;
    this.saveSession();
  }

  getAvailableProjects(): Project[] {
    return this.session.availableProjects;
  }

  // =====================================================
  // UI STATE MANAGEMENT
  // =====================================================

  setSidebarCollapsed(collapsed: boolean): void {
    this.session.sidebarCollapsed = collapsed;
    this.saveSession();
  }

  isSidebarCollapsed(): boolean {
    return this.session.sidebarCollapsed;
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.session.theme = theme;
    this.saveSession();
  }

  getTheme(): 'light' | 'dark' | 'system' {
    return this.session.theme;
  }

  setLanguage(language: string): void {
    this.session.language = language;
    this.saveSession();
  }

  getLanguage(): string {
    return this.session.language;
  }

  // =====================================================
  // NAVIGATION STATE
  // =====================================================

  addVisitedPage(page: string): void {
    // Remove if already exists
    this.session.lastVisitedPages = this.session.lastVisitedPages.filter(p => p !== page);
    // Add to beginning
    this.session.lastVisitedPages.unshift(page);
    // Keep only last MAX_HISTORY pages
    if (this.session.lastVisitedPages.length > this.MAX_HISTORY) {
      this.session.lastVisitedPages = this.session.lastVisitedPages.slice(0, this.MAX_HISTORY);
    }
    this.saveSession();
  }

  getLastVisitedPages(): string[] {
    return this.session.lastVisitedPages;
  }

  setBreadcrumbs(breadcrumbs: string[]): void {
    this.session.breadcrumbs = breadcrumbs;
    this.saveSession();
  }

  getBreadcrumbs(): string[] {
    return this.session.breadcrumbs;
  }

  // =====================================================
  // NOTIFICATION MANAGEMENT
  // =====================================================

  setUnreadNotifications(count: number): void {
    this.session.unreadNotifications = count;
    this.saveSession();
  }

  getUnreadNotifications(): number {
    return this.session.unreadNotifications;
  }

  setNotificationSettings(settings: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  }): void {
    this.session.notificationSettings = settings;
    this.saveSession();
  }

  getNotificationSettings(): {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  } {
    return this.session.notificationSettings;
  }

  // =====================================================
  // PERMISSIONS & SECURITY
  // =====================================================

  setPermissions(permissions: Record<string, boolean>): void {
    this.session.permissions = permissions;
    this.saveSession();
  }

  getPermissions(): Record<string, boolean> {
    return this.session.permissions;
  }

  hasPermission(permission: string): boolean {
    return this.session.permissions[permission] || false;
  }

  setSecurityLevel(level: 'low' | 'medium' | 'high'): void {
    this.session.securityLevel = level;
    this.saveSession();
  }

  getSecurityLevel(): 'low' | 'medium' | 'high' {
    return this.session.securityLevel;
  }

  setTwoFactorEnabled(enabled: boolean): void {
    this.session.twoFactorEnabled = enabled;
    this.saveSession();
  }

  isTwoFactorEnabled(): boolean {
    return this.session.twoFactorEnabled;
  }

  // =====================================================
  // APPLICATION STATE
  // =====================================================

  setError(error: string): void {
    this.session.lastError = error;
    this.session.errorCount++;
    this.saveSession();
  }

  getLastError(): string | null {
    return this.session.lastError;
  }

  getErrorCount(): number {
    return this.session.errorCount;
  }

  clearErrors(): void {
    this.session.lastError = null;
    this.session.errorCount = 0;
    this.saveSession();
  }

  // =====================================================
  // SESSION UTILITIES
  // =====================================================

  clearSession(): void {
    this.session = {
      user: null,
      token: null,
      lastActivity: new Date(),
      currentProject: null,
      availableProjects: [],
      sidebarCollapsed: false,
      theme: 'system',
      language: 'de',
      lastVisitedPages: [],
      breadcrumbs: [],
      unreadNotifications: 0,
      notificationSettings: {
        email: true,
        push: false,
        frequency: 'immediate'
      },
      permissions: {},
      securityLevel: 'medium',
      twoFactorEnabled: false,
      isInitialized: true,
      errorCount: 0,
      lastError: null
    };
    this.saveSession();
  }

  getSession(): UserSession {
    return { ...this.session };
  }

  exportSession(): string {
    return JSON.stringify(this.session, null, 2);
  }

  importSession(sessionData: string): void {
    try {
      const session = JSON.parse(sessionData);
      this.session = session;
      this.saveSession();
    } catch (error) {
      console.error('Failed to import session:', error);
      throw new Error('Invalid session data');
    }
  }

  // =====================================================
  // SESSION VALIDATION
  // =====================================================

  validateSession(): boolean {
    if (!this.session.token) {
      return false;
    }

    if (!this.session.user) {
      return false;
    }

    if (this.isSessionExpired()) {
      return false;
    }

    return true;
  }

  // =====================================================
  // DEBUG & MONITORING
  // =====================================================

  getSessionInfo(): {
    userLoggedIn: boolean;
    currentProject: string | null;
    lastActivity: string;
    sessionAge: number;
    errorCount: number;
    unreadNotifications: number;
  } {
    const now = new Date();
    const sessionAge = (now.getTime() - this.session.lastActivity.getTime()) / (1000 * 60);

    return {
      userLoggedIn: !!this.session.user,
      currentProject: this.session.currentProject?.name || null,
      lastActivity: this.session.lastActivity.toISOString(),
      sessionAge: Math.round(sessionAge),
      errorCount: this.session.errorCount,
      unreadNotifications: this.session.unreadNotifications
    };
  }
}

export default new SessionService();
