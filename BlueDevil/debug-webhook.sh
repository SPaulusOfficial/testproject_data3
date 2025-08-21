#!/bin/bash

# Debug Script für n8n Webhook
# Zeigt genau was gesendet wird

echo "🔍 Debug n8n Webhook"
echo "==================="

# Webhook URL
WEBHOOK_URL="http://localhost:5678/webhook-test/agent-output"

# Test Payload
PAYLOAD='{
  "documentId": "test-doc-123",
  "agentVersion": "v1.4",
  "content": "Der Kunde sendet eine Bestellung über das Web-Formular. Das System prüft die Daten automatisch und zeigt bei Fehlern eine detaillierte Fehlermeldung an."
}'

echo "📡 URL: $WEBHOOK_URL"
echo ""
echo "📦 Payload (raw):"
echo "$PAYLOAD"
echo ""
echo "📦 Payload (formatted):"
echo "$PAYLOAD" | jq '.'
echo ""

# Test with verbose output
echo "🚀 Sending request..."
echo "curl -v -X POST \"$WEBHOOK_URL\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '$PAYLOAD'"
echo ""

# Send with verbose output
curl -v -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

echo ""
echo ""
echo "🔍 Check n8n executions: http://localhost:5678/executions"
echo "🔍 Check n8n logs for detailed error messages"
