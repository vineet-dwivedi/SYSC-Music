import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  loginWithGoogle,
  requestLoginOtp,
  requestRegisterOtp,
  verifyLoginOtp,
  verifyRegisterOtp,
} from '../../services/auth.js'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

const normalizeMobileInput = (value) => String(value ?? '').replace(/\D/g, '').slice(0, 15)

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
      reject(new Error('Google login is only available in the browser'))
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
  const [loginMobile, setLoginMobile] = useState('')
  const [loginOtp, setLoginOtp] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerMobile, setRegisterMobile] = useState('')
  const [registerOtp, setRegisterOtp] = useState('')

  const [loginOtpRequested, setLoginOtpRequested] = useState(false)
  const [registerOtpRequested, setRegisterOtpRequested] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [devOtpHint, setDevOtpHint] = useState('')
  const [activeAction, setActiveAction] = useState('')
  const [googleReady, setGoogleReady] = useState(false)

  const googleButtonRef = useRef(null)
  const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim()
  const isLoginMode = mode === 'login'
  const isBusy = Boolean(activeAction)
  const mobileLoginButtonLabel = loginOtpRequested ? 'Verify OTP & Login' : 'Send OTP'
  const mobileRegisterButtonLabel = registerOtpRequested ? 'Verify OTP & Register' : 'Send OTP'

  const clearFeedback = useCallback(() => {
    setStatusMessage('')
    setErrorMessage('')
    setDevOtpHint('')
  }, [])

  const showSuccess = useCallback((message, devOtp) => {
    setErrorMessage('')
    setStatusMessage(message)
    setDevOtpHint(devOtp ? `Dev pass: ${devOtp}` : '')
  }, [])

  const showDevPassHint = useCallback((devOtp) => {
    setErrorMessage('')
    setStatusMessage('')
    setDevOtpHint(devOtp ? `Dev pass: ${devOtp}` : 'Dev pass generated')
  }, [])

  const showError = useCallback((message) => {
    setStatusMessage('')
    setDevOtpHint('')
    setErrorMessage(message)
  }, [])

  const callAuthenticated = useCallback(
    (payload) => {
      if (typeof onAuthenticated === 'function') onAuthenticated(payload)
    },
    [onAuthenticated],
  )

  const handleRequestLoginOtp = useCallback(async () => {
    const mobile = normalizeMobileInput(loginMobile)
    if (mobile.length < 10) {
      showError('Enter a valid registered mobile number')
      return
    }

    clearFeedback()
    setActiveAction('login-request-otp')
    try {
      const response = await requestLoginOtp({ mobile })
      setLoginMobile(mobile)
      setLoginOtpRequested(true)
      showDevPassHint(response?.devOtp)
    } catch (error) {
      showError(extractErrorMessage(error))
    } finally {
      setActiveAction('')
    }
  }, [clearFeedback, loginMobile, showDevPassHint, showError])

  const handleVerifyLoginOtp = useCallback(async () => {
    const mobile = normalizeMobileInput(loginMobile)
    const otp = String(loginOtp ?? '').trim()
    if (mobile.length < 10) {
      showError('Enter a valid registered mobile number')
      return
    }
    if (!/^\d{6}$/.test(otp)) {
      showError('Enter a valid 6-digit OTP')
      return
    }

    clearFeedback()
    setActiveAction('login-verify-otp')
    try {
      const response = await verifyLoginOtp({ mobile, otp })
      showSuccess(response?.message || 'Login successful')
      callAuthenticated(response)
    } catch (error) {
      showError(extractErrorMessage(error))
    } finally {
      setActiveAction('')
    }
  }, [callAuthenticated, clearFeedback, loginMobile, loginOtp, showError, showSuccess])

  const handleRequestRegisterOtp = useCallback(async () => {
    const name = String(registerName ?? '').trim()
    const mobile = normalizeMobileInput(registerMobile)
    if (!name) {
      showError('Name is required')
      return
    }
    if (mobile.length < 10) {
      showError('Enter a valid mobile number')
      return
    }

    clearFeedback()
    setActiveAction('register-request-otp')
    try {
      const response = await requestRegisterOtp({ name, mobile })
      setRegisterName(name)
      setRegisterMobile(mobile)
      setRegisterOtpRequested(true)
      showDevPassHint(response?.devOtp)
    } catch (error) {
      showError(extractErrorMessage(error))
    } finally {
      setActiveAction('')
    }
  }, [clearFeedback, registerMobile, registerName, showDevPassHint, showError])

  const handleVerifyRegisterOtp = useCallback(async () => {
    const name = String(registerName ?? '').trim()
    const mobile = normalizeMobileInput(registerMobile)
    const otp = String(registerOtp ?? '').trim()
    if (!name) {
      showError('Name is required')
      return
    }
    if (mobile.length < 10) {
      showError('Enter a valid mobile number')
      return
    }
    if (!/^\d{6}$/.test(otp)) {
      showError('Enter a valid 6-digit OTP')
      return
    }

    clearFeedback()
    setActiveAction('register-verify-otp')
    try {
      const response = await verifyRegisterOtp({ name, mobile, otp })
      showSuccess(response?.message || 'Registration successful')
      callAuthenticated(response)
    } catch (error) {
      showError(extractErrorMessage(error))
    } finally {
      setActiveAction('')
    }
  }, [
    callAuthenticated,
    clearFeedback,
    registerMobile,
    registerName,
    registerOtp,
    showError,
    showSuccess,
  ])

  const handleGoogleCredential = useCallback(
    async (credential) => {
      if (!credential) return
      clearFeedback()
      setActiveAction('google-login')
      try {
        const response = await loginWithGoogle(credential)
        showSuccess(response?.message || 'Google login successful')
        callAuthenticated(response)
      } catch (error) {
        showError(extractErrorMessage(error))
      } finally {
        setActiveAction('')
      }
    },
    [callAuthenticated, clearFeedback, showError, showSuccess],
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
      } catch (error) {
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
    if (mode === 'login') {
      setRegisterOtp('')
      setRegisterOtpRequested(false)
      return
    }
    setLoginOtp('')
    setLoginOtpRequested(false)
  }, [clearFeedback, mode])

  const subtitle = useMemo(
    () =>
      isLoginMode
        ? 'enter ur number to get dev pass to sign in'
        : 'enter phone no. to get dev otp',
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
        {devOtpHint ? <p className="auth-feedback auth-feedback--info">{devOtpHint}</p> : null}
        {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

        {isLoginMode ? (
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (loginOtpRequested) {
                handleVerifyLoginOtp()
                return
              }
              handleRequestLoginOtp()
            }}
          >
            <label className="auth-form__field">
              <span>Registered mobile number</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="enter ur number to get dev pass to sign in"
                value={loginMobile}
                onChange={(event) => setLoginMobile(normalizeMobileInput(event.target.value))}
                disabled={isBusy}
              />
            </label>
            {!loginOtpRequested ? (
              <p className="auth-form__hint">enter ur number to get dev pass to sign in</p>
            ) : null}

            {loginOtpRequested ? (
              <label className="auth-form__field">
                <span>OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  value={loginOtp}
                  onChange={(event) => setLoginOtp(normalizeMobileInput(event.target.value).slice(0, 6))}
                  disabled={isBusy}
                />
              </label>
            ) : null}

            <button className="primary-button auth-form__submit" type="submit" disabled={isBusy}>
              {isBusy ? 'Please wait...' : mobileLoginButtonLabel}
            </button>

            {loginOtpRequested ? (
              <button
                type="button"
                className="auth-form__meta-link"
                disabled={isBusy}
                onClick={handleRequestLoginOtp}
              >
                Resend OTP
              </button>
            ) : null}
          </form>
        ) : (
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (registerOtpRequested) {
                handleVerifyRegisterOtp()
                return
              }
              handleRequestRegisterOtp()
            }}
          >
            <label className="auth-form__field">
              <span>Full name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                disabled={isBusy}
              />
            </label>

            <label className="auth-form__field">
              <span>Mobile number</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="enter phone no. to get dev otp"
                value={registerMobile}
                onChange={(event) => setRegisterMobile(normalizeMobileInput(event.target.value))}
                disabled={isBusy}
              />
            </label>
            {!registerOtpRequested ? (
              <p className="auth-form__hint">enter phone no. to get dev otp</p>
            ) : null}

            {registerOtpRequested ? (
              <label className="auth-form__field">
                <span>OTP</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit OTP"
                  value={registerOtp}
                  onChange={(event) => setRegisterOtp(normalizeMobileInput(event.target.value).slice(0, 6))}
                  disabled={isBusy}
                />
              </label>
            ) : null}

            <button className="primary-button auth-form__submit" type="submit" disabled={isBusy}>
              {isBusy ? 'Please wait...' : mobileRegisterButtonLabel}
            </button>

            {registerOtpRequested ? (
              <button
                type="button"
                className="auth-form__meta-link"
                disabled={isBusy}
                onClick={handleRequestRegisterOtp}
              >
                Resend OTP
              </button>
            ) : null}
          </form>
        )}

        <>
          <div className="auth-divider" aria-hidden="true">
            <span>or</span>
          </div>
          <div className="auth-google">
            {googleClientId ? <div className="auth-google__button" ref={googleButtonRef} /> : null}
            {!googleClientId ? (
              <p className="auth-google__hint">
                Set <code>VITE_GOOGLE_CLIENT_ID</code> in frontend env to enable Google login.
              </p>
            ) : null}
            {googleClientId && !googleReady ? (
              <p className="auth-google__hint">Loading Google sign-in...</p>
            ) : null}
          </div>
        </>
      </motion.div>
    </section>
  )
}

export default AuthPage
