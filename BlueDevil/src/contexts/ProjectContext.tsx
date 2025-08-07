import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Stakeholder Interface
interface Stakeholder {
  id: string
  name: string
  role: string
  organization: string
  email?: string
  phone?: string
  location?: string
  influence: 'high' | 'medium' | 'low'
  support: 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker'
  responsibilities: string[]
  contactFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  notes: string
  lastContact?: Date
  nextContact?: Date
}

// Role Interface mit Staffing-Erweiterungen
interface Role {
  id: string
  title: string
  department: string
  responsibilities: string[]
  requiredSkills: string[]
  reportingTo?: string
  stakeholders: string[]
  isKeyRole: boolean
  // Staffing & FTE Erweiterungen
  fte: number
  startDate?: string
  endDate?: string
  projectPhase: string[]
  resourceType: 'internal' | 'external' | 'customer'
  availability: 'full-time' | 'part-time' | 'on-demand'
  assignedPerson?: string
  costCenter?: string
  hourlyRate?: number
}

// Project Phase Interface
interface ProjectPhase {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'planned' | 'active' | 'completed'
  description: string
  requiredRoles: string[]
  deliverables: string[]
}

// Milestone Interface
interface Milestone {
  id: string
  name: string
  description: string
  date: string
  status: 'planned' | 'in-progress' | 'completed' | 'delayed'
  deliverables: string[]
  requiredRoles: string[]
}

// Staffing Requirement Interface
interface StaffingRequirement {
  id: string
  roleId: string
  roleName: string
  phaseId: string
  fte: number
  startDate: string
  endDate: string
  resourceType: 'internal' | 'external' | 'customer'
  assignedPerson?: string
  status: 'open' | 'assigned' | 'confirmed'
}

// Project Goal Interface
interface ProjectGoal {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  targetDate: string
  status: 'not-started' | 'in-progress' | 'completed'
  responsible: string
}

// Project Context Interface
interface ProjectContextType {
  // Stakeholder & Roles
  stakeholders: Stakeholder[]
  roles: Role[]
  addStakeholder: (stakeholder: Omit<Stakeholder, 'id'>) => void
  updateStakeholder: (id: string, stakeholder: Partial<Stakeholder>) => void
  deleteStakeholder: (id: string) => void
  addRole: (role: Omit<Role, 'id'>) => void
  updateRole: (id: string, role: Partial<Role>) => void
  deleteRole: (id: string) => void
  
  // Project Planning
  phases: ProjectPhase[]
  milestones: Milestone[]
  goals: ProjectGoal[]
  staffingRequirements: StaffingRequirement[]
  
