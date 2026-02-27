import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loginWithGoogle } from '../../services/auth.js'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 0.61, 0.36, 1],
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
  },
}

const modeTextVariants = {
  initial: { opacity: 0, y: 8, filter: 'blur(6px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.36, ease: [0.22, 0.61, 0.36, 1] },
  },
  exit: { opacity: 0, y: -8, filter: 'blur(6px)', transition: { duration: 0.2 } },
}

const feedbackVariants = {
  initial: { opacity: 0, y: -8, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.22, 0.61, 0.36, 1] },
  },
  exit: { opacity: 0, y: -6, scale: 0.99, transition: { duration: 0.18 } },
}

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
    let resizeRafId = 0
    let lastRenderedWidth = 0
    let removeResizeListener = () => {}

    const setup = async () => {
      try {
        await loadGoogleScript()
        if (isCancelled) return

        const target = googleButtonRef.current
        if (!target || !window.google?.accounts?.id) return

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: ({ credential }) => {
            handleGoogleCredential(credential)
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        const renderGoogleButton = () => {
          if (!target || !window.google?.accounts?.id) return
          const host = target.parentElement ?? target
          const containerWidth = Math.round(host.getBoundingClientRect().width || 0)
          const width = Math.max(220, Math.min(340, containerWidth || 320))
          if (Math.abs(width - lastRenderedWidth) < 2) return
          lastRenderedWidth = width

          target.innerHTML = ''
          window.google.accounts.id.renderButton(target, {
            theme: 'filled_black',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width,
          })
        }

        renderGoogleButton()

        const handleResize = () => {
          if (resizeRafId) window.cancelAnimationFrame(resizeRafId)
          resizeRafId = window.requestAnimationFrame(() => {
            renderGoogleButton()
          })
        }
        window.addEventListener('resize', handleResize, { passive: true })
        removeResizeListener = () => {
          window.removeEventListener('resize', handleResize)
        }
        setGoogleReady(true)
      } catch {
        if (isCancelled) return
        setGoogleReady(false)
      }
    }

    setup()

    return () => {
      isCancelled = true
      if (resizeRafId) window.cancelAnimationFrame(resizeRafId)
      removeResizeListener()
    }
  }, [googleClientId, handleGoogleCredential, mode])

  useEffect(() => {
    clearFeedback()
    setActiveAction('')
  }, [clearFeedback, mode])

  const subtitle = useMemo(
    () => (isLoginMode ? 'Continue with Google' : 'Create your account with Google'),
    [isLoginMode],
  )

  return (
    <section className="auth-page">
      <div className="auth-page__grid" />
      <div className="auth-page__glow auth-page__glow--left" />
      <div className="auth-page__glow auth-page__glow--right" />

      <motion.div
        className="auth-card"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <motion.p className="auth-card__badge" variants={itemVariants}>
          SYSC ACCESS
        </motion.p>

        <AnimatePresence mode="wait">
          <motion.h1
            key={`title-${mode}`}
            className="auth-card__title"
            variants={modeTextVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {isLoginMode ? 'Welcome back' : 'Create account'}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`subtitle-${mode}`}
            className="auth-card__subtitle"
            variants={modeTextVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {subtitle}
          </motion.p>
        </AnimatePresence>

        <motion.div className="auth-switch" role="tablist" aria-label="Authentication mode" variants={itemVariants}>
          <motion.button
            type="button"
            role="tab"
            aria-selected={isLoginMode}
            className={`auth-switch__item ${isLoginMode ? 'is-active' : ''}`}
            onClick={() => onModeChange('login')}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Login
          </motion.button>
          <motion.button
            type="button"
            role="tab"
            aria-selected={!isLoginMode}
            className={`auth-switch__item ${!isLoginMode ? 'is-active' : ''}`}
            onClick={() => onModeChange('register')}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Register
          </motion.button>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {statusMessage ? (
            <motion.p
              key="auth-status"
              className="auth-feedback auth-feedback--success"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {statusMessage}
            </motion.p>
          ) : null}
          {errorMessage ? (
            <motion.p
              key="auth-error"
              className="auth-feedback auth-feedback--error"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {errorMessage}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <motion.div className="auth-social" variants={itemVariants}>
          {googleClientId ? (
            <motion.div className="auth-social__google-shell" variants={itemVariants}>
              <div className="auth-social__google" ref={googleButtonRef} />
            </motion.div>
          ) : null}
          {!googleClientId ? (
            <motion.p className="auth-social__hint" variants={itemVariants}>
              Set <code>VITE_GOOGLE_CLIENT_ID</code> in frontend env to enable Google login.
            </motion.p>
          ) : null}
          {googleClientId && !googleReady ? (
            <motion.p className="auth-social__hint" variants={itemVariants}>
              Loading Google sign-in...
            </motion.p>
          ) : null}
          {activeAction === 'google-login' ? (
            <motion.p className="auth-social__hint" variants={itemVariants}>
              Signing in with Google...
            </motion.p>
          ) : null}
        </motion.div>
      </motion.div>
    </section>
  )
}

export default AuthPage
