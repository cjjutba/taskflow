import React, { useMemo, useState, useEffect } from 'react';
import { Inbox, Package, CheckSquare, ArrowRight, Filter, MoreHorizontal } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { PageLoading, SectionLoading } from '../components/ui/loading-spinner';
import { useUrlFilters } from '../hooks/useUrlFilters';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface InboxStats {
  totalUnassigned: number;
  recentTasks: number;
  urgentTasks: number;
  oldestTaskDays: number;
}

export default function InboxPage() {
  const { state, dispatch } = useTask();
  const { filters } = useUrlFilters();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [bulkProject, setBulkProject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const { inboxTasks, stats, filteredTasks } = useMemo(() => {
    // Tasks without project assignment
    let inboxTasks = state.tasks.filter(task => !task.projectId && !task.completed);

    // Apply URL filters
    let filteredTasks = inboxTasks;

    if (filters.search) {
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }
    
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
    
    // Calculate statistics
    const recentTasks = inboxTasks.filter(task => 
      task.createdAt >= threeDaysAgo
    ).length;
    
    const urgentTasks = inboxTasks.filter(task => 
      task.priority === 'high' || 
      (task.dueDate && task.dueDate <= new Date(now.getTime() + (24 * 60 * 60 * 1000)))
    ).length;
    
    const oldestTask = inboxTasks.reduce((oldest, task) => 
      !oldest || task.createdAt < oldest.createdAt ? task : oldest
    , null as any);
    
    const oldestTaskDays = oldestTask 
      ? Math.floor((now.getTime() - oldestTask.createdAt.getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    const stats: InboxStats = {
      totalUnassigned: inboxTasks.length,
      recentTasks,
      urgentTasks,
      oldestTaskDays,
    };

    return { inboxTasks, stats, filteredTasks };
  }, [state.tasks, filters]);

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading inbox..." />;
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(inboxTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleBulkAssignProject = () => {
    if (bulkProject && selectedTasks.length > 0) {
      selectedTasks.forEach(taskId => {
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
          dispatch({
            type: 'UPDATE_TASK',
            payload: { ...task, projectId: bulkProject, updatedAt: new Date() }
          });
        }
      });
      setSelectedTasks([]);
      setBulkProject('');
    }
  };

  const handleBulkDelete = () => {
    selectedTasks.forEach(taskId => {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    });
    setSelectedTasks([]);
  };

  const handleQuickAssign = (taskId: string, projectId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { ...task, projectId, updatedAt: new Date() }
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Inbox Overview */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Inbox className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Inbox</h1>
            <Badge variant="secondary" className="ml-2">
              {stats.totalUnassigned} unassigned
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Organize and assign your unprocessed tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalUnassigned}</p>
                </div>
                <Package className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recent</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.recentTasks}</p>
                </div>
                <ArrowRight className="w-8 h-8 text-blue-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.urgentTasks}</p>
                </div>
                <Filter className="w-8 h-8 text-red-600/60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Oldest</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.oldestTaskDays}d</p>
                </div>
                <CheckSquare className="w-8 h-8 text-orange-600/60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Operations */}
        {stats.totalUnassigned > 0 && (
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedTasks.length === inboxTasks.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedTasks.length > 0 
                  ? `${selectedTasks.length} selected` 
                  : 'Select all'
                }
              </span>
            </div>

            {selectedTasks.length > 0 && (
              <>
                <div className="flex items-center gap-2">
                  <Select value={bulkProject} onValueChange={setBulkProject}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Assign to project" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleBulkAssignProject}
                    disabled={!bulkProject}
                    size="sm"
                  >
                    Assign
                  </Button>
                </div>

                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Task List with Enhanced Features */}
      <div className="flex-1 overflow-hidden">
        <TaskList
          title="Unassigned Tasks"
          tasks={filteredTasks}
          showAddButton={true}
        />
      </div>
    </div>
  );
}
