import { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { motion, useReducedMotion } from 'framer-motion'
import '../../styles/Intro.scss'

const COUNTDOWN_LIGHTS = [0, 1, 2, 3, 4]

const SPEED_LINES = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  top: `${10 + ((index * 11) % 78)}%`,
  width: `${28 + ((index * 9) % 38)}%`,
  opacity: (0.22 + (index % 5) * 0.11).toFixed(2),
  duration: (0.92 + (index % 6) * 0.14).toFixed(2),
  delay: (index * 0.04).toFixed(2),
}))

const TRACK_MARKERS = [
  { label: 'GRID', left: '18%' },
  { label: 'SECTOR 1', left: '50%' },
  { label: 'APEX', left: '80%' },
]

const SUPPORT_CARDS = [
  {
    label: 'Launch Mode',
    value: 'Pit Wall Focus',
    copy: 'Fast lanes, tight transitions, and a race-night atmosphere before the app opens.',
  },
  {
    label: 'Telemetry',
    value: 'GSAP Driven',
    copy: 'The core sequence is timed as one controlled cinematic pass instead of scattered selectors.',
  },
  {
    label: 'Surface Feel',
    value: 'Lenis Drift',
    copy: 'A smooth stage spool adds subtle camera pressure without turning the intro into a janky scroll trap.',
  },
]

const pad = (value, size) => String(Math.max(0, Math.round(value))).padStart(size, '0')
const lenisEase = (value) => 1 - Math.pow(1 - value, 4)

