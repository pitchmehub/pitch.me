import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../lib/api'

const POLL_INTERVAL = 60_000

export function usePendencias() {
  const [total, setTotal] = useState(0)
  const timerRef = useRef(null)

  const fetch = useCallback(async () => {
    try {
      const data = await api.get('/contratos/licenciamento/pendencias')
      setTotal(data?.total ?? 0)
    } catch {
      // Silencioso — não mostrar erro se o usuário não estiver autenticado
    }
  }, [])

  useEffect(() => {
    fetch()
    timerRef.current = setInterval(fetch, POLL_INTERVAL)

    function onFocus() { fetch() }
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(timerRef.current)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetch])

  return total
}
