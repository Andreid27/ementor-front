/**
 * Enhanced Responsive Design Hook
 *
 * This hook provides comprehensive responsive design utilities with mobile-first
 * approach and progressive enhancement. It addresses all requirements for
 * enhanced responsive design system.
 *
 * Requirements addressed:
 * - 8.1: Mobile-first responsive design with progressive enhancement
 * - 8.2: Minimum 48px touch targets on mobile devices
 * - 8.3: Mobile typography and spacing matching desktop quality
 * - 8.5: Adaptive layouts for all screen sizes
 */

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
  LAYOUT_CONFIGS,
  LINE_HEIGHT_RATIOS,
  TOUCH_INTERACTIONS,
  getResponsiveTypography,
  getLayoutConfig,
  getAdaptiveTouchTarget,
  getAdaptiveSpacing
} from '../constants/responsive'

// Enhanced responsive state interface
interface EnhancedResponsiveState {
  // Device detection
  deviceType: 'mobile' | 'tablet' | 'desktop'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean

  // Capabilities
  isTouchDevice: boolean
  supportsHover: boolean
  prefersReducedMotion: boolean

  // Screen properties
  orientation: 'portrait' | 'landscape'
  screenWidth: number
  screenHeight: number

  // Viewport properties
  viewportWidth: number
  viewportHeight: number

  // Network and performance
  isSlowConnection: boolean
  isLowEndDevice: boolean
}

// Enhanced responsive utilities interface
interface EnhancedResponsiveUtils {
  // Typography utilities (Requirement 8.3)
  getTypography: (variant: keyof typeof RESPONSIVE_TYPOGRAPHY) => {
    fontSize: string
    lineHeight: number
    fontWeight?: number
  }

  // Spacing utilities
  getSpacing: (size: keyof typeof RESPONSIVE_SPACING) => number
  getAdaptiveSpacing: (size: keyof typeof RESPONSIVE_SPACING) => number

  // Touch target utilities (Requirement 8.2)
  getTouchTarget: (baseSize?: number) => number
  getMinTouchTarget: () => number

  // Animation utilities
  getAnimationDuration: (type?: 'fast' | 'medium' | 'slow') => number
  getAnimationEasing: () => string
  shouldReduceMotion: () => boolean

  // Layout utilities (Requirement 8.5)
  getLayoutConfig: () => any
  getContainerWidth: (container?: keyof typeof CONTAINER_WIDTHS) => string

  // Interaction utilities
  shouldEnableHover: () => boolean
  shouldEnableAnimations: () => boolean
  getHapticFeedback: (type?: 'light' | 'medium' | 'heavy') => number

  // Performance utilities
  shouldOptimizeForPerformance: () => boolean
  getMaxParticles: () => number
}

