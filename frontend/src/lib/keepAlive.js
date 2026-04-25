/**
 * Keep-alive client — faz ping periódico no backend para mantê-lo ativo
 * enquanto o usuário tem a aba aberta.
 *
 * Pausa automaticamente quando a aba fica oculta (Page Visibility API)
 * para não desperdiçar bateria/dados.
 */

const PING_PATH = '/ping'
const INTERVAL_MS = 4 * 60 * 1000 // 4 minutos

let timer = null

function getBaseUrl() {
  return (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '/api'
  )
}

async function ping() {
  try {
    const url = `${getBaseUrl()}${PING_PATH}`
    await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      headers: { 'X-Keep-Alive': '1' },
    })
  } catch (_) {
    /* silencioso — sem internet, sem problema */
  }
}

function start() {
  if (timer) return
  ping()
  timer = setInterval(ping, INTERVAL_MS)
}

function stop() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export function startKeepAlive() {
  if (typeof window === 'undefined') return

  start()

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      start()
    } else {
      stop()
    }
  })

  window.addEventListener('beforeunload', stop)
}
