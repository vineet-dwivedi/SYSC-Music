function CreatePlaylistOverlay({
  isOpen,
  name,
  tracks = [],
  selectedTrackIds = [],
  onNameChange,
  onToggleTrack,
  onClose,
  onCreate,
}) {
  const safeName = name ?? ''
  const selectedSet = new Set(selectedTrackIds)
  const isDisabled = !safeName.trim()
  return (
    <div className={`overlay create-playlist-overlay ${isOpen ? 'is-active' : ''}`} inert={!isOpen}>
      <div className="overlay__scrim" onClick={onClose} />
      <div
        className="overlay__panel glass-panel create-playlist-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Create playlist"
      >
        <div className="create-playlist__header">
          <h3>Create playlist</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <span className="icon icon--close" />
          </button>
        </div>
        <label className="create-playlist__field">
          <span>Name</span>
          <input
            type="text"
            value={safeName}
            placeholder="My cinematic mix"
            autoFocus
            onChange={(event) => onNameChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onCreate()
              }
            }}
          />
        </label>
        <div className="create-playlist__tracks">
          <p className="create-playlist__tracks-label">
            Select songs ({selectedTrackIds.length})
          </p>
          <div className="create-playlist__tracks-list">
            {tracks.map((track, index) => {
              const trackId = track.id ?? track._id ?? null
              const trackKey = trackId ?? `${track.title}-${track.artist}-${index}`
              const isChecked = trackId ? selectedSet.has(trackId) : false
              return (
                <label key={trackKey} className="create-playlist__track-item">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={!trackId}
                    onChange={() => onToggleTrack?.(trackId)}
                  />
                  <span>{track.title} - {track.artist}</span>
                </label>
              )
            })}
          </div>
        </div>
        <div className="create-playlist__actions">
          <button className="ghost-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="button" onClick={onCreate} disabled={isDisabled}>
            Create
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePlaylistOverlay



