import { useCallback, useEffect, useMemo, useState } from 'react'
import { hydrateTrackDurations, normalizeTracks } from './utils.js'

const PLAYLISTS_STORAGE_KEY = 'sysc.playlists.v1'
const ACTIVE_PLAYLIST_STORAGE_KEY = 'sysc.activePlaylist.v1'

const normalizePlaylist = (playlist, index = 0) => ({
  id: playlist?.id ?? playlist?._id ?? `playlist-${index}`,
  name: playlist?.name ?? `Playlist ${index + 1}`,
  coverImage: playlist?.coverImage ?? '',
  description: playlist?.description ?? '',
  movieTitle: playlist?.movieTitle ?? '',
  trackIds: Array.isArray(playlist?.trackIds)
    ? playlist.trackIds.map((id) => String(id)).filter(Boolean)
    : [],
})

const resolveTrackId = (track) => {
  const raw = track?.id ?? track?._id ?? null
  return raw === null || raw === undefined ? null : String(raw)
}

const getStorage = () => (typeof window !== 'undefined' ? window.localStorage : null)

const loadPlaylistsFromStorage = () => {
  const storage = getStorage()
  if (!storage) return []
  try {
    const raw = storage.getItem(PLAYLISTS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(normalizePlaylist) : []
  } catch (error) {
    console.error('Failed to read playlists from local storage', error)
    return []
  }
}

const savePlaylistsToStorage = (playlists) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists))
  } catch (error) {
    console.error('Failed to save playlists to local storage', error)
  }
}

const loadActivePlaylistFromStorage = () => {
  const storage = getStorage()
  if (!storage) return ''
  return storage.getItem(ACTIVE_PLAYLIST_STORAGE_KEY) ?? ''
}

const saveActivePlaylistToStorage = (playlistName) => {
  const storage = getStorage()
  if (!storage) return
  if (playlistName) {
    storage.setItem(ACTIVE_PLAYLIST_STORAGE_KEY, playlistName)
  } else {
    storage.removeItem(ACTIVE_PLAYLIST_STORAGE_KEY)
  }
}

