import React from 'react'
import { GitBranch, Play, Pause, Settings, Plus } from 'lucide-react'

export const Workflows: React.FC = () => {
  const workflows = [
    {
      id: '1',
      name: 'Projekt Setup Workflow',
      description: 'Automatisierte Initialisierung neuer Salesforce-Projekte',
      status: 'running',
      progress: 85,
      steps: 8,
      completedSteps: 7,
      agent: 'PreSales Agent',
      lastRun: '2 Stunden'
    },
    {
      id: '2',
      name: 'Datenanalyse Workflow',
      description: 'Intelligente Analyse von Kundenanforderungen und Datenstrukturen',
      status: 'running',
      progress: 60,
      steps: 12,
      completedSteps: 7,
      agent: 'Solution Design Agent',
      lastRun: '1 Stunde'
    },
    {
      id: '3',
      name: 'Dokumentation Workflow',
      description: 'Automatische Generierung von Projekt-Dokumentation',
      status: 'pending',
      progress: 30,
      steps: 6,
      completedSteps: 2,
      agent: 'Implementation Agent',
      lastRun: '1 Tag'
    },
    {
      id: '4',
      name: 'Testing Workflow',
      description: 'Systematische Testfall-Generierung und -Ausführung',
      status: 'completed',
      progress: 100,
      steps: 10,
      completedSteps: 10,
      agent: 'Testing Agent',
      lastRun: '3 Tage'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-black">Workflows</h1>
          <p className="text-gray-600 mt-2">
            Verwalte automatisierte Workflows für Salesforce-Projekte
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={20} className="mr-2" />
          Neuer Workflow
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Workflows</p>
              <p className="text-2xl font-bold text-black">2</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Play size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wartend</p>
              <p className="text-2xl font-bold text-black">1</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Pause size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
              <p className="text-2xl font-bold text-black">1</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <GitBranch size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Durchschnitt</p>
              <p className="text-2xl font-bold text-black">69%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <GitBranch size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-digital-blue rounded-full flex items-center justify-center">
                  <GitBranch size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">{workflow.name}</h3>
                  <p className="text-sm text-gray-600">{workflow.agent}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings size={16} />
                </button>
                {workflow.status === 'running' ? (
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Pause size={16} />
                  </button>
                ) : (
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Play size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Fortschritt</span>
                  <span className="font-medium">{workflow.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${workflow.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    workflow.status === 'running' ? 'bg-green-100 text-green-800' :
                    workflow.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {workflow.status === 'running' ? 'Läuft' :
                     workflow.status === 'pending' ? 'Wartend' : 'Abgeschlossen'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Schritte:</span>
                  <p className="font-medium">{workflow.completedSteps}/{workflow.steps}</p>
                </div>
                <div>
                  <span className="text-gray-600">Letzter Lauf:</span>
                  <p className="font-medium">{workflow.lastRun}</p>
                </div>
                <div>
                  <span className="text-gray-600">Agent:</span>
                  <p className="font-medium">{workflow.agent}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button className="btn-ghost text-sm">
                  Details anzeigen
                </button>
                <button className="btn-primary text-sm">
                  {workflow.status === 'running' ? 'Pausieren' : 'Starten'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 