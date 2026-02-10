function CreatePlaylistOverlay({ isOpen, name, onNameChange, onClose, onCreate }) {
  const safeName = name ?? ''
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



