import React, { useState, useMemo } from 'react'
import { diffWords, diffLines, Change } from 'diff'
import { 
  Check, 
  X, 
  GitMerge, 
  ArrowRight, 
  ArrowLeft, 
  Copy,
  Eye,
  EyeOff,
  Split,
  Layers
} from 'lucide-react'

interface DiffViewerProps {
  oldText: string
  newText: string
  mode: 'line' | 'word' | 'section'
  onMerge?: (mergedText: string) => void
  showMergeControls?: boolean
}

interface DiffChange extends Change {
  id: string
  resolved?: 'old' | 'new' | 'merged'
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  oldText,
  newText,
  mode,
  onMerge,
  showMergeControls = false
}) => {
  const [resolvedChanges, setResolvedChanges] = useState<Record<string, 'old' | 'new' | 'merged'>>({})
  const [showWordDiff, setShowWordDiff] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  // Generate diff based on mode
  const diffChanges = useMemo(() => {
    let changes: DiffChange[] = []
    
    if (mode === 'line') {
      const lineDiff = diffLines(oldText, newText, { ignoreWhitespace: false })
      changes = lineDiff.map((change, index) => ({
        ...change,
        id: `line-${index}`,
        resolved: resolvedChanges[`line-${index}`]
      }))
    } else if (mode === 'word') {
      const wordDiff = diffWords(oldText, newText, { ignoreWhitespace: false })
      changes = wordDiff.map((change, index) => ({
        ...change,
        id: `word-${index}`,
        resolved: resolvedChanges[`word-${index}`]
      }))
    } else if (mode === 'section') {
      // Section diff - split by paragraphs and compare
      const oldSections = oldText.split('\n\n').filter(s => s.trim())
      const newSections = newText.split('\n\n').filter(s => s.trim())
      
      let sectionIndex = 0
      for (let i = 0; i < Math.max(oldSections.length, newSections.length); i++) {
        const oldSection = oldSections[i] || ''
        const newSection = newSections[i] || ''
        
        if (oldSection !== newSection) {
          changes.push({
            id: `section-${sectionIndex}`,
            added: newSection !== '',
            removed: oldSection !== '',
            value: newSection || oldSection,
            resolved: resolvedChanges[`section-${sectionIndex}`]
          })
          sectionIndex++
        } else if (oldSection) {
          changes.push({
            id: `section-${sectionIndex}`,
            added: false,
            removed: false,
            value: oldSection,
            resolved: resolvedChanges[`section-${sectionIndex}`]
          })
          sectionIndex++
        }
      }
    }
    
    return changes
  }, [oldText, newText, mode, resolvedChanges])

  const handleResolveChange = (changeId: string, resolution: 'old' | 'new' | 'merged') => {
    setResolvedChanges(prev => ({
      ...prev,
      [changeId]: resolution
    }))
  }

  const getMergedText = () => {
    return diffChanges
      .map(change => {
        if (change.resolved === 'old' && change.removed) {
          return change.value
        } else if (change.resolved === 'new' && change.added) {
          return change.value
        } else if (change.resolved === 'merged') {
          return change.value
        } else if (!change.added && !change.removed) {
          return change.value
        }
        return ''
      })
      .join('')
      .trim()
  }

  const handleMerge = () => {
    const mergedText = getMergedText()
    onMerge?.(mergedText)
  }

  const getChangeIcon = (change: DiffChange) => {
    if (change.added) return <ArrowRight size={14} className="text-green-500" />
    if (change.removed) return <ArrowLeft size={14} className="text-red-500" />
    return <Copy size={14} className="text-gray-400" />
  }

  const getChangeColor = (change: DiffChange) => {
    if (change.resolved === 'old') return 'bg-blue-50 border-blue-200'
    if (change.resolved === 'new') return 'bg-green-50 border-green-200'
    if (change.resolved === 'merged') return 'bg-purple-50 border-purple-200'
    
    if (change.added) return 'bg-green-50 border-green-200'
    if (change.removed) return 'bg-red-50 border-red-200'
    return 'bg-gray-50 border-gray-200'
  }

  const getChangeTextColor = (change: DiffChange) => {
    if (change.added) return 'text-green-800'
    if (change.removed) return 'text-red-800'
    return 'text-gray-800'
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Diff-Modus:</span>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(['line', 'word', 'section'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {}}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    mode === m
                      ? 'bg-white text-digital-blue shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {m === 'line' ? 'Zeilen' : m === 'word' ? 'Wörter' : 'Abschnitte'}
                </button>
              ))}
            </div>
          </div>
          
          {mode === 'line' && (
            <button
              onClick={() => setShowWordDiff(!showWordDiff)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
            >
              {showWordDiff ? <EyeOff size={12} /> : <Eye size={12} />}
              Wort-Diff
            </button>
          )}
        </div>

        {showMergeControls && (
          <button
            onClick={handleMerge}
            className="flex items-center gap-2 px-3 py-1.5 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-2 transition-colors text-sm"
          >
            <GitMerge size={14} />
            Merge anwenden
          </button>
        )}
      </div>

      {/* Diff Content */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Entfernt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Hinzugefügt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Behalten</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {diffChanges.filter(c => c.added || c.removed).length} Änderungen
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {diffChanges.map((change, index) => (
            <div
              key={change.id}
              className={`border-b border-gray-100 last:border-b-0 ${getChangeColor(change)}`}
            >
              <div className="flex items-start gap-2 p-3">
                {/* Change Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getChangeIcon(change)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className={`font-mono text-sm whitespace-pre-wrap ${getChangeTextColor(change)}`}>
                    {change.value}
                  </div>
                  
                  {/* Word-level diff for lines */}
                  {mode === 'line' && showWordDiff && (change.added || change.removed) && (
                    <div className="mt-2 p-2 bg-white rounded border">
                      <div className="text-xs text-gray-500 mb-1">Wort-Diff:</div>
                      <div className="text-xs">
                        {diffWords(
                          change.removed ? change.value : '',
                          change.added ? change.value : '',
                          { ignoreWhitespace: false }
                        ).map((wordChange, wordIndex) => (
                          <span
                            key={wordIndex}
                            className={`${
                              wordChange.added
                                ? 'bg-green-200 text-green-800'
                                : wordChange.removed
                                ? 'bg-red-200 text-red-800'
                                : ''
                            }`}
                          >
                            {wordChange.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Merge Controls */}
                {showMergeControls && (change.added || change.removed) && (
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <button
                      onClick={() => handleResolveChange(change.id, 'old')}
                      className={`p-1 rounded ${
                        change.resolved === 'old'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Alte Version behalten"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      onClick={() => handleResolveChange(change.id, 'new')}
                      className={`p-1 rounded ${
                        change.resolved === 'new'
                          ? 'bg-green-100 text-green-600'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title="Neue Version verwenden"
                    >
                      <ArrowRight size={12} />
                    </button>
                    {change.added && change.removed && (
                      <button
                        onClick={() => handleResolveChange(change.id, 'merged')}
                        className={`p-1 rounded ${
                          change.resolved === 'merged'
                            ? 'bg-purple-100 text-purple-600'
                            : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                        title="Beide Versionen zusammenführen"
                      >
                        <Split size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Merge Preview */}
      {showMergeControls && Object.keys(resolvedChanges).length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Merge-Vorschau:</span>
          </div>
          <div className="bg-white border rounded p-3 max-h-32 overflow-y-auto">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {getMergedText()}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiffViewer
