import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { SessionProvider } from '@/contexts/SessionContext'

import { UserManagementProvider } from '@/contexts/UserManagementContext'
import { ProtectedRouteWrapper } from '@/components/ProtectedRouteWrapper'
import { Dashboard } from '@/pages/Dashboard'
import { Agents } from '@/pages/Agents'
import { Projects } from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import { Workflows } from '@/pages/Workflows'
import { SettingsPage } from '@/pages/Settings'
import UserManagement from '@/pages/UserManagement'
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

import { NotificationDemoPage } from '@/pages/NotificationDemo'
import UserProfilePage from '@/pages/UserProfilePage'
import LoginForm from '@/components/LoginForm'
import SessionDemo from '@/pages/SessionDemo'
import NavigationTracker from '@/components/NavigationTracker'
import { PasswordResetRequest } from '@/pages/PasswordResetRequest'
import { PasswordReset } from '@/pages/PasswordReset'

// Simple Layout wrapper
const PageWithLayout = ({ children }: { children: React.ReactNode }) => {
  return <Layout>{children}</Layout>
}

function App() {
  return (
    <SessionProvider>
      <AuthProvider>
        <ChatProvider>
          <ProjectProvider>
            <NotificationProvider>
              <UserManagementProvider>
            <ProtectedRouteWrapper>
            {/* <NavigationTracker /> */}
            <Routes>
            <Route path="/" element={
              <PageWithLayout>
                <Dashboard />
              </PageWithLayout>
            } />
            <Route path="/dashboard" element={
              <PageWithLayout>
                <Dashboard />
              </PageWithLayout>
            } />
            <Route path="/agents" element={
              <PageWithLayout>
                <Agents />
              </PageWithLayout>
            } />
            <Route path="/projects" element={
              <PageWithLayout>
                <Projects />
              </PageWithLayout>
            } />
            <Route path="/projects/:id" element={
              <PageWithLayout>
                <ProjectDetail />
              </PageWithLayout>
            } />
            <Route path="/workflows" element={
              <PageWithLayout>
                <Workflows />
              </PageWithLayout>
            } />
            <Route path="/settings" element={
              <PageWithLayout>
                <SettingsPage />
              </PageWithLayout>
            } />
            <Route path="/user-management" element={
              <PageWithLayout>
                <UserManagement />
              </PageWithLayout>
            } />
            <Route path="/pre-sales/knowledge/video-zu-text" element={
              <PageWithLayout>
                <VideoZuText />
              </PageWithLayout>
            } />
            <Route path="/pre-sales/knowledge/audio-zu-text" element={
              <PageWithLayout>
                <AudioZuText />
              </PageWithLayout>
            } />
            <Route path="/pre-sales/knowledge/workshops" element={
              <PageWithLayout>
                <Workshops />
              </PageWithLayout>
            } />
            <Route path="/pre-sales/knowledge/workshops/:id" element={
              <PageWithLayout>
                <WorkshopDetail />
              </PageWithLayout>
            } />

            <Route path="/pre-sales/rfp-questions/extract" element={
              <PageWithLayout>
                <RfPQuestionsExtract />
              </PageWithLayout>
            } />
            <Route path="/pre-sales/rfp-questions/ai-answers" element={
              <PageWithLayout>
                <RfPQuestionsAIAnswers />
              </PageWithLayout>
            } />
            <Route path="/pre-sales/project-designer/architektur-sketch" element={
              <PageWithLayout>
                <ArchitekturSketch />
              </PageWithLayout>
            } />
            <Route path="/pre-sales/project-designer/projektplan-sketch" element={
              <PageWithLayout>
                <ProjektplanSketch />
              </PageWithLayout>
            } />
            <Route path="/pre-sales/project-designer/stakeholder-rollendefinition" element={
              <PageWithLayout>
                <StakeholderRollendefinition />
              </PageWithLayout>
            } />
            <Route path="/consent/:projectId/:participantId" element={
              <PageWithLayout>
                <ConsentPage />
              </PageWithLayout>
            } />
            <Route path="/projects/:id/participants" element={
              <PageWithLayout>
                <ProjectParticipants />
              </PageWithLayout>
            } />
            <Route path="/solution/data-modeling/design" element={
              <PageWithLayout>
                <DataModelingAssistDemo />
              </PageWithLayout>
            } />

            <Route path="/solution/process-mining/bpmn-analysis" element={
              <PageWithLayout>
                <ProcessMiningDemo />
              </PageWithLayout>
            } />
            <Route path="/solution/dashboard" element={
              <PageWithLayout>
                <SolutionDashboardDemo />
              </PageWithLayout>
            } />
            {/* Build Routes */}
            <Route path="/build/data-model-setup" element={
              <PageWithLayout>
                <DataModelSetup />
              </PageWithLayout>
            } />
            {/* Notification Demo */}
            <Route path="/notification-demo" element={
              <PageWithLayout>
                <NotificationDemoPage />
              </PageWithLayout>
            } />
            {/* Login Route */}
            <Route path="/login" element={
              <LoginForm />
            } />
            {/* Password Reset Routes */}
            <Route path="/password-reset-request" element={
              <PasswordResetRequest />
            } />
            <Route path="/reset-password" element={
              <PasswordReset />
            } />
            {/* User Profile */}
            <Route path="/profile" element={
              <PageWithLayout>
                <UserProfilePage />
              </PageWithLayout>
            } />
            {/* Session Demo */}
            <Route path="/session-demo" element={
              <PageWithLayout>
                <SessionDemo />
              </PageWithLayout>
            } />
            {/* Knowledge: Projekt Knowledge */}
            <Route path="/knowledge/project" element={
              <PageWithLayout>
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
                  <p className="text-gray-600">Knowledge base functionality has been removed.</p>
                </div>
              </PageWithLayout>
            } />

          </Routes>
            </ProtectedRouteWrapper>
            </UserManagementProvider>
            </NotificationProvider>
          </ProjectProvider>
        </ChatProvider>
      </AuthProvider>
    </SessionProvider>
  )
}

export default App 