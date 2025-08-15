import React from 'react';

interface MergeChange {
  type: 'addition' | 'deletion' | 'modification';
  line: number;
  content?: string;
  oldContent?: string;
  newContent?: string;
}

interface MergeSuggestion {
  suggestions: Array<{
    change: MergeChange;
    approved: boolean;
    confidence: number;
    reasoning: string;
  }>;
  approvedChanges: MergeChange[];
  finalContent: string;
  confidence: number;
  strategy: string;
  reasoning: string;
}

interface MergePreviewProps {
  mergeSuggestion: MergeSuggestion;
  onAccept: () => void;
  onReject: () => void;
}

const MergePreview: React.FC<MergePreviewProps> = ({
  mergeSuggestion,
  onAccept,
  onReject
}) => {
  const approvedCount = mergeSuggestion.approvedChanges.length;
  const totalCount = mergeSuggestion.suggestions.length;

  return (
    <div className="merge-preview bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="preview-header bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">Merge Suggestion</h3>
        <div className="metadata flex gap-4 text-sm opacity-90">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            Strategy: {mergeSuggestion.strategy}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            Confidence: {Math.round(mergeSuggestion.confidence * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            Changes: {approvedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="preview-content p-4 space-y-4">
        {/* Final Result */}
        <div className="final-result">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Final Result:</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {mergeSuggestion.finalContent}
            </pre>
          </div>
        </div>
        
        {/* Reasoning */}
        <div className="reasoning">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Reasoning:</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">{mergeSuggestion.reasoning}</p>
          </div>
        </div>
        
        {/* Approved Changes */}
        <div className="approved-changes">
          <h4 className="text-md font-semibold text-gray-800 mb-2">
            Approved Changes ({approvedCount}):
          </h4>
          {approvedCount === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <div className="text-2xl mb-1">🤔</div>
              <p className="text-sm">No changes approved</p>
            </div>
          ) : (
            <div className="space-y-2">
              {mergeSuggestion.approvedChanges.map((change, index) => (
                <div key={index} className={`approved-change border rounded-lg p-2 ${
                  change.type === 'addition' 
                    ? 'border-green-200 bg-green-50' 
                    : change.type === 'deletion'
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`change-type px-2 py-1 rounded text-xs font-medium ${
                        change.type === 'addition' 
                          ? 'bg-green-100 text-green-800' 
                          : change.type === 'deletion'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {change.type.toUpperCase()}
                      </span>
                      <span className="line-number text-xs text-gray-500 font-mono">
                        Line {change.line}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confidence Indicator */}
        <div className="confidence-indicator">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Confidence Level:</h4>
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {Math.round(mergeSuggestion.confidence * 100)}%
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                mergeSuggestion.confidence > 0.8 
                  ? 'bg-green-100 text-green-800'
                  : mergeSuggestion.confidence > 0.6
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {mergeSuggestion.confidence > 0.8 
                  ? 'High Confidence' 
                  : mergeSuggestion.confidence > 0.6
                  ? 'Medium Confidence'
                  : 'Low Confidence'
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  mergeSuggestion.confidence > 0.8 
                    ? 'bg-green-500' 
                    : mergeSuggestion.confidence > 0.6
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${mergeSuggestion.confidence * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="preview-actions p-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Auto-merge threshold: 70% | Current: {Math.round(mergeSuggestion.confidence * 100)}%
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onReject}
              className="reject-button px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Reject Merge
            </button>
            <button 
              onClick={onAccept}
              className="accept-button px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Accept Merge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergePreview;
