import { useState, useEffect, useCallback, useRef } from 'react';

interface TouchGesture {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
  timestamp: number;
}

interface MobileOptimizationOptions {
  enableSwipeGestures: boolean;
  enablePullToRefresh: boolean;
  enableHapticFeedback: boolean;
  swipeThreshold: number;
  velocityThreshold: number;
  adaptiveLayout: boolean;
}

const defaultOptions: MobileOptimizationOptions = {
  enableSwipeGestures: true,
  enablePullToRefresh: true,
  enableHapticFeedback: true,
  swipeThreshold: 50,
  velocityThreshold: 0.3,
  adaptiveLayout: true,
};

export const useMobileOptimization = (options: Partial<MobileOptimizationOptions> = {}) => {
  const config = { ...defaultOptions, ...options };
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  const touchStartRef = useRef<TouchGesture | null>(null);
  const touchMoveRef = useRef<TouchGesture | null>(null);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTabletDevice = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent) || 
        (window.innerWidth >= 768 && window.innerWidth <= 1024);
      
      setIsMobile(isMobileDevice && !isTabletDevice);
      setIsTablet(isTabletDevice);
    };

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    const updateViewportHeight = () => {
      // Use visual viewport API if available for better mobile support
      if ('visualViewport' in window) {
        setViewportHeight(window.visualViewport!.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    const updateSafeAreaInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0'),
      });
    };

    checkDevice();
    checkOrientation();
    updateViewportHeight();
    updateSafeAreaInsets();

    window.addEventListener('resize', checkDevice);
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', checkOrientation);

    if ('visualViewport' in window) {
      window.visualViewport!.addEventListener('resize', updateViewportHeight);
    }

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', checkOrientation);
      
      if ('visualViewport' in window) {
        window.visualViewport!.removeEventListener('resize', updateViewportHeight);
      }
    };
  }, []);

  // Haptic feedback
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
    if (!config.enableHapticFeedback || !isMobile) return;

    // Use Haptic API if available (iOS Safari)
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        selection: [5],
      };
      navigator.vibrate(patterns[type]);
    }

    // Use Vibration API for Android
    if ('vibrate' in navigator) {
      const durations = {
        light: 10,
        medium: 20,
        heavy: 30,
        selection: 5,
      };
      navigator.vibrate(durations[type]);
    }
  }, [config.enableHapticFeedback, isMobile]);

  // Touch gesture handling
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!config.enableSwipeGestures) return;

    const touch = event.touches[0];
    touchStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      direction: null,
      distance: 0,
      velocity: 0,
      timestamp: Date.now(),
    };
  }, [config.enableSwipeGestures]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!config.enableSwipeGestures || !touchStartRef.current) return;

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.startX;
    const deltaY = touch.clientY - touchStartRef.current.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const timeDelta = Date.now() - touchStartRef.current.timestamp;
    const velocity = distance / timeDelta;

    let direction: TouchGesture['direction'] = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    touchMoveRef.current = {
      ...touchStartRef.current,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY,
      direction,
      distance,
      velocity,
    };
  }, [config.enableSwipeGestures]);

  const handleTouchEnd = useCallback((
    event: TouchEvent,
    onSwipe?: (gesture: TouchGesture) => void
  ) => {
    if (!config.enableSwipeGestures || !touchMoveRef.current) return;

    const gesture = touchMoveRef.current;
    
    // Check if gesture meets threshold requirements
    if (gesture.distance >= config.swipeThreshold && gesture.velocity >= config.velocityThreshold) {
      triggerHapticFeedback('selection');
      onSwipe?.(gesture);
    }

    touchStartRef.current = null;
    touchMoveRef.current = null;
  }, [config.enableSwipeGestures, config.swipeThreshold, config.velocityThreshold, triggerHapticFeedback]);

  // Swipe gesture hook for notifications
  const useSwipeGesture = (
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void,
    onSwipeUp?: () => void,
    onSwipeDown?: () => void
  ) => {
    return {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: (event: TouchEvent) => {
        handleTouchEnd(event, (gesture) => {
          switch (gesture.direction) {
            case 'left':
              onSwipeLeft?.();
              break;
            case 'right':
              onSwipeRight?.();
              break;
            case 'up':
              onSwipeUp?.();
              break;
            case 'down':
              onSwipeDown?.();
              break;
          }
        });
      },
    };
  };

  // Mobile-specific styles
  const getMobileStyles = useCallback(() => {
    if (!isMobile && !isTablet) return {};

    return {
      // Touch-friendly sizing
      '--touch-target-size': '44px',
      '--mobile-padding': '16px',
      '--mobile-gap': '12px',
      
      // Safe area support
      '--safe-area-top': `${safeAreaInsets.top}px`,
      '--safe-area-right': `${safeAreaInsets.right}px`,
      '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
      '--safe-area-left': `${safeAreaInsets.left}px`,
      
      // Viewport height
      '--mobile-vh': `${viewportHeight}px`,
      
      // Responsive breakpoints
      '--mobile-breakpoint': isMobile ? '1' : '0',
      '--tablet-breakpoint': isTablet ? '1' : '0',
    } as React.CSSProperties;
  }, [isMobile, isTablet, safeAreaInsets, viewportHeight]);

  // Notification dropdown positioning for mobile
  const getDropdownPosition = useCallback(() => {
    if (!isMobile) return {};

    return {
      position: 'fixed' as const,
      top: `calc(var(--header-height) + var(--safe-area-top))`,
      left: 'var(--safe-area-left)',
      right: 'var(--safe-area-right)',
      bottom: 'var(--safe-area-bottom)',
      width: 'auto',
      maxWidth: 'none',
      maxHeight: `calc(var(--mobile-vh) - var(--header-height) - var(--safe-area-top) - var(--safe-area-bottom))`,
      borderRadius: isMobile ? '0' : '8px',
      border: isMobile ? 'none' : '1px solid hsl(var(--border))',
    };
  }, [isMobile]);

  // Adaptive notification item sizing
  const getNotificationItemStyles = useCallback(() => {
    const baseStyles = {
      minHeight: 'var(--touch-target-size)',
      padding: 'var(--mobile-padding)',
      gap: 'var(--mobile-gap)',
    };

    if (isMobile) {
      return {
        ...baseStyles,
        fontSize: '16px', // Prevent zoom on iOS
        lineHeight: '1.4',
      };
    }

    return baseStyles;
  }, [isMobile]);

  // Pull to refresh functionality
  const usePullToRefresh = (onRefresh: () => Promise<void>) => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const pullThreshold = 80;

    const handlePullStart = useCallback((event: TouchEvent) => {
      if (!config.enablePullToRefresh || window.scrollY > 0) return;
      
      const touch = event.touches[0];
      touchStartRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX: 0,
        deltaY: 0,
        direction: null,
        distance: 0,
        velocity: 0,
        timestamp: Date.now(),
      };
    }, [config.enablePullToRefresh]);

    const handlePullMove = useCallback((event: TouchEvent) => {
      if (!config.enablePullToRefresh || !touchStartRef.current || window.scrollY > 0) return;

      const touch = event.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.startY;
      
      if (deltaY > 0) {
        event.preventDefault();
        setIsPulling(true);
        setPullDistance(Math.min(deltaY, pullThreshold * 1.5));
      }
    }, [config.enablePullToRefresh, pullThreshold]);

    const handlePullEnd = useCallback(async () => {
      if (!config.enablePullToRefresh || !isPulling) return;

      if (pullDistance >= pullThreshold) {
        triggerHapticFeedback('medium');
        await onRefresh();
      }

      setIsPulling(false);
      setPullDistance(0);
      touchStartRef.current = null;
    }, [config.enablePullToRefresh, isPulling, pullDistance, pullThreshold, onRefresh, triggerHapticFeedback]);

    return {
      isPulling,
      pullDistance,
      pullProgress: Math.min(pullDistance / pullThreshold, 1),
      onTouchStart: handlePullStart,
      onTouchMove: handlePullMove,
      onTouchEnd: handlePullEnd,
    };
  };

  return {
    // Device info
    isMobile,
    isTablet,
    orientation,
    viewportHeight,
    safeAreaInsets,
    
    // Gesture handling
    useSwipeGesture,
    usePullToRefresh,
    triggerHapticFeedback,
    
    // Styling helpers
    getMobileStyles,
    getDropdownPosition,
    getNotificationItemStyles,
    
    // Configuration
    config,
  };
};
