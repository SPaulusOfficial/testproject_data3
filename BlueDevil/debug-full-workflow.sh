#!/bin/bash

echo "🔍 Debug Full Workflow"
echo "====================="

# Test with complete payload
curl -X POST http://localhost:5678/webhook-test/agent-output \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "debug-doc-123",
    "agentVersion": "v1.4",
    "content": "Der Kunde sendet eine Bestellung über das Web-Formular. Das System prüft die Daten automatisch und zeigt bei Fehlern eine detaillierte Fehlermeldung an."
  }' \
  -v

echo ""
echo "🔍 Check n8n executions for console.log output"
echo "🔍 URL: http://localhost:5678/executions"
echo ""
echo "📋 Expected flow:"
echo "1. Webhook Receiver"
echo "2. Load Previous Version"
echo "3. Generate Diff"
echo "4. Merge Agent"
echo "5. Store Result"
echo "6. Notify UI (Demo)"
echo "7. Webhook Response"
