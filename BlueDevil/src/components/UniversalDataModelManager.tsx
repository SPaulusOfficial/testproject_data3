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
// ReactFlow imports removed for now - will be added back when needed
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
  help_text?: string;
  validation_rules?: string[];
  metadata: any;
  comments: Comment[];
}

interface Relationship {
  id: string;
  name: string;
  display_name: string;
  relationship_type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  source_object: string;
  target_object: string;
  source_field: string;
  target_field: string;
  is_active: boolean;
  metadata: any;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: string;
  created_at: string;
  target_type: 'model' | 'object' | 'field' | 'relationship';
  target_id: string;
  parent_id?: string;
}

interface FieldType {
  name: string;
  label: string;
  description: string;
  category: string;
}

interface DataType {
  name: string;
  label: string;
  description: string;
  category: string;
}

// API Configuration
const API_BASE = 'http://localhost:3002/api/knowledge';
const PROJECT_ID = 'default-project'; // You can make this configurable

// Create authenticated axios instance
const createAuthAxios = () => {
  const token = AuthService.getAuthToken();
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

const UniversalDataModelManager: React.FC = () => {
  const [models, setModels] = useState<DataModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<DataModel | null>(null);
  const [objects, setObjects] = useState<DataObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'models' | 'designer' | 'history' | 'export'>('models');
  
  // Modal states
  const [showCreateModelModal, setShowCreateModelModal] = useState(false);
  const [showCreateObjectModal, setShowCreateObjectModal] = useState(false);
  const [showCreateFieldModal, setShowCreateFieldModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showObjectDetailModal, setShowObjectDetailModal] = useState(false);
  
  // Form states
  const [modelForm, setModelForm] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    status: 'draft' as const
  });
  
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
    field_type: '',
    data_type: '',
    is_required: false,
    is_unique: false,
    description: ''
  });
  
  const [commentForm, setCommentForm] = useState({
    content: '',
    target_type: 'model' as 'model' | 'object' | 'field' | 'relationship',
    target_id: '',
    parent_id: ''
  });
  
  // ReactFlow states - temporarily disabled
  // const [nodes, setNodes, onNodesChange] = useNodesState([]);
  // const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Field types and data types
  const [fieldTypes, setFieldTypes] = useState<FieldType[]>([]);
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  
  // Git history
  const [gitHistory, setGitHistory] = useState<any[]>([]);
  
  // Selected object for detail modal
  const [selectedObject, setSelectedObject] = useState<DataObject | null>(null);

  // Load models
  const loadModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/${PROJECT_ID}/data-models`);
      
      if (response.data?.success) {
        setModels(response.data.data || []);
      } else {
        setModels([]);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load data models');
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load field types
  const loadFieldTypes = useCallback(async () => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/${PROJECT_ID}/content/field-types`);
      
      if (response.data?.success && response.data?.data?.fieldTypes) {
        setFieldTypes(response.data.data.fieldTypes);
      } else {
        // Default field types if API doesn't return them
        setFieldTypes([
          { name: 'text', label: 'Text', description: 'Single line text', category: 'text' },
          { name: 'textarea', label: 'Text Area', description: 'Multi-line text', category: 'text' },
          { name: 'number', label: 'Number', description: 'Numeric value', category: 'numeric' },
          { name: 'email', label: 'Email', description: 'Email address', category: 'text' },
          { name: 'phone', label: 'Phone', description: 'Phone number', category: 'text' },
          { name: 'date', label: 'Date', description: 'Date value', category: 'date' },
          { name: 'datetime', label: 'Date/Time', description: 'Date and time', category: 'date' },
          { name: 'boolean', label: 'Boolean', description: 'True/False value', category: 'boolean' },
          { name: 'picklist', label: 'Picklist', description: 'Dropdown selection', category: 'choice' },
          { name: 'multipicklist', label: 'Multi-Picklist', description: 'Multiple selections', category: 'choice' },
          { name: 'lookup', label: 'Lookup', description: 'Reference to another object', category: 'reference' },
          { name: 'master_detail', label: 'Master-Detail', description: 'Required reference', category: 'reference' },
          { name: 'currency', label: 'Currency', description: 'Monetary value', category: 'numeric' },
          { name: 'percent', label: 'Percent', description: 'Percentage value', category: 'numeric' },
          { name: 'url', label: 'URL', description: 'Web address', category: 'text' },
          { name: 'encrypted', label: 'Encrypted', description: 'Encrypted text', category: 'text' },
          { name: 'long', label: 'Long Text Area', description: 'Large text field', category: 'text' },
          { name: 'rich_text', label: 'Rich Text Area', description: 'Formatted text', category: 'text' },
          { name: 'location', label: 'Location', description: 'Geographic coordinates', category: 'location' },
          { name: 'file', label: 'File', description: 'File attachment', category: 'file' }
        ]);
      }
    } catch (error) {
      console.error('Error loading field types:', error);
      // Set default field types on error
      setFieldTypes([
        { name: 'text', label: 'Text', description: 'Single line text', category: 'text' },
        { name: 'number', label: 'Number', description: 'Numeric value', category: 'numeric' },
        { name: 'email', label: 'Email', description: 'Email address', category: 'text' },
        { name: 'date', label: 'Date', description: 'Date value', category: 'date' },
        { name: 'boolean', label: 'Boolean', description: 'True/False value', category: 'boolean' }
      ]);
    }
  }, []);

  // Load data types
  const loadDataTypes = useCallback(async () => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/${PROJECT_ID}/content/data-types`);
      
      if (response.data?.success && response.data?.data?.dataTypes) {
        setDataTypes(response.data.data.dataTypes);
      } else {
        // Default data types
        setDataTypes([
          { name: 'string', label: 'String', description: 'Text data', category: 'text' },
          { name: 'integer', label: 'Integer', description: 'Whole number', category: 'numeric' },
          { name: 'decimal', label: 'Decimal', description: 'Decimal number', category: 'numeric' },
          { name: 'boolean', label: 'Boolean', description: 'True/False', category: 'boolean' },
          { name: 'date', label: 'Date', description: 'Date only', category: 'date' },
          { name: 'datetime', label: 'DateTime', description: 'Date and time', category: 'date' },
          { name: 'uuid', label: 'UUID', description: 'Unique identifier', category: 'identifier' },
          { name: 'json', label: 'JSON', description: 'JSON object', category: 'complex' },
          { name: 'text', label: 'Text', description: 'Long text', category: 'text' },
          { name: 'enum', label: 'Enum', description: 'Enumerated values', category: 'choice' }
        ]);
      }
    } catch (error) {
      console.error('Error loading data types:', error);
      // Set default data types on error
      setDataTypes([
        { name: 'string', label: 'String', description: 'Text data', category: 'text' },
        { name: 'integer', label: 'Integer', description: 'Whole number', category: 'numeric' },
        { name: 'decimal', label: 'Decimal', description: 'Decimal number', category: 'numeric' },
        { name: 'boolean', label: 'Boolean', description: 'True/False', category: 'boolean' },
        { name: 'date', label: 'Date', description: 'Date only', category: 'date' }
      ]);
    }
  }, []);

  // Load git history
  const loadGitHistory = useCallback(async (modelId: string) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/${PROJECT_ID}/content/data-models/${modelId}/history`);
      
      if (response.data?.success) {
        setGitHistory(response.data.data || []);
      } else {
        setGitHistory([]);
      }
    } catch (error) {
      console.error('Error loading git history:', error);
      setGitHistory([]);
    }
  }, []);

  // Create model
  const createModel = async () => {
    try {
      const authAxios = createAuthAxios();
      const modelId = `model-${Date.now()}`;
      
      const modelData = {
        name: modelForm.name,
        description: modelForm.description,
        version: modelForm.version,
        status: modelForm.status,
        objects: [],
        relationships: []
      };
      
      const response = await authAxios.post(`/${PROJECT_ID}/data-models`, {
        modelId,
        modelData
      });
      
      if (response.data?.success) {
        toast.success('Data model created successfully');
        setShowCreateModelModal(false);
        setModelForm({ name: '', description: '', version: '1.0.0', status: 'draft' });
        loadModels();
      } else {
        toast.error('Failed to create data model');
      }
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('Failed to create data model');
    }
  };

  // Create object
  const createObject = async () => {
    if (!selectedModel) return;
    
    try {
      const authAxios = createAuthAxios();
      const objectId = `object-${Date.now()}`;
      
      const objectData = {
        id: objectId,
        name: objectForm.name,
        display_name: objectForm.display_name,
        api_name: objectForm.api_name,
        description: objectForm.description,
        object_type: objectForm.object_type,
        is_active: true,
        fields: [],
        relationships: []
      };
      
      // Update the model with the new object
      const updatedModel = {
        ...selectedModel,
        objects: [...(selectedModel.objects || []), objectData]
      };
      
      const response = await authAxios.post(`/${PROJECT_ID}/data-models`, {
        modelId: selectedModel.id,
        modelData: updatedModel
      });
      
      if (response.data?.success) {
        toast.success('Object created successfully');
        setShowCreateObjectModal(false);
        setObjectForm({ name: '', display_name: '', api_name: '', description: '', object_type: 'custom' });
        loadModels();
        if (selectedModel) {
          const updatedModelData = await authAxios.get(`/${PROJECT_ID}/data-models/${selectedModel.id}`);
          if (updatedModelData.data?.success) {
            setSelectedModel(updatedModelData.data.data);
            setObjects(updatedModelData.data.data.objects || []);
          }
        }
      } else {
        toast.error('Failed to create object');
      }
    } catch (error) {
      console.error('Error creating object:', error);
      toast.error('Failed to create object');
    }
  };

  // Create field
  const createField = async (objectId: string) => {
    if (!selectedModel) return;
    
    try {
      const authAxios = createAuthAxios();
      const fieldId = `field-${Date.now()}`;
      
      const fieldData = {
        id: fieldId,
        name: fieldForm.name,
        display_name: fieldForm.display_name,
        field_type: fieldForm.field_type,
        data_type: fieldForm.data_type,
        is_required: fieldForm.is_required,
        is_unique: fieldForm.is_unique,
        description: fieldForm.description
      };
      
      // Find the object and add the field
      const updatedObjects = objects.map(obj => {
        if (obj.id === objectId) {
          return {
            ...obj,
            fields: [...(obj.fields || []), fieldData]
          };
        }
        return obj;
      });
      
      // Update the model
      const updatedModel = {
        ...selectedModel,
        objects: updatedObjects
      };
      
      const response = await authAxios.post(`/${PROJECT_ID}/data-models`, {
        modelId: selectedModel.id,
        modelData: updatedModel
      });
      
      if (response.data?.success) {
        toast.success('Field created successfully');
        setShowCreateFieldModal(false);
        setFieldForm({ name: '', display_name: '', field_type: '', data_type: '', is_required: false, is_unique: false, description: '' });
        loadModels();
        if (selectedModel) {
          const updatedModelData = await authAxios.get(`/${PROJECT_ID}/data-models/${selectedModel.id}`);
          if (updatedModelData.data?.success) {
            setSelectedModel(updatedModelData.data.data);
            setObjects(updatedModelData.data.data.objects || []);
          }
        }
      } else {
        toast.error('Failed to create field');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      toast.error('Failed to create field');
    }
  };

  // Add comment
  const addComment = async () => {
    if (!selectedModel) return;
    
    try {
      const authAxios = createAuthAxios();
      const commentId = `comment-${Date.now()}`;
      
      const commentData = {
        id: commentId,
        content: commentForm.content,
        author: 'Current User', // You can get this from AuthService
        created_at: new Date().toISOString(),
        target_type: commentForm.target_type,
        target_id: commentForm.target_id,
        parent_id: commentForm.parent_id || null
      };
      
      // Add comment to the appropriate target
      let updatedModel = { ...selectedModel };
      
      if (commentForm.target_type === 'model') {
        updatedModel.comments = [...(updatedModel.comments || []), commentData];
      } else if (commentForm.target_type === 'object') {
        updatedModel.objects = updatedModel.objects?.map(obj => {
          if (obj.id === commentForm.target_id) {
            return {
              ...obj,
              comments: [...(obj.comments || []), commentData]
            };
          }
          return obj;
        });
      } else if (commentForm.target_type === 'field') {
        updatedModel.objects = updatedModel.objects?.map(obj => {
          if (obj.id === commentForm.parent_id) {
            return {
              ...obj,
              fields: obj.fields?.map(field => {
                if (field.id === commentForm.target_id) {
                  return {
                    ...field,
                    comments: [...(field.comments || []), commentData]
                  };
                }
                return field;
              })
            };
          }
          return obj;
        });
      }
      
      const response = await authAxios.post(`/${PROJECT_ID}/data-models`, {
        modelId: selectedModel.id,
        modelData: updatedModel
      });
      
      if (response.data?.success) {
        toast.success('Comment added successfully');
        setShowCommentModal(false);
        setCommentForm({ content: '', target_type: 'model', target_id: '', parent_id: '' });
        loadModels();
        if (selectedModel) {
          const updatedModelData = await authAxios.get(`/${PROJECT_ID}/data-models/${selectedModel.id}`);
          if (updatedModelData.data?.success) {
            setSelectedModel(updatedModelData.data.data);
            setObjects(updatedModelData.data.data.objects || []);
          }
        }
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // Export model
  const exportModel = async (format: string) => {
    if (!selectedModel) return;
    
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/${PROJECT_ID}/export/data-models/${selectedModel.id}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedModel.name}-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Model exported successfully');
    } catch (error) {
      console.error('Error exporting model:', error);
      toast.error('Failed to export model');
    }
  };

  // Load model details
  const loadModelDetails = useCallback(async (modelId: string) => {
    try {
      const authAxios = createAuthAxios();
      const response = await authAxios.get(`/${PROJECT_ID}/data-models/${modelId}`);
      
      if (response.data?.success) {
        const modelData = response.data.data;
        setSelectedModel(modelData);
        setObjects(modelData.objects || []);
        loadGitHistory(modelId);
      }
    } catch (error) {
      console.error('Error loading model details:', error);
      toast.error('Failed to load model details');
    }
  }, [loadGitHistory]);

  // Initialize
  useEffect(() => {
    loadModels();
    loadFieldTypes();
    loadDataTypes();
  }, [loadModels, loadFieldTypes, loadDataTypes]);

  // Update objects when selected model changes
  useEffect(() => {
    if (selectedModel) {
      setObjects(selectedModel.objects || []);
    }
  }, [selectedModel]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Universal Data Model Manager</h1>
              <p className="text-gray-600 mt-1">Manage data models using the Universal Knowledge API</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModelModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Create Model</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('models')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'models'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Models
              </button>
              <button
                onClick={() => setActiveTab('designer')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'designer'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ERD Designer
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Git History
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Export
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'models' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Models</h2>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading models...</p>
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-8">
                  <Database size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No data models found</h3>
                  <p className="text-gray-600 mb-4">Create your first data model to get started</p>
                  <button
                    onClick={() => setShowCreateModelModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create Model
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => loadModelDetails(model.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{model.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          model.status === 'active' ? 'bg-green-100 text-green-800' :
                          model.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {model.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{model.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>v{model.version}</span>
                        <span>{model.created_at ? new Date(model.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'designer' && selectedModel && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ERD Designer - {selectedModel.name}</h2>
              <div className="h-96 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Database size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">ERD Designer</h3>
                  <p className="text-gray-600">ERD Designer functionality will be implemented soon.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && selectedModel && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Git History - {selectedModel.name}</h2>
              <div className="space-y-2">
                {gitHistory.map((commit, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{commit.message}</p>
                        <p className="text-sm text-gray-600">{commit.author} • {commit.date}</p>
                      </div>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{commit.hash}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export' && selectedModel && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Export - {selectedModel.name}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Export Formats</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => exportModel('json')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => exportModel('xml')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Export XML
                    </button>
                    <button
                      onClick={() => exportModel('sql')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                    >
                      Export SQL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Model Modal */}
      {showCreateModelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Data Model</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={modelForm.name}
                  onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter model name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={modelForm.description}
                  onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Enter model description"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={createModel}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateModelModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Object Modal */}
      {showCreateObjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Object</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={objectForm.name}
                  onChange={(e) => setObjectForm({ ...objectForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter object name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={objectForm.display_name}
                  onChange={(e) => setObjectForm({ ...objectForm, display_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Name</label>
                <input
                  type="text"
                  value={objectForm.api_name}
                  onChange={(e) => setObjectForm({ ...objectForm, api_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter API name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={objectForm.description}
                  onChange={(e) => setObjectForm({ ...objectForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Enter object description"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={createObject}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateObjectModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Field Modal */}
      {showCreateFieldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Field</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter field name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={fieldForm.display_name}
                  onChange={(e) => setFieldForm({ ...fieldForm, display_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                <select
                  value={fieldForm.field_type}
                  onChange={(e) => setFieldForm({ ...fieldForm, field_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select field type</option>
                  {fieldTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                <select
                  value={fieldForm.data_type}
                  onChange={(e) => setFieldForm({ ...fieldForm, data_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select data type</option>
                  {dataTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={fieldForm.is_required}
                    onChange={(e) => setFieldForm({ ...fieldForm, is_required: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={fieldForm.is_unique}
                    onChange={(e) => setFieldForm({ ...fieldForm, is_unique: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Unique</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={fieldForm.description}
                  onChange={(e) => setFieldForm({ ...fieldForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Enter field description"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => createField(selectedObject?.id || '')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateFieldModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Comment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="Enter your comment"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={addComment}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Comment
                </button>
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component with permission guard
const UniversalDataModelManagerWrapper: React.FC = () => {
  return (
    <PermissionGuard permission="DataModeling">
      <UniversalDataModelManager />
    </PermissionGuard>
  );
};

export default UniversalDataModelManagerWrapper;
