import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  const defaultIcon = (
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
      <Info className="w-8 h-8 text-muted-foreground" />
    </div>
  );

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-4',
      className
    )}>
      {icon || defaultIcon}
      <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ 
  variant = 'info', 
  title, 
  children, 
  className 
}: AlertProps) {
  const variants = {
    info: {
      icon: Info,
      className: 'bg-primary/10 border-primary/20 text-primary'
    },
    success: {
      icon: CheckCircle,
      className: 'bg-success/10 border-success/20 text-success'
    },
    warning: {
      icon: AlertTriangle,
      className: 'bg-warning/10 border-warning/20 text-warning'
    },
    error: {
      icon: XCircle,
      className: 'bg-destructive/10 border-destructive/20 text-destructive'
    }
  };

  const { icon: Icon, className: variantClassName } = variants[variant];

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border',
      variantClassName,
      className
    )}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
        )}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}