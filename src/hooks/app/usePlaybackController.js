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

const LOOP_MODE_OFF = 'off'
const LOOP_MODE_ALL = 'all'
const LOOP_MODE_ONE = 'one'

const getRandomQueueIndex = (length, currentIndex) => {
  if (length <= 1) return currentIndex ?? 0

  let nextIndex = currentIndex ?? Math.floor(Math.random() * length)
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length)
  }

  return nextIndex
}

function usePlaybackController({ addToast }) {
  const [queue, setQueue] = useState([])
  const [tracks, setTracks] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false)
  const [loopMode, setLoopMode] = useState(LOOP_MODE_ALL)
  const [activeAlbum, setActiveAlbum] = useState(null)
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [trackDuration, setTrackDuration] = useState(parseDuration(tracks[0]?.duration))
  const [volume, setVolume] = useState(0.7)
  const [volumeHudValue, setVolumeHudValue] = useState(70)
  const [volumeHudVisible, setVolumeHudVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
    let isCancelled = false

    const fetchTracks = async () => {
      try {
        setIsLoading(true)
        const res = await getWithFallback('/tracks')
        const normalized = normalizeTracks(res.data)
        if (isCancelled) return

        setTracks(normalized)
        setQueue(normalized)
        setIsLoading(false)

        hydrateTrackDurations(normalized)
          .then((enriched) => {
            if (isCancelled) return
            const durationMap = new Map(
              enriched.map((track) => [trackIdentity(track), track.duration]),
            )
            setTracks((prev) => mergeDurationMap(prev, durationMap))
            setQueue((prev) => mergeDurationMap(prev, durationMap))
          })
          .catch((err) => {
            console.warn('Duration hydration skipped:', err)
          })
      } catch (err) {
        if (isCancelled) return
        const activeBase = api.defaults.baseURL ?? 'unknown'
        console.error(`API failed (base: ${activeBase})`, err)
        setTracks([])
        setQueue([])
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }
    fetchTracks()

    return () => {
      isCancelled = true
    }
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

  const resolveNextIndex = useCallback(
    (reason = 'manual') => {
      if (!queue.length) return null

      const activeIndex = currentTrackIndex ?? 0

      if (reason === 'ended' && loopMode === LOOP_MODE_ONE) {
        return activeIndex
      }

      if (isShuffleEnabled) {
        if (queue.length === 1) {
          return loopMode === LOOP_MODE_OFF ? null : 0
        }

        return getRandomQueueIndex(queue.length, currentTrackIndex)
      }

      if (currentTrackIndex === null) return 0
      if (currentTrackIndex < queue.length - 1) return currentTrackIndex + 1
      if (loopMode === LOOP_MODE_ALL) return 0

      return null
    },
    [queue.length, currentTrackIndex, isShuffleEnabled, loopMode],
  )

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
      const startIndex = isShuffleEnabled ? getRandomQueueIndex(queue.length, null) : 0
      setCurrentTrackIndex(startIndex)
      setPlaybackPosition(0)
      setIsPlaying(true)
      addToast(`Now playing "${queue[startIndex].title}"`, 'success')
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
  }, [queue, currentTrackIndex, addToast, isShuffleEnabled, playbackPosition, trackDuration])

  const handleNext = useCallback(() => {
    if (!queue.length) return
    const nextIndex = resolveNextIndex('manual')
    if (nextIndex === null) {
      addToast('Reached end of queue', 'info')
      return
    }

    if (nextIndex === currentTrackIndex) {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
    }

    setCurrentTrackIndex(nextIndex)
    setPlaybackPosition(0)
    setIsPlaying(true)
    const nextTrack = queue[nextIndex]
    if (nextTrack) addToast(`Up next: "${nextTrack.title}"`, 'info')
  }, [queue, currentTrackIndex, addToast, resolveNextIndex])

  const handlePrev = useCallback(() => {
    if (!queue.length) return

    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setPlaybackPosition(0)
      return
    }

    let prevIndex = 0
    if (currentTrackIndex === null) {
      prevIndex = 0
    } else if (currentTrackIndex > 0) {
      prevIndex = currentTrackIndex - 1
    } else if (loopMode === LOOP_MODE_ALL) {
      prevIndex = queue.length - 1
    } else {
      setPlaybackPosition(0)
      if (audio) audio.currentTime = 0
      addToast('At the start of queue', 'info')
      return
    }

    setCurrentTrackIndex(prevIndex)
    setPlaybackPosition(0)
    setIsPlaying(true)
    const prevTrack = queue[prevIndex]
    if (prevTrack) addToast(`Now playing "${prevTrack.title}"`, 'info')
  }, [queue, currentTrackIndex, loopMode, addToast])

  const handleToggleShuffle = useCallback(() => {
    setIsShuffleEnabled((prev) => {
      const next = !prev
      addToast(`Shuffle ${next ? 'enabled' : 'disabled'}`, 'info')
      return next
    })
  }, [addToast])

  const handleCycleLoopMode = useCallback(() => {
    setLoopMode((prev) => {
      let next = LOOP_MODE_OFF
      if (prev === LOOP_MODE_OFF) next = LOOP_MODE_ALL
      else if (prev === LOOP_MODE_ALL) next = LOOP_MODE_ONE

      let label = 'Loop disabled'
      if (next === LOOP_MODE_ALL) label = 'Loop queue enabled'
      else if (next === LOOP_MODE_ONE) label = 'Loop current track enabled'

      addToast(label, 'info')
      return next
    })
  }, [addToast])

  const handleTrackEnd = useCallback(() => {
    if (!queue.length) return

    const nextIndex = resolveNextIndex('ended')
    if (nextIndex === null) {
      setIsPlaying(false)
      setPlaybackPosition(trackDuration)
      addToast('Reached end of queue', 'info')
      return
    }

    if (nextIndex === currentTrackIndex) {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      }
      setPlaybackPosition(0)
      setIsPlaying(true)
      return
    }

    setCurrentTrackIndex(nextIndex)
    setPlaybackPosition(0)
    setIsPlaying(true)
  }, [queue.length, currentTrackIndex, resolveNextIndex, trackDuration, addToast])

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
    handleCycleLoopMode,
    handleNext,
    handlePlayAlbum,
    handlePlayQueue,
    handlePlayTrack,
    handlePrev,
    handleSeek,
    handleShare,
    handleToggleShuffle,
    handleTogglePlay,
    handleTrackEnd,
    handleVolumeChange,
    isLoading,
    isPlaying,
    isShuffleEnabled,
    loopMode,
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
