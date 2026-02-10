import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppBackground from './components/AppBackground.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import HomePage from './components/pages/HomePage.jsx'
import LibraryPage from './components/pages/LibraryPage.jsx'
import PlaylistPage from './components/pages/PlaylistPage.jsx'
import ProfilePage from './components/pages/ProfilePage.jsx'
import EditProfilePage from './components/pages/EditProfilePage.jsx'
import MiniPlayer from './components/player/MiniPlayer.jsx'
import PlayerOverlay from './components/player/PlayerOverlay.jsx'
import SearchOverlay from './components/overlays/SearchOverlay.jsx'
import CreatePlaylistOverlay from './components/overlays/CreatePlaylistOverlay.jsx'
import DeletePlaylistOverlay from './components/overlays/DeletePlaylistOverlay.jsx'
import SettingsOverlay from './components/overlays/SettingsOverlay.jsx'
import IntroScreen from './components/intro/IntroScreen.jsx'
import ToastStack from './components/ToastStack.jsx'
import VolumeHud from './components/VolumeHud.jsx'
// import {
//   albums,
//   libraryCollections,
//   navItems,
//   playlistTracks,
//   playlists,
//   searchResults,
//   tracks,
// } from './data/mockData.js'
import api from './services/api.js'
import mockData from '../src/data/mockData.js'

