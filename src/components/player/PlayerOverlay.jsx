function PlayerOverlay({
  isOpen,
  onClose,
  track,
  isPlaying,
  onPlayToggle,
  onNext,
  onPrev,
  onAddToQueue,
  onShare,
  progress,
  currentTimeLabel,
  durationLabel,
  onSeek,
  volumePercent,
  onVolumeChange,
}) {
  return (
    <div
      className={`overlay player-overlay ${isOpen ? 'is-active' : ''}`}
      inert={!isOpen}
    >
      <div className="overlay__scrim" onClick={onClose} />
      <div className="overlay__panel full-player glass-panel" role="dialog" aria-modal="true" aria-label="Now playing">
        <button className="overlay__close" type="button" onClick={onClose} aria-label="Close player">
          <span className="icon icon--close" />
        </button>
        <div className="full-player__art">
          <div className="art art--full" />
          <div className="parallax-sheen" />
        </div>
        <div className="full-player__meta">
          <p className="eyebrow">Now playing</p>
          <h2>{track?.title ?? 'Select a track'}</h2>
          <p className="page__subtitle">{track ? `${track.artist} - Focus Sessions` : '-'}</p>
        </div>
        <div className="full-player__controls">
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
        <div className="full-player__progress">
          <span className="time">{currentTimeLabel}</span>
          <div
            className="progress progress--full"
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
          <span className="time">{durationLabel}</span>
        </div>
        <div className="full-player__footer">
          <button className="ghost-button" type="button" onClick={onAddToQueue}>
            Add to queue
          </button>
          <div className="volume">
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
            <span className="volume__value">{volumePercent ?? 0}%</span>
          </div>
          <button className="ghost-button" type="button" onClick={onShare}>
            Share
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerOverlay



