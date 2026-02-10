function SettingsOverlay({ isOpen, onClose, settings, onToggleSetting }) {
  return (
    <div className={`overlay settings-overlay ${isOpen ? 'is-active' : ''}`} inert={!isOpen}>
      <div className="overlay__scrim" onClick={onClose} />
      <div className="overlay__panel glass-panel settings-panel" role="dialog" aria-modal="true" aria-label="Preferences">
        <div className="search-panel__header">
          <h3>Preferences</h3>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close settings">
            <span className="icon icon--close" />
          </button>
        </div>
        <div className="settings-panel__row">
          <div>
            <p className="settings-panel__title">Crossfade</p>
            <p className="settings-panel__subtitle">Smooth track transitions</p>
          </div>
          <button
            className={`toggle ${settings.crossfade ? 'is-active' : ''}`}
            type="button"
            onClick={() => onToggleSetting('crossfade', 'Crossfade')}
            aria-pressed={settings.crossfade}
          >
            <span />
          </button>
        </div>
        <div className="settings-panel__row">
          <div>
            <p className="settings-panel__title">High quality</p>
            <p className="settings-panel__subtitle">Lossless playback</p>
          </div>
          <button
            className={`toggle ${settings.highQuality ? 'is-active' : ''}`}
            type="button"
            onClick={() => onToggleSetting('highQuality', 'High quality')}
            aria-pressed={settings.highQuality}
          >
            <span />
          </button>
        </div>
        <div className="settings-panel__row">
          <div>
            <p className="settings-panel__title">Offline cache</p>
            <p className="settings-panel__subtitle">Ready for travel</p>
          </div>
          <button
            className={`toggle ${settings.offlineCache ? 'is-active' : ''}`}
            type="button"
            onClick={() => onToggleSetting('offlineCache', 'Offline cache')}
            aria-pressed={settings.offlineCache}
          >
            <span />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsOverlay



