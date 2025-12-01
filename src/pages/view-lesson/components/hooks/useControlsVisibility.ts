import { useState, useCallback, useRef, useEffect } from 'react'

interface UseControlsVisibilityProps {
  autoHideDelay?: number
  isMobile: boolean
  isFullscreen?: boolean
  enabled?: boolean
}

interface UseControlsVisibilityReturn {
  showControls: boolean
  handleInteraction: () => void
  toggleControls: () => void
  setShowControls: (show: boolean) => void
}

/**
 * Custom hook for managing control visibility with auto-hide functionality
 * Controls auto-hide on desktop after inactivity
 * On mobile fullscreen: controls can be toggled with a tap
 * On mobile non-fullscreen: controls are always visible
 */
export const useControlsVisibility = ({
  autoHideDelay = 3000,
  isMobile,
  isFullscreen = false,
  enabled = true
}: UseControlsVisibilityProps): UseControlsVisibilityReturn => {
  const [showControls, setShowControls] = useState(true)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timer helper
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  // Start auto-hide timer
  const startHideTimer = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false)
    }, autoHideDelay)
  }, [autoHideDelay, clearHideTimer])

  // Handle user interaction - show controls and reset timer
  const handleInteraction = useCallback(() => {
    if (!enabled) return

    clearHideTimer()
    setShowControls(true)

    // Auto-hide on desktop, or on mobile fullscreen
    if (!isMobile || (isMobile && isFullscreen)) {
      startHideTimer()
    }
  }, [isMobile, isFullscreen, enabled, clearHideTimer, startHideTimer])

  // Toggle controls visibility (for mobile tap)
  const toggleControls = useCallback(() => {
    if (!enabled) return

    clearHideTimer()

    setShowControls(prev => {
      const newState = !prev
      // If showing controls in fullscreen, start auto-hide timer
      if (newState && isMobile && isFullscreen) {
        startHideTimer()
      }
      return newState
    })
  }, [enabled, isMobile, isFullscreen, clearHideTimer, startHideTimer])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearHideTimer()
    }
  }, [clearHideTimer])

  // Handle visibility based on mode changes
  useEffect(() => {
    if (isMobile && !isFullscreen) {
      // Mobile non-fullscreen: always show controls
      setShowControls(true)
      clearHideTimer()
    } else if (isMobile && isFullscreen) {
      // Mobile fullscreen: show initially then auto-hide
      setShowControls(true)
      startHideTimer()
    }
  }, [isMobile, isFullscreen, clearHideTimer, startHideTimer])

  return {
    showControls,
    handleInteraction,
    toggleControls,
    setShowControls
  }
}

export default useControlsVisibility
