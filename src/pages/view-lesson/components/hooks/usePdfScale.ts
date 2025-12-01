import { useState, useCallback, useMemo, useEffect, RefObject } from 'react'

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3]
const DEFAULT_ZOOM_INDEX = 2 // 1.0x

interface UsePdfScaleProps {
  isInFullscreenMode: boolean
  pageWidth: number | null
  pageHeight: number | null
  containerRef: RefObject<HTMLElement>
  isMobile: boolean
}

interface UsePdfScaleReturn {
  zoomIndex: number
  effectiveScale: number
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  canZoomIn: boolean
  canZoomOut: boolean
  zoomPercentage: number
}

/**
 * Custom hook for managing PDF zoom and auto-scaling
 * Fixes the zoom glitching loop by separating manual zoom from auto-scale
 * and using a stable, one-time calculation in fullscreen mode
 */
export const usePdfScale = ({
  isInFullscreenMode,
  pageWidth,
  pageHeight,
  containerRef,
  isMobile
}: UsePdfScaleProps): UsePdfScaleReturn => {
  // Manual zoom level (controlled by user)
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)

  // Auto-scale for fullscreen (calculated once, then locked)
  const [fullscreenAutoScale, setFullscreenAutoScale] = useState(1)
  const [isScaleCalculated, setIsScaleCalculated] = useState(false)

  // Calculate auto-scale when entering fullscreen - ONLY ONCE
  useEffect(() => {
    if (!isInFullscreenMode) {
      // Reset when exiting fullscreen
      setFullscreenAutoScale(1)
      setIsScaleCalculated(false)
      return
    }

    // Only calculate once per fullscreen session
    if (isScaleCalculated) {
      return
    }

    // Only calculate if we have dimensions
    if (!pageWidth || !pageHeight) {
      return
    }

    const container = containerRef.current
    if (!container) return

    // Calculate with a delay to ensure container is fully sized
    const delay = isMobile ? 300 : 200
    const timeoutId = setTimeout(() => {
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      if (containerWidth === 0 || containerHeight === 0) return

      const isLandscape = containerWidth > containerHeight

      // Dynamic padding based on orientation and device
      let paddingHorizontal: number
      let paddingVertical: number

      if (isMobile) {
        if (isLandscape) {
          // Landscape mobile: minimal padding, maximize space
          paddingHorizontal = 24
          paddingVertical = 60
        } else {
          // Portrait mobile: more padding for controls
          paddingHorizontal = 32
          paddingVertical = 140
        }
      } else {
        // Desktop: standard padding
        paddingHorizontal = 48
        paddingVertical = 100
      }

      const availableWidth = containerWidth - paddingHorizontal
      const availableHeight = containerHeight - paddingVertical

      const scaleWidth = availableWidth / pageWidth
      const scaleHeight = availableHeight / pageHeight

      // Adjust multiplier: less aggressive for mobile landscape
      const paddingMultiplier = isMobile && isLandscape ? 0.98 : 0.95

      const calculatedScale = Math.min(scaleWidth, scaleHeight) * paddingMultiplier

      setFullscreenAutoScale(calculatedScale)
      setIsScaleCalculated(true)
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [isInFullscreenMode, pageWidth, pageHeight, containerRef, isMobile, isScaleCalculated])

  // Separate effect: Reset scale calculation on orientation change
  useEffect(() => {
    if (!isInFullscreenMode) return

    const handleOrientationChange = () => {
      // Reset the calculated flag to trigger recalculation
      setIsScaleCalculated(false)
    }

    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [isInFullscreenMode])

  // Effective scale calculation - memoized to prevent recalculation loops
  const effectiveScale = useMemo(() => {
    if (isInFullscreenMode) {
      // In fullscreen: use ONLY auto-scale (manual zoom disabled)
      return fullscreenAutoScale
    } else {
      // Normal mode: use manual zoom level
      return ZOOM_LEVELS[zoomIndex]
    }
  }, [isInFullscreenMode, fullscreenAutoScale, zoomIndex])

  // Zoom controls (disabled in fullscreen)
  const zoomIn = useCallback(() => {
    if (!isInFullscreenMode) {
      setZoomIndex(prev => Math.min(prev + 1, ZOOM_LEVELS.length - 1))
    }
  }, [isInFullscreenMode])

  const zoomOut = useCallback(() => {
    if (!isInFullscreenMode) {
      setZoomIndex(prev => Math.max(prev - 1, 0))
    }
  }, [isInFullscreenMode])

  const resetZoom = useCallback(() => {
    if (!isInFullscreenMode) {
      setZoomIndex(DEFAULT_ZOOM_INDEX)
    }
  }, [isInFullscreenMode])

  // Computed values
  const canZoomIn = zoomIndex < ZOOM_LEVELS.length - 1 && !isInFullscreenMode
  const canZoomOut = zoomIndex > 0 && !isInFullscreenMode
  const zoomPercentage = Math.round(ZOOM_LEVELS[zoomIndex] * 100)

  return {
    zoomIndex,
    effectiveScale,
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn,
    canZoomOut,
    zoomPercentage
  }
}

export default usePdfScale
