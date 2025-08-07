import React from 'react'
import { Settings as SettingsIcon, Shield, Database, Bell, User, Key } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const settingsSections = [
    {
      id: 'general',
      title: 'Allgemein',
      icon: SettingsIcon,
      description: 'Grundlegende Systemeinstellungen'
    },
    {
      id: 'security',
      title: 'Sicherheit',
      icon: Shield,
      description: 'Authentifizierung und Zugriffskontrolle'
    },
    {
      id: 'data',
      title: 'Datenverwaltung',
      icon: Database,
      description: 'DSGVO-Compliance und Datenhaltung'
    },
    {
      id: 'notifications',
      title: 'Benachrichtigungen',
      icon: Bell,
      description: 'E-Mail und Push-Benachrichtigungen'
    },
    {
      id: 'users',
      title: 'Benutzer',
      icon: User,
      description: 'Team-Verwaltung und Rollen'
    },
    {
      id: 'api',
      title: 'API & Integration',
      icon: Key,
      description: 'Externe Schnittstellen und Webhooks'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-h2 font-bold text-black">Einstellungen</h1>
        <p className="text-gray-600 mt-2">
          Konfiguriere deine BlueDevil-Plattform nach deinen Anforderungen
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.id} className="card p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-digital-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                  <button className="btn-ghost text-sm">
                    Konfigurieren
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Settings */}
      <div className="card p-6">
        <h2 className="text-h3 font-bold text-black mb-6">Schnelleinstellungen</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI-Agenten</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Aktiv</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Workflow Engine</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Datenbank</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Verbunden</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monitoring</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Aktiv</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Sicherheit</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">OAuth2/OIDC</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Aktiviert</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vault Integration</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Verbunden</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">DSGVO-Compliance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Konform</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Anonymisierung</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Aktiv</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card p-6">
        <h2 className="text-h3 font-bold text-black mb-6">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Version</h4>
            <p className="text-black">BlueDevil v1.0.0</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Build</h4>
            <p className="text-black">2024.01.15.001</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Lizenz</h4>
            <p className="text-black">Open Source</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Technologie</h4>
            <p className="text-black">React + TypeScript + FastAPI</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">KI-Framework</h4>
            <p className="text-black">Langchain + Haystack</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Datenbank</h4>
            <p className="text-black">PostgreSQL + Redis</p>
          </div>
        </div>
      </div>
    </div>
  )
} 