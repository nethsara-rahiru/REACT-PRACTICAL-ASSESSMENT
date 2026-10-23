import { useEffect, useState } from 'react'
import { getIndicators } from '../services/api'
export function useIndicators(codes) {
  const key = codes.join(',')
  const [state, setState] = useState({ key: '', data: {}, loading: true })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    if (!key) { setState({ key, data: {}, loading: false }); return () => controller.abort() }
    setState({ key, data: {}, loading: true })
    Promise.all(key.split(',').map(async code => [code, await getIndicators(code, controller.signal)]))
      .then(rows => { if (!controller.signal.aborted) setState({ key, data: Object.fromEntries(rows), loading: false }) })
      .catch(e => { if (e.name !== 'AbortError' && !controller.signal.aborted) setState({ key, data: {}, loading: false, error: 'Development indicators could not be loaded.' }) })
    return () => controller.abort()
  }, [key, attempt])
  return { ...(state.key === key ? state : { data: {}, loading: true }), retry: () => setAttempt(a => a + 1) }
}
