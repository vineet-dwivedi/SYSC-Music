import { useEffect, useMemo, useRef } from 'react'
import AlbumCard from '../ui/AlbumCard.jsx'

function LibraryPage({
  collections,
  albums,
  tracks,
  footer,
  onCreatePlaylist,
  onOpenCollection,
  filter,
  onToggleFilter,
  savedAlbums,
  onPlayAlbum,
  scrollTarget,
  onClearScrollTarget,
  activeAlbum,
}) {
  const savedSectionRef = useRef(null)

  useEffect(() => {
    if (scrollTarget === 'saved' && savedSectionRef.current) {
      savedSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      onClearScrollTarget()
    }
  }, [scrollTarget, onClearScrollTarget])

  const filteredAlbums = useMemo(() => {
    if (filter === 'saved') {
      return albums.filter((album) => savedAlbums.has(album.title))
    }
    return albums.slice(0, 4)
  }, [albums, filter, savedAlbums])

  return (
    <section className="page page--library">
      <div className="page__header glass-panel">
        <div>
          <p className="eyebrow">Your library</p>
          <h2>Curated collections</h2>
          <p className="page__subtitle">
            Minimal, cinematic playlists organized for uninterrupted flow.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onCreatePlaylist}>
          Create playlist
        </button>
      </div>

      <div className="library-grid">
        {collections.map((item) => (
          <article key={item.title} className="library-card glass-panel">
            <div className={`art ${item.art}`} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.tracks}</p>
            </div>
            <button className="library-card__button" type="button" onClick={() => onOpenCollection(item)}>
              Open
            </button>
          </article>
        ))}
      </div>

      <div className="section" ref={savedSectionRef}>
        <div className="section__head">
          <h2>Saved albums</h2>
          <div className="section__meta">
            <span className="section__status">{filteredAlbums.length} albums</span>
            <button
              className={`text-button ${filter === 'saved' ? 'is-active' : ''}`}
              type="button"
              onClick={onToggleFilter}
              aria-pressed={filter === 'saved'}
            >
              {filter === 'saved' ? 'Show all' : 'Show saved'}
            </button>
          </div>
        </div>
        {filteredAlbums.length ? (
          <div className="card-grid">
            {filteredAlbums.map((album) => (
              <AlbumCard
                key={album.title}
                album={album}
                onPlay={() => onPlayAlbum(album, tracks)}
                isSaved={savedAlbums.has(album.title)}
                isActive={activeAlbum === album.title}
              />
            ))}
          </div>
        ) : (
          <div className="section__empty">No saved albums yet. Tap "Show all" to browse.</div>
        )}
      </div>
      {footer}
    </section>
  )
}

export default LibraryPage
