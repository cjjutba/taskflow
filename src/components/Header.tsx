import React, { useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import { NotificationDropdown } from './NotificationDropdown';
import { BreadcrumbNavigation, CompactBreadcrumb } from './Header/BreadcrumbNavigation';
import { HeaderSearchBar } from './Header/HeaderSearchBar';
import { PomodoroTimer } from './Header/PomodoroTimer';
import { ThemeToggle } from './Header/ThemeToggle';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';

export default function Header() {
  const { state } = useTask();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header
      className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex-shrink-0 w-full sticky top-0 z-40"
      style={{ height: 'var(--header-height)' }}
    >
      {/* Main Header Row */}
      <div className="flex items-center h-full px-4 gap-2 sm:gap-4 w-full min-w-0">
        {/* Left side - Breadcrumb */}
        <div className={`flex items-center gap-2 sm:gap-4 flex-1 min-w-0 transition-all duration-300 ${
          !state.ui.sidebarOpen ? 'ml-12' : 'ml-0'
        }`}>
          {/* Breadcrumb Navigation */}
          <div className="hidden md:block min-w-0">
            <BreadcrumbNavigation />
          </div>

          {/* Compact breadcrumb for mobile */}
          <div className="md:hidden min-w-0">
            <CompactBreadcrumb />
          </div>
        </div>

        {/* Center - Search Bar (Desktop) */}
        <div className="hidden sm:flex justify-center flex-1">
          <div className="w-full max-w-md">
            <HeaderSearchBar />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 flex-1 justify-end">
          {/* Mobile Search Toggle */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className={cn(
                "h-8 w-8 p-0",
                showMobileSearch && "bg-muted"
              )}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Actions Menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-background border-border shadow-lg">
                <div className="p-2">
                  {/* Mobile Pomodoro Timer */}
                  <div className="mb-2">
                    <PomodoroTimer />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Pomodoro Timer */}
          <div className="hidden sm:block">
            <PomodoroTimer />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationDropdown />
        </div>
      </div>

      {/* Mobile Search Bar (Expandable) */}
      {showMobileSearch && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-2">
          <HeaderSearchBar />
        </div>
      )}
    </header>
  );
}