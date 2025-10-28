/**
 * Apple Animation System React Hook
 *
 * This hook provides easy access to Apple-style animations with automatic
 * reduced motion support and performance optimizations.
 *
 * Requirements addressed:
 * - 7.1: Consistent animation durations (150ms micro-interactions, 300ms transitions)
 * - 7.2: Apple-style cubic-bezier easing functions
 * - 7.4: Reduced motion support system
 * - 7.5: Ensure all animations serve functional purposes
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  APPLE_ANIMATION_DURATIONS,
  APPLE_EASING_FUNCTIONS,
  APPLE_REDUCED_MOTION,
  APPLE_ANIMATION_UTILS,
  APPLE_COMPONENT_ANIMATIONS,
  APPLE_RESPONSIVE_ANIMATIONS
} from './animations'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
  properties?: string[]
}

interface ComponentAnimationConfig {
  [key: string]: AnimationConfig
}

interface UseAppleAnimationsReturn {
  // Reduced motion detection
  prefersReducedMotion: boolean

  // Duration getters with reduced motion support
  getDuration: (normalDuration: number) => number
  getMicroDuration: () => number
  getStandardDuration: () => number
  getComplexDuration: () => number

  // Easing functions
  easing: typeof APPLE_EASING_FUNCTIONS

  // Transition creators
  createTransition: (property: string | string[], duration?: number, easing?: string, delay?: number) => string

  // Component-specific animations
  getComponentAnimation: (component: string, animation: string) => AnimationConfig | null

  // CSS class helpers
  getAnimationClasses: (component: string) => string[]

  // Performance helpers
  optimizeForPerformance: (element: HTMLElement) => void
  cleanupPerformanceOptimizations: (element: HTMLElement) => void

  // Responsive animation adjustments
  getResponsiveDuration: (baseDuration: number) => number
}

// ============================================================================
// CUSTOM HOOK IMPLEMENTATION
// ============================================================================

export const useAppleAnimations = (): UseAppleAnimationsReturn => {
  // ============================================================================
  // STATE AND EFFECTS
  // ============================================================================

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  // Detect reduced motion preference (Requirement 7.4)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Detect screen size for responsive animations
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width <= 767) {
        setScreenSize('mobile')
      } else if (width <= 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)

    return () => {
      window.removeEventListener('resize', updateScreenSize)
    }
  }, [])

  // ============================================================================
  // DURATION HELPERS WITH REDUCED MOTION SUPPORT
  // ============================================================================

  const getDuration = useCallback(
    (normalDuration: number): number => {
      return prefersReducedMotion ? APPLE_REDUCED_MOTION.DURATION.MICRO : normalDuration
    },
    [prefersReducedMotion]
  )

  const getMicroDuration = useCallback((): number => {
    return getDuration(APPLE_ANIMATION_DURATIONS.MICRO)
  }, [getDuration])

  const getStandardDuration = useCallback((): number => {
    return getDuration(APPLE_ANIMATION_DURATIONS.STANDARD)
  }, [getDuration])

  const getComplexDuration = useCallback((): number => {
    return getDuration(APPLE_ANIMATION_DURATIONS.COMPLEX)
  }, [getDuration])

  // ============================================================================
  // RESPONSIVE DURATION ADJUSTMENTS
  // ============================================================================

  const getResponsiveDuration = useCallback(
    (baseDuration: number): number => {
      let adjustedDuration = baseDuration

      // Apply screen size multipliers
      switch (screenSize) {
        case 'mobile':
          adjustedDuration *= APPLE_RESPONSIVE_ANIMATIONS.MOBILE.DURATION_MULTIPLIER
          break
        case 'tablet':
          adjustedDuration *= APPLE_RESPONSIVE_ANIMATIONS.TABLET.DURATION_MULTIPLIER
          break
        case 'desktop':
          adjustedDuration *= APPLE_RESPONSIVE_ANIMATIONS.DESKTOP.DURATION_MULTIPLIER
          break
      }

      // Apply reduced motion if needed
      return getDuration(adjustedDuration)
    },
    [screenSize, getDuration]
  )

  // ============================================================================
  // TRANSITION CREATORS
  // ============================================================================

  const createTransition = useCallback(
    (
      property: string | string[],
      duration: number = APPLE_ANIMATION_DURATIONS.STANDARD,
      easing: string = APPLE_EASING_FUNCTIONS.STANDARD,
      delay: number = 0
    ): string => {
      const adjustedDuration = getResponsiveDuration(duration)
      return APPLE_ANIMATION_UTILS.createTransition(property, adjustedDuration, easing, delay)
    },
    [getResponsiveDuration]
  )

  // ============================================================================
  // COMPONENT-SPECIFIC ANIMATION HELPERS
  // ============================================================================

  const getComponentAnimation = useCallback(
    (component: string, animation: string): AnimationConfig | null => {
      const componentAnimations = APPLE_COMPONENT_ANIMATIONS[
        component as keyof typeof APPLE_COMPONENT_ANIMATIONS
      ] as any
      if (!componentAnimations) return null

      const animationConfig = componentAnimations[animation] as AnimationConfig | undefined
      if (!animationConfig) return null

      // Apply responsive duration adjustments
      return {
        ...animationConfig,
        duration: getResponsiveDuration(animationConfig.duration)
      }
    },
    [getResponsiveDuration]
  )

  // ============================================================================
  // CSS CLASS HELPERS
  // ============================================================================

  const getAnimationClasses = useCallback(
    (component: string): string[] => {
      const baseClasses = [`apple-${component.toLowerCase().replace('_', '-')}`]

      // Add responsive classes
      if (screenSize === 'mobile') {
        baseClasses.push('apple-mobile-optimized', 'apple-touch-feedback')
      }

      // Add performance optimization classes
      baseClasses.push('apple-gpu-accelerated')

      // Add reduced motion class if needed
      if (prefersReducedMotion) {
        baseClasses.push('apple-reduced-motion')
      }

      return baseClasses
    },
    [screenSize, prefersReducedMotion]
  )

  // ============================================================================
  // PERFORMANCE OPTIMIZATION HELPERS
  // ============================================================================

  const optimizeForPerformance = useCallback((element: HTMLElement): void => {
    // Apply performance optimizations (Requirement 7.5)
    element.style.willChange = 'transform, opacity'
    element.style.backfaceVisibility = 'hidden'
    element.style.perspective = '1000px'
    element.style.transformStyle = 'preserve-3d'

    // Force GPU acceleration
    if (element.style.transform === '') {
      element.style.transform = 'translateZ(0)'
    }
  }, [])

  const cleanupPerformanceOptimizations = useCallback((element: HTMLElement): void => {
    // Remove performance optimizations after animation
    element.style.willChange = 'auto'

    // Remove GPU acceleration if it was only for optimization
    if (element.style.transform === 'translateZ(0)') {
      element.style.transform = ''
    }
  }, [])

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const easing = useMemo(() => APPLE_EASING_FUNCTIONS, [])

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // Reduced motion detection
    prefersReducedMotion,

    // Duration getters with reduced motion support
    getDuration,
    getMicroDuration,
    getStandardDuration,
    getComplexDuration,

    // Easing functions
    easing,

    // Transition creators
    createTransition,

    // Component-specific animations
    getComponentAnimation,

    // CSS class helpers
    getAnimationClasses,

    // Performance helpers
    optimizeForPerformance,
    cleanupPerformanceOptimizations,

    // Responsive animation adjustments
    getResponsiveDuration
  }
}

// ============================================================================
// ADDITIONAL UTILITY HOOKS
// ============================================================================

/**
 * Hook for managing animation lifecycle with performance optimizations
 */
export const useAnimationLifecycle = (elementRef: React.RefObject<HTMLElement>, isAnimating: boolean) => {
  const { optimizeForPerformance, cleanupPerformanceOptimizations } = useAppleAnimations()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    if (isAnimating) {
      optimizeForPerformance(element)
    } else {
      // Cleanup after a short delay to ensure animation is complete
      const timeoutId = setTimeout(() => {
        cleanupPerformanceOptimizations(element)
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [isAnimating, optimizeForPerformance, cleanupPerformanceOptimizations, elementRef])
}

/**
 * Hook for creating component-specific animation styles
 */
export const useComponentAnimationStyles = (component: string, animations: string[]) => {
  const { getComponentAnimation, createTransition } = useAppleAnimations()

  return useMemo(() => {
    const styles: React.CSSProperties = {}

    animations.forEach(animationName => {
      const config = getComponentAnimation(component, animationName)
      if (config && config.properties) {
        styles.transition = createTransition(config.properties, config.duration, config.easing, config.delay)
      }
    })

    return styles
  }, [component, animations, getComponentAnimation, createTransition])
}

/**
 * Hook for handling touch feedback animations on mobile
 */
export const useTouchFeedback = (elementRef: React.RefObject<HTMLElement>) => {
  const { getResponsiveDuration, easing } = useAppleAnimations()

  const handleTouchStart = useCallback(() => {
    const element = elementRef.current
    if (!element) return

    element.style.transform = 'scale(0.98)'
    element.style.transition = `transform ${getResponsiveDuration(100)}ms ${easing.TOUCH_EASE}`
  }, [elementRef, getResponsiveDuration, easing])

  const handleTouchEnd = useCallback(() => {
    const element = elementRef.current
    if (!element) return

    element.style.transform = 'scale(1)'
  }, [elementRef])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [elementRef, handleTouchStart, handleTouchEnd])
}

export default useAppleAnimations
