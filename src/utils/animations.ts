// Animation utilities for notifications and UI components

export const animationVariants = {
  // Notification dropdown animations
  dropdownContainer: {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeIn"
      }
    }
  },

  // Individual notification item animations
  notificationItem: {
    hidden: {
      opacity: 0,
      x: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        delay: 0.05
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.95,
      height: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      transition: {
        duration: 0.25,
        ease: "easeIn"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    }
  },

  // Badge animations
  badge: {
    hidden: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "backOut",
        delay: 0.1
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.6,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 2
      }
    }
  },

  // Button animations
  button: {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    }
  },

  // Achievement panel animations
  achievementCard: {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        delay: index * 0.05
      }
    }),
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  },

  // Progress bar animations
  progressBar: {
    hidden: {
      scaleX: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2
      }
    }
  },

  // Modal animations
  modal: {
    hidden: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  },

  // Stagger container for lists
  staggerContainer: {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  },

  // Slide in from different directions
  slideInLeft: {
    hidden: {
      x: -100,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },

  slideInRight: {
    hidden: {
      x: 100,
      opacity: 0
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },

  slideInUp: {
    hidden: {
      y: 50,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },

  // Fade animations
  fadeIn: {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },

  fadeInUp: {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }
};

// Easing functions
export const easingFunctions = {
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.55, 0.06, 0.68, 0.19],
  easeInOut: [0.42, 0, 0.58, 1],
  backOut: [0.34, 1.56, 0.64, 1],
  bounceOut: [0.68, -0.55, 0.265, 1.55]
};

// Animation presets for common use cases
export const animationPresets = {
  // Quick fade for subtle elements
  quickFade: {
    duration: 0.15,
    ease: "easeOut"
  },

  // Standard animation for most UI elements
  standard: {
    duration: 0.25,
    ease: "easeOut"
  },

  // Smooth animation for important elements
  smooth: {
    duration: 0.35,
    ease: "easeOut"
  },

  // Bouncy animation for celebrations
  bouncy: {
    duration: 0.5,
    ease: "backOut"
  },

  // Slow animation for emphasis
  emphasis: {
    duration: 0.6,
    ease: "easeInOut"
  }
};

// Utility functions for animations
export const createStaggeredAnimation = (itemCount: number, baseDelay: number = 0.05) => {
  return {
    transition: {
      staggerChildren: baseDelay,
      delayChildren: baseDelay * 2
    }
  };
};

export const createDelayedAnimation = (delay: number, animation: any) => {
  return {
    ...animation,
    transition: {
      ...animation.transition,
      delay
    }
  };
};

// CSS classes for animations (for non-Framer Motion elements)
export const animationClasses = {
  // Hover effects
  hoverScale: 'transition-transform duration-150 ease-out hover:scale-105',
  hoverLift: 'transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg',
  hoverGlow: 'transition-all duration-200 ease-out hover:shadow-md hover:shadow-blue-500/25',
  
  // Focus effects
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  
  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
  
  // Transitions
  smooth: 'transition-all duration-300 ease-out',
  quick: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-500 ease-out',
  
  // Entrance animations
  fadeIn: 'animate-in fade-in duration-300',
  slideInUp: 'animate-in slide-in-from-bottom-4 duration-300',
  slideInDown: 'animate-in slide-in-from-top-4 duration-300',
  slideInLeft: 'animate-in slide-in-from-left-4 duration-300',
  slideInRight: 'animate-in slide-in-from-right-4 duration-300',
  
  // Exit animations
  fadeOut: 'animate-out fade-out duration-200',
  slideOutUp: 'animate-out slide-out-to-top-4 duration-200',
  slideOutDown: 'animate-out slide-out-to-bottom-4 duration-200',
  slideOutLeft: 'animate-out slide-out-to-left-4 duration-200',
  slideOutRight: 'animate-out slide-out-to-right-4 duration-200'
};
