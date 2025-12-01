import { useState, useCallback, useRef } from 'react'

interface UseTouchGesturesProps {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  onTap?: () => void
  swipeThreshold?: number
  tapThreshold?: number
  enabled?: boolean
}

interface UseTouchGesturesReturn {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

/**
 * Custom hook for touch gesture detection
 * Detects swipe left/right gestures for page navigation
 * Ignores multi-finger gestures (pinch-zoom) to avoid conflicts
 * Supports tap detection for showing controls
 */
export const useTouchGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onTap,
  swipeThreshold = 50,
  tapThreshold = 10,
  enabled = true
}: UseTouchGesturesProps): UseTouchGesturesReturn => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchMoved, setTouchMoved] = useState(false)
  const isMultiTouchRef = useRef(false)
  const touchStartTimeRef = useRef<number>(0)

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return

      // Track if this is a multi-touch gesture (pinch-zoom)
      isMultiTouchRef.current = e.touches.length > 1

      // Only track single finger touches for swipe
      if (e.touches.length === 1) {
        setTouchStart({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        })
        setTouchMoved(false)
        touchStartTimeRef.current = Date.now()
      }
    },
    [enabled]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return

      // If multi-touch starts during the gesture, mark it
      if (e.touches.length > 1) {
        isMultiTouchRef.current = true
      }

      // Track if finger has moved significantly
      if (touchStart && e.touches.length === 1) {
        const moveX = Math.abs(e.touches[0].clientX - touchStart.x)
        const moveY = Math.abs(e.touches[0].clientY - touchStart.y)
        if (moveX > tapThreshold || moveY > tapThreshold) {
          setTouchMoved(true)
        }
      }
    },
    [enabled, touchStart, tapThreshold]
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || touchStart === null) return

      // Ignore if it was a multi-touch gesture (pinch-zoom)
      if (isMultiTouchRef.current) {
        isMultiTouchRef.current = false
        setTouchStart(null)
        setTouchMoved(false)
        return
      }

      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      }

      const diffX = touchStart.x - touchEnd.x
      const diffY = touchStart.y - touchEnd.y
      const touchDuration = Date.now() - touchStartTimeRef.current

      // Check if it's a tap (minimal movement and short duration)
      if (!touchMoved && Math.abs(diffX) < tapThreshold && Math.abs(diffY) < tapThreshold && touchDuration < 300) {
        onTap?.()
        setTouchStart(null)
        setTouchMoved(false)
        return
      }

      // Check if swipe threshold is met (horizontal swipe, not vertical scroll)
      if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          // Swiped left - next page
          onSwipeLeft()
        } else {
          // Swiped right - previous page
          onSwipeRight()
        }
      }

      setTouchStart(null)
      setTouchMoved(false)
    },
    [touchStart, touchMoved, swipeThreshold, tapThreshold, onSwipeLeft, onSwipeRight, onTap, enabled]
  )

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}

export default useTouchGestures
