import { Routes, Route, useLocation } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { DemoAuthProvider } from '@/contexts/DemoAuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Dashboard } from '@/pages/Dashboard'
import { Agents } from '@/pages/Agents'
import { Projects } from '@/pages/Projects'
import { Workflows } from '@/pages/Workflows'
import { SettingsPage } from '@/pages/Settings'
// Platzhalter-Imports für Pre Sales Funktionen
import { VideoZuText } from '@/pages/rampup/VideoZuText'
import { AudioZuText } from '@/pages/rampup/AudioZuText'
import Workshops from '@/pages/rampup/Workshops'
import WorkshopDetail from '@/pages/rampup/WorkshopDetail'
import { ArchitekturSketch } from '@/pages/rampup/ArchitekturSketch'
import { ProjektplanSketch } from '@/pages/rampup/ProjektplanSketch'
import { RfPQuestionsExtract } from '@/pages/rampup/RfPQuestionsExtract'
import { RfPQuestionsAIAnswers } from '@/pages/rampup/RfPQuestionsAIAnswers'
import { StakeholderRollendefinition } from '@/pages/rampup/StakeholderRollendefinition'
import ConsentPage from '@/pages/ConsentPage'
import ProjectParticipants from '@/pages/ProjectParticipants'
import DataModelingAssistDemo from '@/pages/solution/DataModelingAssistDemo';
import ProcessMiningDemo from '@/pages/solution/ProcessMiningDemo';
import SolutionDashboardDemo from '@/pages/solution/SolutionDashboardDemo';
import DataModelSetup from '@/pages/build/DataModelSetup';
import { DashboardInfoButtons } from '@/components/DashboardInfoButtons'

