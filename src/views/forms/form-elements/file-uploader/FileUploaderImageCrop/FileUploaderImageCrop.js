import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Icon from 'src/@core/components/icon'
import { useDropzone } from 'react-dropzone'
import CircularProgress from '@mui/material/CircularProgress'
import { useSelector } from 'react-redux'
import { selectTokens } from 'src/store/apps/user'
import apiClient from 'src/@core/axios/axiosEmentor'

const FileUploaderImageCrop = props => {
  const [files, setFiles] = useState([])
  let tokens = useSelector(selectTokens)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const uploadFile = async file => {
    setLoading(true)

    if (!tokens.accessToken) {
      setError('No user found')
      setLoading(false)

      return
    }
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient.post(props.uploadFile, formData, {
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })

      console.log('File uploaded successfully with id:', response.data)
      props.setValues(prevValues => ({
        ...prevValues,
        profilePicture: response.data
      }))
      setUploadSuccess(true)
      setError('') // Clear any previous errors
      setLoading(false)
    } catch (error) {
      console.error('Error uploading file', error)
      setError('Upload failed') // Set an error message if upload fails
      setLoading(false)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    onDrop: async acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file)))
      props.setOpenCrop(true)
      props.setFile(acceptedFiles[0])
      const path = require('path')
      props.setFileName(path.parse(acceptedFiles[0].name).name)
      props.setPhotoURL(URL.createObjectURL(acceptedFiles[0]))
    }
  })

  useEffect(() => {
    // Declare the callback function as async
    const uploadFileAsync = async () => {
      if (props.openCrop == false && props.file) {
        setUploadProgress(0)
        setUploadSuccess(false)
        URL.revokeObjectURL(files[0])
        URL.revokeObjectURL(props.file)
        setFiles([Object.assign(props.file)])
        await uploadFile(props.file)
      }
    }
    uploadFileAsync()
  }, [props.photoURL])

  useEffect(() => {
    if (props.file === null) {
      setFiles([])
      setUploadSuccess(false)
      setError(false)
      setUploadProgress(0)
    }
  }, [props.file])

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
      <input {...getInputProps()} />
      {error && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant='body1' sx={{ color: 'white', textAlign: 'center' }}>
            {error}
          </Typography>
        </div>
      )}

      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress color='inherit' />
        </div>
      )}

      {uploadSuccess && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 255, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon fontSize='4rem' icon='tabler:check' style={{ color: 'white' }} />
        </div>
      )}

      <LinearProgress
        variant='determinate'
        value={uploadProgress}
        sx={{ width: '100%', visibility: loading || uploadSuccess ? 'visible' : 'hidden' }}
      />

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
      {!files.length && (
        <Typography variant='h5' sx={{ pt: 8 }}>
          Trage fișierul aici sau click pentru upload.
        </Typography>
      )}
    </Box>
  )
}

export default FileUploaderImageCrop
