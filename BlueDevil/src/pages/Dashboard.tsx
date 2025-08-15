import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../contexts/ProjectContext'
import { usePermissions } from '../hooks/usePermissions'
import { 
  FolderOpen, 
  PlayCircle, 
  CheckCircle, 
  Users, 
  Settings,
  BarChart3
} from 'lucide-react'

const mainMenu = [
  { label: 'Dashboard', icon: BarChart3, path: '/dashboard', permission: null }, // Dashboard ist immer verfügbar
  { label: 'Projekte', icon: FolderOpen, path: '/projects', permission: 'ProjectManagement' },
  { label: 'User Management', icon: Users, path: '/user-management', permission: 'UserManagement' },
  { label: 'Einstellungen', icon: Settings, path: '/settings', permission: 'SystemConfiguration' }
]

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { currentProject, availableProjects } = useProject()
  const { hasPermission } = usePermissions()
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'recent'>('overview')

  // Filter menu items based on permissions
  const visibleMenuItems = mainMenu.filter(item => {
    if (item.permission === null) return true // Dashboard ist immer sichtbar
    return hasPermission(item.permission)
  })

  // Projekt-Statistiken für das aktive Projekt
  const stats = currentProject ? [
    {
      title: 'Projekt',
      value: currentProject.name || 'Unnamed Project',
      icon: FolderOpen,
      color: 'digital-blue'
    },
    {
      title: 'Beschreibung',
      value: currentProject.description || 'Keine Beschreibung',
      icon: PlayCircle,
      color: 'green-500'
    },
    {
      title: 'Erstellt',
      value: new Date(currentProject.createdAt).toLocaleDateString('de-DE'),
      icon: CheckCircle,
      color: 'blue-500'
    },
    {
      title: 'Aktualisiert',
      value: new Date(currentProject.updatedAt).toLocaleDateString('de-DE'),
      icon: CheckCircle,
      color: 'gray-500'
    }
  ] : []

  return (
    <div className="space-y-8">
      {/* Projekt-Kontext Banner */}
      {currentProject ? (
        <div className="bg-gradient-to-r from-digital-blue to-deep-blue-2 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div className="text-xs opacity-80">Aktiver Projekt-Kontext</div>
              </div>
              <div className="text-2xl font-bold mb-1">{currentProject.name || 'Unnamed Project'}</div>
              <div className="text-sm opacity-80 mb-3">{currentProject.description || 'Keine Beschreibung'}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                  {currentProject.isActive ? 'Aktiv' : 'Inaktiv'}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                  Erstellt: {new Date(currentProject.createdAt).toLocaleDateString('de-DE')}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                  {availableProjects?.length || 0} Projekte verfügbar
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6">
              <div className="text-right">
                <div className="text-xs opacity-80 mb-1">Projekt-Kontext geladen</div>
                <div className="text-sm font-medium">Alle Agenten und Knowledge-Basen verwenden diesen Kontext</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="text-xs opacity-80">Kein Projekt-Kontext</div>
              </div>
              <div className="text-xl font-bold mb-1">Projekt auswählen erforderlich</div>
              <div className="text-sm opacity-80">Wählen Sie ein Projekt aus, um den Kontext für Agenten und Knowledge-Basen zu laden</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-80 mb-1">Verfügbare Projekte</div>
              <div className="text-2xl font-bold">{availableProjects?.length || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiken für das aktive Projekt */}
      {currentProject && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}/10`}>
                  <Icon size={28} className={`text-${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.title}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon
          return (
            <div 
              key={item.label} 
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-digital-blue/10">
                  <Icon size={24} className="text-digital-blue" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-black">{item.label}</div>
                  <div className="text-gray-600 text-sm">Zugriff auf {item.label.toLowerCase()}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>




    </div>
  )
} 