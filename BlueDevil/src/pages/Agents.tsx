import React from 'react'
import { Bot, Settings, Play, Pause, Plus } from 'lucide-react'

export const Agents: React.FC = () => {
  const agents = [
    {
      id: '1',
      name: 'PreSales Agent',
      description: 'Automatisierte PreSales-Analyse und Angebotserstellung',
      status: 'active',
      tasks: 12,
      performance: 95,
      type: 'Langchain + Haystack'
    },
    {
      id: '2',
      name: 'Solution Design Agent',
      description: 'Intelligente Lösungsarchitektur und Datenmodellierung',
      status: 'active',
      tasks: 8,
      performance: 88,
      type: 'Langchain + Qdrant'
    },
    {
      id: '3',
      name: 'Implementation Agent',
      description: 'Automatisierte Implementierung und Konfiguration',
      status: 'idle',
      tasks: 0,
      performance: 92,
      type: 'Langchain + FastAPI'
    },
    {
      id: '4',
      name: 'Testing Agent',
      description: 'Intelligente Testfall-Generierung und -Ausführung',
      status: 'error',
      tasks: 3,
      performance: 76,
      type: 'Langchain + Elasticsearch'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-black">AI-Agenten</h1>
          <p className="text-gray-600 mt-2">
            Verwalte und überwache deine KI-gestützten Agenten für Salesforce-Projekte
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={20} className="mr-2" />
          Neuer Agent
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktive Agenten</p>
              <p className="text-2xl font-bold text-black">2</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Bot size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-black">1</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Bot size={24} className="text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fehler</p>
              <p className="text-2xl font-bold text-black">1</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Bot size={24} className="text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Durchschnitt</p>
              <p className="text-2xl font-bold text-black">88%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-digital-blue rounded-full flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings size={16} />
                </button>
                {agent.status === 'active' ? (
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
            
            <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'active' ? 'bg-green-100 text-green-800' :
                  agent.status === 'idle' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {agent.status === 'active' ? 'Aktiv' :
                   agent.status === 'idle' ? 'Leerlauf' : 'Fehler'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Aufgaben</span>
                <span className="font-medium">{agent.tasks}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Performance</span>
                <span className="font-medium">{agent.performance}%</span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${agent.performance}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 