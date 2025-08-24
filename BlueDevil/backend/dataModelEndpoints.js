const express = require('express');
const DataModelGitService = require('./dataModelGitService');
const { authenticateToken } = require('./auth');
const { requirePermission } = require('./permissionMiddleware');

const router = express.Router();
const dataModelService = new DataModelGitService();

// Middleware to check DataModeling permission
const requireDataModelingPermission = requirePermission('DataModeling');

// Get all data models for current project
router.get('/models', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const models = await dataModelService.listModels();
    res.json({ success: true, data: models });
  } catch (error) {
    console.error('Error fetching data models:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data models' });
  }
});

// Create new data model
router.post('/models', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { name, description, metadata } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Model name is required' });
    }
    
    const modelData = {
      name,
      description: description || '',
      created_by: req.user.id,
      metadata: metadata || {}
    };
    
    const model = await dataModelService.createModel(modelData);
    res.status(201).json({ success: true, data: model });
  } catch (error) {
    console.error('Error creating data model:', error);
    res.status(500).json({ success: false, error: 'Failed to create data model' });
  }
});

// Get specific data model
router.get('/models/:modelId', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId } = req.params;
    const model = await dataModelService.getModel(modelId);
    const objects = await dataModelService.listObjects(modelId);
    
    res.json({ 
      success: true, 
      data: { 
        ...model, 
        objects 
      } 
    });
  } catch (error) {
    console.error('Error fetching data model:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch data model' });
  }
});

// Update data model
router.put('/models/:modelId', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId } = req.params;
    const updates = req.body;
    
    const updatedModel = await dataModelService.updateModel(modelId, updates);
    res.json({ success: true, data: updatedModel });
  } catch (error) {
    console.error('Error updating data model:', error);
    res.status(500).json({ success: false, error: 'Failed to update data model' });
  }
});

// Delete data model
router.delete('/models/:modelId', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId } = req.params;
    // Note: This would need to be implemented in the service
    // For now, we'll just return success
    res.json({ success: true, message: 'Model deletion not yet implemented' });
  } catch (error) {
    console.error('Error deleting data model:', error);
    res.status(500).json({ success: false, error: 'Failed to delete data model' });
  }
});

// Create object in data model
router.post('/models/:modelId/objects', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId } = req.params;
    const { name, display_name, api_name, description, object_type, metadata } = req.body;
    
    if (!name || !display_name || !api_name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, display_name, and api_name are required' 
      });
    }
    
    const objectData = {
      name,
      display_name,
      api_name,
      description: description || '',
      object_type: object_type || 'custom',
      metadata: metadata || {}
    };
    
    const object = await dataModelService.createObject(modelId, objectData);
    res.status(201).json({ success: true, data: object });
  } catch (error) {
    console.error('Error creating object:', error);
    res.status(500).json({ success: false, error: 'Failed to create object' });
  }
});

// Get specific object
router.get('/models/:modelId/objects/:objectId', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId, objectId } = req.params;
    const object = await dataModelService.getObject(modelId, objectId);
    res.json({ success: true, data: object });
  } catch (error) {
    console.error('Error fetching object:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch object' });
  }
});

// Update object
router.put('/models/:modelId/objects/:objectId', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId, objectId } = req.params;
    const updates = req.body;
    
    const updatedObject = await dataModelService.updateObject(modelId, objectId, updates);
    res.json({ success: true, data: updatedObject });
  } catch (error) {
    console.error('Error updating object:', error);
    res.status(500).json({ success: false, error: 'Failed to update object' });
  }
});

// Create field in object
router.post('/models/:modelId/objects/:objectId/fields', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId, objectId } = req.params;
    const { 
      name, 
      display_name, 
      field_type, 
      data_type, 
      is_required, 
      is_unique, 
      is_external_id,
      default_value,
      description,
      help_text,
      validation_rules,
      picklist_values,
      reference_to,
      metadata 
    } = req.body;
    
    if (!name || !display_name || !field_type || !data_type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, display_name, field_type, and data_type are required' 
      });
    }
    
    const fieldData = {
      name,
      display_name,
      field_type,
      data_type,
      is_required: is_required || false,
      is_unique: is_unique || false,
      is_external_id: is_external_id || false,
      default_value,
      description: description || '',
      help_text: help_text || '',
      validation_rules: validation_rules || [],
      picklist_values: picklist_values || [],
      reference_to,
      metadata: metadata || {}
    };
    
    const field = await dataModelService.createField(modelId, objectId, fieldData);
    res.status(201).json({ success: true, data: field });
  } catch (error) {
    console.error('Error creating field:', error);
    res.status(500).json({ success: false, error: 'Failed to create field' });
  }
});

// Update field
router.put('/models/:modelId/objects/:objectId/fields/:fieldName', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId, objectId, fieldName } = req.params;
    const updates = req.body;
    
    const updatedField = await dataModelService.updateField(modelId, objectId, fieldName, updates);
    res.json({ success: true, data: updatedField });
  } catch (error) {
    console.error('Error updating field:', error);
    res.status(500).json({ success: false, error: 'Failed to update field' });
  }
});

