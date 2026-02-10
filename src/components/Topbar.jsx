function Topbar({ onSearchOpen, onNavigate, onProfileOpen, profile }) {
  const initials = profile?.initials ?? 'VK'
  const name = profile?.name ?? 'Vinee K.'
  const status = profile?.status ?? 'Listening'
  return (
    <header className="topbar">
      <button className="topbar__search" type="button" onClick={onSearchOpen}>
        <span className="icon icon--search" />
        <span>Search albums, artists, playlists</span>
      </button>
      <div className="topbar__actions">
        <button className="ghost-button" type="button" onClick={() => onNavigate('library')}>
          Library
        </button>
        <button className="ghost-button" type="button" onClick={() => onNavigate('playlist')}>
          Playlist
        </button>
        <button
          className="profile-chip"
          type="button"
          onClick={onProfileOpen}
          aria-label="Open profile"
        >
          <span className="profile-chip__avatar">{initials}</span>
          <span className="profile-chip__meta">
            <span className="profile-chip__name">{name}</span>
            <span className="profile-chip__status">{status}</span>
          </span>
        </button>
      </div>
    </header>
  )
}

export default Topbar
