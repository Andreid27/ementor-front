// ** React Imports
import { DependencyList, useCallback, useEffect, useRef, useState } from 'react'

interface FinanceQueryState<T> {
  data: T | null
  loading: boolean
  error: unknown
}

// Loads one finance section. While it refetches, the previous data stays on screen so the layout
// never jumps; responses that arrive after a newer request started are ignored.
const useFinanceQuery = <T>(fetcher: () => Promise<T>, deps: DependencyList) => {
  const [state, setState] = useState<FinanceQueryState<T>>({ data: null, loading: true, error: null })
  const [reloadCount, setReloadCount] = useState(0)
  const latestRequest = useRef(0)

  useEffect(() => {
    const requestId = ++latestRequest.current
    setState(previous => ({ ...previous, loading: true, error: null }))

    fetcher()
      .then(data => {
        if (requestId === latestRequest.current) setState({ data, loading: false, error: null })
      })
      .catch(error => {
        if (requestId === latestRequest.current) setState(previous => ({ ...previous, loading: false, error }))
      })

    // The caller lists what the fetcher depends on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount])

  const reload = useCallback(() => setReloadCount(count => count + 1), [])

  return { ...state, reload }
}

export default useFinanceQuery
