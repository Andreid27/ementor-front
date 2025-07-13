// ** React Imports
import React, { forwardRef } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'

// ** Icon Imports
import TitleIcon from '@mui/icons-material/Title'
import DescriptionIcon from '@mui/icons-material/Description'
import LinkIcon from '@mui/icons-material/Link'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { Controller } from 'react-hook-form'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types
import { PickersComponentProps } from '../types'

interface EventFormFieldsProps {
  values: any
  setValues: any
  control: any
  errors: any
  isReadOnly: boolean
}

const EventFormFields: React.FC<EventFormFieldsProps> = ({ values, setValues, control, errors, isReadOnly }) => {
  const PickersComponent = forwardRef<HTMLInputElement, PickersComponentProps>(({ ...props }, ref) => {
    const TextField = CustomTextField as any

    return <TextField inputRef={ref} fullWidth {...props} sx={{ width: '100%' }} />
  })

  PickersComponent.displayName = 'PickersComponent'

  const handleStartDate = (date: Date) => {
    if (!values.isRecurring && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    } else {
      setValues({ ...values, startDate: new Date(date) })
    }
  }

  const handleDurationChange =
    (field: 'durationHours' | 'durationMinutes') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 0
      setValues({ ...values, [field]: value })
    }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Basic Event Information - Compact Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Title and Description */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name='title'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => {
                const TextField = CustomTextField as any

                return (
                  <TextField
                    fullWidth
                    label='Event Title'
                    value={value}
                    onChange={onChange}
                    placeholder='Enter event title'
                    error={Boolean(errors.title)}
                    InputProps={{
                      readOnly: isReadOnly,
                      startAdornment: (
                        <InputAdornment position='start'>
                          <TitleIcon fontSize='small' color='action' />
                        </InputAdornment>
                      )
                    }}
                    {...(errors.title && { helperText: 'This field is required' })}
                    size='small'
                  />
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            {(() => {
              const TextField = CustomTextField as any

              return (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Description (Optional)'
                  value={values.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValues({ ...values, description: e.target.value })
                  }
                  placeholder='Add event details or agenda'
                  InputProps={{
                    readOnly: isReadOnly,
                    startAdornment: (
                      <InputAdornment position='start' sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                        <DescriptionIcon fontSize='small' color='action' />
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              )
            })()}
          </Grid>
        </Grid>

        <Divider />

        {/* Date, Time & Duration Row */}
        <Grid container spacing={2} alignItems='center'>
          {/* Start Date & Time */}
          <Grid item xs={12} sm={values.isRecurring ? 6 : 5}>
            <DatePicker
              selected={values.startDate}
              showTimeSelect
              timeFormat='HH:mm'
              timeIntervals={15}
              dateFormat='MM/dd/yyyy h:mm aa'
              onChange={handleStartDate}
              placeholderText='Start date & time'
              customInput={<PickersComponent label='Start Date & Time' />}
              disabled={isReadOnly}
            />
          </Grid>

          {/* End Date (only for non-recurring) OR Duration (for recurring) */}
          {!values.isRecurring ? (
            <Grid item xs={12} sm={5}>
              <DatePicker
                selected={values.endDate}
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={15}
                dateFormat='MM/dd/yyyy h:mm aa'
                onChange={(date: Date) => setValues({ ...values, endDate: new Date(date) })}
                placeholderText='End date & time'
                customInput={<PickersComponent label='End Date & Time' />}
                disabled={isReadOnly}
              />
            </Grid>
          ) : (
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(() => {
                  const TextField = CustomTextField as any

                  return (
                    <>
                      <TextField
                        type='number'
                        label='Hours'
                        value={values.durationHours || ''}
                        onChange={handleDurationChange('durationHours')}
                        InputProps={{
                          readOnly: isReadOnly,
                          inputProps: { min: 0, max: 23 }
                        }}
                        size='small'
                        placeholder='0'
                        sx={{ width: '70px' }}
                      />
                      <TextField
                        type='number'
                        label='Min'
                        value={values.durationMinutes || ''}
                        onChange={handleDurationChange('durationMinutes')}
                        InputProps={{
                          readOnly: isReadOnly,
                          inputProps: { min: 0, max: 59 }
                        }}
                        size='small'
                        placeholder='0'
                        sx={{ width: '70px' }}
                      />
                    </>
                  )
                })()}
              </Box>
            </Grid>
          )}

          {/* All Day Toggle */}
          <Grid item xs={12} sm={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40px',
                p: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: values.allDay ? 'primary.50' : 'transparent'
              }}
            >
              <FormControlLabel
                label={
                  <Typography variant='caption' sx={{ fontWeight: 500 }}>
                    All Day
                  </Typography>
                }
                control={
                  <Switch
                    checked={values.allDay}
                    onChange={e => setValues({ ...values, allDay: e.target.checked })}
                    disabled={isReadOnly}
                    size='small'
                  />
                }
                sx={{ m: 0 }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider />

        {/* Meeting Link and Price Row */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {(() => {
              const TextField = CustomTextField as any

              return (
                <TextField
                  fullWidth
                  label='Meeting Link (Optional)'
                  value={values.meetingLink}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValues({ ...values, meetingLink: e.target.value })
                  }
                  placeholder='https://meet.google.com/...'
                  InputProps={{
                    readOnly: isReadOnly,
                    startAdornment: (
                      <InputAdornment position='start'>
                        <LinkIcon fontSize='small' color='action' />
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              )
            })()}
          </Grid>

          <Grid item xs={12} md={4}>
            {(() => {
              const TextField = CustomTextField as any

              return (
                <TextField
                  fullWidth
                  type='number'
                  label='Price (RON)'
                  value={values.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValues({ ...values, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder='0'
                  InputProps={{
                    readOnly: isReadOnly,
                    startAdornment: (
                      <InputAdornment position='start'>
                        <AttachMoneyIcon fontSize='small' color='action' />
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              )
            })()}
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default React.memo(EventFormFields)
