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
import DatePicker, { registerLocale } from 'react-datepicker'
import { Controller } from 'react-hook-form'
import ro from 'date-fns/locale/ro'

// Register Romanian locale for DatePicker
registerLocale('ro', ro)

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Types
import { PickersComponentProps } from '../types'
import { EditingScope } from '../utils/eventTypeUtils'

interface EventFormFieldsProps {
  values: any
  setValues: any
  control: any
  errors: any
  isReadOnly: boolean
  editingScope?: EditingScope
}

const EventFormFields: React.FC<EventFormFieldsProps> = ({
  values,
  setValues,
  control,
  errors,
  isReadOnly,
  editingScope
}) => {
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
                // Only make title read-only for specific API limitations, not for UI editing scope
                const isTitleReadOnly = isReadOnly

                return (
                  <TextField
                    fullWidth
                    label='Titlu Eveniment'
                    value={value}
                    onChange={onChange}
                    placeholder='Introdu titlul evenimentului'
                    error={Boolean(errors.title)}
                    InputProps={{
                      readOnly: isTitleReadOnly,
                      startAdornment: (
                        <InputAdornment position='start'>
                          <TitleIcon fontSize='small' color='action' />
                        </InputAdornment>
                      )
                    }}
                    {...(errors.title && { helperText: 'Acest câmp este obligatoriu' })}
                    size='small'
                  />
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            {(() => {
              const TextField = CustomTextField as any
              // Only make description read-only for actual read-only mode, not for editing scope
              const isDescriptionReadOnly = isReadOnly

              return (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label='Descriere (Opțional)'
                  value={values.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValues({ ...values, description: e.target.value })
                  }
                  placeholder='Adaugă detalii sau agenda evenimentului'
                  InputProps={{
                    readOnly: isDescriptionReadOnly,
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
        <Grid container spacing={2} alignItems='flex-start'>
          {/* Start Date & Time */}
          <Grid item xs={12} sm={6}>
            {editingScope === 'occurrence' && (
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                Reprogramarea acestei apariții individuale (seria originală rămâne neschimbată)
              </Typography>
            )}
            {editingScope === 'series' && (
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                Data de început nu poate fi modificată când editezi întreaga serie
              </Typography>
            )}
            <DatePicker
              selected={values.startDate}
              showTimeSelect={!values.allDay}
              timeFormat='HH:mm'
              timeIntervals={15}
              dateFormat={values.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm'}
              onChange={handleStartDate}
              placeholderText={values.allDay ? 'Data de început' : 'Data și ora de început'}
              locale='ro'
              customInput={
                <PickersComponent
                  label={editingScope === 'occurrence' ? 'Nouă Dată și Oră de Început' : 'Data și Ora de Început'}
                />
              }
              disabled={isReadOnly || editingScope === 'series'}
            />
          </Grid>

          {/* End Date (only for non-recurring) OR Duration (for recurring) */}
          {!values.isRecurring ? (
            <Grid item xs={12} sm={4}>
              <DatePicker
                selected={values.endDate}
                showTimeSelect={!values.allDay}
                timeFormat='HH:mm'
                timeIntervals={15}
                dateFormat={values.allDay ? 'dd/MM/yyyy' : 'dd/MM/yyyy HH:mm'}
                onChange={(date: Date) => setValues({ ...values, endDate: new Date(date) })}
                placeholderText={values.allDay ? 'Data de sfârșit' : 'Data și ora de sfârșit'}
                locale='ro'
                customInput={<PickersComponent label='Data și Ora de Sfârșit' />}
                disabled={isReadOnly}
              />
            </Grid>
          ) : (
            <Grid item xs={12} sm={4}>
              {editingScope === 'occurrence' && (
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                  Ajustează durata doar pentru această apariție
                </Typography>
              )}
              {editingScope === 'series' && (
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                  Setează durata implicită pentru toate evenimentele din serie
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', marginTop: '1.05rem', gap: 1 }}>
                {(() => {
                  const TextField = CustomTextField as any

                  return (
                    <>
                      <TextField
                        type='number'
                        label='Ore'
                        value={values.durationHours || ''}
                        onChange={handleDurationChange('durationHours')}
                        InputProps={{
                          readOnly: isReadOnly,
                          inputProps: { min: 0, max: 23 }
                        }}
                        size='small'
                        placeholder='0'
                        sx={{ flex: 1, minWidth: '80px' }}
                      />
                      <TextField
                        type='number'
                        label='minute'
                        value={values.durationMinutes || ''}
                        onChange={handleDurationChange('durationMinutes')}
                        InputProps={{
                          readOnly: isReadOnly,
                          inputProps: { min: 0, max: 59 }
                        }}
                        size='small'
                        placeholder='0'
                        sx={{ flex: 1, minWidth: '80px' }}
                      />
                    </>
                  )
                })()}
              </Box>
            </Grid>
          )}

          {/* All Day Toggle */}
          <Grid item xs={12} sm={2}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '43px',
                  marginTop: '2.75rem',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: values.allDay ? 'primary.50' : 'background.paper',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <FormControlLabel
                  label={
                    <Typography variant='body2' sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      Toată Ziua
                    </Typography>
                  }
                  control={
                    <Switch
                      checked={values.allDay}
                      onChange={e => setValues({ ...values, allDay: e.target.checked })}
                      disabled={isReadOnly}
                      size='small'
                      color='primary'
                    />
                  }
                  sx={{ m: 0 }}
                />
              </Box>
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
                  label='Link Întâlnire (Opțional)'
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
                  label='Preț (RON)'
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
