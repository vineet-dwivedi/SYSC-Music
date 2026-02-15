import mockData from '../../data/mockData.js'

const { albums, libraryCollections, navItems, playlistTracks, playlists, searchResults } = mockData

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 18, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -14, scale: 0.99 },
  transition: { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] },
}

const PROFILE_FALLBACK_ALBUM = { title: 'Yours Truly', artist: 'KRSNA', art: 'art-1' }

export {
  albums,
  libraryCollections,
  navItems,
  PAGE_TRANSITION,
  playlistTracks,
  playlists,
  PROFILE_FALLBACK_ALBUM,
  searchResults,
}
