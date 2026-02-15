import TrackRow from '../ui/TrackRow.jsx'

function AlbumPage({
  albumName,
  albumArtist,
  albumImage,
  tracks,
  footer,
  onPlayAlbum,
  onPlayTrack,
  currentTrack,
  isPlaying,
  playbackProgress,
}) {
  const initials = (albumName || 'AL')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <section className="page page--playlist">
      <div className="playlist-hero glass-panel">
        <div className="playlist-hero__art">
          {albumImage ? (
            <img
              className="album-hero__image"
              src={albumImage}
              alt={`${albumName || 'Album'} cover`}
              loading="lazy"
            />
          ) : (
            <div className="album-hero__fallback">{initials}</div>
          )}
        </div>
        <div className="playlist-hero__meta">
          <p className="eyebrow">Album</p>
          <h2>{albumName || 'Album'}</h2>
          <p className="page__subtitle">{albumArtist || 'Unknown artist'}</p>
          <div className="playlist-hero__actions">
            <button className="primary-button" type="button" onClick={onPlayAlbum} disabled={!tracks.length}>
              Play album
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
          <div className="section__empty">No songs found for this album yet.</div>
        )}
      </div>
      {footer}
    </section>
  )
}

export default AlbumPage
