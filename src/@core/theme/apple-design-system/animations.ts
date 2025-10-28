/**
 * Apple-Style Animation and Transition System
 *
 * This module implements Apple's animation principles with consistent timing,
 * easing functions, and reduced motion support for the quiz interface.
 *
 * Requirements addressed:
 * - 7.1: Consistent animation durations (150ms micro-interactions, 300ms transitions)
 * - 7.2: Apple-style cubic-bezier easing functions
 * - 7.4: Reduced motion support system
 * - 7.5: Ensure all animations serve functional purposes
 */

// ============================================================================
// ANIMATION DURATIONS (Requirement 7.1)
// ============================================================================

export const APPLE_ANIMATION_DURATIONS = {
  // Micro-interactions (150ms) - Requirement 7.1
  MICRO: 150, // Hover states, focus changes, button presses

  // Standard transitions (300ms) - Requirement 7.1
  STANDARD: 300, // State changes, layout shifts, component transitions

  // Complex animations
  COMPLEX: 500, // Page transitions, major view changes

  // Celebration sequence (Requirement 5.4)
  CELEBRATION: {
    TOTAL: 4000, // Complete within 4 seconds
    LOADING: 500, // Loading phase
    SCORE_REVEAL: 1200, // Score progression animation
    PERFORMANCE_CELEBRATION: 1500, // Performance-based effects
    MESSAGE_DISPLAY: 2000 // Typography transitions and messages
  },

  // Component-specific durations
  RADIO_SELECTION: 200, // Radio component feedback (Requirement 3.2)
  PROGRESS_CARD_COMPACT: 300, // Sticky behavior transition
  QUESTION_CARD_FOCUS: 150, // Gentle visual feedback (Requirement 2.3)
  SUBMIT_BUTTON_LOADING: 300, // Loading state transition

  // Touch interactions (mobile-optimized)
  TOUCH_FEEDBACK: 100, // Immediate touch response
  TOUCH_SCALE: 150, // Scale animation on press

  // Functional animation rule (Requirement 7.5)
  PURPOSE: 'All animations enhance usability and serve functional purposes'
} as const

// ============================================================================
// APPLE-STYLE EASING FUNCTIONS (Requirement 7.2)
// ============================================================================

export const APPLE_EASING_FUNCTIONS = {
  // Standard Apple easing curves
  STANDARD: 'cubic-bezier(0.4, 0, 0.2, 1)', // Most common Apple easing
  DECELERATE: 'cubic-bezier(0, 0, 0.2, 1)', // Entrance animations, elements appearing
  ACCELERATE: 'cubic-bezier(0.4, 0, 1, 1)', // Exit animations, elements disappearing
  SHARP: 'cubic-bezier(0.4, 0, 0.6, 1)', // Temporary elements, quick interactions

  // Apple's signature spring-like easing
  SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy, delightful interactions

  // Celebration-specific easing
  CELEBRATION_EASE: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth, elegant celebrations

  // Component-specific easing
  RADIO_EASE: 'cubic-bezier(0.4, 0, 0.2, 1)', // Radio component transitions
  PROGRESS_EASE: 'cubic-bezier(0, 0, 0.2, 1)', // Progress animations
  BUTTON_EASE: 'cubic-bezier(0.4, 0, 0.6, 1)', // Button interactions

  // Touch-optimized easing
  TOUCH_EASE: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Natural touch feedback

  // Apple design principle compliance
  APPLE_PRINCIPLE: 'Easing functions follow Apple design guidelines for natural motion'
} as const

// ============================================================================
// REDUCED MOTION SUPPORT SYSTEM (Requirement 7.4)
// ============================================================================

export const APPLE_REDUCED_MOTION = {
  // Reduced motion preferences
  RESPECT_PREFERENCE: true, // Always respect user preferences

  // Reduced motion durations
  DURATION: {
    MICRO: 1, // Nearly instant for reduced motion
    STANDARD: 1, // Nearly instant for reduced motion
    COMPLEX: 1, // Nearly instant for reduced motion
    CELEBRATION: 100 // Minimal celebration duration
  },

  // Media query for reduced motion
  MEDIA_QUERY: '(prefers-reduced-motion: reduce)',

  // CSS implementation
  CSS_RULE: `
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `,

  // JavaScript detection
  DETECT_REDUCED_MOTION: () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  },

  // Accessibility compliance
  ACCESSIBILITY_RULE: 'Disable animations when user has reduced motion preferences'
} as const

// ============================================================================
// FUNCTIONAL ANIMATION PRINCIPLES (Requirement 7.5)
// ============================================================================

export const APPLE_ANIMATION_PRINCIPLES = {
  // Core principles ensuring animations serve functional purposes
  PRINCIPLES: {
    CLARITY: 'Animations clarify relationships between elements',
    FEEDBACK: 'Animations provide immediate feedback for user actions',
    GUIDANCE: 'Animations guide user attention to important changes',
    DELIGHT: 'Animations add delight without being distracting',
    PERFORMANCE: 'Animations maintain smooth 60fps performance'
  },

  // Functional animation categories
  CATEGORIES: {
    FEEDBACK: 'Visual confirmation of user interactions',
    TRANSITION: 'Smooth changes between states',
    LOADING: 'Progress indication for asynchronous operations',
    CELEBRATION: 'Positive reinforcement for achievements',
    NAVIGATION: 'Spatial awareness during navigation'
  },

  // Animation quality standards
  QUALITY_STANDARDS: {
    FRAME_RATE: 60, // Target 60fps for smooth animations
    PERFORMANCE_BUDGET: 16.67, // 16.67ms per frame budget
    GPU_ACCELERATION: true, // Use transform and opacity for GPU acceleration
    WILL_CHANGE: 'Use will-change property sparingly and remove after animation'
  },

  // Functional purpose validation
  VALIDATION: {
    ENHANCES_USABILITY: 'Animation must enhance user understanding',
    SERVES_PURPOSE: 'Every animation must have a clear functional purpose',
    NOT_DECORATIVE: 'Avoid purely decorative animations',
    IMPROVES_UX: 'Animation must improve overall user experience'
  }
} as const

// ============================================================================
// ANIMATION UTILITIES AND HELPERS
// ============================================================================

