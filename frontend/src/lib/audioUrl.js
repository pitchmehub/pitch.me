import { api } from './api'

const cache = new Map()

export async function getAudioUrl(obraId) {
  if (!obraId) return null

  if (cache.has(obraId)) {
    const { url, expires } = cache.get(obraId)
    if (Date.now() < expires) return url
  }

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
  }
}
