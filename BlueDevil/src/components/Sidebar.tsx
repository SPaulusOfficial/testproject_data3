import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { useProject } from '@/contexts/ProjectContext'
import Avatar from './Avatar'
import { 
  ChevronDown,
  ChevronRight,
  Search,
  Video,
  Mic,
  Book,
  UploadCloud,
  Map,
  PencilRuler,
  Users,
  FileText,
  Layers,
  PenTool,
  LayoutDashboard,
  Lightbulb,
  Hammer,
  FileQuestion,
  Calendar,
  BookOpen,
  Settings,
  Database,
  Code,
  FileCode,
  ChevronDown as ChevronDownIcon,
  LogOut,
  GitBranch,
  Check
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

// Environment variable to control Pre Sales visibility
const PRESALES_ENABLED = import.meta.env.VITE_PRESALES === 'true'



export const Sidebar: React.FC<{ collapsed: boolean }> = ({ collapsed }) => {
  const location = useLocation()
  const { user } = useAuth()
  const { canAccessUserManagement, canAccessProjectManagement, canAccessSystemSettings } = usePermissions()
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [openSub, setOpenSub] = useState<string | null>(null)
  const { currentProject, availableProjects, switchProject, isLoading } = useProject()
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const { logout } = useAuth()

  // Define menu items inside the component to access permissions
  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      type: 'link'
    },
    // User Management - only shown if user has permission
    ...(canAccessUserManagement() ? [{
      label: 'User Management',
      icon: Users,
      path: '/user-management',
      type: 'link'
    }] : []),
    // Knowledge as standalone menu item
    {
      label: 'Knowledge',
      icon: Layers,
      type: 'accordion',
      children: [
        { label: 'Workshops', path: '/pre-sales/knowledge/workshops', icon: Book },
      ]
    },
    // Pre Sales block - only shown if PRESALES_ENABLED is true
    ...(PRESALES_ENABLED ? [{
      label: 'Pre Sales',
      icon: Search,
      type: 'accordion',
      children: [
        {
          label: 'RfP Question Extraction',
          icon: FileQuestion,
          children: [
            { label: 'Extract Questions from RfPs', path: '/pre-sales/rfp-questions/extract', icon: FileQuestion },
            { label: 'AI-powered Answers', path: '/pre-sales/rfp-questions/ai-answers', icon: Search },
          ]
        },
        {
          label: 'Project Designer',
          icon: PenTool,
          children: [
            { label: 'Architecture Sketch', path: '/pre-sales/project-designer/architektur-sketch', icon: PencilRuler },
            { label: 'Project Plan Sketch', path: '/pre-sales/project-designer/projektplan-sketch', icon: Calendar },
            { label: 'Stakeholder & Role Definition', path: '/pre-sales/project-designer/stakeholder-rollendefinition', icon: Users },
          ]
        }
      ]
    }] : []),
    {
      label: 'Solution',
      icon: Lightbulb,
      type: 'accordion',
      children: [
        {
          label: 'Data Modeling Assist',
          icon: Layers,
          children: [
            { label: 'Data Model Design', path: '/solution/data-modeling/design', icon: PencilRuler },
          ]
        },
        {
          label: 'Process Mining',
          icon: Search,
          children: [
            { label: 'BPMN Diagram Analysis', path: '/solution/process-mining/bpmn-analysis', icon: FileText },
          ]
        }
      ]
    },
    {
      label: 'Build',
      icon: Hammer,
      type: 'accordion',
      children: [
        {
          label: 'Data Model Setup',
          icon: Database,
          path: '/build/data-model-setup',
        }
      ]
    },
    {
      label: 'Demo',
      icon: Code,
      type: 'accordion',
      children: [
        {
          label: 'Versioned Text Editor',
          icon: FileCode,
          path: '/demo/versioned-text-editor',
        },
        {
          label: 'Editor Examples',
          icon: FileText,
          path: '/demo/editor-examples',
        },
        {
          label: 'Editor Examples (Full)',
          icon: FileCode,
          path: '/demo/editor-examples-full',
        },
        {
          label: 'Agent Versioning',
          icon: GitBranch,
          path: '/demo/agent-versioning',
        },
        {
          label: 'Process Versioning',
          icon: Check,
          path: '/demo/process-versioning',
        },
        {
          label: 'Advanced Diff',
          icon: FileText,
          path: '/demo/advanced-diff',
        }
      ]
    }
  ]

  // Active project object
  const activeProject = currentProject

  // Abbreviation for project names (first letters)
  const getProjectShortName = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').substring(0, 3)
  }

  // Filter projects based on search term
  const filteredProjects = availableProjects.filter(project =>
    (project.projectName && project.projectName.toLowerCase().includes(projectSearchTerm.toLowerCase())) ||
    (project.projectDescription && project.projectDescription.toLowerCase().includes(projectSearchTerm.toLowerCase()))
  )

  const handleProjectSwitch = async (projectId: string) => {
    try {
      await switchProject(projectId);
      setShowProjectModal(false);
      setProjectSearchTerm('');
    } catch (error) {
      console.error('Failed to switch project:', error);
    }
  }

  return (
    <>
      <aside className={`
        bg-gradient-to-b from-deep-blue-1 to-deep-blue-2
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-sidebar'}
        h-screen
        flex flex-col
        overflow-hidden
      `}>
        <div className="flex flex-col h-full min-h-0 overflow-y-auto">
          {/* User Profile */}
          {!collapsed && user && (
            <div className="flex flex-col items-center py-6 border-b border-white/10">
              {/* Logo/Brand */}
              <div className="mb-6 flex items-center space-x-2">
                {/* Optional: <img src="/logo.svg" className="h-6" /> */}
                <span className="text-white text-lg font-bold tracking-wide">Salesfive</span>
              </div>
              {/* Avatar */}
              <Avatar 
                user={user} 
                size="xl" 
                className="border-4 border-white shadow mb-2"
              />
              <div className="text-white text-base font-semibold">{user.name}</div>
              <div className="text-white/70 text-xs truncate">{user.email}</div>

            </div>
          )}

          {/* Active Project */}
          {!collapsed && currentProject && (
            <div className="px-4 py-4 border-b border-white/10">
              <button
                onClick={() => setShowProjectModal(true)}
                className="w-full flex items-center justify-between bg-white/10 text-white font-semibold rounded-lg px-3 py-2 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {getProjectShortName(currentProject.name || 'Unknown')}
                  </div>
                  <span className="truncate text-xs">{currentProject.name || 'Unknown Project'}</span>
                </div>
                <ChevronDownIcon size={16} />
              </button>
            </div>
          )}

          {/* Accordion Navigation */}
          <nav className="flex-1 py-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                if (item.type === 'link' && item.path) {
                  const Icon = item.icon
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 mx-2 rounded-lg transition-all duration-200 text-sm ${location.pathname === item.path ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                      >
                        <Icon size={18} className="mr-3" />
                        {!collapsed && <span className="font-bold">{item.label}</span>}
                      </Link>
                    </li>
                  )
                }
                // Accordion
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    <button
                      className={`flex items-center w-full px-4 py-2 mx-2 rounded-lg transition-all duration-200 text-white/80 hover:bg-white/10 hover:text-white text-sm ${openAccordion === item.label ? 'bg-white/10 text-white' : ''}`}
                      onClick={() => setOpenAccordion(openAccordion === item.label ? null : item.label)}
                    >
                      <Icon size={18} className="mr-3" />
                      <span className="font-bold">{item.label}</span>
                      <span className="ml-auto">
                        {openAccordion === item.label ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    </button>
                    {/* Accordion Content */}
                    {openAccordion === item.label && !collapsed && item.children && item.children.length > 0 && (
                      <ul className="pl-2 mt-2 space-y-1">
                        {item.children.map((sub) => {
                          const SubIcon = sub.icon
                          if ('children' in sub && sub.children) {
                            // Sub-Accordion
                            return (
                              <li key={sub.label}>
                                <button
                                  className={`flex items-center w-full px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white ${openSub === sub.label ? 'bg-white/10 text-white' : ''}`}
                                  onClick={() => setOpenSub(openSub === sub.label ? null : sub.label)}
                                >
                                  <SubIcon size={18} className="mr-2" />
                                  <span>{sub.label}</span>
                                  <span className="ml-auto">
                                    {openSub === sub.label ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                  </span>
                                </button>
                                {/* Sub-Accordion Content */}
                                {openSub === sub.label && (
                                  <ul className="pl-4 mt-1 space-y-1">
                                    {sub.children.map((func: { label: string; path: string; icon: any }) => (
                                      func.path ? (
                                        <li key={func.path}>
                                          <Link
                                            to={func.path}
                                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 ${location.pathname === func.path ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                                          >
                                            <func.icon size={16} className="mr-2" />
                                            {func.label}
                                          </Link>
                                        </li>
                                      ) : null
                                    ))}
                                  </ul>
                                )}
                              </li>
                            )
                          } else if ('path' in sub && sub.path) {
                            // Direct link item
                            return (
                              <li key={sub.path}>
                                <Link
                                  to={sub.path}
                                  className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 ${location.pathname === sub.path ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                                >
                                  <SubIcon size={16} className="mr-2" />
                                  {sub.label}
                                </Link>
                              </li>
                            )
                          }
                          return null
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>


        </div>
      </aside>

      {/* Project Selection Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-black">Select Project</h3>
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  setProjectSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Search Field */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={projectSearchTerm}
                onChange={(e) => setProjectSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSwitch(project.projectId)}
                  disabled={isLoading}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    project.projectId === currentProject?.id
                      ? 'border-digital-blue bg-digital-blue/10 text-digital-blue'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      project.projectId === currentProject?.id
                        ? 'bg-digital-blue text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {getProjectShortName(project.projectName || 'Unknown')}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-black flex items-center justify-between text-sm">
                        {project.projectName || 'Unknown Project'}
                        {project.projectId === currentProject?.id && (
                          <Check className="w-4 h-4 text-digital-blue" />
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{project.projectDescription || 'No description'}</div>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredProjects.length === 0 && (
                <div className="px-3 py-4 text-center text-gray-500">
                  {projectSearchTerm ? (
                    <>
                      <p className="text-sm">No projects found for "{projectSearchTerm}"</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">No projects available</p>
                      <p className="text-xs mt-1">Contact your administrator to get access to projects</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 