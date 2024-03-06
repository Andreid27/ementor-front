import React, { Fragment, useImperativeHandle, useState } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Icon from 'src/@core/components/icon'
import { useDropzone } from 'react-dropzone'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import LinearProgress from '@mui/material/LinearProgress'
import toast from 'react-hot-toast'

const FileUploaderMultiple = React.forwardRef((props, ref) => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const uploadFiles = () => {
    return new Promise(async (resolve, reject) => {
      const uploads = files.map(file => {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        return apiClient
          .post(`${apiSpec.LESSON_SERVICE}/host-file/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
              const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
              file.progress = progress
              setFiles([...files])
            }
          })
          .then(response => {
            if (response.status === 201) {
              file.fileId = response.data
              setFiles([...files])
            }
          })
      })

      try {
        await Promise.all(uploads).then(() => {
          toast.success('Fișierele au fost încărcate cu succes!')
          console.log('Sent resolve' + files)
          resolve(files)
        })
      } catch (error) {
        // Handle errors
        toast.error('A apărut o eroare la încărcarea fișierelor')
        if (
          error &&
          error.response &&
          error.response.data &&
          error.response.data.exception === 'com.ementor.lessons.service.core.exceptions.EmentorApiError'
        ) {
          toast.error(`${error.response.data.message}: `, { duration: 10000 })
        } else setUploading(false)
        reject(error)
      }
    })
  }

  useImperativeHandle(ref, () => ({
    uploadFiles
  }))

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      const newFiles = acceptedFiles.map(file => {
        file.progress = 0

        return file
      })
      setFiles([...files, ...newFiles])
    }
  })

  const renderFilePreview = file => {
    if (file.type.startsWith('image')) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
    } else {
      return <Icon icon='tabler:file-description' />
    }
  }

  const handleRemoveFile = file => {
    const updatedFiles = files.filter(f => f !== file)
    setFiles(updatedFiles)
  }

  const fileList = files.map(file => (
    <ListItem key={file.name}>
      <div className='file-details'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name'>{file.name}</Typography>
          <Typography className='file-size' variant='body2'>
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
          </Typography>
        </div>
      </div>
      <LinearProgress variant='determinate' value={file.progress} sx={{ height: 10, width: '100%' }} />
      <Box sx={{ marginLeft: '3%', minWidth: 35 }}>
        {file.progress < 100 ? (
          <Typography variant='body2' color='text.secondary'>
            {Math.round(file.progress)}%
          </Typography>
        ) : file.fileId ? (
          <Icon icon='tabler:check' style={{ color: 'green' }} fontSize={20} />
        ) : (
          <Icon icon='tabler:circle-letter-x' style={{ color: 'red' }} fontSize={30} />
        )}
      </Box>
      <IconButton onClick={() => handleRemoveFile(file)}>
        {uploading && !file.fileId ? null : <Icon icon='tabler:x' fontSize={20} />}
      </IconButton>
    </ListItem>
  ))

  return (
    <Fragment>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Box
            sx={{
              mb: 8.75,
              width: 48,
              height: 48,
              display: 'flex',
              borderRadius: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.08)`
            }}
          >
            <Icon icon='tabler:upload' fontSize='1.75rem' />
          </Box>
          <Typography variant='h4' sx={{ mb: 2.5 }}>
            Trage fișierele aici sau click pentru încărcarea fișierelor.
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            (Pentru a încărca fișierele trebuie sa fie încărcate, fie prin drag and drop, fie prin click și selectarea
            lor. Aceste fișiere sunt încărcate în memoria browser-ului și nu sunt trimise pe server până la finalizarea
            lecție.)
          </Typography>
        </Box>
      </div>
      {files.length ? (
        <Fragment>
          <List>{fileList}</List>
        </Fragment>
      ) : null}
    </Fragment>
  )
})

export default FileUploaderMultiple
