import { useCallback, useState } from 'react'
import { deriveInitials } from './utils.js'

function useProfileController({ addToast, setActivePage, setScrollTarget }) {
  const [profile, setProfile] = useState({
    name: 'Vinee K.',
    initials: 'VK',
    tagline: 'Profile',
    status: 'Listening in focus mode',
  })
  const [profileDraft, setProfileDraft] = useState(profile)

  const handleProfileOpen = useCallback(() => {
    setActivePage('profile')
    setScrollTarget(null)
    addToast('Opening profile', 'info')
  }, [addToast, setActivePage, setScrollTarget])

  const handleEditProfileOpen = useCallback(() => {
    setProfileDraft(profile)
    setActivePage('profile-edit')
    setScrollTarget(null)
  }, [profile, setActivePage, setScrollTarget])

  const handleProfileDraftChange = useCallback((field, value) => {
    setProfileDraft((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleProfileSave = useCallback(() => {
    const name = profileDraft.name.trim()
    if (!name) {
      addToast('Name is required', 'info')
      return
    }
    const initials = (profileDraft.initials.trim() || deriveInitials(name)).toUpperCase()
    setProfile({
      ...profileDraft,
      name,
      initials,
    })
    setActivePage('profile')
    addToast('Profile updated', 'success')
  }, [addToast, profileDraft, setActivePage])

  const handleProfileCancel = useCallback(() => {
    setActivePage('profile')
  }, [setActivePage])

  return {
    handleEditProfileOpen,
    handleProfileCancel,
    handleProfileDraftChange,
    handleProfileOpen,
    handleProfileSave,
    profile,
    profileDraft,
  }
}

export { useProfileController }
