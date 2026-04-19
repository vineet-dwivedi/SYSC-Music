


import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import "../../styles/Intro.scss";

// ─── SYSC Brush Writing Intro ─────────────────────────────────────────────────
// Usage: <IntroScreen onEnter={() => setDone(true)} />
// ─────────────────────────────────────────────────────────────────────────────

export default function IntroScreen({ onEnter }) {
  const rootRef    = useRef(null)
  const enteredRef = useRef(false)
  const tlRef      = useRef(null)

  const safeEnter = () => {
    if (enteredRef.current) return
    enteredRef.current = true
    tlRef.current?.kill()
    const root = rootRef.current
    if (!root) { onEnter?.(); return }
    gsap.to(root, {
      autoAlpha : 0,
      duration  : 0.9,
      ease      : 'power2.inOut',
      onComplete: onEnter,
    })
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const q   = (s) => root.querySelector(s)
    const rS  = q('#clip-sysc  rect')
    const rM  = q('#clip-music rect')
    const nib = q('#si-nib')
    const ul  = q('.si__underline')
    const tag = q('.si__tagline')
    const btn = q('.si__enter')

    // ── Initial states ──────────────────────────────────────────────────
    gsap.set(nib, { opacity: 0, attr: { cx: 108, cy: 178, rx: 3.5, ry: 5.5 } })
    gsap.set(rS,  { attr: { width: 0 } })
    gsap.set(rM,  { attr: { width: 0 } })
    gsap.set([ul, tag, btn], { autoAlpha: 0, y: 8 })

    // ── Timeline ────────────────────────────────────────────────────────
    const tl = gsap.timeline({ paused: true, delay: 0.7 })
    tlRef.current = tl

    // 1 ── Nib appears, presses like dipping ink ─────────────────────────
    tl.to(nib, { opacity: 1,                         duration: 0.28, ease: 'power2.out' })
    tl.to(nib, { attr: { rx: 5.5, ry: 8.5 },         duration: 0.22, ease: 'power2.in'  })
    tl.to(nib, { attr: { rx: 3.5, ry: 5.5 },         duration: 0.16, ease: 'power2.out' })

    // 2 ── Write "SYSC" ───────────────────────────────────────────────────
    //     Clip rect expands. Nib tracks the right edge. Y wobbles = hand tremor.
    tl.to(rS,  { attr: { width: 462 }, duration: 2.3, ease: 'power1.inOut' }, '+=.05')
    tl.to(nib, { attr: { cx: 472    }, duration: 2.3, ease: 'power1.inOut' }, '<'    )
    tl.to(nib, {
      keyframes: [
        { attr: { cy: 181 }, duration: .33 }, { attr: { cy: 173 }, duration: .33 },
        { attr: { cy: 184 }, duration: .32 }, { attr: { cy: 172 }, duration: .32 },
        { attr: { cy: 180 }, duration: .32 }, { attr: { cy: 176 }, duration: .27 },
        { attr: { cy: 178 }, duration: .14 },
      ],
    }, '<')

    // 3 ── Nib lifts off page ─────────────────────────────────────────────
    tl.to(nib, { opacity: 0, attr: { cy: 168 }, duration: 0.30, ease: 'power3.in' })

    // 4 ── Nib repositions to start of "music" ────────────────────────────
    tl.set(nib, { attr: { cx: 189, cy: 266 } })
    tl.to(nib,  { opacity: 1,                  duration: 0.20, ease: 'power2.out' }, '+=.25')
    tl.to(nib,  { attr: { rx: 5,   ry: 7.5  }, duration: 0.16, ease: 'power2.in'  })
    tl.to(nib,  { attr: { rx: 3.5, ry: 5.5  }, duration: 0.12, ease: 'power2.out' })

    // 5 ── Write "music" ──────────────────────────────────────────────────
    tl.to(rM,  { attr: { width: 298 }, duration: 1.5, ease: 'power1.inOut' }, '+=.04')
    tl.to(nib, { attr: { cx: 460    }, duration: 1.5, ease: 'power1.inOut' }, '<'    )
    tl.to(nib, {
      keyframes: [
        { attr: { cy: 269 }, duration: .30 }, { attr: { cy: 263 }, duration: .30 },
        { attr: { cy: 268 }, duration: .30 }, { attr: { cy: 264 }, duration: .30 },
        { attr: { cy: 266 }, duration: .30 },
      ],
    }, '<')

    // 6 ── Nib lifts ──────────────────────────────────────────────────────
    tl.to(nib, { opacity: 0, attr: { cy: 258 }, duration: 0.28, ease: 'power3.in' })

    // 7 ── Underline sweeps in ────────────────────────────────────────────
    tl.to(ul, { autoAlpha: 1, scaleX: 1, y: 0, duration: 0.65, ease: 'power3.out' }, '+=.32')

    // 8 ── Tagline ────────────────────────────────────────────────────────
    tl.to(tag, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '+=.12')

    // 9 ── Enter button ───────────────────────────────────────────────────
    tl.to(btn, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '+=.08')

    tl.play()

    // Keyboard shortcut
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); safeEnter() }
    }
    window.addEventListener('keydown', onKey)
    return () => { tl.kill(); window.removeEventListener('keydown', onKey) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="si" ref={rootRef} role="region" aria-label="SYSC intro">

      {/* Film grain overlay */}
      <div className="si__grain" aria-hidden="true" />

      {/* Soft spotlight center */}
      <div className="si__glow" aria-hidden="true" />

      {/* ── Writing SVG ───────────────────────────────────────────────────── */}
      <svg
        className="si__svg"
        viewBox="0 0 580 295"
        role="img"
        aria-label="SYSC music written in brush lettering"
      >
        <title>SYSC music</title>

        <defs>
          <clipPath id="clip-sysc">
            <rect x="55" y="5" width="0" height="225" />
          </clipPath>
          <clipPath id="clip-music">
            <rect x="170" y="192" width="0" height="112" />
          </clipPath>
        </defs>

        {/* SYSC — centered, large signature */}
        <text
          x="290" y="186"
          textAnchor="middle"
          clipPath="url(#clip-sysc)"
          className="si__letter si__letter--sysc"
        >
          SYSC
        </text>

        {/* music — offset, flows like the tail of a signature */}
        <text
          x="186" y="272"
          textAnchor="start"
          clipPath="url(#clip-music)"
          className="si__letter si__letter--music"
        >
          music
        </text>

        {/* Brush nib — tracks the writing tip */}
        <ellipse
          id="si-nib"
          cx="108" cy="178"
          rx="3.5" ry="5.5"
          transform="rotate(-26 108 178)"
          className="si__nib"
        />
      </svg>

      {/* Below-SVG stage */}
      <div className="si__stage">
        <div className="si__underline" aria-hidden="true" />
        <p className="si__tagline">where music hits different</p>
        <button
          className="si__enter"
          type="button"
          onClick={safeEnter}
          aria-label="Enter SYSC Music"
        >
          enter
        </button>
        <p className="si__hint" aria-hidden="true">
          press <kbd>space</kbd> or <kbd>enter</kbd>
        </p>
      </div>

    </div>
  )
}