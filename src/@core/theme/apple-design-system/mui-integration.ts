/**
 * Apple Design System MUI Theme Integration
 *
 * Integrates the Apple-inspired design system with Material-UI theme system
 * to ensure consistent application across all MUI components while maintaining
 * Apple design principles.
 */

import { Theme, ThemeOptions } from '@mui/material/styles'
import { APPLE_DESIGN_SYSTEM } from './index'

/**
 * Generate MUI theme overrides based on Apple Design System
 */
export const createAppleMuiThemeOverrides = (mode: 'light' | 'dark' = 'light'): Partial<ThemeOptions> => {
  const { SPACING, TYPOGRAPHY, BORDER_RADIUS, COLORS, ELEVATION, ANIMATION } = APPLE_DESIGN_SYSTEM

  return {
    // ========================================================================
    // SPACING SYSTEM - 8px Grid (Requirement 6.1)
    // ========================================================================
    spacing: SPACING.BASE, // 8px base unit

    // ========================================================================
    // TYPOGRAPHY HIERARCHY (Requirement 6.2)
    // ========================================================================
    typography: {
      fontFamily: TYPOGRAPHY.FONT_FAMILY,

      // Display typography (major headings)
      h1: {
        fontSize: `${TYPOGRAPHY.DISPLAY.SIZE.DESKTOP}px`,
        lineHeight: `${TYPOGRAPHY.DISPLAY.LINE_HEIGHT.DESKTOP}px`,
        fontWeight: TYPOGRAPHY.DISPLAY.WEIGHT,
        letterSpacing: TYPOGRAPHY.DISPLAY.LETTER_SPACING,
        '@media (max-width: 767px)': {
          fontSize: `${TYPOGRAPHY.DISPLAY.SIZE.MOBILE}px`,
          lineHeight: `${TYPOGRAPHY.DISPLAY.LINE_HEIGHT.MOBILE}px`
        }
      },

      // Body Large typography (question text, primary content)
      h2: {
        fontSize: `${TYPOGRAPHY.BODY_LARGE.SIZE.DESKTOP}px`,
        lineHeight: `${TYPOGRAPHY.BODY_LARGE.LINE_HEIGHT.DESKTOP}px`,
        fontWeight: TYPOGRAPHY.BODY_LARGE.WEIGHT,
        letterSpacing: TYPOGRAPHY.BODY_LARGE.LETTER_SPACING,
        '@media (max-width: 767px)': {
          fontSize: `${TYPOGRAPHY.BODY_LARGE.SIZE.MOBILE}px`,
          lineHeight: `${TYPOGRAPHY.BODY_LARGE.LINE_HEIGHT.MOBILE}px`
        }
      },

      // Body Regular typography (answer options, secondary content)
      body1: {
        fontSize: `${TYPOGRAPHY.BODY_REGULAR.SIZE.DESKTOP}px`,
        lineHeight: `${TYPOGRAPHY.BODY_REGULAR.LINE_HEIGHT.DESKTOP}px`,
        fontWeight: TYPOGRAPHY.BODY_REGULAR.WEIGHT,
        letterSpacing: TYPOGRAPHY.BODY_REGULAR.LETTER_SPACING,
        '@media (max-width: 767px)': {
          fontSize: `${TYPOGRAPHY.BODY_REGULAR.SIZE.MOBILE}px`,
          lineHeight: `${TYPOGRAPHY.BODY_REGULAR.LINE_HEIGHT.MOBILE}px`
        }
      },

      // Caption typography (metadata, progress indicators)
      caption: {
        fontSize: `${TYPOGRAPHY.CAPTION.SIZE.DESKTOP}px`,
        lineHeight: `${TYPOGRAPHY.CAPTION.LINE_HEIGHT.DESKTOP}px`,
        fontWeight: TYPOGRAPHY.CAPTION.WEIGHT,
        letterSpacing: TYPOGRAPHY.CAPTION.LETTER_SPACING,
        '@media (max-width: 767px)': {
          fontSize: `${TYPOGRAPHY.CAPTION.SIZE.MOBILE}px`,
          lineHeight: `${TYPOGRAPHY.CAPTION.LINE_HEIGHT.MOBILE}px`
        }
      }
    },

    // ========================================================================
    // SHAPE SYSTEM - Border Radius (Requirement 6.3)
    // ========================================================================
    shape: {
      borderRadius: BORDER_RADIUS.MEDIUM // 8px default
    },

    // ========================================================================
    // PALETTE SYSTEM - Limited colors with proper contrast (Requirement 6.5)
    // ========================================================================
    palette: {
      mode,

      // Primary colors
      primary: {
        main: COLORS.PRIMARY.BLUE,
        light: COLORS.PRIMARY.LIGHT_BLUE,
        dark: COLORS.PRIMARY.DARK_BLUE,
        contrastText: mode === 'light' ? COLORS.TEXT.PRIMARY.LIGHT : COLORS.TEXT.PRIMARY.DARK
      },

      // Semantic colors
      success: {
        main: COLORS.SUCCESS,
        contrastText: mode === 'light' ? COLORS.TEXT.PRIMARY.LIGHT : COLORS.TEXT.PRIMARY.DARK
      },

      warning: {
        main: COLORS.WARNING,
        contrastText: mode === 'light' ? COLORS.TEXT.PRIMARY.LIGHT : COLORS.TEXT.PRIMARY.DARK
      },

      error: {
        main: COLORS.ERROR,
        contrastText: mode === 'light' ? COLORS.TEXT.PRIMARY.LIGHT : COLORS.TEXT.PRIMARY.DARK
      },

      // Background colors
      background: {
        default: mode === 'light' ? COLORS.BACKGROUND.PRIMARY : COLORS.BACKGROUND.DARK_PRIMARY,
        paper: mode === 'light' ? COLORS.BACKGROUND.SECONDARY : COLORS.BACKGROUND.DARK_SECONDARY
      },

      // Text colors
      text: {
        primary: mode === 'light' ? COLORS.TEXT.PRIMARY.LIGHT : COLORS.TEXT.PRIMARY.DARK,
        secondary: mode === 'light' ? COLORS.TEXT.SECONDARY.LIGHT : COLORS.TEXT.SECONDARY.DARK,
        disabled: mode === 'light' ? COLORS.TEXT.DISABLED.LIGHT : COLORS.TEXT.DISABLED.DARK
      },

      // Divider colors
      divider: mode === 'light' ? COLORS.BORDER.LIGHT : COLORS.BORDER.DARK,

      // Action colors
      action: {
        hover: mode === 'light' ? COLORS.INTERACTIVE.HOVER.LIGHT : COLORS.INTERACTIVE.HOVER.DARK,
        selected: COLORS.INTERACTIVE.SELECTED.BACKGROUND,
        disabled: COLORS.INTERACTIVE.DISABLED.BACKGROUND,
        disabledBackground: COLORS.INTERACTIVE.DISABLED.BACKGROUND
      }
    },

    // ========================================================================
    // SHADOWS SYSTEM - Maximum 4dp elevation (Requirement 6.4)
    // ========================================================================
    shadows: [
      'none',
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.SUBTLE : ELEVATION.SHADOWS.DARK.SUBTLE,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.RAISED : ELEVATION.SHADOWS.DARK.RAISED,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.FLOATING : ELEVATION.SHADOWS.DARK.FLOATING,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      // Repeat the maximum shadow for higher elevation levels to maintain 4dp limit
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL,
      mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL
    ] as any,

    // ========================================================================
    // TRANSITIONS SYSTEM (Requirements 7.1, 7.2)
    // ========================================================================
    transitions: {
      duration: {
        shortest: ANIMATION.DURATION.MICRO,
        shorter: ANIMATION.DURATION.MICRO,
        short: ANIMATION.DURATION.STANDARD,
        standard: ANIMATION.DURATION.STANDARD,
        complex: ANIMATION.DURATION.COMPLEX,
        enteringScreen: ANIMATION.DURATION.STANDARD,
        leavingScreen: ANIMATION.DURATION.STANDARD
      },
      easing: {
        easeInOut: ANIMATION.EASING.STANDARD,
        easeOut: ANIMATION.EASING.DECELERATE,
        easeIn: ANIMATION.EASING.ACCELERATE,
        sharp: ANIMATION.EASING.SHARP
      }
    }
  }
}

