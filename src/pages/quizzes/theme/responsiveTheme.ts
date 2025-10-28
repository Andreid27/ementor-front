/**
 * Enhanced Responsive Theme Integration
 *
 * This module provides MUI theme integration for the enhanced responsive design system.
 * It creates theme overrides and utilities that work seamlessly with Material-UI
 * while maintaining mobile-first responsive design principles.
 *
 * Requirements addressed:
 * - 8.1: Mobile-first responsive design with progressive enhancement
 * - 8.2: Minimum 48px touch targets on mobile devices
 * - 8.3: Mobile typography and spacing matching desktop quality
 * - 8.5: Adaptive layouts for all screen sizes
 */

import { Theme, createTheme, useTheme } from '@mui/material/styles'
import {
  RESPONSIVE_TYPOGRAPHY,
  RESPONSIVE_SPACING,
  TOUCH_TARGETS,
  RESPONSIVE_ANIMATIONS,
  LINE_HEIGHT_RATIOS,
  getResponsiveTypography,
  getAdaptiveTouchTarget
} from '../constants/responsive'

// Enhanced breakpoints with more granular control
const enhancedBreakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  }
}

// Mobile-first typography system (Requirement 8.3)
const createResponsiveTypography = (theme: Theme) => {
  return {
    // Display typography for quiz titles
    h1: {
      fontSize: '1.75rem', // Mobile first
      lineHeight: 1.3,
      fontWeight: 600,
      [theme.breakpoints.up('sm')]: {
        fontSize: '2rem',
        lineHeight: 1.25
      },
      [theme.breakpoints.up('md')]: {
        fontSize: '2.125rem',
        lineHeight: 1.25
      }
    },

    // Body typography optimized for readability
    body1: {
      fontSize: '1rem', // Mobile first - question text
      lineHeight: 1.4,
      fontWeight: 400,
      [theme.breakpoints.up('sm')]: {
        fontSize: '1.125rem',
        lineHeight: 1.5
      },
      [theme.breakpoints.up('md')]: {
        fontSize: '1.125rem',
        lineHeight: 1.5
      }
    },

    body2: {
      fontSize: '0.875rem', // Mobile first - answer options
      lineHeight: 1.4,
      fontWeight: 400,
      [theme.breakpoints.up('sm')]: {
        fontSize: '1rem',
        lineHeight: 1.5
      },
      [theme.breakpoints.up('md')]: {
        fontSize: '1rem',
        lineHeight: 1.5
      }
    },

    caption: {
      fontSize: '0.75rem', // Mobile first - metadata
      lineHeight: 1.3,
      fontWeight: 400,
      [theme.breakpoints.up('sm')]: {
        fontSize: '0.8125rem',
        lineHeight: 1.3
      },
      [theme.breakpoints.up('md')]: {
        fontSize: '0.8125rem',
        lineHeight: 1.3
      }
    },

    // Button typography with proper sizing
    button: {
      fontSize: '0.875rem', // Mobile first
      fontWeight: 500,
      textTransform: 'none' as const,
      [theme.breakpoints.up('sm')]: {
        fontSize: '1rem'
      }
    }
  }
}

// Enhanced spacing system
const createResponsiveSpacing = (theme: Theme) => {
  return {
    // Mobile-first spacing utilities
    xs: theme.spacing(1), // 8px
    sm: theme.spacing(2), // 16px
    md: theme.spacing(3), // 24px
    lg: theme.spacing(4), // 32px
    xl: theme.spacing(6), // 48px

    // Component-specific spacing
    cardPadding: {
      mobile: theme.spacing(2), // 16px
      tablet: theme.spacing(3), // 24px
      desktop: theme.spacing(4) // 32px
    },

    questionSpacing: {
      mobile: theme.spacing(3), // 24px
      tablet: theme.spacing(3.5), // 28px
      desktop: theme.spacing(4) // 32px
    },

    answerSpacing: {
      mobile: theme.spacing(1.5), // 12px
      tablet: theme.spacing(1.75), // 14px
      desktop: theme.spacing(2) // 16px
    }
  }
}

