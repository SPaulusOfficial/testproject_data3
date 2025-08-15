import React, { useState, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'system' | 'agent';
  timestamp: string;
  metadata?: {
    agentVersion?: string;
    confidence?: number;
    hasChanges?: boolean;
    autoMerged?: boolean;
    strategy?: string;
  };
}

interface SimpleChatProps {
  workflowId: string;
  sessionId: string;
  onMessageSend: (message: string) => Promise<void>;
}

const SimpleChat: React.FC<SimpleChatProps> = ({
  workflowId,
  sessionId,
  onMessageSend
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection
    const mockWebSocket = {
      onmessage: (event: any) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'agent_output') {
          setMessages(prev => [...prev, {
            id: data.id,
            content: `Agent ${data.agentVersion} hat Output generiert`,
            sender: 'system',
            timestamp: data.timestamp,
            metadata: {
              agentVersion: data.agentVersion,
              confidence: data.confidence,
              hasChanges: data.hasChanges
            }
          }]);
        }
        
        if (data.type === 'merge_suggestion') {
          setMessages(prev => [...prev, {
            id: data.id,
            content: `Merge-Vorschlag verfügbar (Confidence: ${data.confidence}%)`,
            sender: 'system',
            timestamp: data.timestamp,
            metadata: {
              confidence: data.confidence,
              autoMerged: data.autoMerged,
              strategy: data.strategy
            }
          }]);
        }
      }
    };

    // Simulate incoming messages for demo
    setTimeout(() => {
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'agent_output',
          id: '1',
          agentVersion: 'v1.3',
          confidence: 0.85,
          hasChanges: true,
          timestamp: new Date().toISOString()
        })
      });
    }, 1000);

    setTimeout(() => {
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'merge_suggestion',
          id: '2',
          confidence: 0.78,
          autoMerged: true,
          strategy: 'balanced',
          timestamp: new Date().toISOString()
        })
      });
    }, 3000);

    return () => {
      // Cleanup WebSocket connection
    };
  }, [workflowId, sessionId]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setIsTyping(true);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      await onMessageSend(inputMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="simple-chat bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="chat-header bg-gradient-to-r from-digital-blue to-deep-blue-2 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">Agent Versioning Chat</h3>
        <div className="text-sm opacity-80">
          Workflow: {workflowId} | Session: {sessionId}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container h-96 overflow-y-auto p-4 space-y-3">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender} flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`message-bubble max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.sender === 'user' 
                ? 'bg-digital-blue text-white' 
                : message.sender === 'agent'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              <div className="message-content text-sm">
                {message.content}
              </div>
              
              {message.metadata && (
                <div className="message-metadata mt-2 text-xs opacity-75">
                  {message.metadata.agentVersion && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Agent:</span>
                      <span className="bg-blue-100 text-blue-800 px-1 rounded text-xs">
                        {message.metadata.agentVersion}
                      </span>
                    </div>
                  )}
                  
                  {message.metadata.confidence && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Confidence:</span>
                      <span className={`px-1 rounded text-xs ${
                        message.metadata.confidence > 0.8 
                          ? 'bg-green-100 text-green-800'
                          : message.metadata.confidence > 0.6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(message.metadata.confidence * 100)}%
                      </span>
                    </div>
                  )}
                  
                  {message.metadata.autoMerged && (
                    <div className="flex items-center gap-1">
                      <span className="bg-green-100 text-green-800 px-1 rounded text-xs font-medium">
                        Auto-merged
                      </span>
                    </div>
                  )}
                  
                  {message.metadata.strategy && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Strategy:</span>
                      <span className="bg-purple-100 text-purple-800 px-1 rounded text-xs">
                        {message.metadata.strategy}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="message-timestamp mt-1 text-xs opacity-60">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message system flex justify-start">
            <div className="message-bubble bg-gray-100 text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="typing-indicator flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">Processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-digital-blue focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || !inputMessage.trim()}
            className="px-4 py-2 bg-digital-blue text-white rounded-md hover:bg-deep-blue-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleChat;
