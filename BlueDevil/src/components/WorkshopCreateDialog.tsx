import React, { useState } from 'react'

interface WorkshopTemplate {
  id: string
  name: string
  description: string
  agenda: Array<{ topic: string, minutes: number }>
  phase: string
}

const WORKSHOP_TEMPLATES: WorkshopTemplate[] = [
  {
    id: 'kickoff',
    name: 'Kickoff Workshop',
    description: 'Erster Workshop zur Projektinitialisierung und Zieldefinition',
    phase: 'PreSales',
    agenda: [
      { topic: 'Begrüßung & Vorstellung', minutes: 10 },
      { topic: 'Projektziele & Scope', minutes: 20 },
      { topic: 'Aktuelle Herausforderungen', minutes: 30 },
      { topic: 'Nächste Schritte', minutes: 10 },
    ]
  },
  {
    id: 'process-analysis',
    name: 'Prozessanalyse',
    description: 'Detaillierte Analyse der aktuellen Geschäftsprozesse',
    phase: 'Solution',
    agenda: [
      { topic: 'Prozessübersicht', minutes: 15 },
      { topic: 'Schmerzpunkte identifizieren', minutes: 25 },
      { topic: 'Verbesserungspotenziale', minutes: 20 },
      { topic: 'Priorisierung', minutes: 10 },
    ]
  },
  {
    id: 'user-story-mapping',
    name: 'User Story Mapping',
    description: 'Strukturierung von Anforderungen und User Stories',
    phase: 'Build',
    agenda: [
      { topic: 'User Journey Mapping', minutes: 20 },
      { topic: 'Story Mapping', minutes: 30 },
      { topic: 'Priorisierung & Slicing', minutes: 20 },
      { topic: 'Sprint-Planung', minutes: 10 },
    ]
  },
  {
    id: 'custom',
    name: 'Benutzerdefiniert',
    description: 'Eigene Agenda erstellen',
    phase: 'PreSales',
    agenda: []
  }
]

interface WorkshopCreateDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (workshop: any) => void
}

export const WorkshopCreateDialog: React.FC<WorkshopCreateDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState<'template' | 'details'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<WorkshopTemplate | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    phase: 'PreSales',
    customer: '',
    goal: '',
    participants: [] as string[],
    agenda: [] as Array<{ topic: string, minutes: number }>
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newParticipant, setNewParticipant] = useState('')

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = 'Titel ist erforderlich'
    if (!formData.date) newErrors.date = 'Datum ist erforderlich'
    if (!formData.customer.trim()) newErrors.customer = 'Kunde ist erforderlich'
    if (!formData.goal.trim()) newErrors.goal = 'Workshop-Ziel ist erforderlich'
    if (formData.participants.length === 0) newErrors.participants = 'Mindestens ein Teilnehmer ist erforderlich'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTemplateSelect = (template: WorkshopTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      phase: template.phase,
      agenda: template.agenda.map(a => ({ ...a }))
    }))
    setStep('details')
  }

  const handleSave = () => {
    if (!validateForm()) return
    
    const workshop = {
      id: Date.now().toString(),
      ...formData,
      template: selectedTemplate?.id,
      status: 'geplant'
    }
    
    onSave(workshop)
    onClose()
    // Reset form
    setStep('template')
    setSelectedTemplate(null)
    setFormData({
      title: '',
      date: '',
      phase: 'PreSales',
      customer: '',
      goal: '',
      participants: [],
      agenda: []
    })
    setErrors({})
  }

  const addParticipant = () => {
    const name = newParticipant.trim()
    if (!name || formData.participants.includes(name)) return
    setFormData(prev => ({ ...prev, participants: [...prev.participants, name] }))
    setNewParticipant('')
  }

  const removeParticipant = (name: string) => {
    setFormData(prev => ({ ...prev, participants: prev.participants.filter(p => p !== name) }))
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Workshop anlegen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        {step === 'template' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Workshop-Template auswählen</h3>
            <div className="grid gap-4">
              {WORKSHOP_TEMPLATES.map(template => (
                <div 
                  key={template.id}
                  className="border rounded-lg p-4 hover:border-digital-blue cursor-pointer transition-colors"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.phase}</span>
                        <span className="text-xs text-gray-500">{template.agenda.length} Agenda-Punkte</span>
                      </div>
                    </div>
                    <span className="text-digital-blue">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'details' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={() => setStep('template')}
                className="text-digital-blue hover:text-deep-blue-2"
              >
                ← Zurück zu Templates
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">Template: {selectedTemplate?.name}</span>
            </div>

            <form className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Workshop-Titel *</label>
                  <input 
                    className={`w-full border rounded px-3 py-2 ${errors.title ? 'border-red-500' : ''}`}
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="z.B. Kickoff Workshop"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Datum *</label>
                  <input 
                    type="date" 
                    className={`w-full border rounded px-3 py-2 ${errors.date ? 'border-red-500' : ''}`}
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phase</label>
                  <select 
                    className="w-full border rounded px-3 py-2"
                    value={formData.phase}
                    onChange={e => setFormData({ ...formData, phase: e.target.value })}
                  >
                    <option value="PreSales">PreSales</option>
                    <option value="Solution">Solution</option>
                    <option value="Build">Build</option>
                    <option value="Rollout">Rollout</option>
                    <option value="Hypercare">Hypercare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kunde *</label>
                  <input 
                    className={`w-full border rounded px-3 py-2 ${errors.customer ? 'border-red-500' : ''}`}
                    value={formData.customer}
                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="Kundenname"
                  />
                  {errors.customer && <p className="text-red-500 text-xs mt-1">{errors.customer}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Workshop-Ziel *</label>
                <textarea 
                  className={`w-full border rounded px-3 py-2 ${errors.goal ? 'border-red-500' : ''}`}
                  rows={3}
                  value={formData.goal}
                  onChange={e => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="Was soll mit dem Workshop erreicht werden?"
                />
                {errors.goal && <p className="text-red-500 text-xs mt-1">{errors.goal}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teilnehmer *</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.participants.map(name => (
                    <span key={name} className="bg-digital-blue/10 text-digital-blue px-3 py-1 rounded-full flex items-center">
                      {name}
                      <button 
                        type="button"
                        className="ml-2 text-xs text-red-400 hover:text-red-600" 
                        onClick={() => removeParticipant(name)}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 border rounded px-3 py-2" 
                    placeholder="Name hinzufügen" 
                    value={newParticipant}
                    onChange={e => setNewParticipant(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addParticipant() }}}
                  />
                  <button type="button" className="btn-primary" onClick={addParticipant}>Hinzufügen</button>
                </div>
                {errors.participants && <p className="text-red-500 text-xs mt-1">{errors.participants}</p>}
              </div>

              {selectedTemplate?.agenda && selectedTemplate.agenda.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Agenda (aus Template)</label>
                  <div className="border rounded p-3 bg-gray-50">
                    {formData.agenda.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm">{item.topic}</span>
                        <span className="text-xs text-gray-500">{item.minutes} min</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-ghost" onClick={onClose}>Abbrechen</button>
              <button className="btn-primary" onClick={handleSave}>Workshop anlegen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 