import React from 'react';
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

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 bg-surface border-r border-border transition-all duration-300 ${
        state.ui.sidebarOpen ? 'w-[var(--sidebar-width)]' : 'w-16'
      }`}
      style={{ 
        top: 'var(--header-height)',
        height: 'calc(100vh - var(--header-height))'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const count = getTaskCount(item.id);
            const isActive = state.ui.activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start p-3 h-auto ${
                  !state.ui.sidebarOpen ? 'px-3' : ''
                } ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <IconComponent className={`w-5 h-5 ${state.ui.sidebarOpen ? 'mr-3' : ''}`} />
                {state.ui.sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {count > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto text-xs bg-muted-foreground/10"
                      >
                        {count}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            );
          })}
          
          {/* Projects Section */}
          {state.ui.sidebarOpen && (
            <div className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Projects</h3>
                <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-1">
                {state.projects.map((project) => {
                  const projectTaskCount = state.tasks.filter(
                    task => task.projectId === project.id && !task.completed
                  ).length;
                  
                  return (
                    <Button
                      key={project.id}
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto"
                      onClick={() => {
                        dispatch({
                          type: 'SET_FILTER',
                          payload: { key: 'project', value: project.id }
                        });
                        setActiveView('all');
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="flex-1 text-left">{project.name}</span>
                      {projectTaskCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="ml-auto text-xs bg-muted-foreground/10"
                        >
                          {projectTaskCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 space-y-2 border-t border-border">
          {bottomItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = state.ui.activeView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start p-3 h-auto ${
                  !state.ui.sidebarOpen ? 'px-3' : ''
                } ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                <IconComponent className={`w-5 h-5 ${state.ui.sidebarOpen ? 'mr-3' : ''}`} />
                {state.ui.sidebarOpen && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}