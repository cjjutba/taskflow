import React from 'react';
import { useTask } from '../contexts/TaskContext';
import Header from './Header';
import Sidebar from './Sidebar';
import TaskModal from './TaskModal';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useTask();

  const handleCloseModal = () => {
    dispatch({ type: 'CLOSE_TASK_MODAL' });
  };

  return (
    <div className="min-h-screen bg-background font-inter flex">
      {/* Sidebar - Full Height */}
      <Sidebar />

      {/* Mobile Overlay */}
      {state.ui.sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => dispatch({ type: 'SET_UI', payload: { key: 'sidebarOpen', value: false } })}
        />
      )}

      {/* Main Content Area - Fixed to viewport */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0 ${
        state.ui.sidebarOpen
          ? 'lg:ml-[var(--sidebar-width)]'
          : 'ml-0'
      }`}>
        {/* Header - Constrained to available width */}
        <div className="flex-shrink-0 w-full">
          <Header />
        </div>

        {/* Main Content - Constrained to available width */}
        <main className="flex-1 overflow-hidden min-w-0">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Task Modal */}
      <TaskModal
        isOpen={state.ui.taskModalOpen}
        onClose={handleCloseModal}
        task={state.ui.editingTask}
      />
    </div>
  );
}