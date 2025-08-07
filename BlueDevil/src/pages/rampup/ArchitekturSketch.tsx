import React, { useState, useMemo } from 'react'
import { PencilRuler, Plus, Edit, Trash2, Save, Layers, Server, Database, Globe, Shield, CheckCircle, AlertCircle, Edit2 } from 'lucide-react'
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, Node, Edge } from 'react-flow-renderer'

interface SystemComponent {
  id: string
  name: string
  type: 'application' | 'database' | 'integration' | 'security' | 'infrastructure'
  description: string
  functions: string[]
  dependencies: string[]
  status: 'planned' | 'existing' | 'to-be-replaced'
}

interface Function {
  id: string
  name: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  assignedTo: string[]
  status: 'unassigned' | 'assigned' | 'implemented'
}

// Professional Area Node with gradient background
const BereichNode = ({ data }: any) => (
  <div style={{
    border: '2px solid #1e40af',
    borderRadius: 16,
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    padding: 20,
    minWidth: 800,
    minHeight: 500,
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.15)',
    fontWeight: 700,
    fontSize: 20,
    color: '#1e40af',
    position: 'relative',
    opacity: 0.8,
    zIndex: 0,
  }}>
    <div className="flex items-center gap-2 mb-2">
      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
      {data.label}
    </div>
    {data.description && (
      <div className="text-sm font-normal text-blue-700 opacity-80">
        {data.description}
      </div>
    )}
  </div>
)

// Professional System Node with better styling
const SystemNode = ({ data }: any) => (
  <div style={{
    border: '2px solid #0891b2',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
    padding: 16,
    minWidth: 200,
    minHeight: 100,
    margin: 8,
    fontWeight: 600,
    fontSize: 16,
    color: '#0e7490',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 2px 8px rgba(8, 145, 178, 0.1)',
    transition: 'all 0.2s ease',
  }}>
    <div className="flex items-center gap-2 mb-2">
      <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
      <span className="font-semibold">{data.label}</span>
    </div>
    {data.description && (
      <div className="text-xs font-normal text-cyan-700 opacity-80 line-clamp-2">
        {data.description}
      </div>
    )}
    {data.status && (
      <div className="mt-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          data.status === 'existing' ? 'bg-green-100 text-green-800' :
          data.status === 'planned' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {data.status === 'existing' ? 'Bestehend' :
           data.status === 'planned' ? 'Geplant' :
           'Zu ersetzen'}
        </span>
      </div>
    )}
  </div>
)

// Professional Function Node with better styling
const FunktionNode = ({ data }: any) => (
  <div style={{
    border: '1px solid #94a3b8',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: 12,
    minWidth: 140,
    minHeight: 50,
    margin: 4,
    fontWeight: 500,
    fontSize: 14,
    color: '#475569',
    position: 'relative',
    zIndex: 2,
    boxShadow: '0 1px 4px rgba(148, 163, 184, 0.1)',
    transition: 'all 0.2s ease',
  }}>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
      <span className="font-medium">{data.label}</span>
    </div>
    {data.priority && (
      <div className="mt-1">
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
          data.priority === 'critical' ? 'bg-red-100 text-red-800' :
          data.priority === 'high' ? 'bg-orange-100 text-orange-800' :
          data.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {data.priority === 'critical' ? 'Kritisch' :
           data.priority === 'high' ? 'Hoch' :
           data.priority === 'medium' ? 'Mittel' :
           'Niedrig'}
        </span>
      </div>
    )}
  </div>
)

const nodeTypes = {
  bereich: BereichNode,
  system: SystemNode,
  funktion: FunktionNode,
}

