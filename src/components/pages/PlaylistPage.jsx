import TrackRow from '../ui/TrackRow.jsx'

function PlaylistPage({
  tracks,
  footer,
  playlistName,
  isDownloaded,
  onPlayPlaylist,
  onToggleDownload,
  onDeletePlaylist,
  canDelete,
  onPlayTrack,
  currentTrack,
  isPlaying,
  playbackProgress,
}) {
  const displayName = playlistName ?? 'Quiet Quartz'
  return (
    <section className="page page--playlist">
      <div className="playlist-hero glass-panel">
        <div className="playlist-hero__art">
          <div className="art art--playlist" />
        </div>
        <div className="playlist-hero__meta">
          <p className="eyebrow">Playlist</p>
          <h2>{displayName}</h2>
          <p className="page__subtitle">
            Balanced textures, soft edges, and a consistent cinematic pace.
          </p>
          <div className="playlist-hero__actions">
            <button className="primary-button" type="button" onClick={onPlayPlaylist}>
              Play playlist
            </button>
            <button
              className={`ghost-button ${isDownloaded ? 'is-active' : ''}`}
              type="button"
              onClick={onToggleDownload}
              aria-pressed={isDownloaded}
            >
              {isDownloaded ? 'Downloaded' : 'Download'}
            </button>
            <button
              className="ghost-button is-danger"
              type="button"
              onClick={onDeletePlaylist}
              disabled={!canDelete}
              aria-disabled={!canDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="track-list glass-panel">
        {tracks.map((track, index) => (
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
        ))}
      </div>
      {footer}
    </section>
  )
}

export default PlaylistPage
