import { useEffect, useState } from 'react'
import { pdfjs } from 'react-pdf'
import TabPanel from '@mui/lab/TabPanel'

import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from 'src/apiSpec'
import PdfViewer, { PdfViewerPlaceholder } from './PdfViewer'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`

/**
 * One file of a lesson, downloaded and shown in the shared PDF viewer. The
 * professor and the student see the same viewer; `viewerProps` carries what
 * only the student's page needs (page tracking, resume, the reading overlay).
 */
const LessonFileTab = ({ file, index, viewerProps, viewerKey }) => {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [fileURL, setFileURL] = useState(null)

  useEffect(() => {
    let objectUrl = null
    let active = true

    //TODO continue prevent file preview logic if not pdf
    apiClient
      .get(apiSpec.LESSON_SERVICE + `/host-file/download/${file.fileId}`, {
        headers: {
          Accept: '*/*'
        },
        onDownloadProgress: progressEvent => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          setLoadingProgress(progress)
        },
        responseType: 'blob'
      })
      .then(response => {
        if (!active) return
        objectUrl = URL.createObjectURL(response.data)
        setFileURL(objectUrl)
      })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file.fileId])

  return (
    <TabPanel key={index} value={file.fileId} sx={{ px: 0 }}>
      {/* The download shows inside the viewer's own frame, so nothing jumps when the page opens.
          A new viewerKey reopens the document, e.g. on the first page instead of the saved one. */}
      {fileURL == null ? (
        <PdfViewerPlaceholder progress={loadingProgress} />
      ) : (
        <PdfViewer key={viewerKey} fileURL={fileURL} {...viewerProps} />
      )}
    </TabPanel>
  )
}

export default LessonFileTab
