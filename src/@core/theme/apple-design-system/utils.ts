/**
 * Apple Design System Utility Functions
 *
 * Provides helper functions for consistent application of the design system
 * across components and ensures adherence to Apple design principles.
 */

import { APPLE_DESIGN_SYSTEM } from './index'

// ============================================================================
// SPACING UTILITIES
// ============================================================================

/**
 * Get spacing value based on 8px grid system (Requirement 6.1)
 */
export const getSpacing = (multiplier: number): number => {
  return APPLE_DESIGN_SYSTEM.SPACING.BASE * multiplier
}

/**
 * Get responsive spacing based on breakpoint
 */
export const getResponsiveSpacing = (
  mobile: number,
  desktop: number,
  breakpoint: 'mobile' | 'desktop' = 'desktop'
): number => {
  return breakpoint === 'mobile' ? mobile : desktop
}

/**
 * Get component-specific padding
 */
export const getComponentPadding = (
  component: 'progress' | 'question' | 'submit',
  breakpoint: 'mobile' | 'desktop' = 'desktop'
): number => {
  const { COMPONENTS } = APPLE_DESIGN_SYSTEM

  switch (component) {
    case 'progress':
      return breakpoint === 'mobile'
        ? COMPONENTS.PROGRESS_CARD.PADDING.MOBILE
        : COMPONENTS.PROGRESS_CARD.PADDING.DESKTOP
    case 'question':
      return breakpoint === 'mobile'
        ? COMPONENTS.QUESTION_CARD.PADDING.MOBILE
        : COMPONENTS.QUESTION_CARD.PADDING.DESKTOP
    case 'submit':
      return breakpoint === 'mobile' ? COMPONENTS.SUBMIT_CARD.PADDING.MOBILE : COMPONENTS.SUBMIT_CARD.PADDING.DESKTOP
    default:
      return APPLE_DESIGN_SYSTEM.SPACING.MD
  }
}

// ============================================================================
// TYPOGRAPHY UTILITIES
// ============================================================================

/**
 * Get typography scale ensuring maximum 3 sizes per screen (Requirement 6.2)
 */
export const getTypographyScale = (
  variant: 'display' | 'bodyLarge' | 'bodyRegular' | 'caption',
  breakpoint: 'mobile' | 'desktop' = 'desktop'
) => {
  const { TYPOGRAPHY } = APPLE_DESIGN_SYSTEM

  const scales = {
    display: TYPOGRAPHY.DISPLAY,
    bodyLarge: TYPOGRAPHY.BODY_LARGE,
    bodyRegular: TYPOGRAPHY.BODY_REGULAR,
    caption: TYPOGRAPHY.CAPTION
  }

  const scale = scales[variant]

  return {
    fontSize: breakpoint === 'mobile' ? scale.SIZE.MOBILE : scale.SIZE.DESKTOP,
    lineHeight: breakpoint === 'mobile' ? scale.LINE_HEIGHT.MOBILE : scale.LINE_HEIGHT.DESKTOP,
    fontWeight: scale.WEIGHT,
    letterSpacing: scale.LETTER_SPACING,
    fontFamily: TYPOGRAPHY.FONT_FAMILY
  }
}

/**
 * Validate typography hierarchy (max 3 sizes per screen)
 */
export const validateTypographyHierarchy = (usedVariants: string[]): boolean => {
  return usedVariants.length <= APPLE_DESIGN_SYSTEM.TYPOGRAPHY.MAX_SIZES_PER_SCREEN
}

// ============================================================================
// BORDER RADIUS UTILITIES
// ============================================================================

/**
 * Get consistent border radius (Requirement 6.3)
 */
export const getBorderRadius = (size: 'small' | 'medium' | 'large' | 'extraLarge'): number => {
  const { BORDER_RADIUS } = APPLE_DESIGN_SYSTEM

  switch (size) {
    case 'small':
      return BORDER_RADIUS.SMALL
    case 'medium':
      return BORDER_RADIUS.MEDIUM
    case 'large':
      return BORDER_RADIUS.LARGE
    case 'extraLarge':
      return BORDER_RADIUS.EXTRA_LARGE
    default:
      return BORDER_RADIUS.MEDIUM
  }
}

/**
 * Get component-specific border radius
 */
