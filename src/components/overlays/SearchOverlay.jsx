function SearchOverlay({ isOpen, onClose, results, query, onQueryChange, onOpenResult }) {
  return (
    <div className={`overlay search-overlay ${isOpen ? 'is-active' : ''}`} inert={!isOpen}>
      <div className="overlay__scrim" onClick={onClose} />
      <div className="overlay__panel glass-panel search-panel" role="dialog" aria-modal="true" aria-label="Search">
        <div className="search-panel__header">
          <h3>Search</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close search">
            <span className="icon icon--close" />
          </button>
        </div>
        <label className="search-panel__field">
          <span className="icon icon--search" />
          <input
            type="text"
            placeholder="Albums, playlists, artists"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <div className="search-panel__results">
          {results.length ? (
            results.map((result) => (
              <div
                key={result.title}
                className="search-result"
                role="button"
                tabIndex={0}
                onClick={() => onOpenResult(result)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpenResult(result)
                  }
                }}
              >
                <div className={`art ${result.art}`} />
                <div>
                  <p className="search-result__title">{result.title}</p>
                  <p className="search-result__meta">{result.meta}</p>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpenResult(result)
                  }}
                >
                  Open
                </button>
              </div>
            ))
          ) : (
            <div className="search-panel__empty">No matches yet. Try another keyword.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchOverlay



