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
          className="ghost-button topbar__theme-button"
          type="button"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${isUltraTheme ? 'midnight' : 'ultra'} theme`}
          whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.01 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        >
          <span className="topbar__theme-visual" aria-hidden="true">
            <motion.span
              className="topbar__theme-lenis"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      rotate: isUltraTheme ? 0 : 180,
                      scale: isUltraTheme ? 1 : 1.06,
                    }
              }
              transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
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
                        rotate: isUltraTheme ? 0 : -80,
                        scale: isUltraTheme ? 1 : 0.5,
                      }
                }
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              />
              <motion.span
                className="icon icon--moon"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        opacity: isUltraTheme ? 0 : 1,
                        rotate: isUltraTheme ? 80 : 0,
                        scale: isUltraTheme ? 0.45 : 1,
                      }
                }
                transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
              />
            </span>
          </span>
          <span className="topbar__theme-copy">
            <span className="topbar__theme-label">Theme</span>
            <span className="topbar__theme-value">{isUltraTheme ? 'Ultra' : 'Midnight'}</span>
          </span>
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
