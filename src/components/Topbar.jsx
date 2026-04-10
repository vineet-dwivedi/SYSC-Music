import { motion, useReducedMotion } from 'framer-motion'

function Topbar({ onSearchOpen, onNavigate, onLogout, theme = 'ultra', onThemeToggle }) {
  const prefersReducedMotion = useReducedMotion()
  const isUltraTheme = theme === 'ultra'

  const handleThemeToggle = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    onThemeToggle?.({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    })
  }

  return (
    <header className="topbar">
      <button className="topbar__search" type="button" onClick={onSearchOpen}>
        <span className="icon icon--search" />
        <span>Search songs</span>
      </button>
      <nav className="topbar__actions" aria-label="Page navigation">
        <button className="ghost-button topbar__nav-button" type="button" onClick={() => onNavigate('home')}>
          Home
        </button>
        <button className="ghost-button topbar__nav-button" type="button" onClick={() => onNavigate('library')}>
          Library
        </button>
        <button className="ghost-button topbar__nav-button" type="button" onClick={() => onNavigate('playlist')}>
          Playlist
        </button>
        <motion.button
          className="topbar__theme-button"
          type="button"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${isUltraTheme ? 'midnight' : 'ultra'} theme`}
          title={`Switch to ${isUltraTheme ? 'midnight' : 'ultra'} theme`}
          whileHover={prefersReducedMotion ? undefined : { y: -1.5, scale: 1.03 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
          transition={prefersReducedMotion ? undefined : { type: 'spring', stiffness: 380, damping: 24 }}
        >
          <motion.span
            className="topbar__theme-visual"
            aria-hidden="true"
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    rotate: isUltraTheme ? 0 : 180,
                    scale: isUltraTheme ? 1 : 0.96,
                  }
            }
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            <motion.span
              className="topbar__theme-lenis"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: isUltraTheme ? 0 : -180,
                      scale: isUltraTheme ? 1 : 1.08,
                      opacity: isUltraTheme ? 0.9 : 0.58,
                    }
              }
              transition={{ duration: 0.85, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <span className="icon icon--lenis" />
            </motion.span>
            <span className="topbar__theme-icon-stack">
              <motion.span
                className="icon icon--sun"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        opacity: isUltraTheme ? 1 : 0,
                        rotate: isUltraTheme ? 0 : -88,
                        scale: isUltraTheme ? 1 : 0.42,
                        y: isUltraTheme ? 0 : -3,
                      }
                }
                transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              />
              <motion.span
                className="icon icon--moon"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        opacity: isUltraTheme ? 0 : 1,
                        rotate: isUltraTheme ? 88 : 0,
                        scale: isUltraTheme ? 0.42 : 1,
                        y: isUltraTheme ? 3 : 0,
                      }
                }
                transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              />
            </span>
          </motion.span>
          <span className="topbar__theme-sr">{isUltraTheme ? 'Ultra theme active' : 'Midnight theme active'}</span>
        </motion.button>
        {typeof onLogout === 'function' ? (
          <button className="ghost-button topbar__nav-button topbar__logout-button" type="button" onClick={onLogout}>
            Logout
          </button>
        ) : null}
      </nav>
    </header>
  )
}

export default Topbar
