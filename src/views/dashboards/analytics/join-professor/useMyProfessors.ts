// ** React Imports
import { useCallback, useEffect, useRef, useState } from 'react'

// ** API Imports
import { fetchMyProfessors, MyProfessorDTO } from './joinProfessorApi'

export type MyProfessorsStatus = 'idle' | 'loading' | 'ready' | 'error'

/**
 * Loads the professors the logged-in student has joined.
 *
 * Only call it with `enabled` for STUDENT accounts: the endpoint rejects other
 * roles, and a 403 makes the axios interceptor log the user out.
 */
const useMyProfessors = (enabled: boolean) => {
  const [professors, setProfessors] = useState<MyProfessorDTO[]>([])
  const [status, setStatus] = useState<MyProfessorsStatus>('idle')

  // Ignores responses from a request that a newer one has replaced.
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current

    try {
      const data = await fetchMyProfessors()
      if (id !== requestId.current) return

      setProfessors(data)
      setStatus('ready')
    } catch (error) {
      if (id !== requestId.current) return

      console.error('Failed to load my professors:', error)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const requests = requestId

    if (!enabled) {
      requests.current++
      setProfessors([])
      setStatus('idle')

      return
    }

    setStatus('loading')
    load()

    return () => {
      requests.current++
    }
  }, [enabled, load])

  return { professors, status, refresh: load }
}

export default useMyProfessors
