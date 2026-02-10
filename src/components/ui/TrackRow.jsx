function TrackRow({ track, onPlay, isActive, isPlaying, progress }) {
  const isNowPlaying = isActive && isPlaying
  const hasLiveProgress = typeof progress === 'number'
  return (
    <div className={`track-row ${isActive ? 'is-active' : ''}`}>
      <div className="track-row__title">
        <button
          className="track-row__play"
          type="button"
          aria-label={isNowPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
          onClick={onPlay}
        >
          <span className={`icon ${isNowPlaying ? 'icon--pause' : 'icon--play'}`} />
        </button>
        {track.coverImage ? (
          <img
            className="track-row__art"
            src={track.coverImage}
            alt={`${track.title} cover`}
            loading="lazy"
          />
        ) : null}
        <div>
          <p className="track-row__name">{track.title}</p>
          <p className="track-row__artist">{track.artist}</p>
        </div>
      </div>
      <div className="track-row__progress">
        <div className="progress">
          {hasLiveProgress ? (
            <span className="progress__fill" style={{ width: `${progress}%` }} />
          ) : (
            <span className={`progress__fill ${track.progress}`} />
          )}
        </div>
      </div>
      <span className="track-row__time">{track.duration}</span>
    </div>
  )
}

export default TrackRow
