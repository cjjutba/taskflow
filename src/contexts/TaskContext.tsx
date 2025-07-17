import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useTaskNotifications } from '../hooks/useTaskNotifications';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  projectId: string | null;
  sectionId: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

export interface Section {
  id: string;
  name: string;
  color?: string;
  order: number;
  viewId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  sections: Section[];
  filters: {
    search: string;
    project: string | null;
    priority: string | null;
    status: 'all' | 'active' | 'completed';
    dueDate: {
      start?: Date;
      end?: Date;
      overdue?: boolean;
    } | null;
    sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'alphabetical';
    sortDirection?: 'asc' | 'desc';
  };
  ui: {
    sidebarOpen: boolean;
    activeView: string;
    viewMode: 'list' | 'board';
    taskModalOpen: boolean;
    editingTask: Task | null;
    selectedSectionId: string | null;
    highlightedTaskId: string | null;
  };
}

type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'MOVE_TASK_TO_SECTION'; payload: { taskId: string; sectionId: string | null; newOrder: number } }
  | { type: 'REORDER_TASKS'; payload: { taskId: string; newOrder: number; sectionId: string | null } }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_SECTIONS'; payload: Section[] }
  | { type: 'ADD_SECTION'; payload: Section }
  | { type: 'UPDATE_SECTION'; payload: Section }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: { sectionId: string; newOrder: number } }
  | { type: 'SET_FILTER'; payload: { key: keyof TaskState['filters']; value: any } }
  | { type: 'SET_UI'; payload: { key: keyof TaskState['ui']; value: any } }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'board' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'OPEN_TASK_MODAL'; payload?: { task?: Task | null; sectionId?: string | null } }
  | { type: 'CLOSE_TASK_MODAL' }
  | { type: 'HIGHLIGHT_TASK'; payload: { taskId: string } }
  | { type: 'CLEAR_HIGHLIGHT' };

const initialState: TaskState = {
  tasks: [],
  projects: [],
  sections: [],
  filters: {
    search: '',
    project: null,
    priority: null,
    status: 'all',
    dueDate: null,
    sortBy: 'dueDate',
    sortDirection: 'asc',
  },
  ui: {
    sidebarOpen: true,
    activeView: 'today',
    viewMode: 'list',
    taskModalOpen: false,
    editingTask: null,
    selectedSectionId: null,
    highlightedTaskId: null,
  },
};



function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: new Date() }
            : task
        ),
      };
    
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        ),
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.payload.key]: action.payload.value },
      };
    
    case 'MOVE_TASK_TO_SECTION':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, sectionId: action.payload.sectionId, order: action.payload.newOrder, updatedAt: new Date() }
            : task
        ),
      };

    case 'REORDER_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, order: action.payload.newOrder, sectionId: action.payload.sectionId, updatedAt: new Date() }
            : task
        ),
      };

    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };

    case 'ADD_SECTION':
      return { ...state, sections: [...state.sections, action.payload] };

    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.id ? action.payload : section
        ),
      };

    case 'DELETE_SECTION':
      return {
        ...state,
        sections: state.sections.filter(section => section.id !== action.payload),
        tasks: state.tasks.map(task =>
          task.sectionId === action.payload
            ? { ...task, sectionId: null, updatedAt: new Date() }
            : task
        ),
      };

    case 'REORDER_SECTIONS':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.sectionId
            ? { ...section, order: action.payload.newOrder, updatedAt: new Date() }
            : section
        ),
      };

    case 'SET_UI':
      return {
        ...state,
        ui: { ...state.ui, [action.payload.key]: action.payload.value },
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        ui: { ...state.ui, viewMode: action.payload },
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: {
          search: '',
          project: null,
          priority: null,
          status: 'all',
          dueDate: null,
          sortBy: 'dueDate',
          sortDirection: 'asc',
        },
      };

    case 'OPEN_TASK_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          taskModalOpen: true,
          editingTask: action.payload?.task || null,
          selectedSectionId: action.payload?.sectionId || null
        },
      };

    case 'CLOSE_TASK_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          taskModalOpen: false,
          editingTask: null,
          selectedSectionId: null
        },
      };

    case 'HIGHLIGHT_TASK':
      return {
        ...state,
        ui: {
          ...state.ui,
          highlightedTaskId: action.payload.taskId
        },
      };

    case 'CLEAR_HIGHLIGHT':
      return {
        ...state,
        ui: {
          ...state.ui,
          highlightedTaskId: null
        },
      };

    default:
      return state;
  }
}

const TaskContext = createContext<{
  state: TaskState;
  dispatch: React.Dispatch<TaskAction>;
} | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Integrate notification system
  useTaskNotifications({
    tasks: state.tasks,
    projects: state.projects,
    sections: state.sections
  });

  // Load data from localStorage on mount
  useEffect(() => {
    // One-time cleanup of sample data - only run if not already cleaned
    const hasBeenCleaned = localStorage.getItem('taskManager.cleaned');
    if (!hasBeenCleaned) {
      localStorage.removeItem('taskManager.tasks');
      localStorage.removeItem('taskManager.projects');
      localStorage.removeItem('taskManager.sections');
      localStorage.setItem('taskManager.cleaned', 'true');
    }

    const savedTasks = localStorage.getItem('taskManager.tasks');
    const savedProjects = localStorage.getItem('taskManager.projects');
    const savedSections = localStorage.getItem('taskManager.sections');
    const savedUI = localStorage.getItem('taskManager.ui');

    if (savedTasks) {
      const tasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        sectionId: task.sectionId || null,
        order: task.order || 0,
      }));
      dispatch({ type: 'SET_TASKS', payload: tasks });
    }
    // Start with empty tasks if no saved data

    if (savedProjects) {
      dispatch({ type: 'SET_PROJECTS', payload: JSON.parse(savedProjects) });
    }
    // Start with empty projects if no saved data

    if (savedSections) {
      const sections = JSON.parse(savedSections).map((section: any) => ({
        ...section,
        createdAt: new Date(section.createdAt),
        updatedAt: new Date(section.updatedAt),
      }));
      dispatch({ type: 'SET_SECTIONS', payload: sections });
    }

    if (savedUI) {
      const ui = JSON.parse(savedUI);
      Object.entries(ui).forEach(([key, value]) => {
        dispatch({ type: 'SET_UI', payload: { key: key as keyof TaskState['ui'], value } });
      });
    }

    // Load view mode preference
    const savedViewMode = localStorage.getItem('taskManager.viewMode');
    if (savedViewMode && (savedViewMode === 'list' || savedViewMode === 'board')) {
      dispatch({ type: 'SET_VIEW_MODE', payload: savedViewMode });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('taskManager.tasks', JSON.stringify(state.tasks));
  }, [state.tasks]);

  useEffect(() => {
    localStorage.setItem('taskManager.projects', JSON.stringify(state.projects));
  }, [state.projects]);

  useEffect(() => {
    localStorage.setItem('taskManager.sections', JSON.stringify(state.sections));
  }, [state.sections]);

  useEffect(() => {
    localStorage.setItem('taskManager.ui', JSON.stringify(state.ui));
  }, [state.ui]);

  // Auto-clear task highlight after 3 seconds and scroll to highlighted task
  useEffect(() => {
    if (state.ui.highlightedTaskId) {
      // Scroll to the highlighted task
      setTimeout(() => {
        const taskElement = document.querySelector(`[data-task-id="${state.ui.highlightedTaskId}"]`);
        if (taskElement) {
          taskElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 200); // Small delay to ensure page navigation is complete

      // Clear highlight after 3 seconds
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_HIGHLIGHT' });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.ui.highlightedTaskId]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}