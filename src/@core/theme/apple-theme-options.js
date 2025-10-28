/**
 * Apple-Enhanced Theme Options
 *
 * Integrates the Apple Design System with the existing MUI theme structure
 * while maintaining backward compatibility with the current theme system.
 */

// ** MUI Theme Provider
import { deepmerge } from '@mui/utils'

// ** User Theme Options
import UserThemeOptions from 'src/layouts/UserThemeOptions'

// ** Original Theme Override Imports
import palette from './palette'
import spacing from './spacing'
import shadows from './shadows'
import overrides from './overrides'
import typography from './typography'
import breakpoints from './breakpoints'

// ** Apple Design System Integration
import { createAppleMuiThemeOverrides, createAppleMuiComponentOverrides } from './apple-design-system/mui-integration'
import { APPLE_DESIGN_SYSTEM } from './apple-design-system'

/**
 * Enhanced theme options with Apple Design System integration
 */
const appleThemeOptions = (settings, overrideMode) => {
  // ** Vars
  const { skin, mode, direction, themeColor } = settings

  // ** Determine theme mode for Apple design system
  const appleThemeMode = mode === 'semi-dark' ? overrideMode : mode

  // ** Create Apple-enhanced theme overrides
  const appleThemeOverrides = createAppleMuiThemeOverrides(appleThemeMode)

  // ** Create New object before removing user component overrides and typography objects from userThemeOptions
  const userThemeConfig = Object.assign({}, UserThemeOptions())

  // ** Base theme configuration with Apple enhancements
  const baseThemeConfig = {
    breakpoints: breakpoints(),
    direction,

    // ** Enhanced palette with Apple colors
    palette: deepmerge(palette(appleThemeMode, skin), appleThemeOverrides.palette || {}),

    // ** Apple 8px grid spacing system (Requirement 6.1)
    spacing: APPLE_DESIGN_SYSTEM.SPACING.BASE, // 8px base unit

    // ** Apple-enhanced shape with consistent border radius (Requirement 6.3)
    shape: {
      borderRadius: APPLE_DESIGN_SYSTEM.BORDER_RADIUS.MEDIUM // 8px default
    },

    // ** Enhanced mixins
    mixins: {
      toolbar: {
        minHeight: 64
      }
    },

    // ** Apple-enhanced shadows with 4dp maximum (Requirement 6.4)
    shadows: appleThemeOverrides.shadows || shadows(appleThemeMode),

    // ** Apple typography hierarchy (Requirement 6.2)
    typography: deepmerge(typography, appleThemeOverrides.typography || {}),

    // ** Apple animation system (Requirements 7.1, 7.2)
    transitions: appleThemeOverrides.transitions || {
      duration: {
        shortest: APPLE_DESIGN_SYSTEM.ANIMATION.DURATION.MICRO,
        shorter: APPLE_DESIGN_SYSTEM.ANIMATION.DURATION.MICRO,
        short: APPLE_DESIGN_SYSTEM.ANIMATION.DURATION.STANDARD,
        standard: APPLE_DESIGN_SYSTEM.ANIMATION.DURATION.STANDARD,
        complex: APPLE_DESIGN_SYSTEM.ANIMATION.DURATION.COMPLEX,
        enteringScreen: APPLE_DESIGN_SYSTEM.ANIMATION.DURATION.STANDARD,
        leavingScreen: APPLE_DESIGN_SYSTEM.ANIMATION.DURATION.STANDARD
      },
      easing: {
        easeInOut: APPLE_DESIGN_SYSTEM.ANIMATION.EASING.STANDARD,
        easeOut: APPLE_DESIGN_SYSTEM.ANIMATION.EASING.DECELERATE,
        easeIn: APPLE_DESIGN_SYSTEM.ANIMATION.EASING.ACCELERATE,
        sharp: APPLE_DESIGN_SYSTEM.ANIMATION.EASING.SHARP
      }
    }
  }

  // ** Merge with original overrides and Apple component overrides
  const mergedThemeConfig = deepmerge(
    baseThemeConfig,
    {
      components: deepmerge(
        overrides(settings),
        createAppleMuiComponentOverrides({
          palette: { mode: appleThemeMode }
        })
      )
    },
    userThemeConfig
  )

  // ** Apply theme color with Apple enhancements
  return deepmerge(mergedThemeConfig, {
    palette: {
      primary: {
        ...(mergedThemeConfig.palette ? mergedThemeConfig.palette[themeColor] : palette(appleThemeMode, skin).primary),

        // Ensure Apple blue is available as an option
        apple: {
          main: APPLE_DESIGN_SYSTEM.COLORS.PRIMARY.BLUE,
          light: APPLE_DESIGN_SYSTEM.COLORS.PRIMARY.LIGHT_BLUE,
          dark: APPLE_DESIGN_SYSTEM.COLORS.PRIMARY.DARK_BLUE
        }
      }
    },

    // ** Add Apple design system constants to theme for easy access
    appleDesignSystem: APPLE_DESIGN_SYSTEM
  })
}

/**
 * Standard theme options (original implementation)
 * Maintained for backward compatibility
 */
const standardThemeOptions = (settings, overrideMode) => {
  // ** Vars
  const { skin, mode, direction, themeColor } = settings

  // ** Create New object before removing user component overrides and typography objects from userThemeOptions
  const userThemeConfig = Object.assign({}, UserThemeOptions())

  const mergedThemeConfig = deepmerge(
    {
      breakpoints: breakpoints(),
      direction,
      components: overrides(settings),
      palette: palette(mode === 'semi-dark' ? overrideMode : mode, skin),
      ...spacing,
      shape: {
        borderRadius: 6
      },
      mixins: {
        toolbar: {
          minHeight: 64
        }
      },
      shadows: shadows(mode === 'semi-dark' ? overrideMode : mode),
      typography
    },
    userThemeConfig
  )

  return deepmerge(mergedThemeConfig, {
    palette: {
      primary: {
        ...(mergedThemeConfig.palette
          ? mergedThemeConfig.palette[themeColor]
          : palette(mode === 'semi-dark' ? overrideMode : mode, skin).primary)
      }
    }
  })
}

/**
 * Main theme options function with Apple Design System integration
 *
 * @param {Object} settings - Theme settings
 * @param {string} overrideMode - Override mode for semi-dark theme
 * @param {boolean} useAppleDesignSystem - Whether to use Apple Design System enhancements
 * @returns {Object} Theme configuration object
 */
const themeOptions = (settings, overrideMode, useAppleDesignSystem = true) => {
  if (useAppleDesignSystem) {
    return appleThemeOptions(settings, overrideMode)
  }

  return standardThemeOptions(settings, overrideMode)
}

// ** Export both versions for flexibility
export { appleThemeOptions, standardThemeOptions }

export default themeOptions