// Enhanced component overrides with mobile-first approach
const createResponsiveComponentOverrides = (theme: Theme) => {
  return {
    // Button overrides with proper touch targets (Requirement 8.2)
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: TOUCH_TARGETS.MINIMUM, // 44px minimum
          padding: theme.spacing(1.5, 3),
          borderRadius: theme.spacing(1),
          transition: `all ${RESPONSIVE_ANIMATIONS.MOBILE.duration}ms ${RESPONSIVE_ANIMATIONS.MOBILE.easing}`,

          // Mobile-first responsive sizing
          [theme.breakpoints.down('sm')]: {
            minHeight: TOUCH_TARGETS.MOBILE, // 48px on mobile
            padding: theme.spacing(2, 4),
            fontSize: '0.875rem'
          },

          // Tablet adjustments
          [theme.breakpoints.between('sm', 'md')]: {
            minHeight: TOUCH_TARGETS.COMFORTABLE, // 52px on tablet
            padding: theme.spacing(1.75, 3.5),
            fontSize: '0.95rem'
          },

          // Desktop sizing
          [theme.breakpoints.up('md')]: {
            minHeight: TOUCH_TARGETS.MINIMUM, // 44px on desktop
            padding: theme.spacing(1.5, 3),
            fontSize: '1rem'
          },

          // Touch device optimizations
          '@media (hover: none) and (pointer: coarse)': {
            '&:active': {
              transform: 'scale(0.98)',
              transition: 'transform 0.1s ease-out'
            }
          },

          // Hover device optimizations
          '@media (hover: hover) and (pointer: fine)': {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4]
            }
          }
        },

        // Size variants with proper touch targets
        small: {
          minHeight: TOUCH_TARGETS.MINIMUM,
          padding: theme.spacing(1, 2),
          [theme.breakpoints.down('sm')]: {
            minHeight: TOUCH_TARGETS.MOBILE,
            padding: theme.spacing(1.5, 3)
          }
        },

        large: {
          minHeight: TOUCH_TARGETS.LARGE,
          padding: theme.spacing(2, 4),
          [theme.breakpoints.down('sm')]: {
            minHeight: TOUCH_TARGETS.LARGE,
            padding: theme.spacing(2.5, 5)
          }
        }
      }
    },

    // Card overrides with responsive design
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: theme.spacing(1), // Mobile first
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          transition: `all ${RESPONSIVE_ANIMATIONS.MOBILE.duration}ms ${RESPONSIVE_ANIMATIONS.MOBILE.easing}`,

          // Tablet adjustments
          [theme.breakpoints.up('sm')]: {
            borderRadius: theme.spacing(1.5),
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          },

          // Desktop adjustments
          [theme.breakpoints.up('md')]: {
            borderRadius: theme.spacing(2),
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
          },

          // Hover effects for devices that support it
          '@media (hover: hover) and (pointer: fine)': {
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
            }
          }
        }
      }
    },

    // CardContent with responsive padding
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2), // Mobile first

          // Tablet padding
          [theme.breakpoints.up('sm')]: {
            padding: theme.spacing(3)
          },

          // Desktop padding
          [theme.breakpoints.up('md')]: {
            padding: theme.spacing(4)
          },

          '&:last-child': {
            paddingBottom: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
              paddingBottom: theme.spacing(3)
            },
            [theme.breakpoints.up('md')]: {
              paddingBottom: theme.spacing(4)
            }
          }
        }
      }
    },

    // TextField overrides with proper touch targets
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: TOUCH_TARGETS.MINIMUM,
            [theme.breakpoints.down('sm')]: {
              minHeight: TOUCH_TARGETS.MOBILE
            }
          }
        }
      }
    },

    // FormControlLabel with proper touch targets
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          minHeight: TOUCH_TARGETS.MINIMUM,
          margin: theme.spacing(0.5, 0),

          [theme.breakpoints.down('sm')]: {
            minHeight: TOUCH_TARGETS.MOBILE,
            margin: theme.spacing(0.75, 0)
          },

          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
            lineHeight: 1.4,
            [theme.breakpoints.up('sm')]: {
              fontSize: '1rem',
              lineHeight: 1.5
            }
          }
        }
      }
    },

    // Radio button with enhanced touch targets
    MuiRadio: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1),
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1.5)
          }
        }
      }
    },

    // Checkbox with enhanced touch targets
    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: theme.spacing(1),
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1.5)
          }
        }
      }
    },

    // Typography responsive overrides
    MuiTypography: {
      styleOverrides: {
        root: {
          // Ensure proper line heights for readability
          '&.MuiTypography-body1': {
            lineHeight: 1.4,
            [theme.breakpoints.up('sm')]: {
              lineHeight: 1.5
            }
          },
          '&.MuiTypography-body2': {
            lineHeight: 1.4,
            [theme.breakpoints.up('sm')]: {
              lineHeight: 1.5
            }
          }
        }
      }
    }
  }
}

// Create enhanced responsive theme
export const createEnhancedResponsiveTheme = (baseTheme: Theme): Theme => {
  return createTheme({
    ...baseTheme,

    // Enhanced breakpoints
    breakpoints: enhancedBreakpoints,

    // Responsive typography (Requirement 8.3)
    typography: {
      ...baseTheme.typography,
      ...createResponsiveTypography(baseTheme)
    },

    // Enhanced spacing
    spacing: baseTheme.spacing,

    // Component overrides with mobile-first approach
    components: {
      ...baseTheme.components,
      ...createResponsiveComponentOverrides(baseTheme)
    }
  })
}

