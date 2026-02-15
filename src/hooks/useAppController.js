import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  albums,
  libraryCollections,
  navItems,
  PAGE_TRANSITION,
  PROFILE_FALLBACK_ALBUM,
} from './app/constants.js'
import { useLibraryController } from './app/useLibraryController.js'
import { usePlaybackController } from './app/usePlaybackController.js'
import { useProfileController } from './app/useProfileController.js'
import { useToastManager } from './app/useToastManager.js'

const normalizeText = (value) => String(value ?? '').trim().toLowerCase()
const resolveImageUrl = (value) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed
  }
  return ''
}

function useAppController() {
  const [activePage, setActivePage] = useState('home')
  const [activeArtist, setActiveArtist] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [playerExpanded, setPlayerExpanded] = useState(false)
  const [introComplete, setIntroComplete] = useState(false)
  const [wipeActive, setWipeActive] = useState(false)
  const [scrollTarget, setScrollTarget] = useState(null)
  const [settings, setSettings] = useState({
    crossfade: false,
    highQuality: true,
    offlineCache: false,
  })
  const [searchQuery, setSearchQuery] = useState('')

  const { addToast, dismissToast, toasts } = useToastManager()

  const playback = usePlaybackController({ addToast })
  const library = useLibraryController({
    addToast,
    availableTracks: playback.tracks,
    setActiveAlbum: playback.setActiveAlbum,
    setActivePage,
    setScrollTarget,
  })
  const profileController = useProfileController({
    addToast,
    setActivePage,
    setScrollTarget,
  })

  const {
    activeAlbum,
    audioRef,
    currentTrack,
    handleAddToQueue,
    handleNext,
    handlePlayAlbum: playAlbumInternal,
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
  } = playback

  const {
    activePlaylist,
    activePlaylistTracks,
    createPlaylistTrackOptions,
    createPlaylistOpen,
    deletePlaylistName,
    downloadedPlaylists,
    handleCancelDeletePlaylist,
    handleCloseCreatePlaylist,
    handleConfirmDeletePlaylist,
    handleCreatePlaylist,
    handleToggleCreatePlaylistTrack,
    handleFilterToggle,
    handleOpenCollection,
    handleOpenCreatePlaylist,
    handleRequestDeletePlaylist,
    handleSelectPlaylist,
    handleToggleDownload,
    handleToggleSaveAlbum,
    libraryFilter,
    playlistDraftName,
    playlistItems,
    savedAlbumSet,
    selectedTrackIds,
    setActivePlaylist,
    setPlaylistDraftName,
  } = library

  const {
    handleEditProfileOpen,
    handleProfileCancel,
    handleProfileDraftChange,
    handleProfileOpen,
    handleProfileSave,
    profile,
    profileDraft,
  } = profileController

  const navigate = useCallback((page, target = null) => {
    setActivePage(page)
    setScrollTarget(target)
  }, [])

  const clearScrollTarget = useCallback(() => {
    setScrollTarget(null)
  }, [])

  const profileStats = useMemo(
    () => ({
      savedAlbums: savedAlbumSet.size,
      playlists: playlistItems.length,
      hours: 214,
    }),
    [savedAlbumSet, playlistItems.length],
  )

  const profileFeaturedAlbum = useMemo(() => albums[0] ?? PROFILE_FALLBACK_ALBUM, [])
  const getAlbumTracks = useCallback(
    (albumTitle, sourceTracks = tracks) => {
      const target = normalizeText(albumTitle)
      if (!target) return []
      return sourceTracks.filter((track) => normalizeText(track.album) === target)
    },
    [tracks],
  )
  const activeAlbumTracks = useMemo(() => getAlbumTracks(activeAlbum, tracks), [activeAlbum, getAlbumTracks, tracks])
  const activeAlbumArtist = useMemo(() => activeAlbumTracks[0]?.artist ?? '', [activeAlbumTracks])
  const activeAlbumImage = useMemo(() => {
    const selectedAlbum = albums.find((album) => normalizeText(album?.title) === normalizeText(activeAlbum))
    const albumImage = resolveImageUrl(selectedAlbum?.coverImage) || resolveImageUrl(selectedAlbum?.art)
    if (albumImage) return albumImage
    const trackImage = activeAlbumTracks.find((track) => resolveImageUrl(track?.coverImage))
    return trackImage ? resolveImageUrl(trackImage.coverImage) : ''
  }, [activeAlbum, activeAlbumTracks, albums])
  const currentTrackImage = useMemo(() => {
    const directImage = resolveImageUrl(currentTrack?.coverImage ?? currentTrack?.cover)
    if (directImage) return directImage
    const albumName = currentTrack?.album
    if (albumName) {
      const selectedAlbum = albums.find(
        (album) => normalizeText(album?.title) === normalizeText(albumName),
      )
      const albumImage = resolveImageUrl(selectedAlbum?.coverImage) || resolveImageUrl(selectedAlbum?.art)
      if (albumImage) return albumImage
    }
    return ''
  }, [albums, currentTrack])
  const getArtistTracks = useCallback(
    (artistName, sourceTracks = tracks) => {
      const target = normalizeText(artistName)
      if (!target) return []
      return sourceTracks.filter((track) => normalizeText(track.artist) === target)
    },
    [tracks],
  )
  const activeArtistTracks = useMemo(
    () => getArtistTracks(activeArtist, tracks),
    [activeArtist, getArtistTracks, tracks],
  )

  const filteredSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    return tracks
      .filter((track) => (track?.title ?? '').toLowerCase().includes(query))
      .map((track, index) => ({
        id: track?.id ?? track?._id ?? `${track?.title ?? 'track'}-${index}`,
        title: track?.title ?? 'Untitled',
        meta: track?.artist ?? 'Unknown Artist',
        coverImage: resolveImageUrl(track?.coverImage ?? track?.cover),
        track,
      }))
  }, [searchQuery, tracks])

  useEffect(() => {
    if (!wipeActive) return
    const timer = window.setTimeout(() => setWipeActive(false), 1200)
    return () => window.clearTimeout(timer)
  }, [wipeActive])

  useEffect(() => {
    if (!searchOpen) setSearchQuery('')
  }, [searchOpen])

  useEffect(() => {
    const page = document.querySelector('.page')
    if (page) page.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activePage])

  const handleEnter = useCallback(() => {
    if (introComplete) return
    setIntroComplete(true)
    setWipeActive(true)
  }, [introComplete])

  const handleOpenAlbum = useCallback(
    (album) => {
      if (!album?.title) return
      setActiveAlbum(album.title)
      setActiveArtist('')
      setActivePage('album')
      setScrollTarget(null)
    },
    [setActiveAlbum],
  )

  const handleOpenArtist = useCallback((artistName) => {
    if (!artistName) return
    setActiveArtist(artistName)
    setActiveAlbum(null)
    setActivePage('artist')
    setScrollTarget(null)
  }, [setActiveAlbum])

  const handlePlayAlbum = useCallback(
    (album, sourceTracks = tracks) => {
      const fromSource = getAlbumTracks(album?.title, sourceTracks)
      const fromAllTracks = getAlbumTracks(album?.title, tracks)
      const queue = fromSource.length ? fromSource : fromAllTracks.length ? fromAllTracks : sourceTracks
      playAlbumInternal(album, queue)
    },
    [getAlbumTracks, playAlbumInternal, tracks],
  )

  const handlePlayPlaylist = useCallback(() => {
    if (!activePlaylist || !activePlaylistTracks.length) {
      addToast('Playlist has no songs yet', 'info')
      return
    }
    setActiveAlbum(null)
    handlePlayQueue(activePlaylistTracks, 0, activePlaylist || 'playlist')
  }, [activePlaylist, activePlaylistTracks, addToast, handlePlayQueue, setActiveAlbum])

  const handlePlayCurrentAlbum = useCallback(() => {
    if (!activeAlbum) return
    handlePlayAlbum({ title: activeAlbum, artist: activeAlbumArtist }, activeAlbumTracks)
  }, [activeAlbum, activeAlbumArtist, activeAlbumTracks, handlePlayAlbum])

  const handlePlayArtist = useCallback(() => {
    if (!activeArtistTracks.length) return
    setActiveAlbum(null)
    handlePlayQueue(activeArtistTracks, 0, activeArtist || 'artist')
  }, [activeArtist, activeArtistTracks, handlePlayQueue, setActiveAlbum])

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
  }, [])

  const handleOpenSearchResult = useCallback(
    (result) => {
      if (!result?.track) return
      handleSearchClose()
      setActivePage('home')
      setScrollTarget(null)
      setActiveAlbum(null)
      setActiveArtist('')
      handlePlayTrack(result.track, tracks)
    },
    [handleSearchClose, handlePlayTrack, tracks, setActiveAlbum, setActiveArtist],
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

  const handleViewLibrary = useCallback(() => {
    navigate('library', 'saved')
  }, [navigate])

  const handlePlayFocusMix = useCallback(() => {
    handlePlayAlbum(profileFeaturedAlbum, tracks)
  }, [handlePlayAlbum, profileFeaturedAlbum, tracks])

  return {
    albums,
    libraryCollections,
    navItems,
    playlistTracks: activePlaylistTracks,
    pageTransition: PAGE_TRANSITION,
    activePage,
    sidebarCollapsed,
    searchOpen,
    settingsOpen,
    playerExpanded,
    introComplete,
    wipeActive,
    scrollTarget,
    tracks,
    currentTrack,
    isPlaying,
    activeAlbum,
    activeArtist,
    activeAlbumTracks,
    activeAlbumArtist,
    activeAlbumImage,
    currentTrackImage,
    activeArtistTracks,
    savedAlbumSet,
    libraryFilter,
    playlistItems,
    activePlaylist,
    downloadedPlaylists,
    createPlaylistOpen,
    createPlaylistTrackOptions,
    playlistDraftName,
    selectedTrackIds,
    deletePlaylistName,
    settings,
    searchQuery,
    toasts,
    progressPercent,
    playbackTimeLabel,
    playbackDurationLabel,
    volumePercent,
    volumeHudValue,
    volumeHudVisible,
    profile,
    profileDraft,
    profileStats,
    profileFeaturedAlbum,
    filteredSearchResults,
    audioRef,
    setSidebarCollapsed,
    setSearchOpen,
    setSettingsOpen,
    setPlayerExpanded,
    setSearchQuery,
    setPlaylistDraftName,
    navigate,
    clearScrollTarget,
    dismissToast,
    handleEnter,
    handleProfileOpen,
    handlePlayAlbum,
    handleOpenAlbum,
    handleOpenArtist,
    handlePlayCurrentAlbum,
    handlePlayArtist,
    handlePlayTrack,
    handlePlayPlaylist,
    handleTogglePlay,
    handleNext,
    handlePrev,
    handleSeek,
    handleVolumeChange,
    handleOpenCreatePlaylist,
    handleCloseCreatePlaylist,
    handleCreatePlaylist,
    handleToggleCreatePlaylistTrack,
    handleRequestDeletePlaylist,
    handleCancelDeletePlaylist,
    handleConfirmDeletePlaylist,
    handleToggleDownload,
    handleToggleSaveAlbum,
    handleOpenCollection,
    handleFilterToggle,
    handleSelectPlaylist,
    handleEditProfileOpen,
    handleProfileDraftChange,
    handleProfileSave,
    handleProfileCancel,
    handleViewLibrary,
    handlePlayFocusMix,
    handleSearchClose,
    handleOpenSearchResult,
    handleToggleSetting,
    handleAddToQueue,
    handleShare,
  }
}

export { useAppController }
