import React, { useState, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import styles from './PdfViewer.module.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { ArrowLeft, ArrowRight, ArrowsMaximize, ArrowsMinimize } from 'tabler-icons-react'
import { Button } from '@mui/material'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/'
}

const PdfViewer = ({ fileURL }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageVisible, setPageVisible] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [scale, setScale] = useState(1)
  const [pageHeight, setPageHeight] = useState(null)
  const [pageWidth, setPageWidth] = useState(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    setPageVisible(false)

    const timer = setTimeout(() => {
      setPageNumber(pageNumber)
      setPageVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [pageNumber])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      setFullscreen(isFullscreenNow)
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

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (fullscreen) {
        for (let entry of entries) {
          const scaleWidth = entry.contentRect.width / pageWidth
          const scaleHeight = entry.contentRect.height / pageHeight

          // Choose the smaller scale to ensure both width and height fit into the screen
          const scale = Math.min(scaleWidth, scaleHeight)

          setScale(scale)
        }
      } else {
        setScale(1) // Reset to default when not in fullscreen
      }
    })

    resizeObserver.observe(viewerRef.current)

    return () => {
      if (viewerRef.current) {
        resizeObserver.unobserve(viewerRef.current)
      }
    }
  }, [fullscreen])

  function onDocumentLoadSuccess({ numPages, originalWidth, originalHeight }) {
    setPageHeight(originalHeight)
    setPageWidth(originalWidth)
    setNumPages(numPages)

    setPageNumber(1)
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset)
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  function toggleFullscreen() {
    if (fullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen()
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen()
      }
    } else {
      if (viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen()
      } else if (viewerRef.current.mozRequestFullScreen) {
        /* Firefox */
        viewerRef.current.mozRequestFullScreen()
      } else if (viewerRef.current.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        viewerRef.current.webkitRequestFullscreen()
      } else if (viewerRef.current.msRequestFullscreen) {
        /* IE/Edge */
        viewerRef.current.msRequestFullscreen()
      }
    }
  }

  return (
    <div className={`${styles.pdfViewer} ${fullscreen ? styles.fullscreen : ''}`} ref={viewerRef}>
      <Document className={styles.document} file={fileURL} onLoadSuccess={onDocumentLoadSuccess} options={options}>
        <Page
          scale={scale}
          className={`${styles.page} ${pageVisible ? styles.pageVisible : ''} ${fullscreen ? styles.fullscreenPage : ''
            }`}
          onLoadSuccess={({ width, height }) => {
            setPageWidth(width)
            setPageHeight(height)
          }}
          pageNumber={pageNumber}
        />
      </Document>

      <div className={styles.controls}>
        <Button
          variant='text'
          className={` ${pageNumber <= 1 ? styles.controlButtonDisabled : styles.controlButtonHover}`}
          disabled={pageNumber <= 1}
          onClick={previousPage}
        >
          <ArrowLeft size={15} />{' '}
        </Button>
        <p>
          Pag {pageNumber || (numPages ? 1 : '--')} <br></br> din {numPages || '--'}
        </p>
        <Button
          variant='text'
          className={` ${pageNumber >= numPages ? styles.controlButtonDisabled : styles.controlButtonHover}`}
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          <ArrowRight size={15} />{' '}
        </Button>
        {fullscreen ? (
          <Button variant='text' className={`${styles.fullscreenButton}`} onClick={toggleFullscreen}>
            <ArrowsMinimize size={15} />
          </Button>
        ) : (
          <Button variant='text' className={`${styles.fullscreenButton}`} onClick={toggleFullscreen}>
            <ArrowsMaximize size={15} />
          </Button>
        )}
      </div>
    </div>
  )
}

export default PdfViewer