export const APPLE_ANIMATION_UTILS = {
  // Create consistent transition strings
  createTransition: (
    property: string | string[],
    duration: number = APPLE_ANIMATION_DURATIONS.STANDARD,
    easing: string = APPLE_EASING_FUNCTIONS.STANDARD,
    delay: number = 0
  ): string => {
    const properties = Array.isArray(property) ? property : [property]
    return properties.map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`).join(', ')
  },

  // Get duration based on reduced motion preference
  getDuration: (normalDuration: number): number => {
    return APPLE_REDUCED_MOTION.DETECT_REDUCED_MOTION() ? APPLE_REDUCED_MOTION.DURATION.MICRO : normalDuration
  },

  // Create CSS custom properties for animations
  createCSSVariables: () => ({
    '--apple-duration-micro': `${APPLE_ANIMATION_DURATIONS.MICRO}ms`,
    '--apple-duration-standard': `${APPLE_ANIMATION_DURATIONS.STANDARD}ms`,
    '--apple-duration-complex': `${APPLE_ANIMATION_DURATIONS.COMPLEX}ms`,
    '--apple-ease-standard': APPLE_EASING_FUNCTIONS.STANDARD,
    '--apple-ease-decelerate': APPLE_EASING_FUNCTIONS.DECELERATE,
    '--apple-ease-accelerate': APPLE_EASING_FUNCTIONS.ACCELERATE,
    '--apple-ease-sharp': APPLE_EASING_FUNCTIONS.SHARP,
    '--apple-ease-spring': APPLE_EASING_FUNCTIONS.SPRING
  }),

  // Performance optimization helpers
  optimizeForPerformance: {
    // Properties that trigger GPU acceleration
    GPU_PROPERTIES: ['transform', 'opacity', 'filter'],

    // Avoid animating these properties (cause layout/paint)
    AVOID_PROPERTIES: ['width', 'height', 'top', 'left', 'margin', 'padding'],

    // Preferred properties for smooth animations
    PREFERRED_PROPERTIES: ['transform', 'opacity', 'scale', 'rotate', 'translate']
  }
} as const

// ============================================================================
// COMPONENT-SPECIFIC ANIMATION CONFIGURATIONS
// ============================================================================

export const APPLE_COMPONENT_ANIMATIONS = {
  // Progress Card animations (Requirements 1.2, 1.5)
  PROGRESS_CARD: {
    STICKY_TRANSITION: {
      duration: APPLE_ANIMATION_DURATIONS.STANDARD,
      easing: APPLE_EASING_FUNCTIONS.DECELERATE,
      properties: ['height', 'backdrop-filter', 'background-color']
    },
    PROGRESS_BAR: {
      duration: APPLE_ANIMATION_DURATIONS.STANDARD,
      easing: APPLE_EASING_FUNCTIONS.STANDARD,
      properties: ['width', 'background-color']
    }
  },

  // Question Card animations (Requirement 2.3)
  QUESTION_CARD: {
    FOCUS_FEEDBACK: {
      duration: APPLE_ANIMATION_DURATIONS.MICRO,
      easing: APPLE_EASING_FUNCTIONS.STANDARD,
      properties: ['box-shadow', 'border-color', 'transform']
    },
    GENTLE_EMPHASIS: {
      duration: APPLE_ANIMATION_DURATIONS.MICRO,
      easing: APPLE_EASING_FUNCTIONS.DECELERATE,
      properties: ['box-shadow']
    }
  },

  // Radio Component animations (Requirements 3.2, 3.5)
  RADIO_COMPONENT: {
    SELECTION_FEEDBACK: {
      duration: APPLE_ANIMATION_DURATIONS.RADIO_SELECTION, // 200ms
      easing: APPLE_EASING_FUNCTIONS.RADIO_EASE,
      properties: ['border-color', 'background-color', 'transform']
    },
    HOVER_STATE: {
      duration: APPLE_ANIMATION_DURATIONS.MICRO,
      easing: APPLE_EASING_FUNCTIONS.STANDARD,
      properties: ['border-color', 'background-color'],
      hoverCapableOnly: true // Requirement 3.5
    },
    TOUCH_FEEDBACK: {
      duration: APPLE_ANIMATION_DURATIONS.TOUCH_SCALE,
      easing: APPLE_EASING_FUNCTIONS.TOUCH_EASE,
      properties: ['transform'],
      scale: 0.98 // Subtle scale on press
    }
  },

  // Submit Card animations (Requirement 4.4)
  SUBMIT_CARD: {
    LOADING_STATE: {
      duration: APPLE_ANIMATION_DURATIONS.STANDARD,
      easing: APPLE_EASING_FUNCTIONS.STANDARD,
      properties: ['opacity', 'transform']
    },
    BUTTON_INTERACTION: {
      duration: APPLE_ANIMATION_DURATIONS.MICRO,
      easing: APPLE_EASING_FUNCTIONS.BUTTON_EASE,
      properties: ['background-color', 'transform']
    }
  },

  // Celebration Animation (Requirements 5.1-5.5)
  CELEBRATION: {
    LOADING_PHASE: {
      duration: APPLE_ANIMATION_DURATIONS.CELEBRATION.LOADING,
      easing: APPLE_EASING_FUNCTIONS.DECELERATE,
      properties: ['opacity', 'backdrop-filter']
    },
    SCORE_PROGRESSION: {
      duration: APPLE_ANIMATION_DURATIONS.CELEBRATION.SCORE_REVEAL,
      easing: APPLE_EASING_FUNCTIONS.SPRING,
      properties: ['transform', 'opacity']
    },
    PERFORMANCE_EFFECTS: {
      duration: APPLE_ANIMATION_DURATIONS.CELEBRATION.PERFORMANCE_CELEBRATION,
      easing: APPLE_EASING_FUNCTIONS.CELEBRATION_EASE,
      properties: ['transform', 'opacity', 'scale']
    },
    TYPOGRAPHY_TRANSITIONS: {
      duration: APPLE_ANIMATION_DURATIONS.CELEBRATION.MESSAGE_DISPLAY,
      easing: APPLE_EASING_FUNCTIONS.DECELERATE,
      properties: ['opacity', 'transform']
    }
  }
} as const

// ============================================================================
// RESPONSIVE ANIMATION ADJUSTMENTS
// ============================================================================

export const APPLE_RESPONSIVE_ANIMATIONS = {
  // Mobile-optimized animations (Requirements 8.2, 8.3, 8.4)
  MOBILE: {
    // Shorter durations for mobile responsiveness
    DURATION_MULTIPLIER: 0.8, // 20% faster on mobile

    // Touch-specific animations
    TOUCH_FEEDBACK: {
      duration: APPLE_ANIMATION_DURATIONS.TOUCH_FEEDBACK,
      easing: APPLE_EASING_FUNCTIONS.TOUCH_EASE,
      hapticFeedback: true // Where supported
    },

    // Performance optimizations
    PERFORMANCE: {
      preferTransform: true, // Use transform over layout properties
      useWillChange: true, // Optimize for animation performance
      gpuAcceleration: true // Force GPU acceleration on mobile
    }
  },

  // Tablet adjustments
  TABLET: {
    DURATION_MULTIPLIER: 0.9, // 10% faster on tablet
    TOUCH_TARGETS: true // Maintain touch-friendly interactions
  },

  // Desktop enhancements
  DESKTOP: {
    DURATION_MULTIPLIER: 1.0, // Full duration on desktop
    HOVER_STATES: true, // Enable hover animations (Requirement 3.5)
    COMPLEX_ANIMATIONS: true // Allow more complex animations
  }
} as const

// ============================================================================
// ANIMATION SYSTEM INTEGRATION
// ============================================================================

export const APPLE_ANIMATION_SYSTEM = {
  DURATIONS: APPLE_ANIMATION_DURATIONS,
  EASING: APPLE_EASING_FUNCTIONS,
  REDUCED_MOTION: APPLE_REDUCED_MOTION,
  PRINCIPLES: APPLE_ANIMATION_PRINCIPLES,
  UTILS: APPLE_ANIMATION_UTILS,
  COMPONENTS: APPLE_COMPONENT_ANIMATIONS,
  RESPONSIVE: APPLE_RESPONSIVE_ANIMATIONS
} as const

// ============================================================================
// EXPORTS
// ============================================================================

export default APPLE_ANIMATION_SYSTEM
