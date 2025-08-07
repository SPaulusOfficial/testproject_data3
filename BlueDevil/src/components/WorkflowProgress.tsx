import React from 'react'
import { Play, Pause, CheckCircle } from 'lucide-react'

interface WorkflowProgressProps {
  name: string
  progress: number
  status: 'running' | 'pending' | 'completed' | 'paused'
}

const statusConfig = {
  running: { 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    icon: Play,
    label: 'Läuft'
  },
  pending: { 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    icon: Pause,
    label: 'Wartend'
  },
  completed: { 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    icon: CheckCircle,
    label: 'Abgeschlossen'
  },
  paused: { 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    icon: Pause,
    label: 'Pausiert'
  }
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  name,
  progress,
  status
}) => {
  const statusInfo = statusConfig[status]
  const Icon = statusInfo.icon

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-6 h-6 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
            <Icon size={12} className={statusInfo.color} />
          </div>
          <span className="text-sm font-medium text-black">{name}</span>
        </div>
        <span className="text-xs text-gray-600">{progress}%</span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{statusInfo.label}</span>
        <span>{progress}/100</span>
      </div>
    </div>
  )
} 