const parseDuration = (value) => {
  if (Number.isFinite(value)) return Math.max(0, value)
  if (!value || typeof value !== 'string') return 0
  const parts = value.split(':').map((part) => Number.parseInt(part, 10))
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 0
  return parts[0] * 60 + parts[1]
}

const formatTime = (value) => {
  if (!Number.isFinite(value)) return '0:00'
  const total = Math.max(0, Math.floor(value))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const deriveInitials = (value) => {
  if (!value) return 'NK'
  const parts = value
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
  if (!parts.length) return 'NK'
  const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase())
  return initials.join('')
}

const getClientX = (event) => {
  if (!event) return null
  if (event.touches && event.touches[0]) return event.touches[0].clientX
  if (event.changedTouches && event.changedTouches[0]) return event.changedTouches[0].clientX
  if (typeof event.clientX === 'number') return event.clientX
  return null
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const FALLBACK_API_BASE = import.meta.env.PROD
  ? 'https://sysc-music.onrender.com/api'
  : 'http://localhost:5000/api'

const getApiOrigin = () => {
  const rawBase = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE).trim()
  const normalized = rawBase.replace(/\/+$/, '')
  return normalized.replace(/\/api$/i, '')
}

const toAbsoluteUrl = (value) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) {
    if (import.meta.env.PROD && value.startsWith('http://')) {
      return value.replace(/^http:\/\//i, 'https://')
    }
    return value
  }
  const origin = getApiOrigin()
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`
}

const normalizeTracks = (data) =>
  Array.isArray(data)
    ? data.map((track) => ({
        ...track,
        title: track.title ?? track.name ?? 'Untitled',
        artist: track.artist ?? 'Unknown Artist',
        coverImage: toAbsoluteUrl(track.coverImage ?? track.cover),
        audioUrl: toAbsoluteUrl(track.audioUrl ?? track.url),
        duration: Number.isFinite(track.duration)
          ? formatTime(track.duration)
          : track.duration ?? '0:00',
      }))
    : []

const trackIdentity = (track) => {
  if (track?.id) return `id:${track.id}`
  if (track?._id) return `id:${track._id}`
  return `meta:${track?.audioUrl ?? ''}|${track?.title ?? ''}|${track?.artist ?? ''}`
}

const durationLabelCache = new Map()

const isMissingDuration = (value) => {
  if (Number.isFinite(value)) return value <= 0
  const normalized = typeof value === 'string' ? value.trim() : ''
  return !normalized || normalized === '0:00' || normalized === '00:00'
}

const loadDurationLabel = (audioUrl) =>
  new Promise((resolve) => {
    if (!audioUrl) {
      resolve('0:00')
      return
    }
    if (durationLabelCache.has(audioUrl)) {
      resolve(durationLabelCache.get(audioUrl))
      return
    }

    const audio = document.createElement('audio')
    let settled = false

    const done = (label) => {
      if (settled) return
      settled = true
      durationLabelCache.set(audioUrl, label)
      audio.removeAttribute('src')
      audio.load()
      resolve(label)
    }

    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      const label = Number.isFinite(audio.duration) && audio.duration > 0 ? formatTime(audio.duration) : '0:00'
      done(label)
    }
    audio.onerror = () => done('0:00')
    audio.src = audioUrl
  })

const hydrateTrackDurations = async (tracks = []) => {
  if (typeof document === 'undefined' || !Array.isArray(tracks) || tracks.length === 0) {
    return tracks
  }

  const next = await Promise.all(
    tracks.map(async (track) => {
      if (!isMissingDuration(track.duration)) return track
      const label = await loadDurationLabel(track.audioUrl)
      return { ...track, duration: label }
    }),
  )

  return next
}

const mergeDurationMap = (tracks = [], durationMap = new Map()) =>
  tracks.map((track) => {
    const duration = durationMap.get(trackIdentity(track))
    if (!duration) return track
    return { ...track, duration }
  })

export {
  clamp,
  deriveInitials,
  formatTime,
  getClientX,
  hydrateTrackDurations,
  mergeDurationMap,
  normalizeTracks,
  parseDuration,
  trackIdentity,
}
