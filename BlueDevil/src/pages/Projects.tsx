import React from 'react'
import { FolderOpen, Plus, Filter, Search } from 'lucide-react'

export const Projects: React.FC = () => {
  const projects = [
    {
      id: '1',
      name: 'Salesforce CPQ Implementation',
      client: 'TechCorp GmbH',
      status: 'active',
      progress: 75,
      agent: 'PreSales Agent',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      budget: '€125,000'
    },
    {
      id: '2',
      name: 'Service Cloud Migration',
      client: 'ServiceMax AG',
      status: 'planning',
      progress: 25,
      agent: 'Solution Design Agent',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      budget: '€85,000'
    },
    {
      id: '3',
      name: 'Marketing Automation Setup',
      client: 'GrowthStart',
      status: 'completed',
      progress: 100,
      agent: 'Implementation Agent',
      startDate: '2023-11-01',
      endDate: '2024-01-31',
      budget: '€65,000'
    },
    {
      id: '4',
      name: 'Data Migration & Integration',
      client: 'DataFlow Solutions',
      status: 'active',
      progress: 60,
      agent: 'Testing Agent',
      startDate: '2024-01-20',
      endDate: '2024-05-15',
      budget: '€95,000'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-black">Projekte</h1>
          <p className="text-gray-600 mt-2">
            Verwalte alle Salesforce-Projekte und deren Fortschritt
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={20} className="mr-2" />
          Neues Projekt
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Projekte durchsuchen..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-open-blue focus:border-transparent w-80"
              />
            </div>
            <button className="btn-ghost">
              <Filter size={16} className="mr-2" />
              Filter
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-open-blue focus:border-transparent">
              <option value="">Alle</option>
              <option value="active">Aktiv</option>
              <option value="planning">Planung</option>
              <option value="completed">Abgeschlossen</option>
              <option value="paused">Pausiert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card p-6 hover:shadow-md transition-shadow">
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
                <button className="btn-ghost text-sm">
                  Details anzeigen
                </button>
                <button className="btn-primary text-sm">
                  Bearbeiten
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 