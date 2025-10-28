/**
 * Apple-Inspired Design System Constants
 *
 * This design system implements Apple's core design principles:
 * - Clarity: Text is legible at every size, icons are precise and lucid
 * - Deference: Fluid motion and crisp interface help people understand content
 * - Depth: Visual layers and realistic motion convey hierarchy and vitality
 *
 * Requirements addressed:
 * - 6.1: 8px grid system for all spacing decisions
 * - 6.2: Typography hierarchy with maximum 3 font sizes per screen
 * - 6.3: Consistent border radius values (4px, 8px, 12px)
 * - 6.4: Elevation system with maximum 4dp shadows
 * - 6.5: Limited color palette with proper contrast ratios (minimum 4.5:1)
 */

// ============================================================================
// SPACING SYSTEM - 8px Grid (Requirement 6.1)
// ============================================================================

export const APPLE_SPACING = {
  // Base unit: 8px
  BASE: 8,

  // Spacing scale following 8px grid
  XS: 4, // 0.5 * base - for micro spacing
  SM: 8, // 1 * base - small spacing
  MD: 16, // 2 * base - medium spacing
  LG: 24, // 3 * base - large spacing
  XL: 32, // 4 * base - extra large spacing
  XXL: 48, // 6 * base - maximum spacing between questions (desktop)

  // Component-specific spacing
  CARD_PADDING: {
    MOBILE: 16, // 2 * base
    DESKTOP: 24 // 3 * base
  },

  QUESTION_SPACING: {
    MOBILE: 24, // 3 * base - maximum between questions on mobile
    DESKTOP: 32 // 4 * base - maximum between questions on desktop
  },

  ANSWER_SPACING: 12, // 1.5 * base - between answer options

  TOUCH_TARGET: {
    MINIMUM: 44, // iOS minimum touch target
    MOBILE: 48 // Android minimum touch target
  }
} as const

// ============================================================================
// TYPOGRAPHY HIERARCHY - Maximum 3 font sizes per screen (Requirement 6.2)
// ============================================================================

export const APPLE_TYPOGRAPHY = {
  // Primary typography scale (maximum 3 sizes per screen)
  DISPLAY: {
    SIZE: {
      MOBILE: 28,
      DESKTOP: 32
    },
    LINE_HEIGHT: {
      MOBILE: 36,
      DESKTOP: 40
    },
    WEIGHT: 600, // Semi-bold for major headings
    LETTER_SPACING: '-0.02em' // Tight spacing for large text
  },

  BODY_LARGE: {
    SIZE: {
      MOBILE: 16,
      DESKTOP: 18
    },
    LINE_HEIGHT: {
      MOBILE: 22,
      DESKTOP: 24
    },
    WEIGHT: 400, // Regular for question text
    LETTER_SPACING: '0em'
  },

  BODY_REGULAR: {
    SIZE: {
      MOBILE: 14,
      DESKTOP: 16
    },
    LINE_HEIGHT: {
      MOBILE: 20,
      DESKTOP: 24
    },
    WEIGHT: 400, // Regular for answer options
    LETTER_SPACING: '0em'
  },

  // Supporting typography (used sparingly)
  CAPTION: {
    SIZE: {
      MOBILE: 12,
      DESKTOP: 14
    },
    LINE_HEIGHT: {
      MOBILE: 18,
      DESKTOP: 20
    },
    WEIGHT: 400, // Regular for metadata
    LETTER_SPACING: '0.01em'
  },

  // Font family following Apple's system font stack
  FONT_FAMILY: [
    '-apple-system',
    'BlinkMacSystemFont',
    'SF Pro Display',
    'SF Pro Text',
    'Helvetica Neue',
    'Helvetica',
    'Arial',
    'sans-serif'
  ].join(','),

  // Typography hierarchy rules
  MAX_SIZES_PER_SCREEN: 3, // Requirement 6.2
  LINE_HEIGHT_RATIO: {
    HEADINGS: 1.25, // 1.25x for headings
    BODY: 1.5 // 1.5x for body text
  }
} as const

// ============================================================================
// BORDER RADIUS SYSTEM (Requirement 6.3)
// ============================================================================

export const APPLE_BORDER_RADIUS = {
  SMALL: 4, // Buttons, inputs, small interactive elements
  MEDIUM: 8, // Answer options, radio components, mobile cards
  LARGE: 12, // Question cards on desktop, major containers
  EXTRA_LARGE: 16, // Modal dialogs, celebration overlays

  // Component-specific radius
  RADIO_COMPONENT: 8, // Answer options (Requirement 3.1)
  QUESTION_CARD: {
    MOBILE: 8, // Mobile question cards
    DESKTOP: 12 // Desktop question cards (Requirement 2.2)
  },
  BUTTON: 8, // Standard buttons
  INPUT: 8, // Form inputs
  MODAL: 16, // Modal dialogs

  // Consistent application rules
  CONSISTENCY_RULE: 'Use same radius for similar component types'
} as const

// ============================================================================
// ELEVATION SYSTEM - Maximum 4dp (Requirement 6.4)
// ============================================================================

