import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Inbox,
  FolderOpen,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import ProjectModal from './ProjectModal';
import { ProjectActions } from './ProjectActions';

const navigationItems = [
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'all', label: 'All Tasks', icon: CheckSquare },
  { id: 'completed', label: 'Completed', icon: CheckSquare },
];

const bottomItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { state, dispatch } = useTask();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  
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

  const setActiveView = (viewId: string) => {
    dispatch({
      type: 'SET_UI',
      payload: { key: 'activeView', value: viewId }
    });
  };

  const openProjectModal = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const editProject = (project: any) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setProjectModalOpen(false);
    setEditingProject(null);
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 bg-surface border-r border-border transition-all duration-300 ${
        state.ui.sidebarOpen
          ? 'w-[var(--sidebar-width)] translate-x-0'
          : 'w-[var(--sidebar-width)] lg:w-16 -translate-x-full lg:translate-x-0'
      }`}
      style={{
        top: 'var(--header-height)',
        height: 'calc(100vh - var(--header-height))'
      }}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Main Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const count = getTaskCount(item.id);
            const isActive = state.ui.activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start p-3 h-auto ${
                  !state.ui.sidebarOpen ? 'px-3 justify-center lg:justify-start' : ''
                } ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <IconComponent className={`w-5 h-5 ${state.ui.sidebarOpen ? 'mr-3' : 'lg:mr-3'}`} />
                <span className={`flex-1 text-left ${state.ui.sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                  {item.label}
                </span>
                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className={`ml-auto text-xs bg-muted-foreground/10 ${state.ui.sidebarOpen ? 'block' : 'hidden lg:block'}`}
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
          
            {/* Projects Section */}
            {state.ui.sidebarOpen && (
              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Projects</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 hover:bg-muted"
                    onClick={openProjectModal}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                  {state.projects.map((project) => {
                    const projectTaskCount = state.tasks.filter(
                      task => task.projectId === project.id && !task.completed
                    ).length;

                    return (
                      <div key={project.id} className="group relative">
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-3 h-auto pr-8"
                          onClick={() => {
                            dispatch({
                              type: 'SET_FILTER',
                              payload: { key: 'project', value: project.id }
                            });
                            setActiveView('all');
                          }}
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="flex-1 text-left truncate">{project.name}</span>
                          {projectTaskCount > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-2 text-xs bg-muted-foreground/10 flex-shrink-0"
                            >
                              {projectTaskCount}
                            </Badge>
                          )}
                        </Button>
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                          <ProjectActions
                            project={project}
                            onEdit={editProject}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Navigation - Fixed */}
        <div className="p-4 space-y-2 border-t border-border bg-surface">
          {bottomItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = state.ui.activeView === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start p-3 h-auto ${
                  !state.ui.sidebarOpen ? 'px-3 justify-center lg:justify-start' : ''
                } ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <IconComponent className={`w-5 h-5 ${state.ui.sidebarOpen ? 'mr-3' : 'lg:mr-3'}`} />
                <span className={`flex-1 text-left ${state.ui.sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                  {item.label}
                </span>
              </Button>
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
  );
}