import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Icon from 'src/@core/components/icon'
import { useDropzone } from 'react-dropzone'

const FileUploaderSingle = () => {
  const [files, setFiles] = useState([])

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file)))
    }
  })

  const img = files.map(file => (
    <img
      key={file.name}
      alt={file.name}
      className='single-file-image'
      src={URL.createObjectURL(file)}
      style={{ objectFit: 'contain', width: '100%', height: '100%' }}
    />
  ))

  return (
    <Box
      {...getRootProps({ className: 'dropzone' })}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <input {...getInputProps()} />
      {files.length ? (
        img
      ) : (
        <Box
          sx={{
            width: 200, // Set a fixed width
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
