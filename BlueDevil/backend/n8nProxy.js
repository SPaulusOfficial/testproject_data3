// n8n Chat Proxy - Avoids CORS issues by proxying requests through our backend
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

// CORS configuration for n8n proxy
router.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// n8n Chat Proxy Configuration
const N8N_BASE_URL = 'http://localhost:5678';
const N8N_CHAT_WEBHOOK = '/webhook/632ee028-b763-48bf-b1d8-1b002d98325e/chat';

// Proxy middleware for n8n chat
const n8nProxy = createProxyMiddleware({
  target: N8N_BASE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/n8n/chat': N8N_CHAT_WEBHOOK
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔗 Proxying n8n request: ${req.method} ${req.path} -> ${N8N_BASE_URL}${N8N_CHAT_WEBHOOK}`);
    
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ n8n proxy response: ${proxyRes.statusCode}`);
    
    // Add CORS headers to response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
  },
  onError: (err, req, res) => {
    console.error('❌ n8n proxy error:', err.message);
    res.status(500).json({
      error: 'n8n proxy error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// n8n chat proxy endpoint with fallback
router.post('/api/n8n/chat', async (req, res) => {
  try {
    console.log('🔄 n8n chat request received:', req.body);
    
    // Extract session ID from various possible locations
    let sessionId = req.body.sessionId || req.body.metadata?.sessionId;
    
    // Check for session ID in chat session key format
    if (!sessionId) {
      for (const [key, value] of Object.entries(req.body)) {
        if (key === 'sessionId' || key.startsWith('chat-session-')) {
          sessionId = value;
          break;
        }
      }
    }
    
    const context = req.body.metadata?.context;
    
    // Check if this is a loadPreviousSession request
    if (req.body.action === 'loadPreviousSession') {
      console.log('📥 Loading previous session for:', sessionId);
      
      const loadResponse = await fetch(`${N8N_BASE_URL}${N8N_CHAT_WEBHOOK}?action=loadPreviousSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'loadPreviousSession',
          sessionId: sessionId 
        })
      });
      
      if (loadResponse.ok) {
        const loadData = await loadResponse.json();
        console.log('✅ Loaded previous session:', loadData);
        res.json(loadData);
      } else {
        console.log('❌ Failed to load previous session, returning empty');
        res.json({
          messages: [],
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        });
      }
      return;
    }
    
    // Prepare request body for n8n
    const n8nRequestBody = {
      ...req.body,
      sessionId: sessionId,
      context: context
    };
    
    console.log('📤 Forwarding to n8n with session:', sessionId);
    
    // Try to forward to n8n
    const response = await fetch(`${N8N_BASE_URL}${N8N_CHAT_WEBHOOK}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nRequestBody)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ n8n response:', data);
      res.json(data);
    } else {
      console.log('❌ n8n workflow error, using fallback');
      // Fallback response when n8n workflow fails
      res.json({
        response: `Ich habe Ihre Nachricht "${req.body.message || req.body.chatInput}" erhalten. Der n8n Workflow ist derzeit nicht verfügbar, aber ich kann Ihnen trotzdem helfen!`,
        timestamp: new Date().toISOString(),
        source: 'fallback',
        sessionId: sessionId
      });
    }
  } catch (error) {
    console.error('❌ n8n proxy error:', error);
    // Fallback response when n8n is unreachable
    res.json({
      response: `Entschuldigung, ich konnte Ihre Nachricht "${req.body.message || req.body.chatInput}" nicht verarbeiten. Bitte versuchen Sie es später erneut.`,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      error: error.message
    });
  }
});

// Health check endpoint for n8n
router.get('/api/n8n/health', async (req, res) => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/healthz`);
    if (response.ok) {
      res.json({ status: 'ok', n8n: 'available' });
    } else {
      res.status(503).json({ status: 'error', n8n: 'unavailable' });
    }
  } catch (error) {
    console.error('n8n health check failed:', error);
    res.status(503).json({ 
      status: 'error', 
      n8n: 'unavailable',
      error: error.message 
    });
  }
});

// n8n configuration endpoint
router.get('/api/n8n/config', (req, res) => {
  res.json({
    baseUrl: N8N_BASE_URL,
    chatWebhook: N8N_CHAT_WEBHOOK,
    proxyUrl: '/api/n8n/chat',
    healthUrl: '/api/n8n/health'
  });
});

module.exports = router;
