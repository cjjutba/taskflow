import React from 'react';
import { useTask } from '../contexts/TaskContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state } = useTask();

  return (
    <div className="min-h-screen bg-background font-inter">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            state.ui.sidebarOpen 
              ? 'lg:ml-[var(--sidebar-width)]' 
              : 'lg:ml-16'
          }`}
          style={{ paddingTop: 'var(--header-height)' }}
        >
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}