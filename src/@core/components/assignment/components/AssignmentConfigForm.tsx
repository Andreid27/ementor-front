// ** React Imports
import React, { useEffect } from 'react'

// ** MUI Imports
import { Box, Grid, FormControlLabel, Checkbox, Typography, MenuItem, alpha } from '@mui/material'
import { styled } from '@mui/material/styles'

// ** Custom Component Imports
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import DatePicker from 'react-datepicker'
import { useTheme } from '@mui/material/styles'

// ** Custom Picker Component
import CustomInput from 'src/views/forms/form-elements/pickers/PickersCustomInput'

// ** Styled Date Picker
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Type Imports
import type { AssignmentConfigFormProps, AssignmentField } from '../GenericAssignmentModal.types'

// ========================================
// STYLED COMPONENTS
// ========================================

const StyledCheckboxLabel = styled(FormControlLabel)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: 0,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
    borderColor: theme.palette.primary.main
  },
  '& .MuiCheckbox-root': {
    marginRight: theme.spacing(2)
  }
}))

const FieldWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  '& .react-datepicker-wrapper': {
    width: '100%'
  }
}))

/**
 * AssignmentConfigForm - Dynamic form generator for assignment configuration
 *
 * Renders fields based on AssignmentConfig
 * Supports: datetime, boolean, text, number, select, custom
 */
const AssignmentConfigForm = ({ config, values, onChange, errors = {} }: AssignmentConfigFormProps) => {
  // ** Hooks
  const theme = useTheme()
  const { direction } = theme
  const popperPlacement = direction === 'ltr' ? 'bottom-start' : 'bottom-end'

  // Initialize values with defaults
  useEffect(() => {
    const defaultValues: Record<string, any> = {}
    config.fields.forEach(field => {
      if (field.defaultValue !== undefined && values[field.key] === undefined) {
        defaultValues[field.key] = field.defaultValue
      }
    })

    if (Object.keys(defaultValues).length > 0) {
      onChange({
        ...values,
        ...defaultValues
      })
    }
  }, [])

  // If no config, return null
  if (!config || config.fields.length === 0) {
    return null
  }

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Handle value change for a field
   */
  const handleChange = (key: string, value: any) => {
    onChange({
      ...values,
      [key]: value
    })
  }

  // ========================================
  // FIELD RENDERERS
  // ========================================

  /**
   * Render a datetime field
   */
  const renderDateTimeField = (field: AssignmentField) => {
    const value = values[field.key]
    const date = value ? (value instanceof Date ? value : new Date(value)) : null

    return (
      <DatePickerWrapper>
        <DatePicker
          {...({
            showTimeSelect: true,
            timeFormat: 'HH:mm',
            timeIntervals: 15,
            selected: date,
            id: `datetime-${field.key}`,
            dateFormat: 'dd/MM/yyyy HH:mm',
            popperPlacement: popperPlacement,
            onChange: (date: Date | null) => date && handleChange(field.key, date),
            customInput: (
              <CustomInput {...({ label: field.label, error: !!errors[field.key], fullWidth: true } as any)} />
            )
          } as any)}
        />
      </DatePickerWrapper>
    )
  }

  /**
   * Render a boolean field (checkbox)
   */
  const renderBooleanField = (field: AssignmentField) => {
    const value = values[field.key] !== undefined ? values[field.key] : false

    return (
      <StyledCheckboxLabel
        label={
          <Typography variant='body2' fontWeight={500}>
            {field.label}
          </Typography>
        }
        control={
          <Checkbox checked={value} onChange={e => handleChange(field.key, e.target.checked)} name={field.key} />
        }
      />
    )
  }

  /**
   * Render a text field
   */
  const renderTextField = (field: AssignmentField) => {
    const value = values[field.key] || ''

    return (
      <CustomTextField
        fullWidth
        label={field.label}
        value={value}
        onChange={e => handleChange(field.key, e.target.value)}
        error={!!errors[field.key]}
        helperText={errors[field.key]}
        required={field.required}
      />
    )
  }

  /**
   * Render a number field
   */
  const renderNumberField = (field: AssignmentField) => {
    const value = values[field.key] || ''

    return (
      <CustomTextField
        fullWidth
        type='number'
        label={field.label}
        value={value}
        onChange={e => handleChange(field.key, parseFloat(e.target.value))}
        error={!!errors[field.key]}
        helperText={errors[field.key]}
        required={field.required}
      />
    )
  }

  /**
   * Render a select field
   */
  const renderSelectField = (field: AssignmentField) => {
    const value = values[field.key] || ''

    return (
      <CustomTextField
        fullWidth
        select
        label={field.label}
        value={value}
        onChange={e => handleChange(field.key, e.target.value)}
        error={!!errors[field.key]}
        helperText={errors[field.key]}
        required={field.required}
      >
        {field.options?.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </CustomTextField>
    )
  }

  /**
   * Render a custom field component
   */
  const renderCustomField = (field: AssignmentField) => {
    if (!field.customComponent) {
      return <Typography color='error'>Custom component not provided</Typography>
    }

    const CustomComponent = field.customComponent

    return (
      <CustomComponent
        value={values[field.key]}
        onChange={(value: any) => handleChange(field.key, value)}
        error={errors[field.key]}
        label={field.label}
        required={field.required}
      />
    )
  }

  /**
   * Render a single field based on its type
   */
  const renderField = (field: AssignmentField) => {
    switch (field.type) {
      case 'datetime':
        return renderDateTimeField(field)
      case 'boolean':
        return renderBooleanField(field)
      case 'text':
        return renderTextField(field)
      case 'number':
        return renderNumberField(field)
      case 'select':
        return renderSelectField(field)
      case 'custom':
        return renderCustomField(field)
      default:
        return <Typography color='error'>Unknown field type: {field.type}</Typography>
    }
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <Grid container spacing={3}>
      {config.fields.map(field => (
        <Grid item xs={12} sm={field.type === 'boolean' ? 12 : 6} key={field.key}>
          {renderField(field)}
          {errors[field.key] &&
            field.type !== 'text' &&
            field.type !== 'number' &&
            field.type !== 'select' &&
            field.type !== 'datetime' && (
              <Typography color='error' variant='caption' sx={{ mt: 1, display: 'block' }}>
                {errors[field.key]}
              </Typography>
            )}
        </Grid>
      ))}
    </Grid>
  )
}

export default AssignmentConfigForm
