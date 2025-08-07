import React, { useState } from 'react';

interface Entity {
  id: string;
  name: string;
  description: string;
  attributes: Attribute[];
  relationships: Relationship[];
  source: 'manual' | 'ai-extracted' | 'story-derived';
}

interface Attribute {
  id: string;
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  description: string;
}

interface Relationship {
  id: string;
  fromEntity: string;
  toEntity: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  description: string;
}

const initialEntities: Entity[] = [
  {
    id: 'account',
    name: 'Account',
    description: 'Kunden-Accounts im Salesforce CRM',
    source: 'story-derived',
    attributes: [
      { id: '1', name: 'Id', type: 'ID', required: true, unique: true, description: 'Salesforce Record ID' },
      { id: '2', name: 'Name', type: 'TEXT(255)', required: true, unique: false, description: 'Account-Name' },
      { id: '3', name: 'Type', type: 'PICKLIST', required: false, unique: false, description: 'Account-Typ (Customer, Prospect, etc.)' },
      { id: '4', name: 'Industry', type: 'PICKLIST', required: false, unique: false, description: 'Branche' },
      { id: '5', name: 'BillingStreet', type: 'TEXTAREA', required: false, unique: false, description: 'Rechnungsadresse' },
      { id: '6', name: 'Phone', type: 'PHONE', required: false, unique: false, description: 'Telefonnummer' },
      { id: '7', name: 'Website', type: 'URL', required: false, unique: false, description: 'Website' },
      { id: '8', name: 'CreatedDate', type: 'DATETIME', required: true, unique: false, description: 'Erstellungsdatum' },
    ],
    relationships: [
      { id: '1', fromEntity: 'account', toEntity: 'contact', type: 'one-to-many', description: 'Account hat mehrere Kontakte' },
      { id: '2', fromEntity: 'account', toEntity: 'opportunity', type: 'one-to-many', description: 'Account hat mehrere Verkaufschancen' }
    ]
  },
  {
    id: 'contact',
    name: 'Contact',
    description: 'Kontakte innerhalb von Accounts',
    source: 'story-derived',
    attributes: [
      { id: '1', name: 'Id', type: 'ID', required: true, unique: true, description: 'Salesforce Record ID' },
      { id: '2', name: 'FirstName', type: 'TEXT(40)', required: true, unique: false, description: 'Vorname' },
      { id: '3', name: 'LastName', type: 'TEXT(80)', required: true, unique: false, description: 'Nachname' },
      { id: '4', name: 'Email', type: 'EMAIL', required: false, unique: false, description: 'E-Mail-Adresse' },
      { id: '5', name: 'Phone', type: 'PHONE', required: false, unique: false, description: 'Telefonnummer' },
      { id: '6', name: 'Title', type: 'TEXT(128)', required: false, unique: false, description: 'Position/Titel' },
      { id: '7', name: 'Department', type: 'TEXT(80)', required: false, unique: false, description: 'Abteilung' },
      { id: '8', name: 'CreatedDate', type: 'DATETIME', required: true, unique: false, description: 'Erstellungsdatum' },
    ],
    relationships: [
      { id: '1', fromEntity: 'contact', toEntity: 'account', type: 'many-to-one', description: 'Kontakt gehört zu Account' },
      { id: '2', fromEntity: 'contact', toEntity: 'case', type: 'one-to-many', description: 'Kontakt kann mehrere Cases haben' }
    ]
  },
  {
    id: 'lead',
    name: 'Lead',
    description: 'Potentielle Kunden im Verkaufsprozess',
    source: 'ai-extracted',
    attributes: [
      { id: '1', name: 'Id', type: 'ID', required: true, unique: true, description: 'Salesforce Record ID' },
      { id: '2', name: 'FirstName', type: 'TEXT(40)', required: true, unique: false, description: 'Vorname' },
      { id: '3', name: 'LastName', type: 'TEXT(80)', required: true, unique: false, description: 'Nachname' },
      { id: '4', name: 'Company', type: 'TEXT(255)', required: true, unique: false, description: 'Firmenname' },
      { id: '5', name: 'Email', type: 'EMAIL', required: false, unique: false, description: 'E-Mail-Adresse' },
      { id: '6', name: 'Phone', type: 'PHONE', required: false, unique: false, description: 'Telefonnummer' },
      { id: '7', name: 'Status', type: 'PICKLIST', required: true, unique: false, description: 'Lead-Status (New, Qualified, etc.)' },
      { id: '8', name: 'LeadSource', type: 'PICKLIST', required: false, unique: false, description: 'Lead-Quelle' },
      { id: '9', name: 'CreatedDate', type: 'DATETIME', required: true, unique: false, description: 'Erstellungsdatum' },
    ],
    relationships: [
      { id: '1', fromEntity: 'lead', toEntity: 'opportunity', type: 'one-to-many', description: 'Lead kann zu Opportunity werden' }
    ]
  },
  {
    id: 'opportunity',
    name: 'Opportunity',
    description: 'Verkaufschancen im CRM',
    source: 'ai-extracted',
    attributes: [
      { id: '1', name: 'Id', type: 'ID', required: true, unique: true, description: 'Salesforce Record ID' },
      { id: '2', name: 'Name', type: 'TEXT(120)', required: true, unique: false, description: 'Opportunity-Name' },
      { id: '3', name: 'Amount', type: 'CURRENCY', required: false, unique: false, description: 'Betrag' },
      { id: '4', name: 'StageName', type: 'PICKLIST', required: true, unique: false, description: 'Verkaufsphase' },
      { id: '5', name: 'CloseDate', type: 'DATE', required: true, unique: false, description: 'Abschlussdatum' },
      { id: '6', name: 'Type', type: 'PICKLIST', required: false, unique: false, description: 'Opportunity-Typ' },
      { id: '7', name: 'Probability', type: 'PERCENT', required: false, unique: false, description: 'Wahrscheinlichkeit (%)' },
      { id: '8', name: 'CreatedDate', type: 'DATETIME', required: true, unique: false, description: 'Erstellungsdatum' },
    ],
    relationships: [
      { id: '1', fromEntity: 'opportunity', toEntity: 'account', type: 'many-to-one', description: 'Opportunity gehört zu Account' },
      { id: '2', fromEntity: 'opportunity', toEntity: 'opportunitylineitem', type: 'one-to-many', description: 'Opportunity hat mehrere Produkte' }
    ]
  }
];

