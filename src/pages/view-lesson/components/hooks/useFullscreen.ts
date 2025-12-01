import { useState, useEffect, useCallback, RefObject } from 'react'

interface UseFullscreenReturn {
  isFullscreen: boolean
  isFallbackFullscreen: boolean
  isInFullscreenMode: boolean
  enterFullscreen: () => Promise<void>
  exitFullscreen: () => Promise<void>
  toggleFullscreen: () => void
}

/**
 * Custom hook for managing fullscreen state with cross-browser support and mobile fallback
 * Handles vendor prefixes and provides a CSS-based fallback for devices without fullscreen API
 * Includes orientation change handling to prevent stuck states
 */
export const useFullscreen = (elementRef: RefObject<HTMLElement>): UseFullscreenReturn => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false)

  // Combined fullscreen state (native or fallback)
  const isInFullscreenMode = isFullscreen || isFallbackFullscreen

  // Enter fullscreen with vendor prefix support
  const enterFullscreen = useCallback(async () => {
    const elem = elementRef.current
    if (!elem) return

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen()
      } else if ((elem as any).webkitRequestFullscreen) {
        // Safari/Chrome
        await (elem as any).webkitRequestFullscreen()
      } else if ((elem as any).webkitEnterFullscreen) {
        // iOS Safari (video element)
        await (elem as any).webkitEnterFullscreen()
      } else if ((elem as any).mozRequestFullScreen) {
        // Firefox
        await (elem as any).mozRequestFullScreen()
      } else if ((elem as any).msRequestFullscreen) {
        // IE/Edge
        await (elem as any).msRequestFullscreen()
      } else {
        // Fallback for devices that don't support fullscreen API (iOS Safari)
        setIsFallbackFullscreen(true)
        // Lock scroll on body
        document.body.style.overflow = 'hidden'
      }
    } catch (err) {
      console.error('Fullscreen request failed, using fallback:', err)
      // Use CSS-based fullscreen mode
      setIsFallbackFullscreen(true)
      document.body.style.overflow = 'hidden'
    }
  }, [elementRef])

  // Exit fullscreen with vendor prefix support
  const exitFullscreen = useCallback(async () => {
    // Exit fallback fullscreen if active
    if (isFallbackFullscreen) {
      setIsFallbackFullscreen(false)
      document.body.style.overflow = ''
      return
    }

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
    } catch (err) {
      console.error('Exit fullscreen failed:', err)
    }
  }, [isFallbackFullscreen])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (isInFullscreenMode) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }, [isInFullscreenMode, enterFullscreen, exitFullscreen])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement ||
        (document as any).webkitIsFullScreen
      )
      setIsFullscreen(isFullscreenNow)

      // Restore body overflow when exiting native fullscreen
      if (!isFullscreenNow) {
        document.body.style.overflow = ''
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // Handle orientation changes - trigger re-render to update dimensions
  useEffect(() => {
    const handleOrientationChange = () => {
      // Force a small delay to let the browser update viewport dimensions
      if (isFallbackFullscreen) {
        // Briefly toggle to force CSS recalculation
        const elem = elementRef.current
        if (elem) {
          elem.style.display = 'none'
          // Force reflow
          void elem.offsetHeight
          elem.style.display = ''
        }
      }
    }

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [isFallbackFullscreen, elementRef])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return {
    isFullscreen,
    isFallbackFullscreen,
    isInFullscreenMode,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen
  }
}

export default useFullscreen
