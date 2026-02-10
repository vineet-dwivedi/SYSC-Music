function VolumeHud({ value, isVisible }) {
  return (
    <div className={`volume-hud ${isVisible ? 'is-active' : ''}`} aria-hidden={!isVisible}>
      <span className="icon icon--volume" />
      <div className="volume-hud__bar">
        <span className="volume-hud__fill" style={{ width: `${value}%` }} />
      </div>
      <span className="volume-hud__value">{value}%</span>
    </div>
  )
}

export default VolumeHud
