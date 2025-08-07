import React, { useState } from 'react'
import { Calendar, Users, Target, Clock, Plus, Edit, Trash2, Save, CheckCircle, AlertCircle, PlayCircle, Building2, UserPlus, Brain } from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'

export const ProjektplanSketch: React.FC = () => {
  const {
    phases,
    milestones,
    goals,
    staffingRequirements,
    addPhase,
    updatePhase,
    deletePhase,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addGoal,
    updateGoal,
    deleteGoal,
    addStaffingRequirement,
    updateStaffingRequirement,
    deleteStaffingRequirement,
    getTotalFTE,
    getFTEByType,
    getFTEByPhase,
    getRolesByPhase,
    runAIAnalysis
  } = useProject()

  const [activeTab, setActiveTab] = useState<'goals' | 'iterations' | 'resources' | 'milestones' | 'staffing'>('goals')
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState<'goal' | 'iteration' | 'resource' | 'milestone'>('goal')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className="text-green-500" />
      case 'in-progress':
      case 'active':
        return <PlayCircle size={14} className="text-blue-500" />
      case 'planned':
      case 'not-started':
        return <AlertCircle size={14} className="text-gray-500" />
      case 'delayed':
        return <AlertCircle size={14} className="text-red-500" />
      default:
        return <AlertCircle size={14} className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'planned':
      case 'not-started':
        return 'bg-gray-100 text-gray-800'
      case 'delayed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddItem = (type: 'goal' | 'iteration' | 'resource' | 'milestone') => {
    setModalType(type)
    setShowAddModal(true)
  }

  const handleAIAnalysis = async () => {
    try {
      await runAIAnalysis()
    } catch (error) {
      console.error('KI-Analyse fehlgeschlagen:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-digital-blue" />
          <h1 className="text-xl font-bold">Projektplan-Sketch</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAIAnalysis}
            className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
          >
            <Brain size={16} />
            <span>KI-Ressourcenanalyse</span>
          </button>
        </div>
      </div>

      {/* Compact Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-6">
          {[
            { key: 'goals', label: 'Projektziele', icon: Target },
            { key: 'iterations', label: 'Iterationen', icon: Clock },
            { key: 'resources', label: 'Ressourcen', icon: Users },
            { key: 'milestones', label: 'Meilensteine', icon: Calendar },
            { key: 'staffing', label: 'Staffing', icon: Building2 }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'border-digital-blue text-digital-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Projektziele</h2>
            <button
              onClick={() => handleAddItem('goal')}
              className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
            >
              <Plus size={16} />
              <span>Ziel hinzufügen</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-black">{goal.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(goal.priority)}`}>
                    {goal.priority === 'high' ? 'Hoch' : goal.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Ziel: {goal.targetDate}</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(goal.status)}
                    <span className={getStatusColor(goal.status)}>
                      {goal.status === 'not-started' ? 'Nicht gestartet' : 
                       goal.status === 'in-progress' ? 'In Bearbeitung' : 'Abgeschlossen'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Verantwortlich: </span>
                  <span className="text-sm font-medium">{goal.responsible}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'iterations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Iterationen</h2>
            <button
              onClick={() => handleAddItem('iteration')}
              className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
            >
              <Plus size={16} />
              <span>Iteration hinzufügen</span>
            </button>
          </div>
          <div className="space-y-4">
            {phases.map((phase) => (
              <div key={phase.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{phase.name}</h3>
                    <p className="text-sm text-gray-600">
                      {phase.startDate} - {phase.endDate}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(phase.status)}
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(phase.status)}`}>
                      {phase.status === 'planned' ? 'Geplant' : 
                       phase.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-black mb-2">Beschreibung</h4>
                    <p className="text-sm text-gray-600 mb-4">{phase.description}</p>
                    <h4 className="font-semibold text-black mb-2">Deliverables</h4>
                    <ul className="space-y-1">
                      {phase.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-1 h-1 bg-digital-blue rounded-full"></div>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-black mb-2">Staffing ({phase.requiredRoles.length} Rollen)</h4>
                    <div className="space-y-2">
                      {phase.requiredRoles.map((roleId, index) => {
                        const role = getRolesByPhase(phase.id).find(r => r.id === roleId)
                        if (!role) return null
                        
                        const staffingReq = staffingRequirements.find(sr => sr.roleId === roleId && sr.phaseId === phase.id)
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <div className="text-sm font-medium">{role.title}</div>
                              <div className="text-xs text-gray-500">{staffingReq?.fte || role.fte} FTE</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                role.resourceType === 'internal' ? 'bg-blue-100 text-blue-800' :
                                role.resourceType === 'external' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {role.resourceType === 'internal' ? 'Intern' : 
                                 role.resourceType === 'external' ? 'Extern' : 'Kunde'}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                staffingReq?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                staffingReq?.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {staffingReq?.status === 'confirmed' ? 'Bestätigt' : 
                                 staffingReq?.status === 'assigned' ? 'Zugewiesen' : 'Offen'}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ressourcen</h2>
            <button
              onClick={() => handleAddItem('resource')}
              className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
            >
              <Plus size={16} />
              <span>Ressource hinzufügen</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffingRequirements.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-black">{resource.roleName}</h3>
                    <p className="text-sm text-gray-600">{resource.assignedPerson || 'Nicht zugewiesen'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    resource.resourceType === 'internal' ? 'bg-blue-100 text-blue-800' :
                    resource.resourceType === 'external' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {resource.fte} FTE {resource.resourceType === 'internal' ? 'Intern' : 
                     resource.resourceType === 'external' ? 'Extern' : 'Kunde'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500">
                    {new Date(resource.startDate).toLocaleDateString('de-DE')} - {new Date(resource.endDate).toLocaleDateString('de-DE')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      resource.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      resource.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {resource.status === 'confirmed' ? 'Bestätigt' : 
                       resource.status === 'assigned' ? 'Zugewiesen' : 'Offen'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Meilensteine</h2>
            <button
              onClick={() => handleAddItem('milestone')}
              className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
            >
              <Plus size={16} />
              <span>Meilenstein hinzufügen</span>
            </button>
          </div>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-black">{milestone.name}</h3>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                    <p className="text-sm text-gray-500 mt-1">Datum: {milestone.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(milestone.status)}
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(milestone.status)}`}>
                      {milestone.status === 'planned' ? 'Geplant' : 
                       milestone.status === 'in-progress' ? 'In Bearbeitung' : 
                       milestone.status === 'completed' ? 'Abgeschlossen' : 'Verzögert'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-black mb-2">Deliverables</h4>
                    <ul className="space-y-1">
                      {milestone.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-1 h-1 bg-digital-blue rounded-full"></div>
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-black mb-2">Benötigte Rollen ({milestone.requiredRoles.length})</h4>
                    <div className="space-y-2">
                      {milestone.requiredRoles.map((roleId, index) => {
                        const role = getRolesByPhase(milestone.id).find(r => r.id === roleId)
                        return (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <UserPlus size={16} className="text-gray-400" />
                            <span className="text-sm">{role?.title || 'Unbekannte Rolle'}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'staffing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Staffing & Ressourcenplanung</h2>
            <button className="flex items-center space-x-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors">
              <Plus size={16} />
              <span>Ressource zuweisen</span>
            </button>
          </div>

          {/* Staffing Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Projekt-Übersicht</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gesamt FTE:</span>
                  <span className="text-sm font-semibold">
                    {getTotalFTE().toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Aktive Phasen:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {phases.filter(phase => phase.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Offene Rollen:</span>
                  <span className="text-sm font-semibold text-red-600">
                    {staffingRequirements.filter(req => req.status === 'open').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Ressourcen-Verteilung</h3>
              <div className="space-y-3">
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
              <h3 className="text-lg font-semibold text-black mb-4">Status-Verteilung</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bestätigt:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {staffingRequirements.filter(req => req.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Zugewiesen:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {staffingRequirements.filter(req => req.status === 'assigned').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Offen:</span>
                  <span className="text-sm font-semibold text-red-600">
                    {staffingRequirements.filter(req => req.status === 'open').length}
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
                    <th className="text-left py-2 font-semibold">Phase</th>
                    <th className="text-left py-2 font-semibold">Rolle</th>
                    <th className="text-left py-2 font-semibold">Typ</th>
                    <th className="text-left py-2 font-semibold">FTE</th>
                    <th className="text-left py-2 font-semibold">Zeitraum</th>
                    <th className="text-left py-2 font-semibold">Zugewiesen</th>
                    <th className="text-left py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffingRequirements.map((req) => {
                    const phase = phases.find(p => p.id === req.phaseId)
                    return (
                      <tr key={req.id} className="border-b border-gray-100">
                        <td className="py-2">
                          <div>
                            <div className="font-medium">{phase?.name || 'Unbekannte Phase'}</div>
                            <div className="text-xs text-gray-500">{phase?.status || ''}</div>
                          </div>
                        </td>
                        <td className="py-2 font-medium">{req.roleName}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            req.resourceType === 'internal' ? 'bg-blue-100 text-blue-800' :
                            req.resourceType === 'external' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {req.resourceType === 'internal' ? 'Intern' : 
                             req.resourceType === 'external' ? 'Extern' : 'Kunde'}
                          </span>
                        </td>
                        <td className="py-2 font-medium">{req.fte}</td>
                        <td className="py-2 text-xs">
                          <div>
                            <div>{new Date(req.startDate).toLocaleDateString('de-DE')}</div>
                            <div>{new Date(req.endDate).toLocaleDateString('de-DE')}</div>
                          </div>
                        </td>
                        <td className="py-2">
                          {req.assignedPerson ? (
                            <span className="text-green-600 font-medium">{req.assignedPerson}</span>
                          ) : (
                            <span className="text-red-600">Nicht zugewiesen</span>
                          )}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            req.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            req.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {req.status === 'confirmed' ? 'Bestätigt' : 
                             req.status === 'assigned' ? 'Zugewiesen' : 'Offen'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 