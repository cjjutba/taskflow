import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Target, Sparkles, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';
import { useAchievementSystem, Achievement, achievementCategories } from '../../hooks/useAchievementSystem';
import { useTask } from '../../contexts/TaskContext';
import { animationVariants, animationClasses } from '../../utils/animations';

interface AchievementPanelProps {
  trigger?: React.ReactNode;
}

const tierColors = {
  bronze: 'text-amber-600 bg-amber-50 border-amber-200',
  silver: 'text-gray-600 bg-gray-50 border-gray-200',
  gold: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  platinum: 'text-purple-600 bg-purple-50 border-purple-200',
  diamond: 'text-blue-600 bg-blue-50 border-blue-200',
};

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
  diamond: '💠',
};

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const tierColor = tierColors[achievement.tier];
  const tierIcon = tierIcons[achievement.tier];

  return (
    <motion.div
      variants={animationVariants.achievementCard}
      custom={index}
      whileHover="hover"
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-200 cursor-pointer",
        achievement.unlocked
          ? "bg-background border-border shadow-sm"
          : "bg-muted/30 border-muted opacity-60"
      )}
    >
      {/* Tier badge */}
      <div className="absolute top-2 right-2">
        <Badge variant="outline" className={cn("text-xs", tierColor)}>
          {tierIcon} {achievement.tier}
        </Badge>
      </div>

      {/* Achievement icon and info */}
      <div className="flex items-start gap-3">
        <motion.div
          className="text-2xl"
          animate={achievement.unlocked ? {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          } : {}}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {achievement.unlocked ? achievement.icon : '🔒'}
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-sm",
            achievement.unlocked ? "text-foreground" : "text-muted-foreground"
          )}>
            {achievement.name}
          </h3>
          
          <p className={cn(
            "text-xs mt-1",
            achievement.unlocked ? "text-muted-foreground" : "text-muted-foreground/70"
          )}>
            {achievement.description}
          </p>

          {/* Progress bar for locked achievements */}
          <AnimatePresence>
            {!achievement.unlocked && achievement.progress !== undefined && achievement.progress > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2"
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  style={{ originX: 0 }}
                >
                  <Progress value={achievement.progress} className="h-1" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-muted-foreground mt-1"
                >
                  {Math.round(achievement.progress)}% complete
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Points */}
          <div className="flex items-center justify-between mt-2">
            <Badge variant="secondary" className="text-xs">
              {achievement.points} points
            </Badge>
            
            {achievement.unlocked && achievement.unlockedAt && (
              <span className="text-xs text-muted-foreground">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AchievementPanel({ trigger }: AchievementPanelProps) {
  const { state } = useTask();
  const { 
    achievements, 
    totalPoints, 
    level, 
    pointsToNextLevel, 
    getAchievementsByCategory 
  } = useAchievementSystem(state.tasks, state.projects);
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const getFilteredAchievements = () => {
    if (activeTab === 'all') {
      return achievements.sort((a, b) => {
        // Sort by unlocked status first, then by tier, then by points
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        
        const tierOrder = { diamond: 5, platinum: 4, gold: 3, silver: 2, bronze: 1 };
        const tierDiff = tierOrder[b.tier] - tierOrder[a.tier];
        if (tierDiff !== 0) return tierDiff;
        
        return b.points - a.points;
      });
    }
    
    return getAchievementsByCategory(activeTab).sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return b.points - a.points;
    });
  };

  const filteredAchievements = getFilteredAchievements();

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Trophy className="h-4 w-4" />
      Achievements
      <Badge variant="secondary" className="ml-1">
        {unlockedCount}/{totalCount}
      </Badge>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Achievements
          </DialogTitle>
          <DialogDescription>
            Track your productivity milestones and unlock rewards for your accomplishments.
          </DialogDescription>
        </DialogHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{level}</div>
            <div className="text-xs text-muted-foreground">Level</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{totalPoints}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{unlockedCount}</div>
            <div className="text-xs text-muted-foreground">Unlocked</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{pointsToNextLevel}</div>
            <div className="text-xs text-muted-foreground">To Next Level</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Level {level} Progress</span>
            <span className="text-sm text-muted-foreground">
              {totalPoints % 500}/500 points
            </span>
          </div>
          <Progress value={(totalPoints % 500) / 5} className="h-2" />
        </div>

        {/* Achievement Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              All
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {achievements.length}
              </Badge>
            </TabsTrigger>
            
            {Object.entries(achievementCategories).map(([key, category]) => {
              const categoryAchievements = getAchievementsByCategory(key);
              const unlockedInCategory = categoryAchievements.filter(a => a.unlocked).length;
              
              return (
                <TabsTrigger key={key} value={key} className="text-xs">
                  <span className="mr-1">{category.icon}</span>
                  <span className="hidden sm:inline">{category.name}</span>
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {unlockedInCategory}/{categoryAchievements.length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-96">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial="hidden"
                animate="visible"
                variants={animationVariants.staggerContainer}
              >
                <AnimatePresence mode="popLayout">
                  {filteredAchievements.map((achievement, index) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {filteredAchievements.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No achievements in this category yet.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
