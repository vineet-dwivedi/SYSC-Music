import AlbumCard from '../ui/AlbumCard.jsx'
import TrackRow from '../ui/TrackRow.jsx'
import artistImages from '../../data/artistImages.js'

function HomePage({
  albums,
  tracks,
  footer,
  onPlayAlbum,
  onOpenAlbum,
  onOpenArtist,
  savedAlbums,
  onNavigate,
  onPlayTrack,
  currentTrack,
  isPlaying,
  activeAlbum,
  playbackProgress,
  authenticatedUserName,
}) {
  const artistNames = Object.keys(artistImages)
  const artists = Array.from(
    artistNames.reduce((map, name) => {
      if (!map.has(name)) {
        map.set(name, {
          name,
          imageUrl: artistImages[name] ?? '',
        })
      }
      return map
    }, new Map()).values(),
  )
  const getArtistInitials = (name) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  const resolvedUserName = String(authenticatedUserName ?? '').trim() || 'Listener'

  return (
    <section className="page page--home">
      <div className="ambient-wave-panel glass-panel animate-fade-slide">
        <div className="ambient-wave-panel__gradient" />
        <div className="ambient-wave-panel__orb ambient-wave-panel__orb--one" />
        <div className="ambient-wave-panel__orb ambient-wave-panel__orb--two" />
        <div className="ambient-wave-panel__orb ambient-wave-panel__orb--three" />
        <div className="ambient-wave-panel__sheen" />
        <span className="ambient-wave-panel__title">AMBIENT SESSION</span>
        <div className="ambient-wave-panel__greeting">
          <span className="ambient-wave-panel__welcome">Welcome</span>
          <strong className="ambient-wave-panel__name">{resolvedUserName}</strong>
        </div>
        <div className="ambient-wave-panel__veil" />
        <div className="ambient-wave-panel__glow" />
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
              onOpen={() => onOpenAlbum(album)}
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
        <div className="track-list glass-panel home-track-list">
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

      <div className="section">
        <div className="section__head">
          <h2>Artists</h2>
          <span className="section__hint">{artists.length} artists</span>
        </div>
        <div className="glass-panel artist-scroller">
          {artists.length ? (
            artists.map((artist) => (
              <button
                key={artist.name}
                className="artist-item"
                type="button"
                onClick={() => onOpenArtist?.(artist.name)}
                aria-label={`Open ${artist.name}`}
              >
                {artist.imageUrl ? (
                  <img
                    className="artist-item__avatar"
                    src={artist.imageUrl}
                    alt={`${artist.name} avatar`}
                    loading="lazy"
                  />
                ) : (
                  <div className="artist-item__avatar artist-item__avatar--fallback">
                    {getArtistInitials(artist.name)}
                  </div>
                )}
                <p className="artist-item__name">{artist.name}</p>
              </button>
            ))
          ) : (
            <div className="section__empty">No artists added yet.</div>
          )}
        </div>
      </div>
      {footer}
    </section>
  )
}

export default HomePage
