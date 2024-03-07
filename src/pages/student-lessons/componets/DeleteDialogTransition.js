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

const DeleteDialogTransition = ({ open, handleClose, handleConfirm, dialogOpenRow }) => {
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      aria-labelledby='alert-dialog-slide-title'
      aria-describedby='alert-dialog-slide-description'
    >
      <DialogTitle id='alert-dialog-slide-title'>
        <Typography variant='h5' component='div' color='error'>
          <strong>
            Ștegeți lecția "{dialogOpenRow.title}" lui{' '}
            {`${dialogOpenRow.student.lastName} ${dialogOpenRow.student.firstName}`}?
          </strong>
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-slide-description'>
          Sunteți sigur că doriți să ștegeți lecția? Vă rugăm să rețineți că, odată ce lecția este ștearsă, nu veți mai
          putea să reveniți. Confirmați că doriți să continuați?
        </DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose}>Nu, anulează</Button>
        <Button variant='contained' onClick={handleConfirm} color='error'>
          Da, șterge lecția
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteDialogTransition