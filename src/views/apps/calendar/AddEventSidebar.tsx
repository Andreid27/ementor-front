// ** React Imports
import React from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'

// ** Types
import { AddEventSidebarProps } from './types'

// ** Components
import { SidebarHeaderImproved, SidebarContentContainer, SidebarFooter } from './components'
import EventActionConfirmDialog from './components/EventActionConfirmDialog'

// ** Utils
// import { createBlankEvent } from './utils/eventTransforms' // Used in SidebarContentContainer

// ** Constants
import { DRAWER_STYLES, SIDEBAR_BODY_STYLES } from './constants'

// ** Hooks
import { useEventData, useEventActions } from './hooks'

/**
 * AddEventSidebar - Refactored and Improved
 *
 * This component has been completely refactored following React best practices:
 * - Single Responsibility: Each component has a clear, specific purpose
 * - Custom Hooks: Business logic is extracted into reusable hooks
 * - Memoization: Components are memoized to prevent unnecessary re-renders
 * - Separation of Concerns: UI logic is separated from business logic
 * - Type Safety: Comprehensive TypeScript typing throughout
 * - Constants: Reusable constants for consistent styling and behavior
 * - Utils: Pure functions for data transformation
 * - Modular Structure: Easy to test, maintain, and extend
 */
const AddEventSidebar: React.FC<AddEventSidebarProps> = props => {
  const {
    store,
    dispatch,
    addEvent,
    updateEvent,
    modifyEventOccurrence,
    cancelEventOccurrence,
    completeEventOccurrence,
    drawerWidth,
    calendarApi,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    students
  } = props

  // Dialog states
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false)
  const [confirmDialogAction, setConfirmDialogAction] = React.useState<'cancel' | 'complete'>('cancel')
  const [actionLoading, setActionLoading] = React.useState(false)
  const [isCompletionMode, setIsCompletionMode] = React.useState(false)

  // Handle sidebar close with proper cleanup
  const handleSidebarClose = React.useCallback(async () => {
    // If in completion mode, exit completion mode first
    if (isCompletionMode) {
      setIsCompletionMode(false)
      return
    }

    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
  }, [dispatch, handleSelectEvent, handleAddEventSidebarToggle, isCompletionMode])

  // Extract event data management logic
  const {
    values,
    setValues,
    isEditMode,
    setIsEditMode,
    resetForm,
    control,
    handleSubmit,
    errors,
    eventTypeInfo,
    editingScope,
    setEditingScope
  } = useEventData({
    selectedEvent: store.selectedEvent,
    addEventSidebarOpen
  })

  // Extract event actions logic
  const {
    handleSubmit: handleFormSubmit,
    handleDelete,
    canEdit
  } = useEventActions({
    values,
    store,
    dispatch,
    addEvent,
    updateEvent,
    modifyEventOccurrence,
    deleteEvent,
    onClose: handleSidebarClose,
    eventTypeInfo,
    editingScope
  })

  // Event handlers
  const handleEdit = React.useCallback(() => {
    setIsEditMode(true)
  }, [setIsEditMode])

  const handleCancel = React.useCallback(() => {
    setIsEditMode(false)
    // Reset form data to stored values - handled by useEventData hook
  }, [setIsEditMode])

  const handleReset = React.useCallback(() => {
    resetForm()
  }, [resetForm])

  // Handle cancel event action
  const handleCancelEvent = React.useCallback(() => {
    setConfirmDialogAction('cancel')
    setConfirmDialogOpen(true)
  }, [])

  // Handle complete event action - now opens wizard instead of dialog
  const handleCompleteEvent = React.useCallback(() => {
    setIsCompletionMode(true)
  }, [])

  // Handle wizard completion
  const handleWizardComplete = React.useCallback(
    async (completionData: any) => {
      if (!store.selectedEvent || !completeEventOccurrence) return

      setActionLoading(true)

      try {
        const event = store.selectedEvent as any // Cast to access EventOccurrenceDTO properties

        const payload = {
          singularEventId: event.id,
          seriesId: event.recurringSeriesId,
          originalStartTime: event.originalStartTime || event.effectiveStartTime || event.start,
          actualStartTime: completionData.actualStartTime,
          actualEndTime: completionData.actualEndTime,
          eventAttendeeDTO: completionData.eventAttendees,
          description: completionData.description
        }

        await completeEventOccurrence(payload)

        // Success! Let the wizard show the success screen
        // Don't close the sidebar here - the wizard will handle it
      } catch (error) {
        console.error('AddEventSidebar - Error completing event:', error)
        // Re-throw the error so the wizard can catch it and show the error screen
        throw error
      } finally {
        setActionLoading(false)
      }
    },
    [store.selectedEvent, completeEventOccurrence]
  )

  // Handle wizard cancellation or close after success/error
  const handleCancelCompletion = React.useCallback(() => {
    // Exit completion mode - this will show EventViewImproved with updated event data
    setIsCompletionMode(false)
    // Don't close sidebar here - let user see the updated event view
    // User can close sidebar manually if desired
  }, [])

  // Handle cancel confirmation dialog
  const handleConfirmAction = React.useCallback(async () => {
    if (!store.selectedEvent || !cancelEventOccurrence) return

    setActionLoading(true)

    try {
      const event = store.selectedEvent as any // Cast to access EventOccurrenceDTO properties

      await cancelEventOccurrence({
        seriesId: event.recurringSeriesId || event.id,
        occurrenceStartTime: event.effectiveStartTime || event.originalStartTime || event.start
      })

      setConfirmDialogOpen(false)
      handleSidebarClose()
    } catch (error) {
      console.error('Error canceling event:', error)
    } finally {
      setActionLoading(false)
    }
  }, [store.selectedEvent, cancelEventOccurrence, handleSidebarClose])

  // Handle dialog close
  const handleDialogClose = React.useCallback(() => {
    setConfirmDialogOpen(false)
  }, [])

  // Determine if this is a day summary view
  const isDaySummary = React.useMemo(() => {
    return (store.selectedEvent as any)?.isDaySummary
  }, [store.selectedEvent])

  // Drawer styles with dynamic width
  const drawerStyles = React.useMemo(
    () => ({
      ...DRAWER_STYLES,
      '& .MuiDrawer-paper': {
        ...DRAWER_STYLES['& .MuiDrawer-paper'],
        width: ['100%', drawerWidth]
      }
    }),
    [drawerWidth]
  )

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={drawerStyles}
    >
      {/* Improved Header with better action handling */}
      <SidebarHeaderImproved
        isEditMode={isEditMode}
        selectedEvent={store.selectedEvent}
        canEdit={canEdit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCancel={handleCancel}
        onClose={handleSidebarClose}
        onCancelEvent={handleCancelEvent}
        onCompleteEvent={handleCompleteEvent}
        isDaySummary={isDaySummary}
        eventTypeInfo={eventTypeInfo}
        isCompletionMode={isCompletionMode}
      />

      {/* Main Content Area */}
      <Box className='sidebar-body' sx={SIDEBAR_BODY_STYLES}>
        <DatePickerWrapper>
          <form onSubmit={handleSubmit(handleFormSubmit)} autoComplete='off'>
            <SidebarContentContainer
              store={store}
              dispatch={dispatch}
              addEvent={addEvent}
              updateEvent={updateEvent}
              deleteEvent={deleteEvent}
              calendarApi={calendarApi}
              handleSelectEvent={handleSelectEvent}
              addEventSidebarOpen={addEventSidebarOpen}
              students={students}
              onClose={handleSidebarClose}
              // Pass edit mode state and form data
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              values={values}
              setValues={setValues}
              control={control}
              handleSubmit={handleSubmit}
              errors={errors}
              // Event type and editing scope
              eventTypeInfo={eventTypeInfo}
              editingScope={editingScope}
              onEditingScopeChange={setEditingScope}
              // Completion wizard props
              isCompletionMode={isCompletionMode}
              onCompleteEvent={handleWizardComplete}
              onCancelCompletion={handleCancelCompletion}
              completionLoading={actionLoading}
            />

            {/* Footer for form actions - only show in edit mode */}
            {(isEditMode || store.selectedEvent === null) && !isDaySummary && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  position: 'sticky',
                  bottom: 0,
                  mx: -4,
                  px: 4
                }}
              >
                <SidebarFooter
                  isEditMode={isEditMode}
                  onClose={handleSidebarClose}
                  onCancel={handleCancel}
                  onReset={handleReset}
                />
              </Box>
            )}
          </form>
        </DatePickerWrapper>
      </Box>

      {/* Event Action Confirmation Dialog */}
      {store.selectedEvent && (
        <EventActionConfirmDialog
          open={confirmDialogOpen}
          onClose={handleDialogClose}
          onConfirm={handleConfirmAction}
          action={confirmDialogAction}
          eventTitle={
            (store.selectedEvent as any)?.seriesTitle || (store.selectedEvent as any)?.title || 'Eveniment fără titlu'
          }
          eventDate={new Date(
            (store.selectedEvent as any)?.effectiveStartTime || (store.selectedEvent as any)?.start || new Date()
          ).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
          isRecurring={!!(store.selectedEvent as any)?.recurringSeriesId}
          isFutureEvent={
            (store.selectedEvent as any)?.effectiveStartTime
              ? new Date((store.selectedEvent as any).effectiveStartTime) > new Date()
              : false
          }
          loading={actionLoading}
        />
      )}
    </Drawer>
  )
}

export default React.memo(AddEventSidebar)
