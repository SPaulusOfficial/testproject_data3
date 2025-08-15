import React, { useState } from 'react';
import AdvancedDiffViewer from '@/components/AgentVersioning/AdvancedDiffViewer';
import { 
  FileText, 
  Code, 
  GitBranch, 
  Settings, 
  Play,
  BookOpen,
  MessageSquare,
  Database
} from 'lucide-react';

interface DiffExample {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  oldValue: string;
  newValue: string;
  oldTitle?: string;
  newTitle?: string;
}

const AdvancedDiffDemo: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<string>('code');
  const [mergedContent, setMergedContent] = useState<string>('');

  // Real-world diff examples
  const diffExamples: DiffExample[] = [
    {
      id: 'code',
      title: 'Code Changes',
      description: 'JavaScript/TypeScript Code Änderungen',
      icon: <Code className="w-5 h-5" />,
      oldValue: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

class ShoppingCart {
  constructor() {
    this.items = [];
  }
  
  addItem(item) {
    this.items.push(item);
  }
}`,
      newValue: `function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}

class ShoppingCart {
  constructor() {
    this.items = [];
  }
  
  addItem(item) {
    this.items.push(item);
  }
  
  removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
  }
  
  getItemCount() {
    return this.items.length;
  }
}`,
      oldTitle: 'Original Code',
      newTitle: 'Refactored Code'
    },
    {
      id: 'document',
      title: 'Document Changes',
      description: 'Meeting Minutes & Dokumente',
      icon: <FileText className="w-5 h-5" />,
      oldValue: `Meeting Minutes - Project Kickoff

Participants: John, Sarah, Mike
Date: 2024-01-15

Agenda:
1. Project overview
2. Timeline discussion
3. Resource allocation

Decisions:
- Project will start next month
- Budget: $50,000
- Team size: 5 people

Next Steps:
- Create project plan
- Set up development environment`,
      newValue: `Meeting Minutes - Project Kickoff

Participants: John, Sarah, Mike, Lisa
Date: 2024-01-15

Agenda:
1. Project overview
2. Timeline discussion
3. Resource allocation
4. Risk assessment

Decisions:
- Project will start next month
- Budget: $75,000 (increased due to scope)
- Team size: 6 people
- Risk mitigation plan required

Next Steps:
- Create detailed project plan
- Set up development environment
- Schedule weekly status meetings
- Define success metrics`,
      oldTitle: 'Original Minutes',
      newTitle: 'Updated Minutes'
    },
    {
      id: 'config',
      title: 'Configuration Changes',
      description: 'JSON/YAML Konfigurationsdateien',
      icon: <Settings className="w-5 h-5" />,
      oldValue: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp",
    "user": "admin"
  },
  "server": {
    "port": 3000,
    "host": "0.0.0.0"
  },
  "logging": {
    "level": "info",
    "file": "app.log"
  }
}`,
      newValue: `{
  "database": {
    "host": "db.production.com",
    "port": 5432,
    "name": "myapp_prod",
    "user": "app_user",
    "ssl": true,
    "pool": {
      "min": 5,
      "max": 20
    }
  },
  "server": {
    "port": 8080,
    "host": "0.0.0.0",
    "cors": {
      "origin": ["https://myapp.com"],
      "credentials": true
    }
  },
  "logging": {
    "level": "warn",
    "file": "app.log",
    "rotation": {
      "maxSize": "10MB",
      "maxFiles": 5
    }
  },
  "monitoring": {
    "enabled": true,
    "endpoint": "/health"
  }
}`,
      oldTitle: 'Development Config',
      newTitle: 'Production Config'
    },
    {
      id: 'sql',
      title: 'Database Schema',
      description: 'SQL Schema Änderungen',
      icon: <Database className="w-5 h-5" />,
      oldValue: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
      newValue: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
      oldTitle: 'Original Schema',
      newTitle: 'Enhanced Schema'
    },
    {
      id: 'api',
      title: 'API Documentation',
      description: 'OpenAPI/Swagger Spezifikationen',
      icon: <BookOpen className="w-5 h-5" />,
      oldValue: `openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: API for user management

paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: List of users
    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                email:
                  type: string
      responses:
        '201':
          description: User created

  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: User details`,
      newValue: `openapi: 3.0.0
info:
  title: User Management API
  version: 2.0.0
  description: Enhanced API for user management with authentication

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

paths:
  /users:
    get:
      summary: Get all users
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: object
                properties:
                  users:
                    type: array
                  pagination:
                    type: object
    post:
      summary: Create user
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - username
                - email
                - password
              properties:
                username:
                  type: string
                  minLength: 3
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
                first_name:
                  type: string
                last_name:
                  type: string
      responses:
        '201':
          description: User created
        '400':
          description: Validation error
        '409':
          description: User already exists

  /users/{id}:
    get:
      summary: Get user by ID
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: User details
        '404':
          description: User not found
    put:
      summary: Update user
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                username:
                  type: string
                email:
                  type: string
                first_name:
                  type: string
                last_name:
                  type: string
      responses:
        '200':
          description: User updated
        '404':
          description: User not found`,
      oldTitle: 'API v1.0',
      newTitle: 'API v2.0'
    }
  ];

  const currentExample = diffExamples.find(ex => ex.id === selectedExample) || diffExamples[0];

  const handleMerge = (mergedContent: string) => {
    setMergedContent(mergedContent);
    // In a real application, you would save this to your backend
    console.log('Merged content:', mergedContent);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Diff Demo
          </h1>
          <p className="text-gray-600">
            Professionelle Diff-Funktionalität mit bewährten Libraries und verschiedenen Anwendungsfällen
          </p>
        </div>

        {/* Example Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Beispiele auswählen:</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {diffExamples.map((example) => (
              <button
                key={example.id}
                onClick={() => setSelectedExample(example.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedExample === example.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-blue-600">
                    {example.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{example.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{example.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Example Info */}
        <div className="mb-6 bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-blue-600">
              {currentExample.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {currentExample.title}
            </h3>
          </div>
          <p className="text-gray-600 text-sm">
            {currentExample.description}
          </p>
        </div>

        {/* Advanced Diff Viewer */}
        <AdvancedDiffViewer
          diffData={{
            oldValue: currentExample.oldValue,
            newValue: currentExample.newValue,
            oldTitle: currentExample.oldTitle,
            newTitle: currentExample.newTitle
          }}
          onMerge={handleMerge}
        />

        {/* Merge Result */}
        {mergedContent && (
          <div className="mt-6 bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Merge Ergebnis
            </h3>
            <div className="bg-gray-50 border rounded-lg p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                {mergedContent}
              </pre>
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Professionelle Libraries</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Nutzt bewährte Diff-Libraries wie <code>diff</code> und <code>react-diff-viewer-continued</code> 
              für robuste und getestete Funktionalität.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Verschiedene Diff-Methoden</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Unterstützt Word-level, Line-level, Character-level und professionelle Split/Unified Views 
              für verschiedene Anwendungsfälle.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Real-World Beispiele</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Zeigt praktische Anwendungsfälle: Code-Refactoring, Dokumentenänderungen, 
              Konfigurationsupdates und API-Evolutionen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDiffDemo;
