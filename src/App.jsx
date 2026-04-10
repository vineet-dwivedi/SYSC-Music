import { useCallback, useEffect, useState } from 'react'
import AppShell from './components/AppShell.jsx'
import AuthPage from './components/auth/AuthPage.jsx'
import { useAppController } from './hooks/useAppController.js'

const AUTH_STORAGE_KEY = 'sysc.auth.session.v1'
const THEME_STORAGE_KEY = 'sysc.theme.v1'
const DEFAULT_THEME = 'ultra'
const LOGIN_PATH = '/login'
const REGISTER_PATH = '/register'

const normalizePathname = (pathname) => {
  const raw = String(pathname ?? '').trim()
  if (!raw) return '/'
  return raw.length > 1 ? raw.replace(/\/+$/, '') || '/' : raw
}

const getAuthModeFromPathname = (pathname) =>
  normalizePathname(pathname) === REGISTER_PATH ? 'register' : 'login'

const isAuthPath = (pathname) => {
  const normalized = normalizePathname(pathname)
  return normalized === LOGIN_PATH || normalized === REGISTER_PATH
}

const readStoredSession = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.token || !parsed?.user) return null
    return parsed
  } catch {
    return null
  }
}

const resolveTheme = (value) => (value === 'midnight' ? 'midnight' : DEFAULT_THEME)

const readStoredTheme = () => {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    return resolveTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return DEFAULT_THEME
  }
}

const applyThemeToDocument = (theme) => {
  if (typeof document === 'undefined') return
  const themeColor = theme === 'midnight' ? '#0b1020' : '#f7f9ff'
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme === 'midnight' ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)
}

const computeThemeTransitionRadius = (origin) => {
  if (typeof window === 'undefined') return 0

  const maxX = Math.max(origin.x, window.innerWidth - origin.x)
  const maxY = Math.max(origin.y, window.innerHeight - origin.y)
  return Math.hypot(maxX, maxY) + 140
}

const persistSession = (session) => {
  if (typeof window === 'undefined') return
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    return
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

const initialTheme = readStoredTheme()
applyThemeToDocument(initialTheme)

function AppContent({
  authSession,
  onLogout,
  theme,
  themeTransition,
  onThemeToggle,
  onThemeTransitionCommit,
  onThemeTransitionComplete,
}) {
  const controller = useAppController()

  return (
    <AppShell
      c={{
        ...controller,
        authSession,
        handleLogout: onLogout,
        theme,
        themeTransition,
        handleThemeToggle: onThemeToggle,
        handleThemeTransitionCommit: onThemeTransitionCommit,
        handleThemeTransitionComplete: onThemeTransitionComplete,
      }}
    />
  )
}

function App() {
  const [session, setSession] = useState(() => readStoredSession())
  const [theme, setTheme] = useState(() => initialTheme)
  const [themeTransition, setThemeTransition] = useState(null)
  const [authMode, setAuthMode] = useState(() => {
    if (typeof window === 'undefined') return 'login'
    return getAuthModeFromPathname(window.location.pathname)
  })

  useEffect(() => {
    persistSession(session)
  }, [session])

  useEffect(() => {
    applyThemeToDocument(theme)
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // Ignore storage failures and keep the in-memory theme.
    }
  }, [theme])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const syncAuthMode = () => {
      setAuthMode(getAuthModeFromPathname(window.location.pathname))
    }

    window.addEventListener('popstate', syncAuthMode)
    return () => window.removeEventListener('popstate', syncAuthMode)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || session) return
    if (isAuthPath(window.location.pathname)) {
      setAuthMode(getAuthModeFromPathname(window.location.pathname))
      return
    }
    window.history.replaceState({ page: 'login' }, '', LOGIN_PATH)
    setAuthMode('login')
  }, [session])

  const handleModeChange = useCallback((nextMode) => {
    const safeMode = nextMode === 'register' ? 'register' : 'login'
    setAuthMode(safeMode)
    if (typeof window === 'undefined') return

    const targetPath = safeMode === 'register' ? REGISTER_PATH : LOGIN_PATH
    if (normalizePathname(window.location.pathname) === targetPath) return
    window.history.pushState({ page: safeMode }, '', targetPath)
  }, [])

  const handleAuthenticated = useCallback((authPayload) => {
    if (!authPayload?.token || !authPayload?.user) return
    setSession(authPayload)
    if (typeof window !== 'undefined') {
      window.history.pushState({ page: 'home' }, '', '/home')
    }
  }, [])

  const handleLogout = useCallback(() => {
    setSession(null)
    if (typeof window !== 'undefined') {
      window.history.pushState({ page: 'login' }, '', LOGIN_PATH)
      setAuthMode('login')
    }
  }, [])

  const handleThemeToggle = useCallback((origin) => {
    if (themeTransition) return

    const nextTheme = theme === 'midnight' ? DEFAULT_THEME : 'midnight'
    const fallbackOrigin = typeof window === 'undefined'
      ? { x: 0, y: 0 }
      : { x: window.innerWidth - 84, y: 40 }

    const safeOrigin =
      Number.isFinite(origin?.x) && Number.isFinite(origin?.y)
        ? { x: origin.x, y: origin.y }
        : fallbackOrigin

    setThemeTransition({
      id: Date.now(),
      fromTheme: theme,
      toTheme: nextTheme,
      committed: false,
      radius: computeThemeTransitionRadius(safeOrigin),
      ...safeOrigin,
    })
  }, [theme, themeTransition])

  const handleThemeTransitionCommit = useCallback(({ id, theme: nextTheme }) => {
    setTheme(resolveTheme(nextTheme))
    setThemeTransition((current) => {
      if (!current || current.id !== id || current.committed) return current
      return {
        ...current,
        committed: true,
      }
    })
  }, [])

  const handleThemeTransitionComplete = useCallback((id) => {
    setThemeTransition((current) => {
      if (!current || current.id !== id) return current
      return null
    })
  }, [])

  if (!session) {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={handleModeChange}
        onAuthenticated={handleAuthenticated}
      />
    )
  }

  return (
    <AppContent
      authSession={session}
      onLogout={handleLogout}
      theme={theme}
      themeTransition={themeTransition}
      onThemeToggle={handleThemeToggle}
      onThemeTransitionCommit={handleThemeTransitionCommit}
      onThemeTransitionComplete={handleThemeTransitionComplete}
    />
  )
}

export default App
