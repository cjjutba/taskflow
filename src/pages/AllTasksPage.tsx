import React, { useMemo, useState, useEffect } from 'react';
import { CheckSquare, BarChart3, Calendar, AlertTriangle, Filter, SortAsc } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import TaskList from '../components/TaskList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageLoading, SectionLoading } from '../components/ui/loading-spinner';
import { useUrlFilters } from '../hooks/useUrlFilters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { DatePickerWithRange } from '../components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface AllTasksStats {
  totalActive: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  overdue: number;
  dueToday: number;
  dueTomorrow: number;
  noDueDate: number;
  projectDistribution: { [key: string]: number };
}

export default function AllTasksPage() {
  const { state, dispatch } = useTask();
  const { filters, updateFilter } = useUrlFilters();
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [customFilters, setCustomFilters] = useState({
    project: 'all',
    priority: 'all',
    search: '',
    showOverdue: false,
  });

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const { allActiveTasks, filteredTasks, stats, urlFilteredTasks } = useMemo(() => {
    // All active (non-completed) tasks
    const allActiveTasks = state.tasks.filter(task => !task.completed);

    // Apply URL filters first
    let urlFilteredTasks = allActiveTasks;

    if (filters.search) {
      urlFilteredTasks = urlFilteredTasks.filter(task =>
        task.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.priority) {
      urlFilteredTasks = urlFilteredTasks.filter(task => task.priority === filters.priority);
    }

    if (filters.project) {
      urlFilteredTasks = urlFilteredTasks.filter(task => task.projectId === filters.project);
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate comprehensive statistics
    const stats: AllTasksStats = {
      totalActive: allActiveTasks.length,
      highPriority: allActiveTasks.filter(task => task.priority === 'high').length,
      mediumPriority: allActiveTasks.filter(task => task.priority === 'medium').length,
      lowPriority: allActiveTasks.filter(task => task.priority === 'low').length,
      overdue: allActiveTasks.filter(task => 
        task.dueDate && task.dueDate < today
      ).length,
      dueToday: allActiveTasks.filter(task => 
        task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
      ).length,
      dueTomorrow: allActiveTasks.filter(task => {
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        return task.dueDate && task.dueDate >= tomorrow && task.dueDate < dayAfterTomorrow;
      }).length,
      noDueDate: allActiveTasks.filter(task => !task.dueDate).length,
      projectDistribution: {},
    };

    // Calculate project distribution
    state.projects.forEach(project => {
      stats.projectDistribution[project.name] = allActiveTasks.filter(
        task => task.projectId === project.id
      ).length;
    });
    stats.projectDistribution['Unassigned'] = allActiveTasks.filter(
      task => !task.projectId
    ).length;

    // Apply filters based on active tab and custom filters
    let filteredTasks = [...allActiveTasks];

    // Tab-based filtering
    switch (activeTab) {
      case 'overdue':
        filteredTasks = filteredTasks.filter(task => 
          task.dueDate && task.dueDate < today
        );
        break;
      case 'today':
        filteredTasks = filteredTasks.filter(task => 
          task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
        );
        break;
      case 'upcoming':
        filteredTasks = filteredTasks.filter(task => 
          task.dueDate && task.dueDate >= tomorrow
        );
        break;
      case 'no-date':
        filteredTasks = filteredTasks.filter(task => !task.dueDate);
        break;
    }

    // Custom filters
    if (customFilters.project && customFilters.project !== 'all') {
      filteredTasks = filteredTasks.filter(task =>
        task.projectId === customFilters.project
      );
    }

    if (customFilters.priority && customFilters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task =>
        task.priority === customFilters.priority
      );
    }

    if (customFilters.search) {
      const searchLower = customFilters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (dateRange?.from && dateRange?.to) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        return task.dueDate >= dateRange.from! && task.dueDate <= dateRange.to!;
      });
    }

    return { allActiveTasks, filteredTasks, stats, urlFilteredTasks };
  }, [state.tasks, state.projects, activeTab, customFilters, dateRange, filters]);

  // Show loading state
  if (isLoading) {
    return <PageLoading message="Loading all tasks..." />;
  }

  const handleFilterChange = (key: string, value: string) => {
    setCustomFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setCustomFilters({
      project: 'all',
      priority: 'all',
      search: '',
      showOverdue: false,
    });
    setDateRange(undefined);
  };

  return (
    <div className="h-full flex flex-col">
      {/* All Tasks Overview */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">All Tasks</h1>
            <Badge variant="secondary" className="ml-2">
              {stats.totalActive} active
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Comprehensive view of all your active tasks
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.totalActive}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{stats.dueToday}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{stats.dueTomorrow}</p>
                <p className="text-xs text-muted-foreground">Tomorrow</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-red-500">{stats.highPriority}</p>
                <p className="text-xs text-muted-foreground">High</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-500">{stats.mediumPriority}</p>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-green-500">{stats.lowPriority}</p>
                <p className="text-xs text-muted-foreground">Low</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-lg font-bold text-muted-foreground">{stats.noDueDate}</p>
                <p className="text-xs text-muted-foreground">No Date</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Search tasks..."
              value={customFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-64"
            />

            <Select value={customFilters.project} onValueChange={(value) => handleFilterChange('project', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
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

            <Select value={customFilters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} size="sm">
              Clear Filters
            </Button>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.totalActive})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
              <TabsTrigger value="today">Today ({stats.dueToday})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({stats.dueTomorrow})</TabsTrigger>
              <TabsTrigger value="no-date">No Date ({stats.noDueDate})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-hidden">
        <TaskList 
          title={`${activeTab === 'all' ? 'All' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tasks`}
          tasks={filteredTasks}
          showAddButton={true}
        />
      </div>
    </div>
  );
}
