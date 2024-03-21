import { useEffect, useState } from 'react'
import { pdfjs } from 'react-pdf'

const { TabPanel } = require('@mui/lab')
const { Box } = require('tabler-icons-react')
const { default: LinearProgressWithLabel } = require('./LiniarProgessWithLabel')

import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { Document, Page } from 'react-pdf'
import PdfViewer from './PdfViewer'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`

const FileTab = ({ file, index }) => {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fileContent, setFileContent] = useState(null)
  const [fileURL, setFileURL] = useState(null)

  useEffect(() => {
    //TODO continue prevent file preview logic if not pdf
    //TODO remove file type from file name
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
        setFileContent(response.data)
        console.log('File Content:', response.data)
        setFileURL(URL.createObjectURL(response.data))
        console.log('File URL:', fileURL)
        setLoading(false)
      })

    const cleanup = () => {
      URL.revokeObjectURL(fileContent)
      setFileContent(null)
    }

    window.addEventListener('beforeunload', cleanup)

    return () => {
      cleanup()
      window.removeEventListener('beforeunload', cleanup)
    }
  }, [])

  return loading && fileURL == null ? (
    <TabPanel key={index} value={file.fileId}>
      <LinearProgressWithLabel value={loadingProgress} />
    </TabPanel>
  ) : (
    <TabPanel key={index} value={file.fileId}>
      <PdfViewer fileURL={fileURL} />
    </TabPanel>
  )
}

export default FileTab
