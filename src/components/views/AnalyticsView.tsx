import React, { useMemo } from 'react';
import { useTask } from '../../contexts/TaskContext';
import { 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Flag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  isToday, 
  isThisWeek, 
  isThisMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  format,
  subDays
} from 'date-fns';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center pt-1">
            <TrendingUp className={`w-4 h-4 mr-1 ${
              trend.isPositive ? 'text-success' : 'text-destructive'
            }`} />
            <span className={`text-xs ${
              trend.isPositive ? 'text-success' : 'text-destructive'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProductivityChartProps {
  data: { day: string; completed: number; created: number; }[];
}

function ProductivityChart({ data }: ProductivityChartProps) {
  const maxValue = Math.max(...data.map(d => Math.max(d.completed, d.created)));
  
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Weekly Productivity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.day}</span>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Created: {item.created}</span>
                  <span>Completed: {item.completed}</span>
                </div>
              </div>
              <div className="flex gap-2 h-2">
                <div 
                  className="bg-primary/20 rounded"
                  style={{ width: `${(item.created / maxValue) * 100}%` }}
                />
                <div 
                  className="bg-success rounded"
                  style={{ width: `${(item.completed / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-primary/20 rounded" />
            <span>Tasks Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 bg-success rounded" />
            <span>Tasks Completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsView() {
  const { state } = useTask();

  const analytics = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = startOfWeek(now);
    const endOfThisWeek = endOfWeek(now);
    
    // Basic stats
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Today's tasks
    const todayTasks = state.tasks.filter(task => 
      task.dueDate && isToday(task.dueDate)
    );
    const todayCompleted = todayTasks.filter(task => task.completed).length;

    // This week's tasks
    const thisWeekTasks = state.tasks.filter(task => 
      task.dueDate && isThisWeek(task.dueDate)
    );
    const thisWeekCompleted = thisWeekTasks.filter(task => task.completed).length;

    // This month's tasks
    const thisMonthTasks = state.tasks.filter(task => 
      task.dueDate && isThisMonth(task.dueDate)
    );
    const thisMonthCompleted = thisMonthTasks.filter(task => task.completed).length;

    // Priority breakdown
    const highPriorityTasks = state.tasks.filter(task => task.priority === 'high' && !task.completed).length;
    const mediumPriorityTasks = state.tasks.filter(task => task.priority === 'medium' && !task.completed).length;
    const lowPriorityTasks = state.tasks.filter(task => task.priority === 'low' && !task.completed).length;

    // Overdue tasks
    const overdueTasks = state.tasks.filter(task => 
      !task.completed && 
      task.dueDate && 
      task.dueDate < now
    ).length;

    // Weekly productivity data
    const weekDays = eachDayOfInterval({
      start: startOfThisWeek,
      end: endOfThisWeek
    });

    const weeklyData = weekDays.map(day => {
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const created = state.tasks.filter(task => 
        task.createdAt >= dayStart && task.createdAt < dayEnd
      ).length;

      const completed = state.tasks.filter(task => 
        task.completed && 
        task.updatedAt >= dayStart && 
        task.updatedAt < dayEnd
      ).length;

      return {
        day: format(day, 'EEE'),
        created,
        completed
      };
    });

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate,
      todayTasks: todayTasks.length,
      todayCompleted,
      thisWeekCompleted,
      thisMonthCompleted,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      overdueTasks,
      weeklyData
    };
  }, [state.tasks]);

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Track your productivity and task completion patterns</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tasks"
            value={analytics.totalTasks}
            description="All time"
            icon={<Target className="w-4 h-4" />}
          />
          <StatCard
            title="Completion Rate"
            value={`${analytics.completionRate}%`}
            description="Overall progress"
            icon={<CheckCircle className="w-4 h-4" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Tasks"
            value={analytics.activeTasks}
            description="In progress"
            icon={<Clock className="w-4 h-4" />}
          />
          <StatCard
            title="Overdue"
            value={analytics.overdueTasks}
            description="Past due date"
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productivity Chart */}
          <ProductivityChart data={analytics.weeklyData} />

          {/* Priority Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Priority Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded" />
                    <span className="text-sm">High Priority</span>
                  </div>
                  <Badge variant="destructive">{analytics.highPriorityTasks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded" />
                    <span className="text-sm">Medium Priority</span>
                  </div>
                  <Badge variant="secondary">{analytics.mediumPriorityTasks}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted-foreground rounded" />
                    <span className="text-sm">Low Priority</span>
                  </div>
                  <Badge variant="outline">{analytics.lowPriorityTasks}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.projects.map(project => {
                const projectTasks = state.tasks.filter(task => task.projectId === project.id);
                const completedProjectTasks = projectTasks.filter(task => task.completed);
                const progress = projectTasks.length > 0 
                  ? Math.round((completedProjectTasks.length / projectTasks.length) * 100) 
                  : 0;

                return (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{completedProjectTasks.length}/{projectTasks.length}</span>
                        <Badge variant="outline">{progress}%</Badge>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}