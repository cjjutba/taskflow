import { ReactNode } from 'react';

export type ConfirmationVariant = 'destructive' | 'warning' | 'info';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  icon?: ReactNode;
  details?: string[];
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
}

export interface ConfirmationContextType {
  showConfirmation: (options: ConfirmationOptions) => void;
  hideConfirmation: () => void;
  isOpen: boolean;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: ConfirmationOptions | null;
}
