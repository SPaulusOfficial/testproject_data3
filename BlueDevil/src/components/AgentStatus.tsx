import React from 'react'
import { Bot, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface AgentStatusProps {
  name: string
  status: 'active' | 'idle' | 'error' | 'offline'
  tasks: number
}

const statusConfig = {
  active: { 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    icon: CheckCircle,
    label: 'Aktiv'
  },
  idle: { 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    icon: Clock,
    label: 'Leerlauf'
  },
  error: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    icon: AlertCircle,
    label: 'Fehler'
  },
  offline: { 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-50',
    icon: Bot,
    label: 'Offline'
  }
}

export const AgentStatus: React.FC<AgentStatusProps> = ({
  name,
  status,
  tasks
}) => {
  const statusInfo = statusConfig[status]
  const Icon = statusInfo.icon

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 ${statusInfo.bgColor} rounded-full flex items-center justify-center`}>
          <Icon size={16} className={statusInfo.color} />
        </div>
        <div>
          <p className="text-sm font-medium text-black">{name}</p>
          <p className="text-xs text-gray-600">{statusInfo.label}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-black">{tasks}</p>
        <p className="text-xs text-gray-600">Aufgaben</p>
      </div>
    </div>
  )
} 