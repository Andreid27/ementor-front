// ** React Imports
import { useState, Fragment } from 'react'

// ** MUI Imports
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  LinearProgress,
  IconButton,
  Typography,
  Fade,
  Divider,
  Paper,
  alpha
} from '@mui/material'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Type Imports
import type { GenericAssignmentModalProps, AssignableEntity, SelectedUser } from './GenericAssignmentModal.types'

// ** Sub-component Imports
import EntitySelector from './components/EntitySelector'
import GroupedUserSelector from './components/GroupedUserSelector'
import AssignmentConfigForm from './components/AssignmentConfigForm'

// ========================================
// STYLED COMPONENTS
// ========================================

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(5, 6),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTypography-root': {
    fontSize: '1.25rem',
    fontWeight: 600
  }
}))

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(6),
  position: 'relative'
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(4, 6),
  borderTop: `1px solid ${theme.palette.divider}`,
  gap: theme.spacing(2)
}))

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: alpha(theme.palette.primary.main, 0.3)
  }
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 600,
  marginBottom: theme.spacing(3),
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5)
}))

const SectionIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
  color: theme.palette.primary.main
}))

/**
 * GenericAssignmentModal - A reusable modal for assigning any entity type to users
 *
 * Features two main lists:
 * 1. Entity Selection List - Select items to assign (lessons, quizzes, etc.)
 * 2. Grouped User Selection List - Select users organized by recurring series
 *
 * @template T - The type of entity being assigned (must extend AssignableEntity)
 */
