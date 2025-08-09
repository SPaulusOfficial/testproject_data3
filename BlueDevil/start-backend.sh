#!/bin/bash

# Load environment variables
export VITE_DB_HOST=localhost
export VITE_DB_PORT=5434
export VITE_DB_NAME=platform_db
export VITE_DB_USER=cas_user
export VITE_DB_PASSWORD=secure_password
export VITE_DB_SSL_MODE=false

# Start the backend server
echo "🚀 Starting backend server with PostgreSQL connection..."
node backend/server.js

