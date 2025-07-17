import { useEffect, useRef, useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { createNotificationFromTemplate } from '../utils/notificationTemplates';
import { useProductivityAnalytics } from './useProductivityAnalytics';
import { Task, Project } from '../contexts/TaskContext';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'productivity' | 'consistency' | 'quality' | 'milestone' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  condition: (stats: any, tasks: Task[], projects: Project[]) => boolean;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-100 for progressive achievements
  hidden?: boolean; // Hidden until unlocked
}

export interface AchievementCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
}

// Achievement definitions
const achievementDefinitions: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Productivity Achievements
  {
    id: 'first_task',
    name: 'Getting Started',
    description: 'Complete your first task',
    icon: '🎯',
    category: 'productivity',
    tier: 'bronze',
    points: 10,
    condition: (stats) => stats.todayCompleted >= 1,
  },
  {
    id: 'task_master',
    name: 'Task Master',
    description: 'Complete 10 tasks in a single day',
    icon: '⚡',
    category: 'productivity',
    tier: 'silver',
    points: 50,
    condition: (stats) => stats.todayCompleted >= 10,
  },
  {
    id: 'productivity_beast',
    name: 'Productivity Beast',
    description: 'Complete 25 tasks in a single day',
    icon: '🔥',
    category: 'productivity',
    tier: 'gold',
    points: 100,
    condition: (stats) => stats.todayCompleted >= 25,
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 tasks total',
    icon: '💯',
    category: 'milestone',
    tier: 'gold',
    points: 200,
    condition: (stats, tasks) => tasks.filter(t => t.completed).length >= 100,
  },

  // Consistency Achievements
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Complete tasks for 3 consecutive days',
    icon: '🔗',
    category: 'consistency',
    tier: 'bronze',
    points: 30,
    condition: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete tasks for 7 consecutive days',
    icon: '⚔️',
    category: 'consistency',
    tier: 'silver',
    points: 75,
    condition: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Complete tasks for 30 consecutive days',
    icon: '👑',
    category: 'consistency',
    tier: 'gold',
    points: 300,
    condition: (stats) => stats.currentStreak >= 30,
  },
  {
    id: 'legendary_streak',
    name: 'Legendary Streak',
    description: 'Complete tasks for 100 consecutive days',
    icon: '🏆',
    category: 'consistency',
    tier: 'diamond',
    points: 1000,
    condition: (stats) => stats.currentStreak >= 100,
  },

  // Quality Achievements
  {
    id: 'priority_master',
    name: 'Priority Master',
    description: 'Complete 10 high-priority tasks',
    icon: '🎖️',
    category: 'quality',
    tier: 'silver',
    points: 60,
    condition: (stats) => stats.highPriorityCompleted >= 10,
  },
  {
    id: 'no_overdue',
    name: 'On Time Champion',
    description: 'Have no overdue tasks for a week',
    icon: '⏰',
    category: 'quality',
    tier: 'gold',
    points: 150,
    condition: (stats) => stats.overdueTasks === 0 && stats.weekCompleted >= 5,
  },
  {
    id: 'efficiency_expert',
    name: 'Efficiency Expert',
    description: 'Achieve 90+ productivity score',
    icon: '📈',
    category: 'quality',
    tier: 'platinum',
    points: 250,
    condition: (stats) => stats.productivityScore >= 90,
  },

  // Project Achievements
  {
    id: 'project_starter',
    name: 'Project Starter',
    description: 'Create your first project',
    icon: '📁',
    category: 'milestone',
    tier: 'bronze',
    points: 20,
    condition: (stats, tasks, projects) => projects.length >= 1,
  },
  {
    id: 'project_finisher',
    name: 'Project Finisher',
    description: 'Complete all tasks in a project',
    icon: '✅',
    category: 'milestone',
    tier: 'silver',
    points: 100,
    condition: (stats, tasks, projects) => {
      return projects.some(project => {
        const projectTasks = tasks.filter(t => t.projectId === project.id);
        return projectTasks.length > 0 && projectTasks.every(t => t.completed);
      });
    },
  },
  {
    id: 'multi_project_master',
    name: 'Multi-Project Master',
    description: 'Work on 5 different projects',
    icon: '🎭',
    category: 'milestone',
    tier: 'gold',
    points: 200,
    condition: (stats, tasks, projects) => projects.length >= 5,
  },

  // Special Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a task before 7 AM',
    icon: '🌅',
    category: 'special',
    tier: 'bronze',
    points: 25,
    condition: (stats, tasks) => {
      return tasks.some(task => {
        if (!task.completed) return false;
        const completedHour = new Date(task.updatedAt).getHours();
        return completedHour < 7;
      });
    },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🦉',
    category: 'special',
    tier: 'bronze',
    points: 25,
    condition: (stats, tasks) => {
      return tasks.some(task => {
        if (!task.completed) return false;
        const completedHour = new Date(task.updatedAt).getHours();
        return completedHour >= 22;
      });
    },
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Complete tasks on both Saturday and Sunday',
    icon: '🏖️',
    category: 'special',
    tier: 'silver',
    points: 50,
    condition: (stats, tasks) => {
      const weekendTasks = tasks.filter(task => {
        if (!task.completed) return false;
        const day = new Date(task.updatedAt).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
      
      const hasSaturday = weekendTasks.some(task => new Date(task.updatedAt).getDay() === 6);
      const hasSunday = weekendTasks.some(task => new Date(task.updatedAt).getDay() === 0);
      
      return hasSaturday && hasSunday;
    },
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 5 tasks in one hour',
    icon: '💨',
    category: 'special',
    tier: 'gold',
    points: 150,
    condition: (stats, tasks) => {
      const completedTasks = tasks.filter(t => t.completed)
        .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      
      for (let i = 0; i <= completedTasks.length - 5; i++) {
        const firstTask = new Date(completedTasks[i].updatedAt);
        const fifthTask = new Date(completedTasks[i + 4].updatedAt);
        const timeDiff = fifthTask.getTime() - firstTask.getTime();
        
        if (timeDiff <= 60 * 60 * 1000) { // 1 hour in milliseconds
          return true;
        }
      }
      return false;
    },
    hidden: true,
  },
];

