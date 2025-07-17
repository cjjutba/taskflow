import { useMemo } from 'react';
import { Task, Project } from '../contexts/TaskContext';

interface ProductivityStats {
  // Daily stats
  todayCompleted: number;
  todayCreated: number;
  todayProductivity: number; // percentage
  
  // Weekly stats
  weekCompleted: number;
  weekCreated: number;
  weekProductivity: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  
  // Patterns
  mostProductiveHour: number;
  mostProductiveDay: string;
  averageTasksPerDay: number;
  
  // Task analysis
  averageCompletionTime: number; // in hours
  overdueTasks: number;
  highPriorityCompleted: number;
  
  // Project insights
  activeProjects: number;
  completedProjects: number;
  projectCompletionRate: number;
  
  // Trends
  weeklyTrend: 'improving' | 'declining' | 'stable';
  productivityScore: number; // 0-100
}

interface ProductivityInsight {
  type: 'achievement' | 'suggestion' | 'warning' | 'celebration';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  metadata?: Record<string, any>;
}

export const useProductivityAnalytics = (tasks: Task[], projects: Project[]) => {
  const stats = useMemo((): ProductivityStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Today's stats
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= today;
    });
    
    const todayCompleted = tasks.filter(task => {
      if (!task.completed) return false;
      const completedDate = new Date(task.updatedAt);
      return completedDate >= today;
    }).length;

    const todayCreated = todayTasks.length;
    const todayProductivity = todayCreated > 0 ? Math.round((todayCompleted / todayCreated) * 100) : 0;

    // Week's stats
    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= weekAgo;
    });
    
    const weekCompleted = tasks.filter(task => {
      if (!task.completed) return false;
      const completedDate = new Date(task.updatedAt);
      return completedDate >= weekAgo;
    }).length;

    const weekCreated = weekTasks.length;
    const weekProductivity = weekCreated > 0 ? Math.round((weekCompleted / weekCreated) * 100) : 0;

    // Calculate streaks
    const calculateStreak = (): { current: number; longest: number } => {
      const completedTasks = tasks.filter(task => task.completed)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let currentDate = new Date(today);

      // Check if user completed tasks today
      const todayHasTasks = completedTasks.some(task => {
        const completedDate = new Date(task.updatedAt);
        return completedDate >= today;
      });

      if (todayHasTasks) {
        currentStreak = 1;
        tempStreak = 1;
      }

      // Check previous days
      for (let i = 1; i <= 30; i++) { // Check last 30 days
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const nextDay = new Date(checkDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const dayHasTasks = completedTasks.some(task => {
          const completedDate = new Date(task.updatedAt);
          return completedDate >= checkDate && completedDate < nextDay;
        });

        if (dayHasTasks) {
          if (i === 1 || tempStreak > 0) {
            currentStreak++;
            tempStreak++;
          }
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (i === 1) currentStreak = 0;
          tempStreak = 0;
        }
      }

      return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) };
    };

    const { current: currentStreak, longest: longestStreak } = calculateStreak();

    // Most productive patterns
    const hourlyStats = Array(24).fill(0);
    const dailyStats: Record<string, number> = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
      'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };

    tasks.filter(task => task.completed).forEach(task => {
      const completedDate = new Date(task.updatedAt);
      hourlyStats[completedDate.getHours()]++;
      dailyStats[completedDate.toLocaleDateString('en-US', { weekday: 'long' })]++;
    });

    const mostProductiveHour = hourlyStats.indexOf(Math.max(...hourlyStats));
    const mostProductiveDay = Object.keys(dailyStats).reduce((a, b) => 
      dailyStats[a] > dailyStats[b] ? a : b
    );

    // Average completion time
    const completedTasks = tasks.filter(task => task.completed);
    const totalCompletionTime = completedTasks.reduce((total, task) => {
      const created = new Date(task.createdAt).getTime();
      const completed = new Date(task.updatedAt).getTime();
      return total + (completed - created);
    }, 0);
    
    const averageCompletionTime = completedTasks.length > 0 
      ? Math.round(totalCompletionTime / completedTasks.length / (1000 * 60 * 60)) // Convert to hours
      : 0;

    // Overdue tasks
    const overdueTasks = tasks.filter(task => 
      !task.completed && task.dueDate && new Date(task.dueDate) < now
    ).length;

    // High priority completed
    const highPriorityCompleted = tasks.filter(task => 
      task.completed && task.priority === 'high'
    ).length;

    // Project insights
    const activeProjects = projects.length;
    const projectTasks = tasks.filter(task => task.projectId);
    const completedProjectTasks = projectTasks.filter(task => task.completed);
    const projectCompletionRate = projectTasks.length > 0 
      ? Math.round((completedProjectTasks.length / projectTasks.length) * 100)
      : 0;

    // Weekly trend
    const lastWeekCompleted = tasks.filter(task => {
      if (!task.completed) return false;
      const completedDate = new Date(task.updatedAt);
      const twoWeeksAgo = new Date(weekAgo);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
      return completedDate >= twoWeeksAgo && completedDate < weekAgo;
    }).length;

    let weeklyTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (weekCompleted > lastWeekCompleted * 1.1) weeklyTrend = 'improving';
    else if (weekCompleted < lastWeekCompleted * 0.9) weeklyTrend = 'declining';

    // Productivity score (0-100)
    const productivityScore = Math.min(100, Math.round(
      (todayProductivity * 0.3) +
      (weekProductivity * 0.3) +
      (currentStreak * 5) +
      (Math.min(highPriorityCompleted, 10) * 2) +
      (Math.max(0, 100 - overdueTasks * 10) * 0.1)
    ));

    return {
      todayCompleted,
      todayCreated,
      todayProductivity,
      weekCompleted,
      weekCreated,
      weekProductivity,
      currentStreak,
      longestStreak,
      mostProductiveHour,
      mostProductiveDay,
      averageTasksPerDay: Math.round(weekCompleted / 7),
      averageCompletionTime,
      overdueTasks,
      highPriorityCompleted,
      activeProjects,
      completedProjects: 0, // Will be calculated when we have project completion tracking
      projectCompletionRate,
      weeklyTrend,
      productivityScore,
    };
  }, [tasks, projects]);

  const insights = useMemo((): ProductivityInsight[] => {
    const insights: ProductivityInsight[] = [];

    // Achievement insights
    if (stats.currentStreak >= 7) {
      insights.push({
        type: 'achievement',
        title: 'Week Streak!',
        message: `Amazing! You've completed tasks for ${stats.currentStreak} days in a row!`,
        priority: 'high',
        actionable: false,
        metadata: { streak: stats.currentStreak }
      });
    }

    if (stats.todayCompleted >= 10) {
      insights.push({
        type: 'celebration',
        title: 'Productivity Champion!',
        message: `You've completed ${stats.todayCompleted} tasks today. Outstanding work!`,
        priority: 'medium',
        actionable: false,
        metadata: { tasksCompleted: stats.todayCompleted }
      });
    }

    // Suggestions
    if (stats.overdueTasks > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Tasks Need Attention',
        message: `You have ${stats.overdueTasks} overdue task${stats.overdueTasks > 1 ? 's' : ''}. Consider rescheduling or completing them.`,
        priority: 'high',
        actionable: true,
        metadata: { overdueCount: stats.overdueTasks }
      });
    }

    if (stats.weeklyTrend === 'declining') {
      insights.push({
        type: 'suggestion',
        title: 'Productivity Dip Detected',
        message: 'Your task completion has decreased this week. Try breaking large tasks into smaller ones.',
        priority: 'medium',
        actionable: true,
        metadata: { trend: stats.weeklyTrend }
      });
    }

    if (stats.mostProductiveHour && stats.todayCompleted === 0) {
      const hour = stats.mostProductiveHour;
      const timeStr = hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
      insights.push({
        type: 'suggestion',
        title: 'Peak Performance Time',
        message: `You're usually most productive around ${timeStr}. Consider scheduling important tasks then.`,
        priority: 'low',
        actionable: true,
        metadata: { productiveHour: hour }
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [stats]);

  return {
    stats,
    insights,
  };
};
