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
    <div className="min-h-screen bg-background font-inter">
      <Header />

      <div className="flex">
        <Sidebar />

        <main
          className={`flex-1 transition-all duration-300 ${
            state.ui.sidebarOpen
              ? 'lg:ml-[var(--sidebar-width)]'
              : 'ml-0 lg:ml-16'
          }`}
          style={{ paddingTop: 'var(--header-height)' }}
        >
          <div className="h-full">
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