// Responsive design constants and utilities

export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 960,
  LG: 1280,
  XL: 1920
} as const

export const MOBILE_BREAKPOINT = BREAKPOINTS.SM
export const TABLET_BREAKPOINT = BREAKPOINTS.MD
export const DESKTOP_BREAKPOINT = BREAKPOINTS.LG

// Touch target sizes (following Material Design guidelines)
export const TOUCH_TARGETS = {
  MINIMUM: 44, // Minimum touch target size in pixels
  COMFORTABLE: 48, // Comfortable touch target size
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

// Responsive typography scales
export const RESPONSIVE_TYPOGRAPHY = {
  H1: { mobile: '1.75rem', tablet: '2rem', desktop: '2.5rem' },
  H2: { mobile: '1.5rem', tablet: '1.75rem', desktop: '2rem' },
  H3: { mobile: '1.25rem', tablet: '1.375rem', desktop: '1.5rem' },
  H4: { mobile: '1.125rem', tablet: '1.25rem', desktop: '1.375rem' },
  H5: { mobile: '1rem', tablet: '1.125rem', desktop: '1.25rem' },
  H6: { mobile: '0.95rem', tablet: '1rem', desktop: '1.125rem' },
  BODY1: { mobile: '0.9rem', tablet: '0.95rem', desktop: '1rem' },
  BODY2: { mobile: '0.85rem', tablet: '0.875rem', desktop: '0.875rem' },
  CAPTION: { mobile: '0.75rem', tablet: '0.75rem', desktop: '0.75rem' }
} as const

// Container max widths for different screen sizes
export const CONTAINER_WIDTHS = {
  QUIZ_INTERFACE: { mobile: '100%', tablet: '100%', desktop: '1200px' },
  QUIZ_GRID: { mobile: '100%', tablet: '100%', desktop: '100%' },
  RESULTS: { mobile: '100%', tablet: '800px', desktop: '900px' }
} as const

// Grid columns for different layouts
export const GRID_COLUMNS = {
  QUIZ_CARDS: { mobile: 1, tablet: 1, desktop: 1 },
  ANSWER_OPTIONS: { mobile: 1, tablet: 1, desktop: 1 },
  RESULTS_METRICS: { mobile: 1, tablet: 2, desktop: 3 }
} as const

// Animation preferences for different devices
export const RESPONSIVE_ANIMATIONS = {
  MOBILE: {
    duration: 200, // Shorter durations for mobile
    easing: 'ease-out',
    reduceMotion: true // More conservative animations
  },
  TABLET: {
    duration: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    reduceMotion: false
  },
  DESKTOP: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    reduceMotion: false
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

// Utility functions for responsive design
export const getResponsiveValue = <T>(
  values: { mobile: T; tablet: T; desktop: T },
  screenSize: 'mobile' | 'tablet' | 'desktop'
): T => {
  return values[screenSize]
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
