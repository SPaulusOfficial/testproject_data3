import React, { useState } from 'react'
import {
  FolderOpen,
  Plus,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from 'lucide-react'
import { ProjectCard } from '@/components/ProjectCard'
import { useProject } from '@/contexts/ProjectContext'
import { NotificationDemo } from '@/components/NotificationDemo'

const TABS = [
  { key: 'all', label: 'Alle Projekte' },
  { key: 'active', label: 'Aktiv' },
  { key: 'planning', label: 'Planung' },
  { key: 'completed', label: 'Abgeschlossen' }
]

export const Dashboard: React.FC = () => {
  const { activeProjectId, setActiveProjectId, projects } = useProject()
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'planning' | 'completed'>('all')
  const [search, setSearch] = useState('')

  // Aktives Projekt-Objekt
  const activeProject = projects.find(p => p.id === activeProjectId)

  // Filter nach Tab und Suche (nur für Projektliste unten, nicht für Fokus oben)
  const filteredProjects = projects.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Projekt-Statistiken für das aktive Projekt (Demo: nur 1 Projekt)
  const stats = activeProject ? [
    {
      title: 'Status',
      value: activeProject.status === 'active' ? 'Aktiv' : activeProject.status === 'planning' ? 'Planung' : activeProject.status === 'completed' ? 'Abgeschlossen' : 'Pausiert',
      icon: FolderOpen,
      color: 'digital-blue'
    },
    {
      title: 'Fortschritt',
      value: `${activeProject.progress}%`,
      icon: PlayCircle,
      color: 'green-500'
    },
    {
      title: 'Budget',
      value: activeProject.budget,
      icon: CheckCircle,
      color: 'blue-500'
    },
    {
      title: 'Agent',
      value: activeProject.agent,
      icon: CheckCircle,
      color: 'gray-500'
    }
  ] : []

  return (
    <div className="space-y-8">
      {/* Aktives Projekt Info-Banner */}
      {activeProject && (
        <div className="bg-gradient-to-r from-digital-blue to-deep-blue-2 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs opacity-80 mb-1">Aktives Projekt</div>
            <div className="text-2xl font-bold mb-1">{activeProject.name}</div>
            <div className="text-sm opacity-80 mb-1">{activeProject.client}</div>
            <div className="flex gap-2 text-xs">
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                {activeProject.status === 'active' ? 'Aktiv' : activeProject.status === 'planning' ? 'Planung' : activeProject.status === 'completed' ? 'Abgeschlossen' : 'Pausiert'}
              </span>
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                {activeProject.budget}
              </span>
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white/80">
                {activeProject.startDate} - {activeProject.endDate}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <label className="block text-xs mb-1 opacity-80">Projekt wechseln</label>
            <select
              value={activeProjectId || ''}
              onChange={e => setActiveProjectId(e.target.value)}
              className="bg-white/10 text-white font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-open-blue"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="text-black">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Statistiken für das aktive Projekt */}
      {activeProject && (
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

      {/* Projektliste (optional, z.B. für Wechsel oder Übersicht) */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex gap-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`px-4 py-2 -mb-px border-b-2 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'border-digital-blue text-digital-blue' : 'border-transparent text-gray-500 hover:text-digital-blue'}`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Projekte durchsuchen..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-digital-blue focus:border-transparent w-80"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            Keine Projekte gefunden.
          </div>
        ) : (
          filteredProjects.map(project => (
            <div key={project.id} className={`card p-6 hover:shadow-md transition-shadow ${project.id === activeProjectId ? 'ring-2 ring-digital-blue' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-digital-blue rounded-full flex items-center justify-center">
                    <FolderOpen size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.client}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status === 'active' ? 'Aktiv' :
                  project.status === 'planning' ? 'Planung' :
                  project.status === 'completed' ? 'Abgeschlossen' : 'Pausiert'}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Fortschritt</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Agent:</span>
                    <p className="font-medium">{project.agent}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget:</span>
                    <p className="font-medium">{project.budget}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Start:</span>
                    <p className="font-medium">{new Date(project.startDate).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Ende:</span>
                    <p className="font-medium">{new Date(project.endDate).toLocaleDateString('de-DE')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button className="btn-ghost text-sm" onClick={() => setActiveProjectId(project.id)}>
                    {project.id === activeProjectId ? 'Im Fokus' : 'Fokussieren'}
                  </button>
                  <button className="btn-primary text-sm">Bearbeiten</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Demo */}
      <div className="mt-8">
        <NotificationDemo />
      </div>

      {/* Schnellaktionen */}
      <div className="card p-6 mt-8">
        <h3 className="text-h3 font-bold mb-4">Schnellaktionen</h3>
        <div className="space-y-3">
          <button className="w-full btn-primary">
            <Plus size={16} className="mr-2" />
            Neues Projekt erstellen
          </button>
          <button className="w-full btn-ghost">
            <Filter size={16} className="mr-2" />
            Projekte filtern
          </button>
          <button className="w-full btn-ghost">
            <Search size={16} className="mr-2" />
            Projekt suchen
          </button>
        </div>
      </div>
    </div>
  )
} 