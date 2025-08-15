import React from 'react';

interface DiffChange {
  type: 'addition' | 'deletion' | 'modification';
  line: number;
  content?: string;
  oldContent?: string;
  newContent?: string;
}

interface DiffData {
  changes: DiffChange[];
  summary: {
    additions: number;
    deletions: number;
    modifications: number;
    totalChanges: number;
  };
  algorithm: string;
  timestamp: string;
}

interface DiffViewerProps {
  diff: DiffData;
  onViewMerge: () => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ diff, onViewMerge }) => {
  return (
    <div className="diff-viewer bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="diff-header bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">Text Differences</h3>
        <div className="summary flex gap-4 text-sm opacity-90">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            Additions: {diff.summary.additions}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            Deletions: {diff.summary.deletions}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            Modifications: {diff.summary.modifications}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            Total: {diff.summary.totalChanges}
          </span>
        </div>
      </div>

      {/* Diff Content */}
      <div className="diff-content p-4 max-h-96 overflow-y-auto">
        {diff.changes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✨</div>
            <p>No changes detected</p>
            <p className="text-sm">The content is identical</p>
          </div>
        ) : (
          <div className="space-y-3">
            {diff.changes.map((change, index) => (
              <div key={index} className={`diff-change border rounded-lg p-3 ${
                change.type === 'addition' 
                  ? 'border-green-200 bg-green-50' 
                  : change.type === 'deletion'
                  ? 'border-red-200 bg-red-50'
                  : 'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="change-header flex items-center justify-between mb-2">
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
                </div>
                
                <div className="change-content">
                  {change.type === 'modification' && (
                    <div className="space-y-2">
                      <div className="old-line bg-red-50 border border-red-200 rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-red-600 font-mono text-sm">-</span>
                          <span className="text-xs text-red-600 font-medium">Old Content</span>
                        </div>
                        <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                          {change.oldContent}
                        </pre>
                      </div>
                      <div className="new-line bg-green-50 border border-green-200 rounded p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-green-600 font-mono text-sm">+</span>
                          <span className="text-xs text-green-600 font-medium">New Content</span>
                        </div>
                        <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono">
                          {change.newContent}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {change.type === 'addition' && (
                    <div className="addition bg-green-50 border border-green-200 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-600 font-mono text-sm">+</span>
                        <span className="text-xs text-green-600 font-medium">Added Content</span>
                      </div>
                      <pre className="text-sm text-green-800 whitespace-pre-wrap font-mono">
                        {change.content}
                      </pre>
                    </div>
                  )}
                  
                  {change.type === 'deletion' && (
                    <div className="deletion bg-red-50 border border-red-200 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-600 font-mono text-sm">-</span>
                        <span className="text-xs text-red-600 font-medium">Removed Content</span>
                      </div>
                      <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                        {change.content}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="diff-actions p-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Algorithm: {diff.algorithm} | Generated: {new Date(diff.timestamp).toLocaleString()}
          </div>
          <button 
            onClick={onViewMerge}
            disabled={diff.changes.length === 0}
            className="view-merge-button px-4 py-2 bg-digital-blue text-white rounded-md hover:bg-deep-blue-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            View Merge Suggestion
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;