// Utility functions for theme integration
export const getResponsiveStyles = (theme: Theme) => {
  return {
    // Container styles with adaptive layouts (Requirement 8.5)
    responsiveContainer: {
      width: '100%',
      maxWidth: '100%',
      margin: '0 auto',
      padding: theme.spacing(0, 2), // Mobile first

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(0, 3)
      },

      [theme.breakpoints.up('md')]: {
        maxWidth: '1200px',
        padding: theme.spacing(0, 4)
      }
    },

    // Quiz-specific responsive styles
    quizProgressCard: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
      padding: theme.spacing(2), // Mobile first
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      transition: `all ${RESPONSIVE_ANIMATIONS.MOBILE.duration}ms ${RESPONSIVE_ANIMATIONS.MOBILE.easing}`,

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2.5, 3)
      },

      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(3, 4)
      }
    },

    quizQuestionCard: {
      marginBottom: theme.spacing(3), // Mobile first
      padding: theme.spacing(2),
      borderRadius: theme.spacing(1),
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      transition: `all ${RESPONSIVE_ANIMATIONS.MOBILE.duration}ms ${RESPONSIVE_ANIMATIONS.MOBILE.easing}`,

      [theme.breakpoints.up('sm')]: {
        marginBottom: theme.spacing(3.5),
        padding: theme.spacing(2.5, 3),
        borderRadius: theme.spacing(1.5)
      },

      [theme.breakpoints.up('md')]: {
        marginBottom: theme.spacing(4),
        padding: theme.spacing(3, 4),
        borderRadius: theme.spacing(2)
      }
    },

    quizAnswerOption: {
      minHeight: TOUCH_TARGETS.MOBILE, // Ensure 48px minimum (Requirement 8.2)
      padding: theme.spacing(1.5, 2),
      marginBottom: theme.spacing(1.5),
      border: '2px solid #e0e0e0',
      borderRadius: theme.spacing(1),
      cursor: 'pointer',
      transition: `all ${RESPONSIVE_ANIMATIONS.MOBILE.duration}ms ${RESPONSIVE_ANIMATIONS.MOBILE.easing}`,
      display: 'flex',
      alignItems: 'center',

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(1.75, 2.5),
        marginBottom: theme.spacing(1.75)
      },

      [theme.breakpoints.up('md')]: {
        minHeight: TOUCH_TARGETS.MINIMUM, // Can be smaller on desktop
        padding: theme.spacing(2, 3),
        marginBottom: theme.spacing(2)
      },

      // Touch feedback for mobile devices
      '@media (hover: none) and (pointer: coarse)': {
        '&:active': {
          transform: 'scale(0.98)',
          backgroundColor: 'rgba(0, 122, 255, 0.05)'
        }
      },

      // Hover effects for devices that support hover
      '@media (hover: hover) and (pointer: fine)': {
        '&:hover': {
          borderColor: '#007AFF',
          backgroundColor: 'rgba(0, 122, 255, 0.02)',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }
      }
    },

    quizSubmitCard: {
      maxWidth: '100%', // Mobile first
      margin: theme.spacing(4, 'auto'),
      padding: theme.spacing(3, 2),
      textAlign: 'center' as const,
      borderRadius: theme.spacing(1.5),
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',

      [theme.breakpoints.up('sm')]: {
        maxWidth: '480px',
        padding: theme.spacing(4, 3)
      },

      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(5, 4)
      }
    },

    // Touch-optimized button styles (Requirement 8.2)
    touchButton: {
      minHeight: TOUCH_TARGETS.MOBILE, // 48px minimum on mobile
      padding: theme.spacing(1.5, 3),
      border: 'none',
      borderRadius: theme.spacing(1),
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: `all ${RESPONSIVE_ANIMATIONS.MOBILE.duration}ms ${RESPONSIVE_ANIMATIONS.MOBILE.easing}`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent',

      [theme.breakpoints.up('sm')]: {
        fontSize: '0.95rem',
        padding: theme.spacing(1.75, 3.5)
      },

      [theme.breakpoints.up('md')]: {
        minHeight: TOUCH_TARGETS.MINIMUM, // Can be smaller on desktop
        fontSize: '1rem',
        padding: theme.spacing(1.5, 3)
      }
    }
  }
}

// Hook for using responsive theme utilities
export const useResponsiveTheme = () => {
  const theme = useTheme()

  return {
    theme,
    styles: getResponsiveStyles(theme),
    spacing: createResponsiveSpacing(theme)
  }
}

export default createEnhancedResponsiveTheme
