import { AnimatePresence, motion } from 'framer-motion'
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
import ToastStack from './ToastStack.jsx'
import VolumeHud from './VolumeHud.jsx'

function AppShell({ c }) {
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
      />
    )
  }

  return (
    <AnimatePresence mode="wait">
      {c.introComplete ? (
        <motion.div
          key="app"
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
              />
              <div className="page-stack">
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
        </motion.div>
      ) : (
        <IntroScreen key="intro" onEnter={c.handleEnter} />
      )}
    </AnimatePresence>
  )
}

export default AppShell
