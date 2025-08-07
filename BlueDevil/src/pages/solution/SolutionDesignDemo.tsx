import React, { useState } from 'react';

const architectureDemo = [
  { id: 1, name: 'Salesforce Lightning Web Component', type: 'Frontend', status: 'Live', description: 'UI-Komponente für Opportunity Management.' },
  { id: 2, name: 'Apex REST Service', type: 'Backend', status: 'In Entwicklung', description: 'API für Integration mit SAP.' },
  { id: 3, name: 'Salesforce Database', type: 'Datenbank', status: 'Live', description: 'Objekte: Lead, Account, Opportunity.' },
  { id: 4, name: 'Process Builder', type: 'Automation', status: 'Geplant', description: 'Automatisierung von Lead-Qualifizierung.' },
];
const integrationDemo = [
  { id: 1, name: 'SAP Integration', type: 'REST', status: 'Live', description: 'Bidirektionale Synchronisation mit SAP.' },
  { id: 2, name: 'Email Marketing', type: 'SMTP', status: 'Geplant', description: 'Versand von Kampagnen-Emails.' },
];
const specsDemo = [
  { id: 1, title: 'Opportunity Objekt', detail: 'Custom Fields: Stage, Amount, CloseDate.' },
  { id: 2, title: 'API Rate Limit', detail: 'Max. 1000 Requests/Minute.' },
  { id: 3, title: 'Security', detail: 'OAuth2, FLS, CRUD, Sharing Rules.' },
];

const statusColors: { [key: string]: string } = {
  'Live': 'bg-green-100 text-green-800',
  'In Entwicklung': 'bg-yellow-100 text-yellow-800',
  'Geplant': 'bg-blue-100 text-blue-800',
};

const SolutionDesignDemo: React.FC = () => {
  const [tab, setTab] = useState<'arch' | 'specs' | 'integration'>('arch');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'arch' | 'specs' | 'integration'>('arch');
  const [modalData, setModalData] = useState<any>(null);

  // Demo AI analysis
  const aiFindings = [
    'API Security: OAuth2 empfohlen',
    'Integration mit SAP benötigt Mapping-Logik',
    'Process Builder kann Opportunity-Workflow automatisieren',
  ];

  // Modal open helpers
  const openModal = (type: typeof modalType, data: any = null) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
  };

  // Modal content
  const renderModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">
          {modalData ? 'Bearbeiten' : 'Neu anlegen'}: {modalType === 'arch' ? 'Architektur-Komponente' : modalType === 'specs' ? 'Technische Spezifikation' : 'Integration'}
        </h3>
        <div className="mb-4">
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Name/Titel" defaultValue={modalData?.name || modalData?.title || ''} />
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Typ/Detail" defaultValue={modalData?.type || modalData?.detail || ''} />
          <textarea className="w-full border rounded px-3 py-2 mb-2" placeholder="Beschreibung" defaultValue={modalData?.description || ''} />
          <select className="w-full border rounded px-3 py-2 mb-2" defaultValue={modalData?.status || 'Live'}>
            <option value="Live">Live</option>
            <option value="In Entwicklung">In Entwicklung</option>
            <option value="Geplant">Geplant</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowModal(false)}>Abbrechen</button>
          <button className="px-4 py-2 bg-digital-blue text-white rounded" onClick={() => setShowModal(false)}>Speichern</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-digital-blue to-deep-blue-1 text-white rounded-lg p-6 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <span>🚀 Solution Design (Demo)</span>
        </h1>
        <div className="flex flex-wrap gap-4 text-lg">
          <span className="bg-white/10 px-3 py-1 rounded">Salesforce Architektur</span>
          <span className="bg-white/10 px-3 py-1 rounded">AI Features</span>
          <span className="bg-white/10 px-3 py-1 rounded">Präsentationsmodus</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button className={`px-4 py-2 rounded-t font-semibold transition ${tab === 'arch' ? 'bg-digital-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setTab('arch')}>🏛 Architektur</button>
        <button className={`px-4 py-2 rounded-t font-semibold transition ${tab === 'specs' ? 'bg-digital-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setTab('specs')}>🛠 Technische Spezifikationen</button>
        <button className={`px-4 py-2 rounded-t font-semibold transition ${tab === 'integration' ? 'bg-digital-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} onClick={() => setTab('integration')}>🔗 Integration Design</button>
      </div>
      {/* Tab Content */}
      <div className="bg-white rounded-b-lg shadow p-6 min-h-[320px]">
        {tab === 'arch' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">🏛 Architektur-Komponenten</h2>
              <button className="bg-digital-blue text-white px-4 py-2 rounded font-semibold shadow hover:bg-deep-blue-1 transition" onClick={() => openModal('arch')}>+ Komponente</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {architectureDemo.map(comp => (
                <div key={comp.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border-l-4 border-digital-blue rounded p-4 shadow hover:shadow-lg transition cursor-pointer" onClick={() => openModal('arch', comp)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{comp.type === 'Frontend' ? '🖥️' : comp.type === 'Backend' ? '🛠️' : comp.type === 'Datenbank' ? '🗄️' : '⚙️'}</span>
                    <span className="font-semibold text-digital-blue">{comp.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{comp.description}</div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[comp.status]}`}>{comp.status}</span>
                </div>
              ))}
            </div>
            {/* AI Analysis */}
            <div className="mt-8">
              <h3 className="font-semibold mb-2 flex items-center gap-2">🤖 AI Analyse</h3>
              <ul className="list-disc ml-6 text-gray-700">
                {aiFindings.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </>
        )}
        {tab === 'specs' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">🛠 Technische Spezifikationen</h2>
              <button className="bg-digital-blue text-white px-4 py-2 rounded font-semibold shadow hover:bg-deep-blue-1 transition" onClick={() => openModal('specs')}>+ Spezifikation</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specsDemo.map(spec => (
                <div key={spec.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border-l-4 border-mid-blue-2 rounded p-4 shadow hover:shadow-lg transition cursor-pointer" onClick={() => openModal('specs', spec)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🛠️</span>
                    <span className="font-semibold text-mid-blue-2">{spec.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{spec.detail}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {tab === 'integration' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">🔗 Integration Design</h2>
              <button className="bg-digital-blue text-white px-4 py-2 rounded font-semibold shadow hover:bg-deep-blue-1 transition" onClick={() => openModal('integration')}>+ Integration</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrationDemo.map(intg => (
                <div key={intg.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border-l-4 border-blue-400 rounded p-4 shadow hover:shadow-lg transition cursor-pointer" onClick={() => openModal('integration', intg)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🔗</span>
                    <span className="font-semibold text-blue-500">{intg.name}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{intg.description}</div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[intg.status]}`}>{intg.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Modal */}
      {showModal && renderModal()}
    </div>
  );
};

export default SolutionDesignDemo; 