export const APPLE_ELEVATION = {
  // Elevation levels (maximum 4dp as per requirement)
  NONE: 0, // Flat surfaces
  SUBTLE: 1, // Cards at rest (2dp equivalent)
  RAISED: 2, // Raised cards, question cards (2dp - Requirement 2.2)
  FLOATING: 3, // Floating elements
  MODAL: 4, // Modal overlays (maximum allowed)

  // Shadow definitions following Apple's design language
  SHADOWS: {
    LIGHT: {
      NONE: 'none',
      SUBTLE: '0 1px 3px rgba(0, 0, 0, 0.12)', // Level 1
      RAISED: '0 2px 6px rgba(0, 0, 0, 0.16)', // Level 2 - Question cards
      FLOATING: '0 4px 12px rgba(0, 0, 0, 0.24)', // Level 3
      MODAL: '0 8px 24px rgba(0, 0, 0, 0.32)' // Level 4 - Maximum
    },
    DARK: {
      NONE: 'none',
      SUBTLE: '0 1px 3px rgba(0, 0, 0, 0.24)',
      RAISED: '0 2px 6px rgba(0, 0, 0, 0.32)',
      FLOATING: '0 4px 12px rgba(0, 0, 0, 0.48)',
      MODAL: '0 8px 24px rgba(0, 0, 0, 0.64)'
    }
  },

  // Component-specific elevation
  QUESTION_CARD: 2, // Subtle elevation (Requirement 2.2)
  PROGRESS_CARD: 1, // Minimal elevation for sticky header
  SUBMIT_CARD: 2, // Subtle elevation
  CELEBRATION: 4, // Maximum elevation for celebration overlay

  // Rules
  MAX_ELEVATION: 4, // Maximum 4dp for depth without heaviness (Requirement 6.4)
  GENTLE_FEEDBACK: 'Enhanced visual feedback without excessive emphasis' // Requirement 2.3
} as const

// ============================================================================
// COMPONENT-SPECIFIC CONSTANTS
// ============================================================================

export const APPLE_COMPONENTS = {
  // Progress Card (Requirements 1.1-1.5)
  PROGRESS_CARD: {
    PADDING: {
      MOBILE: APPLE_SPACING.MD, // 16px
      DESKTOP: APPLE_SPACING.LG // 24px
    },
    MIN_HEIGHT: 64,
    COMPACT_HEIGHT: 48,
    STICKY_POSITION: true,
    BACKDROP_BLUR: true
  },

  // Question Card (Requirements 2.1-2.5)
  QUESTION_CARD: {
    SPACING_BETWEEN: {
      MOBILE: APPLE_SPACING.LG, // 24px maximum
      DESKTOP: APPLE_SPACING.XL // 32px maximum
    },
    PADDING: {
      MOBILE: APPLE_SPACING.MD, // 16px
      DESKTOP: APPLE_SPACING.LG // 24px
    },
    ELEVATION: APPLE_ELEVATION.RAISED, // 2dp
    BORDER_RADIUS: {
      MOBILE: APPLE_BORDER_RADIUS.MEDIUM, // 8px
      DESKTOP: APPLE_BORDER_RADIUS.LARGE // 12px
    }
  }
} as const

// ============================================================================
// ANIMATION SYSTEM (Requirements 7.1, 7.2, 7.4, 7.5)
// ============================================================================

// Import comprehensive animation system
import {
  APPLE_ANIMATION_DURATIONS,
  APPLE_EASING_FUNCTIONS,
  APPLE_REDUCED_MOTION,
  APPLE_ANIMATION_PRINCIPLES,
  APPLE_COMPONENT_ANIMATIONS,
  APPLE_RESPONSIVE_ANIMATIONS
} from './animations'

export const APPLE_ANIMATION = {
  // Duration standards (Requirements 7.1)
  DURATION: APPLE_ANIMATION_DURATIONS,

  // Apple-style easing functions (Requirement 7.2)
  EASING: APPLE_EASING_FUNCTIONS,

  // Reduced motion support (Requirement 7.4)
  REDUCED_MOTION: APPLE_REDUCED_MOTION,

  // Animation principles (Requirement 7.5)
  PRINCIPLES: APPLE_ANIMATION_PRINCIPLES,

  // Component-specific animations
  COMPONENTS: APPLE_COMPONENT_ANIMATIONS,

  // Responsive adjustments
  RESPONSIVE: APPLE_RESPONSIVE_ANIMATIONS
} as const

// ============================================================================
// EXPORT ALL CONSTANTS AND ANIMATION SYSTEM
// ============================================================================

// Export animation system components
export {
  APPLE_ANIMATION_DURATIONS,
  APPLE_EASING_FUNCTIONS,
  APPLE_REDUCED_MOTION,
  APPLE_ANIMATION_PRINCIPLES,
  APPLE_COMPONENT_ANIMATIONS,
  APPLE_RESPONSIVE_ANIMATIONS
} from './animations'

export const APPLE_DESIGN_SYSTEM = {
  SPACING: APPLE_SPACING,
  TYPOGRAPHY: APPLE_TYPOGRAPHY,
  BORDER_RADIUS: APPLE_BORDER_RADIUS,
  ELEVATION: APPLE_ELEVATION,
  COMPONENTS: APPLE_COMPONENTS,
  ANIMATION: APPLE_ANIMATION
} as const

export default APPLE_DESIGN_SYSTEM
