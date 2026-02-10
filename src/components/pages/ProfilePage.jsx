function ProfilePage({
  footer,
  user,
  stats,
  featuredAlbum,
  onEditProfile,
  onOpenSettings,
  onViewLibrary,
  onPlayFocus,
}) {
  return (
    <section className="page page--profile">
      <div className="profile-hero glass-panel">
        <div className="profile-hero__avatar">{user.initials}</div>
        <div className="profile-hero__meta">
          <p className="eyebrow">{user.tagline}</p>
          <h2>{user.name}</h2>
          <p className="page__subtitle">{user.status}</p>
          <div className="profile-hero__actions">
            <button className="primary-button" type="button" onClick={onEditProfile}>
              Edit profile
            </button>
            <button className="ghost-button" type="button" onClick={onOpenSettings}>
              Preferences
            </button>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat glass-panel">
          <p className="profile-stat__value">{stats.savedAlbums}</p>
          <p className="profile-stat__label">Saved albums</p>
        </div>
        <div className="profile-stat glass-panel">
          <p className="profile-stat__value">{stats.playlists}</p>
          <p className="profile-stat__label">Playlists</p>
        </div>
        <div className="profile-stat glass-panel">
          <p className="profile-stat__value">{stats.hours}</p>
          <p className="profile-stat__label">Hours listened</p>
        </div>
      </div>

      <div className="profile-section glass-panel">
        <div className="profile-section__copy">
          <p className="eyebrow">Daily focus</p>
          <h3>Curated listening</h3>
          <p className="page__subtitle">
            Designed to keep your mix clean, calm, and perfectly paced.
          </p>
          <div className="profile-section__actions">
            <button className="primary-button" type="button" onClick={onPlayFocus}>
              Play focus mix
            </button>
            <button className="ghost-button" type="button" onClick={onViewLibrary}>
              View library
            </button>
          </div>
        </div>
        <div className="profile-section__art">
          <div className={`art ${featuredAlbum.art}`} />
          <div className="profile-section__caption">
            <p className="profile-section__title">{featuredAlbum.title}</p>
            <p className="profile-section__meta">{featuredAlbum.artist}</p>
          </div>
        </div>
      </div>

      {footer}
    </section>
  )
}

export default ProfilePage
