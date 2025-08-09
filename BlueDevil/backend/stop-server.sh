#!/bin/bash

# Server stop script
echo "🛑 Stopping backend server..."

# Check if PID file exists
if [ -f logs/server.pid ]; then
    SERVER_PID=$(cat logs/server.pid)
    
    # Check if process is still running
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        echo "📝 Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID
        
        # Wait for process to stop
        sleep 2
        
        # Check if process stopped
        if ps -p $SERVER_PID > /dev/null 2>&1; then
            echo "⚠️  Server didn't stop gracefully, forcing shutdown..."
            kill -9 $SERVER_PID
        fi
        
        echo "✅ Server stopped successfully"
    else
        echo "⚠️  Server process not found (PID: $SERVER_PID)"
    fi
    
    # Remove PID file
    rm -f logs/server.pid
else
    echo "⚠️  No PID file found"
fi

# Check if server is still responding
if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
    echo "⚠️  Server is still responding on port 3002"
    echo "   You may need to manually kill the process:"
    echo "   lsof -ti:3002 | xargs kill -9"
else
    echo "✅ Server is no longer responding on port 3002"
fi
