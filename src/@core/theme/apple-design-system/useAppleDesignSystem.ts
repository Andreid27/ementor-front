/**
 * Apple Design System React Hook
 *
 * Provides easy access to Apple design system constants and utilities
 * within React components, ensuring consistent application of design principles.
 */

import { useMemo, useCallback } from 'react'
import { useTheme, useMediaQuery } from '@mui/material'
import { APPLE_DESIGN_SYSTEM } from './index'
import {
  getSpacing,
  getResponsiveSpacing,
  getComponentPadding,
  getTypographyScale,
  validateTypographyHierarchy,
  getBorderRadius,
  getComponentBorderRadius,
  getElevation,
  getComponentElevation,
  getColor,
  getInteractiveColor,
  getAnimationDuration,
  getEasing,
  getResponsiveValue,
  isBreakpoint,
  validateDesignSystem,
  generateCSSCustomProperties
} from './utils'

export interface AppleDesignSystemHook {
  // Spacing utilities
  spacing: {
    get: (multiplier: number) => number
    getResponsive: (mobile: number, desktop: number, breakpoint?: 'mobile' | 'desktop') => number
    getComponentPadding: (component: 'progress' | 'question' | 'submit', breakpoint?: 'mobile' | 'desktop') => number
    values: typeof APPLE_DESIGN_SYSTEM.SPACING
  }

  // Typography utilities
  typography: {
    getScale: (variant: 'display' | 'bodyLarge' | 'bodyRegular' | 'caption', breakpoint?: 'mobile' | 'desktop') => any
    validateHierarchy: (usedVariants: string[]) => boolean
    values: typeof APPLE_DESIGN_SYSTEM.TYPOGRAPHY
  }

  // Border radius utilities
  borderRadius: {
    get: (size: 'small' | 'medium' | 'large' | 'extraLarge') => number
    getComponent: (
      component: 'radio' | 'questionCard' | 'button' | 'modal',
      breakpoint?: 'mobile' | 'desktop'
    ) => number
    values: typeof APPLE_DESIGN_SYSTEM.BORDER_RADIUS
  }

  // Elevation utilities
  elevation: {
    get: (level: 'none' | 'subtle' | 'raised' | 'floating' | 'modal', theme?: 'light' | 'dark') => string
    getComponent: (component: 'progress' | 'question' | 'submit' | 'celebration', theme?: 'light' | 'dark') => string
    values: typeof APPLE_DESIGN_SYSTEM.ELEVATION
  }

  // Color utilities
  colors: {
    get: (
      category: 'primary' | 'success' | 'warning' | 'error' | 'text' | 'background' | 'border',
      variant?: string,
      theme?: 'light' | 'dark'
    ) => string
    getInteractive: (
      state: 'hover' | 'selected' | 'disabled',
      property: 'background' | 'border' | 'text',
      theme?: 'light' | 'dark'
    ) => string
    values: typeof APPLE_DESIGN_SYSTEM.COLORS
  }

  // Animation utilities
  animation: {
    getDuration: (type: 'micro' | 'standard' | 'complex' | 'celebration') => number
    getEasing: (type: 'standard' | 'decelerate' | 'accelerate' | 'sharp') => string
    values: typeof APPLE_DESIGN_SYSTEM.ANIMATION
  }

  // Responsive utilities
  responsive: {
    getValue: <T>(mobile: T, tablet: T, desktop: T, currentBreakpoint: 'mobile' | 'tablet' | 'desktop') => T
    isBreakpoint: (breakpoint: 'mobile' | 'tablet' | 'desktop', width: number) => boolean
    currentBreakpoint: 'mobile' | 'tablet' | 'desktop'
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    values: typeof APPLE_DESIGN_SYSTEM.BREAKPOINTS
  }

  // Validation utilities
  validation: {
    validateDesignSystem: (config: any) => { isValid: boolean; violations: string[] }
    values: typeof APPLE_DESIGN_SYSTEM.VALIDATION
  }

  // CSS utilities
  css: {
    generateCustomProperties: (theme?: 'light' | 'dark') => Record<string, string>
  }

  // Component-specific utilities
  components: typeof APPLE_DESIGN_SYSTEM.COMPONENTS
}

/**
 * Hook for accessing Apple Design System utilities and constants
 */
