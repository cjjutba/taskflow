import React from 'react';
import { TaskProvider, useTask } from '../contexts/TaskContext';
import Layout from '../components/Layout';
import TodayView from '../components/views/TodayView';
import AllTasksView from '../components/views/AllTasksView';
import InboxView from '../components/views/InboxView';
import CompletedView from '../components/views/CompletedView';
import AnalyticsView from '../components/views/AnalyticsView';
import SettingsView from '../components/views/SettingsView';
import { Toaster } from '../components/ui/toaster';

function TaskManagerContent() {
  const { state } = useTask();

  const renderView = () => {
    switch (state.ui.activeView) {
      case 'today':
        return <TodayView />;
      case 'inbox':
        return <InboxView />;
      case 'all':
        return <AllTasksView />;
      case 'completed':
        return <CompletedView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
}

const Index = () => {
  return (
    <TaskProvider>
      <TaskManagerContent />
      <Toaster />
    </TaskProvider>
  );
};

export default Index;
