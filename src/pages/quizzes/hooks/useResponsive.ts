// Custom hook for responsive design and device detection
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'
import {
  getDeviceType,
  isTouchDevice,
  supportsHover,
  prefersReducedMotion,
  getOrientation,
  BREAKPOINTS,
  RESPONSIVE_SPACING,
  RESPONSIVE_TYPOGRAPHY,
  RESPONSIVE_ANIMATIONS,
  TOUCH_TARGETS,
  CONTAINER_WIDTHS,
  getResponsiveTypography,
  getLayoutConfig
} from '../constants/responsive'

interface ResponsiveState {
  deviceType: 'mobile' | 'tablet' | 'desktop'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  supportsHover: boolean
  prefersReducedMotion: boolean
  orientation: 'portrait' | 'landscape'
  screenWidth: number
  screenHeight: number
}

interface ResponsiveUtils {
  getSpacing: (size: keyof typeof RESPONSIVE_SPACING) => number
  getTypography: (variant: keyof typeof RESPONSIVE_TYPOGRAPHY) => string
  getAnimationDuration: () => number
  getAnimationEasing: () => string
  shouldReduceMotion: () => boolean
}

export const useResponsive = (): ResponsiveState & ResponsiveUtils => {
  const theme = useTheme()

  // Media queries
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('sm'))
  const isTabletQuery = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktopQuery = useMediaQuery(theme.breakpoints.up('md'))

  // State for dynamic values
  const [screenDimensions, setScreenDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isTouchDevice: typeof window !== 'undefined' ? isTouchDevice() : false,
    supportsHover: typeof window !== 'undefined' ? supportsHover() : true,
    prefersReducedMotion: typeof window !== 'undefined' ? prefersReducedMotion() : false
  })

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' ? getOrientation() : 'portrait'
  )

  // Update screen dimensions on resize
  const handleResize = useCallback(() => {
    setScreenDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })
    setOrientation(getOrientation())
  }, [])

  // Update device capabilities on media query changes
  const handleCapabilityChange = useCallback(() => {
    setDeviceCapabilities({
      isTouchDevice: isTouchDevice(),
      supportsHover: supportsHover(),
      prefersReducedMotion: prefersReducedMotion()
    })
  }, [])

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    // Listen for media query changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hoverQuery = window.matchMedia('(hover: hover)')

    reducedMotionQuery.addEventListener('change', handleCapabilityChange)
    hoverQuery.addEventListener('change', handleCapabilityChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      reducedMotionQuery.removeEventListener('change', handleCapabilityChange)
      hoverQuery.removeEventListener('change', handleCapabilityChange)
    }
  }, [handleResize, handleCapabilityChange])

  // Determine device type
  const deviceType = getDeviceType(screenDimensions.width)

  // Utility functions
  const getSpacing = useCallback(
    (size: keyof typeof RESPONSIVE_SPACING): number => {
      const spacingConfig = RESPONSIVE_SPACING[size]
      switch (deviceType) {
        case 'mobile':
          return theme.spacing(spacingConfig.mobile)
        case 'tablet':
          return theme.spacing(spacingConfig.tablet)
        case 'desktop':
          return theme.spacing(spacingConfig.desktop)
        default:
          return theme.spacing(spacingConfig.mobile)
      }
    },
    [deviceType, theme]
  )

  const getTypography = useCallback(
    (variant: keyof typeof RESPONSIVE_TYPOGRAPHY): string => {
      const typographyConfig = RESPONSIVE_TYPOGRAPHY[variant]
      switch (deviceType) {
        case 'mobile':
          return typographyConfig.mobile
        case 'tablet':
          return typographyConfig.tablet
        case 'desktop':
          return typographyConfig.desktop
        default:
          return typographyConfig.mobile
      }
    },
    [deviceType]
  )

  const getAnimationDuration = useCallback((): number => {
    const animationConfig = RESPONSIVE_ANIMATIONS[deviceType.toUpperCase() as keyof typeof RESPONSIVE_ANIMATIONS]
    return deviceCapabilities.prefersReducedMotion ? 0 : animationConfig.duration
  }, [deviceType, deviceCapabilities.prefersReducedMotion])

  const getAnimationEasing = useCallback((): string => {
    const animationConfig = RESPONSIVE_ANIMATIONS[deviceType.toUpperCase() as keyof typeof RESPONSIVE_ANIMATIONS]
    return animationConfig.easing
  }, [deviceType])

  const shouldReduceMotion = useCallback((): boolean => {
    return (
      deviceCapabilities.prefersReducedMotion || (deviceType === 'mobile' && RESPONSIVE_ANIMATIONS.MOBILE.reduceMotion)
    )
  }, [deviceCapabilities.prefersReducedMotion, deviceType])

  return {
    // State
    deviceType,
    isMobile: isMobileQuery,
    isTablet: isTabletQuery,
    isDesktop: isDesktopQuery,
    isTouchDevice: deviceCapabilities.isTouchDevice,
    supportsHover: deviceCapabilities.supportsHover,
    prefersReducedMotion: deviceCapabilities.prefersReducedMotion,
    orientation,
    screenWidth: screenDimensions.width,
    screenHeight: screenDimensions.height,

    // Utilities
    getSpacing,
    getTypography,
    getAnimationDuration,
    getAnimationEasing,
    shouldReduceMotion
  }
}

