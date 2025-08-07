import React, { useState } from 'react'
import { 
  Database, 
  Play, 
  Download, 
  Upload, 
  FileText, 
  Settings, 
  Layers,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  Table,
  Key,
  Link,
  Eye,
  Calculator,
  Calendar,
  List,
  CheckSquare,
  Mail,
  Phone,
  Globe
} from 'lucide-react'

interface DataObject {
  id: string
  name: string
  type: 'standard' | 'custom' | 'external'
  status: 'pending' | 'generating' | 'completed' | 'error'
  description: string
  fields: DataField[]
}

interface DataField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'picklist' | 'lookup' | 'checkbox' | 'email' | 'phone' | 'url'
  required: boolean
  unique: boolean
  description: string
}

interface DataModelTemplate {
  id: string
  name: string
  description: string
  category: string
  complexity: 'simple' | 'medium' | 'complex'
  objects: number
}

const DataModelSetup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'design' | 'templates' | 'generated' | 'preview' | 'settings'>('design')
  const [dataObjects, setDataObjects] = useState<DataObject[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [modelName, setModelName] = useState('')
  const [modelDescription, setModelDescription] = useState('')

  const templates: DataModelTemplate[] = [
    {
      id: '1',
      name: 'Customer Management Model',
      description: 'Vollständiges Datenmodell für Kundenverwaltung mit Accounts, Contacts und Opportunities',
      category: 'Sales',
      complexity: 'medium',
      objects: 5
    },
    {
      id: '2',
      name: 'Service Management Model',
      description: 'Service-Management mit Cases, Solutions und Knowledge Base',
      category: 'Service',
      complexity: 'complex',
      objects: 8
    },
    {
      id: '3',
      name: 'Product Catalog Model',
      description: 'Produktkatalog mit Produkten, Preislisten und Bestellungen',
      category: 'Commerce',
      complexity: 'medium',
      objects: 6
    },
    {
      id: '4',
      name: 'Project Management Model',
      description: 'Projektmanagement mit Projekten, Tasks und Ressourcen',
      category: 'Project',
      complexity: 'complex',
      objects: 7
    }
  ]

  const addDataObject = () => {
    const newObject: DataObject = {
      id: Date.now().toString(),
      name: `Object ${dataObjects.length + 1}`,
      type: 'custom',
      status: 'pending',
      description: 'Neues Datenobjekt',
      fields: []
    }
    setDataObjects([...dataObjects, newObject])
  }

  const removeDataObject = (id: string) => {
    setDataObjects(dataObjects.filter(obj => obj.id !== id))
  }

  const generateDataModel = async () => {
    setIsGenerating(true)
    // Simuliere Data Model-Generierung
    setTimeout(() => {
      setIsGenerating(false)
      setActiveTab('generated')
    }, 3000)
  }

  const getObjectIcon = (type: DataObject['type']) => {
    switch (type) {
      case 'standard': return <Table size={16} />
      case 'custom': return <Database size={16} />
      case 'external': return <Link size={16} />
      default: return <Database size={16} />
    }
  }

  const getStatusIcon = (status: DataObject['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />
      case 'error': return <AlertCircle size={16} className="text-red-500" />
      case 'generating': return <Clock size={16} className="text-yellow-500" />
      default: return <Clock size={16} className="text-gray-400" />
    }
  }

  const getFieldIcon = (type: DataField['type']) => {
    switch (type) {
      case 'text': return <FileText size={12} />
      case 'number': return <Calculator size={12} />
      case 'date': return <Calendar size={12} />
      case 'picklist': return <List size={12} />
      case 'lookup': return <Link size={12} />
      case 'checkbox': return <CheckSquare size={12} />
      case 'email': return <Mail size={12} />
      case 'phone': return <Phone size={12} />
      case 'url': return <Globe size={12} />
      default: return <FileText size={12} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database size={24} className="text-digital-blue" />
          <h1 className="text-xl font-bold">Data Model Setup</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateDataModel}
            disabled={isGenerating || dataObjects.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors disabled:opacity-50"
          >
            {isGenerating ? <Clock size={16} /> : <Play size={16} />}
            <span>{isGenerating ? 'Generiere...' : 'Data Model generieren'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-6">
          {[
            { key: 'design', label: 'Model Design', icon: Database },
            { key: 'templates', label: 'Templates', icon: FileText },
            { key: 'preview', label: 'Preview', icon: Eye },
            { key: 'generated', label: 'Generiert', icon: Layers },
            { key: 'settings', label: 'Einstellungen', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-semibold transition-colors ${
                  activeTab === tab.key
                    ? 'border-digital-blue text-digital-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'design' && (
        <div className="space-y-6">
          {/* Model Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                placeholder="z.B. Customer Management Model"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <input
                type="text"
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-digital-blue focus:border-transparent"
                placeholder="Kurze Beschreibung des Datenmodells"
              />
            </div>
          </div>

          {/* Data Objects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Data Objects</h3>
              <button
                onClick={addDataObject}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={16} />
                <span>Object hinzufügen</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {dataObjects.map((obj, index) => (
                <div key={obj.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {getObjectIcon(obj.type)}
                      <div className="flex-1">
                        <div className="font-medium">{obj.name}</div>
                        <div className="text-sm text-gray-500">{obj.description}</div>
                        {obj.fields.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {obj.fields.length} Fields
                          </div>
                        )}
                      </div>
                      {getStatusIcon(obj.status)}
                    </div>
                    <button
                      onClick={() => removeDataObject(obj.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  {/* Fields Preview */}
                  {obj.fields.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-700 mb-2">Fields:</div>
                      <div className="flex flex-wrap gap-2">
                        {obj.fields.slice(0, 5).map(field => (
                          <div key={field.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                            {getFieldIcon(field.type)}
                            <span>{field.name}</span>
                            {field.required && <span className="text-red-500">*</span>}
                          </div>
                        ))}
                        {obj.fields.length > 5 && (
                          <span className="text-xs text-gray-500">+{obj.fields.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {dataObjects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Database size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Noch keine Data Objects definiert</p>
                  <p className="text-sm">Fügen Sie Objects hinzu, um Ihr Datenmodell zu erstellen</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(template => (
            <div
              key={template.id}
              className={`p-6 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'border-digital-blue bg-digital-blue/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{template.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  template.complexity === 'simple' ? 'bg-green-100 text-green-800' :
                  template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {template.complexity}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{template.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={16} />
                  <span className="text-xs text-gray-500">{template.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{template.objects} Objects</span>
                  {selectedTemplate === template.id && (
                    <CheckCircle size={16} className="text-digital-blue" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Data Model Preview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Customer Management Model</h4>
                <div className="space-y-3">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Table size={16} className="text-blue-600" />
                      <span className="font-medium">Account</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Standard</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Name (Text, Required)</div>
                      <div>• Industry (Picklist)</div>
                      <div>• Type (Picklist)</div>
                      <div>• Billing Address (Text)</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Database size={16} className="text-green-600" />
                      <span className="font-medium">Customer Profile</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Custom</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Customer ID (Text, Unique)</div>
                      <div>• Customer Type (Picklist)</div>
                      <div>• Credit Limit (Number)</div>
                      <div>• Account Manager (Lookup)</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Relationships</h4>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Account</span>
                      <ArrowRight size={12} />
                      <span>Contact (1:N)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Account</span>
                      <ArrowRight size={12} />
                      <span>Opportunity (1:N)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Contact</span>
                      <ArrowRight size={12} />
                      <span>Case (1:N)</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-sm mb-2">Validation Rules</h5>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Account Name must be unique</div>
                    <div>• Customer ID format validation</div>
                    <div>• Credit Limit must be positive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'generated' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-green-600" />
              <span className="font-semibold text-green-800">Data Model erfolgreich generiert!</span>
            </div>
            <p className="text-green-700 text-sm">
              Das Datenmodell wurde erstellt und ist bereit für den Import.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generierte Data Model-Dateien</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors">
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Upload size={16} />
                  <span>Deploy</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">CustomerProfile__c.object</h4>
                <pre className="text-sm text-gray-700 overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <actionOverrides>
        <actionName>Accept</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>CancelEdit</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Clone</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Delete</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Edit</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>List</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>New</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>SaveEdit</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>Tab</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <actionOverrides>
        <actionName>View</actionName>
        <comment>Action override created by Lightning App Builder during activation.</comment>
        <content>CustomerProfile__c</content>
        <formFactor>Large</formFactor>
        <skipRecordTypeSelect>false</skipRecordTypeSelect>
        <type>Flexipage</type>
    </actionOverrides>
    <allowInChatterGroups>true</allowInChatterGroups>
    <compactLayoutAssignment>SYSTEM</compactLayoutAssignment>
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
    <label>Customer Profile</label>
    <nameField>
        <displayFormat>CP-{0000}</displayFormat>
        <label>Customer Profile Name</label>
        <type>AutoNumber</type>
    </nameField>
    <pluralLabel>Customer Profiles</pluralLabel>
    <searchLayouts/>
    <sharingModel>ReadWrite</sharingModel>
    <visibility>Public</visibility>
</CustomObject>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Data Model Setup Einstellungen</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Version
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-digital-blue focus:border-transparent">
                  <option>58.0</option>
                  <option>57.0</option>
                  <option>56.0</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sharing Model
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-digital-blue focus:border-transparent">
                  <option>Private</option>
                  <option>Public Read Only</option>
                  <option>Public Read/Write</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="includeValidation" className="rounded" />
                <label htmlFor="includeValidation" className="text-sm font-medium text-gray-700">
                  Validation Rules generieren
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="includeTriggers" className="rounded" />
                <label htmlFor="includeTriggers" className="text-sm font-medium text-gray-700">
                  Trigger-Klassen generieren
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input type="checkbox" id="includeProfiles" className="rounded" />
                <label htmlFor="includeProfiles" className="text-sm font-medium text-gray-700">
                  Profile-Berechtigungen setzen
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataModelSetup 