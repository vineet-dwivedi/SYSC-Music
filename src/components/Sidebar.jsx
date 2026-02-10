function Sidebar({
  collapsed,
  onToggle,
  activePage,
  onNavigate,
  navItems,
  playlists,
  onOpenSettings,
  activePlaylist,
  onSelectPlaylist,
}) {
  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="mac-controls">
          <span />
          <span />
          <span />
        </div>
        <button
          className="icon-button sidebar__toggle"
          type="button"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          aria-pressed={!collapsed}
        >
          <span className="icon icon--collapse" />
        </button>
        <button
          className="sidebar__item muted sidebar__settings"
          type="button"
          onClick={onOpenSettings}
        >
          <span className="icon icon--settings" />
          <span className="sidebar__text">Settings</span>
        </button>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__label">Library</p>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar__item ${activePage === item.id ? 'is-active' : ''}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              <span className={`icon icon--${item.icon}`} />
              <span className="sidebar__text">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar__section">
        <p className="sidebar__label">Playlists</p>
        <div className="sidebar__playlists">
          {playlists.map((playlist) => (
            <button
              key={playlist}
              className={`sidebar__playlist ${activePlaylist === playlist ? 'is-active' : ''}`}
              type="button"
              onClick={() => onSelectPlaylist(playlist)}
              aria-pressed={activePlaylist === playlist}
            >
              <span className="dot" />
              <span className="sidebar__text">{playlist}</span>
            </button>
          ))}
        </div>
      </div>

    </aside>
  )
}

export default Sidebar
