import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAttendees,
  selectAttendees,
  selectCalendarLoading,
  selectCalendarError,
  setRecurringSeriesAttendeePrice,
  setSingularEventAttendeePrice,
  setEventOccurrenceAttendeePrice
} from 'src/store/apps/calendar/index'
import {
  AttendeeWithPhoto,
  AttendeeWithPricing,
  StudentData,
  getAttendeesFromStudentIds,
  mergeAttendeesWithPricing,
  attendeesToStudentIds,
  createAttendeePricesMap
} from '../utils/attendeeUtils'

export interface UseAttendeeManagementOptions {
  eventId?: string
  seriesId?: string
  occurrenceId?: string
  students: StudentData[]
  initialAttendeeIds?: string[]
  initialAttendeePrices?: { [key: string]: number }
  defaultPrice?: number
  autoFetchAttendees?: boolean
}

export interface UseAttendeeManagementReturn {
  // Attendee data
  attendees: AttendeeWithPricing[]
  attendeeIds: string[]
  attendeePrices: { [key: string]: number }

  // Loading states
  isLoading: boolean
  error: string | null

  // Actions
  setAttendeeIds: (ids: string[]) => void
  setAttendeePrices: (prices: { [key: string]: number }) => void
  addAttendee: (studentId: string) => void
  removeAttendee: (studentId: string) => void
  setAttendeePrice: (studentId: string, price: number) => void
  removeAttendeePrice: (studentId: string) => void
  refreshAttendees: () => Promise<void>
  saveAttendeePricesForSeries: (seriesId: string, prices: { [key: string]: number }) => Promise<void>
  saveAttendeePricesForSingularEvent: (eventId: string, prices: { [key: string]: number }) => Promise<void>
  saveAttendeePricesForOccurrence: (occurrenceId: string, prices: { [key: string]: number }) => Promise<void>

  // Statistics
  totalAttendees: number
  totalRevenue: number
  averagePrice: number
  attendeesWithCustomPrice: number
}