  addPhase: (phase: Omit<ProjectPhase, 'id'>) => void
  updatePhase: (id: string, phase: Partial<ProjectPhase>) => void
  deletePhase: (id: string) => void
  
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void
  updateMilestone: (id: string, milestone: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void
  
  addGoal: (goal: Omit<ProjectGoal, 'id'>) => void
  updateGoal: (id: string, goal: Partial<ProjectGoal>) => void
  deleteGoal: (id: string) => void
  
  addStaffingRequirement: (requirement: Omit<StaffingRequirement, 'id'>) => void
  updateStaffingRequirement: (id: string, requirement: Partial<StaffingRequirement>) => void
  deleteStaffingRequirement: (id: string) => void
  
  // Analytics & Calculations
  getTotalFTE: () => number
  getFTEByType: (type: 'internal' | 'external' | 'customer') => number
  getFTEByPhase: (phaseId: string) => number
  getStakeholdersByRole: (roleId: string) => Stakeholder[]
  getRolesByPhase: (phaseId: string) => Role[]
  
  // AI Analysis
  runAIAnalysis: () => Promise<void>

  // Projektfokus
  activeProjectId: string | null
  setActiveProjectId: (id: string) => void
  projects: Array<{
    id: string
    name: string
    client: string
    status: string
    progress: number
    agent: string
    startDate: string
    endDate: string
    budget: string
  }>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

interface ProjectProviderProps {
  children: ReactNode
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [phases, setPhases] = useState<ProjectPhase[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [goals, setGoals] = useState<ProjectGoal[]>([])
  const [staffingRequirements, setStaffingRequirements] = useState<StaffingRequirement[]>([])

  // Initialize with demo data
  useEffect(() => {
    // Demo Stakeholders
    setStakeholders([
      {
        id: '1',
        name: 'Dr. Sarah Weber',
        role: 'IT-Direktorin',
        organization: 'TechCorp GmbH',
        email: 's.weber@techcorp.de',
        phone: '+49 30 12345678',
        location: 'Berlin',
        influence: 'high',
        support: 'champion',
        responsibilities: ['IT-Strategie', 'Budget-Verantwortung', 'Projekt-Sponsoring'],
        contactFrequency: 'weekly',
        notes: 'Sehr interessiert an KI-gestützten Lösungen. Hat bereits positive Erfahrungen mit ähnlichen Projekten.',
        lastContact: new Date('2024-01-15'),
        nextContact: new Date('2024-01-22')
      },
      {
        id: '2',
        name: 'Michael Schmidt',
        role: 'Salesforce Administrator',
        organization: 'TechCorp GmbH',
        email: 'm.schmidt@techcorp.de',
        phone: '+49 30 12345679',
        location: 'Berlin',
        influence: 'medium',
        support: 'supporter',
        responsibilities: ['System-Administration', 'User-Management', 'Technische Implementierung'],
        contactFrequency: 'weekly',
        notes: 'Technisch versiert, aber vorsichtig bei Änderungen. Braucht detaillierte Dokumentation.',
        lastContact: new Date('2024-01-14'),
        nextContact: new Date('2024-01-21')
      },
      {
        id: '3',
        name: 'Lisa Müller',
        role: 'HR-Managerin',
        organization: 'TechCorp GmbH',
        email: 'l.mueller@techcorp.de',
        phone: '+49 30 12345680',
        location: 'Berlin',
        influence: 'medium',
        support: 'neutral',
        responsibilities: ['Change Management', 'Schulungsplanung', 'Kommunikation'],
        contactFrequency: 'monthly',
        notes: 'Fokus auf Change Management und User Adoption. Wichtig für erfolgreiche Implementierung.',
        lastContact: new Date('2024-01-10'),
        nextContact: new Date('2024-02-10')
      }
    ])

    // Demo Roles
    setRoles([
      {
        id: '1',
        title: 'Projekt-Manager',
        department: 'IT',
        responsibilities: ['Projektplanung', 'Ressourcen-Management', 'Reporting'],
        requiredSkills: ['Projekt-Management', 'Agile Methoden', 'Reporting'],
        reportingTo: 'Projekt-Sponsor',
        stakeholders: [],
        isKeyRole: true,
        fte: 1.0,
        startDate: '2024-08-01',
        endDate: '2024-12-31',
        projectPhase: ['Kickoff', 'Build', 'Test', 'Rollout'],
        resourceType: 'internal',
        availability: 'full-time',
        assignedPerson: 'Max Mustermann'
      },
      {
        id: '2',
        title: 'Solution Architect',
        department: 'IT',
        responsibilities: ['Technische Architektur', 'Systemdesign', 'Integration-Planung'],
        requiredSkills: ['Salesforce Architecture', 'Integration', 'System Design'],
        reportingTo: 'Projekt-Manager',
        stakeholders: [],
        isKeyRole: true,
        fte: 1.0,
        startDate: '2024-08-15',
        endDate: '2024-11-30',
        projectPhase: ['Architecture', 'Build'],
        resourceType: 'internal',
        availability: 'full-time',
        assignedPerson: 'Anna Schmidt'
      },
      {
        id: '3',
        title: 'Salesforce Administrator',
        department: 'IT',
        responsibilities: ['System-Administration', 'User-Management', 'Technische Konfiguration'],
        requiredSkills: ['Salesforce Admin', 'System-Administration', 'Technische Dokumentation'],
        reportingTo: 'IT-Manager',
        stakeholders: ['2'],
        isKeyRole: false,
        fte: 0.8,
        startDate: '2024-09-01',
        endDate: '2024-12-31',
        projectPhase: ['Build', 'Test', 'Rollout'],
        resourceType: 'customer',
        availability: 'part-time',
        assignedPerson: 'Michael Schmidt'
      },
      {
        id: '4',
        title: 'Senior Developer',
        department: 'IT',
        responsibilities: ['Apex-Entwicklung', 'Lightning Components', 'Integration'],
        requiredSkills: ['Apex', 'Lightning Web Components', 'Integration'],
        reportingTo: 'Solution Architect',
        stakeholders: [],
        isKeyRole: false,
        fte: 1.0,
        startDate: '2024-09-01',
        endDate: '2024-12-15',
        projectPhase: ['Build', 'Test'],
        resourceType: 'internal',
        availability: 'full-time',
        assignedPerson: 'David Müller'
      },
      {
        id: '5',
        title: 'Projekt-Sponsor',
        department: 'IT',
        responsibilities: ['Budget-Verantwortung', 'Strategische Entscheidungen', 'Stakeholder-Management'],
        requiredSkills: ['Leadership', 'Budget-Management', 'Stakeholder-Kommunikation'],
        reportingTo: 'CEO',
        stakeholders: ['1'],
        isKeyRole: true,
        fte: 0.2,
        startDate: '2024-08-01',
        endDate: '2024-12-31',
        projectPhase: ['Kickoff', 'Steering Committee'],
        resourceType: 'customer',
        availability: 'part-time'
      }
    ])

    // Demo Phases
    setPhases([
      {
        id: '1',
        name: 'Phase 1: Grundlagen',
        startDate: '2024-08-01',
        endDate: '2024-09-30',
        status: 'completed',
        description: 'Projektaufbau, Anforderungsanalyse, Technische Architektur',
        requiredRoles: ['1', '2'],
        deliverables: ['Projektplan', 'Anforderungsdokument', 'Architektur-Dokument']
      },
      {
        id: '2',
        name: 'Phase 2: Entwicklung',
        startDate: '2024-10-01',
        endDate: '2024-11-30',
        status: 'active',
        description: 'Core-Entwicklung, Integration, Testing',
        requiredRoles: ['1', '2', '3', '4'],
        deliverables: ['Entwickelte Features', 'Integration-Tests', 'System-Tests']
      },
      {
        id: '3',
        name: 'Phase 3: Rollout',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        status: 'planned',
        description: 'Go-Live, Schulung, Support',
        requiredRoles: ['1', '3'],
        deliverables: ['Produktives System', 'Schulungsunterlagen', 'Support-Prozesse']
      }
    ])

    // Demo Milestones
    setMilestones([
      {
        id: '1',
        name: 'Projektstart',
        description: 'Offizieller Projektbeginn mit Kickoff-Meeting',
        date: '2024-08-01',
        status: 'completed',
        deliverables: ['Projektplan', 'Team-Aufbau', 'Kickoff-Präsentation'],
        requiredRoles: ['1', '2']
      },
      {
        id: '2',
        name: 'Anforderungsanalyse abgeschlossen',
        description: 'Alle funktionalen und nicht-funktionalen Anforderungen sind dokumentiert',
        date: '2024-09-15',
        status: 'completed',
        deliverables: ['Anforderungsdokument', 'Use Cases', 'Prozessdokumentation'],
        requiredRoles: ['1', '2']
      },
      {
        id: '3',
        name: 'Technische Architektur',
        description: 'Technische Architektur und Systemdesign sind genehmigt',
        date: '2024-10-01',
        status: 'in-progress',
        deliverables: ['Architektur-Dokument', 'Systemdesign', 'Integration-Plan'],
        requiredRoles: ['2', '4']
      },
      {
        id: '4',
        name: 'Go-Live',
        description: 'System ist produktiv und alle User sind geschult',
        date: '2024-12-31',
        status: 'planned',
        deliverables: ['Produktives System', 'Schulungsunterlagen', 'Support-Prozesse'],
        requiredRoles: ['1', '3']
      }
    ])

    // Demo Goals
    setGoals([
      {
        id: '1',
        title: 'Salesforce CRM Implementierung',
        description: 'Vollständige Implementierung des Salesforce CRM Systems mit allen Core-Modulen',
        priority: 'high',
        targetDate: '2024-12-31',
        status: 'in-progress',
        responsible: 'Max Mustermann'
      },
      {
        id: '2',
        title: 'Systemintegration',
        description: 'Integration mit bestehenden ERP- und E-Mail-Systemen',
        priority: 'high',
        targetDate: '2024-11-15',
        status: 'not-started',
        responsible: 'Anna Schmidt'
      },
      {
        id: '3',
        title: 'Benutzerschulung',
        description: 'Schulung aller End-User und Administratoren',
        priority: 'medium',
        targetDate: '2024-12-01',
        status: 'not-started',
        responsible: 'Clara Weber'
      }
    ])

    // Demo Staffing Requirements
    setStaffingRequirements([
      {
        id: '1',
        roleId: '1',
        roleName: 'Projekt-Manager',
        phaseId: '1',
        fte: 1.0,
        startDate: '2024-08-01',
        endDate: '2024-09-30',
        resourceType: 'internal',
        assignedPerson: 'Max Mustermann',
        status: 'confirmed'
      },
      {
        id: '2',
        roleId: '2',
        roleName: 'Solution Architect',
        phaseId: '1',
        fte: 0.5,
        startDate: '2024-08-15',
        endDate: '2024-09-30',
        resourceType: 'internal',
        assignedPerson: 'Anna Schmidt',
        status: 'confirmed'
      },
      {
        id: '3',
        roleId: '1',
        roleName: 'Projekt-Manager',
        phaseId: '2',
        fte: 1.0,
        startDate: '2024-10-01',
        endDate: '2024-11-30',
        resourceType: 'internal',
        assignedPerson: 'Max Mustermann',
        status: 'confirmed'
      },
      {
        id: '4',
        roleId: '2',
        roleName: 'Solution Architect',
        phaseId: '2',
        fte: 1.0,
        startDate: '2024-10-01',
        endDate: '2024-11-30',
        resourceType: 'internal',
        assignedPerson: 'Anna Schmidt',
        status: 'confirmed'
      },
      {
        id: '5',
        roleId: '4',
        roleName: 'Senior Developer',
        phaseId: '2',
        fte: 1.0,
        startDate: '2024-10-01',
        endDate: '2024-11-30',
        resourceType: 'internal',
        assignedPerson: 'David Müller',
        status: 'confirmed'
      },
      {
        id: '6',
        roleId: '3',
        roleName: 'Salesforce Administrator',
        phaseId: '2',
        fte: 0.5,
        startDate: '2024-10-01',
        endDate: '2024-11-30',
        resourceType: 'customer',
        assignedPerson: 'Michael Schmidt',
        status: 'confirmed'
      },
      {
        id: '7',
        roleId: '1',
        roleName: 'Projekt-Manager',
        phaseId: '3',
        fte: 1.0,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        resourceType: 'internal',
        assignedPerson: 'Max Mustermann',
        status: 'assigned'
      },
      {
        id: '8',
        roleId: '3',
        roleName: 'Salesforce Administrator',
        phaseId: '3',
        fte: 0.8,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        resourceType: 'customer',
        assignedPerson: 'Michael Schmidt',
        status: 'assigned'
      }
    ])
  }, [])

  // Stakeholder functions
  const addStakeholder = (stakeholder: Omit<Stakeholder, 'id'>) => {
    const newStakeholder = { ...stakeholder, id: Date.now().toString() }
    setStakeholders(prev => [...prev, newStakeholder])
  }

  const updateStakeholder = (id: string, stakeholder: Partial<Stakeholder>) => {
    setStakeholders(prev => prev.map(s => s.id === id ? { ...s, ...stakeholder } : s))
  }

  const deleteStakeholder = (id: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== id))
  }

  // Role functions
  const addRole = (role: Omit<Role, 'id'>) => {
    const newRole = { ...role, id: Date.now().toString() }
    setRoles(prev => [...prev, newRole])
  }

  const updateRole = (id: string, role: Partial<Role>) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...role } : r))
  }

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id))
  }

  // Phase functions
  const addPhase = (phase: Omit<ProjectPhase, 'id'>) => {
    const newPhase = { ...phase, id: Date.now().toString() }
    setPhases(prev => [...prev, newPhase])
  }

  const updatePhase = (id: string, phase: Partial<ProjectPhase>) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, ...phase } : p))
  }

  const deletePhase = (id: string) => {
    setPhases(prev => prev.filter(p => p.id !== id))
  }

  // Milestone functions
  const addMilestone = (milestone: Omit<Milestone, 'id'>) => {
    const newMilestone = { ...milestone, id: Date.now().toString() }
    setMilestones(prev => [...prev, newMilestone])
  }

  const updateMilestone = (id: string, milestone: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...milestone } : m))
  }

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  // Goal functions
  const addGoal = (goal: Omit<ProjectGoal, 'id'>) => {
    const newGoal = { ...goal, id: Date.now().toString() }
    setGoals(prev => [...prev, newGoal])
  }

  const updateGoal = (id: string, goal: Partial<ProjectGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...goal } : g))
  }

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  // Staffing Requirement functions
  const addStaffingRequirement = (requirement: Omit<StaffingRequirement, 'id'>) => {
    const newRequirement = { ...requirement, id: Date.now().toString() }
    setStaffingRequirements(prev => [...prev, newRequirement])
  }

  const updateStaffingRequirement = (id: string, requirement: Partial<StaffingRequirement>) => {
    setStaffingRequirements(prev => prev.map(r => r.id === id ? { ...r, ...requirement } : r))
  }

  const deleteStaffingRequirement = (id: string) => {
    setStaffingRequirements(prev => prev.filter(r => r.id !== id))
  }

  // Analytics functions
  const getTotalFTE = () => {
    return staffingRequirements.reduce((sum, req) => sum + req.fte, 0)
  }

  const getFTEByType = (type: 'internal' | 'external' | 'customer') => {
    return staffingRequirements
      .filter(req => req.resourceType === type)
      .reduce((sum, req) => sum + req.fte, 0)
  }

  const getFTEByPhase = (phaseId: string) => {
    return staffingRequirements
      .filter(req => req.phaseId === phaseId)
      .reduce((sum, req) => sum + req.fte, 0)
  }

  const getStakeholdersByRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (!role) return []
    return stakeholders.filter(s => role.stakeholders.includes(s.id))
  }

  const getRolesByPhase = (phaseId: string) => {
    const phase = phases.find(p => p.id === phaseId)
    if (!phase) return []
    return roles.filter(r => phase.requiredRoles.includes(r.id))
  }

  // AI Analysis
  const runAIAnalysis = async () => {
    // Simuliere KI-Analyse
    console.log('KI-Analyse für Projektplanung gestartet...')
    // Hier würde die echte KI-Analyse stattfinden
  }

  // Demo-Projekte
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'Salesforce CPQ Implementation',
      client: 'TechCorp GmbH',
      status: 'active',
      progress: 75,
      agent: 'PreSales Agent',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      budget: '€125,000'
    },
    {
      id: '2',
      name: 'Service Cloud Migration',
      client: 'ServiceMax AG',
      status: 'planning',
      progress: 25,
      agent: 'Solution Design Agent',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      budget: '€85,000'
    },
    {
      id: '3',
      name: 'Marketing Automation Setup',
      client: 'GrowthStart',
      status: 'completed',
      progress: 100,
      agent: 'Implementation Agent',
      startDate: '2023-11-01',
      endDate: '2024-01-31',
      budget: '€65,000'
    },
    {
      id: '4',
      name: 'Data Migration & Integration',
      client: 'DataFlow Solutions',
      status: 'active',
      progress: 60,
      agent: 'Testing Agent',
      startDate: '2024-01-20',
      endDate: '2024-05-15',
      budget: '€95,000'
    }
  ])
  // Aktives Projekt
  const [activeProjectId, setActiveProjectId] = useState<string | null>(projects[0]?.id || null)

  const value: ProjectContextType = {
    stakeholders,
    roles,
    addStakeholder,
    updateStakeholder,
    deleteStakeholder,
    addRole,
    updateRole,
    deleteRole,
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
    getStakeholdersByRole,
    getRolesByPhase,
    runAIAnalysis,
    // Projektfokus
    activeProjectId,
    setActiveProjectId,
    projects
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
} 