/**
 * Generate MUI component overrides for Apple Design System compliance
 */
export const createAppleMuiComponentOverrides = (theme: Theme) => {
  const { SPACING, BORDER_RADIUS, COLORS, ANIMATION } = APPLE_DESIGN_SYSTEM
  const mode = theme.palette.mode

  return {
    // ========================================================================
    // CARD COMPONENT OVERRIDES
    // ========================================================================
    MuiCard: {
      styleOverrides: {
        root: {
          // Question card styling (Requirements 2.2, 2.4)
          borderRadius: BORDER_RADIUS.QUESTION_CARD.DESKTOP,
          padding: `${SPACING.LG}px`, // 24px desktop
          boxShadow: mode === 'light' ? ELEVATION.SHADOWS.LIGHT.RAISED : ELEVATION.SHADOWS.DARK.RAISED,
          transition: `all ${ANIMATION.DURATION.STANDARD}ms ${ANIMATION.EASING.STANDARD}`,

          '@media (max-width: 767px)': {
            borderRadius: BORDER_RADIUS.QUESTION_CARD.MOBILE,
            padding: `${SPACING.MD}px` // 16px mobile
          },

          '&:hover': {
            // Gentle visual feedback without excessive emphasis (Requirement 2.3)
            transform: 'translateY(-1px)',
            boxShadow: mode === 'light' ? ELEVATION.SHADOWS.LIGHT.FLOATING : ELEVATION.SHADOWS.DARK.FLOATING
          }
        }
      }
    },

    // ========================================================================
    // BUTTON COMPONENT OVERRIDES
    // ========================================================================
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: BORDER_RADIUS.BUTTON,
          minHeight: SPACING.TOUCH_TARGET.MINIMUM, // 44px minimum touch target
          fontFamily: TYPOGRAPHY.FONT_FAMILY,
          fontWeight: TYPOGRAPHY.BODY_REGULAR.WEIGHT,
          letterSpacing: TYPOGRAPHY.BODY_REGULAR.LETTER_SPACING,
          textTransform: 'none', // Preserve original casing
          transition: `all ${ANIMATION.DURATION.MICRO}ms ${ANIMATION.EASING.STANDARD}`,

          '@media (max-width: 767px)': {
            minHeight: SPACING.TOUCH_TARGET.MOBILE // 48px mobile touch target
          },

          '&:hover': {
            transform: 'translateY(-1px)'
          },

          '&:active': {
            transform: 'translateY(0)'
          }
        },

        contained: {
          boxShadow: mode === 'light' ? ELEVATION.SHADOWS.LIGHT.SUBTLE : ELEVATION.SHADOWS.DARK.SUBTLE,

          '&:hover': {
            boxShadow: mode === 'light' ? ELEVATION.SHADOWS.LIGHT.RAISED : ELEVATION.SHADOWS.DARK.RAISED
          }
        }
      }
    },

    // ========================================================================
    // RADIO COMPONENT OVERRIDES
    // ========================================================================
    MuiRadio: {
      styleOverrides: {
        root: {
          // Radio component styling (Requirements 3.1, 3.2, 3.3)
          padding: `${SPACING.SM}px`, // 8px padding
          transition: `all ${ANIMATION.DURATION.MICRO}ms ${ANIMATION.EASING.STANDARD}`,

          '&:hover': {
            backgroundColor: mode === 'light' ? COLORS.INTERACTIVE.HOVER.LIGHT : COLORS.INTERACTIVE.HOVER.DARK
          },

          '&.Mui-checked': {
            color: COLORS.PRIMARY.BLUE
          }
        }
      }
    },

    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          // Answer option container (Requirements 3.1, 3.4)
          margin: 0,
          marginBottom: `${SPACING.ANSWER_SPACING}px`, // 12px between options
          padding: `${SPACING.SM}px ${SPACING.MD}px`, // 8px vertical, 16px horizontal
          border: `1px solid ${mode === 'light' ? COLORS.BORDER.LIGHT : COLORS.BORDER.DARK}`,
          borderRadius: BORDER_RADIUS.RADIO_COMPONENT, // 8px
          minHeight: SPACING.TOUCH_TARGET.MINIMUM, // 44px minimum touch target
          transition: `all ${ANIMATION.DURATION.MICRO}ms ${ANIMATION.EASING.STANDARD}`,
          cursor: 'pointer',

          '@media (max-width: 767px)': {
            minHeight: SPACING.TOUCH_TARGET.MOBILE // 48px mobile touch target
          },

          '&:hover': {
            borderColor: COLORS.PRIMARY.BLUE,
            backgroundColor: mode === 'light' ? COLORS.INTERACTIVE.HOVER.LIGHT : COLORS.INTERACTIVE.HOVER.DARK
          },

          '&:has(.Mui-checked)': {
            borderColor: COLORS.INTERACTIVE.SELECTED.BORDER,
            backgroundColor: COLORS.INTERACTIVE.SELECTED.BACKGROUND
          },

          '&.Mui-disabled': {
            borderColor: COLORS.INTERACTIVE.DISABLED.BORDER,
            backgroundColor: COLORS.INTERACTIVE.DISABLED.BACKGROUND,
            color: COLORS.INTERACTIVE.DISABLED.TEXT
          }
        },

        label: {
          fontFamily: TYPOGRAPHY.FONT_FAMILY,
          fontSize: `${TYPOGRAPHY.BODY_REGULAR.SIZE.DESKTOP}px`,
          lineHeight: `${TYPOGRAPHY.BODY_REGULAR.LINE_HEIGHT.DESKTOP}px`,
          fontWeight: TYPOGRAPHY.BODY_REGULAR.WEIGHT,

          '@media (max-width: 767px)': {
            fontSize: `${TYPOGRAPHY.BODY_REGULAR.SIZE.MOBILE}px`,
            lineHeight: `${TYPOGRAPHY.BODY_REGULAR.LINE_HEIGHT.MOBILE}px`
          }
        }
      }
    },

    // ========================================================================
    // PAPER COMPONENT OVERRIDES (Progress Card, Submit Card)
    // ========================================================================
    MuiPaper: {
      styleOverrides: {
        root: {
          // Default paper styling
          borderRadius: BORDER_RADIUS.MEDIUM,
          transition: `all ${ANIMATION.DURATION.STANDARD}ms ${ANIMATION.EASING.STANDARD}`
        },

        elevation1: {
          boxShadow: mode === 'light' ? ELEVATION.SHADOWS.LIGHT.SUBTLE : ELEVATION.SHADOWS.DARK.SUBTLE
        },

        elevation2: {
          boxShadow: mode === 'light' ? ELEVATION.SHADOWS.LIGHT.RAISED : ELEVATION.SHADOWS.DARK.RAISED
        },

        elevation3: {
          boxShadow: mode === 'light' ? ELEVATION.SHADOWS.LIGHT.FLOATING : ELEVATION.SHADOWS.DARK.FLOATING
        },

        elevation4: {
          boxShadow: mode === 'light' ? ELEVATION.SHADOWS.LIGHT.MODAL : ELEVATION.SHADOWS.DARK.MODAL
        }
      }
    },

    // ========================================================================
    // TYPOGRAPHY COMPONENT OVERRIDES
    // ========================================================================
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: TYPOGRAPHY.FONT_FAMILY
        },

        h1: {
          // Display typography
          fontSize: `${TYPOGRAPHY.DISPLAY.SIZE.DESKTOP}px`,
          lineHeight: `${TYPOGRAPHY.DISPLAY.LINE_HEIGHT.DESKTOP}px`,
          fontWeight: TYPOGRAPHY.DISPLAY.WEIGHT,
          letterSpacing: TYPOGRAPHY.DISPLAY.LETTER_SPACING,

          '@media (max-width: 767px)': {
            fontSize: `${TYPOGRAPHY.DISPLAY.SIZE.MOBILE}px`,
            lineHeight: `${TYPOGRAPHY.DISPLAY.LINE_HEIGHT.MOBILE}px`
          }
        },

        h2: {
          // Body Large typography
          fontSize: `${TYPOGRAPHY.BODY_LARGE.SIZE.DESKTOP}px`,
          lineHeight: `${TYPOGRAPHY.BODY_LARGE.LINE_HEIGHT.DESKTOP}px`,
          fontWeight: TYPOGRAPHY.BODY_LARGE.WEIGHT,
          letterSpacing: TYPOGRAPHY.BODY_LARGE.LETTER_SPACING,

          '@media (max-width: 767px)': {
            fontSize: `${TYPOGRAPHY.BODY_LARGE.SIZE.MOBILE}px`,
            lineHeight: `${TYPOGRAPHY.BODY_LARGE.LINE_HEIGHT.MOBILE}px`
          }
        },

        body1: {
          // Body Regular typography
          fontSize: `${TYPOGRAPHY.BODY_REGULAR.SIZE.DESKTOP}px`,
          lineHeight: `${TYPOGRAPHY.BODY_REGULAR.LINE_HEIGHT.DESKTOP}px`,
          fontWeight: TYPOGRAPHY.BODY_REGULAR.WEIGHT,
          letterSpacing: TYPOGRAPHY.BODY_REGULAR.LETTER_SPACING,

          '@media (max-width: 767px)': {
            fontSize: `${TYPOGRAPHY.BODY_REGULAR.SIZE.MOBILE}px`,
            lineHeight: `${TYPOGRAPHY.BODY_REGULAR.LINE_HEIGHT.MOBILE}px`
          }
        },

        caption: {
          // Caption typography
          fontSize: `${TYPOGRAPHY.CAPTION.SIZE.DESKTOP}px`,
          lineHeight: `${TYPOGRAPHY.CAPTION.LINE_HEIGHT.DESKTOP}px`,
          fontWeight: TYPOGRAPHY.CAPTION.WEIGHT,
          letterSpacing: TYPOGRAPHY.CAPTION.LETTER_SPACING,

          '@media (max-width: 767px)': {
            fontSize: `${TYPOGRAPHY.CAPTION.SIZE.MOBILE}px`,
            lineHeight: `${TYPOGRAPHY.CAPTION.LINE_HEIGHT.MOBILE}px`
          }
        }
      }
    },

    // ========================================================================
    // LINEAR PROGRESS COMPONENT OVERRIDES (Progress Card)
    // ========================================================================
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 4, // Subtle progress indicator
          borderRadius: BORDER_RADIUS.SMALL,
          backgroundColor: mode === 'light' ? COLORS.BORDER.LIGHT : COLORS.BORDER.DARK
        },

        bar: {
          borderRadius: BORDER_RADIUS.SMALL,
          transition: `transform ${ANIMATION.DURATION.STANDARD}ms ${ANIMATION.EASING.STANDARD}`
        }
      }
    },

    // ========================================================================
    // BACKDROP COMPONENT OVERRIDES (Celebration Animation)
    // ========================================================================
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(8px)', // Apple-style backdrop blur
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }
  }
}

/**
 * Create complete Apple-inspired MUI theme
 */
export const createAppleMuiTheme = (mode: 'light' | 'dark' = 'light'): ThemeOptions => {
  const baseTheme = createAppleMuiThemeOverrides(mode)

  return {
    ...baseTheme,
    components: createAppleMuiComponentOverrides({
      palette: { mode }
    } as Theme)
  }
}

export default {
  createAppleMuiThemeOverrides,
  createAppleMuiComponentOverrides,
  createAppleMuiTheme
}
