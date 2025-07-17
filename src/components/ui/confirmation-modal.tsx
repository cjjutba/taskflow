import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';
import { Button } from './button';
import { ConfirmationModalProps, ConfirmationVariant } from '../../types/confirmation.types';

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  options
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if not open or no options
  if (!isOpen || !options) return null;

  const {
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'info',
    icon,
    details = [],
    onConfirm,
    onCancel
  } = options;

  // Get variant-specific styling
  const getVariantStyles = (variant: ConfirmationVariant) => {
    switch (variant) {
      case 'destructive':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-50 dark:bg-red-950/20',
          confirmButton: 'destructive' as const
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-50 dark:bg-yellow-950/20',
          confirmButton: 'default' as const
        };
      case 'info':
      default:
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-50 dark:bg-blue-950/20',
          confirmButton: 'default' as const
        };
    }
  };

  const variantStyles = getVariantStyles(variant);

  // Get default icon based on variant
  const getDefaultIcon = (variant: ConfirmationVariant) => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="w-6 h-6" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />;
      case 'info':
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-description"
    >
      {/* Solid Background Overlay */}
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-border animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="p-6">
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${variantStyles.iconBg}`}>
              <div className={variantStyles.iconColor}>
                {icon || getDefaultIcon(variant)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 
                id="confirmation-title"
                className="text-lg font-semibold text-foreground mb-2"
              >
                {title}
              </h2>
              <p 
                id="confirmation-description"
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {description}
              </p>
            </div>
          </div>

          {/* Details List */}
          {details.length > 0 && (
            <div className="mb-6 ml-16">
              <ul className="space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="min-w-[80px]"
            >
              {cancelText}
            </Button>
            <Button
              variant={variantStyles.confirmButton}
              onClick={handleConfirm}
              className="min-w-[80px]"
              autoFocus
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
