// Enhanced Responsive Design Constants and Utilities
// Mobile-first responsive design with progressive enhancement (Requirement 8.1)

export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 960,
  LG: 1280,
  XL: 1920
} as const

// Mobile-first breakpoint definitions (Requirement 8.1)
export const MOBILE_BREAKPOINT = BREAKPOINTS.SM
export const TABLET_BREAKPOINT = BREAKPOINTS.MD
export const DESKTOP_BREAKPOINT = BREAKPOINTS.LG

// Enhanced touch target sizes (Requirements 8.2)
// Ensuring minimum 48px touch targets on mobile devices
export const TOUCH_TARGETS = {
  MINIMUM: 44, // iOS minimum touch target (Requirements 8.2)
  MOBILE: 48, // Android minimum touch target (Requirements 8.2)
  COMFORTABLE: 52, // Comfortable touch target size
  LARGE: 56 // Large touch target for primary actions
} as const

// Responsive spacing scales
export const RESPONSIVE_SPACING = {
  XS: { mobile: 2, tablet: 4, desktop: 4 },
  SM: { mobile: 4, tablet: 6, desktop: 8 },
  MD: { mobile: 8, tablet: 12, desktop: 16 },
  LG: { mobile: 12, tablet: 18, desktop: 24 },
  XL: { mobile: 16, tablet: 24, desktop: 32 },
  XXL: { mobile: 24, tablet: 36, desktop: 48 }
} as const

// Enhanced responsive typography scales (Requirement 8.3)
// Optimized mobile typography and spacing to match desktop quality
export const RESPONSIVE_TYPOGRAPHY = {
  // Display typography - for quiz titles and major headings
  DISPLAY: { mobile: '1.75rem', tablet: '2rem', desktop: '2.125rem' },

  // Body typography - optimized for readability across devices
  BODY_LARGE: { mobile: '1rem', tablet: '1.125rem', desktop: '1.125rem' }, // Question text
  BODY_REGULAR: { mobile: '0.875rem', tablet: '1rem', desktop: '1rem' }, // Answer options
  BODY_SMALL: { mobile: '0.8125rem', tablet: '0.875rem', desktop: '0.875rem' }, // Secondary text

  // Caption typography - for metadata and labels
  CAPTION: { mobile: '0.75rem', tablet: '0.8125rem', desktop: '0.8125rem' },

  // Legacy support (maintaining backward compatibility)
  H1: { mobile: '1.75rem', tablet: '2rem', desktop: '2.5rem' },
  H2: { mobile: '1.5rem', tablet: '1.75rem', desktop: '2rem' },
  H3: { mobile: '1.25rem', tablet: '1.375rem', desktop: '1.5rem' },
  H4: { mobile: '1.125rem', tablet: '1.25rem', desktop: '1.375rem' },
  H5: { mobile: '1rem', tablet: '1.125rem', desktop: '1.25rem' },
  H6: { mobile: '0.95rem', tablet: '1rem', desktop: '1.125rem' },
  BODY1: { mobile: '0.875rem', tablet: '1rem', desktop: '1rem' },
  BODY2: { mobile: '0.8125rem', tablet: '0.875rem', desktop: '0.875rem' }
} as const

// Line height ratios for optimal readability (Requirement 8.3)
export const LINE_HEIGHT_RATIOS = {
  DISPLAY: { mobile: 1.3, tablet: 1.25, desktop: 1.25 },
  BODY_LARGE: { mobile: 1.4, tablet: 1.5, desktop: 1.5 },
  BODY_REGULAR: { mobile: 1.4, tablet: 1.5, desktop: 1.5 },
  BODY_SMALL: { mobile: 1.4, tablet: 1.4, desktop: 1.4 },
  CAPTION: { mobile: 1.3, tablet: 1.3, desktop: 1.3 }
} as const

// Enhanced container max widths for adaptive layouts (Requirement 8.5)
export const CONTAINER_WIDTHS = {
  QUIZ_INTERFACE: { mobile: '100%', tablet: '100%', desktop: '1200px' },
  QUIZ_GRID: { mobile: '100%', tablet: '100%', desktop: '100%' },
  RESULTS: { mobile: '100%', tablet: '800px', desktop: '900px' },
  PROGRESS_CARD: { mobile: '100%', tablet: '100%', desktop: '1200px' },
  QUESTION_CARD: { mobile: '100%', tablet: '100%', desktop: '800px' },
  SUBMIT_CARD: { mobile: '100%', tablet: '480px', desktop: '480px' }
} as const

// Enhanced grid columns for adaptive layouts (Requirement 8.5)
export const GRID_COLUMNS = {
  QUIZ_CARDS: { mobile: 1, tablet: 1, desktop: 1 },
  ANSWER_OPTIONS: { mobile: 1, tablet: 1, desktop: 1 },
  RESULTS_METRICS: { mobile: 1, tablet: 2, desktop: 3 },
  PROGRESS_INDICATORS: { mobile: 1, tablet: 2, desktop: 3 }
} as const

// Adaptive layout configurations (Requirement 8.5)
export const LAYOUT_CONFIGS = {
  MOBILE: {
    stackDirection: 'column',
    cardSpacing: 16,
    sectionSpacing: 24,
    headerCompact: true,
    sidebarCollapsed: true
  },
  TABLET: {
    stackDirection: 'column',
    cardSpacing: 20,
    sectionSpacing: 32,
    headerCompact: false,
    sidebarCollapsed: false
  },
  DESKTOP: {
    stackDirection: 'row',
    cardSpacing: 24,
    sectionSpacing: 40,
    headerCompact: false,
    sidebarCollapsed: false
  }
} as const

// Enhanced animation preferences for different devices
export const RESPONSIVE_ANIMATIONS = {
  MOBILE: {
    duration: 200, // Shorter durations for mobile performance
    easing: 'ease-out',
    reduceMotion: true, // More conservative animations
    enableHover: false, // No hover effects on mobile
    enableParallax: false, // Disable parallax for performance
    maxParticles: 30 // Reduced particle count
  },
  TABLET: {
    duration: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    reduceMotion: false,
    enableHover: true, // Enable hover on tablets with mouse
    enableParallax: true,
    maxParticles: 60
  },
  DESKTOP: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    reduceMotion: false,
    enableHover: true,
    enableParallax: true,
    maxParticles: 100
  }
} as const

// Touch interaction configurations
export const TOUCH_INTERACTIONS = {
  TAP_DELAY: 100, // Delay for tap feedback
  LONG_PRESS_DURATION: 500, // Long press threshold
  SWIPE_THRESHOLD: 50, // Minimum distance for swipe
  VELOCITY_THRESHOLD: 0.3, // Minimum velocity for gesture recognition
  HAPTIC_FEEDBACK: {
    LIGHT: 10, // Light haptic feedback duration
    MEDIUM: 20, // Medium haptic feedback duration
    HEAVY: 30 // Heavy haptic feedback duration
  }
} as const

// DataGrid responsive configurations
export const DATAGRID_RESPONSIVE = {
  MOBILE: {
    pageSize: 5,
    density: 'compact',
    hideColumns: ['chapter', 'duration', 'attempts'],
    rowHeight: 60
  },
  TABLET: {
    pageSize: 10,
    density: 'standard',
    hideColumns: ['attempts'],
    rowHeight: 52
  },
  DESKTOP: {
    pageSize: 10,
    density: 'standard',
    hideColumns: [],
    rowHeight: 52
  }
} as const

// Enhanced utility functions for mobile-first responsive design
export const getResponsiveValue = <T>(
  values: { mobile: T; tablet: T; desktop: T },
  screenSize: 'mobile' | 'tablet' | 'desktop'
): T => {
  return values[screenSize]
}

