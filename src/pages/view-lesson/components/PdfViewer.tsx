import React, { useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import styles from './PdfViewer.module.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { ArrowLeft, ArrowRight, ArrowsMaximize, ArrowsMinimize, ZoomIn, ZoomOut, ZoomReset } from 'tabler-icons-react'
import { IconButton, Tooltip, CircularProgress, useMediaQuery, useTheme } from '@mui/material'
import LinearProgressWithLabel from './LiniarProgessWithLabel'

// Custom Hooks
import { useFullscreen } from './hooks/useFullscreen'
import { usePdfScale } from './hooks/usePdfScale'
import { usePdfNavigation } from './hooks/usePdfNavigation'
import { useKeyboardControls } from './hooks/useKeyboardControls'
import { useTouchGestures } from './hooks/useTouchGestures'
import { useControlsVisibility } from './hooks/useControlsVisibility'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/'
}

interface PdfViewerProps {
  fileURL: string
}

/**
 * Professional PDF Viewer Component
 * Refactored following DRY and SOLID principles
 * Features: Smooth transitions, fullscreen support, zoom controls, keyboard/touch navigation
 */
const PdfViewer: React.FC<PdfViewerProps> = ({ fileURL }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Refs
  const viewerRef = useRef<HTMLDivElement>(null)

  // PDF Document State
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Page Dimensions
  const [pageWidth, setPageWidth] = useState<number | null>(null)
  const [pageHeight, setPageHeight] = useState<number | null>(null)

  // ============================================================================
  // CUSTOM HOOKS (Separated Concerns)
  // ============================================================================

  // Fullscreen Management
  const { isInFullscreenMode, enterFullscreen, exitFullscreen, toggleFullscreen } = useFullscreen(viewerRef)

  // PDF Scaling & Zoom (Fixes Bug 1: Zoom Glitching)
  const { effectiveScale, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut, zoomPercentage } = usePdfScale({
    isInFullscreenMode,
    pageWidth,
    pageHeight,
    containerRef: viewerRef,
    isMobile
  })

  // Page Navigation & Transitions
  const {
    pageNumber,
    currentPage,
    nextPageNumber,
    isTransitioning,
    transitionDirection,
    previousPage,
    nextPage,
    canGoPrevious,
    canGoNext
  } = usePdfNavigation({
    numPages,
    transitionDuration: 300
  })

  // Controls Visibility
  const { showControls, handleInteraction, toggleControls } = useControlsVisibility({
    autoHideDelay: 3000,
    isMobile,
    isFullscreen: isInFullscreenMode
  })

  // Touch Gestures - includes tap detection for mobile controls toggle
  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchGestures({
    onSwipeLeft: nextPage,
    onSwipeRight: previousPage,
    onTap: isMobile && isInFullscreenMode ? toggleControls : undefined,
    swipeThreshold: 50
  })

  // Keyboard Controls
  useKeyboardControls({
    onPreviousPage: previousPage,
    onNextPage: nextPage,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onResetZoom: resetZoom,
    onToggleFullscreen: toggleFullscreen,
    onExitFullscreen: exitFullscreen,
    isInFullscreenMode
  })

  // ============================================================================
  // PDF DOCUMENT HANDLERS
  // ============================================================================

  function onDocumentLoadSuccess({ numPages: pages }: { numPages: number }) {
    setNumPages(pages)
    setIsLoading(false)
    setError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error)
    setError('Failed to load PDF document')
    setIsLoading(false)
  }

  function onDocumentLoadProgress({ loaded, total }: { loaded: number; total: number }) {
    setLoadingProgress((loaded / total) * 100)
  }

  function onPageLoadSuccess({ width, height }: { width: number; height: number }) {
    // Only set dimensions on first load or if they changed significantly
    if (!pageWidth || !pageHeight || Math.abs(width - pageWidth) > 1) {
      setPageWidth(width)
      setPageHeight(height)
    }
  }

  // Combined interaction handler
  const handleUserInteraction = () => {
    handleInteraction()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={`${styles.pdfViewer} ${isInFullscreenMode ? styles.fullscreen : ''} ${isMobile ? styles.mobile : ''}`}
      ref={viewerRef}
      onMouseMove={handleUserInteraction}
      onTouchStart={e => {
        handleUserInteraction()
        onTouchStart(e)
      }}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingContainer}>
          <CircularProgress size={isMobile ? 40 : 60} />
          <LinearProgressWithLabel value={loadingProgress} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {/* PDF Document - Only render page when dimensions are known (Fixes Bug 3) */}
      {!error && (
        <Document
          className={styles.document}
          file={fileURL}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onLoadProgress={onDocumentLoadProgress}
          options={options}
          loading={null}
        >
          <div className={styles.pageContainer}>
            {/* Only render one page - use pageNumber directly */}
            <div key={pageNumber} className={styles.pageWrapper}>
              <Page
                scale={effectiveScale}
                className={styles.page}
                onLoadSuccess={onPageLoadSuccess}
                pageNumber={pageNumber}
                loading={
                  <div className={styles.pageSkeleton}>
                    <CircularProgress size={40} />
                  </div>
                }
              />
            </div>
          </div>
        </Document>
      )}

      {/* Controls */}
      <div
        className={`${styles.controls} ${
          showControls || (isMobile && !isInFullscreenMode) ? styles.controlsVisible : ''
        } ${isMobile ? styles.controlsMobile : ''}`}
      >
        {/* Navigation Controls */}
        <div className={styles.navigationControls}>
          <Tooltip title='Previous (← or ↑)' placement='top'>
            <span>
              <IconButton
                onClick={previousPage}
                disabled={!canGoPrevious}
                className={styles.controlButton}
                size={isMobile ? 'large' : 'medium'}
              >
                <ArrowLeft size={isMobile ? 24 : 20} />
              </IconButton>
            </span>
          </Tooltip>

          <div className={styles.pageInfo}>
            <span className={styles.pageNumber}>{pageNumber || '--'}</span>
            <span className={styles.pageSeparator}>/</span>
            <span className={styles.totalPages}>{numPages || '--'}</span>
          </div>

          <Tooltip title='Next (→ or ↓)' placement='top'>
            <span>
              <IconButton
                onClick={nextPage}
                disabled={!canGoNext}
                className={styles.controlButton}
                size={isMobile ? 'large' : 'medium'}
              >
                <ArrowRight size={isMobile ? 24 : 20} />
              </IconButton>
            </span>
          </Tooltip>
        </div>

        {/* Zoom Controls - Hidden in fullscreen (auto-scale handles it) */}
        {!isInFullscreenMode && (
          <div className={styles.zoomControls}>
            <Tooltip title='Zoom Out (-)' placement='top'>
              <span>
                <IconButton
                  onClick={zoomOut}
                  disabled={!canZoomOut}
                  className={styles.controlButton}
                  size={isMobile ? 'large' : 'small'}
                >
                  <ZoomOut size={isMobile ? 20 : 16} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title='Reset Zoom (0)' placement='top'>
              <span>
                <IconButton onClick={resetZoom} className={styles.controlButton} size={isMobile ? 'large' : 'small'}>
                  <ZoomReset size={isMobile ? 20 : 16} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title='Zoom In (+)' placement='top'>
              <span>
                <IconButton
                  onClick={zoomIn}
                  disabled={!canZoomIn}
                  className={styles.controlButton}
                  size={isMobile ? 'large' : 'small'}
                >
                  <ZoomIn size={isMobile ? 20 : 16} />
                </IconButton>
              </span>
            </Tooltip>

            <span className={styles.zoomLevel}>{zoomPercentage}%</span>
          </div>
        )}

        {/* Fullscreen Toggle - Always show with fallback support */}
        <Tooltip title={isInFullscreenMode ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F)'} placement='top'>
          <IconButton
            onClick={toggleFullscreen}
            className={`${styles.controlButton} ${styles.fullscreenButton}`}
            size={isMobile ? 'large' : 'medium'}
          >
            {isInFullscreenMode ? (
              <ArrowsMinimize size={isMobile ? 24 : 20} />
            ) : (
              <ArrowsMaximize size={isMobile ? 24 : 20} />
            )}
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )
}

export default PdfViewer
