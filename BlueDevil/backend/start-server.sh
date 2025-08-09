#!/bin/bash

# Server start script
echo "🚀 Starting backend server..."

# Set environment variables
export NODE_ENV=development
export DEBUG=server:*

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if server is already running
if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "⚠️  Server is already running on port 3002"
    echo "   To stop the server: ./stop-server.sh"
    echo "   To view logs: tail -f logs/server.log"
    exit 0
fi

# Start server in background
echo "📝 Starting server in background..."
nohup node server.js > logs/server.log 2>&1 &

# Get the process ID
SERVER_PID=$!
echo $SERVER_PID > logs/server.pid

# Wait a moment for server to start
sleep 3

# Check if server started successfully
if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "✅ Server started successfully!"
    echo "   Process ID: $SERVER_PID"
    echo "   Logs: logs/server.log"
    echo "   Health Check: http://localhost:3002/api/health"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: tail -f logs/server.log"
    echo "   Stop server: ./stop-server.sh"
    echo "   Restart server: ./restart-server.sh"
else
    echo "❌ Server failed to start"
    echo "   Check logs: tail -f logs/server.log"
    exit 1
fi