// Hook for responsive DataGrid configuration
export const useResponsiveDataGrid = () => {
  const { deviceType, isMobile, isTablet } = useResponsive()

  return {
    pageSize: 5,
    density: (isMobile ? 'compact' : 'standard') as 'compact' | 'standard' | 'comfortable',
    rowHeight: isMobile ? 60 : 52,
    hideColumns: isMobile ? ['chapter', 'duration', 'attempts'] : isTablet ? ['attempts'] : [],
    disableColumnMenu: isMobile,
    disableColumnFilter: isMobile,
    disableColumnSelector: isMobile,
    disableDensitySelector: isMobile,
    showCellRightBorder: !isMobile,
    showColumnRightBorder: !isMobile
  }
}

// Enhanced hook for responsive quiz interface configuration
export const useResponsiveQuizInterface = () => {
  const { deviceType, isMobile, isTablet, isTouchDevice, shouldReduceMotion, getSpacing, supportsHover, orientation } =
    useResponsive()

  // Get adaptive touch target size (Requirement 8.2)
  const touchTargetSize = useMemo(() => {
    if (isMobile) return TOUCH_TARGETS.MOBILE // 48px minimum on mobile
    if (isTablet && isTouchDevice) return TOUCH_TARGETS.COMFORTABLE
    return TOUCH_TARGETS.MINIMUM
  }, [isMobile, isTablet, isTouchDevice])

  // Get layout configuration (Requirement 8.5)
  const layoutConfig = useMemo(() => {
    return getLayoutConfig(deviceType)
  }, [deviceType])

  // Enhanced responsive configuration
  return {
    // Spacing configuration
    cardSpacing: getSpacing('LG'),
    questionSpacing: getSpacing('MD'),
    answerSpacing: getSpacing('SM'),
    sectionSpacing: layoutConfig.sectionSpacing,

    // Touch and interaction configuration (Requirement 8.2)
    touchTargetSize,
    minTouchTarget: TOUCH_TARGETS.MOBILE, // Always ensure 48px minimum

    // Animation and interaction preferences
    enableHoverEffects: supportsHover && !shouldReduceMotion(),
    enableAnimations: !shouldReduceMotion(),
    animationDuration: RESPONSIVE_ANIMATIONS[deviceType.toUpperCase() as keyof typeof RESPONSIVE_ANIMATIONS].duration,

    // Layout configuration (Requirement 8.5)
    stackLayout: layoutConfig.stackDirection === 'column',
    compactHeader: layoutConfig.headerCompact,
    sidebarCollapsed: layoutConfig.sidebarCollapsed,

    // Device-specific optimizations
    isMobileOptimized: isMobile,
    isTabletOptimized: isTablet,
    isTouchOptimized: isTouchDevice,
    isLandscape: orientation === 'landscape',

    // Typography configuration (Requirement 8.3)
    getTypographyConfig: (variant: keyof typeof RESPONSIVE_TYPOGRAPHY) => getResponsiveTypography(variant, deviceType),

    // Container configuration
    containerMaxWidth: CONTAINER_WIDTHS.QUIZ_INTERFACE[deviceType],

    // Performance optimizations
    shouldOptimizeForMobile: isMobile,
    maxParticles: RESPONSIVE_ANIMATIONS[deviceType.toUpperCase() as keyof typeof RESPONSIVE_ANIMATIONS].maxParticles
  }
}

// Hook for responsive celebration animations
export const useResponsiveCelebration = () => {
  const { deviceType, shouldReduceMotion, prefersReducedMotion } = useResponsive()

  return {
    enableFullscreenAnimation: !shouldReduceMotion() && deviceType !== 'mobile',
    enableParticleEffects: !shouldReduceMotion() && !prefersReducedMotion,
    enableSoundEffects: deviceType === 'desktop' && !prefersReducedMotion,
    animationDuration: shouldReduceMotion() ? 500 : deviceType === 'mobile' ? 1000 : 2000,
    particleCount: deviceType === 'mobile' ? 50 : deviceType === 'tablet' ? 100 : 150
  }
}
