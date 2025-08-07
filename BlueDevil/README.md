# 🛡️ Project Assistant Suite - AI-gestützte Salesforce-Plattform

Eine modulare, AI-gestützte Plattform zur Automatisierung von typischen Tätigkeiten im Rahmen von Salesforce-Projekten. Die Project Assistant Suite begleitet den gesamten Projektlebenszyklus – von PreSales über Solution Design bis zu Rollout und Hypercare – und nutzt spezialisierte AI-Agenten zur Extraktion, Strukturierung und Generierung relevanter Artefakte.

## 🚀 Features

- **AI-Agenten**: Modulare KI-Agenten für verschiedene Projektphasen
- **Workflow Engine**: Automatisierte Prozesssteuerung mit FastAPI + Redis
- **Projektverwaltung**: Umfassende Übersicht über alle Salesforce-Projekte
- **Sicherheit**: OAuth2/OIDC, Vault-Integration, DSGVO-Compliance
- **Monitoring**: Prometheus, Loki, Sentry Integration
- **Moderne UI**: React + TypeScript mit Salesfive Design System

## 🛠️ Technologie-Stack

### Frontend
- **React 18** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS** mit Salesfive Design Tokens
- **React Router** für Navigation
- **React Query** für State Management
- **Lucide React** für Icons

### Backend (geplant)
- **FastAPI** (Python)
- **Langchain** für KI-Logik
- **Haystack** für RAG
- **Qdrant** für Vektorsuche
- **Elasticsearch** für klassische Suche
- **PostgreSQL** + **Redis**
- **RabbitMQ** für Message Bus

### DevOps
- **Docker** Containerisierung
- **Kubernetes** Bereitschaft
- **Prometheus** + **Loki** Monitoring
- **Sentry** Error Tracking
- **Vault** Secrets Management

## 📦 Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn

### Setup
```bash
# Repository klonen
git clone <repository-url>
cd project-assistant-suite

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Build für Produktion
npm run build
```

## 🏗️ Projektstruktur

```
project-assistant-suite/
├── src/
│   ├── components/          # Wiederverwendbare UI-Komponenten
│   ├── pages/              # Hauptseiten der Anwendung
│   ├── contexts/           # React Contexts (Auth, etc.)
│   ├── hooks/              # Custom React Hooks
│   ├── utils/              # Hilfsfunktionen
│   ├── types/              # TypeScript Typdefinitionen
│   ├── App.tsx             # Haupt-App-Komponente
│   ├── main.tsx            # Einstiegspunkt
│   └── index.css           # Globale Styles
├── public/                 # Statische Assets
├── GeneralKnowledge.md     # Guardrails und Projektregeln
├── package.json            # Dependencies und Scripts
├── tailwind.config.js      # Tailwind Konfiguration
├── tsconfig.json           # TypeScript Konfiguration
└── vite.config.ts          # Vite Konfiguration
```

## 🎨 Design System

Die UI folgt dem Salesfive Design System mit:

- **Farben**: Digital Blue (#0025D1), Open Blue (#00D5DC), Deep Blue (#000058)
- **Typografie**: Helvetica Now / Arial
- **Layout**: 260px Sidebar, 1440px max-width
- **Komponenten**: Cards, Buttons, Progress Bars, etc.

## 🔧 Entwicklung

### Umgebungsvariablen

Erstelle eine `.env` Datei im Root-Verzeichnis mit folgenden Variablen:

```bash
# Pre Sales Module Control
# Set to 'true' to show Pre Sales module, 'false' to hide it
VITE_PRESALES=false
```

### Verfügbare Scripts

```bash
npm run dev          # Entwicklungsserver starten
npm run build        # Produktions-Build
npm run preview      # Build-Vorschau
npm run lint         # ESLint ausführen
npm run lint:fix     # ESLint automatisch beheben
npm run type-check   # TypeScript Typen prüfen
npm run test         # Tests ausführen
npm run storybook    # Storybook starten
```

### Code-Style

- **ESLint** + **Prettier** für konsistente Formatierung
- **TypeScript** für Typsicherheit
- **Husky** für Pre-commit Hooks

## 🛡️ Guardrails

Das Projekt folgt strikten Guardrails für KI-Komponenten:

1. **Technologischer Rahmen**: Nur Open Source, Python/TypeScript
2. **KI-Logik**: Modulare Agenten, Langchain + Haystack
3. **Workflow-Steuerung**: FastAPI + Redis, explizite Trigger
4. **Sicherheit**: OAuth2/OIDC, Vault, DSGVO-Compliance
5. **Datenhaltung**: Versionierung, Change Engine, Traceability
6. **Monitoring**: Prometheus, Loki, Sentry, User-Feedback

Siehe `GeneralKnowledge.md` für detaillierte Richtlinien.

## 🚀 Deployment

### Docker
```bash
# Image bauen
docker build -t project-assistant-suite .

# Container starten
docker run -p 3000:3000 project-assistant-suite
```

### Kubernetes
```yaml
# Deployment-Konfiguration (Beispiel)
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

- **Prometheus**: Metriken-Sammlung
- **Loki**: Log-Aggregation
- **Sentry**: Error Tracking
- **Grafana**: Dashboards (geplant)

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Führe Tests aus
4. Erstelle einen Pull Request

### Commit-Konventionen
- `feat:` Neue Features
- `fix:` Bug-Fixes
- `docs:` Dokumentation
- `style:` Code-Formatierung
- `refactor:` Code-Refactoring
- `test:` Tests hinzufügen/ändern

## 📄 Lizenz

Open Source - siehe LICENSE-Datei für Details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Dokumentation**: Siehe `GeneralKnowledge.md`
- **Team**: Salesfive Development Team

---

**Project Assistant Suite** - Automatisierung von Salesforce-Projekten mit KI 🚀 