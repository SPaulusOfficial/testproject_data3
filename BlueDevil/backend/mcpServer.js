const { Server } = require('@modelcontextprotocol/sdk/server/index.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const { CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js')
const KnowledgeService = require('./knowledgeService.js')
const { Pool } = require('pg')

class KnowledgeMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'salesfive-knowledge-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    // Initialize database connection
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/salesfive_ai_platform',
    })

    this.knowledgeService = new KnowledgeService(this.pool)

    this.setupTools()
  }

  setupTools() {
    // Tool: Submit document to knowledge base
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'submit_document':
            return await this.handleSubmitDocument(args)
          case 'submit_text':
            return await this.handleSubmitText(args)
          case 'submit_file':
            return await this.handleSubmitFile(args)
          case 'list_projects':
            return await this.handleListProjects(args)
          case 'list_folders':
            return await this.handleListFolders(args)
          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        console.error(`Error in tool ${name}:`, error)
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        }
      }
    })
  }

  async handleSubmitDocument(args) {
    const { project_id, agent_id, agent_name, title, content, target_folder_id, metadata } = args

    if (!project_id || !agent_id || !title) {
      throw new Error('Missing required parameters: project_id, agent_id, title')
    }

    const submission = {
      type: 'document',
      title,
      content: content || '',
      target_folder_id: target_folder_id || null,
      metadata: metadata || {},
      file: null
    }

    const result = await this.knowledgeService.submitDocument(
      project_id,
      agent_id,
      agent_name || 'Unknown Agent',
      submission
    )

    return {
      content: [
        {
          type: 'text',
          text: `Document submitted successfully! Submission ID: ${result.id}\n\nTitle: ${title}\nStatus: ${result.status}\nCreated: ${result.created_at}`,
        },
      ],
    }
  }

  async handleSubmitText(args) {
    const { project_id, agent_id, agent_name, title, text, target_folder_id, metadata } = args

    if (!project_id || !agent_id || !title || !text) {
      throw new Error('Missing required parameters: project_id, agent_id, title, text')
    }

    const submission = {
      type: 'text',
      title,
      content: text,
      target_folder_id: target_folder_id || null,
      metadata: metadata || {},
      file: null
    }

    const result = await this.knowledgeService.submitDocument(
      project_id,
      agent_id,
      agent_name || 'Unknown Agent',
      submission
    )

    return {
      content: [
        {
          type: 'text',
          text: `Text submitted successfully! Submission ID: ${result.id}\n\nTitle: ${title}\nContent length: ${text.length} characters\nStatus: ${result.status}\nCreated: ${result.created_at}`,
        },
      ],
    }
  }

  async handleSubmitFile(args) {
    const { project_id, agent_id, agent_name, title, file_path, file_name, mime_type, target_folder_id, metadata } = args

    if (!project_id || !agent_id || !title || !file_path) {
      throw new Error('Missing required parameters: project_id, agent_id, title, file_path')
    }

    // Read file from path
    const fs = require('fs').promises
    let fileBuffer
    try {
      fileBuffer = await fs.readFile(file_path)
    } catch (error) {
      throw new Error(`Could not read file at ${file_path}: ${error.message}`)
    }

    const submission = {
      type: 'file',
      title,
      content: null,
      target_folder_id: target_folder_id || null,
      metadata: metadata || {},
      file: {
        buffer: fileBuffer,
        originalname: file_name || path.basename(file_path),
        mimetype: mime_type || 'application/octet-stream',
        size: fileBuffer.length
      }
    }

    const result = await this.knowledgeService.submitDocument(
      project_id,
      agent_id,
      agent_name || 'Unknown Agent',
      submission
    )

    return {
      content: [
        {
          type: 'text',
          text: `File submitted successfully! Submission ID: ${result.id}\n\nTitle: ${title}\nFile: ${file_name || path.basename(file_path)}\nSize: ${fileBuffer.length} bytes\nStatus: ${result.status}\nCreated: ${result.created_at}`,
        },
      ],
    }
  }

  async handleListProjects(args) {
    const result = await this.pool.query(
      'SELECT id, name, slug, description FROM projects WHERE is_active = true ORDER BY name'
    )

    const projects = result.rows.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description
    }))

    return {
      content: [
        {
          type: 'text',
          text: `Available projects:\n\n${projects.map(p => `- ${p.name} (${p.slug})\n  ID: ${p.id}\n  Description: ${p.description || 'No description'}`).join('\n\n')}`,
        },
      ],
    }
  }

  async handleListFolders(args) {
    const { project_id } = args

    if (!project_id) {
      throw new Error('Missing required parameter: project_id')
    }

    const folders = await this.knowledgeService.getFolders(project_id)

    if (folders.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No folders found for project ${project_id}. You can submit documents without specifying a target folder.`,
          },
        ],
      }
    }

    const folderList = folders.map(f => 
      `- ${f.name}\n  ID: ${f.id}\n  Path: ${f.path}\n  Documents: ${f.document_count}\n  Subfolders: ${f.subfolder_count}`
    ).join('\n\n')

    return {
      content: [
        {
          type: 'text',
          text: `Available folders in project:\n\n${folderList}`,
        },
      ],
    }
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Salesfive Knowledge MCP Server started')
  }

  async stop() {
    await this.pool.end()
    console.error('Salesfive Knowledge MCP Server stopped')
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new KnowledgeMCPServer()
  
  server.start().catch((error) => {
    console.error('Failed to start MCP server:', error)
    process.exit(1)
  })

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.error('Shutting down MCP server...')
    await server.stop()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.error('Shutting down MCP server...')
    await server.stop()
    process.exit(0)
  })
}

module.exports = KnowledgeMCPServer
