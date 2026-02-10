function EditProfilePage({ footer, draft, onChange, onSave, onCancel }) {
  return (
    <section className="page page--profile-edit">
      <div className="profile-edit glass-panel">
        <div className="profile-edit__header">
          <div>
            <p className="eyebrow">Edit profile</p>
            <h2>Personalize your presence</h2>
            <p className="page__subtitle">Update the profile capsule and your listening identity.</p>
          </div>
          <div className="profile-edit__avatar">{draft.initials || 'NK'}</div>
        </div>

        <div className="profile-edit__grid">
          <label>
            <span>Name</span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => onChange('name', event.target.value)}
              placeholder="Your name"
              autoFocus
            />
          </label>
          <label>
            <span>Initials</span>
            <input
              type="text"
              value={draft.initials}
              onChange={(event) => onChange('initials', event.target.value)}
              placeholder="VK"
            />
          </label>
          <label>
            <span>Status</span>
            <input
              type="text"
              value={draft.status}
              onChange={(event) => onChange('status', event.target.value)}
              placeholder="Listening"
            />
          </label>
          <label>
            <span>Tagline</span>
            <input
              type="text"
              value={draft.tagline}
              onChange={(event) => onChange('tagline', event.target.value)}
              placeholder="Profile"
            />
          </label>
        </div>

        <div className="profile-edit__actions">
          <button className="ghost-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" type="button" onClick={onSave}>
            Save changes
          </button>
        </div>
      </div>
      {footer}
    </section>
  )
}

export default EditProfilePage
