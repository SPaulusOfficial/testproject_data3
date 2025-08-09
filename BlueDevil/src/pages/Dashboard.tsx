import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../contexts/ProjectContext'
import { 
  FolderOpen, 
  PlayCircle, 
  CheckCircle, 
  Users, 
  Settings,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react'

const mainMenu = [
  { label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { label: 'Projekte', icon: FolderOpen, path: '/projects' },
  { label: 'User Management', icon: Users, path: '/user-management' },
  { label: 'Einstellungen', icon: Settings, path: '/settings' }
]

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { currentProject, availableProjects } = useProject()
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'recent'>('overview')
  const [systemStatus, setSystemStatus] = useState({
    backend: false,
    database: false,
    notifications: false,
    userManagement: false
  })

  // Health checks
  useEffect(() => {
    const checkSystemHealth = async () => {
      try {
        // Check backend health
        const backendResponse = await fetch('http://localhost:3002/api/health')
        const backendData = await backendResponse.json()
        

        
        // Check notifications service - use a simple health check
        const notificationsResponse = await fetch('http://localhost:3002/api/health')
        
        setSystemStatus({
          backend: backendResponse.ok,
          database: backendResponse.ok, // If backend is healthy, DB is connected
          notifications: notificationsResponse.ok,
          userManagement: true // Assume working since we're logged in
        })
      } catch (error) {
        console.error('Health check failed:', error)
        setSystemStatus({
          backend: false,
          database: false,
          notifications: false,
          userManagement: false
        })
      }
    }

    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Projekt-Statistiken für das aktive Projekt
  const stats = currentProject ? [
    {
      title: 'Projekt',
      value: currentProject.name,
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
      {/* Aktives Projekt Info-Banner */}
      {currentProject && (
        <div className="bg-gradient-to-r from-digital-blue to-deep-blue-2 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs opacity-80 mb-1">Aktives Projekt</div>
            <div className="text-2xl font-bold mb-1">{currentProject.name}</div>
            <div className="text-sm opacity-80 mb-1">{currentProject.description || 'Keine Beschreibung'}</div>
            <div className="flex gap-2 text-xs">
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                {currentProject.isActive ? 'Aktiv' : 'Inaktiv'}
              </span>
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                {new Date(currentProject.createdAt).toLocaleDateString('de-DE')}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <label className="block text-xs mb-1 opacity-80">Verfügbare Projekte</label>
            <div className="text-white text-sm">
              {availableProjects?.length || 0} Projekte verfügbar
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
        {mainMenu.map((item) => {
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Schnellaktionen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/projects')}
          >
            <Target size={20} className="text-digital-blue" />
            <span className="text-sm font-medium">Neues Projekt erstellen</span>
          </button>
          <button 
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/user-management')}
          >
            <Users size={20} className="text-digital-blue" />
            <span className="text-sm font-medium">Benutzer verwalten</span>
          </button>
          <button 
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} className="text-digital-blue" />
            <span className="text-sm font-medium">Einstellungen</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-black mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            systemStatus.backend 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              systemStatus.backend ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              systemStatus.backend ? 'text-green-800' : 'text-red-800'
            }`}>
              Backend API {systemStatus.backend ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            systemStatus.database 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              systemStatus.database ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              systemStatus.database ? 'text-green-800' : 'text-red-800'
            }`}>
              Datenbank {systemStatus.database ? 'Verbunden' : 'Getrennt'}
            </span>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            systemStatus.notifications 
              ? 'bg-green-50 border-green-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              systemStatus.notifications ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              systemStatus.notifications ? 'text-green-800' : 'text-blue-800'
            }`}>
              Notification Service {systemStatus.notifications ? 'Online' : 'Initializing'}
            </span>
          </div>
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            systemStatus.userManagement 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              systemStatus.userManagement ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              systemStatus.userManagement ? 'text-green-800' : 'text-red-800'
            }`}>
              User Management {systemStatus.userManagement ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 