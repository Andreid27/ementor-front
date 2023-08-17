import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useDropzone } from 'react-dropzone'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { selectTokens } from 'src/store/apps/user'
import LinearProgress from '@mui/material/LinearProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Icon } from '@mui/material'

const FileUploaderSingle = props => {
  const [files, setFiles] = useState([])
  const tokens = useSelector(selectTokens)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (uploadProgress === 100) {
      setTimeout(() => {
        setUploadSuccess(true)
      }, 500) // Add a small delay before showing the success animation
    }
  }, [uploadProgress])

  const uploadFile = async file => {
    if (!tokens.accessToken) {
      setError('No user found')

      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(props.uploadFile, formData, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })

      console.log('File uploaded successfully', response)
    } catch (error) {
      console.error('Error uploading file', error)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: async acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file)))
      setUploadProgress(0)
      setLoading(true)
      setUploadSuccess(false)

      // Simulate the upload delay
      await new Promise(resolve => setTimeout(resolve, 200))

      setLoading(false)

      await uploadFile(acceptedFiles[0])

      // After upload is completed, set uploadProgress back to 0
      setUploadProgress(0)
    }
  })

  return (
    <Box
      {...getRootProps({ className: 'dropzone' })}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
        position: 'relative'
      }}
    >
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {uploadSuccess && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CheckCircleIcon fontSize='large' sx={{ color: 'green', animation: 'pop 0.5s' }} />
        </Box>
      )}

      <LinearProgress variant='determinate' value={uploadProgress} sx={{ width: '100%' }} />

      {files.length ? (
        files.map(file => (
          <img
            key={file.name}
            alt={file.name}
            className='single-file-image'
            src={URL.createObjectURL(file)}
            style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          />
        ))
      ) : (
        <Box
          sx={{
            width: 200,
            p: 3,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.08)`
          }}
        >
          <Icon icon='tabler:upload' fontSize='1.75rem' />
        </Box>
      )}
      {files.length ? null : (
        <>
          <Typography variant='h5' sx={{ pt: 8 }}>
            Trage fișierul aici sau click pentru upload.
          </Typography>
        </>
      )}
    </Box>
  )
}

export default FileUploaderSingle
