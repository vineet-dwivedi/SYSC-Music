import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../../services/api.js'
import { hydrateTrackDurations, normalizeTracks } from './utils.js'

const normalizePlaylist = (playlist, index = 0) => ({
  id: playlist?.id ?? playlist?._id ?? `playlist-${index}`,
  name: playlist?.name ?? `Playlist ${index + 1}`,
  coverImage: playlist?.coverImage ?? '',
  description: playlist?.description ?? '',
  movieTitle: playlist?.movieTitle ?? '',
})

const resolveTrackId = (track) => track?.id ?? track?._id ?? null

function useLibraryController({
  addToast,
  availableTracks = [],
  setActiveAlbum,
  setActivePage,
  setScrollTarget,
}) {
  const [savedAlbums, setSavedAlbums] = useState([])
  const [libraryFilter, setLibraryFilter] = useState('all')
  const [playlistItems, setPlaylistItems] = useState([])
  const [activePlaylist, setActivePlaylist] = useState('')
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

  const fetchPlaylists = useCallback(async (preferredName = null) => {
    try {
      const res = await api.get('/playlists')
      const list = Array.isArray(res.data) ? res.data.map(normalizePlaylist) : []
      setPlaylistItems(list)
      setActivePlaylist((prev) => {
        const targetName = typeof preferredName === 'string' ? preferredName : prev
        if (targetName && list.some((item) => item.name === targetName)) return targetName
        return list[0]?.name ?? ''
      })
      return list
    } catch (error) {
      console.error('Failed to fetch playlists', error)
      setPlaylistItems([])
      setActivePlaylist('')
      return []
    }
  }, [])

  useEffect(() => {
    fetchPlaylists()
  }, [fetchPlaylists])

  useEffect(() => {
    if (!activePlaylistItem?.id) {
      setActivePlaylistTracks([])
      return
    }

    const fetchPlaylistTracks = async () => {
      try {
        const res = await api.get(`/playlists/${activePlaylistItem.id}/tracks`)
        const normalized = normalizeTracks(res.data?.tracks ?? [])
        setActivePlaylistTracks(normalized)
        const enriched = await hydrateTrackDurations(normalized)
        setActivePlaylistTracks(enriched)
      } catch (error) {
        console.error('Failed to fetch playlist tracks', error)
        setActivePlaylistTracks([])
      }
    }
    fetchPlaylistTracks()
  }, [activePlaylistItem])

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
    setSelectedTrackIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId],
    )
  }, [])

  const handleCreatePlaylist = useCallback(async () => {
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

    try {
      const createRes = await api.post('/playlists', { name: trimmed })
      const created = normalizePlaylist(createRes.data, playlistItems.length)
      const createdId = createRes.data?.id ?? createRes.data?._id ?? created.id ?? null

      if (createdId && selectedTrackIds.length > 0) {
        try {
          await api.post(`/playlists/${createdId}/tracks`, {
            trackIds: selectedTrackIds,
          })
        } catch (assignError) {
          console.error('Failed to assign tracks to playlist', assignError)
          addToast('Playlist created, but adding songs failed', 'info')
        }
      }

      await fetchPlaylists(created.name)
      if (!selectedTrackIds.length) setActivePlaylistTracks([])
      setActivePage('playlist')
      setScrollTarget(null)
      setCreatePlaylistOpen(false)
      setPlaylistDraftName('')
      setSelectedTrackIds([])
      addToast(`Created ${trimmed}`, 'success')
    } catch (error) {
      console.error('Unable to create playlist on server', error)
      addToast('Unable to create playlist on server', 'info')
    }
  }, [
    addToast,
    fetchPlaylists,
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
    async (name) => {
      if (!name) return
      const playlistToDelete = playlistByName.get(name)
      if (!playlistToDelete) return

      try {
        if (playlistToDelete.id) {
          await api.delete(`/playlists/${playlistToDelete.id}`)
        }
      } catch (error) {
        console.error('Unable to delete playlist from server', error)
        addToast('Unable to delete playlist from server', 'info')
        return
      }
      setDownloadedPlaylists((prev) => prev.filter((item) => item !== name))
      const refreshed = await fetchPlaylists(activePlaylist === name ? null : activePlaylist)
      if (!refreshed.length) {
        setActivePlaylistTracks([])
        setActivePage('home')
      } else if (activePlaylist === name) {
        setActivePage('playlist')
      }

      addToast(`Deleted "${name}"`, 'info')
    },
    [activePlaylist, addToast, fetchPlaylists, playlistByName, setActivePage],
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
