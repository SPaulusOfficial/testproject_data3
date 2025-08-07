import React from 'react'
import { TrendingUp, LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
  color: string
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}) => {
  const colorClasses = {
    'digital-blue': 'bg-digital-blue',
    'open-blue': 'bg-open-blue',
    'deep-blue-2': 'bg-deep-blue-2',
    'mid-blue-1': 'bg-mid-blue-1'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-black">{value}</p>
          <div className="flex items-center mt-2">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">{change}</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-full flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  )
} 