function AlbumCard({ album, onPlay, onOpen, isSaved, isActive }) {
  const resolveCoverImage = (value) => {
    if (typeof value !== 'string') return ''
    const trimmed = value.trim()
    if (!trimmed) return ''
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('data:image/')
    ) {
      return trimmed
    }
    return ''
  }

  const coverSrc = resolveCoverImage(album?.coverImage) || resolveCoverImage(album?.art)
  const artClass = coverSrc ? 'art' : `art ${album?.art ?? ''}`

  const handleCardKeyDown = (event) => {
    if (!onOpen) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  const handlePlayClick = (event) => {
    event.stopPropagation()
    onPlay?.()
  }

  return (
    <article
      className={`album-card animate-card ${isActive ? 'is-active' : ''}`}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={handleCardKeyDown}
    >
      {isSaved ? <span className="album-card__badge">Saved</span> : null}
      {coverSrc ? (
        <img className="album-card__cover" src={coverSrc} alt={`${album.title} cover`} loading="lazy" />
      ) : (
        <div className={artClass} />
      )}
      <div className="album-card__meta">
        <h3>{album.title}</h3>
        <p>{album.artist}</p>
      </div>
      <button
        className="album-card__action"
        type="button"
        onClick={handlePlayClick}
        aria-label={`Play ${album.title}`}
      >
        <span className="icon icon--play" />
      </button>
    </article>
  )
}

export default AlbumCard