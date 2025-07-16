import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Inbox,
  BarChart3,
  Plus,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useTask, Project } from '../contexts/TaskContext';
import { Button } from './ui/button';

import ProjectModal from './ProjectModal';
import { ProjectActions } from './ProjectActions';

const navigationItems = [
  { id: 'today', label: 'Today', icon: Calendar, path: '/' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, path: '/inbox' },
  { id: 'all', label: 'All Tasks', icon: CheckSquare, path: '/all-tasks' },
  { id: 'completed', label: 'Completed', icon: CheckSquare, path: '/completed' },
];

const bottomItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
];

export default function Sidebar() {
  const { state, dispatch } = useTask();
  const location = useLocation();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const getTaskCount = (viewId: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (viewId) {
      case 'today':
        return state.tasks.filter(task => 
          !task.completed && 
          task.dueDate && 
          task.dueDate >= today && 
          task.dueDate < tomorrow
        ).length;
      case 'inbox':
        return state.tasks.filter(task => !task.completed && !task.projectId).length;
      case 'all':
        return state.tasks.filter(task => !task.completed).length;
      case 'completed':
        return state.tasks.filter(task => task.completed).length;
      default:
        return 0;
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    dispatch({
      type: 'SET_UI',
      payload: { key: 'sidebarOpen', value: !state.ui.sidebarOpen }
    });
  };



  const openProjectModal = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const editProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setProjectModalOpen(false);
    setEditingProject(null);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {state.ui.sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Seamless Toggle Button - Transitions from inside sidebar to outside */}
      <div
        className="fixed z-50 hidden lg:block"
        style={{
          top: '16px',
          left: state.ui.sidebarOpen ? 'calc(var(--sidebar-width) - 48px)' : '16px',
          transition: 'all 300ms ease-in-out',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={`p-1.5 w-8 h-8 transition-all duration-200 ${
            state.ui.sidebarOpen
              ? 'hover:bg-muted/50'
              : 'bg-surface border border-border shadow-md hover:bg-muted'
          }`}
        >
          {state.ui.sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      <aside
        className="fixed left-0 top-0 z-40 bg-surface border-r border-border h-screen transition-transform duration-300 ease-in-out"
        style={{
          width: 'var(--sidebar-width)',
          transform: state.ui.sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Section - Logo */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">TaskFlow</h1>
                <p className="text-xs text-muted-foreground">Task Management</p>
              </div>
            </div>
          </div>
        </div>



        {/* Main Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="p-3 space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const count = getTaskCount(item.id);
            const isActive = isActiveRoute(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center w-full justify-start p-2.5 h-auto rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2.5" />
                <span className="flex-1 text-left">
                  {item.label}
                </span>
                {count > 0 && (
                  <span className="ml-auto text-xs text-muted-foreground font-medium">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
          
            {/* Projects Section */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Projects</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-5 w-5 hover:bg-muted"
                  onClick={openProjectModal}
                >
                  <Plus className="w-3.5 h-3.5 text-xs text-muted-foreground font-medium" />
                </Button>
              </div>

                <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar">
                  {state.projects.map((project) => {
                    const projectTaskCount = state.tasks.filter(
                      task => task.projectId === project.id && !task.completed
                    ).length;

                    const isProjectActive = location.pathname === `/project/${project.id}`;

                    return (
                      <div key={project.id} className="group relative">
                        <Link
                          to={`/project/${project.id}`}
                          className={`flex items-center w-full justify-start p-2.5 h-auto rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                            isProjectActive
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="flex-1 text-left truncate">{project.name}</span>

                          {/* Right side content - properly aligned */}
                          <div className="ml-auto flex items-center relative">
                            {/* Number counter - matches navigation items alignment */}
                            {projectTaskCount > 0 && (
                              <span className="text-xs text-muted-foreground font-medium group-hover:opacity-0 transition-opacity duration-200">
                                {projectTaskCount}
                              </span>
                            )}

                            {/* 3-dot menu - positioned in same location as counter */}
                            <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <ProjectActions
                                project={project}
                                onEdit={editProject}
                              />
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
          </nav>
        </div>

        {/* Bottom Navigation - Fixed */}
        <div className="p-3 space-y-1 border-t border-border bg-surface">
          {bottomItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center w-full justify-start p-2.5 h-auto rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2.5" />
                <span className="flex-1 text-left">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={closeProjectModal}
        project={editingProject}
      />
    </aside>
    </>
  );
}