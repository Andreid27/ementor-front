import { useState, useCallback } from 'react'

interface UsePdfNavigationProps {
  numPages: number | null
  transitionDuration?: number
}

interface UsePdfNavigationReturn {
  pageNumber: number
  currentPage: number
  nextPageNumber: number | null
  isTransitioning: boolean
  transitionDirection: 'forward' | 'backward'
  previousPage: () => void
  nextPage: () => void
  goToPage: (page: number) => void
  canGoPrevious: boolean
  canGoNext: boolean
}

/**
 * Custom hook for managing PDF page navigation with smooth transitions
 * Simplified to prevent double-render issues
 */
export const usePdfNavigation = ({
  numPages,
  transitionDuration = 300
}: UsePdfNavigationProps): UsePdfNavigationReturn => {
  const [pageNumber, setPageNumber] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')

  // Navigate to a specific page with direction
  const navigateToPage = useCallback(
    (newPage: number, direction: 'forward' | 'backward') => {
      // Prevent navigation if already transitioning or invalid page
      if (isTransitioning) return
      if (newPage === pageNumber) return
      if (!numPages || newPage < 1 || newPage > numPages) return

      setTransitionDirection(direction)
      setIsTransitioning(true)
      setPageNumber(newPage)

      // Reset transitioning state after animation completes
      setTimeout(() => {
        setIsTransitioning(false)
      }, transitionDuration)
    },
    [pageNumber, isTransitioning, numPages, transitionDuration]
  )

  // Navigate to previous page
  const previousPage = useCallback(() => {
    navigateToPage(pageNumber - 1, 'backward')
  }, [pageNumber, navigateToPage])

  // Navigate to next page
  const nextPage = useCallback(() => {
    navigateToPage(pageNumber + 1, 'forward')
  }, [pageNumber, navigateToPage])

  // Go to specific page (determines direction automatically)
  const goToPage = useCallback(
    (page: number) => {
      const direction = page > pageNumber ? 'forward' : 'backward'
      navigateToPage(page, direction)
    },
    [pageNumber, navigateToPage]
  )

  // Computed navigation availability
  const canGoPrevious = pageNumber > 1
  const canGoNext = numPages ? pageNumber < numPages : false

  return {
    pageNumber,
    currentPage: pageNumber, // Keep for backwards compatibility
    nextPageNumber: null, // No longer used
    isTransitioning,
    transitionDirection,
    previousPage,
    nextPage,
    goToPage,
    canGoPrevious,
    canGoNext
  }
}

export default usePdfNavigation
