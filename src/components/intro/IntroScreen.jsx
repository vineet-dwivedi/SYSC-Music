import { useCallback, useEffect, useMemo, useRef } from 'react'
import Lenis from 'lenis'
import { motion, useReducedMotion } from 'framer-motion'
import { gsap } from 'gsap'
import '../../styles/Intro.scss'

const MotionButton = motion.button
const MotionDiv = motion.div
const MotionSpan = motion.span

const detailCards = [
  {
    label: '01',
    title: 'Calm first impression',
    copy: 'The intro now opens with a simpler layout, cleaner spacing, and a clearer path into the app.',
  },
  {
    label: '02',
    title: 'Smoother movement',
    copy: 'GSAP drives the stagecraft, while Lenis keeps the scroll inside the intro soft and controlled.',
  },
  {
    label: '03',
    title: 'Responsive by default',
    copy: 'The layout collapses into a compact single-column flow so the experience still feels intentional on mobile.',
  },
]

const detailCardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: index * 0.08,
      ease: [0.22, 0.61, 0.36, 1],
    },
  }),
}

function IntroScreen({
  onEnter,
  theme = 'ultra',
  onThemeToggle,
  isThemeTransitioning = false,
}) {
  const rootRef = useRef(null)
  const viewportRef = useRef(null)
  const contentRef = useRef(null)
  const detailsRef = useRef(null)
  const visualRef = useRef(null)
  const orbRef = useRef(null)
  const lenisRef = useRef(null)
  const introTimelineRef = useRef(null)
  const enteredRef = useRef(false)
  const prefersReducedMotion = useReducedMotion()

  const detailViewport = useMemo(
    () => ({
      root: viewportRef,
      once: true,
      amount: 0.35,
    }),
    [],
  )

  const scrollToDetails = useCallback(() => {
    const details = detailsRef.current
    if (!details) return

    if (lenisRef.current) {
      lenisRef.current.scrollTo(details, {
        duration: prefersReducedMotion ? 0 : 1.05,
        offset: -24,
      })
      return
    }

    details.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }, [prefersReducedMotion])

  const scrollToTop = useCallback(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: prefersReducedMotion ? 0 : 1 })
      return
    }

    viewportRef.current?.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [prefersReducedMotion])

  const handleThemeButtonClick = useCallback((event) => {
    if (typeof onThemeToggle !== 'function') return

    const bounds = event.currentTarget.getBoundingClientRect()
    onThemeToggle({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    })
  }, [onThemeToggle])

  const safeEnter = useCallback(() => {
    if (enteredRef.current) return
    enteredRef.current = true

    lenisRef.current?.stop?.()
    introTimelineRef.current?.kill()

    const root = rootRef.current
    if (!root) {
      onEnter?.()
      return
    }

    const fadeTargets = root.querySelectorAll(
      '.si__topbar, .si__progress, .si__hero-copy > *, .si__hero-visual, .si__details-copy > *, .si__detail-card',
    )

    gsap
      .timeline({
        defaults: { ease: 'power2.inOut' },
        onComplete: () => onEnter?.(),
      })
      .to(
        fadeTargets,
        {
          autoAlpha: 0,
          y: 18,
          duration: 0.28,
          stagger: 0.018,
        },
        0,
      )
      .to(
        root,
        {
          autoAlpha: 0,
          scale: 0.986,
          filter: 'blur(10px)',
          duration: 0.54,
        },
        0.1,
      )
  }, [onEnter])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return

      const tagName = event.target instanceof HTMLElement ? event.target.tagName : ''
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return

      if (event.key === 'Enter') {
        event.preventDefault()
        safeEnter()
        return
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault()
        scrollToDetails()
        return
      }

      if (event.key === 'ArrowUp' || event.key === 'Home') {
        event.preventDefault()
        scrollToTop()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [safeEnter, scrollToDetails, scrollToTop])

  useEffect(() => {
    const root = rootRef.current
    const viewport = viewportRef.current
    const content = contentRef.current
    const visual = visualRef.current
    const orb = orbRef.current

    if (!(root instanceof HTMLElement) || !(viewport instanceof HTMLElement) || !(content instanceof HTMLElement)) {
      return undefined
    }

    enteredRef.current = false
    root.style.setProperty('--intro-progress', '0')
    root.style.setProperty('--intro-accent-shift', '0px')

    const ctx = gsap.context(() => {
      gsap.set('.si__topbar', { autoAlpha: 0, y: -18 })
      gsap.set('.si__progress', { autoAlpha: 0, y: 16 })
      gsap.set('.si__hero-copy > *', { autoAlpha: 0, y: 26 })
      gsap.set('.si__hero-visual', { autoAlpha: 0, y: 30, scale: 0.97 })

      const timeline = gsap.timeline({
        defaults: { ease: prefersReducedMotion ? 'power1.out' : 'power3.out' },
        delay: prefersReducedMotion ? 0 : 0.08,
      })

      timeline
        .to('.si__topbar', { autoAlpha: 1, y: 0, duration: 0.48 })
        .to('.si__progress', { autoAlpha: 1, y: 0, duration: 0.38 }, '<')
        .to('.si__hero-copy > *', { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.08 }, '-=0.1')
        .to('.si__hero-visual', { autoAlpha: 1, y: 0, scale: 1, duration: 0.86 }, '-=0.44')

      introTimelineRef.current = timeline
    }, root)

    const useNativeScroll =
      prefersReducedMotion ||
      window.matchMedia('(pointer: coarse)').matches

    if (useNativeScroll) {
      return () => {
        introTimelineRef.current = null
        ctx.revert()
      }
    }

    const lenis = new Lenis({
      wrapper: viewport,
      content,
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      gestureOrientation: 'vertical',
      lerp: 0.12,
      wheelMultiplier: 0.94,
    })

    lenisRef.current = lenis

    const moveVisualY = visual ? gsap.quickTo(visual, 'y', { duration: 0.7, ease: 'power3.out' }) : null
    const rotateVisual = visual ? gsap.quickTo(visual, 'rotate', { duration: 0.95, ease: 'power3.out' }) : null
    const moveOrbY = orb ? gsap.quickTo(orb, 'y', { duration: 1, ease: 'power3.out' }) : null
    const moveOrbX = orb ? gsap.quickTo(orb, 'x', { duration: 0.9, ease: 'power3.out' }) : null

    const handleScroll = ({ scroll, limit, velocity, direction }) => {
      const progress = limit > 0 ? scroll / limit : 0
      root.style.setProperty('--intro-progress', progress.toFixed(4))
      root.style.setProperty('--intro-accent-shift', `${Math.min(72, scroll * 0.08).toFixed(1)}px`)

      moveVisualY?.(scroll * -0.055)
      rotateVisual?.(direction >= 0 ? -1.35 : 1.35)
      moveOrbY?.(scroll * 0.05)
      moveOrbX?.(Math.max(-16, Math.min(16, velocity * 0.22)))
    }

    const handleTick = (time) => {
      lenis.raf(time * 1000)
    }

    lenis.on('scroll', handleScroll)
    gsap.ticker.add(handleTick)
    requestAnimationFrame(() => lenis.resize())

    return () => {
      introTimelineRef.current = null
      gsap.ticker.remove(handleTick)
      lenis.off('scroll', handleScroll)
      lenis.destroy()
      lenisRef.current = null
      ctx.revert()
      root.style.removeProperty('--intro-progress')
      root.style.removeProperty('--intro-accent-shift')
    }
  }, [prefersReducedMotion])

  return (
    <div
      className={`si ${theme === 'midnight' ? 'is-midnight' : 'is-ultra'}`}
      ref={rootRef}
      role="region"
      aria-label="SYSC intro"
    >
      <div className="si__ambient si__ambient--left" aria-hidden="true" />
      <div className="si__ambient si__ambient--right" aria-hidden="true" />
      <div className="si__grid" aria-hidden="true" />

      <div className="si__topbar">
        <div className="si__brand" aria-label="SYSC music">
          <span className="si__brand-mark">SYSC</span>
          <span className="si__brand-copy">music</span>
        </div>

        <button
          type="button"
          className="si__theme-button"
          onClick={handleThemeButtonClick}
          disabled={isThemeTransitioning}
          aria-label={theme === 'midnight' ? 'Switch to light tone' : 'Switch to midnight tone'}
        >
          {theme === 'midnight' ? 'Light tone' : 'Midnight tone'}
        </button>
      </div>

      <div className="si__progress" aria-hidden="true">
        <span className="si__progress-label">Scroll</span>
        <span className="si__progress-track">
          <span className="si__progress-fill" />
        </span>
      </div>

      <div className="si__viewport" ref={viewportRef}>
        <div className="si__content" ref={contentRef}>
          <section className="si__panel si__panel--hero">
            <div className="si__hero-copy">
              <p className="si__eyebrow">Minimal listening space</p>

              <h1 className="si__title">
                <span className="si__title-line">Music that</span>
                <span className="si__title-line">moves with</span>
                <span className="si__title-line">less noise.</span>
              </h1>

              <p className="si__lead">
                A simpler intro screen with lighter motion, cleaner spacing, and a smoother path into the player.
              </p>

              <div className="si__actions">
                <MotionButton
                  type="button"
                  className="si__button si__button--primary"
                  onClick={safeEnter}
                  whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.01 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                >
                  Enter SYSC
                </MotionButton>

                <MotionButton
                  type="button"
                  className="si__button si__button--secondary"
                  onClick={scrollToDetails}
                  whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                >
                  Explore intro
                </MotionButton>
              </div>

              <div className="si__meta" aria-label="Intro technology">
                {['GSAP', 'Framer Motion', 'Lenis'].map((item) => (
                  <MotionSpan
                    key={item}
                    className="si__meta-chip"
                    whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                  >
                    {item}
                  </MotionSpan>
                ))}
              </div>

              <p className="si__hint">
                Press <kbd>Enter</kbd> to enter, or use <kbd>Arrow Down</kbd> to keep scrolling.
              </p>
            </div>

            <MotionDiv
              className="si__hero-visual"
              ref={visualRef}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <div className="si__visual-shell">
                <div className="si__visual-orb" ref={orbRef} aria-hidden="true" />

                <div className="si__visual-head">
                  <span className="si__visual-kicker">Now settling in</span>
                  <strong className="si__visual-title">late-night clarity</strong>
                </div>

                <div className="si__visual-wave" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="si__visual-stats">
                  <div className="si__visual-stat">
                    <span>feel</span>
                    <strong>calm</strong>
                  </div>
                  <div className="si__visual-stat">
                    <span>motion</span>
                    <strong>soft</strong>
                  </div>
                  <div className="si__visual-stat">
                    <span>layout</span>
                    <strong>fluid</strong>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </section>

          <section className="si__panel si__panel--details" ref={detailsRef}>
            <div className="si__details-inner">
              <div className="si__details-copy">
                <p className="si__eyebrow">Built to breathe</p>
                <h2 className="si__section-title">Minimal on the surface, still expressive in motion.</h2>
                <p className="si__section-copy">
                  GSAP handles the entrance and exit, Framer Motion keeps the interface tactile, and Lenis softens the
                  scroll inside the intro so the transition into the app feels more deliberate.
                </p>

                <div className="si__actions si__actions--compact">
                  <MotionButton
                    type="button"
                    className="si__button si__button--secondary"
                    onClick={scrollToTop}
                    whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                  >
                    Back to top
                  </MotionButton>

                  <MotionButton
                    type="button"
                    className="si__button si__button--primary"
                    onClick={safeEnter}
                    whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.01 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                  >
                    Open player
                  </MotionButton>
                </div>

                <p className="si__footer-note">Tuned for phones, tablets, laptops, and wide screens without the layout breaking apart.</p>
              </div>

              {/* <div className="si__details-grid">
                {detailCards.map((card, index) => (
                  <MotionDiv
                    key={card.label}
                    className="si__detail-card"
                    custom={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={detailViewport}
                    variants={detailCardVariants}
                  >
                    <span className="si__detail-label">{card.label}</span>
                    <h3 className="si__detail-title">{card.title}</h3>
                    <p className="si__detail-copy">{card.copy}</p>
                  </MotionDiv>
                ))}
              </div> */}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default IntroScreen
