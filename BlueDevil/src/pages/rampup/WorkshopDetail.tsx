import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DSGVODialog } from '@/components/DSGVODialog'
import { AIAgendaGenerator } from '@/components/AIAgendaGenerator'

const TABS = [
  { key: 'prep', label: 'Vorbereitung' },
  { key: 'live', label: 'Live' },
  { key: 'post', label: 'Nachbereitung' },
]

// Dummy-Agenda und Teilnehmer
const initialAgenda = [
  { id: '1', topic: 'Begrüßung & Zielsetzung', minutes: 10 },
  { id: '2', topic: 'Ist-Analyse', minutes: 30 },
  { id: '3', topic: 'Diskussion & Fragen', minutes: 40 },
  { id: '4', topic: 'Nächste Schritte', minutes: 10 },
]

// Dummy-Teilnehmer und Consent-Status für das Projekt (wie in ProjectParticipants)
const initialParticipants = [
  { id: '1', name: 'Anna', email: 'anna@firma.de', type: 'intern' },
  { id: '2', name: 'Bernd', email: 'bernd@kunde.com', type: 'extern' },
  { id: '3', name: 'Clara', email: 'clara@kunde.com', type: 'extern' },
  { id: '4', name: 'David', email: 'david@firma.de', type: 'intern' },
]

// Add index signature for consent type
const dummyConsent: { [key: string]: { status: string; date: string | null } } = {
  '2': { status: 'granted', date: '2024-07-01' },
  '3': { status: 'pending', date: null },
}

// Dummy-Fragenvorschläge
const dummyQuestions = [
  'Welche aktuellen Prozesse sind am problematischsten?',
  'Wie sieht die Datenqualität in Ihren Systemen aus?',
  'Welche Integrationen sind für Sie kritisch?',
  'Wie ist die Akzeptanz bei den Endnutzern?',
]

// Dummy-Summary und Action-Items
const dummySummary = `Im Workshop wurden die aktuellen Herausforderungen im Prozess identifiziert. Die wichtigsten Themen waren Datenqualität, Systemintegration und Nutzerakzeptanz. Als nächste Schritte wurden konkrete Action-Items definiert.`
const initialActionItems = [
  { id: '1', text: 'Datenqualität im CRM prüfen', responsible: 'Anna' },
  { id: '2', text: 'Integrations-Workshop mit IT planen', responsible: 'Bernd' },
]

// API Configuration
const API_BASE = import.meta.env.VITE_MEETING_ASSISTANT_API_BASE || 'http://localhost:3221'
const API_KEY = import.meta.env.VITE_MEETING_ASSISTANT_API_KEY || 'test123'
const MEETING_ID = import.meta.env.VITE_DEMO_MEETING_ID || 'f1c122f5-8da1-40ae-98d8-857b0f416ded'

// Demo Transkripte
const demoTranscripts = [
  { text: "Willkommen zum Workshop! Heute besprechen wir die Prozessoptimierung.", audio_type: "tab" },
  { text: "Die aktuellen Prozesse sind sehr manuell und fehleranfällig.", audio_type: "microphone" },
  { text: "Wir benötigen eine bessere Integration zwischen den Systemen.", audio_type: "tab" },
  { text: "Die Datenqualität ist ein großes Problem in unserem Unternehmen.", audio_type: "microphone" },
  { text: "Wie sieht die Akzeptanz bei den Endnutzern aus?", audio_type: "tab" },
  { text: "Wir haben viele Legacy-Systeme, die nicht mehr unterstützt werden.", audio_type: "microphone" },
  { text: "Die Automatisierung könnte uns 30% Zeit sparen.", audio_type: "tab" },
  { text: "Welche Prioritäten setzen wir für die nächsten Monate?", audio_type: "microphone" },
  { text: "Die Cloud-Migration ist ein wichtiger Schritt.", audio_type: "tab" },
  { text: "Wir sollten ein Proof of Concept starten.", audio_type: "microphone" }
]

