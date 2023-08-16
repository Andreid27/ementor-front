import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import { useDropzone } from 'react-dropzone'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios' // Import axios

const FileUploaderSingle = props => {
  const [files, setFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadFile = async file => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(props.uploadFile, formData, {
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
      {uploadProgress > 0 && (
        <div
          style={{
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
          <CircularProgress variant='determinate' value={uploadProgress} />
        </div>
      )}
      <input {...getInputProps()} />
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
