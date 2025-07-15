import React from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  duration?: number;
  onDismiss?: () => void;
}

const variants = {
  default: {
    icon: Info,
    className: 'bg-background border-border text-foreground'
  },
  success: {
    icon: Check,
    className: 'bg-success text-success-foreground border-success'
  },
  destructive: {
    icon: X,
    className: 'bg-destructive text-destructive-foreground border-destructive'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-warning text-warning-foreground border-warning'
  },
  info: {
    icon: Info,
    className: 'bg-primary text-primary-foreground border-primary'
  }
};

export function Toast({
  title,
  description,
  variant = 'default',
  onDismiss
}: ToastProps) {
  const { icon: Icon, className } = variants[variant];

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[400px]',
      className
    )}>
      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        {title && (
          <h4 className="font-semibold text-sm leading-tight">{title}</h4>
        )}
        {description && (
          <p className="text-sm opacity-90 leading-relaxed">{description}</p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}