import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import '../../styles/Intro.css'

// ─── SYSC × F1 Cinematic Intro ───────────────────────────────────────────────
// Drop-in component. Just pass onEnter={() => setIntroComplete(true)}
// ─────────────────────────────────────────────────────────────────────────────
// OPTIONAL AUDIO ENHANCEMENT:
// To add engine rev sound on countdown "GO!":
// 1. Save your audio file: /public/audio/engine-rev.mp3 (0.5-1.5s duration)
// 2. Uncomment the audio playback code below (search for "AUDIO_ENHANCEMENT")
// 3. Import: import engineRevSfx from '../../../public/audio/engine-rev.mp3'
// ─────────────────────────────────────────────────────────────────────────────

const LINE_CONFIGS = Array.from({ length: 20 }, (_, i) => ({
  height : i % 4 === 0 ? '2.5px' : i % 3 === 0 ? '1.5px' : '1px',
  width  : `${38 + (i * 3.7) % 44}%`,
  opacity: 0.25 + (i % 6) * 0.10,
  top    : `${i * 5 + (i % 3) * 0.6 + 1.2}%`,
  color  : i % 7 === 0 ? '#E10600' : '#ffffff',
}))

export default function IntroScreen({ onEnter }) {
  const rootRef     = useRef(null)
  const enteredRef  = useRef(false)
  const tlRef       = useRef(null)
  const rpmRafRef   = useRef(null)
  const timerRafRef = useRef(null)

  // ── Safe Enter ───────────────────────────────────────────────────────────
  const safeEnter = () => {
    if (enteredRef.current) return
    enteredRef.current = true
    tlRef.current?.kill()
    if (rpmRafRef.current)   cancelAnimationFrame(rpmRafRef.current)
    if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current)

    const root = rootRef.current
    if (!root) { onEnter?.(); return }

    // Optional: Trigger subtle vibration if supported
    if (navigator?.vibrate) {
      navigator.vibrate([10, 5, 10])
    }

    // Scan line sweep on exit
    const scan = root.querySelector('.f1i__scan-line')
    gsap.fromTo(scan,
      { top: '0%', autoAlpha: 1 },
      { top: '100%', duration: 0.4, ease: 'power2.in' }
    )

    // Flash the enter button on click
    const btn = root.querySelector('.f1i__enter')
    gsap.to(btn, { opacity: 0.6, duration: 0.12, ease: 'power2.in' })

    gsap.to(root, {
      yPercent : -105,
      duration : 0.72,
      delay    : 0.18,
      ease     : 'power4.inOut',
      onComplete: onEnter,
    })
  }

  // ── RPM counter ──────────────────────────────────────────────────────────
  const animateRpm = (from, to, ms, el) => {
    if (!el) return
    const start = performance.now()
    const barFill = rootRef.current?.querySelector('.f1i__rpm-bar-fill')
    const tick = (now) => {
      const t      = Math.min((now - start) / ms, 1)
      const eased  = 1 - (1 - t) * (1 - t)
      const val    = Math.round(from + (to - from) * eased)
      el.textContent = String(val).padStart(4, '0')
      if (barFill) barFill.style.width = `${(val / 9500) * 100}%`
      if (t < 1)   rpmRafRef.current = requestAnimationFrame(tick)
      else         el.textContent = String(to).padStart(4, '0')
    }
    rpmRafRef.current = requestAnimationFrame(tick)
  }

  // ── Telemetry lap timer ──────────────────────────────────────────────────
  const startTimer = (el) => {
    if (!el) return
    const start = performance.now()
    const tick = (now) => {
      const ms       = Math.round(now - start)
      const mins     = String(Math.floor(ms / 60000)).padStart(2, '0')
      const secs     = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
      const centis   = String(Math.floor((ms % 1000) / 10)).padStart(3, '0')
      el.textContent = `${mins}:${secs}.${centis}`
      timerRafRef.current = requestAnimationFrame(tick)
    }
    timerRafRef.current = requestAnimationFrame(tick)
  }

  // ── Main Timeline ────────────────────────────────────────────────────────
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const q = (s) => root.querySelector(s)
    const qa = (s) => Array.from(root.querySelectorAll(s))

    const flash     = q('.f1i__flash')
    const lines     = qa('.f1i__speed-line')
    const rpmEl     = q('.f1i__rpm-value')
    const rpmWrap   = q('.f1i__rpm')
    const letters   = qa('.f1i__letter')
    const stripe    = q('.f1i__stripe')
    const tagline   = q('.f1i__tagline')
    const enterBtn  = q('.f1i__enter')
    const countdown = q('.f1i__countdown')
    const dots      = qa('.f1i__light')
    const countNum  = q('.f1i__count-num')
    const telemetry = q('.f1i__telemetry')
    const timerEl   = q('.f1i__telemetry-timer')
    const scanLine  = q('.f1i__scan-line')
    const corners   = qa('.f1i__corner')
    const bgGrid    = q('.f1i__bg-grid')

    // ── Initial states ────────────────────────────────────────────────────
    gsap.set(flash,     { autoAlpha: 0 })
    gsap.set(lines,     { xPercent: -110 })
    gsap.set(rpmWrap,   { autoAlpha: 0, y: -8 })
    gsap.set(letters,   { y: -160, autoAlpha: 0, rotateX: -25 })
    gsap.set(stripe,    { scaleX: 0, transformOrigin: 'left center', autoAlpha: 0 })
    gsap.set(tagline,   { autoAlpha: 0, y: 14 })
    gsap.set(enterBtn,  { autoAlpha: 0, y: 8 })
    gsap.set(countdown, { autoAlpha: 0 })
    gsap.set(telemetry, { autoAlpha: 0, y: 12 })
    gsap.set(scanLine,  { autoAlpha: 0 })
    gsap.set(corners,   { autoAlpha: 0, scale: 1.4 })
    gsap.set(bgGrid,    { autoAlpha: 0 })

    // ── Timeline ──────────────────────────────────────────────────────────
    const tl = gsap.timeline({ paused: true })
    tlRef.current = tl

    // 1 ── Camera shutter flash ────────────────────────────────────────────
    tl.set(flash, { autoAlpha: 1 })
      .to(flash, { autoAlpha: 0, duration: 0.06, ease: 'none' }, '+=0.04')
      .set(flash, { autoAlpha: 0.7 })
      .to(flash, { autoAlpha: 0, duration: 0.07, ease: 'none' }, '+=0.03')
      .set(flash, { autoAlpha: 1 })
      .to(flash, { autoAlpha: 0, duration: 0.12, ease: 'none' }, '+=0.03')

    // 2 ── BG grid + corners fade in ───────────────────────────────────────
    tl.to(bgGrid, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, '-=0.05')
    tl.to(corners, {
      autoAlpha : 1,
      scale     : 1,
      duration  : 0.4,
      stagger   : 0.06,
      ease      : 'power3.out',
    }, '<0.1')

    // 3 ── Speed lines shoot across ────────────────────────────────────────
    tl.to(lines, {
      xPercent : 130,
      duration : 0.48,
      stagger  : 0.022,
      ease     : 'power3.in',
    }, '-=0.2')

    // 4 ── RPM counter ─────────────────────────────────────────────────────
    tl.to(rpmWrap, {
      autoAlpha : 1,
      y         : 0,
      duration  : 0.22,
      ease      : 'power2.out',
    }, '-=0.14')
    tl.add(() => animateRpm(0, 9500, 1050, rpmEl), '<')

    // 5 ── Countdown lights ────────────────────────────────────────────────
    tl.to(countdown, {
      autoAlpha : 1,
      duration  : 0.2,
      ease      : 'power2.out',
    }, '+=0.2')

    dots.forEach((dot, i) => {
      tl.to(dot, {
        backgroundColor : '#E10600',
        boxShadow       : '0 0 28px 10px rgba(225,6,0,0.8)',
        duration        : 0.15,
        ease            : 'power2.out',
      }, '+=0.26')
      if (i === 1) tl.add(() => { if (countNum) countNum.textContent = '3' }, '<0.05')
      if (i === 2) tl.add(() => { if (countNum) countNum.textContent = '2' }, '<0.05')
      if (i === 3) tl.add(() => { if (countNum) countNum.textContent = '1' }, '<0.05')
    })

    // Lights out + GO!
    tl.to(dots, {
      backgroundColor : '#1a0000',
      boxShadow       : 'none',
      duration        : 0.12,
      stagger         : 0.035,
      ease            : 'power4.in',
    }, '+=0.22')
    tl.add(() => { if (countNum) countNum.textContent = 'GO!' }, '<0.04')

    // AUDIO_ENHANCEMENT: Uncomment to play engine rev sound on GO!
    // tl.add(() => {
    //   const audio = new Audio(engineRevSfx)
    //   audio.volume = 0.4
    //   audio.play().catch(() => {})
    // }, '<0.02')

    // Flash red on GO!
    tl.set(flash, { autoAlpha: 0.15, background: '#E10600' })
    tl.to(flash, { autoAlpha: 0, duration: 0.3, ease: 'power2.out' }, '+=0.05')
    tl.to(countdown, { autoAlpha: 0, y: -28, duration: 0.36, ease: 'power3.in' }, '+=0.28')

    // 6 ── SYSC letters slam ───────────────────────────────────────────────
    tl.to(letters, {
      y        : 0,
      autoAlpha: 1,
      rotateX  : 0,
      duration : 0.44,
      stagger  : 0.09,
      ease     : 'power4.out',
    }, '-=0.1')

    // Camera shake when S slams
    tl.to(root, {
      keyframes: [
        { x:  7, y: -3, duration: 0.045 },
        { x: -5, y:  2, duration: 0.045 },
        { x:  4, y: -1, duration: 0.04  },
        { x: -2, y:  1, duration: 0.04  },
        { x:  0, y:  0, duration: 0.035 },
      ],
      ease: 'none',
    }, '<0.05')

    // 7 ── Red stripe sweeps in ────────────────────────────────────────────
    tl.to(stripe, {
      autoAlpha : 1,
      scaleX    : 1,
      duration  : 0.38,
      ease      : 'power4.out',
    }, '-=0.06')

    // 8 ── Tagline + telemetry ─────────────────────────────────────────────
    tl.to(tagline, {
      autoAlpha : 1,
      y         : 0,
      duration  : 0.44,
      ease      : 'power3.out',
    }, '+=0.04')

    tl.to(telemetry, {
      autoAlpha : 1,
      y         : 0,
      duration  : 0.4,
      ease      : 'power2.out',
    }, '<0.12')
    tl.add(() => startTimer(timerEl), '<')

    // 9 ── Scan line drops once across screen ─────────────────────────────
    tl.fromTo(scanLine,
      { autoAlpha: 1, top: '0%' },
      { top: '100%', duration: 1.1, ease: 'power1.inOut', autoAlpha: 1 },
      '<'
    )

    // 10 ── Enter button pulses in ─────────────────────────────────────────
    tl.to(enterBtn, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '+=0.06')
    tl.to(enterBtn, { scale: 1.06, duration: 0.18, ease: 'power2.out' })
    tl.to(enterBtn, { scale: 1.00, duration: 0.16, ease: 'power2.in'  })
    tl.to(enterBtn, { scale: 1.04, duration: 0.16, ease: 'power2.out' })
    tl.to(enterBtn, { scale: 1.00, duration: 0.16, ease: 'power2.in'  })

    tl.play()

    // Keyboard shortcut
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); safeEnter() }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      tl.kill()
      if (rpmRafRef.current)   cancelAnimationFrame(rpmRafRef.current)
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="f1i" ref={rootRef} role="region" aria-label="SYSC Intro">

      {/* Overlays */}
      <div className="f1i__flash"     aria-hidden="true" />
      <div className="f1i__grain"     aria-hidden="true" />
      <div className="f1i__scanlines" aria-hidden="true" />
      <div className="f1i__vignette"  aria-hidden="true" />
      <div className="f1i__bg-grid"   aria-hidden="true" />
      <div className="f1i__scan-line" aria-hidden="true" />

      {/* Viewfinder corners */}
      <div className="f1i__corner f1i__corner--tl" aria-hidden="true" />
      <div className="f1i__corner f1i__corner--tr" aria-hidden="true" />
      <div className="f1i__corner f1i__corner--bl" aria-hidden="true" />
      <div className="f1i__corner f1i__corner--br" aria-hidden="true" />

      {/* ● REC — top left */}
      <div className="f1i__rec" aria-label="Recording indicator">
        <span className="f1i__rec-dot" aria-hidden="true" />
        <span className="f1i__rec-label">REC</span>
      </div>

      {/* RPM — top right */}
      <div className="f1i__rpm" aria-live="polite" aria-label="RPM">
        <span className="f1i__rpm-label">RPM</span>
        <span className="f1i__rpm-value">0000</span>
        <div className="f1i__rpm-bar-track" aria-hidden="true">
          <div className="f1i__rpm-bar-fill" />
        </div>
      </div>

      {/* Speed lines */}
      <div className="f1i__speed-lines" aria-hidden="true">
        {LINE_CONFIGS.map(({ height, width, opacity, top, color }, i) => (
          <div
            key={i}
            className="f1i__speed-line"
            style={{ height, width, opacity, top, '--line-color': color }}
          />
        ))}
      </div>

      {/* Countdown */}
      <div className="f1i__countdown" aria-live="polite" aria-label="Race start">
        <div className="f1i__lights-row" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="f1i__light">
              <div className="f1i__light-inner" />
            </div>
          ))}
        </div>
        <div className="f1i__count-num" aria-atomic="true">3</div>
      </div>

      {/* Main Stage */}
      <div className="f1i__stage">

        {/* SYSC Logo */}
        <div className="f1i__logo-wrap">
          <div className="f1i__logo-pre" aria-hidden="true">MUSIC PLATFORM</div>
          <h1 className="f1i__logo" aria-label="SYSC">
            {['S', 'Y', 'S', 'C'].map((ch, i) => (
              <span key={i} className="f1i__letter" aria-hidden="true">{ch}</span>
            ))}
          </h1>
        </div>

        {/* Red stripe */}
        <div className="f1i__stripe" aria-hidden="true">
          <div className="f1i__stripe-glow" />
        </div>

        {/* Tagline */}
        <p className="f1i__tagline">WHERE MUSIC HITS DIFFERENT</p>

        {/* Enter */}
        <button
          className="f1i__enter"
          type="button"
          onClick={safeEnter}
          aria-label="Enter SYSC Music Platform"
        >
          <span className="f1i__enter-fill" aria-hidden="true" />
          <span className="f1i__enter-text">ENTER THE ZONE</span>
          <span className="f1i__enter-arrow" aria-hidden="true">→</span>
        </button>

        <p className="f1i__hint" aria-label="Keyboard shortcut">
          PRESS <kbd>SPACE</kbd> OR <kbd>ENTER</kbd>
        </p>
      </div>

      {/* Telemetry bar — bottom */}
      <div className="f1i__telemetry" aria-hidden="true">
        <span className="f1i__tele-item">LAP <strong>01</strong></span>
        <span className="f1i__tele-sep">|</span>
        <span className="f1i__tele-item">SECTOR <strong>02</strong></span>
        <span className="f1i__tele-sep">|</span>
        <span className="f1i__tele-timer f1i__telemetry-timer">00:00.000</span>
        <span className="f1i__tele-sep">|</span>
        <span className="f1i__tele-item f1i__tele-pos">P<strong>1</strong></span>
        <span className="f1i__tele-sep">|</span>
        <span className="f1i__tele-item">SYSC MUSIC <strong>v2.0</strong></span>
      </div>

    </div>
  )
}