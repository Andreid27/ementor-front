import { useEffect, useState } from 'react'
import FileUploaderImageCrop from './FileUploaderImageCrop/FileUploaderImageCrop'
import * as apiSpec from '../../../../apiSpec'
import { Cancel } from '@mui/icons-material'
import CropIcon from '@mui/icons-material/Crop'

const {
  Modal,
  Fade,
  Card,
  CardHeader,
  CardContent,
  Box,
  DialogContent,
  DialogActions,
  Typography,
  Slider,
  Button,
  CircularProgress
} = require('@mui/material')
const { default: CropEasy } = require('./FileUploaderImageCrop/CropComponent/CropEasy')

const ModalFileUploaderImageCrop = ({
  openFileUpload,
  setOpenFileUpload,
  profilePictureId,
  setProfilePictureId,
  setImgSrc
}) => {
  const [file, setFile] = useState()
  const [fileName, setFileName] = useState('')
  const [photoURL, setPhotoURL] = useState()
  const [openCrop, setOpenCrop] = useState(false)
  const [imageValidationError, setImageValidationError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (photoURL !== undefined) {
      setImgSrc(photoURL)
    }
  }, [photoURL])

  const currentElement = () => {
    if (openCrop) {
      return <CropEasy {...{ photoURL, setOpenCrop, setPhotoURL, setFile, fileName }} />
    } else {
      return (
        <Box
          sx={{
            background: '#fff',
            padding: '1.5rem'
          }}
        >
          <Card className={'bro'} sx={{ width: 500, height: 400 }}>
            <CardHeader title={'Încarcă fotografia ta aici'} />
            <FileUploaderImageCrop
              uploadFile={apiSpec.PROFILE_SERVICE + '-image/upload'}
              setFile={setFile}
              setOpenCrop={setOpenCrop}
              setPhotoURL={setPhotoURL}
              setFileName={setFileName}
              file={file}
              openCrop={openCrop}
              photoURL={photoURL}
              fileName={fileName}
              setValues={setProfilePictureId}
            />
          </Card>
          <DialogActions sx={{ flexDirection: 'column', alignItems: 'flex-end', mx: 3, my: 2 }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              {/* Change button text based on loading state */}
              <Button
                variant='contained'
                onClick={() => {
                  setOpenFileUpload(false)
                }}
                disabled={loading}
              >
                {loading ? 'Processing' : 'Done'}
              </Button>
            </Box>
          </DialogActions>
        </Box>
      )
    }
  }

  return (
    <Modal
      open={openFileUpload}
      onClose={() => setOpenCrop(false)}
      closeAfterTransition
      style={{
        overlay: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        },
        content: {
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          padding: '20px',
          border: '1px solid #ccc',
          background: '#fff'
        }
      }}
    >
      <Fade in={openFileUpload}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          {currentElement()}
        </div>
      </Fade>
    </Modal>
  )
}

export default ModalFileUploaderImageCrop
