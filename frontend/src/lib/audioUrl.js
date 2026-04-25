import { api } from './api'

const cache = new Map()
const inFlight = new Map()

function getCached(obraId) {
  const entry = cache.get(obraId)
  if (entry && Date.now() < entry.expires) return entry.url
  return null
}

export async function getAudioUrl(obraId) {
  if (!obraId) return null

  const cached = getCached(obraId)
  if (cached) return cached

  if (inFlight.has(obraId)) return inFlight.get(obraId)

  const promise = (async () => {
    try {
      const { url } = await api.get(`/obras/${obraId}/preview-url`)
      if (!url) return null
      cache.set(obraId, {
        url,
        expires: Date.now() + 50 * 60 * 1000,
      })
      return url
    } catch (_) {
      return null
    } finally {
      inFlight.delete(obraId)
    }
  })()

  inFlight.set(obraId, promise)
  return promise
}

export function prefetchAudioUrl(obraId) {
  if (!obraId) return
  if (getCached(obraId)) return
  if (inFlight.has(obraId)) return
  getAudioUrl(obraId)
}
