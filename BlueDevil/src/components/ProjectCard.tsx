import React from 'react'
import { Clock, Bot } from 'lucide-react'

interface ProjectCardProps {
  id: string
  name: string
  client: string
  status: 'active' | 'planning' | 'completed' | 'paused'
  progress: number
  agent: string
  lastUpdate: string
}

const statusConfig = {
  active: { color: 'bg-green-500', label: 'Aktiv' },
  planning: { color: 'bg-blue-500', label: 'Planung' },
  completed: { color: 'bg-gray-500', label: 'Abgeschlossen' },
  paused: { color: 'bg-yellow-500', label: 'Pausiert' }
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  client,
  status,
  progress,
  agent,
  lastUpdate
}) => {
  const statusInfo = statusConfig[status]

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-black mb-1">{name}</h3>
          <p className="text-sm text-gray-600">{client}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 ${statusInfo.color} rounded-full`}></div>
          <span className="text-xs text-gray-600">{statusInfo.label}</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Fortschritt</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <Bot size={14} />
          <span>{agent}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock size={14} />
          <span>{lastUpdate}</span>
        </div>
      </div>
    </div>
  )
} 