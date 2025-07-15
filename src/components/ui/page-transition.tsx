import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

interface FadeTransitionProps {
  children: ReactNode;
  className?: string;
}

export function FadeTransition({ children, className }: FadeTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export function SlideTransition({ 
  children, 
  direction = 'right', 
  className 
}: SlideTransitionProps) {
  const directionOffset = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: -100 },
    down: { y: 100 },
  };

  return (
    <motion.div
      initial={directionOffset[direction]}
      animate={{ x: 0, y: 0 }}
      exit={directionOffset[direction]}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
