function Topbar({ onSearchOpen, onNavigate }) {
  return (
    <header className="topbar">
      <button className="topbar__search" type="button" onClick={onSearchOpen}>
        <span className="icon icon--search" />
        <span>Search songs</span>
      </button>
      <nav className="topbar__actions" aria-label="Page navigation">
        <button className="ghost-button topbar__nav-button" type="button" onClick={() => onNavigate('home')}>
          Home
        </button>
        <button className="ghost-button topbar__nav-button" type="button" onClick={() => onNavigate('library')}>
          Library
        </button>
        <button className="ghost-button topbar__nav-button" type="button" onClick={() => onNavigate('playlist')}>
          Playlist
        </button>
      </nav>
    </header>
  )
}

export default Topbar
