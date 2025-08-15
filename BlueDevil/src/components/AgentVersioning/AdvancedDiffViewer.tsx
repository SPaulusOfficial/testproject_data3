import React, { useState, useMemo } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { diffWords, diffLines, diffChars } from 'diff';
import { 
  Settings, 
  FileText, 
  Code, 
  GitBranch, 
  Eye, 
  Copy, 
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Bot,
  Lightbulb,
  Edit3,
  Save,
  X,
  Sparkles,
  Brain,
  Target
} from 'lucide-react';

interface DiffData {
  oldValue: string;
  newValue: string;
  oldTitle?: string;
  newTitle?: string;
}

interface AISuggestion {
  id: string;
  type: 'improvement' | 'clarification' | 'addition' | 'correction' | 'optimization' | 'semantic';
  message: string;
  suggestion: string;
  confidence: number;
  lineNumbers?: number[];
  reasoning: string;
}

interface AdvancedDiffViewerProps {
  diffData: DiffData;
  onMerge?: (mergedContent: string) => void;
}

type DiffMethod = 'words' | 'lines' | 'chars' | 'react-diff-viewer' | 'semantic';

const AdvancedDiffViewer: React.FC<AdvancedDiffViewerProps> = ({ 
  diffData, 
  onMerge 
}) => {
  const [diffMethod, setDiffMethod] = useState<DiffMethod>('semantic');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [splitView, setSplitView] = useState(true);
  const [highlightLines, setHighlightLines] = useState<string[]>([]);
  const [customMerge, setCustomMerge] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedParts, setSelectedParts] = useState<{ old: number[], new: number[] }>({ old: [], new: [] });
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [semanticSimilarity, setSemanticSimilarity] = useState<number>(0);

  // Simple semantic similarity calculation
  // NOTE: This is a basic word-overlap approach, NOT true semantic similarity!
  // For real semantic comparison, you need:
  // 1. LLM embeddings (OpenAI, Hugging Face, Cohere)
  // 2. Vector similarity (cosine similarity)
  // 3. Or direct LLM comparison
  const calculateSemanticSimilarity = (text1: string, text2: string): number => {
    const words1 = text1.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const words2 = text2.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 && words2.length === 0) return 1;
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
  };

  // TODO: Implement real semantic similarity with LLM
  // Example implementation:
  /*
  const calculateRealSemanticSimilarity = async (text1: string, text2: string): Promise<number> => {
    // Option 1: OpenAI Embeddings
    const embedding1 = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text1,
    });
    const embedding2 = await openai.embeddings.create({
      model: "text-embedding-ada-002", 
      input: text2,
    });
    
    // Calculate cosine similarity
    return cosineSimilarity(embedding1.data[0].embedding, embedding2.data[0].embedding);
    
    // Option 2: Direct LLM comparison
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Rate the semantic similarity between these two texts from 0.0 to 1.0. Return only the number."
      }, {
        role: "user", 
        content: `Text 1: "${text1}"\nText 2: "${text2}"`
      }]
    });
    
    return parseFloat(response.choices[0].message.content || "0");
  };
  */

  // Semantic diff generator for agent-generated content
  const generateSemanticDiff = (oldText: string, newText: string) => {
    const oldLines = oldText.split('\n').filter(line => line.trim());
    const newLines = newText.split('\n').filter(line => line.trim());
    
    // Calculate semantic similarity between lines
    const similarities = oldLines.map((oldLine, oldIndex) => {
      const lineSimilarities = newLines.map((newLine, newIndex) => ({
        oldIndex,
        newIndex,
        similarity: calculateSemanticSimilarity(oldLine, newLine),
        oldLine,
        newLine
      }));
      return lineSimilarities.sort((a, b) => b.similarity - a.similarity)[0];
    });

    // Set overall similarity
    const avgSimilarity = similarities.reduce((sum, sim) => sum + sim.similarity, 0) / similarities.length;
    setSemanticSimilarity(avgSimilarity);

    // Generate semantic diff result
    const result: any[] = [];
    const usedNewLines = new Set<number>();

    similarities.forEach((match) => {
      if (match.similarity > 0.7) {
        // High similarity - likely same meaning, different words
        result.push({
          type: 'semantic-match',
          oldLine: match.oldLine,
          newLine: match.newLine,
          similarity: match.similarity,
          message: 'Semantisch ähnlich - Agent hat anders formuliert'
        });
        usedNewLines.add(match.newIndex);
      } else if (match.similarity > 0.3) {
        // Medium similarity - partially related
        result.push({
          type: 'semantic-partial',
          oldLine: match.oldLine,
          newLine: match.newLine,
          similarity: match.similarity,
          message: 'Teilweise ähnlich - möglicherweise erweitert'
        });
        usedNewLines.add(match.newIndex);
      } else {
        // Low similarity - likely removed
        result.push({
          type: 'removed',
          oldLine: match.oldLine,
          newLine: null,
          similarity: match.similarity,
          message: 'Wahrscheinlich entfernt oder stark geändert'
        });
      }
    });

    // Add completely new lines
    newLines.forEach((newLine, newIndex) => {
      if (!usedNewLines.has(newIndex)) {
        result.push({
          type: 'added',
          oldLine: null,
          newLine: newLine,
          similarity: 0,
          message: 'Neuer Inhalt hinzugefügt'
        });
      }
    });

    return result;
  };

  // Generate diff using different methods
  const diffResult = useMemo(() => {
    switch (diffMethod) {
      case 'words':
        return diffWords(diffData.oldValue, diffData.newValue);
      case 'lines':
        return diffLines(diffData.oldValue, diffData.newValue);
      case 'chars':
        return diffChars(diffData.oldValue, diffData.newValue);
      case 'semantic':
        return generateSemanticDiff(diffData.oldValue, diffData.newValue);
      default:
        return null;
    }
  }, [diffData, diffMethod]);

  // Mock AI suggestions based on diff analysis
  const generateAISuggestions = () => {
    const suggestions: AISuggestion[] = [];
    
    if (diffMethod === 'semantic' && diffResult) {
      // Semantic analysis suggestions
      suggestions.push({
        id: 'semantic-overview',
        type: 'semantic',
        message: `Semantische Ähnlichkeit: ${Math.round(semanticSimilarity * 100)}%`,
        suggestion: semanticSimilarity > 0.8 
          ? 'Hohe semantische Ähnlichkeit - Agent hat hauptsächlich reformuliert'
          : semanticSimilarity > 0.5
          ? 'Mittlere semantische Ähnlichkeit - Agent hat teilweise geändert'
          : 'Niedrige semantische Ähnlichkeit - Agent hat stark geändert',
        confidence: semanticSimilarity,
        reasoning: 'Basierend auf Wort-Übereinstimmung zwischen den Versionen.'
      });

      // Analyze semantic diff results
      diffResult.forEach((item: any, index) => {
        if (item.type === 'semantic-match') {
          suggestions.push({
            id: `semantic-${index}`,
            type: 'clarification',
            message: 'Semantisch ähnlicher Inhalt',
            suggestion: `"${item.oldLine}" → "${item.newLine}" (${Math.round(item.similarity * 100)}% ähnlich)`,
            confidence: item.similarity,
            reasoning: 'Der Agent hat den Inhalt anders formuliert, aber die Bedeutung bleibt gleich.'
          });
        } else if (item.type === 'added') {
          suggestions.push({
            id: `added-${index}`,
            type: 'addition',
            message: 'Neuer Inhalt hinzugefügt',
            suggestion: item.newLine,
            confidence: 0.9,
            reasoning: 'Der Agent hat neuen Inhalt hinzugefügt, der in der ursprünglichen Version nicht vorhanden war.'
          });
        } else if (item.type === 'removed') {
          suggestions.push({
            id: `removed-${index}`,
            type: 'correction',
            message: 'Inhalt entfernt oder stark geändert',
            suggestion: `Überprüfen Sie: "${item.oldLine}"`,
            confidence: 0.7,
            reasoning: 'Dieser Inhalt wurde entfernt oder so stark geändert, dass er nicht mehr erkennbar ist.'
          });
        }
      });
    } else if (diffResult) {
      // Traditional diff analysis
      diffResult.forEach((part: any, index) => {
        if (part.added) {
          suggestions.push({
            id: `suggestion-${index}`,
            type: 'addition',
            message: 'Neuer Inhalt hinzugefügt',
            suggestion: part.value,
            confidence: 0.9,
            lineNumbers: [index + 1],
            reasoning: 'Dieser Inhalt wurde in der neuen Version hinzugefügt und könnte wichtig sein.'
          });
        } else if (part.removed) {
          suggestions.push({
            id: `suggestion-${index}`,
            type: 'correction',
            message: 'Inhalt entfernt - prüfen Sie ob das korrekt ist',
            suggestion: `Überprüfen Sie: "${part.value}"`,
            confidence: 0.7,
            lineNumbers: [index + 1],
            reasoning: 'Dieser Inhalt wurde entfernt. Stellen Sie sicher, dass das beabsichtigt ist.'
          });
        }
      });
    }

    // Add general suggestions
    suggestions.push({
      id: 'general-1',
      type: 'improvement',
      message: 'Agent-basierte Änderungen',
      suggestion: 'Bei Agenten-generiertem Content ist semantische Analyse wichtiger als Wort-für-Wort Vergleich.',
      confidence: 0.9,
      reasoning: 'Agenten können dieselbe Aussage mit komplett anderen Wörtern formulieren.'
    });

    setAiSuggestions(suggestions);
    setShowSuggestions(true);
  };

  // Custom diff renderer for different methods
  const renderCustomDiff = () => {
    if (!diffResult) return null;

    if (diffMethod === 'semantic') {
      return (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 bg-purple-50 border-b">
            <h3 className="font-semibold text-purple-800 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Semantischer Diff - Agent-optimiert
            </h3>
            <p className="text-sm text-purple-600 mt-1">
              Ähnlichkeit: {Math.round(semanticSimilarity * 100)}% | 
              Analysiert Bedeutung statt exakte Wörter
            </p>
          </div>
          <div className="p-4 space-y-3">
            {diffResult.map((item: any, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                item.type === 'semantic-match' ? 'bg-green-50 border-green-200' :
                item.type === 'semantic-partial' ? 'bg-yellow-50 border-yellow-200' :
                item.type === 'added' ? 'bg-blue-50 border-blue-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    item.type === 'semantic-match' ? 'bg-green-100 text-green-800' :
                    item.type === 'semantic-partial' ? 'bg-yellow-100 text-yellow-800' :
                    item.type === 'added' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.type}
                  </span>
                  {item.similarity !== undefined && (
                    <span className="text-xs text-gray-500">
                      {Math.round(item.similarity * 100)}% ähnlich
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{item.message}</p>
                {item.oldLine && (
                  <div className="text-sm bg-gray-50 p-2 rounded mb-1">
                    <span className="text-gray-500">Alt:</span> {item.oldLine}
                  </div>
                )}
                {item.newLine && (
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Neu:</span> {item.newLine}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-800">
            {diffMethod === 'words' && 'Word-level Diff'}
            {diffMethod === 'lines' && 'Line-level Diff'}
            {diffMethod === 'chars' && 'Character-level Diff'}
          </h3>
        </div>
        <div className="p-4">
          {diffResult.map((part: any, index) => (
            <span
              key={index}
              className={`${
                part.added ? 'bg-green-100 text-green-800' :
                part.removed ? 'bg-red-100 text-red-800' :
                'bg-gray-50'
              } px-1 rounded cursor-pointer hover:opacity-80 transition-opacity`}
              onClick={() => {
                if (part.added) {
                  setSelectedParts(prev => ({
                    ...prev,
                    new: [...prev.new, index]
                  }));
                } else if (part.removed) {
                  setSelectedParts(prev => ({
                    ...prev,
                    old: [...prev.old, index]
                  }));
                }
              }}
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Generate merge suggestion
  const generateMergeSuggestion = () => {
    if (diffMethod === 'semantic') {
      // For semantic diff, prefer the new version but keep important removed content
      const newLines = diffData.newValue.split('\n').filter(line => line.trim());
      const removedContent = diffResult?.filter((item: any) => item.type === 'removed' && item.similarity > 0.3)
        .map((item: any) => `// Überprüfen: ${item.oldLine}`) || [];
      
      return [...newLines, ...removedContent].join('\n');
    } else {
      const lines = diffData.newValue.split('\n');
      const mergedLines: string[] = [];
      
      lines.forEach((line, index) => {
        if (line.trim()) {
          mergedLines.push(line);
        }
      });
      
      return mergedLines.join('\n');
    }
  };

  const handleAutoMerge = () => {
    const merged = generateMergeSuggestion();
    setCustomMerge(merged);
  };

  const handleCopyDiff = () => {
    const diffText = `Old Version:\n${diffData.oldValue}\n\nNew Version:\n${diffData.newValue}`;
    navigator.clipboard.writeText(diffText);
  };

  const handleExportDiff = () => {
    const diffContent = `# Diff Export\n\n## Old Version\n\`\`\`\n${diffData.oldValue}\n\`\`\`\n\n## New Version\n\`\`\`\n${diffData.newValue}\n\`\`\``;
    const blob = new Blob([diffContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff-export.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLivePreviewChange = (newContent: string) => {
    setCustomMerge(newContent);
  };

  const saveLivePreview = () => {
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Live Preview Section - Primary Focus */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Live Preview - Finales Dokument</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={generateAISuggestions}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                <Bot className="w-3 h-3" />
                AI Vorschläge
              </button>
              {showSuggestions && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {aiSuggestions.length} Vorschläge
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Edit3 className="w-3 h-3" />
                Bearbeiten
              </button>
            ) : (
              <>
                <button
                  onClick={saveLivePreview}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Save className="w-3 h-3" />
                  Speichern
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setCustomMerge(generateMergeSuggestion());
                  }}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  <X className="w-3 h-3" />
                  Abbrechen
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={customMerge}
              onChange={(e) => handleLivePreviewChange(e.target.value)}
              className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Bearbeiten Sie hier das finale Dokument..."
            />
          ) : (
            <div className="min-h-64 p-4 border rounded-lg bg-gray-50">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {customMerge || 'Wählen Sie eine Diff-Methode und generieren Sie einen Merge-Vorschlag...'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showSuggestions && (
        <div className="bg-white border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b bg-purple-50">
            <h3 className="font-semibold text-purple-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Vorschläge ({aiSuggestions.length})
            </h3>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-purple-600 hover:text-purple-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {aiSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      suggestion.type === 'improvement' ? 'bg-blue-100 text-blue-800' :
                      suggestion.type === 'addition' ? 'bg-green-100 text-green-800' :
                      suggestion.type === 'correction' ? 'bg-red-100 text-red-800' :
                      suggestion.type === 'clarification' ? 'bg-yellow-100 text-yellow-800' :
                      suggestion.type === 'semantic' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {suggestion.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setCustomMerge(prev => prev + '\n\n' + suggestion.suggestion);
                    }}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Anwenden
                  </button>
                </div>
                <p className="text-sm text-gray-700 mb-1">{suggestion.message}</p>
                <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                {suggestion.lineNumbers && (
                  <p className="text-xs text-gray-500 mt-1">
                    Zeilen: {suggestion.lineNumbers.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diff Method Selector */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Diff Einstellungen
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopyDiff}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <Copy className="w-3 h-3" />
              Kopieren
            </button>
            <button
              onClick={handleExportDiff}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diff Methode
            </label>
            <select
              value={diffMethod}
              onChange={(e) => setDiffMethod(e.target.value as DiffMethod)}
              className="w-full p-2 border rounded-md text-sm"
            >
              <option value="semantic">Semantic (Agent-optimiert)</option>
              <option value="react-diff-viewer">React Diff Viewer</option>
              <option value="words">Word-level</option>
              <option value="lines">Line-level</option>
              <option value="chars">Character-level</option>
            </select>
          </div>

          {diffMethod === 'react-diff-viewer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ansicht
                </label>
                <select
                  value={splitView ? 'split' : 'unified'}
                  onChange={(e) => setSplitView(e.target.value === 'split')}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="split">Split View</option>
                  <option value="unified">Unified View</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zeilennummern
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showLineNumbers}
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Anzeigen</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Diff Display */}
      <div className="bg-white border rounded-lg">
        {diffMethod === 'react-diff-viewer' ? (
          <ReactDiffViewer
            oldValue={diffData.oldValue}
            newValue={diffData.newValue}
            splitView={splitView}
            hideLineNumbers={!showLineNumbers}
            leftTitle={diffData.oldTitle || 'Version 1'}
            rightTitle={diffData.newTitle || 'Version 2'}
            styles={{
              diffContainer: {
                pre: {
                  backgroundColor: 'transparent',
                },
              },
              line: {
                padding: '4px 8px',
              },
              lineNumber: {
                backgroundColor: '#f8f9fa',
                color: '#6c757d',
                padding: '4px 8px',
              },
            }}
          />
        ) : (
          renderCustomDiff()
        )}
      </div>

      {/* Merge Section */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Merge & Zusammenführung
          </h3>
          <button
            onClick={handleAutoMerge}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            <CheckCircle className="w-3 h-3" />
            Auto-Merge
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => onMerge?.(customMerge)}
              disabled={!customMerge.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Merge übernehmen
            </button>
            <button
              onClick={() => setCustomMerge('')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-800">Statistiken</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Alte Zeilen:</span>
              <span className="font-medium">{diffData.oldValue.split('\n').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Neue Zeilen:</span>
              <span className="font-medium">{diffData.newValue.split('\n').length}</span>
            </div>
            {diffMethod === 'semantic' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Semantische Ähnlichkeit:</span>
                <span className="font-medium">{Math.round(semanticSimilarity * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-gray-800">Agent-Optimiert</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>Semantische Analyse für Agenten-generierte Inhalte.</p>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Bedeutung:</strong> Statt exakte Wörter</li>
              <li>• <strong>Ähnlichkeit:</strong> Prozentuale Übereinstimmung</li>
              <li>• <strong>Reformulierung:</strong> Erkennt Agenten-Änderungen</li>
            </ul>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-gray-800">AI Agent</span>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• Analysiert semantische Änderungen</p>
            <p>• Erkennt Reformulierungen</p>
            <p>• Zeigt Confidence-Scores</p>
            <p>• Agent-optimierte Vorschläge</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDiffViewer;
