// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'
import apiClient from 'src/@core/axios/axiosEmentor'
import * as apiSpec from '../../../apiSpec'
import { Box, Checkbox, Chip, FormControlLabel, Grid, LinearProgress, MenuItem } from '@mui/material'
import DatePicker from 'react-datepicker'
import CustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput.js'
import { useTheme } from '@emotion/react'
import toast from 'react-hot-toast'
import CustomAutocomplete from 'src/@core/components/mui/autocomplete'

const AssignationModal = props => {
  // ** State
  const [open, setOpen] = useState(false)
  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [quizzes, setQuizzes] = useState([])
  const [selectedLessons, setSelectedLessons] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateTime, setDateTime] = useState(new Date())
  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    apiClient
      .post(apiSpec.LESSON_SERVICE + '/lesson/paginated', {
        filters: [],
        sorters: [
          { key: 'creation', direction: 'DESC' },
          { key: 'title', direction: 'ASC' }
        ],
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

    selectedLessons.forEach(lesson => {
      selectedUsers.forEach(user => {
        assignments.push({
          lessonId: lesson.id,
          userId: user.id,
          startAfter: dateTime.toISOString(),
          isVisible: isVisible
        })
      })
    })

    apiClient
      .post(apiSpec.LESSON_SERVICE + '/lesson/assign', assignments)
      .then(response => {
        setSelectedLessons([])
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
          <Button sx={{ margin: '2em', marginLeft: '0em' }} variant='contained' size='large' onClick={handleClickOpen}>
            Asignează o lecție
          </Button>
          <Dialog
            open={open}
            onClose={handleClose}
            maxWidth='md'
            fullWidth
            sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
            aria-labelledby='form-dialog-title'
          >
            <DialogTitle id='form-dialog-title'>Asignează lecție</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={2} sx={{ margin: '1em', marginTop: '0' }}>
                  <Grid item xs={12} sm={11}>
                    <CustomAutocomplete
                      multiple
                      value={selectedLessons}
                      options={quizzes}
                      id='autocomplete-fixed-option'
                      getOptionLabel={option => option.title || ''}
                      renderInput={params => (
                        <CustomTextField {...params} label='Cursuri' placeholder='Selectează o lecție' />
                      )}
                      onChange={(event, newValue) => {
                        setSelectedLessons(newValue)
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.title}
                            {...getTagProps({ index })}
                            onDelete={() => {
                              const newValue = [...selectedLessons]
                              newValue.splice(index, 1)
                              setSelectedLessons(newValue)
                            }}
                            key={option.id}
                          />
                        ))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={11}>
                    <CustomAutocomplete
                      multiple
                      value={selectedUsers}
                      options={props.users}
                      id='autocomplete-fixed-option'
                      getOptionLabel={option => `${option.lastName} ${option.firstName}` || ''}
                      renderInput={params => (
                        <CustomTextField {...params} label='Studenți' placeholder='Selectează un student' />
                      )}
                      onChange={(event, newValue) => {
                        setSelectedUsers(newValue)
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={`${option.lastName} ${option.firstName}`}
                            {...getTagProps({ index })}
                            onDelete={() => {
                              const newValue = [...selectedUsers]
                              newValue.splice(index, 1)
                              setSelectedUsers(newValue)
                            }}
                            key={option.id}
                          />
                        ))
                      }
                    />
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
                  <Grid item xs={12} sm={3}>
                    <FormControlLabel
                      label='Este vizibilă?'
                      control={
                        <Checkbox
                          checked={isVisible}
                          onChange={event => {
                            setIsVisible(event.target.checked)
                          }}
                          name='controlled'
                        />
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
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
