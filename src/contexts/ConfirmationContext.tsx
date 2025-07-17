import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationContextType, ConfirmationOptions, ConfirmationState } from '../types/confirmation.types';
import ConfirmationModal from '../components/ui/confirmation-modal';

// Create the context
const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

// Provider component props
interface ConfirmationProviderProps {
  children: ReactNode;
}

// Provider component
export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    options: null
  });

  const showConfirmation = (options: ConfirmationOptions) => {
    setState({
      isOpen: true,
      options
    });
  };

  const hideConfirmation = () => {
    setState({
      isOpen: false,
      options: null
    });
  };

  const contextValue: ConfirmationContextType = {
    showConfirmation,
    hideConfirmation,
    isOpen: state.isOpen
  };

  return (
    <ConfirmationContext.Provider value={contextValue}>
      {children}
      <ConfirmationModal
        isOpen={state.isOpen}
        onClose={hideConfirmation}
        options={state.options}
      />
    </ConfirmationContext.Provider>
  );
};

// Custom hook to use the confirmation context
export const useConfirmation = (): ConfirmationContextType => {
  const context = useContext(ConfirmationContext);
  
  if (context === undefined) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  
  return context;
};

// Export the context for advanced use cases
export { ConfirmationContext };
