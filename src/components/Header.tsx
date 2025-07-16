import React from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import { Button } from './ui/button';
import NotificationDropdown from './NotificationDropdown';
import { BreadcrumbNavigation, CompactBreadcrumb } from './Header/BreadcrumbNavigation';
import { HeaderSearchBar } from './Header/HeaderSearchBar';
import { PomodoroTimer } from './Header/PomodoroTimer';
import { ThemeToggle } from './Header/ThemeToggle';

export default function Header() {
  const { state, dispatch } = useTask();

  const toggleSidebar = () => {
    dispatch({
      type: 'SET_UI',
      payload: { key: 'sidebarOpen', value: !state.ui.sidebarOpen }
    });
  };

  return (
    <header
      className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex-shrink-0 w-full sticky top-0 z-40"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center h-full px-4 gap-4 w-full min-w-0">
        {/* Left side - Mobile menu toggle + Breadcrumb */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Toggle - Always show hamburger */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </Button>

          {/* Breadcrumb Navigation */}
          <div className="hidden md:block min-w-0">
            <BreadcrumbNavigation />
          </div>

          {/* Compact breadcrumb for mobile */}
          <div className="md:hidden min-w-0">
            <CompactBreadcrumb />
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="hidden sm:flex justify-center flex-1">
          <div className="w-full max-w-md">
            <HeaderSearchBar />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 flex-1 justify-end">
          {/* Pomodoro Timer */}
          <div className="hidden md:block">
            <PomodoroTimer />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}