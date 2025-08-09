#!/bin/bash

# Server monitoring script
echo "🔍 Starting server monitor..."

# Set debug environment variables
export DEBUG=server:*
export NODE_ENV=development

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to start server
start_server() {
    echo "🚀 Starting server at $(date)"
    node server.js 2>&1 | tee -a logs/server-monitor.log
}

# Function to check if server is running
check_server() {
    if curl -s http://localhost:3002/api/health > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Main monitoring loop
while true; do
    echo "🔍 Checking server status..."
    
    if check_server; then
        echo "✅ Server is running"
        sleep 30  # Check every 30 seconds
    else
        echo "❌ Server is down, restarting..."
        start_server &
        sleep 5   # Wait a bit before checking again
    fi
done