// Simple coordinate-based layout algorithm
const generateLayout = (systems: SystemComponent[], functions: Function[]) => {
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  // Calculate area positions based on coordinates
  const areaWidth = 500
  const areaHeight = 350
  const spacing = 50
  
  const areas = [
    { id: 'marketing', name: 'Marketing & Engagement', x: 0, y: 0, width: areaWidth, height: areaHeight },
    { id: 'data', name: 'Daten & Intelligence', x: areaWidth + spacing, y: 0, width: areaWidth, height: areaHeight },
    { id: 'sales', name: 'Sales & Service', x: 0, y: areaHeight + spacing, width: areaWidth, height: areaHeight },
    { id: 'integration', name: 'Integration & Platform', x: areaWidth + spacing, y: areaHeight + spacing, width: areaWidth, height: areaHeight },
  ]
  
  // Add area nodes
  areas.forEach(area => {
    nodes.push({
      id: area.id,
      type: 'bereich',
      data: { 
        label: area.name,
        description: 'Systembereich für verwandte Komponenten'
      },
      position: { x: area.x, y: area.y },
      draggable: false,
      style: { width: area.width, height: area.height, zIndex: 0 }
    })
  })
  
  // Define system assignments to areas based on actual demo data
  const systemAssignments = {
    'Salesforce CRM': 'marketing',
    'SAP ERP': 'sales',
    'Active Directory': 'integration',
    'Integration Platform': 'integration',
    'Data Warehouse': 'data'
  }
  
  // Add system nodes with fixed positioning within their areas
  systems.forEach((system, index) => {
    // Find which area this system belongs to
    const areaName = systemAssignments[system.name as keyof typeof systemAssignments]
    
    if (areaName) {
      const area = areas.find(a => a.id === areaName)
      if (area) {
        // Find all systems in this area
        const areaSystems = systems.filter(sys => 
          systemAssignments[sys.name as keyof typeof systemAssignments] === areaName
        )
        const systemIndex = areaSystems.findIndex(sys => sys.name === system.name)
        
        // Calculate position within the area using coordinates
        const row = Math.floor(systemIndex / 2)
        const col = systemIndex % 2
        const systemWidth = 200
        const systemHeight = 120
        const systemSpacingX = 250
        const systemSpacingY = 150
        const margin = 100
        
        const x = area.x + margin + col * systemSpacingX
        const y = area.y + margin + row * systemSpacingY
        
        nodes.push({
          id: system.id,
          type: 'system',
          data: { 
            label: system.name,
            description: system.description,
            status: system.status
          },
          position: { x, y },
          draggable: true,
          style: { zIndex: 1 }
        })
      }
    }
  })
  
  // Add function nodes with fixed positioning
  let functionIndex = 0
  functions.forEach(func => {
    if (func.assignedTo.length > 0) {
      // Find the system this function is assigned to
      const assignedSystem = systems.find(s => s.name === func.assignedTo[0])
      if (assignedSystem) {
        const systemNode = nodes.find(n => n.id === assignedSystem.id)
        if (systemNode) {
          // Find the area for this system
          const areaName = systemAssignments[assignedSystem.name as keyof typeof systemAssignments]
          const area = areas.find(a => a.id === areaName)
          
          if (area) {
            // Calculate function position using coordinates
            const functionWidth = 140
            const functionHeight = 50
            const functionSpacingX = 180
            const functionSpacingY = 80
            const functionMargin = 40
            const systemHeight = 120
            
            // Position function below the system
            const baseX = systemNode.position.x
            const baseY = systemNode.position.y + systemHeight + 20
            const offsetX = (functionIndex % 2) * functionSpacingX
            const offsetY = Math.floor(functionIndex / 2) * functionSpacingY
            
            // Calculate final position within area bounds
            const functionX = Math.max(area.x + functionMargin, 
                                     Math.min(area.x + area.width - functionWidth - functionMargin, 
                                             baseX + offsetX))
            const functionY = Math.max(area.y + functionMargin, 
                                     Math.min(area.y + area.height - functionHeight - functionMargin, 
                                             baseY + offsetY))
            
            nodes.push({
              id: `f_${func.id}`,
              type: 'funktion',
              data: { 
                label: func.name,
                priority: func.priority
              },
              position: { x: functionX, y: functionY },
              draggable: true,
              style: { zIndex: 2 }
            })
            
            // Add edge from function to system
            edges.push({
              id: `e_${func.id}_${assignedSystem.id}`,
              source: `f_${func.id}`,
              target: assignedSystem.id,
              animated: true,
              style: { stroke: '#0891b2', strokeWidth: 2 },
              type: 'smoothstep'
            })
            
            functionIndex++
          }
        }
      }
    }
  })
  
  // Add some cross-system dependencies
  if (systems.length >= 2) {
    edges.push({
      id: 'e_system_1_2',
      source: '1',
      target: '4',
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 1, strokeDasharray: '5,5' },
      type: 'smoothstep'
    })
    
    if (systems.length >= 3) {
      edges.push({
        id: 'e_system_2_3',
        source: '4',
        target: '7',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 1, strokeDasharray: '5,5' },
        type: 'smoothstep'
      })
    }
  }
  
  return { nodes, edges }
}

