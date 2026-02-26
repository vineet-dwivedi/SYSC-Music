import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loginWithGoogle } from '../../services/auth.js'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

const extractErrorMessage = (error) => {
  const status = Number(error?.response?.status || 0)
  const payload = error?.response?.data

  if (typeof payload === 'string') {
    const preMatch = payload.match(/<pre>(.*?)<\/pre>/i)
    if (preMatch?.[1]) {
      if (/Cannot POST \/api\/auth/i.test(preMatch[1])) {
        return 'Auth API is not deployed on backend yet. Deploy latest server build on Render.'
      }
      return preMatch[1]
    }
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message
  if (status === 404) return 'Auth API route was not found on server.'
  return error?.message || 'Something went wrong. Please try again.'
}

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google login is only available in browser'))
      return
    }
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.head.appendChild(script)
  })

function AuthPage({ mode = 'login', onModeChange, onAuthenticated }) {
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeAction, setActiveAction] = useState('')
  const [googleReady, setGoogleReady] = useState(false)

  const googleButtonRef = useRef(null)
  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()
  const isLoginMode = mode === 'login'

  const clearFeedback = useCallback(() => {
    setStatusMessage('')
    setErrorMessage('')
  }, [])

  const showSuccess = useCallback((message) => {
    setErrorMessage('')
    setStatusMessage(message)
  }, [])

  const showError = useCallback((message) => {
    setStatusMessage('')
    setErrorMessage(message)
  }, [])

  const callAuthenticated = useCallback(
    (payload) => {
      if (typeof onAuthenticated === 'function') onAuthenticated(payload)
    },
    [onAuthenticated],
  )

  const handleGoogleCredential = useCallback(
    async (credential) => {
      if (!credential) return
      clearFeedback()
      setActiveAction('google-login')
      try {
        const response = await loginWithGoogle(credential, mode)
        showSuccess(response?.message || 'Google login successful')
        callAuthenticated(response)
      } catch (error) {
        showError(extractErrorMessage(error))
      } finally {
        setActiveAction('')
      }
    },
    [callAuthenticated, clearFeedback, mode, showError, showSuccess],
  )

  useEffect(() => {
    if (!googleClientId) {
      setGoogleReady(false)
      return undefined
    }

    let isCancelled = false

    const setup = async () => {
      try {
        await loadGoogleScript()
        if (isCancelled) return

        const target = googleButtonRef.current
        if (!target || !window.google?.accounts?.id) return

        target.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: ({ credential }) => {
            handleGoogleCredential(credential)
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        })
        window.google.accounts.id.renderButton(target, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: 320,
        })
        setGoogleReady(true)
      } catch {
        if (isCancelled) return
        setGoogleReady(false)
      }
    }

    setup()

    return () => {
      isCancelled = true
    }
  }, [googleClientId, handleGoogleCredential, mode])

  useEffect(() => {
    clearFeedback()
    setActiveAction('')
  }, [clearFeedback, mode])

  const subtitle = useMemo(
    () =>
      isLoginMode
        ? 'Continue with Google'
        : 'Create your account with Google',
    [isLoginMode],
  )

  return (
    <section className="auth-page">
      <div className="auth-page__grid" />
      <div className="auth-page__glow auth-page__glow--left" />
      <div className="auth-page__glow auth-page__glow--right" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <p className="auth-card__badge">SYSC ACCESS</p>
        <h1 className="auth-card__title">{isLoginMode ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-card__subtitle">{subtitle}</p>

        <div className="auth-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={isLoginMode}
            className={`auth-switch__item ${isLoginMode ? 'is-active' : ''}`}
            onClick={() => onModeChange('login')}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLoginMode}
            className={`auth-switch__item ${!isLoginMode ? 'is-active' : ''}`}
            onClick={() => onModeChange('register')}
          >
            Register
          </button>
        </div>

        {statusMessage ? <p className="auth-feedback auth-feedback--success">{statusMessage}</p> : null}
        {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

        <div className="auth-social">
          {googleClientId ? <div className="auth-social__google" ref={googleButtonRef} /> : null}
          {!googleClientId ? (
            <p className="auth-social__hint">
              Set <code>VITE_GOOGLE_CLIENT_ID</code> in frontend env to enable Google login.
            </p>
          ) : null}
          {googleClientId && !googleReady ? (
            <p className="auth-social__hint">Loading Google sign-in...</p>
          ) : null}
          {activeAction === 'google-login' ? (
            <p className="auth-social__hint">Signing in with Google...</p>
          ) : null}
        </div>
      </motion.div>
    </section>
  )
}

export default AuthPage
