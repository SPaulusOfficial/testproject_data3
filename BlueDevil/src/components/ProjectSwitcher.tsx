import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  role: string;
  lastAccessed?: string;
}

interface ProjectSwitcherProps {
  currentProject: Project | null;
  availableProjects: Project[];
  onProjectSwitch: (projectId: string) => Promise<void>;
  isLoading?: boolean;
}

const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({
  currentProject,
  availableProjects,
  onProjectSwitch,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [switchingProject, setSwitchingProject] = useState(false);

  const handleProjectSwitch = async (projectId: string) => {
    if (switchingProject || isLoading) return;
    
    setSwitchingProject(true);
    try {
      await onProjectSwitch(projectId);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch project:', error);
      // You might want to show a toast notification here
    } finally {
      setSwitchingProject(false);
    }
  };

  const formatLastAccessed = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'member':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (availableProjects.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
        <span className="text-gray-500">No projects available</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || switchingProject}
        className={`flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
          isLoading || switchingProject ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className={`w-3 h-3 rounded-full ${
          currentProject ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
        <span className="font-medium text-gray-900">
          {currentProject?.name || 'Select Project'}
        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
        {(isLoading || switchingProject) && (
          <div className="ml-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 mb-2 px-2">Your Projects</div>
            
            {availableProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSwitch(project.id)}
                disabled={switchingProject || isLoading}
                className={`w-full text-left px-3 py-3 rounded-md hover:bg-gray-50 transition-colors ${
                  currentProject?.id === project.id ? 'bg-blue-50 text-blue-700' : ''
                } ${switchingProject || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{project.name}</span>
                    {currentProject?.id === project.id && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getRoleColor(project.role)}`}>
                    {project.role}
                  </span>
                </div>
                
                {project.description && (
                  <div className="text-xs text-gray-500 mb-1 line-clamp-2">
                    {project.description}
                  </div>
                )}
                
                <div className="text-xs text-gray-400">
                  Last accessed: {formatLastAccessed(project.lastAccessed)}
                </div>
              </button>
            ))}
            
            {availableProjects.length === 0 && (
              <div className="px-3 py-4 text-center text-gray-500">
                <p>No projects available</p>
                <p className="text-xs mt-1">Contact your administrator to get access to projects</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSwitcher;
