import React, { useState } from 'react';
import VersionComparison from '@/components/AgentVersioning/VersionComparison';
import AISuggestions from '@/components/AgentVersioning/AISuggestions';
import { ChevronRight, FileText, Code, CheckCircle, Lightbulb, Settings } from 'lucide-react';

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
  changes: any[];
  mergeSuggestion: {
    finalContent: string;
    reasoning: string;
    approvedChanges: number[];
    confidence: number;
  };
}

interface AISuggestion {
  id: string;
  lineNumber: number;
  type: 'improvement' | 'clarification' | 'addition' | 'correction';
  message: string;
  suggestion: string;
  confidence: number;
}

const ProcessVersioningDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'comparison' | 'suggestions' | 'result'>('comparison');
  const [contentType, setContentType] = useState<'flowing' | 'structured'>('structured');
  const [mergedContent, setMergedContent] = useState('');

  // Mock data for structured content (process descriptions)
  const mockStructuredDiffData: DiffData = {
    version1: {
      id: 'v1',
      content: `Der Kunde sendet eine Bestellung über das Web-Formular.
Das System validiert die Eingaben automatisch.
Bei erfolgreicher Validierung wird die Bestellung an das Lager weitergeleitet.
Das Lager prüft die Verfügbarkeit der Artikel.
Bei verfügbaren Artikeln wird die Bestellung bestätigt.
Eine Bestellbestätigung wird an den Kunden gesendet.`,
      timestamp: '2024-01-15T10:30:00Z',
      agent: 'Process Agent v1.2'
    },
    version2: {
      id: 'v2',
      content: `Der Kunde sendet eine Bestellung über das Web-Formular.
Das System validiert die Eingaben automatisch.
Bei erfolgreicher Validierung wird die Bestellung an das Lager weitergeleitet.
Das Lager prüft die Verfügbarkeit der Artikel.
Bei verfügbaren Artikeln wird die Bestellung bestätigt.
Eine Bestellbestätigung wird an den Kunden gesendet.
Bei nicht verfügbaren Artikeln wird eine Rückmeldung an den Kunden gesendet.
Der Kunde kann alternative Artikel vorschlagen.`,
      timestamp: '2024-01-15T14:45:00Z',
      agent: 'Process Agent v1.3'
    },
    changes: [],
    mergeSuggestion: {
      finalContent: '',
      reasoning: '',
      approvedChanges: [],
      confidence: 0.85
    }
  };

  // Mock data for flowing text (meeting minutes, documents)
  const mockFlowingDiffData: DiffData = {
    version1: {
      id: 'v1',
      content: `In der heutigen Besprechung haben wir die Kreditfreigabe-Prozesse diskutiert. Herr Müller erklärte, dass die aktuellen Prozesse zu langsam sind und Kunden oft warten müssen. Frau Schmidt schlug vor, dass wir die automatische Validierung verbessern sollten. Das Team war sich einig, dass wir die Bearbeitungszeit von 3 Tagen auf 1 Tag reduzieren müssen.`,
      timestamp: '2024-01-15T10:30:00Z',
      agent: 'Document Agent v1.1'
    },
    version2: {
      id: 'v2',
      content: `In der heutigen Besprechung haben wir die Kreditfreigabe-Prozesse diskutiert. Herr Müller erklärte, dass die aktuellen Prozesse zu langsam sind und Kunden oft warten müssen. Frau Schmidt schlug vor, dass wir die automatische Validierung verbessern sollten. Das Team war sich einig, dass wir die Bearbeitungszeit von 3 Tagen auf 1 Tag reduzieren müssen. Herr Weber fügte hinzu, dass wir auch die Dokumentenprüfung digitalisieren sollten. Frau Klein erwähnte, dass die Compliance-Anforderungen strenger geworden sind.`,
      timestamp: '2024-01-15T14:45:00Z',
      agent: 'Document Agent v1.2'
    },
    changes: [],
    mergeSuggestion: {
      finalContent: '',
      reasoning: '',
      approvedChanges: [],
      confidence: 0.85
    }
  };

  const mockAISuggestions: AISuggestion[] = [
    {
      id: '1',
      lineNumber: 3,
      type: 'improvement',
      message: 'Die Validierung könnte spezifischer definiert werden',
      suggestion: 'Spezifische Validierungsregeln für Kreditanträge hinzufügen',
      confidence: 0.92
    },
    {
      id: '2',
      lineNumber: 5,
      type: 'addition',
      message: 'Es fehlt eine Rückmeldung bei Ablehnung',
      suggestion: 'Ablehnungsprozess mit Begründung implementieren',
      confidence: 0.88
    },
    {
      id: '3',
      lineNumber: 7,
      type: 'clarification',
      message: 'Alternative Artikel sollten genauer definiert werden',
      suggestion: 'Kriterien für alternative Artikel festlegen',
      confidence: 0.75
    }
  ];

  const handleMerge = (selectedLines: number[], finalContent: string) => {
    setMergedContent(finalContent);
    setCurrentStep('suggestions');
  };

  const handleSuggestionsComplete = () => {
    setCurrentStep('result');
  };

  const getCurrentDiffData = () => {
    return contentType === 'flowing' ? mockFlowingDiffData : mockStructuredDiffData;
  };

  const renderComparisonStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Version Comparison</h2>
        
        {/* Content Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setContentType('structured')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                contentType === 'structured'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Code className="w-4 h-4" />
              Structured Content
            </button>
            <button
              onClick={() => setContentType('flowing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                contentType === 'flowing'
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Flowing Text
            </button>
          </div>
        </div>

        <VersionComparison
          diffData={getCurrentDiffData()}
          onMerge={handleMerge}
          contentType={contentType}
        />
      </div>
    </div>
  );

  const renderSuggestionsStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Suggestions</h2>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Merged Content Preview</h3>
          <div className="text-sm text-gray-700 bg-white p-3 rounded border">
            {mergedContent || 'No content merged yet'}
          </div>
        </div>

        <AISuggestions
          content={mergedContent}
          onApplySuggestion={(suggestion) => {
            console.log('Applying suggestion:', suggestion);
          }}
          onApplyAll={(suggestions) => {
            console.log('Applying all suggestions:', suggestions);
            handleSuggestionsComplete();
          }}
        />
      </div>
    </div>
  );

  const renderResultStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Final Result</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Final Merged Content</h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {mergedContent}
              </pre>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Applied AI Suggestions</h3>
            <div className="space-y-2">
              {mockAISuggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Line {suggestion.lineNumber}
                    </span>
                  </div>
                  <p className="text-sm text-green-700">{suggestion.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setCurrentStep('comparison')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Over
          </button>
          <button
            onClick={() => {
              // Here you would typically save the result
              alert('Result saved successfully!');
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Process Versioning Demo
          </h1>
          <p className="text-gray-600">
            Granular version comparison and AI-powered merging for both structured and flowing content
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'comparison' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'comparison' ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Comparison
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'suggestions' ? 'bg-blue-600 text-white' : 
                currentStep === 'result' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'suggestions' ? 'text-blue-600' : 
                currentStep === 'result' ? 'text-green-600' : 'text-gray-500'
              }`}>
                AI Suggestions
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'result' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'result' ? 'text-green-600' : 'text-gray-500'
              }`}>
                Result
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'comparison' && renderComparisonStep()}
        {currentStep === 'suggestions' && renderSuggestionsStep()}
        {currentStep === 'result' && renderResultStep()}
      </div>
    </div>
  );
};

export default ProcessVersioningDemo;
