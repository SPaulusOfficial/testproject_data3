const UniversalKnowledgeService = require('./universalKnowledgeService.js')
const crypto = require('crypto')

// Example of how to use the Universal Knowledge Service internally
// without making API calls

async function exampleInternalUsage() {
  console.log('🚀 Example: Internal Universal Knowledge Service Usage\n')

  // Get database pool (this would normally come from your server setup)
  const pool = await global.getPool()
  
  // Create service instance
  const knowledgeService = new UniversalKnowledgeService(pool)
  
  // Example project and user IDs
  const projectId = 'example-project-123'
  const userId = 'example-user-456'
  
  try {
    // ===== 1. DATA MODEL OPERATIONS =====
    console.log('📊 1. Data Model Operations')
    console.log('='.repeat(50))
    
    const modelId = crypto.randomBytes(8).toString('hex')
    const modelData = {
      name: 'Customer Data Model',
      description: 'Data model for customer management',
      version: '1.0.0',
      status: 'draft',
      objects: [
        {
          id: 'customer',
          name: 'Customer',
          description: 'Customer entity',
          fields: [
            { name: 'id', type: 'uuid', required: true, description: 'Unique customer ID' },
            { name: 'email', type: 'string', required: true, description: 'Customer email' },
            { name: 'name', type: 'string', required: true, description: 'Customer name' },
            { name: 'created_at', type: 'timestamp', required: true, description: 'Creation date' }
          ]
        },
        {
          id: 'order',
          name: 'Order',
          description: 'Order entity',
          fields: [
            { name: 'id', type: 'uuid', required: true, description: 'Unique order ID' },
            { name: 'customer_id', type: 'uuid', required: true, description: 'Customer reference' },
            { name: 'total_amount', type: 'decimal', required: true, description: 'Order total' },
            { name: 'status', type: 'enum', required: true, description: 'Order status' }
          ]
        }
      ],
      relationships: [
        {
          id: 'customer_orders',
          source: 'customer',
          target: 'order',
          type: 'one-to-many',
          description: 'Customer can have multiple orders'
        }
      ]
    }
    
    // Create data model
    console.log('📝 Creating data model...')
    const createdModel = await knowledgeService.createOrUpdateDataModel(projectId, modelId, modelData, userId)
    console.log('✅ Data model created:', createdModel.name)
    
    // Get data model
    console.log('📖 Retrieving data model...')
    const retrievedModel = await knowledgeService.getDataModel(projectId, modelId)
    console.log('✅ Data model retrieved:', retrievedModel.metadata.name)
    console.log('   Objects:', retrievedModel.content.objects.length)
    console.log('   Relationships:', retrievedModel.content.relationships.length)
    
    // List all data models
    console.log('📋 Listing all data models...')
    const allModels = await knowledgeService.listDataModels(projectId)
    console.log('✅ Found data models:', allModels.length)
    
    // Get history
    console.log('📜 Getting data model history...')
    const history = await knowledgeService.getContentHistory(projectId, 'data-models', modelId)
    console.log('✅ History entries:', history.length)
    
    // ===== 2. DOCUMENT OPERATIONS =====
    console.log('\n📄 2. Document Operations')
    console.log('='.repeat(50))
    
    const documentId = crypto.randomBytes(8).toString('hex')
    const documentData = {
      name: 'API Documentation',
      description: 'Documentation for the Universal Knowledge API',
      version: '1.0.0',
      status: 'active',
      fileType: 'markdown',
      fileSize: 2048,
      content: `# Universal Knowledge API

## Overview
This API provides universal content management for various types of knowledge.

## Features
- Data Models
- Documents
- Diagrams
- Version Control
- Git Integration

## Usage
\`\`\`javascript
const service = new UniversalKnowledgeService(pool)
await service.createOrUpdateDataModel(projectId, modelId, modelData, userId)
\`\`\`
`
    }
    
    // Create document
    console.log('📝 Creating document...')
    const createdDocument = await knowledgeService.createOrUpdateDocument(projectId, documentId, documentData, userId)
    console.log('✅ Document created:', createdDocument.name)
    
    // Get document
    console.log('📖 Retrieving document...')
    const retrievedDocument = await knowledgeService.getDocument(projectId, documentId)
    console.log('✅ Document retrieved:', retrievedDocument.metadata.name)
    console.log('   File type:', retrievedDocument.content.fileType)
    console.log('   File size:', retrievedDocument.content.fileSize)
    
    // ===== 3. UNIVERSAL CONTENT OPERATIONS =====
    console.log('\n🌐 3. Universal Content Operations')
    console.log('='.repeat(50))
    
    const diagramId = crypto.randomBytes(8).toString('hex')
    const diagramContent = {
      name: 'System Architecture',
      description: 'High-level system architecture diagram',
      metadata: {
        version: '1.0.0',
        status: 'active',
        diagramType: 'flowchart',
        author: 'System Architect'
      },
      data: {
        nodes: [
          { id: '1', label: 'Frontend', position: { x: 0, y: 0 }, type: 'component' },
          { id: '2', label: 'API Gateway', position: { x: 200, y: 0 }, type: 'gateway' },
          { id: '3', label: 'Knowledge Service', position: { x: 400, y: 0 }, type: 'service' },
          { id: '4', label: 'Database', position: { x: 600, y: 0 }, type: 'database' }
        ],
        edges: [
          { source: '1', target: '2', label: 'HTTP' },
          { source: '2', target: '3', label: 'REST' },
          { source: '3', target: '4', label: 'SQL' }
        ]
      }
    }
    
    // Create universal content
    console.log('📝 Creating universal content (diagram)...')
    const createdDiagram = await knowledgeService.createOrUpdateContent(
      projectId, 
      'diagrams', 
      diagramId, 
      diagramContent, 
      userId, 
      'Create system architecture diagram'
    )
    console.log('✅ Diagram created:', createdDiagram.name)
    
    // Get universal content
    console.log('📖 Retrieving universal content...')
    const retrievedDiagram = await knowledgeService.getContent(projectId, 'diagrams', diagramId)
    console.log('✅ Diagram retrieved:', retrievedDiagram.metadata.name)
    console.log('   Nodes:', retrievedDiagram.content.data.nodes.length)
    console.log('   Edges:', retrievedDiagram.content.data.edges.length)
    
    // List all diagrams
    console.log('📋 Listing all diagrams...')
    const allDiagrams = await knowledgeService.listContent(projectId, 'diagrams')
    console.log('✅ Found diagrams:', allDiagrams.length)
    
    // ===== 4. EXPORT OPERATIONS =====
    console.log('\n📦 4. Export Operations')
    console.log('='.repeat(50))
    
    // Export single data model
    console.log('📦 Exporting single data model...')
    const exportedModel = await knowledgeService.exportContent(projectId, 'data-models', modelId)
    console.log('✅ Data model exported')
    console.log('   Export version:', exportedModel.exportVersion)
    console.log('   History entries:', exportedModel.history.length)
    
    // Export all data models
    console.log('📦 Exporting all data models...')
    const exportedAllModels = await knowledgeService.exportAllContent(projectId, 'data-models')
    console.log('✅ All data models exported')
    console.log('   Total items:', exportedAllModels.totalItems)
    console.log('   Export timestamp:', exportedAllModels.exportedAt)
    
    // ===== 5. UTILITY OPERATIONS =====
    console.log('\n🔧 5. Utility Operations')
    console.log('='.repeat(50))
    
    // Get project statistics
    console.log('📊 Getting project statistics...')
    const stats = await knowledgeService.getProjectStats(projectId)
    console.log('✅ Project statistics:')
    console.log('   Data models:', stats.contentTypes['data-models'])
    console.log('   Documents:', stats.contentTypes.documents)
    console.log('   Total items:', stats.totalItems)
    
    // Check project health
    console.log('🏥 Checking project health...')
    const health = await knowledgeService.getProjectHealth(projectId)
    console.log('✅ Project health:')
    console.log('   Project exists:', health.exists)
    console.log('   Project directory:', health.projectDir)
    
    // ===== 6. CLEANUP =====
    console.log('\n🧹 6. Cleanup Operations')
    console.log('='.repeat(50))
    
    // Delete created content
    console.log('🗑️ Cleaning up created content...')
    await knowledgeService.deleteDataModel(projectId, modelId, userId)
    await knowledgeService.deleteDocument(projectId, documentId, userId)
    await knowledgeService.deleteContent(projectId, 'diagrams', diagramId, userId, 'Cleanup test diagram')
    console.log('✅ All test content cleaned up')
    
    console.log('\n🎉 Example completed successfully!')
    
  } catch (error) {
    console.error('❌ Error in example:', error.message)
    console.error('Stack trace:', error.stack)
  } finally {
    // Close database connection
    if (pool) {
      await pool.end()
    }
  }
}

