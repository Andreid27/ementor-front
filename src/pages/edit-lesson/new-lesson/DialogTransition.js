// ** React Imports
import { forwardRef, Fragment, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Slide from '@mui/material/Slide'
import DialogContentText from '@mui/material/DialogContentText'
import { Typography } from '@mui/material'

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

const DialogTransition = ({ open, handleClose, handleConfirm }) => {
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      TransitionComponent={Transition}
      aria-labelledby='alert-dialog-slide-title'
      aria-describedby='alert-dialog-slide-description'
    >
      <DialogTitle id='alert-dialog-slide-title'>
        <Typography variant='h5' component='div' color='error'>
          <strong>Doriți resetați testul?</strong>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-slide-description'>
          Sunteți sigur că doriți să resetați testul? Vă rugăm să rețineți că, odată ce testul este resetat, nu veți mai
          putea să reveniți și tot conținutul acestui test va fi șters. Confirmați că doriți să resetați testul?
        </DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose}>Nu, revin la test</Button>
        <Button variant='contained' onClick={handleConfirm} color='error'>
          Da, șterge testul
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogTransition
