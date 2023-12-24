// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import CustomChip from 'src/@core/components/mui/chip'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { Box, Grid, LinearProgress, MenuItem } from '@mui/material'
import DatePicker from 'react-datepicker'
import CustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput.js'
import { useTheme } from '@emotion/react'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import { LocalizationProvider } from '@mui/lab'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import toast from 'react-hot-toast'

const AssignationModal = props => {
  // ** State
  const [open, setOpen] = useState(false)
  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateTime, setDateTime] = useState(new Date())
  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  const ITEM_HEIGHT = 48
  const ITEM_PADDING_TOP = 8

  const MenuProps = {
    PaperProps: {
      style: {
        width: 250,
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
      }
    }
  }

  const handleChangeChapters = event => {
    setSelectedQuizzes(event.target.value)
  }

  useEffect(() => {
    apiClient
      .post(apiSpec.QUIZ_SERVICE + '/paginated', {
        filters: [],
        sorters: [],
        page: 0,
        pageSize: 10000
      })
      .then(response => {
        setQuizzes(response.data.data)
        setLoading(false)
      })
      .catch(error => {
        console.log(error)
      })
  }, [])

  const handleAssign = () => {
    //TODO reset content if succeded
    const assignments = []

    selectedQuizzes.forEach(quizId => {
      selectedUsers.forEach(userId => {
        assignments.push({
          quizId,
          userId,
          startAfter: dateTime.toISOString()
        })
      })
    })

    apiClient
      .post(apiSpec.QUIZ_SERVICE + '/assign', assignments)
      .then(response => {
        console.log(assignments)
        setSelectedQuizzes([])
        setSelectedUsers([])
        toast.success('Testele au fost asignate cu succes!')
        handleClose()
      })
      .catch(error => {
        console.log(error)
        toast.error(error.toISOString())
      })
  }

  return (
    <>
      {loading ? (
        <>
          <LinearProgress />
        </>
      ) : (
        <Fragment>
          <Button
            sx={{ margin: '2em', marginLeft: '1em', marginTop: '0em' }}
            variant='contained'
            size='large'
            onClick={handleClickOpen}
          >
            Asignează un test
          </Button>
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth='md'
            fullWidth
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
            aria-labelledby='form-dialog-title'
          >
            <DialogTitle id='form-dialog-title'>Asignează teste:</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ margin: '1em' }}>
                <Grid item xs={12} sm={11}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Teste:'
                    id='select-multiple-chip'
                    SelectProps={{
                      MenuProps,
                      multiple: true,
                      value: selectedQuizzes,
                      onChange: e => {
                        handleChangeChapters(e) // Your existing function to handle chip changes
                      },
                      renderValue: selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {selected.map(value => (
                            <CustomChip
                              key={value}
                              label={quizzes.find(quiz => quiz.id === value)?.title}
                              sx={{ m: 0.75 }}
                              color='primary'
                            />
                          ))}
                        </Box>
                      )
                    }}
                  >
                    {quizzes.map(quiz => (
                      <MenuItem key={quiz.id} value={quiz.id}>
                        {quiz.title}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={11}>
                  <CustomTextField
                    select
                    fullWidth
                    label='Studenți:'
                    id='select-multiple-chip'
                    SelectProps={{
                      MenuProps,
                      multiple: true,
                      value: selectedUsers,
                      onChange: e => {
                        setSelectedUsers(e.target.value) // Your existing function to handle chip changes
                      },
                      renderValue: selected => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                          {selected.map(value => (
                            <CustomChip
                              key={value}
                              label={(user => (user ? `${user.lastName} ${user.firstName}` : ''))(
                                props.users.find(user => user.id === value)
                              )}
                              sx={{ m: 0.75 }}
                              color='primary'
                            />
                          ))}
                        </Box>
                      )
                    }}
                  >
                    {props.users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.firstName + ' ' + user.lastName}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    showTimeSelect
                    timeFormat='HH:mm'
                    timeIntervals={15}
                    selected={dateTime}
                    id='date-time-picker'
                    dateFormat='dd/MM/yyyy hh:mm'
                    popperPlacement={popperPlacement}
                    onChange={date => setDateTime(date)}
                    customInput={<CustomInput label='Poate începe după:' />}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
              <Button onClick={handleClose} variant='outlined'>
                Cancel
              </Button>
              <Button onClick={handleAssign} variant='contained'>
                Asignează
              </Button>
            </DialogActions>
          </Dialog>
        </Fragment>
      )}
    </>
  )
}

export default AssignationModal
