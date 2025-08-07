import React, { useState } from 'react'

interface AgendaItem {
  topic: string
  minutes: number
  description?: string
}

interface AIAgendaGeneratorProps {
  workshopGoal: string
  phase: string
  onGenerate: (agenda: AgendaItem[]) => void
}

const PHASE_CONTEXTS = {
  PreSales: {
    focus: 'Projektinitialisierung und Zieldefinition',
    commonTopics: ['Kickoff & Vorstellung', 'Projektziele & Scope', 'Aktuelle Herausforderungen', 'Nächste Schritte']
  },
  Solution: {
    focus: 'Detaillierte Analyse und Lösungsdesign',
    commonTopics: ['Prozessanalyse', 'Anforderungsermittlung', 'Lösungsansätze', 'Priorisierung']
  },
  Build: {
    focus: 'Implementierung und Entwicklung',
    commonTopics: ['User Story Mapping', 'Technische Architektur', 'Sprint-Planung', 'Qualitätssicherung']
  },
  Rollout: {
    focus: 'Einführung und Go-Live',
    commonTopics: ['Deployment-Planung', 'Schulung & Training', 'Go-Live-Vorbereitung', 'Support-Struktur']
  },
  Hypercare: {
    focus: 'Nachbetreuung und Optimierung',
    commonTopics: ['Performance-Monitoring', 'Issue-Management', 'Optimierungen', 'Lessons Learned']
  }
}

export const AIAgendaGenerator: React.FC<AIAgendaGeneratorProps> = ({ workshopGoal, phase, onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAgenda, setGeneratedAgenda] = useState<AgendaItem[]>([])

  const generateAgenda = async () => {
    setIsGenerating(true)
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const context = PHASE_CONTEXTS[phase as keyof typeof PHASE_CONTEXTS] || PHASE_CONTEXTS.PreSales
    
    // Dummy AI logic - in reality this would call an AI API
    const agenda: AgendaItem[] = [
      {
        topic: 'Begrüßung & Workshop-Ziel',
        minutes: 10,
        description: 'Kurze Vorstellung und Klärung der Workshop-Ziele'
      },
      {
        topic: context.commonTopics[0],
        minutes: 25,
        description: `Fokus auf ${context.focus}`
      },
      {
        topic: context.commonTopics[1],
        minutes: 30,
        description: 'Detaillierte Analyse und Diskussion'
      },
      {
        topic: context.commonTopics[2],
        minutes: 20,
        description: 'Erarbeitung von Lösungsansätzen'
      },
      {
        topic: 'Zusammenfassung & Nächste Schritte',
        minutes: 15,
        description: 'Festlegung der nächsten Aktivitäten'
      }
    ]
    
    setGeneratedAgenda(agenda)
    setIsGenerating(false)
  }

  const applyAgenda = () => {
    onGenerate(generatedAgenda)
    setGeneratedAgenda([])
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">AI-Agenda Generator</h3>
          <p className="text-sm text-gray-600">
            Generiere eine passende Agenda basierend auf Workshop-Ziel und Phase
          </p>
        </div>
        <button
          className={`btn-primary ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={generateAgenda}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generiere...
            </span>
          ) : (
            '🎯 AI-Agenda generieren'
          )}
        </button>
      </div>

      {generatedAgenda.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Generierte Agenda:</h4>
            <button className="btn-primary text-sm" onClick={applyAgenda}>
              Agenda übernehmen
            </button>
          </div>
          
          <div className="space-y-2">
            {generatedAgenda.map((item, index) => (
              <div key={index} className="bg-white border rounded p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium">{item.topic}</h5>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">{item.minutes} min</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            💡 <strong>AI-Hinweis:</strong> Diese Agenda wurde basierend auf dem Workshop-Ziel "{workshopGoal}" 
            und der Phase "{phase}" generiert. Sie können die Agenda nach Ihren Bedürfnissen anpassen.
          </div>
        </div>
      )}
    </div>
  )
} 