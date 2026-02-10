function AlbumCard({ album, onPlay, isSaved, isActive }) {
  return (
    <article className={`album-card animate-card ${isActive ? 'is-active' : ''}`}>
      {isSaved ? <span className="album-card__badge">Saved</span> : null}
      <div className={`art ${album.art}`} />
      <div className="album-card__meta">
        <h3>{album.title}</h3>
        <p>{album.artist}</p>
      </div>
      <button
        className="album-card__action"
        type="button"
        onClick={onPlay}
        aria-label={`Play ${album.title}`}
      >
        <span className="icon icon--play" />
      </button>
    </article>
  )
}

export default AlbumCard
