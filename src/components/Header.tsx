import React, { useState } from 'react';
import { Search, Menu, Settings, X } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  const { state, dispatch } = useTask();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const toggleSidebar = () => {
    dispatch({
      type: 'SET_UI',
      payload: { key: 'sidebarOpen', value: !state.ui.sidebarOpen }
    });
  };

  const handleSearch = (value: string) => {
    dispatch({
      type: 'SET_FILTER',
      payload: { key: 'search', value }
    });
  };

  const clearSearch = () => {
    handleSearch('');
    setShowMobileSearch(false);
  };

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left Side */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">T</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold text-lg">TaskFlow</h1>
                <p className="text-xs text-muted-foreground hidden lg:block">Task Management</p>
              </div>
            </div>
          </div>

          {/* Center - Search (Desktop) */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-10 pr-8 bg-white border border-border shadow-sm rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={state.filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {state.filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 hover:bg-muted rounded-sm"
                  onClick={clearSearch}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => dispatch({ type: 'SET_UI', payload: { key: 'activeView', value: 'settings' } })}
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-8 h-8 p-0 rounded-full bg-muted">
                  <span className="text-sm font-medium">JD</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-lg">
                <DropdownMenuItem onClick={() => dispatch({ type: 'SET_UI', payload: { key: 'activeView', value: 'settings' } })}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-4 border-b border-border bg-background">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-10 pr-8 bg-white border border-border shadow-sm rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                value={state.filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              {state.filters.search && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 hover:bg-muted rounded-sm"
                  onClick={clearSearch}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Overlay */}
      {state.ui.sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          style={{ top: 'var(--header-height)' }}
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}