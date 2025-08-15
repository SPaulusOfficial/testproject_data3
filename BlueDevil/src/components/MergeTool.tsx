import React, { useState, useMemo } from 'react'
import { diffWords, diffLines } from 'diff'
import { 
  GitMerge, 
  GitBranch, 
  ArrowRight, 
  ArrowLeft, 
  Split,
  Layers,
  Check,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw
} from 'lucide-react'
import DiffViewer from './DiffViewer'

interface MergeToolProps {
  sourceVersion: Version
  targetVersion: Version
  onMerge: (mergedContent: string) => void
  onCancel: () => void
}

interface Version {
  id: string
  versionNumber: number
  content: string
  createdAt: Date
  createdBy: string
  changeDescription: string
}

interface MergeConflict {
  id: string
  type: 'line' | 'word' | 'section'
  sourceContent: string
  targetContent: string
  resolution: 'source' | 'target' | 'merged' | 'custom'
  customContent?: string
  startLine?: number
  endLine?: number
}

const MergeTool: React.FC<MergeToolProps> = ({
  sourceVersion,
  targetVersion,
  onMerge,
  onCancel
}) => {
  const [mergeMode, setMergeMode] = useState<'line' | 'word' | 'section'>('line')
  const [conflicts, setConflicts] = useState<MergeConflict[]>([])
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [customMergeContent, setCustomMergeContent] = useState('')

  // Detect conflicts
  const detectedConflicts = useMemo(() => {
    const newConflicts: MergeConflict[] = []
    
    if (mergeMode === 'line') {
      const lineDiff = diffLines(sourceVersion.content, targetVersion.content, { ignoreWhitespace: false })
      let lineNumber = 0
      
      lineDiff.forEach((change, index) => {
        if (change.added && change.removed) {
          newConflicts.push({
            id: `conflict-${index}`,
            type: 'line',
            sourceContent: change.value,
            targetContent: change.value,
            resolution: 'source',
            startLine: lineNumber,
            endLine: lineNumber + change.value.split('\n').length - 1
          })
        }
        lineNumber += change.value.split('\n').length - 1
      })
    } else if (mergeMode === 'word') {
      const wordDiff = diffWords(sourceVersion.content, targetVersion.content, { ignoreWhitespace: false })
      
      wordDiff.forEach((change, index) => {
        if (change.added && change.removed) {
          newConflicts.push({
            id: `conflict-${index}`,
            type: 'word',
            sourceContent: change.value,
            targetContent: change.value,
            resolution: 'source'
          })
        }
      })
    } else if (mergeMode === 'section') {
      const sourceSections = sourceVersion.content.split('\n\n').filter(s => s.trim())
      const targetSections = targetVersion.content.split('\n\n').filter(s => s.trim())
      
      sourceSections.forEach((section, index) => {
        const targetSection = targetSections[index]
        if (targetSection && section !== targetSection) {
          newConflicts.push({
            id: `conflict-${index}`,
            type: 'section',
            sourceContent: section,
            targetContent: targetSection,
            resolution: 'source'
          })
        }
      })
    }
    
    return newConflicts
  }, [sourceVersion.content, targetVersion.content, mergeMode])

  const handleConflictResolution = (conflictId: string, resolution: 'source' | 'target' | 'merged' | 'custom', customContent?: string) => {
    setResolvedConflicts(prev => ({
      ...prev,
      [conflictId]: resolution
    }))
    
    if (resolution === 'custom' && customContent) {
      setCustomMergeContent(customContent)
    }
  }

  const getMergedContent = () => {
    let mergedContent = ''
    
    if (mergeMode === 'line') {
      const lineDiff = diffLines(sourceVersion.content, targetVersion.content, { ignoreWhitespace: false })
      
      lineDiff.forEach((change, index) => {
        const conflictId = `conflict-${index}`
        const resolution = resolvedConflicts[conflictId]
        
        if (change.added && change.removed) {
          // Conflict detected
          if (resolution === 'source') {
            mergedContent += change.value
          } else if (resolution === 'target') {
            mergedContent += change.value
          } else if (resolution === 'merged') {
            mergedContent += change.value + '\n' + change.value
          } else if (resolution === 'custom') {
            mergedContent += customMergeContent
          }
        } else {
          mergedContent += change.value
        }
      })
    } else if (mergeMode === 'word') {
      const wordDiff = diffWords(sourceVersion.content, targetVersion.content, { ignoreWhitespace: false })
      
      wordDiff.forEach((change, index) => {
        const conflictId = `conflict-${index}`
        const resolution = resolvedConflicts[conflictId]
        
        if (change.added && change.removed) {
          if (resolution === 'source') {
            mergedContent += change.value
          } else if (resolution === 'target') {
            mergedContent += change.value
          } else if (resolution === 'merged') {
            mergedContent += change.value + ' ' + change.value
          } else if (resolution === 'custom') {
            mergedContent += customMergeContent
          }
        } else {
          mergedContent += change.value
        }
      })
    }
    
    return mergedContent
  }

  const handleMerge = () => {
    const mergedContent = getMergedContent()
    onMerge(mergedContent)
  }

  const unresolvedConflicts = detectedConflicts.filter(conflict => !resolvedConflicts[conflict.id])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black">Versionen zusammenführen</h3>
          <p className="text-sm text-gray-600">
            {sourceVersion.versionNumber} → {targetVersion.versionNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            Vorschau
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Abbrechen
          </button>
        </div>
      </div>

      {/* Merge Mode Selection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Merge-Modus:</span>
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 border">
            {(['line', 'word', 'section'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMergeMode(mode)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mergeMode === mode
                    ? 'bg-digital-blue text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {mode === 'line' ? 'Zeilen' : mode === 'word' ? 'Wörter' : 'Abschnitte'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Version Comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={16} className="text-blue-500" />
            <h4 className="font-medium text-black">Quellversion (v{sourceVersion.versionNumber})</h4>
          </div>
          <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {sourceVersion.content}
            </pre>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {sourceVersion.changeDescription}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={16} className="text-green-500" />
            <h4 className="font-medium text-black">Zielversion (v{targetVersion.versionNumber})</h4>
          </div>
          <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {targetVersion.content}
            </pre>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {targetVersion.changeDescription}
          </div>
        </div>
      </div>

      {/* Conflict Resolution */}
      {detectedConflicts.length > 0 && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-orange-500" />
            <h4 className="font-medium text-black">
              {detectedConflicts.length} Konflikt{detectedConflicts.length !== 1 ? 'e' : ''} gefunden
            </h4>
            {unresolvedConflicts.length > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                {unresolvedConflicts.length} ungelöst
              </span>
            )}
          </div>

          <div className="space-y-3">
            {detectedConflicts.map((conflict) => (
              <div key={conflict.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Konflikt {conflict.id} ({conflict.type})
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleConflictResolution(conflict.id, 'source')}
                      className={`p-1 rounded ${
                        resolvedConflicts[conflict.id] === 'source'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title="Quellversion verwenden"
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      onClick={() => handleConflictResolution(conflict.id, 'target')}
                      className={`p-1 rounded ${
                        resolvedConflicts[conflict.id] === 'target'
                          ? 'bg-green-100 text-green-600'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title="Zielversion verwenden"
                    >
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleConflictResolution(conflict.id, 'merged')}
                      className={`p-1 rounded ${
                        resolvedConflicts[conflict.id] === 'merged'
                          ? 'bg-purple-100 text-purple-600'
                          : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                      title="Beide Versionen zusammenführen"
                    >
                      <Split size={12} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="text-xs text-red-600 mb-1">Quellversion:</div>
                    <pre className="font-mono text-xs text-red-800 whitespace-pre-wrap">
                      {conflict.sourceContent}
                    </pre>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="text-xs text-green-600 mb-1">Zielversion:</div>
                    <pre className="font-mono text-xs text-green-800 whitespace-pre-wrap">
                      {conflict.targetContent}
                    </pre>
                  </div>
                </div>

                {resolvedConflicts[conflict.id] && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-xs text-blue-600 mb-1">Gewählte Lösung:</div>
                    <div className="text-xs text-blue-800">
                      {resolvedConflicts[conflict.id] === 'source' && 'Quellversion wird verwendet'}
                      {resolvedConflicts[conflict.id] === 'target' && 'Zielversion wird verwendet'}
                      {resolvedConflicts[conflict.id] === 'merged' && 'Beide Versionen werden zusammengeführt'}
                      {resolvedConflicts[conflict.id] === 'custom' && 'Benutzerdefinierte Lösung'}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Merge Preview */}
      {showPreview && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-gray-600" />
            <h4 className="font-medium text-black">Merge-Vorschau</h4>
          </div>
          <div className="bg-gray-50 rounded p-3 max-h-64 overflow-y-auto">
            <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {getMergedContent()}
            </pre>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Check size={14} />
          <span>
            {detectedConflicts.length - unresolvedConflicts.length} von {detectedConflicts.length} Konflikten gelöst
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleMerge}
            disabled={unresolvedConflicts.length > 0}
            className={`px-4 py-2 rounded-lg transition-colors ${
              unresolvedConflicts.length > 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-digital-blue text-white hover:bg-deep-blue-2'
            }`}
          >
            <GitMerge size={14} className="inline mr-2" />
            Zusammenführen
          </button>
        </div>
      </div>
    </div>
  )
}

export default MergeTool