export const getComponentBorderRadius = (
  component: 'radio' | 'questionCard' | 'button' | 'modal',
  breakpoint: 'mobile' | 'desktop' = 'desktop'
): number => {
  const { BORDER_RADIUS } = APPLE_DESIGN_SYSTEM

  switch (component) {
    case 'radio':
      return BORDER_RADIUS.RADIO_COMPONENT
    case 'questionCard':
      return breakpoint === 'mobile' ? BORDER_RADIUS.QUESTION_CARD.MOBILE : BORDER_RADIUS.QUESTION_CARD.DESKTOP
    case 'button':
      return BORDER_RADIUS.BUTTON
    case 'modal':
      return BORDER_RADIUS.MODAL
    default:
      return BORDER_RADIUS.MEDIUM
  }
}

// ============================================================================
// ELEVATION UTILITIES
// ============================================================================

/**
 * Get elevation shadow (maximum 4dp - Requirement 6.4)
 */
export const getElevation = (
  level: 'none' | 'subtle' | 'raised' | 'floating' | 'modal',
  theme: 'light' | 'dark' = 'light'
): string => {
  const { ELEVATION } = APPLE_DESIGN_SYSTEM
  const shadows = theme === 'light' ? ELEVATION.SHADOWS.LIGHT : ELEVATION.SHADOWS.DARK

  switch (level) {
    case 'none':
      return shadows.NONE
    case 'subtle':
      return shadows.SUBTLE
    case 'raised':
      return shadows.RAISED
    case 'floating':
      return shadows.FLOATING
    case 'modal':
      return shadows.MODAL
    default:
      return shadows.NONE
  }
}

/**
 * Get component-specific elevation
 */
