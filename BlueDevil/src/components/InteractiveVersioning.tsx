import React, { useState, useRef, useEffect } from 'react'
import { 
  Check, 
  X, 
  Plus, 
  GitCommit, 
  Eye, 
  Copy,
  ArrowRight,
  ArrowLeft,
  GitMerge,
  Layers,
  MousePointer
} from 'lucide-react'

interface TextSelection {
  id: string
  start: number
  end: number
  text: string
  action: 'include' | 'exclude' | 'modify'
  comment?: string
}

interface InteractiveVersioningProps {
  content: string
  onSelectionChange: (selections: TextSelection[]) => void
}

const InteractiveVersioning: React.FC<InteractiveVersioningProps> = ({
  content,
  onSelectionChange
}) => {
  const [selections, setSelections] = useState<TextSelection[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [currentSelection, setCurrentSelection] = useState<{ start: number; end: number } | null>(null)
  const [showSelectionPanel, setShowSelectionPanel] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const textNode = textRef.current
    
    if (!textNode || !textNode.contains(range.commonAncestorContainer)) return

    const start = range.startOffset
    const end = range.endOffset
    const selectedText = range.toString().trim()

    if (selectedText.length > 0) {
      setCurrentSelection({ start, end })
      setShowSelectionPanel(true)
      setIsSelecting(true)
    }
  }

  const addSelection = (action: 'include' | 'exclude' | 'modify', comment?: string) => {
    if (!currentSelection) return

    const newSelection: TextSelection = {
      id: `sel-${Date.now()}`,
      start: currentSelection.start,
      end: currentSelection.end,
      text: window.getSelection()?.toString() || '',
      action,
      comment
    }

    setSelections(prev => [...prev, newSelection])
    onSelectionChange([...selections, newSelection])
    
    setCurrentSelection(null)
    setShowSelectionPanel(false)
    setIsSelecting(false)
    window.getSelection()?.removeAllRanges()
  }

  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(s => s.id !== id))
    onSelectionChange(selections.filter(s => s.id !== id))
  }

  const getSelectionColor = (action: string) => {
    switch (action) {
      case 'include': return 'bg-green-100 border-green-300'
      case 'exclude': return 'bg-red-100 border-red-300'
      case 'modify': return 'bg-blue-100 border-blue-300'
      default: return 'bg-gray-100 border-gray-300'
    }
  }

  const getSelectionIcon = (action: string) => {
    switch (action) {
      case 'include': return <Plus size={12} className="text-green-600" />
      case 'exclude': return <X size={12} className="text-red-600" />
      case 'modify': return <Copy size={12} className="text-blue-600" />
      default: return <MousePointer size={12} className="text-gray-600" />
    }
  }

  return (
    <div className="relative">
      {/* Text Content with Selection */}
      <div 
        ref={textRef}
        className="relative p-4 border border-gray-300 rounded-lg bg-white min-h-[200px]"
        onMouseUp={handleMouseUp}
        style={{ userSelect: 'text' }}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>

        {/* Selection Panel */}
        {showSelectionPanel && currentSelection && (
          <div className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10"
               style={{ 
                 top: '10px', 
                 right: '10px',
                 minWidth: '200px'
               }}>
            <div className="text-xs text-gray-600 mb-2">
              Ausgewählter Text: "{window.getSelection()?.toString().substring(0, 50)}..."
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => addSelection('include', 'In neue Version übernehmen')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm"
              >
                <Plus size={14} />
                Übernehmen
              </button>
              
              <button
                onClick={() => addSelection('exclude', 'Aus neuer Version ausschließen')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm"
              >
                <X size={14} />
                Ausschließen
              </button>
              
              <button
                onClick={() => addSelection('modify', 'Für Änderung markieren')}
                className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm"
              >
                <Copy size={14} />
                Ändern
              </button>
              
              <button
                onClick={() => {
                  setCurrentSelection(null)
                  setShowSelectionPanel(false)
                  setIsSelecting(false)
                  window.getSelection()?.removeAllRanges()
                }}
                className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selections Overview */}
      {selections.length > 0 && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-gray-600" />
            <h4 className="font-medium text-black">Ausgewählte Bereiche ({selections.length})</h4>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selections.map((selection) => (
              <div 
                key={selection.id}
                className={`p-3 rounded-lg border ${getSelectionColor(selection.action)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getSelectionIcon(selection.action)}
                    <span className="text-sm font-medium capitalize">
                      {selection.action === 'include' ? 'Übernehmen' : 
                       selection.action === 'exclude' ? 'Ausschließen' : 'Ändern'}
                    </span>
                  </div>
                  <button
                    onClick={() => removeSelection(selection.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <div className="mt-2 text-sm text-gray-700">
                  "{selection.text.substring(0, 100)}{selection.text.length > 100 ? '...' : ''}"
                </div>
                
                {selection.comment && (
                  <div className="mt-1 text-xs text-gray-500">
                    {selection.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button className="flex items-center gap-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-2 transition-colors text-sm">
              <GitCommit size={14} />
              Neue Version mit Auswahl erstellen
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <MousePointer size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Interaktive Versionierung</span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>• Text markieren → Aktion wählen → In neue Version übernehmen</div>
          <div>• <span className="font-medium">Übernehmen:</span> Bereich in neue Version einfügen</div>
          <div>• <span className="font-medium">Ausschließen:</span> Bereich aus neuer Version entfernen</div>
          <div>• <span className="font-medium">Ändern:</span> Bereich für Modifikation markieren</div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveVersioning
