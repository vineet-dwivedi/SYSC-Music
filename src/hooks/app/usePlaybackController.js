import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import api, { getWithFallback } from '../../services/api.js'
import {
  clamp,
  formatTime,
  getClientX,
  hydrateTrackDurations,
  mergeDurationMap,
  normalizeTracks,
  parseDuration,
  trackIdentity,
} from './utils.js'

function usePlaybackController({ addToast }) {
  const [queue, setQueue] = useState([])
  const [tracks, setTracks] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeAlbum, setActiveAlbum] = useState(null)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [trackDuration, setTrackDuration] = useState(parseDuration(tracks[0]?.duration))
  const [volume, setVolume] = useState(0.7)
  const [volumeHudValue, setVolumeHudValue] = useState(70)
  const [volumeHudVisible, setVolumeHudVisible] = useState(false)

  const volumeHudTimerRef = useRef(null)
  const didFetchRef = useRef(false)
  const audioRef = useRef(null)

  const currentTrack = currentTrackIndex === null ? null : queue[currentTrackIndex]
  const progressPercent = useMemo(() => {
    if (!trackDuration) return 0
    return Math.min(100, Math.max(0, (playbackPosition / trackDuration) * 100))
  }, [playbackPosition, trackDuration])
  const playbackTimeLabel = useMemo(() => formatTime(playbackPosition), [playbackPosition])
  const playbackDurationLabel = useMemo(() => formatTime(trackDuration), [trackDuration])
  const volumePercent = useMemo(() => Math.round(volume * 100), [volume])

  const showVolumeHud = useCallback((nextVolume) => {
    const percent = Math.round(nextVolume * 100)
    setVolumeHudValue(percent)
    setVolumeHudVisible(true)
    if (volumeHudTimerRef.current) window.clearTimeout(volumeHudTimerRef.current)
    volumeHudTimerRef.current = window.setTimeout(() => {
      setVolumeHudVisible(false)
    }, 1200)
  }, [])

  useEffect(() => {
    if (!queue.length) {
      setCurrentTrackIndex(null)
      return
    }
    setCurrentTrackIndex((index) => {
      if (index === null) return index
      if (index >= queue.length) return 0
      return index
    })
  }, [queue])

  useEffect(() => {
    if (didFetchRef.current) return
    didFetchRef.current = true

    const fetchTracks = async () => {
      try {
        const res = await getWithFallback('/tracks')
        const normalized = normalizeTracks(res.data)
        setTracks(normalized)
        setQueue(normalized)

        const enriched = await hydrateTrackDurations(normalized)
        const durationMap = new Map(
          enriched.map((track) => [trackIdentity(track), track.duration]),
        )
        setTracks((prev) => mergeDurationMap(prev, durationMap))
        setQueue((prev) => mergeDurationMap(prev, durationMap))
      } catch (err) {
        const activeBase = api.defaults.baseURL ?? 'unknown'
        console.error(`API failed (base: ${activeBase})`, err)
        setTracks([])
        setQueue([])
      }
    }
    fetchTracks()
  }, [])

  useEffect(() => {
    if (!currentTrack) {
      setPlaybackPosition(0)
      setTrackDuration(0)
      return
    }
    setPlaybackPosition(0)
    const fallbackDuration = parseDuration(currentTrack.duration)
    setTrackDuration(fallbackDuration > 0 ? fallbackDuration : 0)
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
    }
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const syncTime = () => {
      if (Number.isFinite(audio.currentTime)) {
        setPlaybackPosition(audio.currentTime)
      }
    }

    const syncDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setTrackDuration(audio.duration)
        return
      }
      const fallback = parseDuration(currentTrack?.duration)
      setTrackDuration(fallback > 0 ? fallback : 0)
    }

    audio.addEventListener('timeupdate', syncTime)
    audio.addEventListener('loadedmetadata', syncDuration)
    audio.addEventListener('durationchange', syncDuration)
    audio.addEventListener('seeked', syncTime)

    syncDuration()
    syncTime()

    return () => {
      audio.removeEventListener('timeupdate', syncTime)
      audio.removeEventListener('loadedmetadata', syncDuration)
      audio.removeEventListener('durationchange', syncDuration)
      audio.removeEventListener('seeked', syncTime)
    }
  }, [currentTrack?.audioUrl, currentTrack?.duration])

  useEffect(
    () => () => {
      if (volumeHudTimerRef.current) window.clearTimeout(volumeHudTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!currentTrack?.audioUrl) {
      audio.pause()
      return
    }
    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack?.audioUrl])

  useEffect(() => {
    const handleKey = (event) => {
      const target = event.target
      const tag = target?.tagName
      if (target?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return
      }
      const increaseKeys = ['ArrowUp', '+', '=', 'AudioVolumeUp', 'VolumeUp']
      const decreaseKeys = ['ArrowDown', '-', 'AudioVolumeDown', 'VolumeDown']
      if (increaseKeys.includes(event.key)) {
        event.preventDefault()
        setVolume((prev) => {
          const next = clamp(prev + 0.05, 0, 1)
          showVolumeHud(next)
          return next
        })
        return
      }
      if (decreaseKeys.includes(event.key)) {
        event.preventDefault()
        setVolume((prev) => {
          const next = clamp(prev - 0.05, 0, 1)
          showVolumeHud(next)
          return next
        })
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showVolumeHud])

  const handlePlayQueue = useCallback(
    (nextQueue, startIndex = 0, label) => {
      const queueToPlay = nextQueue?.length ? nextQueue : tracks
      const safeIndex = Math.max(0, Math.min(startIndex, queueToPlay.length - 1))
      setQueue(queueToPlay)
      setCurrentTrackIndex(safeIndex)
      setPlaybackPosition(0)
      setIsPlaying(true)
      if (label) addToast(`Now playing ${label}`, 'success')
    },
    [addToast, tracks],
  )

  const handlePlayTrack = useCallback(
    (track, sourceQueue) => {
      const queueToPlay = sourceQueue?.length ? sourceQueue : queue
      let index = queueToPlay.findIndex(
        (item) => item.title === track.title && item.artist === track.artist,
      )
      if (index < 0) index = 0
      setQueue(queueToPlay)
      setCurrentTrackIndex(index)
      setPlaybackPosition(0)
      setIsPlaying(true)
      addToast(`Now playing "${track.title}"`, 'success')
    },
    [addToast, queue],
  )

  const handlePlayAlbum = useCallback(
    (album, sourceQueue = tracks) => {
      setActiveAlbum(album?.title ?? null)
      handlePlayQueue(sourceQueue, 0, album?.title ?? 'album')
    },
    [handlePlayQueue, tracks],
  )

  const handleTogglePlay = useCallback(() => {
    if (!queue.length) return
    if (currentTrackIndex === null) {
      setCurrentTrackIndex(0)
      setPlaybackPosition(0)
      setIsPlaying(true)
      addToast(`Now playing "${queue[0].title}"`, 'success')
      return
    }
    setIsPlaying((prev) => {
      const next = !prev
      if (next && playbackPosition >= trackDuration) setPlaybackPosition(0)
      if (next && playbackPosition >= trackDuration && audioRef.current) {
        audioRef.current.currentTime = 0
      }
      addToast(next ? 'Playback resumed' : 'Playback paused', next ? 'success' : 'info')
      return next
    })
  }, [queue, currentTrackIndex, addToast, playbackPosition, trackDuration])

  const handleNext = useCallback(() => {
    if (!queue.length) return
    const nextIndex = currentTrackIndex === null ? 0 : (currentTrackIndex + 1) % queue.length
    setCurrentTrackIndex(nextIndex)
    setIsPlaying(true)
    const nextTrack = queue[nextIndex]
    if (nextTrack) addToast(`Up next: "${nextTrack.title}"`, 'info')
  }, [queue, currentTrackIndex, addToast])

  const handlePrev = useCallback(() => {
    if (!queue.length) return
    const prevIndex =
      currentTrackIndex === null ? 0 : (currentTrackIndex - 1 + queue.length) % queue.length
    setCurrentTrackIndex(prevIndex)
    setIsPlaying(true)
    const prevTrack = queue[prevIndex]
    if (prevTrack) addToast(`Now playing "${prevTrack.title}"`, 'info')
  }, [queue, currentTrackIndex, addToast])

  const handleAddToQueue = useCallback(
    (trackToQueue) => {
      const isLikelyClickEvent =
        trackToQueue &&
        typeof trackToQueue === 'object' &&
        ('nativeEvent' in trackToQueue || 'currentTarget' in trackToQueue)

      const nextTrack = isLikelyClickEvent ? currentTrack : trackToQueue ?? currentTrack

      if (!nextTrack) {
        addToast('Select a track to add to queue', 'info')
        return
      }

      setQueue((prev) => {
        const baseQueue = prev.length ? prev : tracks
        if (!baseQueue.length) return [nextTrack]

        const insertIndex =
          currentTrackIndex === null
            ? baseQueue.length
            : Math.min(baseQueue.length, currentTrackIndex + 1)

        return [
          ...baseQueue.slice(0, insertIndex),
          nextTrack,
          ...baseQueue.slice(insertIndex),
        ]
      })

      addToast(`Queued next: "${nextTrack.title ?? 'track'}"`, 'success')
    },
    [addToast, currentTrack, currentTrackIndex, tracks],
  )

  const handleShare = useCallback(async () => {
    if (!currentTrack) {
      addToast('Select a track to share', 'info')
      return
    }
    const shareText = `${currentTrack.title} - ${currentTrack.artist}`
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareText)
        addToast('Share link copied to clipboard', 'success')
        return
      } catch (error) {
        addToast('Unable to copy share link', 'info')
        return
      }
    }
    addToast(shareText, 'info')
  }, [currentTrack, addToast])

  const handleSeek = useCallback(
    (event) => {
      const audio = audioRef.current
      const effectiveDuration =
        audio && Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : trackDuration
      if (!effectiveDuration) return
      const clientX = getClientX(event)
      if (clientX === null) return
      const bounds = event.currentTarget.getBoundingClientRect()
      const percent = clamp((clientX - bounds.left) / bounds.width, 0, 1)
      const nextValue = Math.max(0, Math.min(effectiveDuration, effectiveDuration * percent))
      if (audio) {
        audio.currentTime = nextValue
      }
      setPlaybackPosition(nextValue)
    },
    [trackDuration],
  )

  const handleVolumeChange = useCallback(
    (event) => {
      const clientX = getClientX(event)
      if (clientX === null) return
      const bounds = event.currentTarget.getBoundingClientRect()
      const percent = clamp((clientX - bounds.left) / bounds.width, 0, 1)
      setVolume(percent)
      showVolumeHud(percent)
    },
    [showVolumeHud],
  )

  return {
    activeAlbum,
    audioRef,
    currentTrack,
    handleAddToQueue,
    handleNext,
    handlePlayAlbum,
    handlePlayQueue,
    handlePlayTrack,
    handlePrev,
    handleSeek,
    handleShare,
    handleTogglePlay,
    handleVolumeChange,
    isPlaying,
    playbackDurationLabel,
    playbackTimeLabel,
    progressPercent,
    setActiveAlbum,
    tracks,
    volumeHudValue,
    volumeHudVisible,
    volumePercent,
  }
}

export { usePlaybackController }