// Get responsive typography with line height (Requirement 8.3)
export const getResponsiveTypography = (
  variant: keyof typeof RESPONSIVE_TYPOGRAPHY,
  screenSize: 'mobile' | 'tablet' | 'desktop'
) => {
  const fontSize = RESPONSIVE_TYPOGRAPHY[variant][screenSize]
  const lineHeightKey = variant.startsWith('BODY')
    ? (variant as keyof typeof LINE_HEIGHT_RATIOS)
    : ('BODY_REGULAR' as keyof typeof LINE_HEIGHT_RATIOS)

  const lineHeightRatio = LINE_HEIGHT_RATIOS[lineHeightKey]?.[screenSize] || 1.5

  return {
    fontSize,
    lineHeight: lineHeightRatio
  }
}

// Get adaptive touch target size (Requirement 8.2)
export const getAdaptiveTouchTarget = (
  isMobile: boolean,
  isTablet: boolean,
  baseSize: number = TOUCH_TARGETS.MINIMUM
): number => {
  if (isMobile) return Math.max(TOUCH_TARGETS.MOBILE, baseSize) // Ensure 48px minimum
  if (isTablet) return Math.max(TOUCH_TARGETS.COMFORTABLE, baseSize)
  return Math.max(TOUCH_TARGETS.MINIMUM, baseSize)
}

// Get adaptive spacing based on screen size
export const getAdaptiveSpacing = (
  size: keyof typeof RESPONSIVE_SPACING,
  screenSize: 'mobile' | 'tablet' | 'desktop'
): number => {
  return RESPONSIVE_SPACING[size][screenSize]
}

// Get layout configuration for screen size (Requirement 8.5)
export const getLayoutConfig = (screenSize: 'mobile' | 'tablet' | 'desktop') => {
  return LAYOUT_CONFIGS[screenSize.toUpperCase() as keyof typeof LAYOUT_CONFIGS]
}

export const createResponsiveStyles = (theme: any) => ({
  // Responsive container
  responsiveContainer: {
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3)
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4)
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: '1200px',
      padding: theme.spacing(4, 2)
    }
  },

  // Responsive grid
  responsiveGrid: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: '1fr',
    [theme.breakpoints.up('sm')]: {
      gap: theme.spacing(3)
    },
    [theme.breakpoints.up('md')]: {
      gap: theme.spacing(4)
    }
  },

  // Touch-friendly button
  touchButton: {
    minHeight: TOUCH_TARGETS.MINIMUM,
    minWidth: TOUCH_TARGETS.MINIMUM,
    padding: theme.spacing(1.5, 3),
    [theme.breakpoints.down('sm')]: {
      minHeight: TOUCH_TARGETS.COMFORTABLE,
      padding: theme.spacing(2, 4),
      fontSize: '1rem'
    }
  },

  // Responsive typography
  responsiveTypography: {
    fontSize: '1rem',
    lineHeight: 1.5,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.95rem',
      lineHeight: 1.4
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '0.9rem'
    }
  },

  // Mobile-first card
  responsiveCard: {
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[1],
    [theme.breakpoints.up('sm')]: {
      borderRadius: theme.spacing(1.5),
      boxShadow: theme.shadows[2]
    },
    [theme.breakpoints.up('md')]: {
      borderRadius: theme.spacing(2),
      boxShadow: theme.shadows[3]
    }
  }
})

// Media query helpers
export const mediaQueries = {
  mobile: '@media (max-width: 599px)',
  tablet: '@media (min-width: 600px) and (max-width: 959px)',
  desktop: '@media (min-width: 960px)',
  touchDevice: '@media (hover: none) and (pointer: coarse)',
  hoverDevice: '@media (hover: hover) and (pointer: fine)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  highContrast: '@media (prefers-contrast: high)',
  darkMode: '@media (prefers-color-scheme: dark)',
  landscape: '@media (orientation: landscape)',
  portrait: '@media (orientation: portrait)'
}

// Responsive hook utilities (for use with custom hooks)
export const getDeviceType = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < MOBILE_BREAKPOINT) return 'mobile'
  if (width < DESKTOP_BREAKPOINT) return 'tablet'
  return 'desktop'
}

export const isTouchDevice = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export const supportsHover = (): boolean => {
  return window.matchMedia('(hover: hover)').matches
}

export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const getOrientation = (): 'portrait' | 'landscape' => {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}
