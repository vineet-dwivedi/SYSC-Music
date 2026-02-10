import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import AppBackground from '../AppBackground.jsx'

function IntroScreen({ onEnter }) {
  const rootRef = useRef(null)
  const cardRef = useRef(null)
  const glowRef = useRef(null)
  const orbitRef = useRef(null)
  const enteredRef = useRef(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.intro__badge', {
        y: 18,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      })
      gsap.from('.intro__signature', {
        y: 18,
        opacity: 0,
        duration: 0.8,
        delay: 0.08,
        ease: 'power3.out',
      })
      gsap.from('.intro__title', {
        y: 20,
        opacity: 0,
        duration: 0.9,
        delay: 0.12,
        ease: 'power3.out',
      })
      gsap.from('.intro__subtitle', {
        y: 18,
        opacity: 0,
        duration: 0.9,
        delay: 0.18,
        ease: 'power3.out',
      })
      gsap.from('.intro__card', {
        y: 26,
        opacity: 0,
        duration: 1,
        delay: 0.26,
        ease: 'power3.out',
      })
      gsap.from('.intro__cta', {
        y: 16,
        opacity: 0,
        duration: 0.8,
        delay: 0.36,
        ease: 'power3.out',
      })
      gsap.from('.intro__hint', {
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: 'power3.out',
      })

      gsap.to('.intro__glow', {
        opacity: 0.9,
        duration: 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      if (orbitRef.current) {
        gsap.to(orbitRef.current, {
          rotate: 360,
          duration: 18,
          ease: 'none',
          repeat: -1,
        })
      }
    }, rootRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const card = cardRef.current
    const glow = glowRef.current
    if (!card || !glow) return

    const handleMove = (event) => {
      const point = event.touches ? event.touches[0] : event
      if (!point) return
      const rect = card.getBoundingClientRect()
      const x = point.clientX - rect.left - rect.width / 2
      const y = point.clientY - rect.top - rect.height / 2
      const rotateX = gsap.utils.clamp(-12, 12, (-y / rect.height) * 22)
      const rotateY = gsap.utils.clamp(-16, 16, (x / rect.width) * 22)

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.6,
        ease: 'power3.out',
      })

      gsap.to(glow, {
        x: x * 0.12,
        y: y * 0.12,
        duration: 0.6,
        ease: 'power3.out',
      })
    }

    const handleLeave = () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' })
      gsap.to(glow, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' })
    }

    card.addEventListener('mousemove', handleMove)
    card.addEventListener('mouseleave', handleLeave)
    card.addEventListener('touchmove', handleMove)
    card.addEventListener('touchend', handleLeave)

    return () => {
      card.removeEventListener('mousemove', handleMove)
      card.removeEventListener('mouseleave', handleLeave)
      card.removeEventListener('touchmove', handleMove)
      card.removeEventListener('touchend', handleLeave)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const handleMove = (event) => {
      const point = event.touches ? event.touches[0] : event
      if (!point) return
      const bounds = root.getBoundingClientRect()
      const x = ((point.clientX - bounds.left) / bounds.width - 0.5) * 2
      const y = ((point.clientY - bounds.top) / bounds.height - 0.5) * 2
      root.style.setProperty('--mx', x.toFixed(3))
      root.style.setProperty('--my', y.toFixed(3))
    }

    const handleLeave = () => {
      root.style.setProperty('--mx', '0')
      root.style.setProperty('--my', '0')
    }

    root.addEventListener('mousemove', handleMove)
    root.addEventListener('mouseleave', handleLeave)
    root.addEventListener('touchmove', handleMove)
    root.addEventListener('touchend', handleLeave)

    return () => {
      root.removeEventListener('mousemove', handleMove)
      root.removeEventListener('mouseleave', handleLeave)
      root.removeEventListener('touchmove', handleMove)
      root.removeEventListener('touchend', handleLeave)
    }
  }, [])

  const safeEnter = () => {
    if (enteredRef.current) return
    enteredRef.current = true
    onEnter()
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      safeEnter()
    }, 4800)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        safeEnter()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <motion.section
      className="intro"
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <AppBackground />
      <div className="intro__glow" />
      <div className="intro__grid" />
      <div className="intro__speed" />
      <div className="intro__lines">
        <span />
        <span />
        <span />
      </div>
      <div className="intro__hud intro__hud--left">
        <div className="intro__hud-item">
          <span className="intro__hud-label">Lap</span>
          <span className="intro__hud-value">01</span>
        </div>
        <div className="intro__hud-item">
          <span className="intro__hud-label">Sector</span>
          <span className="intro__hud-value">2.14</span>
        </div>
      </div>
      <div className="intro__hud intro__hud--right">
        <div className="intro__hud-item">
          <span className="intro__hud-label">Velocity</span>
          <span className="intro__hud-value">312</span>
        </div>
        <div className="intro__hud-item intro__hud-item--accent">
          <span className="intro__hud-label">Engine</span>
          <span className="intro__hud-value">E9</span>
        </div>
      </div>
      <div className="intro__telemetry">
        <span className="intro__telemetry-dot" />
        <span>Telemetry Online</span>
      </div>
      <div className="intro__content">
        <div className="intro__badge">SYSC</div>
        <div className="intro__signature">Systemic Sound Collective</div>
        <h1 className="intro__title">SYSC</h1>
        <p className="intro__subtitle">Cinematic Sound Suite</p>

        <div className="intro__card" ref={cardRef}>
          <div className="intro__card-glow" ref={glowRef} />
          <div className="intro__orbit" ref={orbitRef}>
            <span />
            <span />
          </div>
          <div className="intro__card-inner">
            <div className="intro__card-label">Now Curated</div>
            <div className="intro__card-title">Midnight Drive</div>
            <div className="intro__card-meta">Lossless - Focus Sessions</div>
            <div className="intro__card-progress">
              <div className="progress progress--full">
                <span className="progress__fill progress--72" />
              </div>
            </div>
            <div className="intro__card-footer">
              <span>24-bit</span>
              <span>48k</span>
              <span>Spatial</span>
            </div>
          </div>
        </div>

        <motion.button
          className="intro__cta primary-button"
          type="button"
          onClick={safeEnter}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Enter SYSC
        </motion.button>
        <p className="intro__hint">Move your cursor or press Enter</p>
      </div>
    </motion.section>
  )
}

export default IntroScreen
