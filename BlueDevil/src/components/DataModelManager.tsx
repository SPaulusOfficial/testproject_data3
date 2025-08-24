import React, { useState, useEffect, useCallback } from 'react';
import { PermissionGuard } from './PermissionGuard';
import { 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  GitBranch, 
  MessageSquare, 
  Eye,
  Settings,
  FileText,
  Table,
  Link,
  Calendar,
  Mail,
  Phone,
  Globe,
  Hash,
  CheckSquare,
  List,
  Calculator,
  Clock,
  User,
  Tag,
  Search,
  Filter,
  RefreshCw,
  History,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Maximize2,
  X
} from 'lucide-react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  ConnectionMode,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AuthService from '@/services/AuthService';

// Types
interface DataModel {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  created_by: string;
  metadata: any;
  comments: Comment[];
}

interface DataObject {
  id: string;
  name: string;
  display_name: string;
  api_name: string;
  description: string;
  object_type: 'standard' | 'custom' | 'external';
  is_active: boolean;
  metadata: any;
  comments: Comment[];
  fields: DataField[];
  relationships: Relationship[];
}

interface DataField {
  id: string;
  name: string;
  display_name: string;
  field_type: string;
  data_type: string;
  is_required: boolean;
  is_unique: boolean;
  is_external_id: boolean;
  default_value?: string;
  description: string;
  help_text: string;
  validation_rules: any[];
  picklist_values: any[];
  reference_to?: string;
  metadata: any;
  comments: Comment[];
}

interface Relationship {
  id: string;
  name: string;
  from_object: string;
  to_object: string;
  relationship_type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
  description: string;
  is_master_detail: boolean;
  cascade_delete: boolean;
  metadata: any;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  timestamp: string;
  type: 'model' | 'object' | 'field' | 'relationship';
  content: string;
  tags: string[];
}

interface FieldType {
  value: string;
  label: string;
  salesforce_type: string;
}

interface DataType {
  value: string;
  label: string;
}