function useLibraryController({
  addToast,
  availableTracks = [],
  setActiveAlbum,
  setActivePage,
  setScrollTarget,
}) {
  const [savedAlbums, setSavedAlbums] = useState([])
  const [libraryFilter, setLibraryFilter] = useState('all')
  const [playlistItems, setPlaylistItems] = useState(() => loadPlaylistsFromStorage())
  const [activePlaylist, setActivePlaylist] = useState(() => loadActivePlaylistFromStorage())
  const [activePlaylistTracks, setActivePlaylistTracks] = useState([])
  const [downloadedPlaylists, setDownloadedPlaylists] = useState([])
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false)
  const [playlistDraftName, setPlaylistDraftName] = useState('')
  const [selectedTrackIds, setSelectedTrackIds] = useState([])
  const [deletePlaylistName, setDeletePlaylistName] = useState(null)

  const savedAlbumSet = useMemo(() => new Set(savedAlbums), [savedAlbums])
  const playlistByName = useMemo(
    () => new Map(playlistItems.map((playlist) => [playlist.name, playlist])),
    [playlistItems],
  )
  const activePlaylistItem = useMemo(
    () => playlistByName.get(activePlaylist) ?? null,
    [activePlaylist, playlistByName],
  )
  const playlistCandidateTracks = useMemo(
    () => availableTracks.filter((track) => Boolean(resolveTrackId(track))),
    [availableTracks],
  )

  useEffect(() => {
    savePlaylistsToStorage(playlistItems)
  }, [playlistItems])

  useEffect(() => {
    setActivePlaylist((prev) => {
      if (prev && playlistItems.some((item) => item.name === prev)) return prev
      return playlistItems[0]?.name ?? ''
    })
  }, [playlistItems])

  useEffect(() => {
    saveActivePlaylistToStorage(activePlaylist)
  }, [activePlaylist])

  useEffect(() => {
    if (!activePlaylistItem) {
      setActivePlaylistTracks([])
      return
    }

    const tracksById = new Map()
    availableTracks.forEach((track) => {
      const id = resolveTrackId(track)
      if (id) tracksById.set(id, track)
    })

    const orderedTracks = (activePlaylistItem.trackIds ?? [])
      .map((trackId) => tracksById.get(String(trackId)))
      .filter(Boolean)
    const normalized = normalizeTracks(orderedTracks)
    setActivePlaylistTracks(normalized)

    let isCancelled = false
    const enrich = async () => {
      const enriched = await hydrateTrackDurations(normalized)
      if (!isCancelled) setActivePlaylistTracks(enriched)
    }
    enrich()
    return () => {
      isCancelled = true
    }
  }, [activePlaylistItem, availableTracks])

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
    setSelectedTrackIds([])
    setCreatePlaylistOpen(true)
  }, [])

  const handleCloseCreatePlaylist = useCallback(() => {
    setCreatePlaylistOpen(false)
    setPlaylistDraftName('')
    setSelectedTrackIds([])
  }, [])

  const handleToggleCreatePlaylistTrack = useCallback((trackId) => {
    if (!trackId) return
    const normalizedTrackId = String(trackId)
    setSelectedTrackIds((prev) =>
      prev.includes(normalizedTrackId)
        ? prev.filter((id) => id !== normalizedTrackId)
        : [...prev, normalizedTrackId],
    )
  }, [])

  const handleCreatePlaylist = useCallback(() => {
    const trimmed = playlistDraftName.trim()
    if (!trimmed) {
      addToast('Enter a playlist name', 'info')
      return
    }
    const exists = playlistItems.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      addToast('Playlist already exists', 'info')
      return
    }
    const created = normalizePlaylist(
      {
        id: `playlist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: trimmed,
        trackIds: selectedTrackIds,
      },
      playlistItems.length,
    )
    setPlaylistItems((prev) => [...prev, created])
    setActivePlaylist(created.name)
    if (!selectedTrackIds.length) setActivePlaylistTracks([])
    setActivePage('playlist')
    setScrollTarget(null)
    setCreatePlaylistOpen(false)
    setPlaylistDraftName('')
    setSelectedTrackIds([])
    addToast(`Created ${trimmed}`, 'success')
  }, [
    addToast,
    playlistDraftName,
    playlistItems,
    selectedTrackIds,
    setActivePage,
    setScrollTarget,
  ])

  const handleSelectPlaylist = useCallback(
    (name) => {
      if (!name) return
      setActivePlaylist(name)
      setActivePage('playlist')
      setScrollTarget(null)
      setActiveAlbum(null)
      addToast(`Opened "${name}"`, 'info')
    },
    [addToast, setActiveAlbum, setActivePage, setScrollTarget],
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
      const playlistToDelete = playlistByName.get(name)
      if (!playlistToDelete) return

      const nextPlaylists = playlistItems.filter((item) => item.name !== name)
      setPlaylistItems(nextPlaylists)
      setDownloadedPlaylists((prev) => prev.filter((item) => item !== name))

      if (activePlaylist === name) {
        const fallbackPlaylist = nextPlaylists[0]?.name ?? ''
        setActivePlaylist(fallbackPlaylist)
        if (!fallbackPlaylist) {
          setActivePlaylistTracks([])
          setActivePage('home')
        } else {
          setActivePage('playlist')
        }
      }

      addToast(`Deleted "${name}"`, 'info')
    },
    [activePlaylist, addToast, playlistByName, playlistItems, setActivePage],
  )

  const handleRequestDeletePlaylist = useCallback((name) => {
    if (name) setDeletePlaylistName(name)
  }, [])

  const handleCancelDeletePlaylist = useCallback(() => {
    setDeletePlaylistName(null)
  }, [])

  const handleConfirmDeletePlaylist = useCallback(async () => {
    if (!deletePlaylistName) return
    await handleDeletePlaylist(deletePlaylistName)
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
      setActivePage('library')
      setScrollTarget(null)
      setActiveAlbum(null)
      addToast(`Collection "${collection.title}" opened`, 'info')
    },
    [addToast, setActiveAlbum, setActivePage, setScrollTarget],
  )

  return {
    activePlaylist,
    activePlaylistTracks,
    createPlaylistTrackOptions: playlistCandidateTracks,
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
  }
}

export { useLibraryController }
