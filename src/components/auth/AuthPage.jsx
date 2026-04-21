import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../../services/auth.js'

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

const MotionButton = motion.button
const MotionDiv = motion.div
const MotionForm = motion.form
const MotionH1 = motion.h1
const MotionP = motion.p

const extractErrorMessage = (error) => {
  const status = Number(error?.response?.status || 0)
  const payload = error?.response?.data

  if (typeof payload === 'string') {
    const preMatch = payload.match(/<pre>(.*?)<\/pre>/i)
    if (preMatch?.[1]) {
      if (/Cannot POST \/api\/auth/i.test(preMatch[1])) {
        return 'Auth API is not deployed on backend yet. Deploy the latest server build first.'
      }
      return preMatch[1]
    }
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message
  if (status === 404) return 'Auth API route was not found on the server.'
  return error?.message || 'Something went wrong. Please try again.'
}

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google login is only available in the browser'))
      return
    }

    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Sign-In')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(script)
  })

function AuthPage({ mode = 'login', onModeChange, onAuthenticated }) {
  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()
  const isLoginMode = mode === 'login'

  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeAction, setActiveAction] = useState('')
  const [googleReady, setGoogleReady] = useState(false)
  const [authMethod, setAuthMethod] = useState(() => (googleClientId ? 'google' : 'email'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')

  const googleShellRef = useRef(null)
  const googleButtonRef = useRef(null)

  const isEmailBusy = activeAction === 'email-login' || activeAction === 'email-register'
  const isGoogleBusy = activeAction === 'google-login'
  const isBusy = Boolean(activeAction)

  const clearFeedback = useCallback(() => {
    setStatusMessage('')
    setErrorMessage('')
  }, [])

  const resetEmailForm = useCallback(() => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
  }, [])

  const showSuccess = useCallback((message) => {
    setErrorMessage('')
    setStatusMessage(message)
  }, [])

  const showError = useCallback((message) => {
    setStatusMessage('')
    setErrorMessage(message)
  }, [])

  const completeAuthentication = useCallback(
    (payload, fallbackMessage) => {
      if (payload?.token && payload?.user) {
        showSuccess(payload?.message || fallbackMessage)
        window.setTimeout(() => {
          if (typeof onAuthenticated === 'function') onAuthenticated(payload)
        }, 300)
        return
      }

      showError('Invalid response from server')
      setActiveAction('')
    },
    [onAuthenticated, showError, showSuccess],
  )

  const submitGoogleCredential = useCallback(async (credential) => {
    if (!credential) {
      showError('No credential received from Google')
      return
    }

    clearFeedback()
    setActiveAction('google-login')

    try {
      const response = await loginWithGoogle(credential, mode)
      completeAuthentication(response, 'Google login successful')
    } catch (error) {
      console.error('Google auth error:', error)
      showError(extractErrorMessage(error))
      setActiveAction('')
    }
  }, [clearFeedback, completeAuthentication, mode, showError])

  const handleGoogleCredential = useEffectEvent((credential) => {
    void submitGoogleCredential(credential)
  })

  useEffect(() => {
    if (!googleClientId || authMethod !== 'google') {
      return undefined
    }

    let isCancelled = false
    let resizeObserver
    let resizeFrame = 0
    let lastRenderedWidth = 0
    const buttonHost = googleButtonRef.current

    const renderGoogleButton = () => {
      if (isCancelled || !window.google?.accounts?.id) return

      const shell = googleShellRef.current
      const target = googleButtonRef.current
      if (!shell || !target) return

      const width = Math.max(220, Math.min(360, Math.round(shell.clientWidth) - 12 || 320))
      if (Math.abs(width - lastRenderedWidth) < 2 && target.childElementCount > 0) return

      lastRenderedWidth = width
      target.replaceChildren()
      window.google.accounts.id.renderButton(target, {
        theme: 'filled_black',
        size: 'large',
        text: isLoginMode ? 'signin_with' : 'signup_with',
        shape: 'pill',
        width,
        locale: 'en',
      })
      setGoogleReady(true)
    }

    const setupGoogleButton = async () => {
      try {
        setGoogleReady(false)
        await loadGoogleScript()
        if (isCancelled || !window.google?.accounts?.id) return

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (!isCancelled && response?.credential) {
              handleGoogleCredential(response.credential)
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          context: isLoginMode ? 'signin' : 'signup',
          ux_mode: 'popup',
          error_callback: () => {
            if (!isCancelled) {
              showError('Failed to initialize Google Sign-In')
            }
          },
        })

        renderGoogleButton()

        if (typeof ResizeObserver === 'function' && googleShellRef.current) {
          resizeObserver = new ResizeObserver(() => {
            if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
            resizeFrame = window.requestAnimationFrame(renderGoogleButton)
          })
          resizeObserver.observe(googleShellRef.current)
        } else {
          const handleResize = () => {
            if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
            resizeFrame = window.requestAnimationFrame(renderGoogleButton)
          }
          window.addEventListener('resize', handleResize, { passive: true })
          resizeObserver = {
            disconnect: () => window.removeEventListener('resize', handleResize),
          }
        }
      } catch (error) {
        if (isCancelled) return
        console.error('Google setup error:', error)
        setGoogleReady(false)
        showError(error.message || 'Failed to load Google Sign-In')
      }
    }

    setupGoogleButton()

    return () => {
      isCancelled = true
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame)
      resizeObserver?.disconnect()

      try {
        window.google?.accounts?.id?.cancel()
        buttonHost?.replaceChildren()
      } catch {
        // Ignore cleanup errors from the Google iframe host.
      }
    }
  }, [authMethod, googleClientId, isLoginMode, showError])

  const subtitle = useMemo(() => {
    if (authMethod === 'email') {
      return isLoginMode ? 'Sign in with your email and password' : 'Create an account with your email'
    }

    return isLoginMode ? 'Continue with Google in one tap' : 'Create your account with Google'
  }, [authMethod, isLoginMode])

  const handleAuthMethodChange = (nextMethod) => {
    if (isBusy) return
    clearFeedback()
    setActiveAction('')
    setAuthMethod(nextMethod === 'email' ? 'email' : 'google')
  }

  const handleEmailLogin = async (event) => {
    event.preventDefault()
    clearFeedback()

    if (!email || !password) {
      showError('Email and password are required')
      return
    }

    setActiveAction('email-login')

    try {
      const response = await loginWithEmail(email, password)
      completeAuthentication(response, 'Login successful')
      resetEmailForm()
    } catch (error) {
      console.error('Email login error:', error)
      showError(extractErrorMessage(error))
      setActiveAction('')
    }
  }

  const handleEmailRegister = async (event) => {
    event.preventDefault()
    clearFeedback()

    if (!name || !email || !password || !confirmPassword) {
      showError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters')
      return
    }

    setActiveAction('email-register')

    try {
      const response = await registerWithEmail(email, password, confirmPassword, name)
      completeAuthentication(response, 'Registration successful')
      resetEmailForm()
    } catch (error) {
      console.error('Email register error:', error)
      showError(extractErrorMessage(error))
      setActiveAction('')
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-page__grid" />
      <div className="auth-page__glow auth-page__glow--left" />
      <div className="auth-page__glow auth-page__glow--right" />

      <MotionDiv className="auth-card" initial="hidden" animate="visible" variants={cardVariants}>
        <MotionDiv className="auth-card__brand" variants={itemVariants}>
          <img className="auth-card__logo" src="/sysc-logo.svg" alt="SYSC Music logo" width="34" height="34" />
          <p className="auth-card__badge">SYSC ACCESS</p>
        </MotionDiv>

        <AnimatePresence mode="wait">
          <MotionH1
            key={`title-${mode}`}
            className="auth-card__title"
            variants={modeTextVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {isLoginMode ? 'Welcome back' : 'Create account'}
          </MotionH1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <MotionP
            key={`subtitle-${mode}-${authMethod}`}
            className="auth-card__subtitle"
            variants={modeTextVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {subtitle}
          </MotionP>
        </AnimatePresence>

        <MotionDiv className="auth-switch" role="tablist" aria-label="Authentication mode" variants={itemVariants}>
          <MotionButton
            type="button"
            role="tab"
            aria-selected={isLoginMode}
            className={`auth-switch__item ${isLoginMode ? 'is-active' : ''}`}
            onClick={() => onModeChange?.('login')}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Login
          </MotionButton>
          <MotionButton
            type="button"
            role="tab"
            aria-selected={!isLoginMode}
            className={`auth-switch__item ${!isLoginMode ? 'is-active' : ''}`}
            onClick={() => onModeChange?.('register')}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Register
          </MotionButton>
        </MotionDiv>

        <AnimatePresence mode="popLayout">
          {statusMessage ? (
            <MotionP
              key="auth-status"
              className="auth-feedback auth-feedback--success"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {statusMessage}
            </MotionP>
          ) : null}
          {errorMessage ? (
            <MotionP
              key="auth-error"
              className="auth-feedback auth-feedback--error"
              variants={feedbackVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {errorMessage}
            </MotionP>
          ) : null}
        </AnimatePresence>

        <MotionDiv className="auth-method-selector" variants={itemVariants}>
          <MotionButton
            type="button"
            className={`auth-method-btn ${authMethod === 'google' ? 'is-active' : ''}`}
            onClick={() => handleAuthMethodChange('google')}
            disabled={isBusy}
            whileHover={isBusy ? undefined : { scale: 1.02 }}
            whileTap={isBusy ? undefined : { scale: 0.98 }}
          >
            Google
          </MotionButton>
          <MotionButton
            type="button"
            className={`auth-method-btn ${authMethod === 'email' ? 'is-active' : ''}`}
            onClick={() => handleAuthMethodChange('email')}
            disabled={isBusy}
            whileHover={isBusy ? undefined : { scale: 1.02 }}
            whileTap={isBusy ? undefined : { scale: 0.98 }}
          >
            Email
          </MotionButton>
        </MotionDiv>

        <AnimatePresence mode="wait">
          {authMethod === 'google' ? (
            <MotionDiv
              key="google-auth"
              className="auth-social"
              variants={itemVariants}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {googleClientId ? (
                <div className={`auth-social__google-shell ${googleReady ? 'is-ready' : ''}`} ref={googleShellRef}>
                  <div className="auth-social__google" ref={googleButtonRef} />
                </div>
              ) : null}
              {!googleClientId ? (
                <p className="auth-social__hint">
                  Set <code>VITE_GOOGLE_CLIENT_ID</code> in the frontend env to enable Google login.
                </p>
              ) : null}
              {googleClientId && !googleReady ? (
                <p className="auth-social__hint">Loading Google sign-in...</p>
              ) : null}
              {isGoogleBusy ? (
                <p className="auth-social__hint">Signing in with Google...</p>
              ) : null}
            </MotionDiv>
          ) : (
            <MotionForm
              key="email-auth"
              className="auth-email-form"
              onSubmit={isLoginMode ? handleEmailLogin : handleEmailRegister}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {!isLoginMode ? (
                <MotionDiv className="auth-form-group" variants={itemVariants}>
                  <label htmlFor="name" className="auth-form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="auth-form-input"
                    placeholder="Your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    disabled={isEmailBusy}
                    required
                  />
                </MotionDiv>
              ) : null}

              <MotionDiv className="auth-form-group" variants={itemVariants}>
                <label htmlFor="email" className="auth-form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="auth-form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  disabled={isEmailBusy}
                  required
                />
              </MotionDiv>

              <MotionDiv className="auth-form-group" variants={itemVariants}>
                <label htmlFor="password" className="auth-form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="auth-form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isLoginMode ? 'current-password' : 'new-password'}
                  disabled={isEmailBusy}
                  required
                />
              </MotionDiv>

              {!isLoginMode ? (
                <>
                  <MotionDiv className="auth-form-group" variants={itemVariants}>
                    <label htmlFor="confirmPassword" className="auth-form-label">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="auth-form-input"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      disabled={isEmailBusy}
                      required
                    />
                  </MotionDiv>

                  <p className="auth-email-form__hint">
                    Use at least 8 characters with uppercase, lowercase, a number, and a special character.
                  </p>
                </>
              ) : null}

              <MotionButton
                type="submit"
                className="auth-form-submit"
                disabled={isEmailBusy}
                whileHover={isEmailBusy ? undefined : { scale: 1.02 }}
                whileTap={isEmailBusy ? undefined : { scale: 0.98 }}
                variants={itemVariants}
              >
                {isEmailBusy
                  ? isLoginMode
                    ? 'Signing in...'
                    : 'Creating account...'
                  : isLoginMode
                    ? 'Sign In'
                    : 'Create Account'}
              </MotionButton>
            </MotionForm>
          )}
        </AnimatePresence>
      </MotionDiv>
    </section>
  )
}

export default AuthPage
