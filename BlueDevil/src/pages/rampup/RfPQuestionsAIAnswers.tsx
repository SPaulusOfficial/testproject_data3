import React, { useState } from 'react'
import { Search, MessageSquare, CheckCircle, Clock, AlertCircle, Copy, Download, Edit2, X, Check, FileText, Link, BookOpen } from 'lucide-react'

interface AIAnswer {
  id: string
  question: string
  answer: string
  confidence: number
  status: 'draft' | 'reviewed' | 'approved'
  category: string
  source: string
  generatedAt: string
  reviewedBy?: string
  notes?: string
  references?: Array<{
    id: string
    type: 'similar_question' | 'source_document' | 'previous_rfp'
    title: string
    description: string
    relevance: number
    url?: string
  }>
}

export const RfPQuestionsAIAnswers: React.FC = () => {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedAnswer, setEditedAnswer] = useState<string>('')
  const [expandedReferences, setExpandedReferences] = useState<Set<string>>(new Set())

  // Demo-Daten
  const demoAnswers: AIAnswer[] = [
    {
      id: '1',
      question: 'Welche Integrationen mit bestehenden Systemen sind erforderlich?',
      answer: 'Basierend auf der Analyse Ihrer bestehenden Systemlandschaft empfehlen wir folgende Integrationen:\n\n• SAP ERP Integration über REST APIs\n• Active Directory für Single Sign-On\n• E-Mail-System (Exchange/Office 365)\n• Dokumentenmanagement-System\n• CRM-System (falls vorhanden)\n\nDie Integrationen werden über standardisierte APIs realisiert und umfassen sowohl Datenübertragung als auch Prozesssynchronisation.',
      confidence: 0.92,
      status: 'approved',
      category: 'Technische Anforderungen',
      source: 'RfP_Acme_GmbH.pdf',
      generatedAt: '2024-07-01 14:30',
      reviewedBy: 'Max Mustermann',
      notes: 'Integration mit SAP ERP bestätigt',
      references: [
        {
          id: 'ref1',
          type: 'similar_question',
          title: 'Vergleichbare Frage in RfP XYZ GmbH',
          description: 'Systemintegration und API-Anforderungen',
          relevance: 0.95,
          url: '/rfp/xyz-gmbh'
        },
        {
          id: 'ref2',
          type: 'source_document',
          title: 'Technische Spezifikation Acme GmbH',
          description: 'Bestehende Systemlandschaft und Integrationen',
          relevance: 0.88,
          url: '/documents/tech-spec-acme'
        },
        {
          id: 'ref3',
          type: 'previous_rfp',
          title: 'RfP Müller AG - Integration Requirements',
          description: 'Ähnliche Anforderungen bei vergleichbarem Projekt',
          relevance: 0.82,
          url: '/rfp/mueller-ag'
        }
      ]
    },
    {
      id: '2',
      question: 'Wie wird die DSGVO-Compliance sichergestellt?',
      answer: 'Die DSGVO-Compliance wird durch folgende Maßnahmen sichergestellt:\n\n• Verschlüsselte Datenübertragung (TLS 1.3)\n• Datenverschlüsselung im Ruhezustand (AES-256)\n• Rollenbasierte Zugriffskontrolle (RBAC)\n• Audit-Logging aller Datenzugriffe\n• Automatische Datenlöschung nach Ablauf der Aufbewahrungsfrist\n• DSGVO-konforme Verträge zur Auftragsverarbeitung\n• Regelmäßige Compliance-Audits',
      confidence: 0.89,
      status: 'reviewed',
      category: 'Compliance & Sicherheit',
      source: 'RfP_Acme_GmbH.pdf',
      generatedAt: '2024-07-01 15:15',
      references: [
        {
          id: 'ref4',
          type: 'source_document',
          title: 'DSGVO-Compliance Checkliste',
          description: 'Interne Compliance-Richtlinien und Checklisten',
          relevance: 0.91,
          url: '/documents/dsgvo-checklist'
        },
        {
          id: 'ref5',
          type: 'previous_rfp',
          title: 'RfP Schmidt GmbH - Compliance',
          description: 'Ähnliche DSGVO-Anforderungen erfolgreich umgesetzt',
          relevance: 0.87,
          url: '/rfp/schmidt-gmbh'
        }
      ]
    },
    {
      id: '3',
      question: 'Welche Schulungsmaßnahmen sind im Angebot enthalten?',
      answer: 'Das Schulungsprogramm umfasst:\n\n• 2-tägiger Administrator-Workshop\n• 1-tägiger End-User-Workshop\n• Online-Training-Module\n• Dokumentation und Video-Tutorials\n• 3 Monate Support nach Go-Live\n• Refresher-Workshop nach 6 Monaten\n\nDie Schulungen werden von zertifizierten Trainern durchgeführt und sind auf Ihre spezifischen Prozesse zugeschnitten.',
      confidence: 0.85,
      status: 'draft',
      category: 'Change Management',
      source: 'RfP_Acme_GmbH.pdf',
      generatedAt: '2024-07-01 16:00',
      references: [
        {
          id: 'ref6',
          type: 'similar_question',
          title: 'Vergleichbare Frage in RfP Weber AG',
          description: 'Schulungsanforderungen und Change Management',
          relevance: 0.89,
          url: '/rfp/weber-ag'
        },
        {
          id: 'ref7',
          type: 'source_document',
          title: 'Standard-Schulungskatalog',
          description: 'Basis-Schulungsmodule und Zertifizierungen',
          relevance: 0.84,
          url: '/documents/training-catalog'
        }
      ]
    }
  ]

  // Replace demoAnswers with state for local editing
  const [answers, setAnswers] = useState<AIAnswer[]>(demoAnswers)

  const generateAnswers = async () => {
    if (selectedQuestions.length === 0) return
    
    setIsGenerating(true)
    // Simuliere KI-Generierung
    await new Promise(resolve => setTimeout(resolve, 5000))
    setIsGenerating(false)
  }

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const toggleReferences = (answerId: string) => {
    setExpandedReferences(prev => {
      const newSet = new Set(prev)
      if (newSet.has(answerId)) {
        newSet.delete(answerId)
      } else {
        newSet.add(answerId)
      }
      return newSet
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />
      case 'reviewed':
        return <Clock size={16} className="text-yellow-500" />
      case 'draft':
        return <AlertCircle size={16} className="text-gray-500" />
      default:
        return <AlertCircle size={16} className="text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Genehmigt'
      case 'reviewed':
        return 'Überprüft'
      case 'draft':
        return 'Entwurf'
      default:
        return 'Entwurf'
    }
  }

  const filteredAnswers = answers.filter(answer => {
    if (filter === 'all') return true
    return answer.status === filter
  })

  const getReferenceIcon = (type: string) => {
    switch (type) {
      case 'similar_question':
        return <Search size={14} className="text-blue-500" />
      case 'source_document':
        return <FileText size={14} className="text-green-500" />
      case 'previous_rfp':
        return <BookOpen size={14} className="text-purple-500" />
      default:
        return <Link size={14} className="text-gray-500" />
    }
  }

  const getReferenceTypeText = (type: string) => {
    switch (type) {
      case 'similar_question':
        return 'Vergleichbare Frage'
      case 'source_document':
        return 'Quellendokument'
      case 'previous_rfp':
        return 'Vorheriges RfP'
      default:
        return 'Referenz'
    }
  }

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.9) return 'text-green-600'
    if (relevance >= 0.8) return 'text-blue-600'
    if (relevance >= 0.7) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Search size={32} className="text-digital-blue" />
        <h1 className="text-h2 font-bold">KI-gestützte Antworten</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Fragen-Auswahl */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Fragen für KI-Antworten</h2>
          
          <div className="space-y-3">
            {demoAnswers.map(answer => (
              <label key={answer.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(answer.id)}
                  onChange={() => toggleQuestionSelection(answer.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{answer.question}</p>
                  <p className="text-xs text-gray-500 mt-1">{answer.category}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={generateAnswers}
            disabled={selectedQuestions.length === 0 || isGenerating}
            className="btn-primary w-full mt-4"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Antworten generieren...
              </>
            ) : (
              <>
                <MessageSquare size={16} className="mr-2" />
                KI-Antworten generieren ({selectedQuestions.length})
              </>
            )}
          </button>
        </div>

        {/* Antworten-Übersicht */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Generierte Antworten</h2>
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="all">Alle Status</option>
                    <option value="draft">Entwürfe</option>
                    <option value="reviewed">Überprüft</option>
                    <option value="approved">Genehmigt</option>
                  </select>
                  <button className="btn-ghost flex items-center gap-2">
                    <Download size={16} />
                    Export
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {filteredAnswers.map(answer => (
                  <div key={answer.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(answer.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(answer.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(answer.confidence * 100)}% Konfidenz
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-ghost p-2" title="Antwort kopieren" onClick={() => navigator.clipboard.writeText(answer.answer)}>
                          <Copy size={16} />
                        </button>
                        {editingId === answer.id ? null : (
                          <button className="btn-ghost p-2" title="Antwort bearbeiten" onClick={() => { setEditingId(answer.id); setEditedAnswer(answer.answer) }}>
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900 mb-2">Frage:</h3>
                      <p className="text-gray-700">{answer.question}</p>
                    </div>

                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900 mb-2">KI-Antwort:</h3>
                      {editingId === answer.id ? (
                        <div>
                          <textarea
                            className="w-full border rounded p-2 text-sm mb-2"
                            rows={6}
                            value={editedAnswer}
                            onChange={e => setEditedAnswer(e.target.value)}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              className="btn-primary flex items-center gap-1"
                              onClick={() => {
                                setAnswers(prev => prev.map(a => a.id === answer.id ? { ...a, answer: editedAnswer } : a))
                                setEditingId(null)
                              }}
                            >
                              <Check size={16} /> Speichern
                            </button>
                            <button
                              className="btn-ghost flex items-center gap-1"
                              onClick={() => setEditingId(null)}
                            >
                              <X size={16} /> Abbrechen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded p-3 text-sm whitespace-pre-line">
                          {answer.answer}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Generiert: {answer.generatedAt}</span>
                      {answer.reviewedBy && (
                        <span>Überprüft von: {answer.reviewedBy}</span>
                      )}
                    </div>

                    {answer.notes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                        <strong>Notizen:</strong> {answer.notes}
                      </div>
                    )}

                    {answer.references && answer.references.length > 0 && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleReferences(answer.id)}
                          className="flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900 mb-2"
                        >
                          <Link size={16} />
                          Referenzen & Quellen ({answer.references.length})
                          <span className={`transform transition-transform ${expandedReferences.has(answer.id) ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        
                        {expandedReferences.has(answer.id) && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="space-y-2">
                              {answer.references.map(ref => (
                                <div key={ref.id} className="flex items-start gap-2 p-2 bg-white rounded border">
                                  <div className="flex-shrink-0 mt-1">
                                    {getReferenceIcon(ref.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-gray-600">
                                        {getReferenceTypeText(ref.type)}
                                      </span>
                                      <span className={`text-xs font-medium ${getRelevanceColor(ref.relevance)}`}>
                                        {Math.round(ref.relevance * 100)}% Relevanz
                                      </span>
                                    </div>
                                    <a 
                                      href={ref.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-sm font-medium text-blue-700 hover:text-blue-900 underline block"
                                    >
                                      {ref.title}
                                    </a>
                                    <p className="text-xs text-gray-600 mt-1">{ref.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-blue-700">
                              Diese Antworten wurden basierend auf den oben genannten Quellen und vergleichbaren RfPs generiert.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KI-Einstellungen */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">KI-Einstellungen</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">KI-Modell</label>
            <select className="w-full border rounded px-3 py-2">
              <option>GPT-4 (Standard)</option>
              <option>Claude-3 (Für komplexe Antworten)</option>
              <option>Gemini Pro (Für technische Inhalte)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Antwort-Stil</label>
            <select className="w-full border rounded px-3 py-2">
              <option>Formell & Professionell</option>
              <option>Technisch Detailliert</option>
              <option>Kurz & Prägnant</option>
              <option>Verkaufsorientiert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Konfidenz-Schwelle</label>
            <select className="w-full border rounded px-3 py-2">
              <option>80% (Standard)</option>
              <option>90% (Konservativ)</option>
              <option>70% (Liberal)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
} 