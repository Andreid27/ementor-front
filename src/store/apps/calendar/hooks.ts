// ** React Imports
import { useEffect } from 'react'

// ** Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Store Imports
import { fetchMyRecurringSeries, selectMyRecurringSeries } from './index'

// ** Types
import type { RecurringSeriesDTO } from 'src/generated/profile-service/api'

/**
 * Custom hook to fetch and select recurring series with smart caching
 * Automatically fetches data on mount if not available or stale (>2 hours)
 *
 * @returns {RecurringSeriesDTO[]} Array of recurring series from the store
 *
 * @example
 * const recurringSeries = useMyRecurringSeries()
 */
export const useMyRecurringSeries = (): RecurringSeriesDTO[] => {
  const dispatch = useDispatch()
  const recurringSeries = useSelector(selectMyRecurringSeries)

  useEffect(() => {
    dispatch(fetchMyRecurringSeries() as any)
  }, [dispatch])

  return recurringSeries
}
