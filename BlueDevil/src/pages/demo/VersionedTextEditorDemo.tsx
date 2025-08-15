import React, { useState, useRef, useEffect } from 'react'
import { 
  Save, 
  History, 
  Lightbulb, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Check,
  X,
  GitBranch,
  FileText,
  Clock,
  User,
  Tag,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  GitMerge,
  GitCompare,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Info,
  MoreHorizontal,
  GitCommit,
  Zap,
  ArrowLeft
} from 'lucide-react'
import WYSIWYGEditor from '../../components/WYSIWYGEditor'
import DiffViewer from '../../components/DiffViewer'
import MergeTool from '../../components/MergeTool'
import InteractiveVersioning from '../../components/InteractiveVersioning'

interface Version {
  id: string
  versionNumber: number
  createdAt: Date
  createdBy: string
  changeDescription: string
  tags: string[]
  content: string
  diffStats: { added: number; removed: number; changed: number }
}

interface AISuggestion {
  id: string
  type: 'improvement' | 'correction' | 'expansion' | 'style'
  section: { start: number; end: number }
  suggestion: string
  confidence: number
  applied: boolean
  explanation?: string
}

const VersionedTextEditorDemo: React.FC = () => {
  const [currentContent, setCurrentContent] = useState(`# Workshop: Salesforce Integration

## Projektübersicht
Dieses Workshop-Dokument beschreibt die Integration von Salesforce mit unserem bestehenden ERP-System. Das Ziel ist eine nahtlose Datenübertragung zwischen beiden Systemen.

## Anforderungen
- Automatische Synchronisation von Kundenkontakten und Leads
- Real-time Updates für Bestellungen und Rechnungen
- Integration von Reporting-Funktionen mit Dashboards
- Benutzerfreundliche Oberfläche mit Drag & Drop
- Mobile App Integration

## Technische Spezifikationen
Die Integration erfolgt über REST APIs mit OAuth 2.0-Authentifizierung. Alle Daten werden verschlüsselt übertragen und in Echtzeit synchronisiert.

## Nächste Schritte
1. API-Dokumentation analysieren
2. Testumgebung aufsetzen
3. Pilotprojekt starten
4. Vollständige Implementierung

## Timeline
- Phase 1: Setup (2 Wochen)
- Phase 2: Entwicklung (4 Wochen)
- Phase 3: Testing (2 Wochen)
- Phase 4: Deployment (1 Woche)

## Risikoanalyse
- **Technische Risiken**: API-Limits, Performance-Probleme
- **Projektrisiken**: Zeitverzögerungen, Budget-Überschreitungen
- **Mitigation**: Frühzeitige Tests, Agile Entwicklung

## Budget
- Entwicklung: €50.000
- Testing: €15.000
- Deployment: €10.000
- **Gesamt**: €75.000`)

  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [showDiffModal, setShowDiffModal] = useState(false)
  const [showMergeModal, setShowMergeModal] = useState(false)
  const [diffFromVersion, setDiffFromVersion] = useState<string | null>(null)
  const [diffToVersion, setDiffToVersion] = useState<string | null>(null)
  const [diffMode, setDiffMode] = useState<'line' | 'word' | 'section'>('line')
  const [mergeSourceVersion, setMergeSourceVersion] = useState<Version | null>(null)
  const [mergeTargetVersion, setMergeTargetVersion] = useState<Version | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showCreateVersionModal, setShowCreateVersionModal] = useState(false)
  const [newVersionDescription, setNewVersionDescription] = useState('')
  const [newVersionTags, setNewVersionTags] = useState('')
  const [showInteractiveVersioning, setShowInteractiveVersioning] = useState(false)
  const [textSelections, setTextSelections] = useState<any[]>([])

  // Real versions with localStorage persistence
  const [versions, setVersions] = useState<Version[]>(() => {
    // Force reset localStorage for demo
    localStorage.removeItem('versionedTextEditor_versions')
    
    const savedVersions = localStorage.getItem('versionedTextEditor_versions')
    if (savedVersions) {
      return JSON.parse(savedVersions).map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt)
      }))
    }
    
    // Demo versions with realistic progression
    const demoVersions: Version[] = [
      {
        id: 'v1',
        versionNumber: 1,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        createdBy: 'admin@salesfive.com',
        changeDescription: 'Initiale Erstellung des Workshop-Dokuments',
        tags: ['initial', 'workshop'],
        content: `# Workshop: Salesforce Integration

## Projektübersicht
Dieses Workshop-Dokument beschreibt die Integration von Salesforce mit unserem bestehenden ERP-System.

## Anforderungen
- Automatische Synchronisation von Kundenkontakten
- Real-time Updates für Bestellungen
- Integration von Reporting-Funktionen

## Technische Spezifikationen
Die Integration erfolgt über REST APIs mit OAuth2-Authentifizierung.`,
        diffStats: { added: 15, removed: 0, changed: 0 }
      },
      {
        id: 'v2',
        versionNumber: 2,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        createdBy: 'user@salesfive.com',
        changeDescription: 'Anforderungen erweitert und technische Details hinzugefügt',
        tags: ['requirements', 'technical'],
        content: `# Workshop: Salesforce Integration

## Projektübersicht
Dieses Workshop-Dokument beschreibt die Integration von Salesforce mit unserem bestehenden ERP-System. Das Ziel ist eine nahtlose Datenübertragung zwischen beiden Systemen.

## Anforderungen
- Automatische Synchronisation von Kundenkontakten und Leads
- Real-time Updates für Bestellungen und Rechnungen
- Integration von Reporting-Funktionen mit Dashboards
- Benutzerfreundliche Oberfläche

## Technische Spezifikationen
Die Integration erfolgt über REST APIs mit OAuth 2.0-Authentifizierung. Alle Daten werden verschlüsselt übertragen und in Echtzeit synchronisiert.

## Nächste Schritte
1. API-Dokumentation analysieren
2. Testumgebung aufsetzen`,
        diffStats: { added: 8, removed: 2, changed: 3 }
      },
      {
        id: 'v3',
        versionNumber: 3,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdBy: 'admin@salesfive.com',
        changeDescription: 'Nächste Schritte konkretisiert und Timeline hinzugefügt',
        tags: ['timeline', 'next-steps'],
        content: `# Workshop: Salesforce Integration

## Projektübersicht
Dieses Workshop-Dokument beschreibt die Integration von Salesforce mit unserem bestehenden ERP-System. Das Ziel ist eine nahtlose Datenübertragung zwischen beiden Systemen.

## Anforderungen
- Automatische Synchronisation von Kundenkontakten und Leads
- Real-time Updates für Bestellungen und Rechnungen
- Integration von Reporting-Funktionen mit Dashboards
- Benutzerfreundliche Oberfläche mit Drag & Drop

## Technische Spezifikationen
Die Integration erfolgt über REST APIs mit OAuth 2.0-Authentifizierung. Alle Daten werden verschlüsselt übertragen und in Echtzeit synchronisiert.

## Nächste Schritte
1. API-Dokumentation analysieren
2. Testumgebung aufsetzen
3. Pilotprojekt starten
4. Vollständige Implementierung

## Timeline
- Phase 1: Setup (2 Wochen)
- Phase 2: Entwicklung (4 Wochen)
- Phase 3: Testing (2 Wochen)
- Phase 4: Deployment (1 Woche)`,
        diffStats: { added: 5, removed: 1, changed: 2 }
      },
      {
        id: 'v4',
        versionNumber: 4,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        createdBy: 'user@salesfive.com',
        changeDescription: 'Risikoanalyse hinzugefügt und Budget angepasst',
        tags: ['risk-analysis', 'budget'],
        content: `# Workshop: Salesforce Integration

## Projektübersicht
Dieses Workshop-Dokument beschreibt die Integration von Salesforce mit unserem bestehenden ERP-System. Das Ziel ist eine nahtlose Datenübertragung zwischen beiden Systemen.

## Anforderungen
- Automatische Synchronisation von Kundenkontakten und Leads
- Real-time Updates für Bestellungen und Rechnungen
- Integration von Reporting-Funktionen mit Dashboards
- Benutzerfreundliche Oberfläche mit Drag & Drop
- Mobile App Integration

## Technische Spezifikationen
Die Integration erfolgt über REST APIs mit OAuth 2.0-Authentifizierung. Alle Daten werden verschlüsselt übertragen und in Echtzeit synchronisiert.

## Nächste Schritte
1. API-Dokumentation analysieren
2. Testumgebung aufsetzen
3. Pilotprojekt starten
4. Vollständige Implementierung

## Timeline
- Phase 1: Setup (2 Wochen)
- Phase 2: Entwicklung (4 Wochen)
- Phase 3: Testing (2 Wochen)
- Phase 4: Deployment (1 Woche)

## Risikoanalyse
- **Technische Risiken**: API-Limits, Performance-Probleme
- **Projektrisiken**: Zeitverzögerungen, Budget-Überschreitungen
- **Mitigation**: Frühzeitige Tests, Agile Entwicklung

## Budget
- Entwicklung: €50.000
- Testing: €15.000
- Deployment: €10.000
- **Gesamt**: €75.000`,
        diffStats: { added: 12, removed: 0, changed: 4 }
      }
    ]
    
    return demoVersions
  })

  // Save versions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('versionedTextEditor_versions', JSON.stringify(versions))
  }, [versions])

  // Calculate diff stats between two versions
  const calculateDiffStats = (oldContent: string, newContent: string) => {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    
    let added = 0
    let removed = 0
    let changed = 0
    
    // Simple diff calculation
    const maxLines = Math.max(oldLines.length, newLines.length)
    for (let i = 0; i < maxLines; i++) {
      if (i >= oldLines.length) {
        added++
      } else if (i >= newLines.length) {
        removed++
      } else if (oldLines[i] !== newLines[i]) {
        changed++
      }
    }
    
    return { added, removed, changed }
  }

  // Create new version
  const createNewVersion = () => {
    const lastVersion = versions[versions.length - 1]
    const newVersionNumber = lastVersion.versionNumber + 1
    
    const diffStats = calculateDiffStats(lastVersion.content, currentContent)
    
    const newVersion: Version = {
      id: `v${newVersionNumber}`,
      versionNumber: newVersionNumber,
      createdAt: new Date(),
      createdBy: 'demo@salesfive.com',
      changeDescription: newVersionDescription || `Version ${newVersionNumber} erstellt`,
      tags: newVersionTags ? newVersionTags.split(',').map(t => t.trim()) : [],
      content: currentContent,
      diffStats
    }
    
    setVersions(prev => [...prev, newVersion])
    setHasUnsavedChanges(false)
    setShowCreateVersionModal(false)
    setNewVersionDescription('')
    setNewVersionTags('')
  }

  // Restore version
  const restoreVersion = (version: Version) => {
    setCurrentContent(version.content)
    setHasUnsavedChanges(true)
    setSelectedVersion(version.id)
  }

  // Delete version
  const deleteVersion = (versionId: string) => {
    if (versions.length <= 1) {
      alert('Mindestens eine Version muss bestehen bleiben.')
      return
    }
    
    setVersions(prev => prev.filter(v => v.id !== versionId))
    if (selectedVersion === versionId) {
      setSelectedVersion(null)
    }
  }

  const aiSuggestions: AISuggestion[] = [
    {
      id: 'ai1',
      type: 'improvement',
      section: { start: 45, end: 52 },
      suggestion: 'Erwägen Sie die Implementierung von Webhook-basierten Updates für noch bessere Echtzeit-Performance.',
      confidence: 0.92,
      applied: false,
      explanation: 'Webhooks bieten eine effizientere Alternative zu Polling-basierten Updates.'
    },
    {
      id: 'ai2',
      type: 'correction',
      section: { start: 120, end: 125 },
      suggestion: 'OAuth2-Authentifizierung → OAuth 2.0-Authentifizierung',
      confidence: 0.98,
      applied: false,
      explanation: 'Korrekte Schreibweise des OAuth-Standards.'
    },
    {
      id: 'ai3',
      type: 'style',
      section: { start: 180, end: 190 },
      suggestion: 'Fügen Sie eine Prioritätsmatrix für die nächsten Schritte hinzu.',
      confidence: 0.85,
      applied: false,
      explanation: 'Eine Prioritätsmatrix hilft bei der Ressourcenplanung und Projektmanagement.'
    }
  ]

  const [appliedSuggestions, setAppliedSuggestions] = useState<string[]>([])

  const handleApplySuggestion = (suggestionId: string) => {
    setAppliedSuggestions(prev => [...prev, suggestionId])
  }

  const handleApplyAllSuggestions = (type: string) => {
    const typeSuggestions = aiSuggestions.filter(s => s.type === type && !appliedSuggestions.includes(s.id))
    setAppliedSuggestions(prev => [...prev, ...typeSuggestions.map(s => s.id)])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <Sparkles size={14} className="text-blue-500" />
      case 'correction': return <AlertCircle size={14} className="text-red-500" />
      case 'expansion': return <Plus size={14} className="text-green-500" />
      case 'style': return <Edit3 size={14} className="text-purple-500" />
      default: return <Info size={14} className="text-gray-500" />
    }
  }

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'border-l-blue-400 bg-blue-25'
      case 'correction': return 'border-l-red-400 bg-red-25'
      case 'expansion': return 'border-l-green-400 bg-green-25'
      case 'style': return 'border-l-purple-400 bg-purple-25'
      default: return 'border-l-gray-400 bg-gray-25'
    }
  }

  const handleContentChange = (content: string) => {
    setCurrentContent(content)
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    setHasUnsavedChanges(false)
    // Auto-save functionality - could create version here
  }

  const currentVersion = versions[versions.length - 1]

  return (
    <div className="min-h-screen bg-off-white">
      {/* Subtle Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-black">Workshop: Salesforce Integration</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <GitCommit size={14} />
              <span>v{currentVersion.versionNumber}</span>
              <span>•</span>
              <Clock size={14} />
              <span>vor {Math.floor((Date.now() - currentVersion.createdAt.getTime()) / (1000 * 60 * 60))}h bearbeitet</span>
              {hasUnsavedChanges && (
                <>
                  <span>•</span>
                  <span className="text-orange-600 font-medium">Ungespeicherte Änderungen</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Subtle AI indicator */}
            <button 
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className={`p-2 rounded-lg transition-colors ${
                showAISuggestions 
                  ? 'bg-open-blue/10 text-open-blue' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="AI-Vorschläge"
            >
              <Zap size={16} />
            </button>
            {/* Subtle version history indicator */}
            <button 
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className={`p-2 rounded-lg transition-colors ${
                showVersionHistory 
                  ? 'bg-digital-blue/10 text-digital-blue' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Versionsverlauf"
            >
              <History size={16} />
            </button>
            <button 
              onClick={() => setShowInteractiveVersioning(!showInteractiveVersioning)}
              className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
                showInteractiveVersioning
                  ? 'bg-open-blue text-white'
                  : 'bg-digital-blue text-white hover:bg-deep-blue-2'
              }`}
            >
              Interaktive Versionierung
            </button>
            <button 
              onClick={() => setShowCreateVersionModal(true)}
              className="px-3 py-1.5 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-2 transition-colors text-sm"
            >
              Version erstellen
            </button>
            <button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                hasUnsavedChanges
                  ? 'bg-digital-blue text-white hover:bg-deep-blue-2'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Speichern
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Compact Version History Panel */}
        {showVersionHistory && (
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-black">Versionsverlauf</h3>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {versions.map((version) => (
                <div 
                  key={version.id}
                  className={`p-2 rounded-md cursor-pointer transition-colors ${
                    selectedVersion === version.id 
                      ? 'bg-digital-blue/5 border border-digital-blue/20' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion(version.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-digital-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {version.versionNumber}
                      </div>
                      <span className="text-sm font-medium text-black">v{version.versionNumber}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTime(version.createdAt).split(' ')[0]}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                    {version.changeDescription}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{version.createdBy}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-green-600">+{version.diffStats.added}</span>
                      <span className="text-xs text-red-600">-{version.diffStats.removed}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <button 
                      className="text-xs text-gray-500 hover:text-digital-blue"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDiffFromVersion(version.id)
                        setDiffToVersion('current')
                        setShowDiffModal(true)
                      }}
                      title="Diff anzeigen"
                    >
                      <Eye size={10} />
                    </button>
                    <button 
                      className="text-xs text-gray-500 hover:text-open-blue"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMergeSourceVersion(version)
                        setMergeTargetVersion(versions[versions.length - 1]) // Current version
                        setShowMergeModal(true)
                      }}
                      title="Merge starten"
                    >
                      <GitMerge size={10} />
                    </button>
                    <button 
                      className="text-xs text-gray-500 hover:text-green-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        restoreVersion(version)
                      }}
                      title="Version wiederherstellen"
                    >
                      <ArrowLeft size={10} />
                    </button>
                    {versions.length > 1 && (
                      <button 
                        className="text-xs text-gray-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteVersion(version.id)
                        }}
                        title="Version löschen"
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Compact AI Suggestions Panel */}
          {showAISuggestions && (
            <div className="h-48 bg-white border-b border-gray-200 flex flex-col">
              <div className="p-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-open-blue" />
                    <h3 className="text-sm font-medium text-black">AI-Vorschläge</h3>
                    <span className="text-xs text-gray-500">({aiSuggestions.length})</span>
                  </div>
                  <button className="text-xs text-digital-blue hover:underline">
                    Alle anzeigen
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {aiSuggestions.slice(0, 2).map((suggestion) => (
                  <div 
                    key={suggestion.id}
                    className={`p-2 rounded-md border-l-2 ${getSuggestionColor(suggestion.type)} ${
                      appliedSuggestions.includes(suggestion.id) ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-1">
                        {getSuggestionIcon(suggestion.type)}
                        <span className="text-xs font-medium text-black capitalize">
                          {suggestion.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                      {appliedSuggestions.includes(suggestion.id) && (
                        <Check size={12} className="text-green-500" />
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                      {suggestion.suggestion}
                    </p>
                    
                    {!appliedSuggestions.includes(suggestion.id) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          className="px-2 py-1 bg-digital-blue text-white text-xs rounded hover:bg-deep-blue-2 transition-colors"
                        >
                          Anwenden
                        </button>
                        <button className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors">
                          Ablehnen
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Editor or Interactive Versioning */}
          <div className="flex-1 p-6">
            {showInteractiveVersioning ? (
              <InteractiveVersioning
                content={currentContent}
                onSelectionChange={setTextSelections}
              />
            ) : (
              <WYSIWYGEditor
                content={currentContent}
                onChange={handleContentChange}
                placeholder="Beginnen Sie mit dem Schreiben..."
                className="h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Create Version Modal */}
      {showCreateVersionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-96 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Neue Version erstellen</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung der Änderungen
                </label>
                <textarea
                  value={newVersionDescription}
                  onChange={(e) => setNewVersionDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                  rows={3}
                  placeholder="Beschreiben Sie die Änderungen in dieser Version..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (kommagetrennt)
                </label>
                <input
                  type="text"
                  value={newVersionTags}
                  onChange={(e) => setNewVersionTags(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                  placeholder="workshop, draft, review..."
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Änderungen seit Version {currentVersion.versionNumber}:</div>
                <div className="text-xs text-gray-500">
                  +{calculateDiffStats(currentVersion.content, currentContent).added} Zeilen hinzugefügt<br/>
                  -{calculateDiffStats(currentVersion.content, currentContent).removed} Zeilen entfernt<br/>
                  ~{calculateDiffStats(currentVersion.content, currentContent).changed} Zeilen geändert
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateVersionModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={createNewVersion}
                className="px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-2 transition-colors"
              >
                Version erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Diff Modal */}
      {showDiffModal && diffFromVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Versionsvergleich</h3>
              <button 
                onClick={() => setShowDiffModal(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <DiffViewer
                oldText={versions.find(v => v.id === diffFromVersion)?.content || ''}
                newText={currentContent}
                mode={diffMode}
                showMergeControls={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Merge Modal */}
      {showMergeModal && mergeSourceVersion && mergeTargetVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-5/6 h-5/6 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">Versionen zusammenführen</h3>
              <button 
                onClick={() => setShowMergeModal(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <MergeTool
                sourceVersion={mergeSourceVersion}
                targetVersion={mergeTargetVersion}
                onMerge={(mergedContent) => {
                  setCurrentContent(mergedContent)
                  setShowMergeModal(false)
                  setHasUnsavedChanges(true)
                }}
                onCancel={() => setShowMergeModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VersionedTextEditorDemo
