# 🛡️ Project Assistant Suite - AI-Powered Salesforce Platform

A modular, AI-powered platform for automating typical activities within Salesforce projects. The Project Assistant Suite accompanies the entire project lifecycle – from PreSales through Solution Design to Rollout and Hypercare – and uses specialized AI agents for extraction, structuring, and generation of relevant artifacts.

## 🚀 Features

- **AI Agents**: Modular AI agents for various project phases
- **Workflow Engine**: Automated process control with FastAPI + Redis
- **Project Management**: Comprehensive overview of all Salesforce projects
- **Security**: OAuth2/OIDC, Vault integration, GDPR compliance
- **Monitoring**: Prometheus, Loki, Sentry integration
- **Modern UI**: React + TypeScript with Salesfive Design System

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** as build tool
- **Tailwind CSS** with Salesfive Design Tokens
- **React Router** for navigation
- **React Query** for state management
- **Lucide React** for icons

### Backend (planned)
- **FastAPI** (Python)
- **Langchain** for AI logic
- **Haystack** for RAG
- **Qdrant** for vector search
- **Elasticsearch** for classical search
- **PostgreSQL** + **Redis**
- **RabbitMQ** for message bus

### DevOps
- **Docker** containerization
- **Kubernetes** readiness
- **Prometheus** + **Loki** monitoring
- **Sentry** error tracking
- **Vault** secrets management

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone repository
git clone <repository-url>
cd project-assistant-suite

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🏗️ Project Structure

```
project-assistant-suite/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── contexts/           # React Contexts (Auth, etc.)
│   ├── hooks/              # Custom React Hooks
│   ├── utils/              # Helper functions
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── GeneralKnowledge.md     # Guardrails and project rules
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🎨 Design System

The UI follows the Salesfive Design System with:

- **Colors**: Digital Blue (#0025D1), Open Blue (#00D5DC), Deep Blue (#000058)
- **Typography**: Helvetica Now / Arial
- **Layout**: 260px sidebar, 1440px max-width
- **Components**: Cards, Buttons, Progress Bars, etc.

## 🔧 Development

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Pre Sales Module Control
# Set to 'true' to show Pre Sales module, 'false' to hide it
VITE_PRESALES=false
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Build preview
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint automatically
npm run type-check   # Check TypeScript types
npm run test         # Run tests
npm run storybook    # Start Storybook
```

### Code Style

- **ESLint** + **Prettier** for consistent formatting
- **TypeScript** for type safety
- **Husky** for pre-commit hooks

## 🛡️ Guardrails

The project follows strict guardrails for AI components:

1. **Technology Framework**: Open Source only, Python/TypeScript
2. **AI Logic**: Modular agents, Langchain + Haystack
3. **Workflow Control**: FastAPI + Redis, explicit triggers
4. **Security**: OAuth2/OIDC, Vault, GDPR compliance
5. **Data Management**: Versioning, Change Engine, Traceability
6. **Monitoring**: Prometheus, Loki, Sentry, User feedback

See `GeneralKnowledge.md` for detailed guidelines.

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t project-assistant-suite .

# Start container
docker run -p 3000:3000 project-assistant-suite
```

### Kubernetes
```yaml
# Deployment configuration (example)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: project-assistant-suite
spec:
  replicas: 3
  selector:
    matchLabels:
      app: project-assistant-suite
  template:
    metadata:
      labels:
        app: project-assistant-suite
    spec:
      containers:
      - name: project-assistant-suite
        image: project-assistant-suite:latest
        ports:
        - containerPort: 3000
```

## 📊 Monitoring

- **Prometheus**: Metrics collection
- **Loki**: Log aggregation
- **Sentry**: Error tracking
- **Grafana**: Dashboards (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests
4. Create a pull request

### Commit Conventions
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code formatting
- `refactor:` Code refactoring
- `test:` Add/modify tests

## 📄 License

Open Source - see LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: See `GeneralKnowledge.md`
- **Team**: Salesfive Development Team

---

**Project Assistant Suite** - Automating Salesforce projects with AI 🚀 