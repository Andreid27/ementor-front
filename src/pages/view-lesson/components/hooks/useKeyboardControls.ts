import { useEffect } from 'react'

interface KeyboardHandlers {
  onPreviousPage: () => void
  onNextPage: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onToggleFullscreen: () => void
  onExitFullscreen: () => void
}

interface UseKeyboardControlsProps extends KeyboardHandlers {
  isInFullscreenMode: boolean
  enabled?: boolean
}

/**
 * Custom hook for keyboard controls
 * Implements keyboard shortcuts for navigation, zoom, and fullscreen
 * Uses strategy pattern to accept handler functions
 */
export const useKeyboardControls = ({
  onPreviousPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  onExitFullscreen,
  isInFullscreenMode,
  enabled = true
}: UseKeyboardControlsProps): void => {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          onPreviousPage()
          break

        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          onNextPage()
          break

        case '+':
        case '=':
          // Zoom disabled in fullscreen mode (auto-scale handles it)
          if (!isInFullscreenMode) {
            e.preventDefault()
            onZoomIn()
          }
          break

        case '-':
        case '_':
          // Zoom disabled in fullscreen mode
          if (!isInFullscreenMode) {
            e.preventDefault()
            onZoomOut()
          }
          break

        case '0':
          // Zoom reset disabled in fullscreen mode
          if (!isInFullscreenMode) {
            e.preventDefault()
            onResetZoom()
          }
          break

        case 'Escape':
          if (isInFullscreenMode) {
            e.preventDefault()
            onExitFullscreen()
          }
          break

        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            onToggleFullscreen()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    onPreviousPage,
    onNextPage,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    onToggleFullscreen,
    onExitFullscreen,
    isInFullscreenMode,
    enabled
  ])
}

export default useKeyboardControls