// Main enhanced responsive hook
export const useEnhancedResponsive = (): EnhancedResponsiveState & EnhancedResponsiveUtils => {
  const theme = useTheme()

  // Enhanced media queries with more breakpoints
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('sm'))
  const isTabletQuery = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const isDesktopQuery = useMediaQuery(theme.breakpoints.up('md'))
  const isLargeDesktopQuery = useMediaQuery(theme.breakpoints.up('lg'))
  const isExtraLargeQuery = useMediaQuery(theme.breakpoints.up('xl'))

  // Network and performance detection
  const [networkInfo, setNetworkInfo] = useState({
    isSlowConnection: false,
    isLowEndDevice: false
  })

  // Enhanced screen dimensions state
  const [screenDimensions, setScreenDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  // Device capabilities state
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isTouchDevice: typeof window !== 'undefined' ? isTouchDevice() : false,
    supportsHover: typeof window !== 'undefined' ? supportsHover() : true,
    prefersReducedMotion: typeof window !== 'undefined' ? prefersReducedMotion() : false
  })

  // Orientation state
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    typeof window !== 'undefined' ? getOrientation() : 'portrait'
  )

  // Network information detection
  useEffect(() => {
    if (typeof window === 'undefined' || !('navigator' in window)) return

    const updateNetworkInfo = () => {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (connection) {
        const isSlowConnection = connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
        const isLowEndDevice = navigator.hardwareConcurrency <= 2 || (navigator as any).deviceMemory <= 2

        setNetworkInfo({
          isSlowConnection,
          isLowEndDevice
        })
      }
    }

    updateNetworkInfo()

    // Listen for network changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener('change', updateNetworkInfo)

      return () => {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  // Enhanced resize handler with viewport detection
  const handleResize = useCallback(() => {
    const newDimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight
    }

    setScreenDimensions(newDimensions)
    setOrientation(getOrientation())
  }, [])

  // Enhanced capability change handler
  const handleCapabilityChange = useCallback(() => {
    setDeviceCapabilities({
      isTouchDevice: isTouchDevice(),
      supportsHover: supportsHover(),
      prefersReducedMotion: prefersReducedMotion()
    })
  }, [])

  // Enhanced event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Throttled resize handler for better performance
    let resizeTimeout: NodeJS.Timeout
    const throttledResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', throttledResize)
    window.addEventListener('orientationchange', handleResize)

    // Listen for media query changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hoverQuery = window.matchMedia('(hover: hover)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')

    reducedMotionQuery.addEventListener('change', handleCapabilityChange)
    hoverQuery.addEventListener('change', handleCapabilityChange)

    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', throttledResize)
      window.removeEventListener('orientationchange', handleResize)
      reducedMotionQuery.removeEventListener('change', handleCapabilityChange)
      hoverQuery.removeEventListener('change', handleCapabilityChange)
    }
  }, [handleResize, handleCapabilityChange])

  // Determine device type with enhanced logic
  const deviceType = useMemo(() => {
    return getDeviceType(screenDimensions.width)
  }, [screenDimensions.width])

  // Enhanced typography utility (Requirement 8.3)
  const getTypography = useCallback(
    (variant: keyof typeof RESPONSIVE_TYPOGRAPHY) => {
      const config = getResponsiveTypography(variant, deviceType)

      // Add font weight based on variant
      let fontWeight = 400
      if (variant.includes('DISPLAY')) fontWeight = 600
      if (variant.includes('CAPTION')) fontWeight = 400

      return {
        fontSize: config.fontSize,
        lineHeight: config.lineHeight,
        fontWeight
      }
    },
    [deviceType]
  )

  // Enhanced spacing utility
  const getSpacing = useCallback(
    (size: keyof typeof RESPONSIVE_SPACING): number => {
      return RESPONSIVE_SPACING[size][deviceType] * 8 // Convert to pixels (8px base)
    },
    [deviceType]
  )

  // Adaptive spacing utility
  const getAdaptiveSpacingUtil = useCallback(
    (size: keyof typeof RESPONSIVE_SPACING): number => {
      return getAdaptiveSpacing(size, deviceType) * 8 // Convert to pixels (8px base)
    },
    [deviceType]
  )

  // Enhanced touch target utility (Requirement 8.2)
  const getTouchTarget = useCallback(
    (baseSize?: number): number => {
      return getAdaptiveTouchTarget(isMobileQuery, isTabletQuery, baseSize)
    },
    [isMobileQuery, isTabletQuery]
  )

  // Minimum touch target utility (Requirement 8.2)
  const getMinTouchTarget = useCallback((): number => {
    return TOUCH_TARGETS.MOBILE // Always ensure 48px minimum
  }, [])

  // Enhanced animation utilities
  const getAnimationDuration = useCallback(
    (type: 'fast' | 'medium' | 'slow' = 'medium'): number => {
      const config = RESPONSIVE_ANIMATIONS[deviceType.toUpperCase() as keyof typeof RESPONSIVE_ANIMATIONS]

      if (deviceCapabilities.prefersReducedMotion || networkInfo.isSlowConnection) {
        return 0
      }

      switch (type) {
        case 'fast':
          return config.duration * 0.7
        case 'slow':
          return config.duration * 1.3
        default:
          return config.duration
      }
    },
    [deviceType, deviceCapabilities.prefersReducedMotion, networkInfo.isSlowConnection]
  )

  const getAnimationEasing = useCallback((): string => {
    const config = RESPONSIVE_ANIMATIONS[deviceType.toUpperCase() as keyof typeof RESPONSIVE_ANIMATIONS]
    return config.easing
  }, [deviceType])

  const shouldReduceMotion = useCallback((): boolean => {
    return (
      deviceCapabilities.prefersReducedMotion ||
      networkInfo.isSlowConnection ||
      networkInfo.isLowEndDevice ||
      (deviceType === 'mobile' && RESPONSIVE_ANIMATIONS.MOBILE.reduceMotion)
    )
  }, [deviceCapabilities.prefersReducedMotion, networkInfo, deviceType])

  // Enhanced layout utilities (Requirement 8.5)
  const getLayoutConfigUtil = useCallback(() => {
    return getLayoutConfig(deviceType)
  }, [deviceType])

  const getContainerWidth = useCallback(
    (container: keyof typeof CONTAINER_WIDTHS = 'QUIZ_INTERFACE'): string => {
      return CONTAINER_WIDTHS[container][deviceType]
    },
    [deviceType]
  )

  // Enhanced interaction utilities
  const shouldEnableHover = useCallback((): boolean => {
    return deviceCapabilities.supportsHover && !shouldReduceMotion()
  }, [deviceCapabilities.supportsHover, shouldReduceMotion])

  const shouldEnableAnimations = useCallback((): boolean => {
    return !shouldReduceMotion()
  }, [shouldReduceMotion])

  const getHapticFeedback = useCallback(
    (type: 'light' | 'medium' | 'heavy' = 'medium'): number => {
      if (!deviceCapabilities.isTouchDevice) return 0
      return TOUCH_INTERACTIONS.HAPTIC_FEEDBACK[type.toUpperCase() as keyof typeof TOUCH_INTERACTIONS.HAPTIC_FEEDBACK]
    },
    [deviceCapabilities.isTouchDevice]
  )

  // Performance utilities
  const shouldOptimizeForPerformance = useCallback((): boolean => {
    return deviceType === 'mobile' || networkInfo.isSlowConnection || networkInfo.isLowEndDevice
  }, [deviceType, networkInfo])

  const getMaxParticles = useCallback((): number => {
    const config = RESPONSIVE_ANIMATIONS[deviceType.toUpperCase() as keyof typeof RESPONSIVE_ANIMATIONS]

    if (networkInfo.isLowEndDevice) return Math.floor(config.maxParticles * 0.5)
    if (networkInfo.isSlowConnection) return Math.floor(config.maxParticles * 0.7)

    return config.maxParticles
  }, [deviceType, networkInfo])

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
    viewportWidth: screenDimensions.viewportWidth,
    viewportHeight: screenDimensions.viewportHeight,
    isSlowConnection: networkInfo.isSlowConnection,
    isLowEndDevice: networkInfo.isLowEndDevice,

    // Utilities
    getTypography,
    getSpacing,
    getAdaptiveSpacing: getAdaptiveSpacingUtil,
    getTouchTarget,
    getMinTouchTarget,
    getAnimationDuration,
    getAnimationEasing,
    shouldReduceMotion,
    getLayoutConfig: getLayoutConfigUtil,
    getContainerWidth,
    shouldEnableHover,
    shouldEnableAnimations,
    getHapticFeedback,
    shouldOptimizeForPerformance,
    getMaxParticles
  }
}

