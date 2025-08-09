#!/bin/bash

# Debug start script for the backend server
echo "🔧 Starting backend server in debug mode..."

# Set debug environment variables
export DEBUG=server:*
export NODE_ENV=development

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the server with enhanced logging
echo "📝 Starting server with debug logging..."
echo "📁 Logs will be written to: $(pwd)/logs/"
echo "🔍 Debug mode enabled for all server modules"

# Start the server
node server.js 2>&1 | tee logs/server-debug.log

echo "✅ Server stopped"