export const ArchitekturSketch: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'systems' | 'functions' | 'mapping' | 'diagram'>('systems')
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState<'system' | 'function'>('system')

  // Demo-Daten
  const demoSystems: SystemComponent[] = [
    {
      id: '1',
      name: 'Salesforce CRM',
      type: 'application',
      description: 'Haupt-CRM-System für Kundenverwaltung und Sales-Prozesse',
      functions: ['Lead Management', 'Opportunity Tracking', 'Account Management', 'Contact Management'],
      dependencies: ['Active Directory', 'E-Mail-System'],
      status: 'planned'
    },
    {
      id: '2',
      name: 'SAP ERP',
      type: 'application',
      description: 'Bestehendes ERP-System für Finanzen und Logistik',
      functions: ['Financial Management', 'Inventory Management', 'Procurement'],
      dependencies: [],
      status: 'existing'
    },
    {
      id: '3',
      name: 'Active Directory',
      type: 'security',
      description: 'Zentrale Benutzerverwaltung und Authentifizierung',
      functions: ['User Authentication', 'Single Sign-On', 'Access Control'],
      dependencies: [],
      status: 'existing'
    },
    {
      id: '4',
      name: 'Integration Platform',
      type: 'integration',
      description: 'Middleware für System-zu-System-Kommunikation',
      functions: ['Data Synchronization', 'API Management', 'Event Routing'],
      dependencies: ['Salesforce CRM', 'SAP ERP'],
      status: 'planned'
    },
    {
      id: '5',
      name: 'Data Warehouse',
      type: 'database',
      description: 'Zentrales Data Warehouse für Reporting und Analytics',
      functions: ['Data Storage', 'ETL Processing', 'Business Intelligence'],
      dependencies: ['Salesforce CRM', 'SAP ERP'],
      status: 'planned'
    }
  ]

  const demoFunctions: Function[] = [
    {
      id: '1',
      name: 'Lead Management',
      description: 'Erfassung, Qualifizierung und Verfolgung von Leads',
      priority: 'critical',
      assignedTo: ['Salesforce CRM'],
      status: 'assigned'
    },
    {
      id: '2',
      name: 'Opportunity Tracking',
      description: 'Verfolgung von Verkaufschancen durch den Sales-Prozess',
      priority: 'critical',
      assignedTo: ['Salesforce CRM'],
      status: 'assigned'
    },
    {
      id: '3',
      name: 'Financial Management',
      description: 'Finanzverwaltung und Buchhaltung',
      priority: 'high',
      assignedTo: ['SAP ERP'],
      status: 'assigned'
    },
    {
      id: '4',
      name: 'User Authentication',
      description: 'Zentrale Benutzerauthentifizierung und -verwaltung',
      priority: 'critical',
      assignedTo: ['Active Directory'],
      status: 'assigned'
    },
    {
      id: '5',
      name: 'Data Synchronization',
      description: 'Synchronisation von Daten zwischen verschiedenen Systemen',
      priority: 'high',
      assignedTo: ['Integration Platform'],
      status: 'assigned'
    },
    {
      id: '6',
      name: 'Business Intelligence',
      description: 'Reporting und Analytics über alle Systeme hinweg',
      priority: 'medium',
      assignedTo: ['Data Warehouse'],
      status: 'assigned'
    },
    {
      id: '7',
      name: 'Document Management',
      description: 'Zentrale Dokumentenverwaltung und -archivierung',
      priority: 'medium',
      assignedTo: [],
      status: 'unassigned'
    }
  ]

  // Generate layout using custom algorithm
  const { nodes: diagramNodes, edges: diagramEdges } = useMemo(() => 
    generateLayout(demoSystems, demoFunctions), 
    [demoSystems, demoFunctions]
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <Layers size={14} />
      case 'database':
        return <Database size={14} />
      case 'integration':
        return <Globe size={14} />
      case 'security':
        return <Shield size={14} />
      case 'infrastructure':
        return <Server size={14} />
      default:
        return <Layers size={14} />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'existing':
        return <CheckCircle size={14} className="text-green-500" />
      case 'planned':
        return <AlertCircle size={14} className="text-blue-500" />
      case 'to-be-replaced':
        return <AlertCircle size={14} className="text-yellow-500" />
      default:
        return <AlertCircle size={14} className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'existing':
        return 'bg-green-100 text-green-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'to-be-replaced':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-green-100 text-green-800'
      case 'unassigned':
        return 'bg-red-100 text-red-800'
      case 'implemented':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <PencilRuler size={24} className="text-digital-blue" />
        <h1 className="text-xl font-bold">Architektur-Sketch</h1>
      </div>

      {/* Compact Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-6">
          {[
            { key: 'systems', label: 'Systeme', icon: Server },
            { key: 'functions', label: 'Funktionen', icon: Layers },
            { key: 'mapping', label: 'Zuordnung', icon: PencilRuler },
            { key: 'diagram', label: 'Diagramm', icon: Edit2 },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-digital-blue text-digital-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Compact Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {activeTab === 'systems' && 'Systemkomponenten'}
              {activeTab === 'functions' && 'Funktionen'}
              {activeTab === 'mapping' && 'Funktions-Zuordnung'}
              {activeTab === 'diagram' && 'Architektur-Diagramm'}
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-1 text-sm px-3 py-1"
            >
              <Plus size={14} />
              Hinzufügen
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'systems' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoSystems.map(system => (
                <div key={system.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(system.type)}
                      <h3 className="font-medium text-sm">{system.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      {getStatusIcon(system.status)}
                      <button className="text-gray-400 hover:text-digital-blue" title="Bearbeiten">
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{system.description}</p>
                  
                  <div className="mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(system.status)}`}>
                      {system.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Funktionen ({system.functions.length}):</div>
                    <div className="flex flex-wrap gap-1">
                      {system.functions.slice(0, 3).map((func, index) => (
                        <span key={index} className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                          {func}
                        </span>
                      ))}
                      {system.functions.length > 3 && (
                        <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{system.functions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {system.dependencies.length > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs font-medium text-gray-700">Abhängigkeiten:</div>
                      <div className="flex flex-wrap gap-1">
                        {system.dependencies.map((dep, index) => (
                          <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'functions' && (
            <div className="space-y-3">
              {demoFunctions.map(func => (
                <div key={func.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{func.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(func.priority)}`}>
                        {func.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getAssignmentStatusColor(func.status)}`}>
                        {func.status}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button className="text-gray-400 hover:text-digital-blue" title="Bearbeiten">
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">{func.description}</p>
                  
                  {func.assignedTo.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {func.assignedTo.map((system, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {system}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mapping' && (
            <div className="space-y-4">
              {/* Compact Overview Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-3">
                  <h3 className="font-bold text-red-800 text-sm mb-2">Nicht zugewiesen</h3>
                  <div className="space-y-1">
                    {demoFunctions.filter(f => f.status === 'unassigned').map(func => (
                      <div key={func.id} className="bg-white rounded p-2 border border-red-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{func.name}</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${getPriorityColor(func.priority)}`}>
                            {func.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <h3 className="font-bold text-blue-800 text-sm mb-2">Systeme</h3>
                  <div className="space-y-1">
                    {demoSystems.map(system => (
                      <div key={system.id} className="bg-white rounded p-2 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{system.name}</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${getStatusColor(system.status)}`}>
                            {system.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {system.functions.length} Funktionen
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <h3 className="font-bold text-green-800 text-sm mb-2">Zugewiesen</h3>
                  <div className="space-y-1">
                    {demoFunctions.filter(f => f.status === 'assigned').slice(0, 5).map(func => (
                      <div key={func.id} className="bg-white rounded p-2 border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{func.name}</span>
                          <span className={`px-1 py-0.5 rounded text-xs ${getPriorityColor(func.priority)}`}>
                            {func.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compact Matrix */}
              <div className="bg-white border rounded-lg">
                <div className="p-3 border-b">
                  <h3 className="font-bold text-sm">Funktions-System-Matrix</h3>
                </div>
                <div className="p-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1">Funktion</th>
                          {demoSystems.map(system => (
                            <th key={system.id} className="text-center p-1">{system.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {demoFunctions.map(func => (
                          <tr key={func.id} className="border-b">
                            <td className="p-1 font-medium text-xs">{func.name}</td>
                            {demoSystems.map(system => (
                              <td key={system.id} className="text-center p-1">
                                {func.assignedTo.includes(system.name) ? (
                                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto"></div>
                                ) : (
                                  <div className="w-3 h-3 bg-gray-200 rounded-full mx-auto"></div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagram' && (
            <div style={{ height: 700, width: '100%' }}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={diagramNodes}
                  edges={diagramEdges}
                  nodeTypes={nodeTypes}
                  fitView
                  panOnDrag
                  zoomOnScroll
                  minZoom={0.2}
                  maxZoom={2}
                >
                  <MiniMap />
                  <Controls />
                  <Background gap={16} color="#eee" />
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-3">
              {modalType === 'system' ? 'Neues System' : 'Neue Funktion'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input type="text" className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1">Beschreibung</label>
                <textarea className="w-full border rounded px-2 py-1 text-sm" rows={2}></textarea>
              </div>
              
              {modalType === 'system' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1">Typ</label>
                    <select className="w-full border rounded px-2 py-1 text-sm">
                      <option value="application">Anwendung</option>
                      <option value="database">Datenbank</option>
                      <option value="integration">Integration</option>
                      <option value="security">Sicherheit</option>
                      <option value="infrastructure">Infrastruktur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Status</label>
                    <select className="w-full border rounded px-2 py-1 text-sm">
                      <option value="existing">Bestehend</option>
                      <option value="planned">Geplant</option>
                      <option value="to-be-replaced">Zu ersetzen</option>
                    </select>
                  </div>
                </>
              )}
              
              {modalType === 'function' && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1">Priorität</label>
                    <select className="w-full border rounded px-2 py-1 text-sm">
                      <option value="critical">Kritisch</option>
                      <option value="high">Hoch</option>
                      <option value="medium">Mittel</option>
                      <option value="low">Niedrig</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-ghost flex-1 text-sm"
              >
                Abbrechen
              </button>
              <button className="btn-primary flex-1 flex items-center gap-1 text-sm">
                <Save size={14} />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 