function GenericAssignmentModal<T extends AssignableEntity>({
  // List #1: Entity Configuration
  entities,
  entityConfig,

  // List #2: User & Grouping Configuration
  users,
  recurringSeries,

  // Assignment Configuration (Optional)
  assignmentConfig,
  defaultAssignmentOptions = {},

  // Callbacks
  onAssign,
  onValidate,

  // Modal Control & UI
  open: controlledOpen,
  onClose,
  triggerButton,
  modalTitle,
  modalSize = 'md',
  confirmButtonText = 'Asignează',
  cancelButtonText = 'Anulează'
}: GenericAssignmentModalProps<T>) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Modal open state (internal or controlled)
  const [internalOpen, setInternalOpen] = useState<boolean>(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  // List #1: Selected entities
  const [selectedEntities, setSelectedEntities] = useState<T[]>([])

  // List #2: Selected users
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([])

  // Assignment configuration values
  const [assignmentOptions, setAssignmentOptions] = useState<Record<string, any>>(defaultAssignmentOptions)

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Loading state during assignment
  const [isAssigning, setIsAssigning] = useState<boolean>(false)

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Opens the modal
   */
  const handleOpen = () => {
    if (!isControlled) {
      setInternalOpen(true)
    }
  }

  /**
   * Closes the modal and resets state
   */
  const handleClose = () => {
    if (isControlled && onClose) {
      onClose()
    } else {
      setInternalOpen(false)
    }

    // Reset state after modal closes
    setTimeout(() => {
      setSelectedEntities([])
      setSelectedUsers([])
      setAssignmentOptions(defaultAssignmentOptions)
      setValidationErrors({})
    }, 200)
  }

  /**
   * Validates the assignment data
   */
  const validateAssignment = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate entities selection
    if (selectedEntities.length === 0) {
      errors.entities = `Selectează cel puțin un ${entityConfig.labelSingular.toLowerCase()}`
    }

    // Validate users selection
    if (selectedUsers.length === 0) {
      errors.users = 'Selectează cel puțin un utilizator'
    }

    // Validate configuration fields
    if (assignmentConfig) {
      assignmentConfig.fields.forEach(field => {
        const value = assignmentOptions[field.key]

        // Check required fields
        if (field.required && (value === undefined || value === null || value === '')) {
          errors[field.key] = `${field.label} este obligatoriu`
        }

        // Run custom validation
        if (field.validation && value !== undefined && value !== null) {
          const error = field.validation(value)
          if (error) {
            errors[field.key] = error
          }
        }
      })
    }

    // Run custom validation if provided
    if (onValidate) {
      const validationResult = onValidate({
        entities: selectedEntities,
        users: selectedUsers,
        options: assignmentOptions
      })

      if (!validationResult.isValid && validationResult.errors) {
        validationResult.errors.forEach(error => {
          errors[error.field] = error.message
        })
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  /**
   * Handles the assignment action
   */
  const handleAssign = async () => {
    // Validate before proceeding
    if (!validateAssignment()) {
      toast.error('Corectează erorile de validare')
      return
    }

    setIsAssigning(true)

    try {
      await onAssign({
        entities: selectedEntities,
        users: selectedUsers,
        options: assignmentOptions
      })

      // Success - close modal
      handleClose()
      toast.success('Asignare realizată cu succes!')
    } catch (error: any) {
      console.error('Assignment error:', error)
      toast.error(error?.message || 'A apărut o eroare la asignare')
    } finally {
      setIsAssigning(false)
    }
  }

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const computedModalTitle = modalTitle || `Asignează ${entityConfig.labelPlural}`

  // ========================================
  // RENDER
  // ========================================

  return (
    <Fragment>
      {/* Trigger Button */}
      {triggerButton && (
        <Box onClick={handleOpen} sx={{ display: 'inline-block' }}>
          {triggerButton}
        </Box>
      )}

      {/* Modal Dialog */}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth={modalSize}
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
        aria-labelledby='assignment-modal-title'
      >
        {/* Header */}
        <StyledDialogTitle id='assignment-modal-title'>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SectionIcon>
                <Icon icon='mdi:clipboard-text-outline' fontSize={20} />
              </SectionIcon>
              <Typography variant='h6'>{computedModalTitle}</Typography>
            </Box>
            <IconButton size='small' onClick={handleClose} aria-label='close' disabled={isAssigning}>
              <Icon icon='mdi:close' />
            </IconButton>
          </Box>
        </StyledDialogTitle>

        {/* Loading Bar */}
        {isAssigning && <LinearProgress />}

        {/* Content */}
        <StyledDialogContent>
          <Grid container spacing={5}>
            {/* LIST #1: Entity Selection */}
            <Grid item xs={12}>
              <Fade in timeout={400}>
                <SectionPaper elevation={0}>
                  <SectionTitle>
                    <SectionIcon>
                      <Icon icon='mdi:book-outline' fontSize={18} />
                    </SectionIcon>
                    {entityConfig.labelPlural}
                  </SectionTitle>
                  <EntitySelector<T>
                    entities={entities}
                    selectedEntities={selectedEntities}
                    onSelectionChange={setSelectedEntities}
                    entityConfig={entityConfig}
                    label={entityConfig.labelPlural}
                    placeholder={
                      entityConfig.searchPlaceholder || `Selectează ${entityConfig.labelPlural.toLowerCase()}`
                    }
                  />
                  {validationErrors.entities && (
                    <Typography color='error' variant='caption' sx={{ mt: 2, display: 'block' }}>
                      {validationErrors.entities}
                    </Typography>
                  )}
                </SectionPaper>
              </Fade>
            </Grid>

            {/* LIST #2: Grouped User Selection */}
            <Grid item xs={12}>
              <Fade in timeout={500}>
                <SectionPaper elevation={0}>
                  <SectionTitle>
                    <SectionIcon>
                      <Icon icon='mdi:account-group-outline' fontSize={18} />
                    </SectionIcon>
                    Utilizatori
                  </SectionTitle>
                  <GroupedUserSelector
                    users={users}
                    recurringSeries={recurringSeries}
                    selectedUsers={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                    enableSearch
                    showAvatars
                    maxHeight={400}
                  />
                  {validationErrors.users && (
                    <Typography color='error' variant='caption' sx={{ mt: 2, display: 'block' }}>
                      {validationErrors.users}
                    </Typography>
                  )}
                </SectionPaper>
              </Fade>
            </Grid>

            {/* Optional: Assignment Configuration Form */}
            {assignmentConfig && assignmentConfig.fields.length > 0 && (
              <Grid item xs={12}>
                <Fade in timeout={600}>
                  <SectionPaper elevation={0}>
                    <SectionTitle>
                      <SectionIcon>
                        <Icon icon='mdi:cog-outline' fontSize={18} />
                      </SectionIcon>
                      Configurare asignare
                    </SectionTitle>
                    <AssignmentConfigForm
                      config={assignmentConfig}
                      values={assignmentOptions}
                      onChange={setAssignmentOptions}
                      errors={validationErrors}
                    />
                  </SectionPaper>
                </Fade>
              </Grid>
            )}
          </Grid>
        </StyledDialogContent>

        {/* Actions */}
        <StyledDialogActions>
          <Button onClick={handleClose} variant='outlined' size='large' disabled={isAssigning} sx={{ minWidth: 120 }}>
            {cancelButtonText}
          </Button>
          <Button
            onClick={handleAssign}
            variant='contained'
            size='large'
            disabled={isAssigning}
            startIcon={<Icon icon='mdi:check' />}
            sx={{ minWidth: 120 }}
          >
            {confirmButtonText}
          </Button>
        </StyledDialogActions>
      </Dialog>
    </Fragment>
  )
}

export default GenericAssignmentModal
