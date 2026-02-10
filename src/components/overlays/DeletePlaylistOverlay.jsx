function DeletePlaylistOverlay({ isOpen, playlistName, onCancel, onConfirm }) {
  return (
    <div
      className={`overlay delete-playlist-overlay ${isOpen ? 'is-active' : ''}`}
      inert={!isOpen}
    >
      <div className="overlay__scrim" onClick={onCancel} />
      <div
        className="overlay__panel glass-panel delete-playlist-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Delete playlist"
      >
        <div className="delete-playlist__header">
          <h3>Delete playlist</h3>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close">
            <span className="icon icon--close" />
          </button>
        </div>
        <p className="delete-playlist__copy">
          This will remove <strong>{playlistName || 'this playlist'}</strong> from your library. This action cannot be
          undone.
        </p>
        <div className="delete-playlist__actions">
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="ghost-button is-danger" type="button" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeletePlaylistOverlay



