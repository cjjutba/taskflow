import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark'; // The actual applied theme
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Calculate actual theme based on theme setting
  const calculateActualTheme = (themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return getSystemTheme();
    }
    return themeValue;
  };

  // Apply theme to document
  const applyTheme = (themeValue: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (themeValue === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    setActualTheme(themeValue);
  };

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('taskflow-theme', newTheme);
    
    const actualThemeValue = calculateActualTheme(newTheme);
    applyTheme(actualThemeValue);
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    if (actualTheme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    // Get saved theme or default to system
    const savedTheme = localStorage.getItem('taskflow-theme') as Theme;
    const initialTheme = savedTheme || 'system';
    
    setThemeState(initialTheme);
    
    const actualThemeValue = calculateActualTheme(initialTheme);
    applyTheme(actualThemeValue);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const newActualTheme = getSystemTheme();
        applyTheme(newActualTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
