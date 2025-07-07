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
    drawerWidth,
    calendarApi,
    deleteEvent,
    handleSelectEvent,
    addEventSidebarOpen,
    handleAddEventSidebarToggle,
    students
  } = props

  // Handle sidebar close with proper cleanup
  const handleSidebarClose = React.useCallback(async () => {
    dispatch(handleSelectEvent(null))
    handleAddEventSidebarToggle()
  }, [dispatch, handleSelectEvent, handleAddEventSidebarToggle])

  // Extract event data management logic
  const { isEditMode, setIsEditMode, resetForm, values, setValues, control, handleSubmit, errors } = useEventData({
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
    deleteEvent,
    calendarApi,
    onClose: handleSidebarClose
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
        isDaySummary={isDaySummary}
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
              // Pass edit mode state to avoid duplication
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              values={values}
              setValues={setValues}
              control={control}
              handleSubmit={handleSubmit}
              errors={errors}
            />

            {/* Footer for form actions - only show in edit mode */}
            {(isEditMode || store.selectedEvent === null) && !isDaySummary && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 3,
                  pt: 2,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <SidebarFooter
                  isEditMode={isEditMode}
                  selectedEvent={store.selectedEvent}
                  onClose={handleSidebarClose}
                  onCancel={handleCancel}
                  onReset={handleReset}
                />
              </Box>
            )}
          </form>
        </DatePickerWrapper>
      </Box>
    </Drawer>
  )
}

export default React.memo(AddEventSidebar)
