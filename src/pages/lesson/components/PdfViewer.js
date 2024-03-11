import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import styles from './PdfViewer.module.css' // Import your CSS Module file
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { ArrowLeft, ArrowRight, Typography } from 'tabler-icons-react'
import { Icon, Button } from '@mui/material'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/'
}

const PdfViewer = ({ fileURL }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageVisible, setPageVisible] = useState(false)

  useEffect(() => {
    setPageVisible(false)

    const timer = setTimeout(() => {
      setPageNumber(pageNumber)
      setPageVisible(true)
    }, 300) // Adjust delay to match CSS transition duration

    return () => clearTimeout(timer)
  }, [pageNumber])

  function onDocumentLoadSuccess({ numPages }) {
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

  return (
    <div className={styles.pdfViewer}>
      <Document className={styles.document} file={fileURL} onLoadSuccess={onDocumentLoadSuccess} options={options}>
        <Page className={`${styles.page} ${pageVisible ? styles.pageVisible : ''}`} pageNumber={pageNumber} />
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
      </div>
    </div>
  )
}

export default PdfViewer
