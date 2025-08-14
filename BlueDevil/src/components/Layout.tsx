import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ChatWidget } from './ChatWidget'


interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
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
        <main className="flex-1 overflow-auto custom-scrollbar">
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