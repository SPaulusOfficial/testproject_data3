#!/bin/bash

# Salesfive Knowledge MCP Server Startup Script

echo "🚀 Starting Salesfive Knowledge MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the MCP server file exists
if [ ! -f "mcpServer.js" ]; then
    echo "❌ MCP server file not found. Please ensure mcpServer.js exists."
    exit 1
fi

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:password@localhost:5432/salesfive_ai_platform"}

echo "📊 Environment: $NODE_ENV"
echo "🗄️  Database: $DATABASE_URL"

# Start the MCP server
echo "🔧 Starting MCP server..."
node mcpServer.js

echo "✅ MCP server stopped."
