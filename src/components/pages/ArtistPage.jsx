import TrackRow from '../ui/TrackRow.jsx'
import artistImages from '../../data/artistImages.js'

const resolveArtistImage = (artistName) => {
  if (!artistName) return ''
  if (artistImages[artistName]) return artistImages[artistName]
  const match = Object.keys(artistImages).find(
    (name) => name.toLowerCase() === artistName.toLowerCase(),
  )
  return match ? artistImages[match] : ''
}

const getArtistInitials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

function ArtistPage({
  artistName,
  tracks,
  footer,
  onPlayArtist,
  onPlayTrack,
  currentTrack,
  isPlaying,
  playbackProgress,
}) {
  const artistImage = resolveArtistImage(artistName)

  return (
    <section className="page page--playlist">
      <div className="playlist-hero glass-panel">
        <div className="playlist-hero__art artist-hero__art">
          {artistImage ? (
            <img
              className="artist-hero__image"
              src={artistImage}
              alt={`${artistName} portrait`}
              loading="lazy"
            />
          ) : (
            <div className="artist-hero__fallback">
              {getArtistInitials(artistName || 'Artist')}
            </div>
          )}
        </div>
        <div className="playlist-hero__meta">
          <p className="eyebrow">Artist</p>
          <h2>{artistName || 'Artist'}</h2>
          <p className="page__subtitle">{tracks.length} songs</p>
          <div className="playlist-hero__actions">
            <button className="primary-button" type="button" onClick={onPlayArtist} disabled={!tracks.length}>
              Play artist
            </button>
          </div>
        </div>
      </div>

      <div className="track-list glass-panel">
        {tracks.length ? (
          tracks.map((track, index) => (
            <TrackRow
              key={`${track.title}-${index}`}
              track={track}
              onPlay={() => onPlayTrack(track)}
              isActive={currentTrack?.title === track.title && currentTrack?.artist === track.artist}
              isPlaying={isPlaying}
              progress={
                currentTrack?.title === track.title && currentTrack?.artist === track.artist
                  ? playbackProgress
                  : undefined
              }
            />
          ))
        ) : (
          <div className="section__empty">No songs found for this artist yet.</div>
        )}
      </div>
      {footer}
    </section>
  )
}

export default ArtistPage
