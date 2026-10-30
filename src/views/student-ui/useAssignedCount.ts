// ** React Imports
import { useEffect, useState } from 'react'

// ** API Imports
import * as apiSpec from 'src/apiSpec'
import apiClient from 'src/@core/axios/axiosEmentor'

const ASSIGNED = {
  lessons: {
    url: `${apiSpec.LESSON_SERVICE}/lesson/assigned-paginated`,
    sorters: [{ key: 'startAfter', direction: 'DESC' }]
  },
  tests: {
    url: `${apiSpec.QUIZ_SERVICE}/assigned-paginated`,
    sorters: [{ key: 'assignedAt', direction: 'DESC' }]
  }
}

/**
 * How many lessons or tests the student has been sent, read from a one-row page.
 * An empty page uses it to point to the other list only when that list has
 * something, so the two empty pages never send the student back and forth.
 * Null while loading or if the request fails.
 */
const useAssignedCount = (kind: keyof typeof ASSIGNED, enabled: boolean) => {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    let active = true
    const { url, sorters } = ASSIGNED[kind]

    apiClient
      .post(url, { filters: [], sorters, page: 0, pageSize: 1 })
      .then(response => {
        if (active) setCount(response.data?.totalCount ?? 0)
      })
      .catch(() => {
        if (active) setCount(null)
      })

    return () => {
      active = false
    }
  }, [kind, enabled])

  return count
}

export default useAssignedCount