// Custom Node Components for ERD
const EntityNode = ({ data }: { data: any }) => (
  <div className="bg-white border-2 border-digital-blue rounded-lg shadow-lg p-4 min-w-[200px]">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-bold text-digital-blue text-lg">{data.label}</h3>
      <span className={`px-2 py-1 rounded text-xs ${
        data.object_type === 'standard' ? 'bg-green-100 text-green-800' :
        data.object_type === 'custom' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {data.object_type}
      </span>
    </div>
    <div className="text-sm text-gray-600 mb-3">{data.description}</div>
    
    {/* Fields */}
    <div className="space-y-1">
      {data.fields?.slice(0, 5).map((field: DataField) => (
        <div key={field.id} className="flex items-center justify-between text-xs">
          <span className="font-medium">{field.name}</span>
          <span className="text-gray-500">{field.field_type}</span>
          {field.is_required && <span className="text-red-500">*</span>}
        </div>
      ))}
      {data.fields?.length > 5 && (
        <div className="text-xs text-gray-400">+{data.fields.length - 5} weitere Felder</div>
      )}
    </div>
    
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-digital-blue border-2 border-white" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-digital-blue border-2 border-white" />
    <Handle type="target" position={Position.Left} className="w-3 h-3 bg-digital-blue border-2 border-white" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 bg-digital-blue border-2 border-white" />
  </div>
);

const nodeTypes = {
  entity: EntityNode,
};

// Auto Layout Function
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: 150,
    nodesep: 100
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 150 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Main Component
const DataModelManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'designer' | 'history' | 'export'>('models');
  const [models, setModels] = useState<DataModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<DataModel | null>(null);
  const [objects, setObjects] = useState<DataObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showObjectModal, setShowObjectModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showObjectDetailModal, setShowObjectDetailModal] = useState(false);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [dataTypes, setDataType] = useState<DataType[]>([]);
  const [gitHistory, setGitHistory] = useState<string[]>([]);
  
  // Form states
  const [modelForm, setModelForm] = useState({ name: '', description: '' });
  const [objectForm, setObjectForm] = useState({ 
    name: '', 
    display_name: '', 
    api_name: '', 
    description: '', 
    object_type: 'custom' as const 
  });
  const [fieldForm, setFieldForm] = useState({
    name: '',
    display_name: '',
    field_type: 'text',
    data_type: 'VARCHAR(255)',
    is_required: false,
    is_unique: false,
    is_external_id: false,
    description: '',
    help_text: ''
  });
  const [commentForm, setCommentForm] = useState({
    content: '',
    tags: [] as string[],
    targetType: 'model' as 'model' | 'object' | 'field' | 'relationship',
    targetId: '',
    parentId: '' // For field comments, this will be the object ID
  });

  // ReactFlow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  // API Base URL
  const API_BASE = 'http://localhost:3002/api/data-models';

  // Create axios instance with auth headers
  const createAuthAxios = () => {
    const token = AuthService.getAuthToken();
    return axios.create({
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
  };

  // Load data
  useEffect(() => {
    loadModels();
    loadFieldTypes();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadObjects(selectedModel.id);
      loadGitHistory(selectedModel.id);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (objects.length > 0) {
      updateERD();
    }
  }, [objects]);

  const loadModels = async () => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios();
      const response = await authAxios.get(API_BASE + '/models');
      setModels(response.data.data);
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Fehler beim Laden der Data Models');
    } finally {
      setLoading(false);
    }
  };

  const loadObjects = async (modelId: string) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`${API_BASE}/models/${modelId}`);
      setObjects(response.data.data.objects || []);
    } catch (error) {
      console.error('Error loading objects:', error);
      toast.error('Fehler beim Laden der Objekte');
    }
  };

  const loadFieldTypes = async () => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(API_BASE + '/field-types');
      if (response.data?.data?.fieldTypes) {
        setFieldTypes(response.data.data.fieldTypes);
      }
      if (response.data?.data?.dataTypes) {
        setDataType(response.data.data.dataTypes);
      }
    } catch (error) {
      console.error('Error loading field types:', error);
      // Set default field types if API fails
      const defaultFieldTypes = [
        { value: 'text', label: 'Text', salesforce_type: 'Text' },
        { value: 'textarea', label: 'Text Area', salesforce_type: 'TextArea' },
        { value: 'number', label: 'Number', salesforce_type: 'Number' },
        { value: 'currency', label: 'Currency', salesforce_type: 'Currency' },
        { value: 'percent', label: 'Percent', salesforce_type: 'Percent' },
        { value: 'date', label: 'Date', salesforce_type: 'Date' },
        { value: 'datetime', label: 'Date/Time', salesforce_type: 'DateTime' },
        { value: 'email', label: 'Email', salesforce_type: 'Email' },
        { value: 'phone', label: 'Phone', salesforce_type: 'Phone' },
        { value: 'url', label: 'URL', salesforce_type: 'Url' },
        { value: 'picklist', label: 'Picklist', salesforce_type: 'Picklist' },
        { value: 'checkbox', label: 'Checkbox', salesforce_type: 'Checkbox' },
        { value: 'lookup', label: 'Lookup Relationship', salesforce_type: 'Lookup' }
      ];
      const defaultDataTypes = [
        { value: 'VARCHAR(255)', label: 'VARCHAR(255)' },
        { value: 'TEXT', label: 'TEXT' },
        { value: 'NUMBER(18,2)', label: 'NUMBER(18,2)' },
        { value: 'INTEGER', label: 'INTEGER' },
        { value: 'BOOLEAN', label: 'BOOLEAN' },
        { value: 'DATE', label: 'DATE' },
        { value: 'DATETIME', label: 'DATETIME' },
        { value: 'EMAIL', label: 'EMAIL' },
        { value: 'PHONE', label: 'PHONE' },
        { value: 'URL', label: 'URL' }
      ];
      setFieldTypes(defaultFieldTypes);
      setDataType(defaultDataTypes);
    }
  };

  const loadGitHistory = async (modelId: string) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`${API_BASE}/models/${modelId}/history`);
      setGitHistory(response.data.data);
    } catch (error) {
      console.error('Error loading git history:', error);
    }
  };

  const updateERD = useCallback(() => {
    const erdNodes: Node[] = objects?.map((obj, index) => ({
      id: obj.id,
      type: 'entity',
      position: { x: index * 300, y: index * 200 },
      data: {
        label: obj.display_name,
        description: obj.description,
        object_type: obj.object_type,
        fields: obj.fields
      }
    }));

    const erdEdges: Edge[] = [];
    objects?.forEach(obj => {
      obj.relationships?.forEach(rel => {
        erdEdges.push({
          id: rel.id,
          source: rel.from_object,
          target: rel.to_object,
          type: 'smoothstep',
          label: rel.relationship_type,
          style: { stroke: '#0025D1', strokeWidth: 2 }
        });
      });
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(erdNodes, erdEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    setTimeout(() => fitView(), 100);
  }, [objects, setNodes, setEdges, fitView]);

  // Create operations
  const createModel = async () => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.post(API_BASE + '/models', modelForm);
      setModels([...models, response.data.data]);
      setShowCreateModal(false);
      setModelForm({ name: '', description: '' });
      toast.success('Data Model erfolgreich erstellt');
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('Fehler beim Erstellen des Data Models');
    }
  };

  const createObject = async () => {
    if (!selectedModel) return;
    
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.post(`${API_BASE}/models/${selectedModel.id}/objects`, objectForm);
      setObjects([...objects, response.data.data]);
      setShowObjectModal(false);
      setObjectForm({ name: '', display_name: '', api_name: '', description: '', object_type: 'custom' });
      toast.success('Objekt erfolgreich erstellt');
    } catch (error) {
      console.error('Error creating object:', error);
      toast.error('Fehler beim Erstellen des Objekts');
    }
  };

  const createField = async (objectId: string) => {
    if (!selectedModel) return;
    
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.post(
        `${API_BASE}/models/${selectedModel.id}/objects/${objectId}/fields`, 
        fieldForm
      );
      
      setObjects(objects.map(obj => 
        obj.id === objectId 
          ? { ...obj, fields: [...(obj.fields || []), response.data.data] }
          : obj
      ));
      
      setShowFieldModal(false);
      setFieldForm({
        name: '',
        display_name: '',
        field_type: 'text',
        data_type: 'VARCHAR(255)',
        is_required: false,
        is_unique: false,
        is_external_id: false,
        description: '',
        help_text: ''
      });
      toast.success('Feld erfolgreich erstellt');
    } catch (error) {
      console.error('Error creating field:', error);
      toast.error('Fehler beim Erstellen des Felds');
    }
  };

  const addComment = async () => {
    if (!selectedModel) return;
    
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.post(`${API_BASE}/models/${selectedModel.id}/comments`, commentForm);
      
      // Update the appropriate object/field with the new comment
      if (commentForm.targetType === 'object' as any) {
        setObjects(objects.map(obj => 
          obj.id === commentForm.targetId 
            ? { ...obj, comments: [...(obj.comments || []), response.data.data] }
            : obj
        ));
      }
      
      setShowCommentModal(false);
      setCommentForm({ content: '', tags: [], targetType: 'model' as const, targetId: '', parentId: '' });
      toast.success('Kommentar hinzugefügt');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Fehler beim Hinzufügen des Kommentars');
    }
  };

  const exportModel = async (format: 'json' | 'salesforce') => {
    if (!selectedModel) return;
    
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`${API_BASE}/models/${selectedModel.id}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedModel.name}-${format}.${format === 'json' ? 'json' : 'xml'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Model als ${format.toUpperCase()} exportiert`);
    } catch (error) {
      console.error('Error exporting model:', error);
      toast.error('Fehler beim Exportieren des Models');
    }
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text': return <FileText size={16} />;
      case 'number': return <Calculator size={16} />;
      case 'date': return <Calendar size={16} />;
      case 'email': return <Mail size={16} />;
      case 'phone': return <Phone size={16} />;
      case 'url': return <Globe size={16} />;
      case 'picklist': return <List size={16} />;
      case 'checkbox': return <CheckSquare size={16} />;
      case 'lookup': return <Link size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-digital-blue" />
            <h1 className="text-xl font-bold">Data Model Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            {selectedModel && (
              <>
                <button
                  onClick={() => exportModel('json')}
                  className="flex items-center gap-2 px-3 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition"
                >
                  <Download size={16} />
                  Export JSON
                </button>
                <button
                  onClick={() => exportModel('salesforce')}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={16} />
                  Export Salesforce
                </button>
              </>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition"
            >
              <Plus size={16} />
              Neues Model
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-6">
          {[
            { key: 'models', label: 'Models', icon: Database },
            { key: 'designer', label: 'ERD Designer', icon: GitBranch },
            { key: 'history', label: 'Git History', icon: History },
            { key: 'export', label: 'Export', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
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
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'models' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {models?.map(model => (
                <div
                  key={model.id}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedModel?.id === model.id ? 'ring-2 ring-digital-blue' : ''
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-digital-blue">{model.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      model.status === 'active' ? 'bg-green-100 text-green-800' :
                      model.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{model.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Version {model.version}</span>
                    <span>{new Date(model.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedModel && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Objekte in {selectedModel.name}</h2>
                  <button
                    onClick={() => setShowObjectModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus size={16} />
                    Objekt hinzufügen
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {objects?.map(obj => (
                    <div key={obj.id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{obj.display_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          obj.object_type === 'standard' ? 'bg-green-100 text-green-800' :
                          obj.object_type === 'custom' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {obj.object_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{obj.description}</p>
                      
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">Felder ({obj.fields?.length || 0})</div>
                        <div className="space-y-1">
                          {obj.fields?.slice(0, 3).map(field => (
                            <div key={field.id} className="flex items-center gap-2 text-xs">
                              {getFieldIcon(field.field_type)}
                              <span>{field.name}</span>
                              {field.is_required && <span className="text-red-500">*</span>}
                            </div>
                          ))}
                          {obj.fields && obj.fields.length > 3 && (
                            <div className="text-xs text-gray-400">+{obj.fields.length - 3} weitere</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedObject(obj);
                            setShowObjectDetailModal(true);
                          }}
                          className="text-xs text-digital-blue hover:text-deep-blue-1"
                          title="Objekt öffnen"
                        >
                          <Maximize2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setCommentForm({ ...commentForm, targetType: 'object' as const, targetId: obj.id, parentId: '' });
                            setShowCommentModal(true);
                          }}
                          className="text-xs text-digital-blue hover:text-deep-blue-1"
                          title="Kommentar hinzufügen"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setFieldForm({ ...fieldForm, name: '', display_name: '' });
                            setShowFieldModal(true);
                          }}
                          className="text-xs text-green-600 hover:text-green-700"
                        >
                          + Feld
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'designer' && selectedModel && (
          <div className="h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
              connectionMode={ConnectionMode.Loose}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#0025D1', strokeWidth: 2 },
              }}
            >
              <Controls />
              <Background />
              <MiniMap />
              <Panel position="top-left" className="bg-white rounded-lg shadow-lg p-4 m-4">
                <h3 className="font-semibold mb-2">ERD Designer</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedModel.name} - {objects?.length || 0} Objekte
                </p>
                <button
                  onClick={updateERD}
                  className="flex items-center gap-2 px-3 py-2 bg-digital-blue text-white rounded text-sm hover:bg-deep-blue-1"
                >
                  <RefreshCw size={16} />
                  Layout aktualisieren
                </button>
              </Panel>
            </ReactFlow>
          </div>
        )}

        {activeTab === 'history' && selectedModel && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Git History - {selectedModel.name}</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <GitCommit size={20} className="text-digital-blue" />
                  <span className="font-semibold">Commit History</span>
                </div>
              </div>
              <div className="p-4">
                {gitHistory?.length > 0 ? (
                  <div className="space-y-2">
                    {gitHistory?.map((commit, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <GitCommit size={16} className="text-gray-400" />
                        <span className="text-sm font-mono">{commit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <GitCommit size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>Noch keine Commits vorhanden</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && selectedModel && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Export - {selectedModel.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-3">JSON Export</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Exportiert das komplette Data Model als JSON-Datei mit allen Objekten, Feldern und Kommentaren.
                </p>
                <button
                  onClick={() => exportModel('json')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition"
                >
                  <Download size={20} />
                  Als JSON exportieren
                </button>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-3">Salesforce Metadata</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generiert Salesforce Metadata XML-Dateien für die Bereitstellung in Salesforce.
                </p>
                <button
                  onClick={() => exportModel('salesforce')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={20} />
                  Als Salesforce Metadata exportieren
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Model Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Neues Data Model erstellen</h3>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Model-Name"
              value={modelForm.name}
              onChange={e => setModelForm(f => ({ ...f, name: e.target.value }))}
            />
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Beschreibung"
              rows={3}
              value={modelForm.description}
              onChange={e => setModelForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowCreateModal(false)}>
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-digital-blue text-white rounded" onClick={createModel}>
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Object Modal */}
      {showObjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Neues Objekt erstellen</h3>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Objekt-Name"
              value={objectForm.name}
              onChange={e => setObjectForm(f => ({ ...f, name: e.target.value }))}
            />
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Anzeigename"
              value={objectForm.display_name}
              onChange={e => setObjectForm(f => ({ ...f, display_name: e.target.value }))}
            />
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="API-Name"
              value={objectForm.api_name}
              onChange={e => setObjectForm(f => ({ ...f, api_name: e.target.value }))}
            />
            <textarea
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Beschreibung"
              rows={3}
              value={objectForm.description}
              onChange={e => setObjectForm(f => ({ ...f, description: e.target.value }))}
            />
            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={objectForm.object_type}
              onChange={e => setObjectForm(f => ({ ...f, object_type: e.target.value as any }))}
            >
              <option value="custom">Custom</option>
              <option value="standard">Standard</option>
              <option value="external">External</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowObjectModal(false)}>
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-digital-blue text-white rounded" onClick={createObject}>
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Field Modal */}
      {showFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Neues Feld erstellen</h3>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Feld-Name"
              value={fieldForm.name}
              onChange={e => setFieldForm(f => ({ ...f, name: e.target.value }))}
            />
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Anzeigename"
              value={fieldForm.display_name}
              onChange={e => setFieldForm(f => ({ ...f, display_name: e.target.value }))}
            />
            <select
              className="w-full border rounded px-3 py-2 mb-3"
              value={fieldForm.field_type}
              onChange={e => setFieldForm(f => ({ ...f, field_type: e.target.value }))}
            >
              {fieldTypes?.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              className="w-full border rounded px-3 py-2 mb-3"
              value={fieldForm.data_type}
              onChange={e => setFieldForm(f => ({ ...f, data_type: e.target.value }))}
            >
              {dataTypes?.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={fieldForm.is_required}
                  onChange={e => setFieldForm(f => ({ ...f, is_required: e.target.checked }))}
                  className="mr-2"
                />
                Required
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={fieldForm.is_unique}
                  onChange={e => setFieldForm(f => ({ ...f, is_unique: e.target.checked }))}
                  className="mr-2"
                />
                Unique
              </label>
            </div>
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Beschreibung"
              rows={2}
              value={fieldForm.description}
              onChange={e => setFieldForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowFieldModal(false)}>
                Abbrechen
              </button>
              <button 
                className="px-4 py-2 bg-digital-blue text-white rounded" 
                onClick={() => createField(objects[0]?.id || '')}
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Object Detail Modal */}
      {showObjectDetailModal && selectedObject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedObject.display_name}</h3>
              <button 
                onClick={() => setShowObjectDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">{selectedObject.description}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  selectedObject.object_type === 'standard' ? 'bg-green-100 text-green-800' :
                  selectedObject.object_type === 'custom' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedObject.object_type}
                </span>
                <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                  {selectedObject.fields?.length || 0} Felder
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Felder</h4>
                <button
                  onClick={() => {
                    setFieldForm({ ...fieldForm, name: '', display_name: '' });
                    setShowFieldModal(true);
                    setShowObjectDetailModal(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  <Plus size={14} />
                  Feld hinzufügen
                </button>
              </div>
              
              <div className="space-y-2">
                {selectedObject.fields?.map((field: any) => (
                  <div key={field.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getFieldIcon(field.field_type)}
                        <span className="font-medium">{field.display_name}</span>
                        {field.is_required && <span className="text-red-500">*</span>}
                        {field.is_unique && <span className="text-blue-500">🔒</span>}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setCommentForm({ 
                              ...commentForm, 
                              targetType: 'field' as const, 
                              targetId: field.id, 
                              parentId: selectedObject.id 
                            });
                            setShowCommentModal(true);
                            setShowObjectDetailModal(false);
                          }}
                          className="text-xs text-digital-blue hover:text-deep-blue-1"
                          title="Kommentar hinzufügen"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setFieldForm({
                              name: field.name,
                              display_name: field.display_name,
                              field_type: field.field_type,
                              data_type: field.data_type,
                              is_required: field.is_required,
                              is_unique: field.is_unique,
                              is_external_id: field.is_external_id,
                              description: field.description,
                              help_text: field.help_text
                            });
                            setShowFieldModal(true);
                            setShowObjectDetailModal(false);
                          }}
                          className="text-xs text-gray-600 hover:text-gray-800"
                          title="Feld bearbeiten"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>Typ: {field.field_type} ({field.data_type})</div>
                      {field.description && <div>Beschreibung: {field.description}</div>}
                    </div>
                    {field.comments?.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {field.comments.length} Kommentar{field.comments.length !== 1 ? 'e' : ''}
                      </div>
                    )}
                  </div>
                ))}
                {(!selectedObject.fields || selectedObject.fields.length === 0) && (
                  <div className="text-gray-500 text-center py-4">
                    Keine Felder definiert
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button 
                className="px-4 py-2 bg-gray-200 rounded" 
                onClick={() => setShowObjectDetailModal(false)}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Kommentar hinzufügen</h3>
            <textarea
              className="w-full border rounded px-3 py-2 mb-3"
              placeholder="Kommentar..."
              rows={4}
              value={commentForm.content}
              onChange={e => setCommentForm(f => ({ ...f, content: e.target.value }))}
            />
            <input
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Tags (kommagetrennt)"
              value={commentForm.tags.join(', ')}
              onChange={e => setCommentForm(f => ({ ...f, tags: e.target.value.split(',').map(t => t.trim()) }))}
            />
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowCommentModal(false)}>
                Abbrechen
              </button>
              <button className="px-4 py-2 bg-digital-blue text-white rounded" onClick={addComment}>
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper with ReactFlowProvider
const DataModelManagerWrapper: React.FC = () => {
  return (
    <PermissionGuard permission="DataModeling">
      <ReactFlowProvider>
        <DataModelManager />
      </ReactFlowProvider>
    </PermissionGuard>
  );
};

export default DataModelManagerWrapper;
