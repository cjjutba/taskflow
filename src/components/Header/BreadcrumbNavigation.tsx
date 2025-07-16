import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTask } from '../../contexts/TaskContext';
import { cn } from '../../lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive: boolean;
}

export function BreadcrumbNavigation() {
  const location = useLocation();
  const params = useParams();
  const { state } = useTask();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Home for non-root paths
    if (path !== '/') {
      breadcrumbs.push({
        label: 'Home',
        path: '/',
        isActive: false
      });
    }

    // Generate breadcrumbs based on current route
    switch (path) {
      case '/':
        breadcrumbs.push({
          label: 'Today',
          path: '/',
          isActive: true
        });
        break;

      case '/inbox':
        breadcrumbs.push({
          label: 'Inbox',
          path: '/inbox',
          isActive: true
        });
        break;

      case '/all-tasks':
        breadcrumbs.push({
          label: 'All Tasks',
          path: '/all-tasks',
          isActive: true
        });
        break;

      case '/completed':
        breadcrumbs.push({
          label: 'Completed',
          path: '/completed',
          isActive: true
        });
        break;

      case '/analytics':
        breadcrumbs.push({
          label: 'Analytics',
          path: '/analytics',
          isActive: true
        });
        break;

      default:
        // Handle project pages
        if (path.startsWith('/project/')) {
          const projectId = params.projectId;
          const project = state.projects.find(p => p.id === projectId);
          
          breadcrumbs.push({
            label: 'Projects',
            path: '/projects', // Future projects listing page
            isActive: false
          });
          
          breadcrumbs.push({
            label: project?.name || 'Project',
            path: path,
            isActive: true
          });
        } else {
          // Fallback for unknown routes
          breadcrumbs.push({
            label: 'Page',
            path: path,
            isActive: true
          });
        }
        break;
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if only one item (root page)
  if (breadcrumbs.length <= 1 && location.pathname === '/') {
    return (
      <div className="flex items-center text-sm text-foreground font-medium">
        <Home className="w-4 h-4 mr-2" />
        <span>Today</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
            )}
            
            {breadcrumb.isActive ? (
              <span className={cn(
                "font-medium text-foreground truncate",
                index === 0 && "flex items-center"
              )}>
                {index === 0 && breadcrumb.label === 'Home' && (
                  <Home className="w-4 h-4 mr-1 flex-shrink-0" />
                )}
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.path}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors truncate",
                  index === 0 && "flex items-center"
                )}
              >
                {index === 0 && breadcrumb.label === 'Home' && (
                  <Home className="w-4 h-4 mr-1 flex-shrink-0" />
                )}
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Mobile-friendly compact version
export function CompactBreadcrumb() {
  const location = useLocation();
  const params = useParams();
  const { state } = useTask();

  const getCurrentPageTitle = (): string => {
    const path = location.pathname;
    
    switch (path) {
      case '/':
        return 'Today';
      case '/inbox':
        return 'Inbox';
      case '/all-tasks':
        return 'All Tasks';
      case '/completed':
        return 'Completed';
      case '/analytics':
        return 'Analytics';
      default:
        if (path.startsWith('/project/')) {
          const projectId = params.projectId;
          const project = state.projects.find(p => p.id === projectId);
          return project?.name || 'Project';
        }
        return 'Page';
    }
  };

  return (
    <div className="flex items-center text-sm text-foreground font-medium">
      <Home className="w-4 h-4 mr-2 flex-shrink-0" />
      <span className="truncate">{getCurrentPageTitle()}</span>
    </div>
  );
}
