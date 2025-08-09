import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Menu, Search, LogOut } from 'lucide-react'
import { NotificationBell } from './NotificationBell'

interface HeaderProps {
  onMenuToggle: () => void
}

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Dashboard'
    case '/agents':
      return 'AI Agents'
    case '/projects':
      return 'Projects'
    case '/workflows':
      return 'Workflows'
    case '/settings':
      return 'Settings'
    default:
      return 'Dashboard'
  }
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const pageTitle = getPageTitle(location.pathname)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu and Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus-ring"
          >
            <Menu size={20} />
          </button>
          
          <div>
            <h1 className="text-h3 font-bold text-black">{pageTitle}</h1>
            <p className="text-caption text-gray-600">
              Project Assistant Suite - AI-powered Salesforce Platform
            </p>
          </div>
        </div>

        {/* Right side - Search and User */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-open-blue focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-black">{user.name}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
              
              <button
                onClick={() => navigate('/profile')}
                className="w-8 h-8 bg-digital-blue rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                title="View User Profile"
              >
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0)}
                </span>
              </button>
              
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus-ring"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 