const DataModelingAssistDemo: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [activeTab, setActiveTab] = useState<'entities' | 'erd' | 'schema' | 'ai'>('entities');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [modalMode, setModalMode] = useState<'addEntity' | 'editEntity' | 'addAttribute' | 'editAttribute'>('addEntity');
  const [entityForm, setEntityForm] = useState({ name: '', description: '' });
  const [attributeForm, setAttributeForm] = useState({ name: '', type: 'VARCHAR(255)', required: false, unique: false, description: '' });
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // AI Entity Extraction (Dummy)
  const handleAIExtractEntities = async () => {
    setIsAiAnalyzing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suggestions = [
      'Case (Support-Tickets)',
      'OpportunityLineItem (Produktpositionen)',
      'Product (Produktkatalog)',
      'PricebookEntry (Preiseinträge)',
      'Task (Aufgaben)',
      'Note (Notizen)',
      'Attachment (Anhänge)',
      'User (Benutzer)'
    ];
    
    setAiSuggestions(suggestions);
    setIsAiAnalyzing(false);
  };

  // Entity Management
  const handleAddEntity = () => {
    if (entityForm.name.trim()) {
      const newEntity: Entity = {
        id: entityForm.name.toLowerCase().replace(/\s+/g, '_'),
        name: entityForm.name,
        description: entityForm.description,
        attributes: [],
        relationships: [],
        source: 'manual'
      };
      setEntities([...entities, newEntity]);
      setEntityForm({ name: '', description: '' });
      setShowEntityModal(false);
    }
  };

  const handleEditEntity = () => {
    if (selectedEntity && entityForm.name.trim()) {
      setEntities(entities.map(e => 
        e.id === selectedEntity.id 
          ? { ...e, name: entityForm.name, description: entityForm.description }
          : e
      ));
      setShowEntityModal(false);
    }
  };

  // Attribute Management
  const handleAddAttribute = () => {
    if (selectedEntity && attributeForm.name.trim()) {
      const newAttribute: Attribute = {
        id: Date.now().toString(),
        name: attributeForm.name,
        type: attributeForm.type,
        required: attributeForm.required,
        unique: attributeForm.unique,
        description: attributeForm.description
      };
      setEntities(entities.map(e => 
        e.id === selectedEntity.id 
          ? { ...e, attributes: [...e.attributes, newAttribute] }
          : e
      ));
      setAttributeForm({ name: '', type: 'VARCHAR(255)', required: false, unique: false, description: '' });
      setShowAttributeModal(false);
    }
  };

  // Generate SQL Schema
  const generateSQLSchema = () => {
    let sql = '-- Generated Salesforce Object Schema\n\n';
    entities.forEach(entity => {
      sql += `-- ${entity.name} Object\n`;
      sql += `CREATE TABLE ${entity.name.toLowerCase()} (\n`;
      entity.attributes.forEach((attr, idx) => {
        const nullable = attr.required ? 'NOT NULL' : 'NULL';
        const unique = attr.unique ? 'UNIQUE' : '';
        const primary = attr.name === 'Id' ? 'PRIMARY KEY' : '';
        const constraints = [nullable, unique, primary].filter(Boolean).join(' ');
        sql += `  ${attr.name} ${attr.type}${constraints ? ' ' + constraints : ''}${idx < entity.attributes.length - 1 ? ',' : ''}\n`;
      });
      sql += ');\n\n';
    });
    return sql;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Data Modeling Assist (Demo)</h1>
      
      {/* AI Status Banner */}
      <div className="bg-gradient-to-r from-digital-blue to-deep-blue-1 text-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">🤖 AI Data Modeling Assistant</h3>
            <p className="text-sm opacity-90">Automatische Entity-Extraktion aus Stories, ERD-Generierung und Schema-Optimierung</p>
          </div>
          <button
            className="bg-white/20 text-white px-4 py-2 rounded font-semibold hover:bg-white/30 transition"
            onClick={handleAIExtractEntities}
            disabled={isAiAnalyzing}
          >
            {isAiAnalyzing ? '🔍 Analysiere...' : '🔍 AI Entity Extraction'}
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-800 mb-2">🤖 AI-Vorschläge für neue Entities:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                <span className="text-sm">{suggestion}</span>
                <button className="text-xs bg-digital-blue text-white px-2 py-1 rounded hover:bg-deep-blue-1">
                  Hinzufügen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-6">
          {[
            { key: 'entities', label: 'Entities', icon: '📋' },
            { key: 'erd', label: 'ERD', icon: '🔗' },
            { key: 'schema', label: 'Schema', icon: '🗄️' },
            { key: 'ai', label: 'AI Features', icon: '🤖' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'border-digital-blue text-digital-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'entities' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Data Entities</h2>
            <button
              className="bg-digital-blue text-white px-4 py-2 rounded font-semibold hover:bg-deep-blue-1 transition"
              onClick={() => {
                setModalMode('addEntity');
                setEntityForm({ name: '', description: '' });
                setShowEntityModal(true);
              }}
            >
              + Entity
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map(entity => (
              <div key={entity.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-digital-blue">{entity.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    entity.source === 'ai-extracted' ? 'bg-green-100 text-green-800' :
                    entity.source === 'story-derived' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {entity.source === 'ai-extracted' ? '🤖 AI' :
                     entity.source === 'story-derived' ? '📖 Story' : '✏️ Manual'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{entity.description}</p>
                <div className="mb-4">
                  <span className="text-xs font-semibold text-gray-500">Attributes: {entity.attributes.length}</span>
                  <div className="mt-2 space-y-1">
                    {entity.attributes.slice(0, 3).map(attr => (
                      <div key={attr.id} className="text-xs bg-gray-50 px-2 py-1 rounded">
                        {attr.name}: {attr.type}
                      </div>
                    ))}
                    {entity.attributes.length > 3 && (
                      <div className="text-xs text-gray-400">+{entity.attributes.length - 3} weitere</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs bg-mid-blue-2 text-white px-2 py-1 rounded hover:bg-mid-blue-1"
                    onClick={() => {
                      setSelectedEntity(entity);
                      setModalMode('addAttribute');
                      setShowAttributeModal(true);
                    }}
                  >
                    + Attribute
                  </button>
                  <button
                    className="text-xs text-digital-blue underline hover:text-deep-blue-2"
                    onClick={() => {
                      setSelectedEntity(entity);
                      setModalMode('editEntity');
                      setEntityForm({ name: entity.name, description: entity.description });
                      setShowEntityModal(true);
                    }}
                  >
                    Bearbeiten
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'erd' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Entity Relationship Diagram</h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <p className="text-gray-600 mb-4">ERD-Visualisierung wird hier angezeigt</p>
            <p className="text-sm text-gray-500">Interaktives Diagramm mit Entity-Beziehungen</p>
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Salesforce Metadata Schema</h2>
            <button className="bg-digital-blue text-white px-3 py-1 rounded text-sm hover:bg-deep-blue-1">
              📋 Kopieren
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Account</label>
    <pluralLabel>Accounts</pluralLabel>
    <nameField>
        <displayFormat>A-{0000}</displayFormat>
        <label>Account Name</label>
        <type>Text</type>
    </nameField>
    <deploymentStatus>Deployed</deploymentStatus>
    <enableActivities>true</enableActivities>
    <enableBulkApi>true</enableBulkApi>
    <enableFeeds>false</enableFeeds>
    <enableHistory>false</enableHistory>
    <enableLicensing>false</enableLicensing>
    <enableReports>true</enableReports>
    <enableSearch>true</enableSearch>
    <enableSharing>true</enableSharing>
    <enableStreamingApi>true</enableStreamingApi>
    <externalSharingModel>Private</externalSharingModel>
    <sharingModel>ReadWrite</sharingModel>
    <fields>
        <fullName>Type__c</fullName>
        <externalId>false</externalId>
        <label>Type</label>
        <required>false</required>
        <trackHistory>false</trackHistory>
        <trackTrending>false</trackTrending>
        <type>Picklist</type>
        <valueSet>
            <restricted>true</restricted>
            <valueSetDefinition>
                <sorted>false</sorted>
                <value>
                    <fullName>Customer</fullName>
                    <default>false</default>
                    <label>Customer</label>
                </value>
                <value>
                    <fullName>Prospect</fullName>
                    <default>false</default>
                    <label>Prospect</label>
                </value>
                <value>
                    <fullName>Partner</fullName>
                    <default>false</default>
                    <label>Partner</label>
                </value>
            </valueSetDefinition>
        </valueSet>
    </fields>
    <fields>
        <fullName>Industry__c</fullName>
        <externalId>false</externalId>
        <label>Industry</label>
        <required>false</required>
        <trackHistory>false</trackHistory>
        <trackTrending>false</trackTrending>
        <type>Picklist</type>
        <valueSet>
            <restricted>true</restricted>
            <valueSetDefinition>
                <sorted>false</sorted>
                <value>
                    <fullName>Technology</fullName>
                    <default>false</default>
                    <label>Technology</label>
                </value>
                <value>
                    <fullName>Manufacturing</fullName>
                    <default>false</default>
                    <label>Manufacturing</label>
                </value>
                <value>
                    <fullName>Healthcare</fullName>
                    <default>false</default>
                    <label>Healthcare</label>
                </value>
                <value>
                    <fullName>Finance</fullName>
                    <default>false</default>
                    <label>Finance</label>
                </value>
            </valueSetDefinition>
        </valueSet>
    </fields>
    <fields>
        <fullName>Rating__c</fullName>
        <externalId>false</externalId>
        <label>Rating</label>
        <required>false</required>
        <trackHistory>false</trackHistory>
        <trackTrending>false</trackTrending>
        <type>Picklist</type>
        <valueSet>
            <restricted>true</restricted>
            <valueSetDefinition>
                <sorted>false</sorted>
                <value>
                    <fullName>Hot</fullName>
                    <default>false</default>
                    <label>Hot</label>
                </value>
                <value>
                    <fullName>Warm</fullName>
                    <default>false</default>
                    <label>Warm</label>
                </value>
                <value>
                    <fullName>Cold</fullName>
                    <default>false</default>
                    <label>Cold</label>
                </value>
            </valueSetDefinition>
        </valueSet>
    </fields>
</CustomObject>`}
          </pre>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">🤖 AI Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Entity Extraction</h3>
                <p className="text-sm text-gray-600 mb-3">Extrahiert automatisch Entities aus User Stories</p>
                <button className="bg-digital-blue text-white px-3 py-1 rounded text-sm hover:bg-deep-blue-1">
                  Jetzt starten
                </button>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Relationship Detection</h3>
                <p className="text-sm text-gray-600 mb-3">Erkennt automatisch Beziehungen zwischen Entities</p>
                <button className="bg-digital-blue text-white px-3 py-1 rounded text-sm hover:bg-deep-blue-1">
                  Analysieren
                </button>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Schema Optimization</h3>
                <p className="text-sm text-gray-600 mb-3">Optimiert das Datenbankschema für Performance</p>
                <button className="bg-digital-blue text-white px-3 py-1 rounded text-sm hover:bg-deep-blue-1">
                  Optimieren
                </button>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-semibold mb-2">Constraint Suggestions</h3>
                <p className="text-sm text-gray-600 mb-3">Schlägt Constraints und Indizes vor</p>
                <button className="bg-digital-blue text-white px-3 py-1 rounded text-sm hover:bg-deep-blue-1">
                  Vorschläge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entity Modal */}
      {showEntityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">
              {modalMode === 'addEntity' ? 'Neue Entity anlegen' : 'Entity bearbeiten'}
            </h3>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Entity-Name"
              value={entityForm.name}
              onChange={e => setEntityForm(f => ({ ...f, name: e.target.value }))}
            />
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Beschreibung"
              rows={3}
              value={entityForm.description}
              onChange={e => setEntityForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowEntityModal(false)}>Abbrechen</button>
              <button 
                className="px-4 py-2 bg-digital-blue text-white rounded" 
                onClick={modalMode === 'addEntity' ? handleAddEntity : handleEditEntity}
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attribute Modal */}
      {showAttributeModal && selectedEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Attribute für {selectedEntity.name}</h3>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Attribut-Name"
              value={attributeForm.name}
              onChange={e => setAttributeForm(f => ({ ...f, name: e.target.value }))}
            />
            <select
              className="w-full border rounded px-3 py-2 mb-3"
              value={attributeForm.type}
              onChange={e => setAttributeForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="TEXT(255)">TEXT(255)</option>
              <option value="TEXTAREA">TEXTAREA</option>
              <option value="EMAIL">EMAIL</option>
              <option value="PHONE">PHONE</option>
              <option value="URL">URL</option>
              <option value="PICKLIST">PICKLIST</option>
              <option value="MULTIPICKLIST">MULTIPICKLIST</option>
              <option value="NUMBER">NUMBER</option>
              <option value="CURRENCY">CURRENCY</option>
              <option value="PERCENT">PERCENT</option>
              <option value="DATE">DATE</option>
              <option value="DATETIME">DATETIME</option>
              <option value="TIME">TIME</option>
              <option value="CHECKBOX">CHECKBOX</option>
              <option value="ID">ID</option>
              <option value="REFERENCE">REFERENCE</option>
            </select>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={attributeForm.required}
                  onChange={e => setAttributeForm(f => ({ ...f, required: e.target.checked }))}
                  className="mr-2"
                />
                Required
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={attributeForm.unique}
                  onChange={e => setAttributeForm(f => ({ ...f, unique: e.target.checked }))}
                  className="mr-2"
                />
                Unique
              </label>
            </div>
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Beschreibung"
              rows={2}
              value={attributeForm.description}
              onChange={e => setAttributeForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowAttributeModal(false)}>Abbrechen</button>
              <button className="px-4 py-2 bg-digital-blue text-white rounded" onClick={handleAddAttribute}>
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataModelingAssistDemo; 