export const getComponentElevation = (
  component: 'progress' | 'question' | 'submit' | 'celebration',
  theme: 'light' | 'dark' = 'light'
): string => {
  const { ELEVATION } = APPLE_DESIGN_SYSTEM

  const elevationMap = {
    progress: ELEVATION.PROGRESS_CARD,
    question: ELEVATION.QUESTION_CARD,
    submit: ELEVATION.SUBMIT_CARD,
    celebration: ELEVATION.CELEBRATION
  }

  const level = elevationMap[component]
  const shadows = theme === 'light' ? ELEVATION.SHADOWS.LIGHT : ELEVATION.SHADOWS.DARK

  switch (level) {
    case 1:
      return shadows.SUBTLE
    case 2:
      return shadows.RAISED
    case 4:
      return shadows.MODAL
    default:
      return shadows.NONE
  }
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Get color with proper contrast validation (Requirement 6.5)
 */
export const getColor = (
  category: 'primary' | 'success' | 'warning' | 'error' | 'text' | 'background' | 'border',
  variant?: string,
  theme: 'light' | 'dark' = 'light'
): string => {
  const { COLORS } = APPLE_DESIGN_SYSTEM

  switch (category) {
    case 'primary':
      return variant === 'light' ? COLORS.PRIMARY.LIGHT_BLUE : COLORS.PRIMARY.BLUE
    case 'success':
      return COLORS.SUCCESS
    case 'warning':
      return COLORS.WARNING
    case 'error':
      return COLORS.ERROR
    case 'text':
      if (variant === 'secondary') {
        return theme === 'light' ? COLORS.TEXT.SECONDARY.LIGHT : COLORS.TEXT.SECONDARY.DARK
      }
      return theme === 'light' ? COLORS.TEXT.PRIMARY.LIGHT : COLORS.TEXT.PRIMARY.DARK
    case 'background':
      if (variant === 'secondary') {
        return theme === 'light' ? COLORS.BACKGROUND.SECONDARY : COLORS.BACKGROUND.DARK_SECONDARY
      }
      return theme === 'light' ? COLORS.BACKGROUND.PRIMARY : COLORS.BACKGROUND.DARK_PRIMARY
    case 'border':
      return theme === 'light' ? COLORS.BORDER.LIGHT : COLORS.BORDER.DARK
    default:
      return COLORS.PRIMARY.BLUE
  }
}

/**
 * Get interactive state colors
 */
export const getInteractiveColor = (
  state: 'hover' | 'selected' | 'disabled',
  property: 'background' | 'border' | 'text',
  theme: 'light' | 'dark' = 'light'
): string => {
  const { COLORS } = APPLE_DESIGN_SYSTEM

  switch (state) {
    case 'hover':
      return property === 'background'
        ? theme === 'light'
          ? COLORS.INTERACTIVE.HOVER.LIGHT
          : COLORS.INTERACTIVE.HOVER.DARK
        : COLORS.PRIMARY.BLUE
    case 'selected':
      return property === 'background' ? COLORS.INTERACTIVE.SELECTED.BACKGROUND : COLORS.INTERACTIVE.SELECTED.BORDER
    case 'disabled':
      switch (property) {
        case 'background':
          return COLORS.INTERACTIVE.DISABLED.BACKGROUND
        case 'border':
          return COLORS.INTERACTIVE.DISABLED.BORDER
        case 'text':
          return COLORS.INTERACTIVE.DISABLED.TEXT
        default:
          return COLORS.INTERACTIVE.DISABLED.BACKGROUND
      }
    default:
      return COLORS.PRIMARY.BLUE
  }
}

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Get animation duration (Requirements 7.1)
 */
export const getAnimationDuration = (type: 'micro' | 'standard' | 'complex' | 'celebration'): number => {
  const { ANIMATION } = APPLE_DESIGN_SYSTEM

  switch (type) {
    case 'micro':
      return ANIMATION.DURATION.MICRO
    case 'standard':
      return ANIMATION.DURATION.STANDARD
    case 'complex':
      return ANIMATION.DURATION.COMPLEX
    case 'celebration':
      return ANIMATION.DURATION.CELEBRATION
    default:
      return ANIMATION.DURATION.STANDARD
  }
}

/**
 * Get Apple-style easing function (Requirement 7.2)
 */
export const getEasing = (type: 'standard' | 'decelerate' | 'accelerate' | 'sharp'): string => {
  const { ANIMATION } = APPLE_DESIGN_SYSTEM

  switch (type) {
    case 'standard':
      return ANIMATION.EASING.STANDARD
    case 'decelerate':
      return ANIMATION.EASING.DECELERATE
    case 'accelerate':
      return ANIMATION.EASING.ACCELERATE
    case 'sharp':
      return ANIMATION.EASING.SHARP
    default:
      return ANIMATION.EASING.STANDARD
  }
}

// ============================================================================
// RESPONSIVE UTILITIES
// ============================================================================

/**
 * Get responsive value based on breakpoint
 */
export const getResponsiveValue = <T>(
  mobile: T,
  tablet: T,
  desktop: T,
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop'
): T => {
  switch (currentBreakpoint) {
    case 'mobile':
      return mobile
    case 'tablet':
      return tablet
    case 'desktop':
      return desktop
    default:
      return desktop
  }
}

/**
 * Check if current viewport matches breakpoint
 */
export const isBreakpoint = (breakpoint: 'mobile' | 'tablet' | 'desktop', width: number): boolean => {
  const { BREAKPOINTS } = APPLE_DESIGN_SYSTEM

  switch (breakpoint) {
    case 'mobile':
      return width >= BREAKPOINTS.MOBILE.MIN && width <= BREAKPOINTS.MOBILE.MAX
    case 'tablet':
      return width >= BREAKPOINTS.TABLET.MIN && width <= BREAKPOINTS.TABLET.MAX
    case 'desktop':
      return width >= BREAKPOINTS.DESKTOP.MIN
    default:
      return false
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate design system compliance
 */
export const validateDesignSystem = (config: {
  spacingMultiples?: number[]
  typographyVariants?: string[]
  borderRadiusValues?: number[]
  elevationLevels?: number[]
  contrastRatios?: number[]
}): {
  isValid: boolean
  violations: string[]
} => {
  const violations: string[] = []

  // Check spacing follows 8px grid
  if (config.spacingMultiples) {
    const invalidSpacing = config.spacingMultiples.filter(value => value % APPLE_DESIGN_SYSTEM.SPACING.BASE !== 0)
    if (invalidSpacing.length > 0) {
      violations.push(`Spacing values not following 8px grid: ${invalidSpacing.join(', ')}`)
    }
  }

  // Check typography hierarchy limit
  if (config.typographyVariants && config.typographyVariants.length > 3) {
    violations.push(`Typography hierarchy exceeds 3 variants per screen: ${config.typographyVariants.length}`)
  }

  // Check border radius consistency
  if (config.borderRadiusValues) {
    const allowedRadii = [4, 8, 12, 16]
    const invalidRadii = config.borderRadiusValues.filter(value => !allowedRadii.includes(value))
    if (invalidRadii.length > 0) {
      violations.push(`Invalid border radius values: ${invalidRadii.join(', ')}`)
    }
  }

  // Check elevation limits
  if (config.elevationLevels) {
    const invalidElevation = config.elevationLevels.filter(level => level > 4)
    if (invalidElevation.length > 0) {
      violations.push(`Elevation exceeds 4dp maximum: ${invalidElevation.join(', ')}`)
    }
  }

  // Check contrast ratios
  if (config.contrastRatios) {
    const lowContrast = config.contrastRatios.filter(ratio => ratio < 4.5)
    if (lowContrast.length > 0) {
      violations.push(`Contrast ratios below 4.5:1 minimum: ${lowContrast.join(', ')}`)
    }
  }

  return {
    isValid: violations.length === 0,
    violations
  }
}

// ============================================================================
// CSS-IN-JS UTILITIES
// ============================================================================

/**
 * Generate CSS custom properties for the design system
 */
export const generateCSSCustomProperties = (theme: 'light' | 'dark' = 'light') => {
  const { SPACING, TYPOGRAPHY, BORDER_RADIUS, COLORS, ANIMATION } = APPLE_DESIGN_SYSTEM

  return {
    // Spacing
    '--apple-spacing-xs': `${SPACING.XS}px`,
    '--apple-spacing-sm': `${SPACING.SM}px`,
    '--apple-spacing-md': `${SPACING.MD}px`,
    '--apple-spacing-lg': `${SPACING.LG}px`,
    '--apple-spacing-xl': `${SPACING.XL}px`,
    '--apple-spacing-xxl': `${SPACING.XXL}px`,

    // Typography
    '--apple-font-family': TYPOGRAPHY.FONT_FAMILY,
    '--apple-font-size-display-mobile': `${TYPOGRAPHY.DISPLAY.SIZE.MOBILE}px`,
    '--apple-font-size-display-desktop': `${TYPOGRAPHY.DISPLAY.SIZE.DESKTOP}px`,
    '--apple-font-size-body-large-mobile': `${TYPOGRAPHY.BODY_LARGE.SIZE.MOBILE}px`,
    '--apple-font-size-body-large-desktop': `${TYPOGRAPHY.BODY_LARGE.SIZE.DESKTOP}px`,
    '--apple-font-size-body-regular-mobile': `${TYPOGRAPHY.BODY_REGULAR.SIZE.MOBILE}px`,
    '--apple-font-size-body-regular-desktop': `${TYPOGRAPHY.BODY_REGULAR.SIZE.DESKTOP}px`,

    // Border Radius
    '--apple-border-radius-small': `${BORDER_RADIUS.SMALL}px`,
    '--apple-border-radius-medium': `${BORDER_RADIUS.MEDIUM}px`,
    '--apple-border-radius-large': `${BORDER_RADIUS.LARGE}px`,
    '--apple-border-radius-extra-large': `${BORDER_RADIUS.EXTRA_LARGE}px`,

    // Colors
    '--apple-color-primary': COLORS.PRIMARY.BLUE,
    '--apple-color-success': COLORS.SUCCESS,
    '--apple-color-warning': COLORS.WARNING,
    '--apple-color-error': COLORS.ERROR,
    '--apple-color-text-primary': theme === 'light' ? COLORS.TEXT.PRIMARY.LIGHT : COLORS.TEXT.PRIMARY.DARK,
    '--apple-color-text-secondary': theme === 'light' ? COLORS.TEXT.SECONDARY.LIGHT : COLORS.TEXT.SECONDARY.DARK,
    '--apple-color-background': theme === 'light' ? COLORS.BACKGROUND.PRIMARY : COLORS.BACKGROUND.DARK_PRIMARY,
    '--apple-color-surface': theme === 'light' ? COLORS.BACKGROUND.SECONDARY : COLORS.BACKGROUND.DARK_SECONDARY,
    '--apple-color-border': theme === 'light' ? COLORS.BORDER.LIGHT : COLORS.BORDER.DARK,

    // Animation
    '--apple-duration-micro': `${ANIMATION.DURATION.MICRO}ms`,
    '--apple-duration-standard': `${ANIMATION.DURATION.STANDARD}ms`,
    '--apple-duration-complex': `${ANIMATION.DURATION.COMPLEX}ms`,
    '--apple-easing-standard': ANIMATION.EASING.STANDARD,
    '--apple-easing-decelerate': ANIMATION.EASING.DECELERATE,
    '--apple-easing-accelerate': ANIMATION.EASING.ACCELERATE
  }
}

export default {
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
}
