import React, { useState } from 'react';
import { Search, Plus, Menu, Bell, Settings } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function Header() {
  const { state, dispatch } = useTask();
  const [showSearch, setShowSearch] = useState(false);

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

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">T</span>
            </div>
            <h1 className="font-semibold text-lg hidden sm:block">TaskFlow</h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 bg-surface border-border"
              value={state.filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Bell className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center ml-2">
            <span className="text-sm font-medium">JD</span>
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      {showSearch && (
        <div className="md:hidden px-4 pb-4 border-b border-border bg-background">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 bg-surface border-border"
              value={state.filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}