const { albums, libraryCollections, navItems, playlistTracks, playlists, searchResults } = mockData
const parseDuration = (value) => {
  if (!value || typeof value !== 'string') return 240
  const parts = value.split(':').map((part) => Number.parseInt(part, 10))
  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 240
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

function App() {
  const [activePage, setActivePage] = useState('home')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [playerExpanded, setPlayerExpanded] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const [wipeActive, setWipeActive] = useState(false)
  const [scrollTarget, setScrollTarget] = useState(null)

  const [queue, setQueue] = useState([])
  const [tracks, setTracks] = useState([])
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeAlbum, setActiveAlbum] = useState(null)

  const [savedAlbums, setSavedAlbums] = useState([])
  const [libraryFilter, setLibraryFilter] = useState('all')
  const [playlistItems, setPlaylistItems] = useState(playlists)
  const [activePlaylist, setActivePlaylist] = useState(playlists[1] ?? playlists[0])
  const [downloadedPlaylists, setDownloadedPlaylists] = useState([])
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false)
  const [playlistDraftName, setPlaylistDraftName] = useState('')
  const [deletePlaylistName, setDeletePlaylistName] = useState(null)
  const [settings, setSettings] = useState({
    crossfade: false,
    highQuality: true,
    offlineCache: false,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [toasts, setToasts] = useState([])
  const [playbackPosition, setPlaybackPosition] = useState(0)
  const [trackDuration, setTrackDuration] = useState(parseDuration(tracks[0]?.duration))
  const [volume, setVolume] = useState(0.7)
  const [volumeHudValue, setVolumeHudValue] = useState(70)
  const [volumeHudVisible, setVolumeHudVisible] = useState(false)
  const volumeHudTimerRef = useRef(null)
  const audioRef = useRef(null)

  const savedAlbumSet = useMemo(() => new Set(savedAlbums), [savedAlbums])
  const currentTrack = currentTrackIndex === null ? null : queue[currentTrackIndex]
  const [profile, setProfile] = useState({
    name: 'Vinee K.',
    initials: 'VK',
    tagline: 'Profile',
    status: 'Listening in focus mode',
  })
  const [profileDraft, setProfileDraft] = useState(profile)
  const profileStats = useMemo(
    () => ({
      savedAlbums: savedAlbumSet.size,
      playlists: playlistItems.length,
      hours: 214,
    }),
    [savedAlbumSet, playlistItems.length],
  )
  const profileFeaturedAlbum = useMemo(
    () => albums[0] ?? { title: 'Midnight Drive', artist: 'Sable District', art: 'art-1' },
    [albums],
  )
  const progressPercent = useMemo(() => {
    if (!trackDuration) return 0
    return Math.min(100, Math.max(0, (playbackPosition / trackDuration) * 100))
  }, [playbackPosition, trackDuration])
  const playbackTimeLabel = useMemo(() => formatTime(playbackPosition), [playbackPosition])
  const playbackDurationLabel = useMemo(() => formatTime(trackDuration), [trackDuration])
  const volumePercent = useMemo(() => Math.round(volume * 100), [volume])

  const filteredSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return searchResults
    return searchResults.filter((result) => {
      return (
        result.title.toLowerCase().includes(query) ||
        result.meta.toLowerCase().includes(query)
      )
    })
  }, [searchQuery, searchResults])

  const pageTransition = useMemo(
    () => ({
      initial: { opacity: 0, y: 18, scale: 0.99 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -14, scale: 0.99 },
      transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] },
    }),
    [],
  )

  const addToast = useCallback((message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3200)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const navigate = useCallback((page, target = null) => {
    setActivePage(page)
    setScrollTarget(target)
  }, [])

  const clearScrollTarget = useCallback(() => {
    setScrollTarget(null)
  }, [])

  const handleProfileOpen = useCallback(() => {
    setActivePage('profile')
    setScrollTarget(null)
    addToast('Opening profile', 'info')
  }, [addToast])

  const showVolumeHud = useCallback((nextVolume) => {
    const percent = Math.round(nextVolume * 100)
    setVolumeHudValue(percent)
    setVolumeHudVisible(true)
    if (volumeHudTimerRef.current) {
      window.clearTimeout(volumeHudTimerRef.current)
    }
    volumeHudTimerRef.current = window.setTimeout(() => {
      setVolumeHudVisible(false)
    }, 1200)
  }, [])

  const handleEditProfileOpen = useCallback(() => {
    setProfileDraft(profile)
    setActivePage('profile-edit')
    setScrollTarget(null)
  }, [profile])

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

  useEffect(()=>{
    const fetchTracks = async ()=>{
      try {
        const res = await api.get("/tracks")
        const normalized = Array.isArray(res.data)
          ? res.data.map((track) => ({
              ...track,
              duration: Number.isFinite(track.duration) ? formatTime(track.duration) : track.duration,
            }))
          : []
        setTracks(normalized)
        setQueue(normalized)
      } catch(err){
        console.error('API failed, no tracks loaded', err)
        setTracks([])
        setQueue([])
      }
    }

    fetchTracks()
  }, [])

  useEffect(() => {
    if (!wipeActive) return
    const timer = window.setTimeout(() => setWipeActive(false), 1200)
    return () => window.clearTimeout(timer)
  }, [wipeActive])

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery('')
    }
  }, [searchOpen])

  useEffect(() => {
    if (!currentTrack) {
      setPlaybackPosition(0)
      setTrackDuration(0)
      return
    }
    setPlaybackPosition(0)
    setTrackDuration(parseDuration(currentTrack.duration))
  }, [currentTrack])

  useEffect(() => {
    if (!isPlaying || !currentTrack || !trackDuration) return
    let frameId
    let lastTime
    const tick = (time) => {
      if (lastTime === undefined) lastTime = time
      const delta = (time - lastTime) / 1000
      lastTime = time
      setPlaybackPosition((prev) => {
        const next = prev + delta
        return next >= trackDuration ? trackDuration : next
      })
      frameId = window.requestAnimationFrame(tick)
    }
    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [isPlaying, currentTrack, trackDuration])

  useEffect(() => {
    return () => {
      if (volumeHudTimerRef.current) {
        window.clearTimeout(volumeHudTimerRef.current)
      }
    }
  }, [])

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
      const key = event.key
      const increaseKeys = ['ArrowUp', '+', '=', 'AudioVolumeUp', 'VolumeUp']
      const decreaseKeys = ['ArrowDown', '-', 'AudioVolumeDown', 'VolumeDown']
      if (increaseKeys.includes(key)) {
        event.preventDefault()
        setVolume((prev) => {
          const next = clamp(prev + 0.05, 0, 1)
          showVolumeHud(next)
          return next
        })
        return
      }
      if (decreaseKeys.includes(key)) {
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

  useEffect(() => {
    const page = document.querySelector('.page')
    if (page) {
      page.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activePage])

  const handleEnter = () => {
    if (introComplete) return
    setIntroComplete(true)
    setWipeActive(true)
  }

  const handlePlayQueue = useCallback(
    (nextQueue, startIndex = 0, label) => {
      const queueToPlay = nextQueue?.length ? nextQueue : tracks
      const safeIndex = Math.max(0, Math.min(startIndex, queueToPlay.length - 1))
      setQueue(queueToPlay)
      setCurrentTrackIndex(safeIndex)
      setPlaybackPosition(0)
      setIsPlaying(true)
      if (label) {
        addToast(`Now playing ${label}`, 'success')
      }
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

  const handlePlayPlaylist = useCallback(() => {
    setActiveAlbum(null)
    handlePlayQueue(playlistTracks, 0, activePlaylist || 'playlist')
  }, [activePlaylist, handlePlayQueue, playlistTracks])

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
      if (next && playbackPosition >= trackDuration) {
        setPlaybackPosition(0)
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

  useEffect(() => {
    if (!isPlaying || !trackDuration) return
    if (playbackPosition >= trackDuration) {
      handleNext()
    }
  }, [playbackPosition, trackDuration, isPlaying, handleNext])

  const handlePrev = useCallback(() => {
    if (!queue.length) return
    const prevIndex =
      currentTrackIndex === null
        ? 0
        : (currentTrackIndex - 1 + queue.length) % queue.length
    setCurrentTrackIndex(prevIndex)
    setIsPlaying(true)
    const prevTrack = queue[prevIndex]
    if (prevTrack) addToast(`Now playing "${prevTrack.title}"`, 'info')
  }, [queue, currentTrackIndex, addToast])

  const handleToggleSaveAlbum = useCallback(
    (title) => {
      if (!title) return
      setSavedAlbums((prev) => {
        if (prev.includes(title)) {
          addToast(`Removed "${title}" from library`, 'info')
          return prev.filter((albumTitle) => albumTitle !== title)
        }
        addToast(`Saved "${title}" to library`, 'success')
        return [...prev, title]
      })
    },
    [addToast],
  )

  const handleOpenCreatePlaylist = useCallback(() => {
    setPlaylistDraftName('')
    setCreatePlaylistOpen(true)
  }, [])

  const handleCloseCreatePlaylist = useCallback(() => {
    setCreatePlaylistOpen(false)
    setPlaylistDraftName('')
  }, [])

  const handleCreatePlaylist = useCallback(() => {
    const trimmed = playlistDraftName.trim()
    if (!trimmed) {
      addToast('Enter a playlist name', 'info')
      return
    }
    const exists = playlistItems.some((item) => item.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      addToast('Playlist already exists', 'info')
      return
    }
    const nextItems = [...playlistItems, trimmed]
    setPlaylistItems(nextItems)
    setActivePlaylist(trimmed)
    setActivePage('playlist')
    setScrollTarget(null)
    setCreatePlaylistOpen(false)
    setPlaylistDraftName('')
    addToast(`Created ${trimmed}`, 'success')
  }, [playlistDraftName, playlistItems, addToast])

  const handleSelectPlaylist = useCallback(
    (name) => {
      setActivePlaylist(name)
      setActivePage('playlist')
      setScrollTarget(null)
      setActiveAlbum(null)
      addToast(`Opened "${name}"`, 'info')
    },
    [addToast],
  )

  const handleToggleDownload = useCallback(
    (name) => {
      if (!name) return
      setDownloadedPlaylists((prev) => {
        if (prev.includes(name)) {
          addToast(`Removed ${name} download`, 'info')
          return prev.filter((item) => item !== name)
        }
        addToast(`Downloading ${name}`, 'success')
        return [...prev, name]
      })
    },
    [addToast],
  )

  const handleDeletePlaylist = useCallback(
    (name) => {
      if (!name) return
      if (playlistItems.length <= 1) {
        addToast('At least one playlist must remain', 'info')
        return
      }
      const nextItems = playlistItems.filter((item) => item !== name)
      setPlaylistItems(nextItems)
      setDownloadedPlaylists((prev) => prev.filter((item) => item !== name))
      if (activePlaylist === name) {
        const nextActive = nextItems[0] ?? ''
        setActivePlaylist(nextActive)
        setActivePage(nextActive ? 'playlist' : 'home')
      }
      addToast(`Deleted "${name}"`, 'info')
    },
    [playlistItems, activePlaylist, addToast],
  )

  const handleRequestDeletePlaylist = useCallback((name) => {
    if (!name) return
    setDeletePlaylistName(name)
  }, [])

  const handleCancelDeletePlaylist = useCallback(() => {
    setDeletePlaylistName(null)
  }, [])

  const handleConfirmDeletePlaylist = useCallback(() => {
    if (!deletePlaylistName) return
    handleDeletePlaylist(deletePlaylistName)
    setDeletePlaylistName(null)
  }, [deletePlaylistName, handleDeletePlaylist])

  const handleFilterToggle = useCallback(() => {
    setLibraryFilter((prev) => {
      const next = prev === 'all' ? 'saved' : 'all'
      addToast(next === 'saved' ? 'Showing saved albums' : 'Showing all albums', 'info')
      return next
    })
  }, [addToast])

  const handleOpenCollection = useCallback(
    (collection) => {
      if (!collection) return
      setActivePlaylist(collection.title)
      setActivePage('playlist')
      setScrollTarget(null)
      setActiveAlbum(null)
      addToast(`Opened "${collection.title}"`, 'info')
    },
    [addToast],
  )

  const handleAddToQueue = useCallback(() => {
    if (!currentTrack) {
      addToast('Select a track to add to queue', 'info')
      return
    }
    setQueue((prev) => [...prev, currentTrack])
    addToast(`Added "${currentTrack.title}" to queue`, 'success')
  }, [currentTrack, addToast])

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
      if (!trackDuration) return
      const clientX = getClientX(event)
      if (clientX === null) return
      const bounds = event.currentTarget.getBoundingClientRect()
      const percent = clamp((clientX - bounds.left) / bounds.width, 0, 1)
      const nextValue = Math.max(0, Math.min(trackDuration, trackDuration * percent))
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

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
  }, [])

  const handleOpenSearchResult = useCallback(
    (result) => {
      if (!result) return
      handleSearchClose()
      const meta = result.meta.toLowerCase()
      if (meta.includes('playlist')) {
        setActivePlaylist(result.title)
        setActivePage('playlist')
        setScrollTarget(null)
        addToast(`Opened playlist "${result.title}"`, 'success')
        return
      }
      if (meta.includes('album')) {
        setActivePage('library')
        setScrollTarget('saved')
        setActiveAlbum(result.title)
        addToast(`Viewing album "${result.title}"`, 'info')
        return
      }
      setActivePage('library')
      setScrollTarget(null)
      addToast(`Showing artist "${result.title}"`, 'info')
    },
    [addToast, handleSearchClose],
  )

  const handleToggleSetting = useCallback(
    (key, label) => {
      setSettings((prev) => {
        const nextValue = !prev[key]
        addToast(`${label} ${nextValue ? 'enabled' : 'disabled'}`, 'info')
        return { ...prev, [key]: nextValue }
      })
    },
    [addToast],
  )

  const handleEditProfile = useCallback(() => {
    handleEditProfileOpen()
  }, [handleEditProfileOpen])

  const handleProfileDraftChange = useCallback((field, value) => {
    setProfileDraft((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleProfileSave = useCallback(() => {
    const name = profileDraft.name.trim()
    if (!name) {
      addToast('Name is required', 'info')
      return
    }
    const initials = (profileDraft.initials.trim() || deriveInitials(name)).toUpperCase()
    const nextProfile = {
      ...profileDraft,
      name,
      initials,
    }
    setProfile(nextProfile)
    setActivePage('profile')
    addToast('Profile updated', 'success')
  }, [profileDraft, addToast])

  const handleProfileCancel = useCallback(() => {
    setActivePage('profile')
  }, [])

  const handleViewLibrary = useCallback(() => {
    navigate('library', 'saved')
  }, [navigate])

  const handlePlayFocusMix = useCallback(() => {
    handlePlayAlbum(profileFeaturedAlbum, tracks)
  }, [handlePlayAlbum, profileFeaturedAlbum, tracks])

  const sidebarFooter = (
    <footer className="page-footer">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        activePage={activePage}
        onNavigate={navigate}
        navItems={navItems}
        playlists={playlistItems}
        activePlaylist={activePlaylist}
        onSelectPlaylist={handleSelectPlaylist}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    </footer>
  )

  const renderPage = () => {
    if (activePage === 'library') {
      return (
        <LibraryPage
          collections={libraryCollections}
          albums={albums}
          tracks={tracks}
          footer={sidebarFooter}
          onCreatePlaylist={handleOpenCreatePlaylist}
          onOpenCollection={handleOpenCollection}
          filter={libraryFilter}
          onToggleFilter={handleFilterToggle}
          savedAlbums={savedAlbumSet}
          onPlayAlbum={handlePlayAlbum}
          scrollTarget={scrollTarget}
          onClearScrollTarget={clearScrollTarget}
          activeAlbum={activeAlbum}
        />
      )
    }
    if (activePage === 'playlist') {
      return (
        <PlaylistPage
          tracks={playlistTracks}
          footer={sidebarFooter}
          playlistName={activePlaylist}
          isDownloaded={downloadedPlaylists.includes(activePlaylist)}
          onPlayPlaylist={handlePlayPlaylist}
          onToggleDownload={() => handleToggleDownload(activePlaylist)}
          onDeletePlaylist={() => handleRequestDeletePlaylist(activePlaylist)}
          canDelete={playlistItems.length > 1}
          onPlayTrack={(track) => handlePlayTrack(track, playlistTracks)}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          playbackProgress={progressPercent}
        />
      )
    }
    if (activePage === 'profile') {
      return (
        <ProfilePage
          footer={sidebarFooter}
          user={profile}
          stats={profileStats}
          featuredAlbum={profileFeaturedAlbum}
          onEditProfile={handleEditProfile}
          onOpenSettings={() => setSettingsOpen(true)}
          onViewLibrary={handleViewLibrary}
          onPlayFocus={handlePlayFocusMix}
        />
      )
    }
    if (activePage === 'profile-edit') {
      return (
        <EditProfilePage
          footer={sidebarFooter}
          draft={profileDraft}
          onChange={handleProfileDraftChange}
          onSave={handleProfileSave}
          onCancel={handleProfileCancel}
        />
      )
    }
    return (
      <HomePage
        albums={albums}
        tracks={tracks}
        footer={sidebarFooter}
        onPlayAlbum={handlePlayAlbum}
        onToggleSaveAlbum={handleToggleSaveAlbum}
        savedAlbums={savedAlbumSet}
        onNavigate={navigate}
        onPlayTrack={(track) => handlePlayTrack(track, tracks)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        activeAlbum={activeAlbum}
        playbackProgress={progressPercent}
      />
    )
  }

  return (
    <AnimatePresence mode="wait">
      {introComplete ? (
        <motion.div
          key="app"
          className="app-shell"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="app">
            <AppBackground />

            <main className="main">
              <Topbar
                onSearchOpen={() => setSearchOpen(true)}
                onNavigate={navigate}
                onProfileOpen={handleProfileOpen}
                profile={profile}
              />

              <div className="page-stack">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePage}
                    className="page-motion"
                    initial={pageTransition.initial}
                    animate={pageTransition.animate}
                    exit={pageTransition.exit}
                    transition={pageTransition.transition}
                  >
                    {renderPage()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            <MiniPlayer
              isHidden={playerExpanded}
              onExpand={() => setPlayerExpanded(true)}
              track={currentTrack}
              isPlaying={isPlaying}
              onPlayToggle={handleTogglePlay}
              onNext={handleNext}
              onPrev={handlePrev}
              progress={progressPercent}
              onSeek={handleSeek}
              volumePercent={volumePercent}
              onVolumeChange={handleVolumeChange}
            />
            <audio
              ref={audioRef}
              src={currentTrack?.audioUrl ?? ''}
              preload="metadata"
              onEnded={handleNext}
            />

            <PlayerOverlay
              isOpen={playerExpanded}
              onClose={() => setPlayerExpanded(false)}
              track={currentTrack}
              isPlaying={isPlaying}
              onPlayToggle={handleTogglePlay}
              onNext={handleNext}
              onPrev={handlePrev}
              onAddToQueue={handleAddToQueue}
              onShare={handleShare}
              progress={progressPercent}
              currentTimeLabel={playbackTimeLabel}
              durationLabel={playbackDurationLabel}
              onSeek={handleSeek}
              volumePercent={volumePercent}
              onVolumeChange={handleVolumeChange}
            />
            <SearchOverlay
              isOpen={searchOpen}
              onClose={handleSearchClose}
              results={filteredSearchResults}
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onOpenResult={handleOpenSearchResult}
            />
            <CreatePlaylistOverlay
              isOpen={createPlaylistOpen}
              name={playlistDraftName}
              onNameChange={setPlaylistDraftName}
              onClose={handleCloseCreatePlaylist}
              onCreate={handleCreatePlaylist}
            />
            <DeletePlaylistOverlay
              isOpen={Boolean(deletePlaylistName)}
              playlistName={deletePlaylistName}
              onCancel={handleCancelDeletePlaylist}
              onConfirm={handleConfirmDeletePlaylist}
            />
            <SettingsOverlay
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              settings={settings}
              onToggleSetting={handleToggleSetting}
            />
          </div>
          <ToastStack toasts={toasts} onDismiss={dismissToast} />
          <VolumeHud value={volumeHudValue} isVisible={volumeHudVisible} />
          <AnimatePresence>
            {wipeActive ? (
              <motion.div
                key="wipe"
                className="lens-wipe"
                initial={{ scaleX: 0, opacity: 0.9 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
                style={{ originX: 0 }}
              >
                <div className="lens-wipe__beam" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : (
        <IntroScreen key="intro" onEnter={handleEnter} />
      )}
    </AnimatePresence>
  )
}

export default App
