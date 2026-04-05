import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'

function usePageLenis({ containerRef, activePage, enabled = true }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined

    const shouldUseNativeScroll =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches

    if (shouldUseNativeScroll) return undefined

    const container = containerRef.current
    const pages = container?.querySelectorAll('.page')
    const wrapper = pages?.[pages.length - 1]

    if (!(wrapper instanceof HTMLElement)) return undefined

    const lenis = new Lenis({
      wrapper,
      content: wrapper,
      eventsTarget: wrapper,
      autoRaf: false,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      gestureOrientation: 'vertical',
      lerp: 0.12,
      wheelMultiplier: 0.96,
    })

    const handleTick = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(handleTick)
    lenisRef.current = lenis

    return () => {
      gsap.ticker.remove(handleTick)
      lenis.destroy()

      if (lenisRef.current === lenis) {
        lenisRef.current = null
      }
    }
  }, [activePage, containerRef, enabled])

  return lenisRef
}

export { usePageLenis }
