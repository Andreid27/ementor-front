import { Cancel } from '@mui/icons-material'
import CropIcon from '@mui/icons-material/Crop'
import { Box, Button, CircularProgress, DialogActions, DialogContent, Fade, Slider, Typography } from '@mui/material'
import React, { useState } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from './utils/cropImage'

const CropEasy = ({ photoURL, setOpenCrop, setPhotoURL, setFile, fileName }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [loading, setLoading] = useState(false)

  const cropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const cropImage = async () => {
    setLoading(true)
    try {
      const { file, url } = await getCroppedImg(photoURL, fileName, croppedAreaPixels, rotation)
      setPhotoURL(url)
      setFile(file)
      setOpenCrop(false)
    } catch (error) {
      console.log(error)
    }

    setLoading(false)
  }

  return (
    <>
      <Box
        sx={{
          background: '#fff',
          padding: '1.5rem'
        }}
      >
        <DialogContent
          dividers
          sx={{
            background: '#C0C0C0',
            position: 'relative',
            height: 400,
            width: 'auto',
            minWidth: { sm: 500 }
          }}
        >
          <Cropper
            image={photoURL}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropChange={setCrop}
            onCropComplete={cropComplete}
          />
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', mx: 3, my: 2 }}>
          <Box sx={{ width: '100%', mb: 1 }}>
            <Box>
              <Typography>Zoom: {zoomPercent(zoom)}</Typography>
              <Slider
                valueLabelDisplay='auto'
                valueLabelFormat={zoomPercent}
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e, zoom) => setZoom(zoom)}
              />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            <Button
              variant='outlined'
              startIcon={<Cancel />}
              onClick={() => {
                setOpenCrop(false)
                setFile(null)
              }}
            >
              Cancel
            </Button>
            {/* Change button text based on loading state */}
            <Button
              variant='contained'
              startIcon={loading ? <CircularProgress size={24} /> : <CropIcon />}
              onClick={cropImage}
              disabled={loading}
            >
              {loading ? 'Processing' : 'Crop'}
            </Button>
          </Box>
        </DialogActions>
      </Box>
    </>
  )
}

export default CropEasy

const zoomPercent = value => {
  return `${Math.round(value * 100)}%`
}
