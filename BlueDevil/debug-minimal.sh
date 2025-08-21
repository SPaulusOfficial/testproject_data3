#!/bin/bash

echo "🔍 Minimal Debug Test"
echo "===================="

# Test minimal debug workflow
curl -X POST http://localhost:5678/debug-test \
  -H "Content-Type: application/json" \
  -d '{"hello": "world", "test": "data"}' \
  -v

echo ""
echo "🔍 Check n8n executions for console.log output"
echo "🔍 URL: http://localhost:5678/executions"
