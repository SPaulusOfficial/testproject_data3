import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, AlertCircle, Info, Edit3, Eye, Save, RotateCcw, History } from 'lucide-react';

interface DiffChange {
  type: 'added' | 'deleted' | 'modified' | 'unchanged';
  line: string;
  lineNumber: number;
  confidence?: number;
}

interface DiffData {
  version1: {
    id: string;
    content: string;
    timestamp: string;
    agent: string;
  };
  version2: {
    id: string;
    content: string;
    timestamp: string;
    agent: string;
  };
  changes: DiffChange[];
  mergeSuggestion: {
    finalContent: string;
    reasoning: string;
    approvedChanges: number[];
    confidence: number;
  };
}

interface VersionComparisonProps {
  diffData: DiffData;
  onMerge: (selectedLines: number[], finalContent: string) => void;
  contentType?: 'flowing' | 'structured';
}

const VersionComparison: React.FC<VersionComparisonProps> = ({ 
  diffData, 
  onMerge,
  contentType = 'structured'
}) => {
  const [selectedLines1, setSelectedLines1] = useState<number[]>([]);
  const [selectedLines2, setSelectedLines2] = useState<number[]>([]);
  const [showMergePreview, setShowMergePreview] = useState(false);
  const [finalContent, setFinalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [livePreview, setLivePreview] = useState('');
  const [activeVersion, setActiveVersion] = useState<'v1' | 'v2' | 'merged'>('v1');

  // Split content into lines based on content type
  const splitContent = (content: string): string[] => {
    if (contentType === 'flowing') {
      // For flowing text, split by sentences and paragraphs
      return content
        .split(/(?<=[.!?])\s+/)
        .filter(line => line.trim().length > 0)
        .map(line => line.trim());
    } else {
      // For structured content, split by lines
      return content.split('\n').filter(line => line.trim().length > 0);
    }
  };

  const lines1 = splitContent(diffData.version1.content);
  const lines2 = splitContent(diffData.version2.content);

  // Enhanced line type detection for flowing text
  const getLineType = (line1: string, line2: string, index: number): 'added' | 'deleted' | 'modified' | 'unchanged' => {
    if (!line1 && line2) return 'added';
    if (line1 && !line2) return 'deleted';
    if (line1 === line2) return 'unchanged';
    
    if (contentType === 'flowing') {
      // For flowing text, use semantic similarity
      const similarity = calculateSimilarity(line1, line2);
      return similarity > 0.7 ? 'modified' : 'deleted';
    } else {
      // For structured content, exact match
      return 'modified';
    }
  };

  // Simple similarity calculation for flowing text
  const calculateSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  const toggleLine1 = (index: number) => {
    setSelectedLines1(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleLine2 = (index: number) => {
    setSelectedLines2(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const generateMergeContent = () => {
    const selectedContent: string[] = [];
    
    // Add selected lines from version 1
    selectedLines1.forEach(index => {
      if (lines1[index]) {
        selectedContent.push(lines1[index]);
      }
    });
    
    // Add selected lines from version 2
    selectedLines2.forEach(index => {
      if (lines2[index]) {
        selectedContent.push(lines2[index]);
      }
    });

    // Join based on content type
    if (contentType === 'flowing') {
      return selectedContent.join(' ');
    } else {
      return selectedContent.join('\n');
    }
  };

  // Update live preview whenever selection changes
  useEffect(() => {
    const mergedContent = generateMergeContent();
    setLivePreview(mergedContent);
    setFinalContent(mergedContent);
  }, [selectedLines1, selectedLines2]);

  const handleMerge = () => {
    const mergedContent = generateMergeContent();
    setFinalContent(mergedContent);
    setLivePreview(mergedContent);
    setShowMergePreview(true);
  };

  const confirmMerge = () => {
    const allSelectedLines = [...selectedLines1, ...selectedLines2];
    onMerge(allSelectedLines, finalContent);
  };

  const handleLivePreviewChange = (newContent: string) => {
    setLivePreview(newContent);
    setFinalContent(newContent);
  };

  const saveLivePreview = () => {
    setFinalContent(livePreview);
    setIsEditing(false);
  };

  const getActiveContent = () => {
    switch (activeVersion) {
      case 'v1':
        return diffData.version1.content;
      case 'v2':
        return diffData.version2.content;
      case 'merged':
        return livePreview || 'Keine Auswahl getroffen';
      default:
        return diffData.version1.content;
    }
  };

  return (
    <div className="space-y-4">
      {/* Simple Version Selector */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 border rounded-lg">
        <History className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Version:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveVersion('v1')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeVersion === 'v1' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            V1 ({diffData.version1.agent})
          </button>
          <button
            onClick={() => setActiveVersion('v2')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeVersion === 'v2' 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            V2 ({diffData.version2.agent})
          </button>
          <button
            onClick={() => setActiveVersion('merged')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              activeVersion === 'merged' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Merged
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border rounded-lg">
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {activeVersion === 'v1' && `Version 1 (${new Date(diffData.version1.timestamp).toLocaleDateString()})`}
              {activeVersion === 'v2' && `Version 2 (${new Date(diffData.version2.timestamp).toLocaleDateString()})`}
              {activeVersion === 'merged' && 'Merged Version'}
            </span>
          </div>
          {activeVersion === 'merged' && (
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Edit3 className="w-3 h-3" />
                  Bearbeiten
                </button>
              ) : (
                <>
                  <button
                    onClick={saveLivePreview}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Save className="w-3 h-3" />
                    Speichern
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setLivePreview(finalContent);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    <X className="w-3 h-3" />
                    Abbrechen
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={livePreview}
              onChange={(e) => handleLivePreviewChange(e.target.value)}
              className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`${contentType === 'flowing' ? 'Geben Sie hier Ihren Fließtext ein...' : 'Geben Sie hier Ihre strukturierten Inhalte ein...'}`}
            />
          ) : (
            <div className="min-h-64 p-4 border rounded-lg bg-gray-50">
              <div className={`text-sm ${contentType === 'flowing' ? 'leading-relaxed' : 'whitespace-pre-wrap'}`}>
                {getActiveContent()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Comparison Section - Only show when needed */}
      {(selectedLines1.length > 0 || selectedLines2.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              Ausgewählt: {selectedLines1.length} aus V1, {selectedLines2.length} aus V2
            </div>
            <button
              onClick={handleMerge}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Merge erstellen
            </button>
          </div>
        </div>
      )}

      {/* Compact Comparison Grid - Collapsible */}
      <details className="bg-white border rounded-lg">
        <summary className="p-3 cursor-pointer hover:bg-gray-50 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Detaillierter Vergleich</span>
          <span className="text-xs text-gray-500">(Klick zum Aufklappen)</span>
        </summary>
        
        <div className="border-t">
          <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto p-4">
            {/* Version 1 */}
            <div className="bg-white">
              <div className="sticky top-0 bg-gray-100 p-2 border-b font-medium text-xs">
                Version 1 - Auswahl
              </div>
              {lines1.map((line, index) => {
                const lineType = getLineType(line, lines2[index], index);
                const isSelected = selectedLines1.includes(index);
                
                return (
                  <div 
                    key={`v1-${index}`}
                    className={`version-line p-2 border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    } ${
                      lineType === 'deleted' ? 'bg-red-50 text-red-700' :
                      lineType === 'modified' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-white'
                    }`}
                    onClick={() => toggleLine1(index)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-gray-500 mr-1">#{index + 1}</span>
                        <span className={`text-xs ${contentType === 'flowing' ? 'leading-relaxed' : ''}`}>
                          {line || '(empty line)'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Version 2 */}
            <div className="bg-white">
              <div className="sticky top-0 bg-gray-100 p-2 border-b font-medium text-xs">
                Version 2 - Auswahl
              </div>
              {lines2.map((line, index) => {
                const lineType = getLineType(lines1[index], line, index);
                const isSelected = selectedLines2.includes(index);
                
                return (
                  <div 
                    key={`v2-${index}`}
                    className={`version-line p-2 border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    } ${
                      lineType === 'added' ? 'bg-green-50 text-green-700' :
                      lineType === 'modified' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-white'
                    }`}
                    onClick={() => toggleLine2(index)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-gray-500 mr-1">#{index + 1}</span>
                        <span className={`text-xs ${contentType === 'flowing' ? 'leading-relaxed' : ''}`}>
                          {line || '(empty line)'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </details>

      {/* Merge Preview - Only when needed */}
      {showMergePreview && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-sm">Merge bestätigen</h3>
          <textarea
            value={finalContent}
            onChange={(e) => setFinalContent(e.target.value)}
            className="w-full h-24 p-3 border rounded-lg resize-none text-sm"
            placeholder="Merge-Inhalt hier bearbeiten..."
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={confirmMerge}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              <Check className="w-3 h-3 mr-1 inline" />
              Bestätigen
            </button>
            <button
              onClick={() => setShowMergePreview(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              <X className="w-3 h-3 mr-1 inline" />
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionComparison;
