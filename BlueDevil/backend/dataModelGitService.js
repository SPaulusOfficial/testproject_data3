const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class DataModelGitService {
  constructor() {
    // Use the main repository path for data models
    this.basePath = path.join(__dirname, '..', '..', 'data-models');
    this.ensureBasePath();
  }

  async ensureBasePath() {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      console.error('Error creating base path:', error);
    }
  }

  // Git Operations with Remote Repository
  async ensureModelRepo(modelId) {
    const modelPath = path.join(this.basePath, modelId);
    
    console.log(`🔒 ensureModelRepo: Ensuring directory for data model ${modelId}`);
    console.log(`🔒 ensureModelRepo: Model directory: ${modelPath}`);
    
    try {
      // Check if directory exists
      await fs.access(modelPath);
      console.log(`🔒 ensureModelRepo: Model directory already exists`);
      return modelPath;
    } catch (error) {
      // Directory doesn't exist, create it
      console.log(`🔒 ensureModelRepo: Creating new model directory`);
      await fs.mkdir(modelPath, { recursive: true });
      return modelPath;
    }
  }

  // No longer needed - we use the main repository
  // async initializeGitRepo(modelPath, modelId) { ... }

  async setupRemote(modelPath, modelId) {
    try {
      // Data models are stored as folders in the main repository
      console.log(`🔒 setupRemote: Data models stored as folders in main repository`);
    } catch (error) {
      console.error(`Error setting up repository for model ${modelId}:`, error);
    }
  }

  async commitChanges(modelId, message, author = null) {
    const modelPath = await this.ensureModelRepo(modelId);
    const mainRepoPath = path.join(__dirname, '..', '..');
    
    try {
      // Add the data model folder to the main repository
      const relativePath = path.relative(mainRepoPath, modelPath);
      await execAsync(`git add "${relativePath}"`, { cwd: mainRepoPath });
      
      const commitCmd = author 
        ? `git commit -m "${message}" --author="${author.name} <${author.email}>"`
        : `git commit -m "${message}"`;
      
      await execAsync(commitCmd, { cwd: mainRepoPath });
      
      // Try to push to remote
      try {
        await execAsync('git push origin main', { cwd: mainRepoPath });
        console.log(`Changes committed and pushed for model ${modelId}: ${message}`);
      } catch (pushError) {
        console.log(`Changes committed locally for model ${modelId}: ${message} (remote push failed)`);
      }
    } catch (error) {
      console.error(`Error committing changes for model ${modelId}:`, error);
    }
  }

  async getGitHistory(modelId) {
    const modelPath = await this.ensureModelRepo(modelId);
    const mainRepoPath = path.join(__dirname, '..', '..');
    const relativePath = path.relative(mainRepoPath, modelPath);
    
    try {
      const { stdout } = await execAsync(`git log --oneline --follow --pretty=format:"%h - %an, %ar : %s" -- "${relativePath}"`, { cwd: mainRepoPath });
      return stdout.split('\n').filter(line => line.trim());
    } catch (error) {
      console.error(`Error getting git history for model ${modelId}:`, error);
      return [];
    }
  }

  // Model Operations
  async createModel(modelData) {
    const modelId = modelData.id || this.generateId();
    const modelPath = path.join(this.basePath, modelId);
    
    try {
      // Ensure model directory exists
      await this.ensureModelRepo(modelId);
      
      // Create model directory structure
      await fs.mkdir(path.join(modelPath, 'objects'), { recursive: true });
      
      // Create model.json
      const modelJson = {
        id: modelId,
        name: modelData.name,
        description: modelData.description,
        version: "1.0.0",
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: modelData.created_by,
        metadata: modelData.metadata || {},
        comments: []
      };
      
      await fs.writeFile(
        path.join(modelPath, 'model.json'),
        JSON.stringify(modelJson, null, 2)
      );

      // Create README.md
      const readmeContent = `# ${modelData.name}

${modelData.description}

## Version: ${modelJson.version}
## Status: ${modelJson.status}
## Created: ${modelJson.created_at}

## Objects
- No objects defined yet

## Comments
- No comments yet
`;
      
      await fs.writeFile(path.join(modelPath, 'README.md'), readmeContent);

      // Commit the initial files
      await this.commitChanges(modelId, `Initial commit: Create model "${modelData.name}"`);

      return modelJson;
    } catch (error) {
      console.error(`Error creating model ${modelId}:`, error);
      throw error;
    }
  }

  async getModel(modelId) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      const modelJson = await fs.readFile(path.join(modelPath, 'model.json'), 'utf8');
      return JSON.parse(modelJson);
    } catch (error) {
      console.error(`Error reading model ${modelId}:`, error);
      throw error;
    }
  }

  async updateModel(modelId, updates) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      const modelJson = await this.getModel(modelId);
      
      const updatedModel = {
        ...modelJson,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await fs.writeFile(
        path.join(modelPath, 'model.json'),
        JSON.stringify(updatedModel, null, 2)
      );

      await this.commitChanges(modelId, `Update model: ${updates.name || 'metadata changes'}`);
      return updatedModel;
    } catch (error) {
      console.error(`Error updating model ${modelId}:`, error);
      throw error;
    }
  }

  // Object Operations
  async createObject(modelId, objectData) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      const objectId = objectData.id || this.generateId();
      const objectPath = path.join(modelPath, 'objects', objectId);
      
      // Create object directory
      await fs.mkdir(objectPath, { recursive: true });
      await fs.mkdir(path.join(objectPath, 'fields'), { recursive: true });
      
      // Create object.json
      const objectJson = {
        id: objectId,
        name: objectData.name,
        display_name: objectData.display_name,
        api_name: objectData.api_name,
        description: objectData.description,
        object_type: objectData.object_type || 'custom',
        is_active: true,
        metadata: objectData.metadata || {},
        comments: []
      };
      
      await fs.writeFile(
        path.join(objectPath, 'object.json'),
        JSON.stringify(objectJson, null, 2)
      );

      // Create empty relationships.json
      const relationshipsJson = {
        relationships: []
      };
      
      await fs.writeFile(
        path.join(objectPath, 'relationships.json'),
        JSON.stringify(relationshipsJson, null, 2)
      );

      await this.commitChanges(modelId, `Add object: ${objectData.name}`);
      return objectJson;
    } catch (error) {
      console.error(`Error creating object ${objectData.name}:`, error);
      throw error;
    }
  }

  async getObject(modelId, objectId) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      const objectPath = path.join(modelPath, 'objects', objectId);
      
      const objectJson = await fs.readFile(path.join(objectPath, 'object.json'), 'utf8');
      const relationshipsJson = await fs.readFile(path.join(objectPath, 'relationships.json'), 'utf8');
      
      const object = JSON.parse(objectJson);
      const relationships = JSON.parse(relationshipsJson);
      
      // Get all fields
      const fieldsPath = path.join(objectPath, 'fields');
      const fieldFiles = await fs.readdir(fieldsPath);
      const fields = [];
      
      for (const fieldFile of fieldFiles) {
        if (fieldFile.endsWith('.json')) {
          const fieldJson = await fs.readFile(path.join(fieldsPath, fieldFile), 'utf8');
          fields.push(JSON.parse(fieldJson));
        }
      }
      
      return {
        ...object,
        fields,
        relationships: relationships.relationships
      };
    } catch (error) {
      console.error(`Error reading object ${objectId}:`, error);
      throw error;
    }
  }

  async updateObject(modelId, objectId, updates) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      const objectPath = path.join(modelPath, 'objects', objectId);
      
      const objectJson = await fs.readFile(path.join(objectPath, 'object.json'), 'utf8');
      const object = JSON.parse(objectJson);
      
      const updatedObject = {
        ...object,
        ...updates
      };
      
      await fs.writeFile(
        path.join(objectPath, 'object.json'),
        JSON.stringify(updatedObject, null, 2)
      );

      await this.commitChanges(modelId, `Update object: ${object.name}`);
      return updatedObject;
    } catch (error) {
      console.error(`Error updating object ${objectId}:`, error);
      throw error;
    }
  }

  // Field Operations
  async createField(modelId, objectId, fieldData) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      const fieldPath = path.join(modelPath, 'objects', objectId, 'fields');
      
      const fieldId = fieldData.id || this.generateId();
      const fieldJson = {
        id: fieldId,
        name: fieldData.name,
        display_name: fieldData.display_name,
        field_type: fieldData.field_type,
        data_type: fieldData.data_type,
        is_required: fieldData.is_required || false,
        is_unique: fieldData.is_unique || false,
        is_external_id: fieldData.is_external_id || false,
        default_value: fieldData.default_value,
        description: fieldData.description,
        help_text: fieldData.help_text,
        validation_rules: fieldData.validation_rules || [],
        picklist_values: fieldData.picklist_values || [],
        reference_to: fieldData.reference_to,
        metadata: fieldData.metadata || {},
        comments: []
      };
      
      await fs.writeFile(
        path.join(fieldPath, `${fieldData.name}.json`),
        JSON.stringify(fieldJson, null, 2)
      );

      await this.commitChanges(modelId, `Add field: ${fieldData.name} to ${objectId}`);
      return fieldJson;
    } catch (error) {
      console.error(`Error creating field ${fieldData.name}:`, error);
      throw error;
    }
  }

  async updateField(modelId, objectId, fieldName, updates) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      const fieldPath = path.join(modelPath, 'objects', objectId, 'fields', `${fieldName}.json`);
      
      const fieldJson = await fs.readFile(fieldPath, 'utf8');
      const field = JSON.parse(fieldJson);
      
      const updatedField = {
        ...field,
        ...updates
      };
      
      await fs.writeFile(fieldPath, JSON.stringify(updatedField, null, 2));

      await this.commitChanges(modelId, `Update field: ${fieldName} in ${objectId}`);
      return updatedField;
    } catch (error) {
      console.error(`Error updating field ${fieldName}:`, error);
      throw error;
    }
  }

  // Comment Operations
  async addComment(modelId, targetType, targetId, commentData) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      let targetPath;
      let targetFile;
      
      switch (targetType) {
        case 'model':
          targetPath = modelPath;
          targetFile = 'model.json';
          break;
        case 'object':
          targetPath = path.join(modelPath, 'objects', targetId);
          targetFile = 'object.json';
          break;
        case 'field':
          const [objectId, fieldName] = targetId.split('.');
          targetPath = path.join(modelPath, 'objects', objectId, 'fields');
          targetFile = `${fieldName}.json`;
          break;
        case 'relationship':
          const [relObjectId] = targetId.split('.');
          targetPath = path.join(modelPath, 'objects', relObjectId);
          targetFile = 'relationships.json';
          break;
        default:
          throw new Error(`Invalid target type: ${targetType}`);
      }
      
      const filePath = path.join(targetPath, targetFile);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      const comment = {
        id: this.generateId(),
        author: commentData.author,
        timestamp: new Date().toISOString(),
        type: targetType,
        content: commentData.content,
        tags: commentData.tags || []
      };
      
      if (targetType === 'relationship') {
        // Find the specific relationship and add comment
        const relationshipId = targetId.split('.')[1];
        const relationship = data.relationships.find(r => r.id === relationshipId);
        if (relationship) {
          if (!relationship.comments) relationship.comments = [];
          relationship.comments.push(comment);
        }
      } else {
        // Add comment to the main object
        if (!data.comments) data.comments = [];
        data.comments.push(comment);
      }
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));

      await this.commitChanges(modelId, `Add comment to ${targetType}: ${targetId}`);
      return comment;
    } catch (error) {
      console.error(`Error adding comment to ${targetType} ${targetId}:`, error);
      throw error;
    }
  }

  // List Operations
  async listModels() {
    try {
      const models = [];
      const modelDirs = await fs.readdir(this.basePath);
      
      for (const modelDir of modelDirs) {
        if (modelDir.startsWith('.')) continue; // Skip hidden files
        
        try {
          const modelPath = path.join(this.basePath, modelDir);
          const modelJson = await fs.readFile(path.join(modelPath, 'model.json'), 'utf8');
          const model = JSON.parse(modelJson);
          models.push(model);
        } catch (error) {
          console.error(`Error reading model ${modelDir}:`, error);
        }
      }
      
      return models;
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  async listObjects(modelId) {
    try {
      const modelPath = path.join(this.basePath, modelId);
      const objectsPath = path.join(modelPath, 'objects');
      const objectDirs = await fs.readdir(objectsPath);
      
      const objects = [];
      for (const objectDir of objectDirs) {
        if (objectDir.startsWith('.')) continue;
        
        try {
          const objectJson = await fs.readFile(path.join(objectsPath, objectDir, 'object.json'), 'utf8');
          const object = JSON.parse(objectJson);
          objects.push(object);
        } catch (error) {
          console.error(`Error reading object ${objectDir}:`, error);
        }
      }
      
      return objects;
    } catch (error) {
      console.error(`Error listing objects for model ${modelId}:`, error);
      return [];
    }
  }

  // Utility Methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Export/Import
  async exportModel(modelId, format = 'json') {
    try {
      const model = await this.getModel(modelId);
      const objects = await this.listObjects(modelId);
      
      const fullModel = {
        ...model,
        objects: []
      };
      
      for (const object of objects) {
        const fullObject = await this.getObject(modelId, object.id);
        fullModel.objects.push(fullObject);
      }
      
      if (format === 'json') {
        return JSON.stringify(fullModel, null, 2);
      } else if (format === 'salesforce') {
        return this.generateSalesforceMetadata(fullModel);
      }
      
      return fullModel;
    } catch (error) {
      console.error(`Error exporting model ${modelId}:`, error);
      throw error;
    }
  }

  generateSalesforceMetadata(model) {
    // Generate Salesforce metadata XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">\n';
    
    for (const object of model.objects) {
      xml += `  <label>${object.display_name}</label>\n`;
      xml += `  <pluralLabel>${object.display_name}s</pluralLabel>\n`;
      
      for (const field of object.fields) {
        xml += `  <fields>\n`;
        xml += `    <fullName>${field.name}__c</fullName>\n`;
        xml += `    <label>${field.display_name}</label>\n`;
        xml += `    <type>${field.metadata.salesforce_type || 'Text'}</type>\n`;
        xml += `  </fields>\n`;
      }
    }
    
    xml += '</CustomObject>';
    return xml;
  }
}

module.exports = DataModelGitService;
