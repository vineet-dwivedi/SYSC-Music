import { useCallback, useEffect, useState } from 'react'
import AppShell from './components/AppShell.jsx'
import AuthPage from './components/auth/AuthPage.jsx'
import { useAppController } from './hooks/useAppController.js'

const AUTH_STORAGE_KEY = 'sysc.auth.session.v1'
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

const persistSession = (session) => {
  if (typeof window === 'undefined') return
  if (session) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    return
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

function AppContent({ authSession, onLogout }) {
  const controller = useAppController()
  return <AppShell c={{ ...controller, authSession, handleLogout: onLogout }} />
}

function App() {
  const [session, setSession] = useState(() => readStoredSession())
  const [authMode, setAuthMode] = useState(() => {
    if (typeof window === 'undefined') return 'login'
    return getAuthModeFromPathname(window.location.pathname)
  })

  useEffect(() => {
    persistSession(session)
  }, [session])

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

  if (!session) {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={handleModeChange}
        onAuthenticated={handleAuthenticated}
      />
    )
  }

  return <AppContent authSession={session} onLogout={handleLogout} />
}

export default App