export default function WorkshopDetail() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState('prep')
  const navigate = useNavigate()

  // Workshop-Infos (Dummy)
  const [info, setInfo] = useState({
    title: 'Kickoff Workshop',
    date: '2024-07-01',
    phase: 'PreSales',
    customer: 'Acme GmbH',
    goal: 'Transparenz über aktuelle Prozesse schaffen und Zielbild definieren',
  })

  // Verlinkter Content
  const [references, setReferences] = useState<Array<{ id: string, label: string, url: string }>>([
    { id: '1', label: 'Projektsteckbrief', url: 'https://confluence.example.com/project-123' },
    { id: '2', label: 'Altsystem-Dokumentation', url: 'https://drive.example.com/abc' },
  ])
  const [newRefLabel, setNewRefLabel] = useState('')
  const [newRefUrl, setNewRefUrl] = useState('')

  // Agenda-Editor
  const [agenda, setAgenda] = useState(initialAgenda)
  const [newAgendaTopic, setNewAgendaTopic] = useState('')
  const [newAgendaMinutes, setNewAgendaMinutes] = useState(10)

  // Teilnehmerverwaltung
  const [participants, setParticipants] = useState(initialParticipants)
  const [consent, setConsent] = useState(dummyConsent)
  const [newParticipant, setNewParticipant] = useState('')

  // Live-Transkription mit API
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<Array<{ id: string, text: string, timestamp: string, isHighlight: boolean, audio_type?: string }>>([])
  const [currentText, setCurrentText] = useState('')
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [meetingData, setMeetingData] = useState<any>(null)
  const transcriptContainerRef = useRef<HTMLDivElement>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [demoInterval, setDemoInterval] = useState<NodeJS.Timeout | null>(null)

  // Notizen
  const [notes, setNotes] = useState<Array<{ id: string, text: string, timestamp: string }>>([
    { id: '1', text: 'Kunde hat Budget für Q4 2024', timestamp: '09:02' },
    { id: '2', text: 'IT-Team ist skeptisch gegenüber Cloud-Lösungen', timestamp: '09:08' },
  ])
  const [newNote, setNewNote] = useState('')

  // Action-Items
  const [actionItems, setActionItems] = useState(initialActionItems)
  const [newActionText, setNewActionText] = useState('')
  const [newActionResp, setNewActionResp] = useState('')

  // DSGVO-Dialog State
  const [showDSGVO, setShowDSGVO] = useState(false)
  const [dsgvoAccepted, setDSGVOAccepted] = useState(false)

  // Drag&Drop für Agenda (einfach, ohne externe Lib)
  const moveAgendaItem = (from: number, to: number) => {
    if (to < 0 || to >= agenda.length) return
    const updated = [...agenda]
    const [item] = updated.splice(from, 1)
    updated.splice(to, 0, item)
    setAgenda(updated)
  }

  const handleAddAgenda = () => {
    if (!newAgendaTopic.trim()) return
    setAgenda([...agenda, { id: Date.now().toString(), topic: newAgendaTopic, minutes: newAgendaMinutes }])
    setNewAgendaTopic('')
    setNewAgendaMinutes(10)
  }

  const handleRemoveAgenda = (id: string) => {
    setAgenda(agenda.filter(a => a.id !== id))
  }

  // Update handleAddParticipant and handleRemoveParticipant to work with participant objects
  const handleAddParticipant = () => {
    const name = newParticipant.trim()
    if (!name || participants.some(p => p.name === name)) return
    // For demo, generate dummy email/type
    const email = name.toLowerCase().replace(/ /g, '.') + '@extern.com'
    setParticipants([...participants, { id: Date.now().toString(), name, email, type: 'extern' }])
    setNewParticipant('')
  }
  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id))
  }

  // Verlinkter Content
  const handleAddReference = () => {
    if (!newRefLabel.trim() || !newRefUrl.trim()) return
    setReferences([...references, { id: Date.now().toString(), label: newRefLabel, url: newRefUrl }])
    setNewRefLabel('')
    setNewRefUrl('')
  }
  const handleRemoveReference = (id: string) => {
    setReferences(references.filter(r => r.id !== id))
  }

  // Consent-Check: Sind alle externen Teilnehmer auf "granted"?
  const allExternalConsented = participants
    .filter(p => p.type === 'extern')
    .every(p => consent[p.id]?.status === 'granted')

  // API Functions
  const fetchMeetingTranscripts = async () => {
    setIsLoadingTranscript(true)
    setTranscriptError(null)
    
    try {
      const response = await fetch(`${API_BASE}/meetings/${MEETING_ID}`, {
        headers: {
          'x-api-key': API_KEY
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setMeetingData(data)
      
      // Transform API transcripts to our format
      const transformedTranscripts = data.transcripts?.map((t: any) => ({
        id: t.id,
        text: t.transcript,
        timestamp: new Date(t.chunk_start_time).toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isHighlight: false,
        audio_type: t.audio_type
      })) || []
      
      setTranscript(transformedTranscripts)
    } catch (error) {
      console.error('Error fetching transcripts:', error)
      setTranscriptError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoadingTranscript(false)
    }
  }

  // Polling für Live-Updates
  useEffect(() => {
    if (tab === 'live' && !demoMode) {
      // Initial load
      fetchMeetingTranscripts()
      
      // Poll every 5 seconds when on live tab (nur wenn nicht im Demo-Modus)
      const interval = setInterval(() => {
        fetchMeetingTranscripts()
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [tab, demoMode])

  // Demo-Funktionen
  const startDemoMode = () => {
    setDemoMode(true)
    
    // Füge erste Demo-Nachricht hinzu (nur wenn noch keine Transkripte vorhanden)
    if (transcript.length === 0 && demoTranscripts.length > 0) {
      const now = new Date()
      const timestamp = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
      setTranscript([{
        id: Date.now().toString(),
        text: demoTranscripts[0].text,
        timestamp,
        isHighlight: false,
        audio_type: demoTranscripts[0].audio_type
      }])
    }

    // Starte Demo-Interval
    let demoIndex = transcript.length === 0 ? 1 : 0
    const interval = setInterval(() => {
      // Sicherheitscheck für gültigen Index und vorhandene Daten
      if (demoIndex >= 0 && demoIndex < demoTranscripts.length && demoTranscripts[demoIndex]) {
        const demoEntry = demoTranscripts[demoIndex]
        const now = new Date()
        const timestamp = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        setTranscript(prev => [...prev, {
          id: Date.now().toString(),
          text: demoEntry.text,
          timestamp,
          isHighlight: false,
          audio_type: demoEntry.audio_type
        }])
        demoIndex++
      } else {
        // Demo beenden
        clearInterval(interval)
        setDemoMode(false)
        setDemoInterval(null)
      }
    }, 3000) // Alle 3 Sekunden eine neue Nachricht

    setDemoInterval(interval)
  }

  const stopDemoMode = () => {
    if (demoInterval) {
      clearInterval(demoInterval)
      setDemoInterval(null)
    }
    setDemoMode(false)
  }

  // Auto-scroll Funktion
  const scrollToBottom = () => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
    }
  }

  // Auto-scroll wenn neue Transkripte hinzukommen
  useEffect(() => {
    if (transcript.length > 0) {
      scrollToBottom()
    }
  }, [transcript])

  // Demo starten wenn Live-Tab geöffnet wird (nur wenn keine echten Transkripte vorhanden)
  useEffect(() => {
    if (tab === 'live' && !demoMode && transcript.length === 0 && !isLoadingTranscript) {
      // Starte Demo nach kurzer Verzögerung
      const timer = setTimeout(() => {
        startDemoMode()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [tab, demoMode, transcript.length, isLoadingTranscript])

  // Cleanup Demo beim Tab-Wechsel
  useEffect(() => {
    if (tab !== 'live') {
      stopDemoMode()
    }
  }, [tab])

  // Live-Funktionen
  const toggleRecording = () => {
    if (!allExternalConsented) return // Aufnahme gesperrt
    if (!dsgvoAccepted) {
      setShowDSGVO(true)
      return
    }
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Start recording simulation
      console.log('Starting recording...')
      // In a real implementation, this would start the Chrome extension recording
    } else {
      // Stop recording
      console.log('Stopping recording...')
    }
  }

  const addTranscriptEntry = () => {
    if (!currentText.trim()) return
    const now = new Date()
    const timestamp = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    setTranscript([...transcript, { id: Date.now().toString(), text: currentText, timestamp, isHighlight: false }])
    setCurrentText('')
  }

  const toggleHighlight = (id: string) => {
    setTranscript(transcript.map(t => t.id === id ? { ...t, isHighlight: !t.isHighlight } : t))
  }

  const addNote = () => {
    if (!newNote.trim()) return
    const now = new Date()
    const timestamp = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    setNotes([...notes, { id: Date.now().toString(), text: newNote, timestamp }])
    setNewNote('')
  }

  // Action-Items
  const handleAddActionItem = () => {
    if (!newActionText.trim() || !newActionResp.trim()) return
    setActionItems([...actionItems, { id: Date.now().toString(), text: newActionText, responsible: newActionResp }])
    setNewActionText('')
    setNewActionResp('')
  }
  const handleRemoveActionItem = (id: string) => {
    setActionItems(actionItems.filter(a => a.id !== id))
  }

  // DSGVO-Dialog akzeptiert
  const handleDSGVOAccept = () => {
    setDSGVOAccepted(true)
    setShowDSGVO(false)
    setIsRecording(true)
    // Start recording simulation
    console.log('DSGVO akzeptiert, Aufnahme gestartet.')
  }

  // AI-Agenda übernehmen
  const handleAIAgenda = (aiAgenda: Array<{ topic: string; minutes: number }>) => {
    setAgenda(aiAgenda.map((a: { topic: string; minutes: number }, i: number) => ({ ...a, id: Date.now().toString() + i })))
  }

  return (
    <div>
      <button className="btn-ghost mb-4" onClick={() => navigate(-1)}>&larr; Zurück zur Liste</button>
      <h1 className="text-h2 font-bold mb-2">Workshop-Detail: {id}</h1>
      <div className="mb-6 flex gap-2 border-b">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`px-4 py-2 -mb-px border-b-2 text-sm font-semibold transition-colors ${tab === t.key ? 'border-digital-blue text-digital-blue' : 'border-transparent text-gray-500 hover:text-digital-blue'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>
        {tab === 'prep' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Workshop-Infos */}
            <div>
              <h2 className="text-lg font-bold mb-2">Workshop-Infos</h2>
              <form className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Titel</label>
                  <input className="w-full border rounded px-3 py-2" value={info.title} onChange={e => setInfo({ ...info, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Datum</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={info.date} onChange={e => setInfo({ ...info, date: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phase</label>
                  <select className="w-full border rounded px-3 py-2" value={info.phase} onChange={e => setInfo({ ...info, phase: e.target.value })}>
                    <option>PreSales</option>
                    <option>Solution</option>
                    <option>Build</option>
                    <option>Rollout</option>
                    <option>Hypercare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kunde</label>
                  <input className="w-full border rounded px-3 py-2" value={info.customer} onChange={e => setInfo({ ...info, customer: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Workshop-Ziel</label>
                  <textarea className="w-full border rounded px-3 py-2" rows={2} value={info.goal} onChange={e => setInfo({ ...info, goal: e.target.value })} placeholder="Was soll mit dem Workshop erreicht werden?" />
                </div>
              </form>
              {/* Verlinkter Content */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Verlinkter Content / Referenzen</h3>
                <ul className="mb-2">
                  {references.map(ref => (
                    <li key={ref.id} className="flex items-center gap-2 mb-1">
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-digital-blue underline text-sm">{ref.label}</a>
                      <span className="text-xs text-gray-400">({ref.url})</span>
                      <button className="ml-2 text-xs text-red-400 hover:text-red-600" title="Entfernen" onClick={() => handleRemoveReference(ref.id)}>&times;</button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded px-3 py-2" placeholder="Label (z.B. Doku, Confluence)" value={newRefLabel} onChange={e => setNewRefLabel(e.target.value)} />
                  <input className="flex-1 border rounded px-3 py-2" placeholder="URL oder Referenz" value={newRefUrl} onChange={e => setNewRefUrl(e.target.value)} />
                  <button className="btn-primary" onClick={handleAddReference} type="button">Hinzufügen</button>
                </div>
              </div>
            </div>
            {/* Agenda-Editor */}
            <div>
              <h2 className="text-lg font-bold mb-2">Agenda-Editor</h2>
              <ul className="mb-3 divide-y">
                {agenda.map((a, i) => (
                  <li key={a.id} className="flex items-center py-2 group">
                    <span className="font-medium flex-1">{a.topic}</span>
                    <span className="text-xs text-gray-500 w-12">{a.minutes} min</span>
                    <button className="ml-2 text-gray-400 hover:text-digital-blue" title="Nach oben" onClick={() => moveAgendaItem(i, i-1)} disabled={i===0}>&uarr;</button>
                    <button className="ml-1 text-gray-400 hover:text-digital-blue" title="Nach unten" onClick={() => moveAgendaItem(i, i+1)} disabled={i===agenda.length-1}>&darr;</button>
                    <button className="ml-2 text-red-400 hover:text-red-600" title="Entfernen" onClick={() => handleRemoveAgenda(a.id)}>&times;</button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mb-6">
                <input className="flex-1 border rounded px-3 py-2" placeholder="Neues Thema" value={newAgendaTopic} onChange={e => setNewAgendaTopic(e.target.value)} />
                <input type="number" min={1} max={240} className="w-20 border rounded px-2 py-2" value={newAgendaMinutes} onChange={e => setNewAgendaMinutes(Number(e.target.value))} />
                <button className="btn-primary" onClick={handleAddAgenda} type="button">Hinzufügen</button>
              </div>
              {/* AI-Agenda-Generator */}
              <AIAgendaGenerator
                workshopGoal={info.goal}
                phase={info.phase}
                onGenerate={handleAIAgenda}
              />
            </div>
            {/* Teilnehmerverwaltung */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-bold mb-2 mt-6">Teilnehmer</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {participants.map(p => (
                  <span key={p.id} className="bg-digital-blue/10 text-digital-blue px-3 py-1 rounded-full flex items-center">
                    {p.name} ({p.email})
                    <button className="ml-2 text-xs text-red-400 hover:text-red-600" title="Entfernen" onClick={() => handleRemoveParticipant(p.id)}>&times;</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="flex-1 border rounded px-3 py-2" placeholder="Name hinzufügen" value={newParticipant} onChange={e => setNewParticipant(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddParticipant() }}} />
                <button className="btn-primary" onClick={handleAddParticipant} type="button">Hinzufügen</button>
              </div>
            </div>
          </div>
        )}
        {tab === 'live' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Live-Transkription */}
            <div>
              <h2 className="text-lg font-bold mb-2">Live-Transkription</h2>
              
              {/* Modus-Toggle */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Transkript-Modus</h3>
                    <p className="text-xs text-gray-600">
                      {demoMode ? 'Demo-Modus: Simulierte Transkripte' : 'API-Modus: Echte Backend-Daten'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">API</span>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        demoMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      onClick={() => {
                        if (demoMode) {
                          stopDemoMode()
                        } else {
                          startDemoMode()
                        }
                      }}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          demoMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs text-gray-500">Demo</span>
                  </div>
                </div>
              </div>
              
              {!allExternalConsented && (
                <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
                  <strong>Hinweis:</strong> Nicht alle externen Teilnehmer haben ihre Einwilligung zur Audio-Aufnahme erteilt. Die Aufnahme ist gesperrt.<br />
                  Bitte stelle sicher, dass alle externen Teilnehmer ihren <a href="/projects/project-123/participants" className="underline text-digital-blue">Consent</a> erteilt haben.
                </div>
              )}
              <div className="mb-4">
                <button 
                  className={`btn-primary ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''} ${!allExternalConsented ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={toggleRecording}
                  disabled={!allExternalConsented}
                >
                  {isRecording ? '⏹️ Aufnahme stoppen' : '🎤 Aufnahme starten'}
                </button>
                {meetingData && !demoMode && (
                  <div className="mt-2 text-sm text-gray-600">
                    Meeting: {meetingData.title} ({transcript.length} Transkripte)
                  </div>
                )}
                {demoMode && (
                  <div className="mt-2 text-sm text-blue-600">
                    🎭 Demo-Modus aktiv - Live-Transkripte werden simuliert
                  </div>
                )}
              </div>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 border rounded px-3 py-2" 
                    placeholder="Transkript hinzufügen..." 
                    value={currentText}
                    onChange={e => setCurrentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTranscriptEntry() }}}
                  />
                  <button className="btn-primary" onClick={addTranscriptEntry}>Hinzufügen</button>
                </div>
              </div>
              <div className="border rounded p-4 h-64 overflow-y-auto" ref={transcriptContainerRef}>
                {isLoadingTranscript && transcript.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-digital-blue mx-auto mb-4"></div>
                    <p>Lade Transkripte...</p>
                  </div>
                )}
                {transcriptError && (
                  <div className="text-center py-4 text-red-500">
                    <p>Fehler beim Laden: {transcriptError}</p>
                    <button 
                      className="mt-2 text-sm text-digital-blue underline"
                      onClick={fetchMeetingTranscripts}
                    >
                      Erneut versuchen
                    </button>
                  </div>
                )}
                {transcript.length === 0 && !isLoadingTranscript && !transcriptError && !demoMode && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Noch keine Transkripte vorhanden.</p>
                    <p className="text-sm mt-2">Die Transkripte werden automatisch geladen, sobald Audio-Aufnahmen verfügbar sind.</p>
                  </div>
                )}
                {transcript.map(entry => (
                  <div key={entry.id} className={`mb-2 p-2 rounded ${entry.isHighlight ? 'bg-yellow-100 border-l-4 border-yellow-400' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{entry.timestamp}</span>
                        {entry.audio_type && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            entry.audio_type === 'tab' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {entry.audio_type === 'tab' ? 'Tab' : 'Mic'}
                          </span>
                        )}
                      </div>
                      <button 
                        className="text-xs text-gray-400 hover:text-yellow-600" 
                        onClick={() => toggleHighlight(entry.id)}
                        title={entry.isHighlight ? 'Highlight entfernen' : 'Als wichtig markieren'}
                      >
                        {entry.isHighlight ? '⭐' : '☆'}
                      </button>
                    </div>
                    <p className="text-sm mt-1">{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Fragenvorschläge & Notizen */}
            <div>
              <h2 className="text-lg font-bold mb-2">Fragenvorschläge</h2>
              <div className="mb-6">
                {dummyQuestions.map((q, i) => (
                  <div key={i} className="mb-2 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-sm">{q}</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">Frage übernehmen</button>
                  </div>
                ))}
              </div>
              <h2 className="text-lg font-bold mb-2">Notizen</h2>
              <div className="mb-4">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 border rounded px-3 py-2" 
                    placeholder="Notiz hinzufügen..." 
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNote() }}}
                  />
                  <button className="btn-primary" onClick={addNote}>Hinzufügen</button>
                </div>
              </div>
              <div className="border rounded p-4 h-48 overflow-y-auto">
                {notes.map(note => (
                  <div key={note.id} className="mb-2 p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">{note.timestamp}</div>
                    <p className="text-sm mt-1">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'post' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Zusammenfassung */}
            <div>
              <h2 className="text-lg font-bold mb-2">Zusammenfassung (Auto-Summary)</h2>
              <div className="bg-gray-50 border rounded p-4 mb-4 whitespace-pre-line text-sm">
                {dummySummary}
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost">PDF Export</button>
                <button className="btn-ghost">Nach Confluence exportieren</button>
                <button className="btn-ghost">Per E-Mail teilen</button>
              </div>
            </div>
            {/* Action-Items */}
            <div>
              <h2 className="text-lg font-bold mb-2">Action-Items</h2>
              <ul className="mb-3 divide-y">
                {actionItems.map(item => (
                  <li key={item.id} className="flex items-center py-2 group">
                    <span className="flex-1">{item.text}</span>
                    <span className="text-xs text-gray-500 ml-2">{item.responsible}</span>
                    <button className="ml-2 text-xs text-red-400 hover:text-red-600" title="Entfernen" onClick={() => handleRemoveActionItem(item.id)}>&times;</button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input className="flex-1 border rounded px-3 py-2" placeholder="Neue Aufgabe" value={newActionText} onChange={e => setNewActionText(e.target.value)} />
                <input className="w-32 border rounded px-3 py-2" placeholder="Verantwortlich" value={newActionResp} onChange={e => setNewActionResp(e.target.value)} />
                <button className="btn-primary" onClick={handleAddActionItem} type="button">Hinzufügen</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* DSGVO-Opt-in Dialog */}
      <DSGVODialog
        isOpen={showDSGVO}
        onClose={() => setShowDSGVO(false)}
        onAccept={handleDSGVOAccept}
      />
    </div>
  )
}