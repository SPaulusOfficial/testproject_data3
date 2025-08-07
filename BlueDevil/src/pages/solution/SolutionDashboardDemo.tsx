import React, { useState } from 'react';

const dummyStories = [
  { id: 1, title: 'Lead erfassen', source: 'RfP', acceptance: 2, entities: ['Lead'], process: 'Lead erfassen', architecture: 'API-Integration zu SAP' },
  { id: 2, title: 'Kunde anlegen', source: 'Workshop', acceptance: 1, entities: ['Account'], process: 'Kunde anlegen', architecture: 'CRM-Datenbank' },
];

const dummyEntities = [
  { name: 'Lead', stories: [1] },
  { name: 'Account', stories: [2] },
];

const dummyProcesses = [
  { name: 'Lead erfassen', stories: [1] },
  { name: 'Kunde anlegen', stories: [2] },
];

const dummyArchitecture = [
  { decision: 'API-Integration zu SAP', process: 'Lead erfassen' },
  { decision: 'CRM-Datenbank', process: 'Kunde anlegen' },
];

const SolutionDashboardDemo: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<number | null>(null);
  const story = dummyStories.find(s => s.id === selectedStory);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Solution Overview (Demo)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Epic & Story Designer */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Epic & Story Designer</h2>
          <p className="text-sm mb-2">12 User Stories (3 aus RfP, 4 aus Workshop)</p>
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs mb-2">Stories aus PreSales importieren</button>
          <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs ml-2 mb-2">Akzeptanzkriterien generieren</button>
          <ul className="mt-2">
            {dummyStories.map(s => (
              <li key={s.id} className="mb-1 cursor-pointer hover:underline" onClick={() => setSelectedStory(s.id)}>
                <span className="font-medium">{s.title}</span> <span className="ml-2 text-xs bg-gray-200 rounded px-2">Quelle: {s.source}</span> <span className="ml-2 text-xs text-gray-500">Akzeptanzkriterien: {s.acceptance}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Data Modeling Assist */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Data Modeling Assist</h2>
          <p className="text-sm mb-2">5 Entities</p>
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs mb-2">Datenmodell aus Stories ableiten</button>
          <ul className="mt-2">
            {dummyEntities.map(e => (
              <li key={e.name} className="mb-1">
                <span className="font-medium">{e.name}</span> <span className="ml-2 text-xs text-gray-500">verknüpft mit: Story #{e.stories.join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Process Mining */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Process Mining</h2>
          <p className="text-sm mb-2">BPMN-Preview: Lead-zu-Opportunity</p>
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs mb-2">Prozess aus Stories generieren</button>
          <ul className="mt-2">
            {dummyProcesses.map(p => (
              <li key={p.name} className="mb-1">
                <span className="font-medium">{p.name}</span> <span className="ml-2 text-xs text-gray-500">Story #{p.stories.join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Solution Design */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold text-lg mb-2">Solution Design</h2>
          <p className="text-sm mb-2">Architektur-Canvas (Mini)</p>
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs mb-2">Traceability-Matrix anzeigen</button>
          <ul className="mt-2">
            {dummyArchitecture.map(a => (
              <li key={a.decision} className="mb-1">
                <span className="font-medium">{a.decision}</span> <span className="ml-2 text-xs text-gray-500">verknüpft mit: {a.process}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Traceability Panel */}
      {story && (
        <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg border-l z-50 p-6 overflow-y-auto">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setSelectedStory(null)}>&times;</button>
          <h3 className="text-xl font-bold mb-4">Traceability für: {story.title}</h3>
          <ul className="mb-2">
            <li><strong>Quelle:</strong> {story.source}</li>
            <li><strong>Akzeptanzkriterien:</strong> {story.acceptance}</li>
            <li><strong>Datenobjekte:</strong> {story.entities.join(', ')}</li>
            <li><strong>Prozessschritt:</strong> {story.process}</li>
            <li><strong>Architekturentscheidung:</strong> {story.architecture}</li>
          </ul>
          <div className="mt-4 p-3 bg-gray-50 border rounded">
            <em>Hier könnten weitere Verlinkungen, Kommentare oder Automatisierungsvorschläge angezeigt werden.</em>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionDashboardDemo; 