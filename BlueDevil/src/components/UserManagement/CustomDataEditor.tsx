import React, { useState } from 'react';
import { useUserManagement } from '../../contexts/UserManagementContext';

interface CustomDataEditorProps {
  userId: string;
  data: Record<string, any>;
  onClose: () => void;
}

export const CustomDataEditor: React.FC<CustomDataEditorProps> = ({ 
  userId, 
  data, 
  onClose 
}) => {
  const { setCustomData, deleteCustomData } = useUserManagement();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    if (!newKey.trim()) return;
    
    setIsLoading(true);
    try {
      await setCustomData(userId, newKey.trim(), newValue);
      setNewKey('');
      setNewValue('');
    } catch (error) {
      console.error('Failed to add custom data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (key: string) => {
    if (!editingValue.trim()) return;
    
    setIsLoading(true);
    try {
      await setCustomData(userId, key, editingValue);
      setEditingKey(null);
      setEditingValue('');
    } catch (error) {
      console.error('Failed to update custom data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm(`Are you sure you want to delete "${key}"?`)) return;
    
    setIsLoading(true);
    try {
      await deleteCustomData(userId, key);
    } catch (error) {
      console.error('Failed to delete custom data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (key: string, value: any) => {
    setEditingKey(key);
    setEditingValue(typeof value === 'object' ? JSON.stringify(value) : String(value));
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditingValue('');
  };

  const renderValue = (value: any) => {
    if (typeof value === 'object') {
      return <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{JSON.stringify(value)}</code>;
    }
    return <span className="text-sm text-gray-700">{String(value)}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Existing Custom Data */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Existing Data</h4>
        {Object.entries(data).length === 0 ? (
          <p className="text-sm text-gray-500 italic">No custom data defined</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">{key}:</span>
                    {editingKey === key ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      renderValue(value)
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  {editingKey === key ? (
                    <>
                      <button
                        onClick={() => handleEdit(key)}
                        disabled={isLoading}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={isLoading}
                        className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(key, value)}
                        disabled={isLoading}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(key)}
                        disabled={isLoading}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Custom Data */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Data</h4>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Key (e.g., department, skills, org_id)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newKey.trim() || isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Custom Data'}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
        <p><strong>Tip:</strong> You can store any type of data here. For complex values (arrays, objects), use JSON format.</p>
        <p className="mt-1">Examples: <code>["React", "TypeScript"]</code> or <code>{"{name: 'value'}"}</code></p>
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};
