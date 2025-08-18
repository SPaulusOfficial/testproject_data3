// n8n Chat Configuration
export interface N8nChatConfig {
  instanceId: string
  apiKey: string
  baseUrl: string
  theme: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    border: string
  }
  features?: {
    voiceInput?: boolean
    fileUpload?: boolean
    contextAwareness?: boolean
  }
}

// Environment-based configuration
const getN8nChatConfig = (): N8nChatConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return {
    instanceId: process.env.N8N_INSTANCE_ID || '632ee028-b763-48bf-b1d8-1b002d98325e',
    apiKey: process.env.N8N_API_KEY || (isDevelopment ? 'dev-api-key' : ''),
    baseUrl: process.env.N8N_BASE_URL || (isDevelopment ? 'http://localhost:3000/api/n8n/chat' : 'https://your-n8n-instance.com'),
    theme: {
      primary: '#1e40af', // digital-blue
      secondary: '#1e3a8a', // deep-blue-2
      accent: '#3b82f6', // open-blue
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb'
    },
    features: {
      voiceInput: true,
      fileUpload: true,
      contextAwareness: true
    }
  }
}

// Simplified config for direct n8n chat usage
export const getSimpleN8nConfig = () => ({
  url: 'http://localhost:3000/api/n8n/chat',
  // Add any additional n8n chat specific options here
})

// Default configuration
export const n8nChatConfig = getN8nChatConfig()

// Helper function to get CSS variables for n8n chat styling
export const getN8nChatCSSVariables = () => ({
  '--n8n-chat-primary': n8nChatConfig.theme.primary,
  '--n8n-chat-secondary': n8nChatConfig.theme.secondary,
  '--n8n-chat-accent': n8nChatConfig.theme.accent,
  '--n8n-chat-background': n8nChatConfig.theme.background,
  '--n8n-chat-text': n8nChatConfig.theme.text,
  '--n8n-chat-border': n8nChatConfig.theme.border
} as React.CSSProperties)

// Validation function
export const validateN8nChatConfig = (config: N8nChatConfig): boolean => {
  return !!(
    config.instanceId &&
    config.apiKey &&
    config.baseUrl &&
    config.theme.primary &&
    config.theme.secondary
  )
}

// Error handling
export const handleN8nChatError = (error: any): void => {
  console.error('n8n Chat Error:', error)
  
  // Handle specific error types
  if (error.code === 'AUTH_FAILED') {
    console.error('Authentication failed. Please check your API key.')
  } else if (error.code === 'CONNECTION_FAILED') {
    console.error('Connection to n8n failed. Please check your base URL.')
  } else if (error.code === 'INSTANCE_NOT_FOUND') {
    console.error('n8n instance not found. Please check your instance ID.')
  }
}