// Example of how to integrate with existing services
async function integrateWithExistingServices() {
  console.log('\n🔗 Integration Example: Using Universal Knowledge Service in other services\n')
  
  const pool = await global.getPool()
  const knowledgeService = new UniversalKnowledgeService(pool)
  
  const projectId = 'integration-project'
  const userId = 'integration-user'
  
  try {
    // Example: Create a data model from existing business logic
    const businessModelData = {
      name: 'Sales Pipeline',
      description: 'Data model for sales pipeline management',
      version: '1.0.0',
      status: 'draft',
      objects: [
        {
          id: 'lead',
          name: 'Lead',
          description: 'Sales lead',
          fields: [
            { name: 'id', type: 'uuid', required: true },
            { name: 'company', type: 'string', required: true },
            { name: 'contact_person', type: 'string', required: true },
            { name: 'email', type: 'string', required: true },
            { name: 'phone', type: 'string', required: false },
            { name: 'status', type: 'enum', required: true, values: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] },
            { name: 'value', type: 'decimal', required: false },
            { name: 'created_at', type: 'timestamp', required: true },
            { name: 'updated_at', type: 'timestamp', required: true }
          ]
        },
        {
          id: 'opportunity',
          name: 'Opportunity',
          description: 'Sales opportunity',
          fields: [
            { name: 'id', type: 'uuid', required: true },
            { name: 'lead_id', type: 'uuid', required: true },
            { name: 'title', type: 'string', required: true },
            { name: 'description', type: 'text', required: false },
            { name: 'value', type: 'decimal', required: true },
            { name: 'probability', type: 'integer', required: true, min: 0, max: 100 },
            { name: 'expected_close_date', type: 'date', required: false },
            { name: 'stage', type: 'enum', required: true, values: ['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] },
            { name: 'created_at', type: 'timestamp', required: true },
            { name: 'updated_at', type: 'timestamp', required: true }
          ]
        }
      ],
      relationships: [
        {
          id: 'lead_opportunities',
          source: 'lead',
          target: 'opportunity',
          type: 'one-to-many',
          description: 'A lead can have multiple opportunities'
        }
      ]
    }
    
    const modelId = crypto.randomBytes(8).toString('hex')
    
    // Create the data model using the universal service
    const createdModel = await knowledgeService.createOrUpdateDataModel(projectId, modelId, businessModelData, userId)
    console.log('✅ Business data model created:', createdModel.name)
    
    // Now you can use this model in your business logic
    console.log('📊 Model can now be used in business processes:')
    console.log('   - Lead management system')
    console.log('   - Sales pipeline tracking')
    console.log('   - Reporting and analytics')
    console.log('   - Integration with CRM systems')
    
    // Cleanup
    await knowledgeService.deleteDataModel(projectId, modelId, userId)
    console.log('✅ Integration example completed')
    
  } catch (error) {
    console.error('❌ Integration error:', error.message)
  } finally {
    if (pool) {
      await pool.end()
    }
  }
}

// Export functions for use in other modules
module.exports = {
  exampleInternalUsage,
  integrateWithExistingServices
}

// Run examples if this file is executed directly
if (require.main === module) {
  exampleInternalUsage()
    .then(() => integrateWithExistingServices())
    .catch(console.error)
}
