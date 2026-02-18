import TrackRow from '../ui/TrackRow.jsx'

function PlaylistPage({
  tracks,
  footer,
  playlistName,
  playlistOptions = [],
  onSelectPlaylist,
  onPlayPlaylist,
  onDeletePlaylist,
  canDelete,
  onPlayTrack,
  currentTrack,
  isPlaying,
  playbackProgress,
}) {
  const hasPlaylist = Boolean(playlistName?.trim())
  const displayName = hasPlaylist ? playlistName : 'No playlist selected'
  return (
    <section className="page page--playlist">
      <div className="playlist-hero glass-panel">
        <div className="playlist-hero__art">
          <div className="art art--playlist" />
        </div>
        <div className="playlist-hero__meta">
          <p className="eyebrow">Playlist</p>
          {playlistOptions.length ? (
            <label className="playlist-hero__picker">
              <span className="playlist-hero__picker-label">Choose playlist</span>
              <select
                value={hasPlaylist ? playlistName : ''}
                onChange={(event) => onSelectPlaylist?.(event.target.value)}
                disabled={!playlistOptions.length}
              >
                {!hasPlaylist ? <option value="">Select playlist</option> : null}
                {playlistOptions.map((playlist, index) => {
                  const optionName = playlist?.name ?? `Playlist ${index + 1}`
                  const optionId = playlist?.id ?? optionName
                  return (
                    <option key={optionId} value={optionName}>
                      {optionName}
                    </option>
                  )
                })}
              </select>
            </label>
          ) : null}
          <h2>{displayName}</h2>
          <p className="page__subtitle">
            {hasPlaylist
              ? 'Balanced textures, soft edges, and a consistent cinematic pace.'
              : 'Create a new playlist from Library and it will appear here.'}
          </p>
          <div className="playlist-hero__actions">
            <button className="primary-button" type="button" onClick={onPlayPlaylist} disabled={!hasPlaylist}>
              Play playlist
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
          <div className="section__empty">
            {hasPlaylist ? 'No songs in this playlist yet.' : 'No playlist selected.'}
          </div>
        )}
      </div>
      {footer}
    </section>
  )
}

export default PlaylistPage
