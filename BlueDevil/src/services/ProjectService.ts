import { Project, ProjectMember } from '../types/Project';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class ProjectService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // =====================================================
  // PROJECT MANAGEMENT METHODS
  // =====================================================

  async getAllProjects(): Promise<Project[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProjectById(projectId: string): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updateData: Partial<Project>): Promise<Project> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // =====================================================
  // PROJECT MEMBERSHIP METHODS
  // =====================================================

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project members');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project members:', error);
      throw error;
    }
  }

  async addMemberToProject(projectId: string, email: string, role: string): Promise<ProjectMember> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add member to project');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding member to project:', error);
      throw error;
    }
  }

  async updateMemberRole(projectId: string, userId: string, role: string): Promise<ProjectMember> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update member role');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  async removeMemberFromProject(projectId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member from project');
      }
    } catch (error) {
      console.error('Error removing member from project:', error);
      throw error;
    }
  }

  // =====================================================
  // PROJECT SWITCHING METHODS
  // =====================================================

  async switchProject(projectId: string): Promise<{ project: Project; membership: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/switch`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to switch project');
      }

      const result = await response.json();
      
      // Update current project in localStorage
      localStorage.setItem('currentProject', JSON.stringify(result.project));
      
      return result;
    } catch (error) {
      console.error('Error switching project:', error);
      throw error;
    }
  }

  // =====================================================
  // PROJECT DATA METHODS
  // =====================================================

  async saveProjectData(projectId: string, dataType: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/data`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ dataType, data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save project data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving project data:', error);
      throw error;
    }
  }

  async getProjectData(projectId: string, dataType: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/data/${dataType}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Data not found
        }
        throw new Error('Failed to fetch project data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching project data:', error);
      throw error;
    }
  }

  async getAllProjectData(projectId: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/data`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all project data:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  getCurrentProject(): Project | null {
    const projectStr = localStorage.getItem('currentProject');
    return projectStr ? JSON.parse(projectStr) : null;
  }

  setCurrentProject(project: Project) {
    localStorage.setItem('currentProject', JSON.stringify(project));
  }

  clearCurrentProject() {
    localStorage.removeItem('currentProject');
  }
}

export default new ProjectService();
