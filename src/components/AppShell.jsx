import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import AppBackground from './AppBackground.jsx'
import Topbar from './Topbar.jsx'
import HomePage from './pages/HomePage.jsx'
import LibraryPage from './pages/LibraryPage.jsx'
import AlbumPage from './pages/AlbumPage.jsx'
import ArtistPage from './pages/ArtistPage.jsx'
import PlaylistPage from './pages/PlaylistPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import EditProfilePage from './pages/EditProfilePage.jsx'
import MiniPlayer from './player/MiniPlayer.jsx'
import PlayerOverlay from './player/PlayerOverlay.jsx'
import SearchOverlay from './overlays/SearchOverlay.jsx'
import CreatePlaylistOverlay from './overlays/CreatePlaylistOverlay.jsx'
import DeletePlaylistOverlay from './overlays/DeletePlaylistOverlay.jsx'
import SettingsOverlay from './overlays/SettingsOverlay.jsx'
import IntroScreen from './intro/IntroScreen.jsx'
import LoadingScreen from './LoadingScreen.jsx'
import ToastStack from './ToastStack.jsx'
import VolumeHud from './VolumeHud.jsx'
import { usePageLenis } from '../hooks/usePageLenis.js'

function AppShell({ c }) {
  const appShellRef = useRef(null)
  const pageStackRef = useRef(null)
  const themeBloomRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  const lenisRef = usePageLenis({
    containerRef: pageStackRef,
    activePage: c.activePage,
    enabled: c.introComplete,
  })

  useEffect(() => {
    if (!c.themeTransition || typeof window === 'undefined') return undefined

    const transitionTheme = c.themeTransition.toTheme ?? c.theme

    const ctx = gsap.context(() => {
      gsap.timeline()
        .fromTo(
          '.app__background',
          { scale: 0.985, filter: 'saturate(1) brightness(1)' },
          {
            scale: 1.018,
            filter:
              transitionTheme === 'midnight'
                ? 'saturate(1.2) brightness(0.92)'
                : 'saturate(1.08) brightness(1.05)',
            duration: 0.34,
            ease: 'power2.out',
          },
        )
        .to('.app__background', {
          scale: 1,
          filter: 'saturate(1) brightness(1)',
          duration: 0.72,
          ease: 'power3.out',
        })
    }, appShellRef)

    return () => ctx.revert()
  }, [c.theme, c.themeTransition])

  useEffect(() => {
    if (!c.themeTransition || typeof window === 'undefined') return undefined

    const bloom = themeBloomRef.current
    if (!(bloom instanceof HTMLElement)) return undefined

    const lenis = lenisRef.current
    const veil = bloom.querySelector('.theme-bloom__veil')
    const halo = bloom.querySelector('.theme-bloom__halo')
    const sheen = bloom.querySelector('.theme-bloom__sheen')
    const commitAt = prefersReducedMotion ? 0.16 : 0.42
    const duration = prefersReducedMotion ? 0.24 : 1.12
    let hasCommitted = false

    lenis?.stop?.()

    gsap.set(bloom, {
      '--theme-progress': 0,
      '--theme-blur': prefersReducedMotion ? '0px' : '18px',
      '--theme-opacity': 0.98,
    })

    if (veil instanceof HTMLElement) {
      gsap.set(veil, {
        opacity: prefersReducedMotion ? 0.42 : 0.24,
      })
    }

    if (halo instanceof HTMLElement) {
      gsap.set(halo, {
        opacity: prefersReducedMotion ? 0.26 : 0.18,
        scale: 0.78,
      })
    }

    if (sheen instanceof HTMLElement) {
      gsap.set(sheen, {
        opacity: 0,
        xPercent: -30,
      })
    }

    const commitTheme = () => {
      if (hasCommitted) return
      hasCommitted = true
      c.handleThemeTransitionCommit?.({
        id: c.themeTransition.id,
        theme: c.themeTransition.toTheme,
      })
    }

    const timeline = gsap.timeline({
      defaults: {
        ease: prefersReducedMotion ? 'power1.out' : 'expo.inOut',
      },
      onComplete: () => {
        commitTheme()
        lenis?.start?.()
        c.handleThemeTransitionComplete?.(c.themeTransition.id)
      },
    })

    timeline.to(
      bloom,
      {
        '--theme-progress': 1,
        '--theme-blur': prefersReducedMotion ? '0px' : '2px',
        '--theme-opacity': 1,
        duration,
        onUpdate: () => {
          if (timeline.progress() >= commitAt) {
            commitTheme()
          }
        },
      },
      0,
    )

    if (veil instanceof HTMLElement) {
      timeline.to(
        veil,
        {
          opacity: prefersReducedMotion ? 0.56 : 0.94,
          duration: duration * 0.44,
          ease: 'sine.out',
        },
        0,
      )
      timeline.to(
        veil,
        {
          opacity: prefersReducedMotion ? 0.2 : 0.34,
          duration: duration * 0.56,
          ease: 'power2.inOut',
        },
        duration * 0.34,
      )
    }

    if (halo instanceof HTMLElement) {
      timeline.to(
        halo,
        {
          opacity: prefersReducedMotion ? 0.34 : 0.72,
          scale: 1.18,
          duration: duration * 0.62,
          ease: 'power2.out',
        },
        0,
      )
      timeline.to(
        halo,
        {
          opacity: 0,
          scale: 1.34,
          duration: duration * 0.38,
          ease: 'power3.out',
        },
        duration * 0.54,
      )
    }

    if (sheen instanceof HTMLElement) {
      timeline.to(
        sheen,
        {
          opacity: prefersReducedMotion ? 0 : 0.68,
          xPercent: 16,
          duration: duration * 0.5,
          ease: 'power2.out',
        },
        duration * 0.12,
      )
      timeline.to(
        sheen,
        {
          opacity: 0,
          xPercent: 54,
          duration: duration * 0.34,
          ease: 'power2.in',
        },
        duration * 0.56,
      )
    }

    return () => {
      timeline.kill()
      lenis?.start?.()
    }
  }, [
    c.handleThemeTransitionCommit,
    c.handleThemeTransitionComplete,
    c.themeTransition,
    lenisRef,
    prefersReducedMotion,
  ])

  const pageFooter = (
    <footer className="page-credit" aria-label="Copyright">
      <span className="page-credit__text">Copyright &copy; Developed By Vineet Dwivedi</span>
    </footer>
  )

  const renderPage = () => {
    if (c.activePage === 'library') {
      return (
        <LibraryPage
          collections={c.libraryCollections}
          albums={c.albums}
          tracks={c.tracks}
          footer={pageFooter}
          onCreatePlaylist={c.handleOpenCreatePlaylist}
          onOpenCollection={c.handleOpenCollection}
          filter={c.libraryFilter}
          onToggleFilter={c.handleFilterToggle}
          savedAlbums={c.savedAlbumSet}
          onPlayAlbum={c.handlePlayAlbum}
          onOpenAlbum={c.handleOpenAlbum}
          scrollTarget={c.scrollTarget}
          onClearScrollTarget={c.clearScrollTarget}
          activeAlbum={c.activeAlbum}
        />
      )
    }

    if (c.activePage === 'album') {
      return (
        <AlbumPage
          albumName={c.activeAlbum}
          albumArtist={c.activeAlbumArtist}
          albumImage={c.activeAlbumImage}
          tracks={c.activeAlbumTracks}
          footer={pageFooter}
          onPlayAlbum={c.handlePlayCurrentAlbum}
          onPlayTrack={(track) => c.handlePlayTrack(track, c.activeAlbumTracks)}
          currentTrack={c.currentTrack}
          isPlaying={c.isPlaying}
          playbackProgress={c.progressPercent}
        />
      )
    }

    if (c.activePage === 'artist') {
      return (
        <ArtistPage
          artistName={c.activeArtist}
          tracks={c.activeArtistTracks}
          footer={pageFooter}
          onPlayArtist={c.handlePlayArtist}
          onPlayTrack={(track) => c.handlePlayTrack(track, c.activeArtistTracks)}
          currentTrack={c.currentTrack}
          isPlaying={c.isPlaying}
          playbackProgress={c.progressPercent}
        />
      )
    }

    if (c.activePage === 'playlist') {
      return (
        <PlaylistPage
          tracks={c.playlistTracks}
          playlistName={c.activePlaylist}
          playlistOptions={c.playlistItems}
          onSelectPlaylist={c.handleSelectPlaylist}
          footer={pageFooter}
          onPlayPlaylist={c.handlePlayPlaylist}
          onDeletePlaylist={() => c.handleRequestDeletePlaylist(c.activePlaylist)}
          canDelete={c.playlistItems.some((item) => item.name === c.activePlaylist)}
          onPlayTrack={(track) => c.handlePlayTrack(track, c.playlistTracks)}
          currentTrack={c.currentTrack}
          isPlaying={c.isPlaying}
          playbackProgress={c.progressPercent}
        />
      )
    }

    if (c.activePage === 'profile') {
      return (
        <ProfilePage
          footer={pageFooter}
          user={c.profile}
          featuredAlbum={c.profileFeaturedAlbum}
          onEditProfile={c.handleEditProfileOpen}
          onOpenSettings={() => c.setSettingsOpen(true)}
          onViewLibrary={c.handleViewLibrary}
          onPlayFocus={c.handlePlayFocusMix}
        />
      )
    }

    if (c.activePage === 'profile-edit') {
      return (
        <EditProfilePage
          footer={pageFooter}
          draft={c.profileDraft}
          onChange={c.handleProfileDraftChange}
          onSave={c.handleProfileSave}
          onCancel={c.handleProfileCancel}
        />
      )
    }

    return (
      <HomePage
        albums={c.albums}
        tracks={c.tracks}
        footer={pageFooter}
        onPlayAlbum={c.handlePlayAlbum}
        onToggleSaveAlbum={c.handleToggleSaveAlbum}
        savedAlbums={c.savedAlbumSet}
        onNavigate={c.navigate}
        onOpenAlbum={c.handleOpenAlbum}
        onOpenArtist={c.handleOpenArtist}
        onPlayTrack={(track) => c.handlePlayTrack(track, c.tracks)}
        currentTrack={c.currentTrack}
        isPlaying={c.isPlaying}
        activeAlbum={c.activeAlbum}
        playbackProgress={c.progressPercent}
        authenticatedUserName={c.authSession?.user?.name}
      />
    )
  }

  return (
    <AnimatePresence mode="wait">
      {c.introComplete ? (
        <motion.div
          key="app"
          ref={appShellRef}
          className="app-shell"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className="app">
            <AppBackground />
            <main className="main">
              <Topbar
                onSearchOpen={() => c.setSearchOpen(true)}
                onNavigate={c.navigate}
                onLogout={c.handleLogout}
                theme={c.theme}
                onThemeToggle={c.handleThemeToggle}
              />
              <div className="page-stack" ref={pageStackRef}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={c.activePage}
                    className="page-motion"
                    initial={c.pageTransition.initial}
                    animate={c.pageTransition.animate}
                    exit={c.pageTransition.exit}
                    transition={c.pageTransition.transition}
                  >
                    {renderPage()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            <MiniPlayer
              isHidden={c.playerExpanded}
              onExpand={() => c.setPlayerExpanded(true)}
              track={c.currentTrack}
              trackImage={c.currentTrackImage}
              isPlaying={c.isPlaying}
              onPlayToggle={c.handleTogglePlay}
              onNext={c.handleNext}
              onPrev={c.handlePrev}
              progress={c.progressPercent}
              onSeek={c.handleSeek}
              volumePercent={c.volumePercent}
              onVolumeChange={c.handleVolumeChange}
            />
            {c.currentTrack?.audioUrl ? (
              <audio ref={c.audioRef} src={c.currentTrack.audioUrl} preload="metadata" onEnded={c.handleNext} />
            ) : null}

            <PlayerOverlay
              isOpen={c.playerExpanded}
              onClose={() => c.setPlayerExpanded(false)}
              track={c.currentTrack}
              trackImage={c.currentTrackImage}
              isPlaying={c.isPlaying}
              onPlayToggle={c.handleTogglePlay}
              onNext={c.handleNext}
              onPrev={c.handlePrev}
              onAddToQueue={c.handleAddToQueue}
              onShare={c.handleShare}
              progress={c.progressPercent}
              currentTimeLabel={c.playbackTimeLabel}
              durationLabel={c.playbackDurationLabel}
              onSeek={c.handleSeek}
              volumePercent={c.volumePercent}
              onVolumeChange={c.handleVolumeChange}
            />
            <SearchOverlay
              isOpen={c.searchOpen}
              onClose={c.handleSearchClose}
              results={c.filteredSearchResults}
              query={c.searchQuery}
              onQueryChange={c.setSearchQuery}
              onOpenResult={c.handleOpenSearchResult}
            />
            <CreatePlaylistOverlay
              isOpen={c.createPlaylistOpen}
              name={c.playlistDraftName}
              tracks={c.createPlaylistTrackOptions}
              selectedTrackIds={c.selectedTrackIds}
              onNameChange={c.setPlaylistDraftName}
              onToggleTrack={c.handleToggleCreatePlaylistTrack}
              onClose={c.handleCloseCreatePlaylist}
              onCreate={c.handleCreatePlaylist}
            />
            <DeletePlaylistOverlay
              isOpen={Boolean(c.deletePlaylistName)}
              playlistName={c.deletePlaylistName}
              onCancel={c.handleCancelDeletePlaylist}
              onConfirm={c.handleConfirmDeletePlaylist}
            />
            <SettingsOverlay
              isOpen={c.settingsOpen}
              onClose={() => c.setSettingsOpen(false)}
              settings={c.settings}
              onToggleSetting={c.handleToggleSetting}
            />
          </div>
          <ToastStack toasts={c.toasts} onDismiss={c.dismissToast} />
          <VolumeHud value={c.volumeHudValue} isVisible={c.volumeHudVisible} />
          <AnimatePresence>
            {c.themeTransition ? (
              <motion.div
                key={`theme-${c.themeTransition.id}`}
                ref={themeBloomRef}
                className={`theme-bloom theme-bloom--${c.themeTransition.toTheme}`}
                style={{
                  '--theme-origin-x': `${c.themeTransition.x}px`,
                  '--theme-origin-y': `${c.themeTransition.y}px`,
                  '--theme-max-radius': `${c.themeTransition.radius}px`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: prefersReducedMotion ? 0.12 : 0.3 } }}
                transition={{ duration: prefersReducedMotion ? 0.12 : 0.22, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <div className="theme-bloom__halo" />
                <div className="theme-bloom__veil" />
                <div className="theme-bloom__sheen" />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {c.wipeActive ? (
              <motion.div
                key="wipe"
                className="lens-wipe"
                initial={{ scaleX: 0, opacity: 0.9 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
                style={{ originX: 0 }}
              >
                <div className="lens-wipe__beam" />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {c.isLoading ? <LoadingScreen /> : null}
          </AnimatePresence>
        </motion.div>
      ) : (
        <IntroScreen key="intro" onEnter={c.handleEnter} />
      )}
    </AnimatePresence>
  )
}

export default AppShell
