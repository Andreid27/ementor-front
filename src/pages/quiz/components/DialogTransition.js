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

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />
})

const DialogTransition = ({ open, handleClose, handleConfirm, getUnasweredQuestions }) => {
  return (
    <Dialog
      open={open}
      keepMounted
      onClose={handleClose}
      TransitionComponent={Transition}
      aria-labelledby='alert-dialog-slide-title'
      aria-describedby='alert-dialog-slide-description'
    >
      <DialogTitle id='alert-dialog-slide-title'>Doriți să trimiteți testul?</DialogTitle>
      <DialogContent>
        <DialogContentText id='alert-dialog-slide-description'>
          {getUnasweredQuestions() > 0 && (
            <>
              <span style={{ fontWeight: 'bold', color: 'red' }}>
                !!!ATENȚIE!!!!
                <br />
                Aveți {getUnasweredQuestions()} întrebări fără răspuns.
              </span>
              <br />
              <br />
            </>
          )}
          Sunteți sigur că doriți să trimiteți testul? Vă rugăm să rețineți că, odată ce testul este trimis, nu veți mai
          putea să reveniți și să modificați răspunsurile. Confirmați că sunteți mulțumit de răspunsurile dumneavoastră
          și doriți să finalizați testul.
        </DialogContentText>
      </DialogContent>
      <DialogActions className='dialog-actions-dense'>
        <Button onClick={handleClose}>Nu, revin la test</Button>
        <Button variant='contained' onClick={handleConfirm}>
          Da, trimit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DialogTransition
