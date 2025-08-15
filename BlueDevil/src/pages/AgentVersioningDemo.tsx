import React, { useState } from 'react';
import SimpleChat from '@/components/AgentVersioning/SimpleChat';
import DiffViewer from '@/components/AgentVersioning/DiffViewer';
import MergePreview from '@/components/AgentVersioning/MergePreview';

// Mock data for Kreditfreigabe demo
const mockMeetingMinutes = `
Meeting: Kreditfreigabe Prozess Review
Datum: 14.08.2025
Teilnehmer: Sales, Risk Management, IT

Agenda:
1. Kreditfreigabe Prozess optimieren
2. Automatisierung prüfen

Diskussion:
- Kunde beantragt Kredit über Online-Formular
- System prüft automatisch Bonität
- Bei positiver Bonität: automatische Freigabe
- Bei negativer Bonität: manuelle Prüfung durch Risk Management
- Nach manueller Prüfung: Freigabe oder Ablehnung
- Kunde erhält automatisch Bescheid per E-Mail

Nächste Schritte:
- Prozess dokumentieren
- BPMN Diagramm erstellen
- Automatisierung implementieren
`;

const mockAgentOutputs = [
  {
    agent: "Text Extractor",
    version: "v1.0",
    content: "Prozess-Schritte extrahiert: Antrag → Bonitätsprüfung → Automatische Freigabe/Manuelle Prüfung → Entscheidung → Benachrichtigung",
    confidence: 0.95
  },
  {
    agent: "Process Analyzer", 
    version: "v1.1",
    content: "Strukturierter Prozess:\n1. Start Event: Kreditantrag\n2. Task: Online-Formular ausfüllen\n3. Gateway: Bonitätsprüfung\n4. Task: Automatische Freigabe (wenn positiv)\n5. Task: Manuelle Prüfung (wenn negativ)\n6. Gateway: Entscheidung\n7. Task: Kunde benachrichtigen\n8. End Event: Prozess abgeschlossen",
    confidence: 0.88
  },
  {
    agent: "BPMN Generator",
    version: "v1.2", 
    content: "BPMN XML generiert:\n<process id='kreditfreigabe'>\n  <startEvent id='start' name='Kreditantrag'/>\n  <userTask id='formular' name='Online-Formular'/>\n  <exclusiveGateway id='bonitaet' name='Bonitätsprüfung'/>\n  <serviceTask id='autoFreigabe' name='Automatische Freigabe'/>\n  <userTask id='manuellePruefung' name='Manuelle Prüfung'/>\n  <exclusiveGateway id='entscheidung' name='Entscheidung'/>\n  <serviceTask id='benachrichtigung' name='Kunde benachrichtigen'/>\n  <endEvent id='end' name='Prozess abgeschlossen'/>\n</process>",
    confidence: 0.92
  }
];

const mockDiffData = {
  changes: [
    {
      type: 'modification' as const,
      line: 1,
      oldContent: 'Prozess-Schritte extrahiert: Antrag → Bonitätsprüfung → Automatische Freigabe/Manuelle Prüfung → Entscheidung → Benachrichtigung',
      newContent: 'Strukturierter Prozess:\n1. Start Event: Kreditantrag\n2. Task: Online-Formular ausfüllen\n3. Gateway: Bonitätsprüfung\n4. Task: Automatische Freigabe (wenn positiv)\n5. Task: Manuelle Prüfung (wenn negativ)\n6. Gateway: Entscheidung\n7. Task: Kunde benachrichtigen\n8. End Event: Prozess abgeschlossen'
    },
    {
      type: 'addition' as const,
      line: 2,
      content: 'BPMN XML generiert:\n<process id=\'kreditfreigabe\'>\n  <startEvent id=\'start\' name=\'Kreditantrag\'/>\n  <userTask id=\'formular\' name=\'Online-Formular\'/>\n  <exclusiveGateway id=\'bonitaet\' name=\'Bonitätsprüfung\'/>\n  <serviceTask id=\'autoFreigabe\' name=\'Automatische Freigabe\'/>\n  <userTask id=\'manuellePruefung\' name=\'Manuelle Prüfung\'/>\n  <exclusiveGateway id=\'entscheidung\' name=\'Entscheidung\'/>\n  <serviceTask id=\'benachrichtigung\' name=\'Kunde benachrichtigen\'/>\n  <endEvent id=\'end\' name=\'Prozess abgeschlossen\'/>\n</process>'
    }
  ],
  summary: {
    additions: 1,
    deletions: 0,
    modifications: 1,
    totalChanges: 2
  },
  algorithm: 'line-based',
  timestamp: new Date().toISOString()
};

const mockMergeSuggestion = {
  suggestions: [
    {
      change: mockDiffData.changes[0],
      approved: true,
      confidence: 0.85,
      reasoning: 'Process structure improved from simple list to detailed BPMN elements'
    },
    {
      change: mockDiffData.changes[1],
      approved: true,
      confidence: 0.92,
      reasoning: 'BPMN XML generation adds technical implementation details'
    }
  ],
  approvedChanges: mockDiffData.changes,
  finalContent: "Strukturierter Prozess:\n1. Start Event: Kreditantrag\n2. Task: Online-Formular ausfüllen\n3. Gateway: Bonitätsprüfung\n4. Task: Automatische Freigabe (wenn positiv)\n5. Task: Manuelle Prüfung (wenn negativ)\n6. Gateway: Entscheidung\n7. Task: Kunde benachrichtigen\n8. End Event: Prozess abgeschlossen\n\nBPMN XML generiert:\n<process id='kreditfreigabe'>\n  <startEvent id='start' name='Kreditantrag'/>\n  <userTask id='formular' name='Online-Formular'/>\n  <exclusiveGateway id='bonitaet' name='Bonitätsprüfung'/>\n  <serviceTask id='autoFreigabe' name='Automatische Freigabe'/>\n  <userTask id='manuellePruefung' name='Manuelle Prüfung'/>\n  <exclusiveGateway id='entscheidung' name='Entscheidung'/>\n  <serviceTask id='benachrichtigung' name='Kunde benachrichtigen'/>\n  <endEvent id='end' name='Prozess abgeschlossen'/>\n</process>",
  confidence: 0.88,
  strategy: 'balanced',
  reasoning: 'Merge strategy: balanced. Approved 2/2 changes. Process structure improvement and BPMN XML generation both add value.'
};

const AgentVersioningDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<'upload' | 'processing' | 'chat' | 'diff' | 'merge' | 'result'>('upload');
  const [workflowId] = useState('kreditfreigabe-demo-123');
  const [sessionId] = useState('demo-session-456');
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  const handleMessageSend = async (message: string) => {
    console.log('Sending message:', message);
    return Promise.resolve();
  };

  const handleViewMerge = () => {
    setCurrentView('merge');
  };

  const handleAcceptMerge = () => {
    console.log('Merge accepted!');
    setCurrentView('result');
  };

  const handleRejectMerge = () => {
    console.log('Merge rejected!');
    setCurrentView('diff');
  };

  const handleDocumentUpload = () => {
    setUploadedDocuments(['Meeting Minutes - Kreditfreigabe.pdf', 'Prozess-Dokumentation.docx']);
    setCurrentView('processing');
  };

  const handleStartProcessing = () => {
    setCurrentView('chat');
    // Simulate agent processing
    setTimeout(() => {
      setCurrentStep(1);
    }, 2000);
    setTimeout(() => {
      setCurrentStep(2);
    }, 4000);
    setTimeout(() => {
      setCurrentView('diff');
    }, 6000);
  };

  const renderUploadView = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Upload</h3>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-gray-600 mb-2">Drag & Drop your documents here</p>
          <p className="text-sm text-gray-500">or</p>
          <button 
            onClick={handleDocumentUpload}
            className="mt-2 px-4 py-2 bg-digital-blue text-white rounded-md hover:bg-deep-blue-2 transition-colors"
          >
            Browse Files
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Demo: Kreditfreigabe Prozess</h4>
          <p className="text-sm text-blue-800">
            Upload Meeting Minutes and documents containing the "Kreditfreigabe" process.
            The system will extract and analyze the process automatically.
          </p>
        </div>
      </div>
    </div>
  );

  const renderProcessingView = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Documents</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</div>
            <span className="text-green-800">Documents uploaded successfully</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {uploadedDocuments.map((doc, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <span className="text-gray-600">📄</span>
              <span className="text-sm">{doc}</span>
            </div>
          ))}
        </div>
        
        <button 
          onClick={handleStartProcessing}
          className="w-full px-4 py-2 bg-digital-blue text-white rounded-md hover:bg-deep-blue-2 transition-colors"
        >
          Start Process Analysis
        </button>
      </div>
    </div>
  );

  const renderResultView = () => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Result: Kreditfreigabe BPMN</h3>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600">✅</span>
            <span className="font-medium text-green-800">Process successfully generated!</span>
          </div>
          <p className="text-sm text-green-700">
            The Kreditfreigabe process has been analyzed and converted to BPMN format.
          </p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Generated BPMN Process:</h4>
          <pre className="text-xs text-gray-700 bg-white p-2 rounded border overflow-x-auto">
{`<process id="kreditfreigabe">
  <startEvent id="start" name="Kreditantrag"/>
  <userTask id="formular" name="Online-Formular"/>
  <exclusiveGateway id="bonitaet" name="Bonitätsprüfung"/>
  <serviceTask id="autoFreigabe" name="Automatische Freigabe"/>
  <userTask id="manuellePruefung" name="Manuelle Prüfung"/>
  <exclusiveGateway id="entscheidung" name="Entscheidung"/>
  <serviceTask id="benachrichtigung" name="Kunde benachrichtigen"/>
  <endEvent id="end" name="Prozess abgeschlossen"/>
</process>`}
          </pre>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentView('upload')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Start New Process
          </button>
          <button 
            onClick={() => window.open('/demo/agent-versioning', '_blank')}
            className="px-4 py-2 bg-digital-blue text-white rounded-md hover:bg-deep-blue-2 transition-colors"
          >
            View Version History
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agent Versioning Demo - Kreditfreigabe Prozess
          </h1>
          <p className="text-gray-600">
            Real-world demonstration: From Meeting Minutes to BPMN Process
          </p>
        </div>

        {/* Demo Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'upload'
                    ? 'bg-digital-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                1. Upload
              </button>
              <button
                onClick={() => setCurrentView('processing')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'processing'
                    ? 'bg-digital-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                2. Processing
              </button>
              <button
                onClick={() => setCurrentView('chat')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'chat'
                    ? 'bg-digital-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                3. Agents
              </button>
              <button
                onClick={() => setCurrentView('diff')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'diff'
                    ? 'bg-digital-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                4. Review
              </button>
              <button
                onClick={() => setCurrentView('result')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'result'
                    ? 'bg-digital-blue text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                5. Result
              </button>
            </div>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Demo Scenario: Kreditfreigabe Prozess</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Input:</strong> Meeting Minutes + Dokumente</p>
            <p><strong>Process:</strong> Kreditfreigabe</p>
            <p><strong>Output:</strong> BPMN Diagram</p>
            <p><strong>Agents:</strong> Text Extractor → Process Analyzer → BPMN Generator</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {currentView === 'upload' && renderUploadView()}
            {currentView === 'processing' && renderProcessingView()}
            {currentView === 'result' && renderResultView()}
            
            {currentView === 'chat' && (
              <SimpleChat
                workflowId={workflowId}
                sessionId={sessionId}
                onMessageSend={handleMessageSend}
              />
            )}
            
            {currentView === 'diff' && (
              <DiffViewer
                diff={mockDiffData}
                onViewMerge={handleViewMerge}
              />
            )}
            
            {currentView === 'merge' && (
              <MergePreview
                mergeSuggestion={mockMergeSuggestion}
                onAccept={handleAcceptMerge}
                onReject={handleRejectMerge}
              />
            )}
          </div>

          {/* Right Column - Demo Info */}
          <div className="space-y-6">
            {/* Current Step Info */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Step</h3>
              <div className="space-y-3">
                {currentView === 'upload' && (
                  <div className="text-sm text-gray-700">
                    <p><strong>Step 1:</strong> Upload Meeting Minutes and documents</p>
                    <p>• Meeting Minutes - Kreditfreigabe.pdf</p>
                    <p>• Prozess-Dokumentation.docx</p>
                  </div>
                )}
                {currentView === 'processing' && (
                  <div className="text-sm text-gray-700">
                    <p><strong>Step 2:</strong> Document processing</p>
                    <p>• Text extraction</p>
                    <p>• Process identification</p>
                  </div>
                )}
                {currentView === 'chat' && (
                  <div className="text-sm text-gray-700">
                    <p><strong>Step 3:</strong> Agent processing</p>
                    <p>• Text Extractor: {currentStep >= 1 ? '✅' : '⏳'}</p>
                    <p>• Process Analyzer: {currentStep >= 2 ? '✅' : '⏳'}</p>
                    <p>• BPMN Generator: {currentStep >= 3 ? '✅' : '⏳'}</p>
                  </div>
                )}
                {currentView === 'diff' && (
                  <div className="text-sm text-gray-700">
                    <p><strong>Step 4:</strong> Review changes</p>
                    <p>• Compare versions</p>
                    <p>• Approve/reject changes</p>
                  </div>
                )}
                {currentView === 'result' && (
                  <div className="text-sm text-gray-700">
                    <p><strong>Step 5:</strong> Final result</p>
                    <p>• BPMN diagram generated</p>
                    <p>• Process documented</p>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Minutes Preview */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Minutes Preview</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {mockMeetingMinutes}
                </pre>
              </div>
            </div>

            {/* Agent Outputs */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Outputs</h3>
              <div className="space-y-3">
                {mockAgentOutputs.map((output, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{output.agent}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {output.version}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {output.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        output.confidence > 0.8 
                          ? 'bg-green-100 text-green-800'
                          : output.confidence > 0.6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(output.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Agent Versioning Demo - Real-world Kreditfreigabe Process</p>
            <p className="mt-1">
              <a 
                href="https://n8n.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-digital-blue hover:underline"
              >
                n8n.io
              </a>
              {' | '}
              <a 
                href="/AGENT_VERSIONING_DEMO_README.md" 
                target="_blank"
                className="text-digital-blue hover:underline"
              >
                Documentation
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentVersioningDemo;
