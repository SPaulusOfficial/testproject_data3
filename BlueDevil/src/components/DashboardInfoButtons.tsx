import React, { useState } from 'react'
import { Info, HelpCircle } from 'lucide-react'

export const DashboardInfoButtons: React.FC = () => {
  const [portalInfoOpen, setPortalInfoOpen] = useState(false)
  const [pageInfoOpen, setPageInfoOpen] = useState(false)

  return (
    <>
      {/* Portal Info Button */}
      <button
        onClick={() => setPortalInfoOpen(true)}
        className="p-2 rounded-full bg-open-blue/10 hover:bg-open-blue/20 transition-colors"
        title="About the Portal"
      >
        <HelpCircle size={16} className="text-open-blue" />
      </button>

      {/* Page Info Button */}
      <button
        onClick={() => setPageInfoOpen(true)}
        className="p-2 rounded-full bg-digital-blue/10 hover:bg-digital-blue/20 transition-colors"
        title="About this page"
      >
        <Info size={16} className="text-digital-blue" />
      </button>

      {/* Portal Info Modal */}
      {portalInfoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">About the Project Assistant Suite</h3>
              <button
                onClick={() => setPortalInfoOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed space-y-4 overflow-y-auto flex-1 p-6">
              <p>
                The <strong>Project Assistant Suite</strong> is an advanced AI-powered platform for automating Salesforce projects. 
                It accompanies the entire project lifecycle from PreSales through Solution Design to Rollout and Hypercare with intelligent automation.
              </p>
              <p>
                The platform uses specialized AI agents based on cutting-edge AI technologies:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Langchain & Haystack</strong> for RAG (Retrieval-Augmented Generation)</li>
                <li><strong>Qdrant</strong> for vector search and semantic search</li>
                <li><strong>Elasticsearch</strong> for classical text search</li>
                <li><strong>FastAPI & Redis</strong> for workflow engine</li>
              </ul>
              <p>
                <strong>Main Features:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>AI-powered project management</strong> with automatic progress calculation and risk detection</li>
                <li><strong>Intelligent document generation</strong> with NLP and Machine Learning</li>
                <li><strong>Automated workflows</strong> with AI-supported decision making</li>
                <li><strong>Agent-based process automation</strong> with specialized AI modules</li>
                <li><strong>GDPR-compliant compliance</strong> with automatic anonymization</li>
                <li><strong>Real-time monitoring</strong> with Prometheus, Loki and Sentry</li>
              </ul>
              <p>
                <strong>Technical Architecture:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Containerized services with Docker and Kubernetes</li>
                <li>OAuth2/OIDC for secure authentication</li>
                <li>Vault for secrets management</li>
                <li>Versioned artifacts with Change Engine</li>
                <li>Open Source technologies exclusively</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end p-6 pt-0">
                              <button
                  onClick={() => setPortalInfoOpen(false)}
                  className="px-4 py-2 bg-open-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
                >
                  Got it
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Info Modal */}
      {pageInfoOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black">Dashboard</h3>
              <button
                onClick={() => setPageInfoOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed overflow-y-auto flex-1 p-6">
              <p>
                The <strong>Dashboard</strong> provides an intelligent overview of all your projects and their status. 
                Here you can:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-3 ml-4">
                <li><strong>Manage active projects</strong> with AI-powered project monitoring</li>
                <li><strong>View real-time progress</strong> and automatically calculated statistics</li>
                <li><strong>Intelligent project selection</strong> with AI-based recommendations</li>
                <li><strong>Advanced filtering</strong> by status, budget, agents and more</li>
                <li><strong>Detailed project overview</strong> with automatic metrics</li>
                <li><strong>AI-powered risk detection</strong> and proactive warnings</li>
                <li><strong>Automatic resource optimization</strong> based on project data</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                <strong>AI Features:</strong> The dashboard uses Machine Learning for automatic progress calculation, 
                risk detection and resource optimization. Continuous analysis of project data enables 
                proactive measures and optimal project control.
              </p>
            </div>
            <div className="mt-6 flex justify-end p-6 pt-0">
                              <button
                  onClick={() => setPageInfoOpen(false)}
                  className="px-4 py-2 bg-digital-blue text-white rounded-lg hover:bg-deep-blue-1 transition-colors"
                >
                  Got it
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 