export const achievementCategories: Record<string, AchievementCategory> = {
  productivity: {
    name: 'Productivity',
    description: 'Task completion achievements',
    color: 'blue',
    icon: '⚡',
  },
  consistency: {
    name: 'Consistency',
    description: 'Streak and habit achievements',
    color: 'green',
    icon: '🔗',
  },
  quality: {
    name: 'Quality',
    description: 'Excellence and efficiency achievements',
    color: 'purple',
    icon: '⭐',
  },
  milestone: {
    name: 'Milestones',
    description: 'Major accomplishment achievements',
    color: 'orange',
    icon: '🏆',
  },
  special: {
    name: 'Special',
    description: 'Unique and fun achievements',
    color: 'pink',
    icon: '🎉',
  },
};

export const useAchievementSystem = (tasks: Task[], projects: Project[]) => {
  const { addNotification, settings } = useNotification();
  const { stats } = useProductivityAnalytics(tasks, projects);
  const unlockedAchievementsRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<Date>(new Date());

  // Load unlocked achievements from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('taskflow_achievements');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        unlockedAchievementsRef.current = new Set(parsed);
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    }
  }, []);

  // Save unlocked achievements to localStorage
  const saveAchievements = () => {
    localStorage.setItem(
      'taskflow_achievements',
      JSON.stringify(Array.from(unlockedAchievementsRef.current))
    );
  };

  // Calculate current achievements
  const achievements = useMemo((): Achievement[] => {
    return achievementDefinitions.map(def => {
      const unlocked = unlockedAchievementsRef.current.has(def.id);
      const meetsCondition = def.condition(stats, tasks, projects);
      
      // Calculate progress for progressive achievements
      let progress = 0;
      if (!unlocked && meetsCondition) {
        progress = 100;
      } else if (!unlocked) {
        // Calculate partial progress for some achievements
        if (def.id === 'century_club') {
          const completed = tasks.filter(t => t.completed).length;
          progress = Math.min(100, (completed / 100) * 100);
        } else if (def.id === 'streak_starter') {
          progress = Math.min(100, (stats.currentStreak / 3) * 100);
        } else if (def.id === 'week_warrior') {
          progress = Math.min(100, (stats.currentStreak / 7) * 100);
        } else if (def.id === 'month_master') {
          progress = Math.min(100, (stats.currentStreak / 30) * 100);
        }
      }

      return {
        ...def,
        unlocked,
        progress,
      };
    });
  }, [stats, tasks, projects]);

  // Check for newly unlocked achievements
  useEffect(() => {
    if (!settings.achievementUnlocked) return;

    achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(stats, tasks, projects)) {
        // Achievement unlocked!
        unlockedAchievementsRef.current.add(achievement.id);
        
        addNotification(createNotificationFromTemplate('ACHIEVEMENT_UNLOCKED', {
          achievementName: achievement.name,
          achievementDescription: achievement.description,
          achievementIcon: achievement.icon,
          achievementTier: achievement.tier,
          achievementPoints: achievement.points,
          achievementCategory: achievement.category,
        }));
      }
    });

    saveAchievements();
  }, [achievements, stats, tasks, projects, settings.achievementUnlocked, addNotification]);

  // Calculate total points and level
  const totalPoints = useMemo(() => {
    return achievements
      .filter(a => a.unlocked)
      .reduce((total, a) => total + a.points, 0);
  }, [achievements]);

  const level = useMemo(() => {
    // Level calculation: every 500 points = 1 level
    return Math.floor(totalPoints / 500) + 1;
  }, [totalPoints]);

  const pointsToNextLevel = useMemo(() => {
    const currentLevelPoints = (level - 1) * 500;
    const nextLevelPoints = level * 500;
    return nextLevelPoints - totalPoints;
  }, [level, totalPoints]);

  // Get achievements by category
  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(a => a.category === category);
  };

  // Get recent achievements (last 7 days)
  const getRecentAchievements = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return achievements.filter(a => 
      a.unlocked && a.unlockedAt && new Date(a.unlockedAt) >= weekAgo
    );
  };

  // Reset achievements (for testing)
  const resetAchievements = () => {
    unlockedAchievementsRef.current.clear();
    localStorage.removeItem('taskflow_achievements');
  };

  return {
    achievements,
    totalPoints,
    level,
    pointsToNextLevel,
    getAchievementsByCategory,
    getRecentAchievements,
    resetAchievements,
  };
};
