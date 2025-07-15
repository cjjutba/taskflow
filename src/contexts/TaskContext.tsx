import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  projectId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  filters: {
    search: string;
    project: string | null;
    priority: string | null;
    status: 'all' | 'active' | 'completed';
  };
  ui: {
    sidebarOpen: boolean;
    activeView: string;
  };
}

type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_FILTER'; payload: { key: keyof TaskState['filters']; value: any } }
  | { type: 'SET_UI'; payload: { key: keyof TaskState['ui']; value: any } }
  | { type: 'CLEAR_FILTERS' };

const initialState: TaskState = {
  tasks: [],
  projects: [],
  filters: {
    search: '',
    project: null,
    priority: null,
    status: 'all',
  },
  ui: {
    sidebarOpen: true,
    activeView: 'today',
  },
};

// Sample data
const sampleProjects: Project[] = [
  { id: '1', name: 'Personal', color: '#10b981', taskCount: 5 },
  { id: '2', name: 'Work', color: '#2563eb', taskCount: 8 },
  { id: '3', name: 'Learning', color: '#f59e0b', taskCount: 3 },
];

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Finish project proposal',
    description: 'Complete the Q4 project proposal with timeline and budget',
    completed: false,
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000), // Tomorrow
    projectId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Review code changes',
    description: 'Review the pull requests for the new feature implementation',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 259200000), // 3 days
    projectId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Update portfolio website',
    description: 'Add recent projects and update the about section',
    completed: false,
    priority: 'low',
    dueDate: null,
    projectId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Morning workout',
    description: '30 minutes cardio and strength training',
    completed: true,
    priority: 'medium',
    dueDate: new Date(),
    projectId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Learn React Query',
    description: 'Complete the React Query documentation and build a sample project',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 604800000), // 1 week
    projectId: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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
    
    case 'SET_UI':
      return {
        ...state,
        ui: { ...state.ui, [action.payload.key]: action.payload.value },
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: { search: '', project: null, priority: null, status: 'all' },
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

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskManager.tasks');
    const savedProjects = localStorage.getItem('taskManager.projects');
    const savedUI = localStorage.getItem('taskManager.ui');

    if (savedTasks) {
      const tasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } else {
      // Load sample data if no saved data
      dispatch({ type: 'SET_TASKS', payload: sampleTasks });
    }

    if (savedProjects) {
      dispatch({ type: 'SET_PROJECTS', payload: JSON.parse(savedProjects) });
    } else {
      // Load sample projects if no saved data
      dispatch({ type: 'SET_PROJECTS', payload: sampleProjects });
    }

    if (savedUI) {
      const ui = JSON.parse(savedUI);
      Object.entries(ui).forEach(([key, value]) => {
        dispatch({ type: 'SET_UI', payload: { key: key as keyof TaskState['ui'], value } });
      });
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
    localStorage.setItem('taskManager.ui', JSON.stringify(state.ui));
  }, [state.ui]);

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