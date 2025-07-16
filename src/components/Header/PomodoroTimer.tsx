import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';
type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerSettings {
  work: number; // minutes
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.work * 60); // in seconds
  const [settings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current mode duration in seconds
  const getCurrentModeDuration = (): number => {
    switch (mode) {
      case 'work':
        return settings.work * 60;
      case 'shortBreak':
        return settings.shortBreak * 60;
      case 'longBreak':
        return settings.longBreak * 60;
      default:
        return settings.work * 60;
    }
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    const total = getCurrentModeDuration();
    return ((total - timeLeft) / total) * 100;
  };

  // Start timer
  const startTimer = () => {
    setStatus('running');
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer completed
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Pause timer
  const pauseTimer = () => {
    setStatus('paused');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset timer
  const resetTimer = () => {
    setStatus('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft(getCurrentModeDuration());
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    setStatus('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = mode === 'work' 
        ? 'Work session completed! Time for a break.' 
        : 'Break time over! Ready to focus?';
      
      new Notification('Pomodoro Timer', {
        body: message,
        icon: '/favicon.ico',
      });
    }

    // Auto-switch modes
    if (mode === 'work') {
      setCompletedPomodoros(prev => prev + 1);
      // Every 4 pomodoros, take a long break
      const nextMode = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      switchMode(nextMode);
    } else {
      switchMode('work');
    }
  };

  // Switch timer mode
  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setStatus('idle');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Set time for new mode
    const newTime = newMode === 'work' 
      ? settings.work * 60
      : newMode === 'shortBreak' 
        ? settings.shortBreak * 60
        : settings.longBreak * 60;
    
    setTimeLeft(newTime);
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update document title when timer is running
  useEffect(() => {
    if (status === 'running') {
      document.title = `${formatTime(timeLeft)} - ${mode === 'work' ? 'Focus' : 'Break'} | TaskFlow`;
    } else {
      document.title = 'TaskFlow - Task Management';
    }

    return () => {
      document.title = 'TaskFlow - Task Management';
    };
  }, [status, timeLeft, mode]);

  const getModeLabel = (): string => {
    switch (mode) {
      case 'work':
        return 'Focus';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return 'Focus';
    }
  };

  const getModeColor = (): string => {
    switch (mode) {
      case 'work':
        return 'text-blue-600';
      case 'shortBreak':
        return 'text-green-600';
      case 'longBreak':
        return 'text-purple-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 px-3 gap-2 relative",
            status === 'running' && "bg-primary/10 text-primary"
          )}
        >
          <Timer className="w-4 h-4" />
          <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
          
          {/* Progress indicator */}
          {status === 'running' && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-1000"
                 style={{ width: `${getProgress()}%` }} />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-3">
          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className={cn("text-2xl font-mono font-bold", getModeColor())}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-muted-foreground">
              {getModeLabel()}
            </div>
            {completedPomodoros > 0 && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {completedPomodoros} completed
              </Badge>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {status === 'idle' || status === 'paused' ? (
              <Button
                onClick={startTimer}
                size="sm"
                className="gap-1"
              >
                <Play className="w-3 h-3" />
                {status === 'paused' ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <Button
                onClick={pauseTimer}
                size="sm"
                variant="outline"
                className="gap-1"
              >
                <Pause className="w-3 h-3" />
                Pause
              </Button>
            )}
            
            <Button
              onClick={resetTimer}
              size="sm"
              variant="outline"
              className="gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-1">
            <DropdownMenuItem
              onClick={() => switchMode('work')}
              className={cn("justify-between", mode === 'work' && "bg-muted")}
            >
              <span>Focus Time</span>
              <span className="text-xs text-muted-foreground">{settings.work}m</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchMode('shortBreak')}
              className={cn("justify-between", mode === 'shortBreak' && "bg-muted")}
            >
              <span>Short Break</span>
              <span className="text-xs text-muted-foreground">{settings.shortBreak}m</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchMode('longBreak')}
              className={cn("justify-between", mode === 'longBreak' && "bg-muted")}
            >
              <span>Long Break</span>
              <span className="text-xs text-muted-foreground">{settings.longBreak}m</span>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