export const useAttendeeManagement = ({
  eventId,
  seriesId,
  occurrenceId,
  students,
  initialAttendeeIds = [],
  initialAttendeePrices = {},
  defaultPrice = 0,
  autoFetchAttendees = true
}: UseAttendeeManagementOptions): UseAttendeeManagementReturn => {
  const dispatch = useDispatch()

  // Redux state
  const reduxAttendees = useSelector(selectAttendees)
  const isLoading = useSelector(selectCalendarLoading)
  const error = useSelector(selectCalendarError)

  // Local state
  const [attendeeIds, setAttendeeIds] = useState<string[]>(initialAttendeeIds)
  const [attendeePrices, setAttendeePrices] = useState<{ [key: string]: number }>(initialAttendeePrices)
  const [useReduxAttendees, setUseReduxAttendees] = useState(false)

  // Calculate attendees with photos and pricing
  const attendees = React.useMemo(() => {
    let baseAttendees: AttendeeWithPhoto[]

    if (useReduxAttendees && reduxAttendees.length > 0) {
      // Use attendees from Redux (fetched from API)
      const reduxAttendeeIds = reduxAttendees.map(a => a.userId).filter(id => id) as string[]
      baseAttendees = getAttendeesFromStudentIds(reduxAttendeeIds, students)
    } else {
      // Use local attendee IDs
      baseAttendees = getAttendeesFromStudentIds(attendeeIds, students)
    }

    return mergeAttendeesWithPricing(baseAttendees, attendeePrices, defaultPrice)
  }, [useReduxAttendees, reduxAttendees, attendeeIds, students, attendeePrices, defaultPrice])

  // Statistics
  const statistics = React.useMemo(() => {
    const totalAttendees = attendees.length
    const totalRevenue = attendees.reduce((sum, attendee) => sum + (attendee.price || 0), 0)
    const averagePrice = totalAttendees > 0 ? totalRevenue / totalAttendees : 0
    const attendeesWithCustomPrice = attendees.filter(a => a.hasCustomPrice).length

    return {
      totalAttendees,
      totalRevenue,
      averagePrice,
      attendeesWithCustomPrice
    }
  }, [attendees])

  // Fetch attendees from API
  const refreshAttendees = useCallback(async () => {
    if (seriesId || occurrenceId) {
      try {
        await (dispatch as any)(
          getAttendees({
            seriesId: seriesId || undefined,
            occurrenceId: occurrenceId || undefined
          })
        )
        setUseReduxAttendees(true)
      } catch (error) {
        console.error('Failed to fetch attendees:', error)
      }
    }
  }, [dispatch, seriesId, occurrenceId])

  // Auto-fetch attendees on mount
  useEffect(() => {
    if (autoFetchAttendees && (seriesId || occurrenceId)) {
      refreshAttendees()
    }
  }, [autoFetchAttendees, seriesId, occurrenceId, refreshAttendees])

  // Sync Redux attendees to local state when they change
  useEffect(() => {
    if (reduxAttendees.length > 0) {
      const reduxAttendeeIds = reduxAttendees.map(a => a.userId).filter(id => id) as string[]
      setAttendeeIds(reduxAttendeeIds)
      setUseReduxAttendees(true)
    }
  }, [reduxAttendees])

  // API actions for saving attendee prices
  const saveAttendeePricesForSeries = useCallback(
    async (seriesId: string, prices: { [key: string]: number }) => {
      const promises = Object.entries(prices).map(([attendeeId, price]) =>
        (dispatch as any)(setRecurringSeriesAttendeePrice({ seriesId, attendeeId, price }))
      )
      await Promise.all(promises)
    },
    [dispatch]
  )

  const saveAttendeePricesForSingularEvent = useCallback(
    async (eventId: string, prices: { [key: string]: number }) => {
      const promises = Object.entries(prices).map(([attendeeId, price]) =>
        (dispatch as any)(setSingularEventAttendeePrice({ eventId, attendeeId, price }))
      )
      await Promise.all(promises)
    },
    [dispatch]
  )

  const saveAttendeePricesForOccurrence = useCallback(
    async (occurrenceId: string, prices: { [key: string]: number }) => {
      const promises = Object.entries(prices).map(([attendeeId, price]) =>
        (dispatch as any)(setEventOccurrenceAttendeePrice({ occurrenceId, attendeeId, price }))
      )
      await Promise.all(promises)
    },
    [dispatch]
  )

  // Actions
  const addAttendee = useCallback(
    (studentId: string) => {
      if (!attendeeIds.includes(studentId)) {
        setAttendeeIds(prev => [...prev, studentId])
        setUseReduxAttendees(false) // Switch to local management
      }
    },
    [attendeeIds]
  )

  const removeAttendee = useCallback((studentId: string) => {
    setAttendeeIds(prev => prev.filter(id => id !== studentId))
    setAttendeePrices(prev => {
      const newPrices = { ...prev }
      delete newPrices[studentId]
      return newPrices
    })
    setUseReduxAttendees(false) // Switch to local management
  }, [])

  const setAttendeePrice = useCallback((studentId: string, price: number) => {
    setAttendeePrices(prev => ({
      ...prev,
      [studentId]: price
    }))
  }, [])

  const removeAttendeePrice = useCallback((studentId: string) => {
    setAttendeePrices(prev => {
      const newPrices = { ...prev }
      delete newPrices[studentId]
      return newPrices
    })
  }, [])

  return {
    // Attendee data
    attendees,
    attendeeIds,
    attendeePrices,

    // Loading states
    isLoading,
    error,

    // Actions
    setAttendeeIds,
    setAttendeePrices,
    addAttendee,
    removeAttendee,
    setAttendeePrice,
    removeAttendeePrice,
    refreshAttendees,
    saveAttendeePricesForSeries,
    saveAttendeePricesForSingularEvent,
    saveAttendeePricesForOccurrence,

    // Statistics
    ...statistics
  }
}

export default useAttendeeManagement