// Wrapper-Komponente für Info-Buttons
const PageWithInfo = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  
  // Dashboard-spezifische Info-Buttons
  if (location.pathname === '/') {
    return (
      <Layout>
        <div className="relative">
          {children}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <DashboardInfoButtons />
          </div>
        </div>
      </Layout>
    )
  }
  
  // Info-Button für andere Seiten
  const getPageInfo = (pathname: string) => {
    const pageInfoMap: Record<string, { title: string; content: string }> = {
      '/agents': {
        title: 'AI Agents',
        content: 'Manage all available AI agents and their status here. Each agent is a specialized AI module that automates specific tasks. The agents use advanced AI technologies like Langchain and Haystack for RAG (Retrieval-Augmented Generation) to generate intelligent responses and solutions. You can activate, deactivate agents and monitor their performance. The agents communicate via REST APIs and are fully containerized for maximum scalability.'
      },
      '/projects': {
        title: 'Projects',
        content: 'Centralized management of all Salesforce projects with AI-powered project monitoring. Create new projects, monitor progress in real-time and manage project participants. The system uses AI algorithms for automatic progress calculation, risk detection and resource optimization. Integrated workflow engines enable automation of project processes, while AI-powered analytics help you identify bottlenecks early and act proactively.'
      },
      '/workflows': {
        title: 'Workflows',
        content: 'Define and manage intelligent, automated workflows for your projects. The workflow engine is based on FastAPI and Redis and enables complex process automation with AI-supported decision making. Workflows can start on explicit triggers and are fully persistent and versionable. AI agents continuously analyze workflow performance and suggest optimizations. No silent skipping of phases allowed - every step is logged and traceable.'
      },
      '/settings': {
        title: 'Settings',
        content: 'Configure your personal settings, notifications and portal preferences here. The system supports OAuth2/OIDC for secure authentication and Vault for secure management of secrets and tokens. GDPR-compliant settings enable control over data processing and deletion. AI-powered personalization learns from your usage patterns and adapts the user interface accordingly.'
      },
      '/pre-sales/knowledge/video-zu-text': {
        title: 'Video to Text',
        content: 'Convert video recordings automatically into structured text with advanced AI technology. The system uses state-of-the-art Speech-to-Text algorithms that can recognize different languages and dialects. In addition to transcription, speaker recognition, sentiment analysis and keyword extraction are also performed. Ideal for workshops, presentations and meetings. The AI can automatically create summaries, extract action items and highlight important points. Supports various video formats and offers real-time transcription for live events.'
      },
      '/pre-sales/knowledge/audio-zu-text': {
        title: 'Audio to Text',
        content: 'Transcribe audio recordings into text with AI-powered speech recognition. The system supports various audio formats and languages with high accuracy. Advanced AI algorithms filter background noise, recognize different speakers and automatically extract keywords and topics. The transcription can be exported to various formats and offers timestamps for easy navigation. Additionally, sentiment analysis and language recognition are performed to better understand the context.'
      },
      '/pre-sales/knowledge/workshops': {
        title: 'Workshops',
        content: 'Manage workshops and their results with AI-powered analysis. Create new workshops, invite participants and use AI for automatic evaluation of workshop results. The system can automatically perform topic clustering, recognize priorities and extract action items. AI-powered moderation supports workshop execution while automatic summaries and reports are created. The platform supports various workshop formats and offers templates for recurring workshop types.'
      },

      '/pre-sales/rfp-questions/extract': {
        title: 'RfP Questions Extraction',
        content: 'Automatically extract questions from Request for Proposals (RfPs) with AI-powered text analysis. The system uses advanced NLP algorithms to identify, categorize and structure questions. The AI recognizes different question types (technical, functional, commercial) and automatically assigns them. Additionally, priorities, dependencies and complexity levels are automatically assessed. The system can also recognize hidden requirements and implicit questions that are not explicitly formulated as questions. Export functions enable further processing in other tools.'
      },
      '/pre-sales/rfp-questions/ai-answers': {
        title: 'AI-Powered Answers',
        content: 'Automatically generate answers to RfP questions based on your project information and best practices. The system uses Retrieval-Augmented Generation (RAG) with Langchain and Haystack to find the most relevant information from your knowledge base and generate tailored answers. The AI considers project context, technical specifications and historical success factors. Automatic quality checks and plausibility controls ensure that the generated answers are accurate and complete. The system can also suggest alternative answer variants and set priorities for answering.'
      },
      '/pre-sales/project-designer/architektur-sketch': {
        title: 'Architecture Sketch',
        content: 'Create initial architecture sketches for your Salesforce projects with AI support. The system analyzes your requirements and automatically generates architecture suggestions based on best practices and proven patterns. The AI considers scalability, performance, security and maintainability. Visualization tools automatically create diagrams and documentation. The system can also suggest alternative architectures and weigh pros and cons. Integration with other tools enables seamless further processing of architectural decisions.'
      },
      '/pre-sales/project-designer/projektplan-sketch': {
        title: 'Project Plan Sketch',
        content: 'Develop project plans and timelines with automated suggestions based on project requirements. The AI analyzes historical project data to generate realistic schedules and resource requirements. Automatic risk detection identifies potential bottlenecks and suggests buffer times. The system can simulate various scenarios and calculate their impact on schedule and budget. Integration with team management tools enables automatic assignment of tasks and resources. Continuous optimization based on project progress.'
      },
      '/pre-sales/project-designer/stakeholder-rollendefinition': {
        title: 'Stakeholder & Role Definition',
        content: 'Define stakeholders, roles and responsibilities for your project with AI-powered analysis. The system can automatically extract stakeholders from project requirements and assess their influence and interests. AI-powered role definition suggests optimal responsibility areas and identifies potential conflicts. The system supports creation of RACI matrices and communication plans. Automatic notifications and escalation rules can be configured based on roles and responsibilities.'
      },
      '/solution/data-modeling/design': {
        title: 'Data Model Design',
        content: 'Design data models for your Salesforce implementation with automated suggestions. The AI analyzes your requirements and generates optimal data models based on Salesforce Best Practices. The system considers scalability, performance and maintainability. Automatic validation against Salesforce limits and best practices. The AI can also suggest alternative model variants and explain their pros and cons. Integration with Schema Builder and Data Loader for seamless implementation. Continuous optimization based on usage data.'
      },

      '/solution/process-mining/bpmn-analysis': {
        title: 'Process Mining',
        content: 'Analyze BPMN diagrams and optimize business processes with AI-powered process analysis. The system can automatically extract process flows from various data sources and visualize them. AI algorithms identify bottlenecks, inefficiencies and optimization potential. Automatic generation of optimization suggestions based on best practices and historical data. The system supports simulation of process changes and their impacts. Integration with workflow engines enables automatic implementation of optimized processes.'
      },

      '/build/data-model-setup': {
        title: 'Data Model Setup',
        content: 'Automatically set up data models in Salesforce. The system uses AI-powered analysis to implement optimal data models. The AI considers Salesforce limits, best practices and performance optimization. Automatic creation of custom objects, fields, relationships and validation rules. The system can also suggest alternative model variants and evaluate their impacts. Integration with Data Loader for automatic data migration. Continuous optimization based on usage data and performance metrics.'
      },
      '/knowledge/project': {
        title: 'Project Knowledge',
        content: 'Centralized knowledge base for your project with AI-powered search and analysis. The system uses advanced NLP algorithms for intelligent search and automatic categorization of knowledge. AI-powered knowledge extraction from various sources: documents, emails, meetings, code. Automatic generation of knowledge articles and summaries. The system can also identify knowledge gaps and make suggestions for missing documentation. Integration with other tools for continuous knowledge updates. Intelligent recommendations based on user behavior and project context.'
      },

    }
    
    return pageInfoMap[pathname] || {
      title: 'Information',
      content: 'Hier finden Sie Informationen über diese Seite.'
    }
  }
  
  const pageInfo = getPageInfo(location.pathname)
  
  return (
    <Layout pageInfo={pageInfo}>
      {children}
    </Layout>
  )
}

