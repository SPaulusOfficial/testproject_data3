import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  GitCompare, 
  Brain, 
  FileText, 
  Check, 
  X as XIcon,
  AlertCircle,
  Save,
  Eye
} from 'lucide-react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface Version {
  id: string;
  content: string;
  timestamp: Date;
  version: number;
  description?: string;
}

interface VersionCompareModalProps {
  currentVersion: Version;
  selectedVersion: Version | null;
  versions: Version[];
  onClose: () => void;
  onVersionSelect: (version: Version) => void;
}

interface DiffResult {
  type: 'semantic-match' | 'semantic-partial' | 'added' | 'removed' | 'modified';
  oldText?: string;
  newText?: string;
  similarity?: number;
  message: string;
  selected?: boolean;
}

const VersionCompareModal: React.FC<VersionCompareModalProps> = ({
  currentVersion,
  selectedVersion,
  versions,
  onClose,
  onVersionSelect
}) => {
  const [compareVersion, setCompareVersion] = useState<Version | null>(selectedVersion || null);
  const [diffMode, setDiffMode] = useState<'classical' | 'semantic'>('semantic');
  const [selectedChanges, setSelectedChanges] = useState<Set<number>>(new Set());
  const [mergedContent, setMergedContent] = useState<string>('');

  // Update compareVersion when selectedVersion changes
  useEffect(() => {
    setCompareVersion(selectedVersion);
  }, [selectedVersion]);

  // Split content into sentences (handle HTML)
  const splitIntoSentences = (text: string): string[] => {
    // Remove HTML tags for comparison
    const plainText = text.replace(/<[^>]*>/g, '');
    return plainText
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim());
  };

  // Calculate semantic similarity (basic word overlap)
  const calculateSemanticSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 && words2.length === 0) return 1;
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
  };

  // Generate semantic diff
  const generateSemanticDiff = (oldText: string, newText: string): DiffResult[] => {
    const oldSentences = splitIntoSentences(oldText);
    const newSentences = splitIntoSentences(newText);
    
    const similarities = oldSentences.map((oldSentence, oldIndex) => {
      const sentenceSimilarities = newSentences.map((newSentence, newIndex) => ({
        oldIndex,
        newIndex,
        similarity: calculateSemanticSimilarity(oldSentence, newSentence),
        oldSentence,
        newSentence
      }));
      return sentenceSimilarities.sort((a, b) => b.similarity - a.similarity)[0];
    });

    const result: DiffResult[] = [];
    const usedNewSentences = new Set<number>();

    similarities.forEach((match) => {
      if (match.similarity > 0.7) {
        result.push({
          type: 'semantic-match',
          oldText: match.oldSentence,
          newText: match.newSentence,
          similarity: match.similarity,
          message: 'Semantisch ähnlich - Agent hat anders formuliert'
        });
        usedNewSentences.add(match.newIndex);
      } else if (match.similarity > 0.3) {
        result.push({
          type: 'semantic-partial',
          oldText: match.oldSentence,
          newText: match.newSentence,
          similarity: match.similarity,
          message: 'Teilweise ähnlich - möglicherweise erweitert'
        });
        usedNewSentences.add(match.newIndex);
      } else {
        result.push({
          type: 'removed',
          oldText: match.oldSentence,
          newText: undefined,
          similarity: match.similarity,
          message: 'Wahrscheinlich entfernt oder stark geändert'
        });
      }
    });

    newSentences.forEach((newSentence, newIndex) => {
      if (!usedNewSentences.has(newIndex)) {
        result.push({
          type: 'added',
          oldText: undefined,
          newText: newSentence,
          similarity: 0,
          message: 'Neuer Inhalt hinzugefügt'
        });
      }
    });

    return result;
  };

  // Generate merged content based on selections
  const generateMergedContent = () => {
    if (!compareVersion) return currentVersion.content;

    const semanticDiff = generateSemanticDiff(compareVersion.content, currentVersion.content);
    const selectedSentences: string[] = [];

    semanticDiff.forEach((diff, index) => {
      if (selectedChanges.has(index)) {
        if (diff.type === 'added' && diff.newText) {
          selectedSentences.push(diff.newText);
        } else if (diff.type === 'semantic-match' || diff.type === 'semantic-partial') {
          // Prefer new text for semantic matches
          selectedSentences.push(diff.newText || diff.oldText || '');
        } else if (diff.type === 'removed' && diff.oldText) {
          selectedSentences.push(diff.oldText);
        }
      } else {
        // Keep original text for unselected changes
        if (diff.type === 'removed' && diff.oldText) {
          selectedSentences.push(diff.oldText);
        } else if (diff.type === 'semantic-match' || diff.type === 'semantic-partial') {
          selectedSentences.push(diff.oldText || '');
        }
      }
    });

    return selectedSentences.join(' ');
  };

  // Update merged content when selections change
  useMemo(() => {
    setMergedContent(generateMergedContent());
  }, [selectedChanges, compareVersion]);

  const handleToggleSelection = (index: number) => {
    const newSelections = new Set(selectedChanges);
    if (newSelections.has(index)) {
      newSelections.delete(index);
    } else {
      newSelections.add(index);
    }
    setSelectedChanges(newSelections);
  };

  const handleSaveMerged = () => {
    // Here you would typically save the merged content as a new version
    console.log('Saving merged content:', mergedContent);
    onClose();
  };

  if (!compareVersion) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Version auswählen</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {versions
              .filter(v => v.id !== currentVersion.id)
              .map((version) => (
                <div
                  key={version.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setCompareVersion(version);
                    onVersionSelect(version);
                  }}
                >
                  <div className="font-medium">Version {version.version}</div>
                  <div className="text-sm text-gray-500">
                    {version.timestamp.toLocaleString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  const semanticDiff = generateSemanticDiff(compareVersion.content, currentVersion.content);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Version Comparison</h3>
            <div className="text-sm text-gray-500">
              Version {compareVersion.version} ↔ Version {currentVersion.version}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDiffMode(diffMode === 'classical' ? 'semantic' : 'classical')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded ${
                diffMode === 'semantic'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {diffMode === 'semantic' ? <Brain className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {diffMode === 'semantic' ? 'Semantic' : 'Classical'}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Diff View */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              {diffMode === 'classical' ? (
                <ReactDiffViewer
                  oldValue={compareVersion.content}
                  newValue={currentVersion.content}
                  splitView={true}
                  hideLineNumbers={false}
                  showDiffOnly={false}
                  useDarkTheme={false}
                />
              ) : (
                <div className="p-4 space-y-3">
                  {semanticDiff.map((diff, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedChanges.has(index)
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => handleToggleSelection(index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            diff.type === 'semantic-match' ? 'bg-blue-100 text-blue-700' :
                            diff.type === 'semantic-partial' ? 'bg-yellow-100 text-yellow-700' :
                            diff.type === 'added' ? 'bg-green-100 text-green-700' :
                            diff.type === 'removed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {diff.type}
                          </span>
                          {diff.similarity !== undefined && (
                            <span className="text-xs text-gray-500">
                              {(diff.similarity * 100).toFixed(0)}% ähnlich
                            </span>
                          )}
                        </div>
                        {selectedChanges.has(index) && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        {diff.message}
                      </div>
                      
                      {diff.oldText && (
                        <div className="text-xs bg-red-50 p-2 rounded mb-1">
                          <span className="font-medium text-red-700">Alt:</span> {diff.oldText}
                        </div>
                      )}
                      
                      {diff.newText && (
                        <div className="text-xs bg-green-50 p-2 rounded">
                          <span className="font-medium text-green-700">Neu:</span> {diff.newText}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Merge Preview */}
          <div className="w-96 border-l bg-gray-50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium">Merge Preview</h4>
              </div>
              <div className="text-sm text-gray-500">
                {selectedChanges.size} Änderungen ausgewählt
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-white border rounded-lg p-3 min-h-64">
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {mergedContent || 'Keine Änderungen ausgewählt'}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-white">
              <button
                onClick={handleSaveMerged}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Als neue Version speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionCompareModal;
