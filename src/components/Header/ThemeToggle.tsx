import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

export function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme();

  const getThemeIcon = () => {
    switch (actualTheme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
          aria-label="Toggle theme"
        >
          <div className="relative">
            {getThemeIcon()}
            {/* Subtle indicator for system theme */}
            {theme === 'system' && (
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            "flex items-center gap-2",
            theme === 'light' && "bg-muted"
          )}
        >
          <Sun className="w-4 h-4" />
          <span>Light</span>
          {theme === 'light' && (
            <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            "flex items-center gap-2",
            theme === 'dark' && "bg-muted"
          )}
        >
          <Moon className="w-4 h-4" />
          <span>Dark</span>
          {theme === 'dark' && (
            <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            "flex items-center gap-2",
            theme === 'system' && "bg-muted"
          )}
        >
          <Monitor className="w-4 h-4" />
          <span>System</span>
          {theme === 'system' && (
            <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple toggle version (for mobile or minimal UI)
export function SimpleThemeToggle() {
  const { toggleTheme, actualTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0"
      aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="relative transition-transform duration-200 hover:scale-110">
        {actualTheme === 'light' ? (
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all" />
        ) : (
          <Moon className="w-4 h-4 rotate-0 scale-100 transition-all" />
        )}
      </div>
    </Button>
  );
}
