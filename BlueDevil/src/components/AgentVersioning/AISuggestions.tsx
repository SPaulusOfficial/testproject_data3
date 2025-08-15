import React, { useState } from 'react';

interface AISuggestion {
  id: string;
  lineNumber: number;
  type: 'improvement' | 'clarification' | 'parameter' | 'structure';
  message: string;
  suggestion: string;
  confidence: number;
}

interface AISuggestionsProps {
  content: string;
  onApplySuggestion: (suggestion: AISuggestion) => void;
  onApplyAll: (suggestions: AISuggestion[]) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({
  content,
  onApplySuggestion,
  onApplyAll
}) => {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([
    {
      id: '1',
      lineNumber: 3,
      type: 'parameter',
      message: 'Hier würde eine Anpassung sinn machen um die genauen Parameter zu definieren.',
      suggestion: 'System prüft Bonität (Score > 700)',
      confidence: 0.85
    },
    {
      id: '2',
      lineNumber: 5,
      type: 'clarification',
      message: 'Zeitrahmen für manuelle Prüfung sollte definiert werden.',
      suggestion: 'Manuelle Prüfung (max. 24h)',
      confidence: 0.78
    },
    {
      id: '3',
      lineNumber: 7,
      type: 'improvement',
      message: 'Benachrichtigung sollte spezifischer sein.',
      suggestion: 'Kunde erhält E-Mail mit Entscheidung und nächsten Schritten',
      confidence: 0.92
    }
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'parameter': return 'bg-blue-100 text-blue-800';
      case 'clarification': return 'bg-yellow-100 text-yellow-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'structure': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'parameter': return '⚙️';
      case 'clarification': return '💡';
      case 'improvement': return '✨';
      case 'structure': return '🏗️';
      default: return '💬';
    }
  };

  const lines = content.split('\n');

  return (
    <div className="ai-suggestions bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="suggestions-header bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">AI Suggestions</h3>
        <div className="text-sm opacity-90 mt-1">
          {suggestions.length} suggestions found
        </div>
      </div>

      {/* Content */}
      <div className="suggestions-content p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Process Content with Suggestions */}
          <div className="process-content">
            <h4 className="font-semibold text-gray-800 mb-3">Process Content</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {lines.map((line, index) => {
                const lineSuggestions = suggestions.filter(s => s.lineNumber === index + 1);
                
                return (
                  <div key={index} className="process-line p-3 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-500 mt-1">#{index + 1}</span>
                      <div className="flex-1">
                        <div className="text-sm">{line || '(empty line)'}</div>
                        {lineSuggestions.map(suggestion => (
                          <div key={suggestion.id} className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs">{getTypeIcon(suggestion.type)}</span>
                              <span className={`text-xs px-2 py-1 rounded ${getTypeColor(suggestion.type)}`}>
                                {suggestion.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                {Math.round(suggestion.confidence * 100)}% confidence
                              </span>
                            </div>
                            <div className="text-xs text-gray-700 mb-1">
                              {suggestion.message}
                            </div>
                            <div className="text-xs font-medium text-green-700">
                              Suggestion: "{suggestion.suggestion}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggestions List */}
          <div className="suggestions-list">
            <h4 className="font-semibold text-gray-800 mb-3">All Suggestions</h4>
            <div className="space-y-3">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="suggestion-item border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getTypeIcon(suggestion.type)}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getTypeColor(suggestion.type)}`}>
                        {suggestion.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        Line #{suggestion.lineNumber}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-2">
                    {suggestion.message}
                  </div>
                  
                  <div className="text-sm font-medium text-green-700 mb-3">
                    "{suggestion.suggestion}"
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApplySuggestion(suggestion)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => onApplyAll(suggestions)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Apply All Suggestions ({suggestions.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