// Specialized hook for quiz interface with enhanced responsive features
export const useEnhancedQuizInterface = () => {
  const responsive = useEnhancedResponsive()

  // Quiz-specific responsive configuration
  const quizConfig = useMemo(() => {
    const layoutConfig = responsive.getLayoutConfig()

    return {
      // Layout configuration (Requirement 8.5)
      stackLayout: layoutConfig.stackDirection === 'column',
      compactHeader: layoutConfig.headerCompact,
      sidebarCollapsed: layoutConfig.sidebarCollapsed,

      // Spacing configuration
      cardSpacing: responsive.getSpacing('LG'),
      questionSpacing: responsive.getSpacing('MD'),
      answerSpacing: responsive.getSpacing('SM'),
      sectionSpacing: layoutConfig.sectionSpacing,

      // Touch configuration (Requirement 8.2)
      touchTargetSize: responsive.getTouchTarget(),
      minTouchTarget: responsive.getMinTouchTarget(),

      // Typography configuration (Requirement 8.3)
      displayTypography: responsive.getTypography('DISPLAY'),
      bodyLargeTypography: responsive.getTypography('BODY_LARGE'),
      bodyRegularTypography: responsive.getTypography('BODY_REGULAR'),
      captionTypography: responsive.getTypography('CAPTION'),

      // Animation configuration
      enableHoverEffects: responsive.shouldEnableHover(),
      enableAnimations: responsive.shouldEnableAnimations(),
      animationDuration: responsive.getAnimationDuration(),
      animationEasing: responsive.getAnimationEasing(),

      // Performance configuration
      shouldOptimizeForPerformance: responsive.shouldOptimizeForPerformance(),
      maxParticles: responsive.getMaxParticles(),

      // Container configuration
      containerMaxWidth: responsive.getContainerWidth('QUIZ_INTERFACE'),
      questionCardMaxWidth: responsive.getContainerWidth('QUESTION_CARD'),
      submitCardMaxWidth: responsive.getContainerWidth('SUBMIT_CARD'),

      // Device-specific optimizations
      isMobileOptimized: responsive.isMobile,
      isTabletOptimized: responsive.isTablet,
      isTouchOptimized: responsive.isTouchDevice,
      isLandscape: responsive.orientation === 'landscape',

      // Haptic feedback
      getHapticFeedback: responsive.getHapticFeedback
    }
  }, [responsive])

  return {
    ...responsive,
    ...quizConfig
  }
}

export default useEnhancedResponsive