function App() {
  return (
    <DemoAuthProvider>
      <AuthProvider>
        <ChatProvider>
          <ProjectProvider>
            <ProtectedRoute>
              <Routes>
            <Route path="/" element={
              <PageWithInfo>
                <Dashboard />
              </PageWithInfo>
            } />
            <Route path="/agents" element={
              <PageWithInfo>
                <Agents />
              </PageWithInfo>
            } />
            <Route path="/projects" element={
              <PageWithInfo>
                <Projects />
              </PageWithInfo>
            } />
            <Route path="/workflows" element={
              <PageWithInfo>
                <Workflows />
              </PageWithInfo>
            } />
            <Route path="/settings" element={
              <PageWithInfo>
                <SettingsPage />
              </PageWithInfo>
            } />
            <Route path="/pre-sales/knowledge/video-zu-text" element={
              <PageWithInfo>
                <VideoZuText />
              </PageWithInfo>
            } />
            <Route path="/pre-sales/knowledge/audio-zu-text" element={
              <PageWithInfo>
                <AudioZuText />
              </PageWithInfo>
            } />
            <Route path="/pre-sales/knowledge/workshops" element={
              <PageWithInfo>
                <Workshops />
              </PageWithInfo>
            } />
            <Route path="/pre-sales/knowledge/workshops/:id" element={
              <PageWithInfo>
                <WorkshopDetail />
              </PageWithInfo>
            } />

            <Route path="/pre-sales/rfp-questions/extract" element={
              <PageWithInfo>
                <RfPQuestionsExtract />
              </PageWithInfo>
            } />
            <Route path="/pre-sales/rfp-questions/ai-answers" element={
              <PageWithInfo>
                <RfPQuestionsAIAnswers />
              </PageWithInfo>
            } />
            <Route path="/pre-sales/project-designer/architektur-sketch" element={
              <PageWithInfo>
                <ArchitekturSketch />
              </PageWithInfo>
            } />
            <Route path="/pre-sales/project-designer/projektplan-sketch" element={
              <PageWithInfo>
                <ProjektplanSketch />
              </PageWithInfo>
            } />
            <Route path="/pre-sales/project-designer/stakeholder-rollendefinition" element={
              <PageWithInfo>
                <StakeholderRollendefinition />
              </PageWithInfo>
            } />
            <Route path="/consent/:projectId/:participantId" element={
              <PageWithInfo>
                <ConsentPage />
              </PageWithInfo>
            } />
            <Route path="/projects/:id/participants" element={
              <PageWithInfo>
                <ProjectParticipants />
              </PageWithInfo>
            } />
            <Route path="/solution/data-modeling/design" element={
              <PageWithInfo>
                <DataModelingAssistDemo />
              </PageWithInfo>
            } />

            <Route path="/solution/process-mining/bpmn-analysis" element={
              <PageWithInfo>
                <ProcessMiningDemo />
              </PageWithInfo>
            } />
            <Route path="/solution/dashboard" element={
              <PageWithInfo>
                <SolutionDashboardDemo />
              </PageWithInfo>
            } />
            {/* Build Routes */}
            <Route path="/build/data-model-setup" element={
              <PageWithInfo>
                <DataModelSetup />
              </PageWithInfo>
            } />
            {/* Knowledge: Projekt Knowledge */}
            <Route path="/knowledge/project" element={
              <PageWithInfo>
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
                  <p className="text-gray-600">Knowledge base functionality has been removed.</p>
                </div>
              </PageWithInfo>
            } />

          </Routes>
            </ProtectedRoute>
        </ProjectProvider>
      </ChatProvider>
    </AuthProvider>
    </DemoAuthProvider>
  )
}

export default App 