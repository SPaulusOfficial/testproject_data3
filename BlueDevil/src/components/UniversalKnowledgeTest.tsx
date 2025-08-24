import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import AuthService from '@/services/AuthService';
import axios from 'axios';

const UniversalKnowledgeTest: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = 'http://localhost:3002/api/knowledge';
  const PROJECT_ID = 'test-project-123';

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

  const addResult = (test: string, result: any, success: boolean = true) => {
    setResults(prev => [...prev, {
      test,
      result,
      success,
      timestamp: new Date().toISOString()
    }]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    
    const authAxios = createAuthAxios();
    
    try {
      // Test 1: Health Check
      addResult('Health Check', 'Starting...');
      const healthResponse = await authAxios.get(`/${PROJECT_ID}/health`);
      addResult('Health Check', healthResponse.data);

      // Test 2: Stats
      addResult('Stats', 'Starting...');
      const statsResponse = await authAxios.get(`/${PROJECT_ID}/stats`);
      addResult('Stats', statsResponse.data);

      // Test 3: Create Data Model
      addResult('Create Data Model', 'Starting...');
      const modelId = `test-model-${Date.now()}`;
      const modelData = {
        name: 'Test Data Model',
        description: 'A test data model for API testing',
        version: '1.0.0',
        status: 'draft',
        objects: [],
        relationships: []
      };
      
      const createModelResponse = await authAxios.post(`/${PROJECT_ID}/data-models`, {
        modelId,
        modelData
      });
      addResult('Create Data Model', createModelResponse.data);

      // Test 4: List Data Models
      addResult('List Data Models', 'Starting...');
      const listModelsResponse = await authAxios.get(`/${PROJECT_ID}/data-models`);
      addResult('List Data Models', listModelsResponse.data);

      // Test 5: Get Specific Data Model
      addResult('Get Data Model', 'Starting...');
      const getModelResponse = await authAxios.get(`/${PROJECT_ID}/data-models/${modelId}`);
      addResult('Get Data Model', getModelResponse.data);

      // Test 6: Create Document
      addResult('Create Document', 'Starting...');
      const documentId = `test-doc-${Date.now()}`;
      const documentData = {
        title: 'Test Document',
        content: 'This is a test document content.',
        author: 'Test User',
        tags: ['test', 'document']
      };
      
      const createDocResponse = await authAxios.post(`/${PROJECT_ID}/documents`, {
        documentId,
        documentData
      });
      addResult('Create Document', createDocResponse.data);

      // Test 7: List Documents
      addResult('List Documents', 'Starting...');
      const listDocsResponse = await authAxios.get(`/${PROJECT_ID}/documents`);
      addResult('List Documents', listDocsResponse.data);

      toast.success('All tests completed successfully!');
      
    } catch (error: any) {
      console.error('Test failed:', error);
      addResult('Error', {
        message: error.response?.data?.error || error.message,
        status: error.response?.status
      }, false);
      toast.error('Some tests failed. Check the results below.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Universal Knowledge API Test</h1>
          <p className="text-gray-600 mb-4">
            Test the Universal Knowledge API endpoints with authentication.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={runTests}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Running Tests...' : 'Run Tests'}
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Clear Results
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{result.test}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalKnowledgeTest;
