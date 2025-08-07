import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ChatWidget } from './ChatWidget'
import { PageInfoButton } from './PageInfoButton'

interface LayoutProps {
  children: React.ReactNode
  pageInfo?: {
    title: string
    content: string
  }
}

export const Layout: React.FC<LayoutProps> = ({ children, pageInfo }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-off-white">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
      />
      
      {/* Main Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-auto custom-scrollbar relative">
          {/* Info Button - Top Right Corner */}
          {pageInfo && (
            <div className="absolute top-4 right-4 z-10">
              <PageInfoButton 
                title={pageInfo.title}
                content={pageInfo.content}
              />
            </div>
          )}
          
          <div className="max-w-main mx-auto px-8 py-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Chat Widget - Global */}
      <ChatWidget />
    </div>
  )
} 