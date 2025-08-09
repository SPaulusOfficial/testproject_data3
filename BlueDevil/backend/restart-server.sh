#!/bin/bash

# Server restart script
echo "🔄 Restarting backend server..."

# Stop server if running
if [ -f stop-server.sh ]; then
    ./stop-server.sh
else
    echo "⚠️  stop-server.sh not found, trying to kill process manually..."
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
fi

# Wait a moment
sleep 2

# Start server
if [ -f start-server.sh ]; then
    ./start-server.sh
else
    echo "❌ start-server.sh not found"
    exit 1
fi
