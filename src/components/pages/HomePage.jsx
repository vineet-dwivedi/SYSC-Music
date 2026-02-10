import AlbumCard from '../ui/AlbumCard.jsx'
import TrackRow from '../ui/TrackRow.jsx'

function HomePage({
  albums,
  tracks,
  footer,
  onPlayAlbum,
  onToggleSaveAlbum,
  savedAlbums,
  onNavigate,
  onPlayTrack,
  currentTrack,
  isPlaying,
  activeAlbum,
  playbackProgress,
}) {
  const heroAlbum = albums[0]
  const isHeroSaved = heroAlbum ? savedAlbums.has(heroAlbum.title) : false

  return (
    <section className="page page--home">
      <div className="hero glass-panel animate-fade-slide">
        <div className="hero__copy">
          <p className="eyebrow">Ambient Sessions</p>
          <h1>{heroAlbum?.title ?? 'Midnight Drive'}</h1>
          <p className="hero__subtitle">
            Cinema-grade mixes engineered for clarity, focus, and slow-night momentum.
          </p>
          <div className="hero__actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => heroAlbum && onPlayAlbum(heroAlbum, tracks)}
            >
              Play album
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => heroAlbum && onToggleSaveAlbum(heroAlbum.title)}
              aria-pressed={isHeroSaved}
            >
              {isHeroSaved ? 'Saved' : 'Add to library'}
            </button>
          </div>
          <div className="hero__stats">
            <div>
              <p className="stat__value">42 min</p>
              <p className="stat__label">Runtime</p>
            </div>
            <div>
              <p className="stat__value">12 tracks</p>
              <p className="stat__label">Edition</p>
            </div>
            <div>
              <p className="stat__value">Lossless</p>
              <p className="stat__label">Quality</p>
            </div>
          </div>
        </div>
        <div className="hero__art">
          <div className="art art--hero" />
          <div className="hero__glow" />
        </div>
      </div>

      <div className="section">
        <div className="section__head">
          <h2>Featured albums</h2>
          <button className="text-button" type="button" onClick={() => onNavigate('library', 'saved')}>
            View all
          </button>
        </div>
        <div className="card-grid">
          {albums.map((album) => (
            <AlbumCard
              key={album.title}
              album={album}
              onPlay={() => onPlayAlbum(album, tracks)}
              isSaved={savedAlbums.has(album.title)}
              isActive={activeAlbum === album.title}
            />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="section__head">
          <h2>Continue listening</h2>
          <span className="section__hint">Recently played</span>
        </div>
        <div className="track-list glass-panel">
          {tracks.map((track, index) => (
            <TrackRow
              key={`${track.title}-${index}`}
              track={track}
              onPlay={() => onPlayTrack(track)}
              isActive={
                currentTrack?.title === track.title && currentTrack?.artist === track.artist
              }
              isPlaying={isPlaying}
              progress={
                currentTrack?.title === track.title && currentTrack?.artist === track.artist
                  ? playbackProgress
                  : undefined
              }
            />
          ))}
        </div>
      </div>
      {footer}
    </section>
  )
}

export default HomePage