export const useAppleDesignSystem = (): AppleDesignSystemHook => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  // Determine current breakpoint
  const currentBreakpoint = useMemo((): 'mobile' | 'tablet' | 'desktop' => {
    if (isMobile) return 'mobile'
    if (isTablet) return 'tablet'
    return 'desktop'
  }, [isMobile, isTablet])

  // Determine theme mode
  const themeMode: 'light' | 'dark' = theme.palette.mode === 'dark' ? 'dark' : 'light'

  // Spacing utilities
  const spacing = useMemo(
    () => ({
      get: getSpacing,
      getResponsive: getResponsiveSpacing,
      getComponentPadding: (
        component: 'progress' | 'question' | 'submit',
        breakpoint = currentBreakpoint as 'mobile' | 'desktop'
      ) => getComponentPadding(component, breakpoint),
      values: APPLE_DESIGN_SYSTEM.SPACING
    }),
    [currentBreakpoint]
  )

  // Typography utilities
  const typography = useMemo(
    () => ({
      getScale: (
        variant: 'display' | 'bodyLarge' | 'bodyRegular' | 'caption',
        breakpoint = currentBreakpoint as 'mobile' | 'desktop'
      ) => getTypographyScale(variant, breakpoint),
      validateHierarchy: validateTypographyHierarchy,
      values: APPLE_DESIGN_SYSTEM.TYPOGRAPHY
    }),
    [currentBreakpoint]
  )

  // Border radius utilities
  const borderRadius = useMemo(
    () => ({
      get: getBorderRadius,
      getComponent: (
        component: 'radio' | 'questionCard' | 'button' | 'modal',
        breakpoint = currentBreakpoint as 'mobile' | 'desktop'
      ) => getComponentBorderRadius(component, breakpoint),
      values: APPLE_DESIGN_SYSTEM.BORDER_RADIUS
    }),
    [currentBreakpoint]
  )

  // Elevation utilities
  const elevation = useMemo(
    () => ({
      get: (level: 'none' | 'subtle' | 'raised' | 'floating' | 'modal', themeOverride = themeMode) =>
        getElevation(level, themeOverride),
      getComponent: (component: 'progress' | 'question' | 'submit' | 'celebration', themeOverride = themeMode) =>
        getComponentElevation(component, themeOverride),
      values: APPLE_DESIGN_SYSTEM.ELEVATION
    }),
    [themeMode]
  )

  // Color utilities
  const colors = useMemo(
    () => ({
      get: (
        category: 'primary' | 'success' | 'warning' | 'error' | 'text' | 'background' | 'border',
        variant?: string,
        themeOverride = themeMode
      ) => getColor(category, variant, themeOverride),
      getInteractive: (
        state: 'hover' | 'selected' | 'disabled',
        property: 'background' | 'border' | 'text',
        themeOverride = themeMode
      ) => getInteractiveColor(state, property, themeOverride),
      values: APPLE_DESIGN_SYSTEM.COLORS
    }),
    [themeMode]
  )

  // Animation utilities
  const animation = useMemo(
    () => ({
      getDuration: getAnimationDuration,
      getEasing: getEasing,
      values: APPLE_DESIGN_SYSTEM.ANIMATION
    }),
    []
  )

  // Responsive utilities
  const responsive = useMemo(
    () => ({
      getValue: getResponsiveValue,
      isBreakpoint: isBreakpoint,
      currentBreakpoint,
      isMobile,
      isTablet,
      isDesktop,
      values: APPLE_DESIGN_SYSTEM.BREAKPOINTS
    }),
    [currentBreakpoint, isMobile, isTablet, isDesktop]
  )

  // Validation utilities
  const validation = useMemo(
    () => ({
      validateDesignSystem,
      values: APPLE_DESIGN_SYSTEM.VALIDATION
    }),
    []
  )

  // CSS utilities
  const css = useMemo(
    () => ({
      generateCustomProperties: (themeOverride = themeMode) => generateCSSCustomProperties(themeOverride)
    }),
    [themeMode]
  )

  return {
    spacing,
    typography,
    borderRadius,
    elevation,
    colors,
    animation,
    responsive,
    validation,
    css,
    components: APPLE_DESIGN_SYSTEM.COMPONENTS
  }
}

/**
 * Hook for getting responsive typography styles
 */
export const useAppleTypography = (variant: 'display' | 'bodyLarge' | 'bodyRegular' | 'caption') => {
  const { typography, responsive } = useAppleDesignSystem()

  return useMemo(() => {
    const breakpoint = responsive.currentBreakpoint === 'mobile' ? 'mobile' : 'desktop'
    return typography.getScale(variant, breakpoint)
  }, [typography, responsive.currentBreakpoint, variant])
}

/**
 * Hook for getting responsive spacing
 */
export const useAppleSpacing = () => {
  const { spacing, responsive } = useAppleDesignSystem()

  const getResponsive = useCallback(
    (mobile: number, desktop: number) => {
      const breakpoint = responsive.currentBreakpoint === 'mobile' ? 'mobile' : 'desktop'
      return spacing.getResponsive(mobile, desktop, breakpoint)
    },
    [spacing, responsive.currentBreakpoint]
  )

  const getComponentPadding = useCallback(
    (component: 'progress' | 'question' | 'submit') => {
      const breakpoint = responsive.currentBreakpoint === 'mobile' ? 'mobile' : 'desktop'
      return spacing.getComponentPadding(component, breakpoint)
    },
    [spacing, responsive.currentBreakpoint]
  )

  return {
    get: spacing.get,
    getResponsive,
    getComponentPadding,
    values: spacing.values
  }
}

/**
 * Hook for getting responsive border radius
 */
export const useAppleBorderRadius = () => {
  const { borderRadius, responsive } = useAppleDesignSystem()

  const getComponent = useCallback(
    (component: 'radio' | 'questionCard' | 'button' | 'modal') => {
      const breakpoint = responsive.currentBreakpoint === 'mobile' ? 'mobile' : 'desktop'
      return borderRadius.getComponent(component, breakpoint)
    },
    [borderRadius, responsive.currentBreakpoint]
  )

  return {
    get: borderRadius.get,
    getComponent,
    values: borderRadius.values
  }
}

/**
 * Hook for getting theme-aware colors
 */
export const useAppleColors = () => {
  const { colors } = useAppleDesignSystem()

  return colors
}

/**
 * Hook for getting animation values
 */
export const useAppleAnimation = () => {
  const { animation } = useAppleDesignSystem()

  return animation
}

/**
 * Hook for responsive utilities
 */
export const useAppleResponsive = () => {
  const { responsive } = useAppleDesignSystem()

  return responsive
}

export default useAppleDesignSystem