// Add comment to model, object, field, or relationship
router.post('/models/:modelId/comments', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId } = req.params;
    const { targetType, targetId, content, tags } = req.body;
    
    if (!targetType || !targetId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'targetType, targetId, and content are required' 
      });
    }
    
    const commentData = {
      author: req.user.id,
      content,
      tags: tags || []
    };
    
    const comment = await dataModelService.addComment(modelId, targetType, targetId, commentData);
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
});

// Get git history for model
router.get('/models/:modelId/history', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId } = req.params;
    const history = await dataModelService.getGitHistory(modelId);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching git history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch git history' });
  }
});

// Export model
router.get('/models/:modelId/export', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const { modelId } = req.params;
    const { format = 'json' } = req.query;
    
    const exportedData = await dataModelService.exportModel(modelId, format);
    
    if (format === 'salesforce') {
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="${modelId}-metadata.xml"`);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${modelId}.json"`);
    }
    
    res.send(exportedData);
  } catch (error) {
    console.error('Error exporting model:', error);
    res.status(500).json({ success: false, error: 'Failed to export model' });
  }
});

// Get field types and data types for dropdowns
router.get('/field-types', authenticateToken, requireDataModelingPermission, async (req, res) => {
  try {
    const fieldTypes = [
      { value: 'text', label: 'Text', salesforce_type: 'Text' },
      { value: 'textarea', label: 'Text Area', salesforce_type: 'TextArea' },
      { value: 'number', label: 'Number', salesforce_type: 'Number' },
      { value: 'currency', label: 'Currency', salesforce_type: 'Currency' },
      { value: 'percent', label: 'Percent', salesforce_type: 'Percent' },
      { value: 'date', label: 'Date', salesforce_type: 'Date' },
      { value: 'datetime', label: 'Date/Time', salesforce_type: 'DateTime' },
      { value: 'time', label: 'Time', salesforce_type: 'Time' },
      { value: 'email', label: 'Email', salesforce_type: 'Email' },
      { value: 'phone', label: 'Phone', salesforce_type: 'Phone' },
      { value: 'url', label: 'URL', salesforce_type: 'Url' },
      { value: 'picklist', label: 'Picklist', salesforce_type: 'Picklist' },
      { value: 'multipicklist', label: 'Multi-Select Picklist', salesforce_type: 'MultiselectPicklist' },
      { value: 'checkbox', label: 'Checkbox', salesforce_type: 'Checkbox' },
      { value: 'lookup', label: 'Lookup Relationship', salesforce_type: 'Lookup' },
      { value: 'master_detail', label: 'Master-Detail Relationship', salesforce_type: 'MasterDetail' },
      { value: 'rollup_summary', label: 'Roll-Up Summary', salesforce_type: 'RollUpSummary' },
      { value: 'formula', label: 'Formula', salesforce_type: 'Formula' },
      { value: 'auto_number', label: 'Auto Number', salesforce_type: 'AutoNumber' },
      { value: 'long_text_area', label: 'Long Text Area', salesforce_type: 'LongTextArea' },
      { value: 'rich_text_area', label: 'Rich Text Area', salesforce_type: 'Html' }
    ];
    
    const dataTypes = [
      { value: 'VARCHAR(255)', label: 'VARCHAR(255)' },
      { value: 'VARCHAR(100)', label: 'VARCHAR(100)' },
      { value: 'VARCHAR(50)', label: 'VARCHAR(50)' },
      { value: 'TEXT', label: 'TEXT' },
      { value: 'LONGTEXT', label: 'LONGTEXT' },
      { value: 'NUMBER(18,2)', label: 'NUMBER(18,2)' },
      { value: 'NUMBER(18,0)', label: 'NUMBER(18,0)' },
      { value: 'NUMBER(10,2)', label: 'NUMBER(10,2)' },
      { value: 'NUMBER(5,2)', label: 'NUMBER(5,2)' },
      { value: 'INTEGER', label: 'INTEGER' },
      { value: 'BOOLEAN', label: 'BOOLEAN' },
      { value: 'DATE', label: 'DATE' },
      { value: 'DATETIME', label: 'DATETIME' },
      { value: 'TIME', label: 'TIME' },
      { value: 'EMAIL', label: 'EMAIL' },
      { value: 'PHONE', label: 'PHONE' },
      { value: 'URL', label: 'URL' },
      { value: 'PICKLIST', label: 'PICKLIST' },
      { value: 'MULTIPICKLIST', label: 'MULTIPICKLIST' },
      { value: 'REFERENCE', label: 'REFERENCE' }
    ];
    
    res.json({ 
      success: true, 
      data: { 
        fieldTypes, 
        dataTypes 
      } 
    });
  } catch (error) {
    console.error('Error fetching field types:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch field types' });
  }
});

module.exports = router;
