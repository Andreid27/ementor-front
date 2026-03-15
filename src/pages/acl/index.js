// ** React Imports
import { useContext, useEffect, useState, useRef, useCallback } from 'react'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import { useMediaQuery, Box } from '@mui/material'
import CardActivityTimeline from './components/Timeline'
import { useDispatch, useSelector } from 'react-redux'
import { selectAllStudents, fetchData } from 'src/store/apps/user'
import apiClient from 'src/@core/axios/axiosEmentor'
import { fetchNotifications } from 'src/store/apps/notifications'
import * as apiSpec from '../../apiSpec'
import toast from 'react-hot-toast'
import { loadPhotosForUsers } from 'src/@core/services/photo-loader'
import PaymentTimeline from './components/PaymentTimeline'
import PaymentConfirmationHistory from './components/PaymentConfirmationHistory'
import EventsWidget from 'src/pages/acl/components/EventsWidget'
import AddEventSidebar from 'src/views/apps/calendar/AddEventSidebar'
import { addEvent, updateEvent, deleteEvent, handleSelectEvent, fetchEvents } from 'src/store/apps/calendar'
import { EventAttendeeDTO } from 'src/generated/profile-service'
import { profileServiceClient } from 'src/services'

const ACLPage = () => {
  const dispatch = useDispatch()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [quizzesData, setQuizzesData] = useState([])
  const paymentHistoryRef = useRef(null)
  const eventsWidgetRef = useRef(null)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState(false)
  const calendarStore = useSelector(state => state.calendar)
  const userStore = useSelector(state => state.user)
  const mdAbove = useMediaQuery(theme => theme.breakpoints.up('md'))

  const quizServiceRequestParams = {
    filters: [
      {
        key: 'startedAt',
        operation: 'GREATER',
        value: '2000-01-01T00:00:00.00Z'
      }
    ],
    sorters: [
      {
        key: 'startedAt',
        direction: 'DESC'
      }
    ]
  }

  useEffect(() => {
    const fetchDataFromAPIs = async () => {
      try {
        // Fetch all active students (needed by EventsWidget, PaymentHistory, etc.)
        await dispatch(fetchData()).unwrap()

        // Quiz data can be fetched in parallel
        const quizServiceResponse = await apiClient.post(apiSpec.QUIZ_SERVICE + '/assigned-paginated', {
          filters: quizServiceRequestParams.filters,
          sorters: quizServiceRequestParams.sorters,
          page: 0,
          pageSize: 10
        })

        dispatch(fetchNotifications())

        // Show quiz data immediately (without avatars) so the timeline is not empty
        const rawQuizData = quizServiceResponse.data.data || []
        setQuizzesData(rawQuizData)
        setLoading(false)

        // Then load photos in the background and update quizzesData with avatars
        const activeStudents = userStore.activeStudents || []
        if (activeStudents.length > 0 && rawQuizData.length > 0) {
          loadPhotosForUsers(activeStudents)
            .then(usersWithPhotos => {
              setQuizzesData(prevData =>
                prevData.map(row => {
                  const user = usersWithPhotos.find(u => u.id === row.studentId)
                  return user?.avatar ? { ...row, avatar: user.avatar } : row
                })
              )
            })
            .catch(err => console.error('[ACL] Background photo load failed:', err))
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to load dashboard data')
        setLoading(false)
      }
    }

    fetchDataFromAPIs()
  }, [])

  // Update users when activeStudents changes
  useEffect(() => {
    setUsers(userStore.activeStudents || [])
  }, [userStore.activeStudents])

  const handlePaymentConfirmed = () => {
    // Refresh the confirmation history when a payment is confirmed
    if (paymentHistoryRef.current) {
      paymentHistoryRef.current.refresh()
    }
  }

  const handleAddEventSidebarToggle = () => setAddEventSidebarOpen(!addEventSidebarOpen)

  // ** Handler for opening complete event from Events Widget
  const handleCompleteEventFromWidget = useCallback(
    event => {
      // Set the selected event in Redux
      dispatch(handleSelectEvent(event))

      // Open the sidebar
      setAddEventSidebarOpen(true)
    },
    [dispatch]
  )

  // ** Create modifyEventOccurrence action locally to match API signature
  const modifyEventOccurrence = useCallback(
    async payload => {
      console.log('Local modifyEventOccurrence action called with:', payload)

      const response = await profileServiceClient.events.modifyEventOccurrence({
        seriesId: payload.seriesId,
        originalStartTime: payload.originalStartTime,
        newStartTime: payload.newStartTime,
        eventAttendeeDTO: payload.eventAttendeeDTO,
        duration: payload.duration,
        newPrice: payload.newPrice,
        newMeetingLink: payload.newMeetingLink
      })

      console.log('Local modifyEventOccurrence API response:', response.data)
      await dispatch(fetchEvents())

      // Refresh the events widget
      if (eventsWidgetRef.current) {
        eventsWidgetRef.current.refresh()
      }

      return response.data
    },
    [dispatch]
  )

  // ** Create cancelEventOccurrence action locally
  const cancelEventOccurrence = useCallback(
    async payload => {
      console.log('Local cancelEventOccurrence action called with:', payload)

      const response = await profileServiceClient.events.cancelEventOccurrence({
        seriesId: payload.seriesId.toString(),
        originalStartTime: payload.occurrenceStartTime
      })

      console.log('Local cancelEventOccurrence API response:', response.data)
      await dispatch(fetchEvents())

      // Refresh the events widget
      if (eventsWidgetRef.current) {
        eventsWidgetRef.current.refresh()
      }

      return response.data
    },
    [dispatch]
  )

  // ** Create completeEventOccurrence action locally
  const completeEventOccurrence = useCallback(
    async payload => {
      console.log('Local completeEventOccurrence action called with:', payload)

      let eventAttendeeDTO

      if (payload.eventAttendeeDTO) {
        // New format: EventAttendeeDTO objects already provided (from wizard)
        eventAttendeeDTO = payload.eventAttendeeDTO
      } else if (payload.attendeeIds) {
        // Legacy format: Convert attendeeIds to EventAttendeeDTO format
        eventAttendeeDTO = payload.attendeeIds.map(attendeeId => ({
          attendeeId,
          hasCustomPricing: false,
          customPrice: 0,
          expected: true,
          attended: true // Mark as attended since we're completing the event
        }))
      } else {
        console.error('completeEventOccurrence: No attendee data provided')

        return
      }

      const response = await profileServiceClient.events.completeEventOccurrence({
        singularEventId: payload.singularEventId,
        seriesId: payload.seriesId,
        originalStartTime: payload.originalStartTime,
        actualStartTime: payload.actualStartTime,
        actualEndTime: payload.actualEndTime,
        eventAttendeeDTO,
        description: payload.description
      })

      console.log('Local completeEventOccurrence API response:', response.data)

      // Update the selected event in Redux store immediately with the completed event
      if (response.data) {
        dispatch(handleSelectEvent(response.data))
      }

      // Then refresh all events to keep the list in sync
      await dispatch(fetchEvents())

      // Refresh the events widget
      if (eventsWidgetRef.current) {
        eventsWidgetRef.current.refresh()
      }

      return response.data
    },
    [dispatch]
  )

  return (
    <>
      <Grid container spacing={6}>
        <Grid item md={6} xs={12}>
          <CardActivityTimeline quizzesData={quizzesData} users={users} loading={loading} />
          <Box sx={{ mt: 6 }}>
            <EventsWidget ref={eventsWidgetRef} onCompleteEvent={handleCompleteEventFromWidget} />
          </Box>
        </Grid>
        <Grid item md={6} xs={12}>
          <PaymentTimeline users={users} loading={loading} onPaymentConfirmed={handlePaymentConfirmed} />
          <PaymentConfirmationHistory ref={paymentHistoryRef} users={users} />
        </Grid>
      </Grid>

      {/* Add Event Sidebar for completing events */}
      <AddEventSidebar
        store={calendarStore}
        dispatch={dispatch}
        addEvent={addEvent}
        updateEvent={updateEvent}
        modifyEventOccurrence={modifyEventOccurrence}
        cancelEventOccurrence={cancelEventOccurrence}
        completeEventOccurrence={completeEventOccurrence}
        deleteEvent={deleteEvent}
        calendarApi={null}
        drawerWidth={800}
        handleSelectEvent={handleSelectEvent}
        addEventSidebarOpen={addEventSidebarOpen}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        students={users}
      />
    </>
  )
}

ACLPage.acl = {
  action: 'read',
  subject: 'professor-pages'
}

export default ACLPage
