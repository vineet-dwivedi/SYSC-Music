function MiniPlayer({
  isHidden,
  onExpand,
  track,
  isPlaying,
  onPlayToggle,
  onNext,
  onPrev,
  progress,
  onSeek,
  volumePercent,
  onVolumeChange,
}) {
  return (
    <div className={`mini-player ${isHidden ? 'is-hidden' : ''}`}>
      <div className="mini-player__art art art--mini" />
      <div className="mini-player__meta">
        <p className="mini-player__title">{track?.title ?? 'Select a track'}</p>
        <p className="mini-player__artist">{track?.artist ?? '-'}</p>
        <div
          className="progress progress--mini"
          onClick={onSeek}
          onTouchStart={onSeek}
          role="button"
          tabIndex={0}
          aria-label="Seek"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSeek(event)
            }
          }}
        >
          <span className="progress__fill" style={{ width: `${progress ?? 0}%` }} />
        </div>
      </div>
      <div className="mini-player__controls">
        <button className="icon-button" type="button" aria-label="Previous track" onClick={onPrev}>
          <span className="icon icon--prev" />
        </button>
        <button
          className="icon-button is-primary"
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={onPlayToggle}
        >
          <span className={`icon ${isPlaying ? 'icon--pause' : 'icon--play'}`} />
        </button>
        <button className="icon-button" type="button" aria-label="Next track" onClick={onNext}>
          <span className="icon icon--next" />
        </button>
      </div>
      <div className="mini-player__volume">
        <span className="icon icon--volume" />
        <div
          className="progress progress--volume"
          onClick={onVolumeChange}
          onTouchStart={onVolumeChange}
          role="button"
          tabIndex={0}
          aria-label="Adjust volume"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onVolumeChange(event)
            }
          }}
        >
          <span className="progress__fill" style={{ width: `${volumePercent ?? 0}%` }} />
        </div>
        <span className="mini-player__volume-value">{volumePercent ?? 0}%</span>
      </div>
      <button className="mini-player__expand" type="button" onClick={onExpand}>
        Expand
      </button>
    </div>
  )
}

export default MiniPlayer
