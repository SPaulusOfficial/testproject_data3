import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import projectService from '../services/ProjectService';
import { Project, ProjectMembership } from '../types/Project';

interface ProjectContextType {
  // State
  currentProject: Project | null;
  availableProjects: ProjectMembership[];
  isLoading: boolean;
  error: string | null;

  // Actions
  switchProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (projectId: string, updateData: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  
  // Project data management
  saveProjectData: (dataType: string, data: any) => Promise<void>;
  getProjectData: (dataType: string) => Promise<any>;
  getAllProjectData: () => Promise<any[]>;
  
  // Project membership management
  getProjectMembers: (projectId: string) => Promise<any[]>;
  addMemberToProject: (projectId: string, email: string, role: string) => Promise<any>;
  updateMemberRole: (projectId: string, userId: string, role: string) => Promise<any>;
  removeMemberFromProject: (projectId: string, userId: string) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  clearCurrentProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [availableProjects, setAvailableProjects] = useState<ProjectMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize project context
  useEffect(() => {
    const initializeProjectContext = async () => {
      try {
        // Load current project from localStorage
        const savedProject = projectService.getCurrentProject();
        if (savedProject) {
          setCurrentProject(savedProject);
        }

        // Load available projects
        await refreshProjects();
      } catch (error) {
        console.error('Failed to initialize project context:', error);
        setError('Failed to load projects');
      }
    };

    initializeProjectContext();
  }, []);

  const refreshProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all projects for the current user
      const projects = await projectService.getAllProjects();
      
      // Transform to ProjectMembership format
      const memberships: ProjectMembership[] = projects.map(project => ({
        id: project.id,
        projectId: project.id,
        projectName: project.name,
        projectSlug: project.slug,
        projectDescription: project.description,
        role: 'member', // This should come from the backend
        permissions: {},
        profileData: {},
        settings: {},
        lastAccessed: new Date(),
        joinedAt: new Date()
      }));

      setAvailableProjects(memberships);
    } catch (error) {
      console.error('Failed to refresh projects:', error);
      setError('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const switchProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await projectService.switchProject(projectId);
      
      setCurrentProject(result.project);
      projectService.setCurrentProject(result.project);

      // Refresh available projects to update last accessed
      await refreshProjects();

      // Trigger a page reload to reset all application state
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch project:', error);
      setError('Failed to switch project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    try {
      setIsLoading(true);
      setError(null);

      const newProject = await projectService.createProject(projectData);
      
      // Refresh projects list
      await refreshProjects();

      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      setError('Failed to create project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (projectId: string, updateData: Partial<Project>): Promise<Project> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedProject = await projectService.updateProject(projectId, updateData);
      
      // Update current project if it's the one being updated
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
        projectService.setCurrentProject(updatedProject);
      }

      // Refresh projects list
      await refreshProjects();

      return updatedProject;
    } catch (error) {
      console.error('Failed to update project:', error);
      setError('Failed to update project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await projectService.deleteProject(projectId);
      
      // Clear current project if it's the one being deleted
      if (currentProject?.id === projectId) {
        setCurrentProject(null);
        projectService.clearCurrentProject();
      }

      // Refresh projects list
      await refreshProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError('Failed to delete project');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveProjectData = async (dataType: string, data: any): Promise<void> => {
    if (!currentProject) {
      throw new Error('No current project selected');
    }

    try {
      await projectService.saveProjectData(currentProject.id, dataType, data);
    } catch (error) {
      console.error('Failed to save project data:', error);
      throw error;
    }
  };

  const getProjectData = async (dataType: string): Promise<any> => {
    if (!currentProject) {
      throw new Error('No current project selected');
    }

    try {
      return await projectService.getProjectData(currentProject.id, dataType);
    } catch (error) {
      console.error('Failed to get project data:', error);
      throw error;
    }
  };

  const getAllProjectData = async (): Promise<any[]> => {
    if (!currentProject) {
      throw new Error('No current project selected');
    }

    try {
      return await projectService.getAllProjectData(currentProject.id);
    } catch (error) {
      console.error('Failed to get all project data:', error);
      throw error;
    }
  };

  const getProjectMembers = async (projectId: string): Promise<any[]> => {
    try {
      return await projectService.getProjectMembers(projectId);
    } catch (error) {
      console.error('Failed to get project members:', error);
      throw error;
    }
  };

  const addMemberToProject = async (projectId: string, email: string, role: string): Promise<any> => {
    try {
      return await projectService.addMemberToProject(projectId, email, role);
    } catch (error) {
      console.error('Failed to add member to project:', error);
      throw error;
    }
  };

  const updateMemberRole = async (projectId: string, userId: string, role: string): Promise<any> => {
    try {
      return await projectService.updateMemberRole(projectId, userId, role);
    } catch (error) {
      console.error('Failed to update member role:', error);
      throw error;
    }
  };

  const removeMemberFromProject = async (projectId: string, userId: string): Promise<void> => {
    try {
      await projectService.removeMemberFromProject(projectId, userId);
    } catch (error) {
      console.error('Failed to remove member from project:', error);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearCurrentProject = () => {
    setCurrentProject(null);
    projectService.clearCurrentProject();
  };

  const value: ProjectContextType = {
    // State
    currentProject,
    availableProjects,
    isLoading,
    error,

    // Actions
    switchProject,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
    
    // Project data management
    saveProjectData,
    getProjectData,
    getAllProjectData,
    
    // Project membership management
    getProjectMembers,
    addMemberToProject,
    updateMemberRole,
    removeMemberFromProject,
    
    // Utilities
    clearError,
    clearCurrentProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}; 