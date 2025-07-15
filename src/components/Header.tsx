import React from 'react';
import { Settings, PanelLeftOpen } from 'lucide-react';
import { useTask } from '../contexts/TaskContext';
import { Button } from './ui/button';
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

  const toggleSidebar = () => {
    dispatch({
      type: 'SET_UI',
      payload: { key: 'sidebarOpen', value: !state.ui.sidebarOpen }
    });
  };

  return (
    <header
      className="bg-background border-b border-border flex-shrink-0 w-full"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex items-center justify-end h-full px-4 gap-2 w-full min-w-0">
        {/* Mobile Menu Toggle - Only show on mobile when sidebar is closed */}
        {!state.ui.sidebarOpen && (
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2 mr-auto"
            onClick={toggleSidebar}
          >
            <PanelLeftOpen className="w-5 h-5" />
          </Button>
        )}

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
    </header>
  );
}