export default function IntroScreen({
  onEnter,
  theme = 'ultra',
  onThemeToggle,
  isThemeTransitioning = false,
}) {
  const wrapperRef = useRef(null)
  const sceneRef = useRef(null)
  const rootRef = useRef(null)
  const enterButtonRef = useRef(null)
  const speedRef = useRef(null)
  const rpmRef = useRef(null)
  const rpmBarRef = useRef(null)
  const statusRef = useRef(null)
  const lenisRef = useRef(null)
  const introTimelineRef = useRef(null)
  const ambientTimelineRef = useRef(null)
  const enterTimelineRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isEntering, setIsEntering] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const isUltraTheme = theme === 'ultra'

  const handleEnter = useCallback(() => {
    if (isEntering) return

    const root = rootRef.current
    const wrapper = wrapperRef.current

    if (!(root instanceof HTMLElement) || !(wrapper instanceof HTMLElement)) {
      onEnter?.()
      return
    }

    setIsEntering(true)
    lenisRef.current?.stop?.()
    introTimelineRef.current?.kill()
    ambientTimelineRef.current?.kill()
    enterTimelineRef.current?.kill()

    const q = gsap.utils.selector(root)

    enterTimelineRef.current = gsap.timeline({
      defaults: {
        ease: prefersReducedMotion ? 'power1.inOut' : 'power4.inOut',
      },
      onComplete: () => {
        onEnter?.()
      },
    })

    enterTimelineRef.current
      .to(q('.f1i__launch-wash'), {
        xPercent: 0,
        opacity: prefersReducedMotion ? 0.45 : 0.92,
        duration: prefersReducedMotion ? 0.2 : 0.46,
      }, 0)
      .to(q('.f1i__cta'), {
        scale: 0.96,
        opacity: 0.25,
        duration: 0.18,
      }, 0)
      .to(q('.f1i__hero'), {
        yPercent: -8,
        opacity: 0.14,
        filter: prefersReducedMotion ? 'none' : 'blur(10px)',
        duration: prefersReducedMotion ? 0.24 : 0.56,
      }, 0.06)
      .to(q('.f1i__hud, .f1i__track, .f1i__track-glow, .f1i__speed'), {
        opacity: 0,
        duration: prefersReducedMotion ? 0.18 : 0.4,
      }, 0.1)
      .to(root, {
        scale: prefersReducedMotion ? 1.01 : 1.05,
        autoAlpha: 0,
        duration: prefersReducedMotion ? 0.28 : 0.72,
      }, 0.1)
      .to(wrapper, {
        backgroundColor: '#040404',
        duration: 0.2,
      }, 0)
  }, [isEntering, onEnter, prefersReducedMotion])

  const handleThemeToggleClick = useCallback((event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    onThemeToggle?.({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    })
  }, [onThemeToggle])

  useEffect(() => {
    if (!isReady || isEntering || typeof window === 'undefined') return undefined

    const handleKeyDown = (event) => {
      if (event.repeat) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleEnter()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleEnter, isEntering, isReady])

  useEffect(() => {
    if (!isReady || isEntering) return
    enterButtonRef.current?.focus()
  }, [isEntering, isReady])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const scene = sceneRef.current
    const root = rootRef.current

    if (
      typeof window === 'undefined' ||
      !(wrapper instanceof HTMLElement) ||
      !(scene instanceof HTMLElement) ||
      !(root instanceof HTMLElement)
    ) {
      return undefined
    }

    let cancelled = false
    let tickerHandler = null
    let autoScrollCall = null
    let speedLoop = null
    let driveTween = null
    const canUseLenis = !prefersReducedMotion && !window.matchMedia('(pointer: coarse)').matches

    const setSpeed = (value) => {
      if (speedRef.current) {
        speedRef.current.textContent = pad(value, 3)
      }
    }

    const setRpm = (value) => {
      if (rpmRef.current) {
        rpmRef.current.textContent = pad(value, 5)
      }

      if (rpmBarRef.current) {
        const progress = Math.min(Math.max(value / 15300, 0), 1)
        rpmBarRef.current.style.transform = `scaleX(${progress})`
      }
    }

    const setStatus = (value) => {
      if (statusRef.current) {
        statusRef.current.textContent = value
      }
    }

    wrapper.scrollTop = 0
    root.style.setProperty('--drive-shift', '0px')
    root.style.setProperty('--drive-progress', '0')
    setSpeed(0)
    setRpm(0)
    setStatus('Telemetry syncing')

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const speedState = { value: 0 }
      const rpmState = { value: 0 }

      gsap.set(root, { autoAlpha: 0 })
      gsap.set(q('.f1i__launch-wash'), { xPercent: -120, opacity: 0 })
      gsap.set(q('.f1i__grid'), { opacity: 0, scale: 1.03 })
      gsap.set(q('.f1i__track, .f1i__track-glow, .f1i__marker, .f1i__speed-line'), { opacity: 0 })
      gsap.set(q('.f1i__hud-chip, .f1i__hud-pill, .f1i__theme-toggle, .f1i__eyebrow, .f1i__lights, .f1i__status, .f1i__subcopy, .f1i__support-card, .f1i__cta, .f1i__footer'), {
        opacity: 0,
        y: 22,
      })
      gsap.set(q('.f1i__logo-letter'), {
        yPercent: 112,
        rotateX: -84,
        opacity: 0,
        transformOrigin: '50% 100%',
      })
      gsap.set(q('.f1i__stripe'), {
        scaleX: 0,
        opacity: 0,
        transformOrigin: '0% 50%',
      })
      gsap.set(q('.f1i__light'), {
        backgroundColor: 'var(--intro-light-off)',
        boxShadow: '0 0 0 0 transparent',
        scale: 0.84,
      })

      ambientTimelineRef.current = gsap.timeline({
        paused: prefersReducedMotion,
        repeat: -1,
        yoyo: true,
      })

      ambientTimelineRef.current
        .to(q('.f1i__track'), {
          yPercent: -3,
          duration: 3.6,
          ease: 'sine.inOut',
        }, 0)
        .to(q('.f1i__grid'), {
          yPercent: -2,
          duration: 3.6,
          ease: 'sine.inOut',
        }, 0)

      introTimelineRef.current = gsap.timeline({
        defaults: {
          ease: prefersReducedMotion ? 'power1.out' : 'expo.out',
        },
        onComplete: () => {
          if (cancelled) return
          setStatus('Press Enter to launch SYSC')
          setIsReady(true)
        },
      })

      introTimelineRef.current
        .to(root, {
          autoAlpha: 1,
          duration: 0.26,
        }, 0)
        .fromTo(q('.f1i__noise, .f1i__scanlines, .f1i__vignette'), {
          opacity: 0,
        }, {
          opacity: 1,
          duration: 0.28,
          stagger: 0.05,
        }, 0)
        .to(q('.f1i__grid'), {
          opacity: 0.86,
          scale: 1,
          duration: 0.62,
        }, 0.08)
        .to(q('.f1i__track, .f1i__track-glow, .f1i__marker'), {
          opacity: 1,
          duration: 0.56,
          stagger: 0.06,
        }, 0.16)
        .fromTo(q('.f1i__speed-line'), {
          xPercent: -180,
          opacity: 0,
        }, {
          xPercent: 0,
          opacity: (_, target) => Number(target.dataset.opacity) || 0.42,
          duration: 0.56,
          stagger: {
            each: 0.035,
            from: 'random',
          },
          ease: 'power3.out',
        }, 0.24)
        .to(q('.f1i__hud-chip, .f1i__hud-pill, .f1i__theme-toggle'), {
          opacity: 1,
          y: 0,
          duration: 0.32,
          stagger: 0.06,
        }, 0.28)
        .to(speedState, {
          value: 328,
          duration: prefersReducedMotion ? 0.28 : 1.18,
          ease: 'power3.out',
          onUpdate: () => setSpeed(speedState.value),
        }, 0.34)
        .to(rpmState, {
          value: 15300,
          duration: prefersReducedMotion ? 0.34 : 1.28,
          ease: 'power3.out',
          onUpdate: () => setRpm(rpmState.value),
        }, 0.38)
        .to(q('.f1i__eyebrow, .f1i__lights, .f1i__status'), {
          opacity: 1,
          y: 0,
          duration: 0.34,
          stagger: 0.05,
        }, 0.48)
        .call(() => setStatus('Grid lights armed'), null, 0.7)
        .to(q('.f1i__light'), {
          backgroundColor: 'var(--intro-light-on)',
          boxShadow: '0 0 0 1px var(--intro-light-ring), 0 0 22px var(--intro-light-glow)',
          scale: 1,
          duration: 0.12,
          stagger: 0.13,
          ease: 'power2.out',
        }, 0.82)
        .call(() => setStatus('Lights out, push for the apex'), null, 1.46)
        .fromTo(q('.f1i__logo-letter'), {
          yPercent: 112,
          rotateX: -84,
          opacity: 0,
        }, {
          yPercent: 0,
          rotateX: 0,
          opacity: 1,
          duration: prefersReducedMotion ? 0.28 : 0.58,
          stagger: 0.08,
          ease: 'back.out(1.6)',
        }, 1.32)
        .to(root, {
          x: 6,
          duration: 0.05,
          repeat: 5,
          yoyo: true,
          ease: 'power1.inOut',
          clearProps: 'x',
        }, 1.42)
        .to(q('.f1i__stripe'), {
          scaleX: 1,
          opacity: 1,
          duration: 0.34,
        }, 1.64)
        .to(q('.f1i__subcopy, .f1i__support-card'), {
          opacity: 1,
          y: 0,
          duration: 0.36,
          stagger: 0.08,
        }, 1.78)
        .to(q('.f1i__cta, .f1i__footer'), {
          opacity: 1,
          y: 0,
          duration: 0.32,
          stagger: 0.06,
        }, 2.02)
        .call(() => {
          if (prefersReducedMotion) return

          speedLoop = gsap.to(q('.f1i__speed-line'), {
            xPercent: 170,
            duration: (_, target) => Number(target.dataset.duration) || 1.2,
            delay: (_, target) => Number(target.dataset.delay) || 0,
            ease: 'none',
            stagger: {
              each: 0.05,
              repeat: -1,
            },
            repeat: -1,
          })
        }, null, 1.02)
    }, root)

    if (canUseLenis) {
      const lenis = new Lenis({
        wrapper,
        content: scene,
        autoRaf: false,
        smoothWheel: true,
        syncTouch: false,
        allowNestedScroll: true,
        lerp: 0.085,
        wheelMultiplier: 0.9,
      })

      const updateDrive = ({ scroll, limit, progress }) => {
        const safeLimit = Math.max(limit || 1, 1)
        const driveShift = Math.min(scroll * 0.8, 140)
        root.style.setProperty('--drive-shift', `${driveShift}px`)
        root.style.setProperty('--drive-progress', String(progress ?? scroll / safeLimit))
      }

      lenis.on('scroll', updateDrive)
      lenisRef.current = lenis
      tickerHandler = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(tickerHandler)

      const targetScroll = Math.min(Math.max(wrapper.scrollHeight - wrapper.clientHeight, 0), 180)
      if (targetScroll > 0) {
        autoScrollCall = gsap.delayedCall(0.18, () => {
          lenis.scrollTo(targetScroll, {
            duration: 1.7,
            easing: lenisEase,
          })
        })
      }
    } else {
      driveTween = gsap.to(root, {
        '--drive-shift': prefersReducedMotion ? '36px' : '84px',
        '--drive-progress': prefersReducedMotion ? 0.22 : 0.58,
        duration: prefersReducedMotion ? 0.34 : 1.8,
        ease: 'power2.out',
      })
    }

    return () => {
      cancelled = true
      speedLoop?.kill()
      autoScrollCall?.kill()
      driveTween?.kill()
      enterTimelineRef.current?.kill()
      introTimelineRef.current?.kill()
      ambientTimelineRef.current?.kill()

      if (tickerHandler) {
        gsap.ticker.remove(tickerHandler)
      }

      lenisRef.current?.destroy()
      lenisRef.current = null
      ctx.revert()
    }
  }, [prefersReducedMotion])

  return (
    <div className="f1i" ref={wrapperRef} aria-label="SYSC F1 intro screen">
      <div className="f1i__scene" ref={sceneRef}>
        <section className="f1i__stage" ref={rootRef}>
          <div className="f1i__noise" aria-hidden="true" />
          <div className="f1i__scanlines" aria-hidden="true" />
          <div className="f1i__vignette" aria-hidden="true" />
          <div className="f1i__grid" aria-hidden="true" />
          <div className="f1i__launch-wash" aria-hidden="true" />

          <div className="f1i__track" aria-hidden="true" />
          <div className="f1i__track-glow" aria-hidden="true" />

          {TRACK_MARKERS.map((marker) => (
            <span
              key={marker.label}
              className="f1i__marker"
              style={{ left: marker.left }}
              aria-hidden="true"
            >
              {marker.label}
            </span>
          ))}

          <div className="f1i__speed" aria-hidden="true">
            {SPEED_LINES.map((line) => (
              <span
                key={line.id}
                className="f1i__speed-line"
                data-delay={line.delay}
                data-duration={line.duration}
                data-opacity={line.opacity}
                style={{
                  top: line.top,
                  width: line.width,
                }}
              />
            ))}
          </div>

          <header className="f1i__hud">
            <div className="f1i__hud-group">
              <div className="f1i__hud-chip">
                <span className="f1i__hud-dot" aria-hidden="true" />
                REC LIVE
              </div>
              <div className="f1i__hud-chip">LAP 01 / NIGHT RUN</div>
              <motion.button
                className="f1i__theme-toggle"
                type="button"
                onClick={handleThemeToggleClick}
                disabled={isThemeTransitioning}
                aria-label={`Switch to ${isUltraTheme ? 'midnight' : 'ultra'} theme`}
                title={`Switch to ${isUltraTheme ? 'midnight' : 'ultra'} theme`}
                whileHover={prefersReducedMotion || isThemeTransitioning ? undefined : { y: -2, scale: 1.02 }}
                whileTap={prefersReducedMotion || isThemeTransitioning ? undefined : { scale: 0.97 }}
                transition={prefersReducedMotion ? undefined : { type: 'spring', stiffness: 320, damping: 22 }}
              >
                <motion.span
                  className="topbar__theme-visual f1i__theme-visual"
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
                <span className="f1i__theme-copy">
                  <span className="f1i__theme-copy-label">Theme</span>
                  <span className="f1i__theme-copy-value">
                    {isThemeTransitioning ? 'Switching' : isUltraTheme ? 'Ultra' : 'Midnight'}
                  </span>
                </span>
              </motion.button>
            </div>

            <div className="f1i__hud-group f1i__hud-group--stats">
              <div className="f1i__hud-pill">
                <span className="f1i__hud-label">KM/H</span>
                <span className="f1i__hud-value" ref={speedRef}>000</span>
              </div>
              <div className="f1i__hud-pill f1i__hud-pill--rpm">
                <span className="f1i__hud-label">RPM</span>
                <span className="f1i__hud-value" ref={rpmRef}>00000</span>
                <span className="f1i__rpm-bar" aria-hidden="true">
                  <span className="f1i__rpm-fill" ref={rpmBarRef} />
                </span>
              </div>
            </div>
          </header>

          <div className="f1i__hero">
            <p className="f1i__eyebrow">Race Control // audio telemetry online</p>

            <div className="f1i__lights" aria-hidden="true">
              {COUNTDOWN_LIGHTS.map((index) => (
                <span key={index} className="f1i__light" />
              ))}
            </div>

            <p
              className="f1i__status"
              ref={statusRef}
              aria-live="polite"
            >
              Telemetry syncing
            </p>

            <h1 className="f1i__logo" aria-label="SYSC" id="intro-title">
              {['S', 'Y', 'S', 'C'].map((letter, index) => (
                <span key={`${letter}-${index}`} className="f1i__logo-letter" aria-hidden="true">
                  {letter}
                </span>
              ))}
            </h1>

            <div className="f1i__stripe" aria-hidden="true" />

            <p className="f1i__subcopy">
              Chase The Beat.
            </p>

            <motion.button
              ref={enterButtonRef}
              type="button"
              className="f1i__cta"
              onClick={handleEnter}
              disabled={!isReady || isEntering}
              whileHover={prefersReducedMotion || !isReady ? undefined : { scale: 1.03, y: -2 }}
              whileTap={prefersReducedMotion || !isReady ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <span className="f1i__cta-label">
                {isEntering ? 'Launching' : isReady ? 'Enter The Grid' : 'Building Grid'}
              </span>
              <span className="f1i__cta-arrow" aria-hidden="true">
                →
              </span>
            </motion.button>

            <p className="f1i__footer">Press Enter or Space // lights out when you are ready</p>
          </div>
        </section>
      </div>
    </div>
  )
}
