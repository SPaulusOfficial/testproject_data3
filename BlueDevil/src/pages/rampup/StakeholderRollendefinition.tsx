import React, { useState } from 'react'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'

export const StakeholderRollendefinition: React.FC = () => {
  const {
    stakeholders,
    roles,
    addStakeholder,
    updateStakeholder,
    deleteStakeholder,
    addRole,
    updateRole,
    deleteRole,
    getTotalFTE,
    getFTEByType,
    getStakeholdersByRole,
    runAIAnalysis
  } = useProject()

  const [activeTab, setActiveTab] = useState<'stakeholders' | 'roles' | 'staffing' | 'analysis'>('stakeholders')
  const [showAddStakeholder, setShowAddStakeholder] = useState(false)
  const [showAddRole, setShowAddRole] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterInfluence, setFilterInfluence] = useState<string>('all')
  const [filterSupport, setFilterSupport] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.organization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesInfluence = filterInfluence === 'all' || stakeholder.influence === filterInfluence
    const matchesSupport = filterSupport === 'all' || stakeholder.support === filterSupport
    return matchesSearch && matchesInfluence && matchesSupport
  })

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSupportColor = (support: string) => {
    switch (support) {
      case 'champion': return 'bg-green-100 text-green-800 border-green-200'
      case 'supporter': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'skeptic': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'blocker': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSupportIcon = (support: string) => {
    switch (support) {
      case 'champion': return <CheckCircle size={16} />
      case 'supporter': return <UserCheck size={16} />
      case 'neutral': return <Clock size={16} />
      case 'skeptic': return <AlertCircle size={16} />
      case 'blocker': return <UserX size={16} />
      default: return <UserCheck size={16} />
    }
  }

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      await runAIAnalysis()
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-off-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users size={32} className="text-digital-blue" />
            <div>
              <h1 className="text-h2 font-bold text-black">Stakeholder- & Rollendefinition</h1>
              <p className="text-gray-600">Definiere und analysiere Stakeholder und Rollen für dein Projekt</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors disabled:opacity-50"
            >
              <Brain size={16} />
              <span>{isAnalyzing ? 'Analysiere...' : 'KI-Analyse'}</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-open-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {[
            { id: 'stakeholders', label: 'Stakeholder', icon: Users },
            { id: 'roles', label: 'Rollen', icon: UserPlus },
            { id: 'staffing', label: 'Staffing', icon: Building2 },
            { id: 'analysis', label: 'Analyse', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-digital-blue text-digital-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'stakeholders' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Stakeholder suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                  />
                </div>
                <select
                  value={filterInfluence}
                  onChange={(e) => setFilterInfluence(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                >
                  <option value="all">Alle Einflussstufen</option>
                  <option value="high">Hoch</option>
                  <option value="medium">Mittel</option>
                  <option value="low">Niedrig</option>
                </select>
                <select
                  value={filterSupport}
                  onChange={(e) => setFilterSupport(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                >
                  <option value="all">Alle Unterstützungsgrade</option>
                  <option value="champion">Champion</option>
                  <option value="supporter">Unterstützer</option>
                  <option value="neutral">Neutral</option>
                  <option value="skeptic">Skeptiker</option>
                  <option value="blocker">Blockierer</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddStakeholder(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
              >
                <Plus size={16} />
                <span>Stakeholder hinzufügen</span>
              </button>
            </div>

            {/* Stakeholder Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black">{stakeholder.name}</h3>
                      <p className="text-gray-600">{stakeholder.role}</p>
                      <p className="text-sm text-gray-500">{stakeholder.organization}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-digital-blue">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getInfluenceColor(stakeholder.influence)}`}>
                        {stakeholder.influence === 'high' ? 'Hoch' : stakeholder.influence === 'medium' ? 'Mittel' : 'Niedrig'} Einfluss
                      </span>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getSupportColor(stakeholder.support)}`}>
                        {getSupportIcon(stakeholder.support)}
                        <span>
                          {stakeholder.support === 'champion' ? 'Champion' : 
                           stakeholder.support === 'supporter' ? 'Unterstützer' : 
                           stakeholder.support === 'neutral' ? 'Neutral' : 
                           stakeholder.support === 'skeptic' ? 'Skeptiker' : 'Blockierer'}
                        </span>
                      </div>
                    </div>

                    {stakeholder.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail size={14} />
                        <span>{stakeholder.email}</span>
                      </div>
                    )}

                    {stakeholder.phone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{stakeholder.phone}</span>
                      </div>
                    )}

                    {stakeholder.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{stakeholder.location}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <h4 className="text-sm font-semibold text-black mb-1">Verantwortlichkeiten:</h4>
                      <div className="flex flex-wrap gap-1">
                        {stakeholder.responsibilities.map((resp, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {resp}
                          </span>
                        ))}
                      </div>
                    </div>

                    {stakeholder.notes && (
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold text-black mb-1">Notizen:</h4>
                        <p className="text-sm text-gray-600">{stakeholder.notes}</p>
                      </div>
                    )}

                    {stakeholder.nextContact && (
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold text-black mb-1">Nächster Kontakt:</h4>
                        <p className="text-sm text-gray-600">
                          {stakeholder.nextContact.toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Projektrollen</h2>
              <button
                onClick={() => setShowAddRole(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
              >
                <Plus size={16} />
                <span>Rolle hinzufügen</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black">{role.title}</h3>
                      <p className="text-gray-600">{role.department}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {role.isKeyRole && (
                          <span className="px-2 py-1 bg-digital-blue text-white text-xs rounded">
                            Schlüsselrolle
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded ${
                          role.resourceType === 'internal' ? 'bg-blue-100 text-blue-800' :
                          role.resourceType === 'external' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {role.resourceType === 'internal' ? 'Intern' : 
                           role.resourceType === 'external' ? 'Extern' : 'Kunde'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-digital-blue">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-black">FTE:</span>
                        <span className="ml-2 text-gray-600">{role.fte}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-black">Verfügbarkeit:</span>
                        <span className="ml-2 text-gray-600">
                          {role.availability === 'full-time' ? 'Vollzeit' : 
                           role.availability === 'part-time' ? 'Teilzeit' : 'On-Demand'}
                        </span>
                      </div>
                      {role.assignedPerson && (
                        <div className="col-span-2">
                          <span className="font-semibold text-black">Zugewiesen:</span>
                          <span className="ml-2 text-gray-600">{role.assignedPerson}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-black mb-1">Projektphasen:</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.projectPhase.map((phase, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {phase}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-black mb-1">Verantwortlichkeiten:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {role.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-digital-blue rounded-full"></div>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-black mb-1">Erforderliche Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.requiredSkills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-open-blue text-white text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {role.reportingTo && (
                      <div>
                        <h4 className="text-sm font-semibold text-black mb-1">Berichtet an:</h4>
                        <p className="text-sm text-gray-600">{role.reportingTo}</p>
                      </div>
                    )}

                    {role.stakeholders.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-black mb-1">Zugewiesene Stakeholder:</h4>
                        <div className="flex flex-wrap gap-1">
                          {role.stakeholders.map((stakeholderId) => {
                            const stakeholder = stakeholders.find(s => s.id === stakeholderId)
                            return stakeholder ? (
                              <span key={stakeholderId} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {stakeholder.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'staffing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">Staffing & Ressourcenplanung</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors">
                <Plus size={16} />
                <span>Ressource hinzufügen</span>
              </button>
            </div>

            {/* Staffing Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Ressourcen-Übersicht</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gesamt FTE:</span>
                    <span className="text-sm font-semibold">{getTotalFTE().toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Interne FTE:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {getFTEByType('internal').toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kunden FTE:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {getFTEByType('customer').toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Externe FTE:</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {getFTEByType('external').toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Phasen-Verteilung</h3>
                <div className="space-y-3">
                  {['Kickoff', 'Architecture', 'Build', 'Test', 'Rollout'].map(phase => {
                    const phaseRoles = roles.filter(r => r.projectPhase.includes(phase))
                    const totalFte = phaseRoles.reduce((sum, role) => sum + role.fte, 0)
                    return (
                      <div key={phase} className="flex justify-between">
                        <span className="text-sm text-gray-600">{phase}:</span>
                        <span className="text-sm font-semibold">{totalFte.toFixed(1)} FTE</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Verfügbarkeit</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Vollzeit:</span>
                    <span className="text-sm font-semibold">
                      {roles.filter(r => r.availability === 'full-time').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Teilzeit:</span>
                    <span className="text-sm font-semibold">
                      {roles.filter(r => r.availability === 'part-time').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">On-Demand:</span>
                    <span className="text-sm font-semibold">
                      {roles.filter(r => r.availability === 'on-demand').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Staffing Matrix */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Staffing Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold">Rolle</th>
                      <th className="text-left py-2 font-semibold">Typ</th>
                      <th className="text-left py-2 font-semibold">FTE</th>
                      <th className="text-left py-2 font-semibold">Zeitraum</th>
                      <th className="text-left py-2 font-semibold">Phasen</th>
                      <th className="text-left py-2 font-semibold">Zugewiesen</th>
                      <th className="text-left py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="border-b border-gray-100">
                        <td className="py-2">
                          <div>
                            <div className="font-medium">{role.title}</div>
                            <div className="text-xs text-gray-500">{role.department}</div>
                          </div>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            role.resourceType === 'internal' ? 'bg-blue-100 text-blue-800' :
                            role.resourceType === 'external' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {role.resourceType === 'internal' ? 'Intern' : 
                             role.resourceType === 'external' ? 'Extern' : 'Kunde'}
                          </span>
                        </td>
                        <td className="py-2 font-medium">{role.fte}</td>
                        <td className="py-2 text-xs">
                          {role.startDate && role.endDate ? (
                            <div>
                              <div>{new Date(role.startDate).toLocaleDateString('de-DE')}</div>
                              <div>{new Date(role.endDate).toLocaleDateString('de-DE')}</div>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="py-2">
                          <div className="flex flex-wrap gap-1">
                            {role.projectPhase.map((phase, index) => (
                              <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                {phase}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2">
                          {role.assignedPerson ? (
                            <span className="text-green-600 font-medium">{role.assignedPerson}</span>
                          ) : (
                            <span className="text-red-600">Nicht zugewiesen</span>
                          )}
                        </td>
                        <td className="py-2">
                          {role.assignedPerson ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Besetzt</span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Offen</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stakeholder Influence Matrix */}
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Stakeholder Influence Matrix</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['high', 'medium', 'low'].map((influence) => (
                    <div key={influence} className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700 capitalize">
                        {influence === 'high' ? 'Hoch' : influence === 'medium' ? 'Mittel' : 'Niedrig'} Einfluss
                      </h4>
                      <div className="space-y-2">
                        {stakeholders
                          .filter(s => s.influence === influence)
                          .map(stakeholder => (
                            <div key={stakeholder.id} className="p-2 bg-gray-50 rounded border">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{stakeholder.name}</span>
                                <span className={`px-2 py-1 rounded text-xs ${getSupportColor(stakeholder.support)}`}>
                                  {stakeholder.support === 'champion' ? 'Champion' : 
                                   stakeholder.support === 'supporter' ? 'Unterstützer' : 
                                   stakeholder.support === 'neutral' ? 'Neutral' : 
                                   stakeholder.support === 'skeptic' ? 'Skeptiker' : 'Blockierer'}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Schlüsselmetriken</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gesamt Stakeholder:</span>
                      <span className="text-sm font-semibold">{stakeholders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Champions:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {stakeholders.filter(s => s.support === 'champion').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Blockierer:</span>
                      <span className="text-sm font-semibold text-red-600">
                        {stakeholders.filter(s => s.support === 'blocker').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Schlüsselrollen:</span>
                      <span className="text-sm font-semibold text-digital-blue">
                        {roles.filter(r => r.isKeyRole).length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">KI-Empfehlungen</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="font-semibold text-blue-800 mb-1">Fokus auf Champions</h4>
                      <p className="text-blue-700">Nutze die Champions als Multiplikatoren für die Projektkommunikation.</p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h4 className="font-semibold text-yellow-800 mb-1">Skeptiker einbeziehen</h4>
                      <p className="text-yellow-700">Lade Skeptiker zu frühen Workshops ein, um Bedenken zu adressieren.</p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <h4 className="font-semibold text-green-800 mb-1">Regelmäßige Updates</h4>
                      <p className="text-green-700">Plane wöchentliche Updates für alle Stakeholder mit hohem Einfluss.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 