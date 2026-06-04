import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useReducedMotion } from 'framer-motion'

const COLORS = ['#ff5d8f', '#ff9ec7', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ffffff']

interface ConfettiProps {
  /** How long the burst runs before fading out, in ms. */
  duration?: number
  /** Fired once the confetti has finished (or immediately for reduced motion). */
  onComplete?: () => void
}

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  color: string
  rot: number
  vrot: number
  tilt: number
  vtilt: number
}

/**
 * Full-screen confetti burst on a canvas — actual paper pieces fired from the
 * bottom corners, fluttering and falling under gravity. Honors
 * prefers-reduced-motion (skips the animation but still calls onComplete so the
 * flow continues).
 */
export default function Confetti({ duration = 4800, onComplete }: ConfettiProps) {
  const reduce = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Keep onComplete in a ref so the animation effect runs exactly once.
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const finish = onCompleteRef.current

    if (reduce) {
      const t = window.setTimeout(() => finish?.(), 300)
      return () => window.clearTimeout(t)
    }

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = window.devicePixelRatio || 1
    let width = window.innerWidth
    let height = window.innerHeight
    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const pieces: Piece[] = []

    // Two cannons from the bottom corners, fired up and toward the center.
    const launch = (originX: number, dir: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = rand(Math.PI / 3.2, Math.PI / 2.1) // mostly upward
        const speed = rand(13, 22)
        pieces.push({
          x: originX,
          y: height + 10,
          vx: Math.cos(angle) * speed * dir + rand(-1.2, 1.2),
          vy: -Math.sin(angle) * speed,
          w: rand(11, 18),
          h: rand(14, 26),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rot: rand(0, Math.PI * 2),
          vrot: rand(-0.18, 0.18),
          tilt: rand(0, Math.PI * 2),
          vtilt: rand(0.05, 0.13),
        })
      }
    }
    launch(width * 0.06, 1, 110)
    launch(width * 0.94, -1, 110)

    const gravity = 0.13
    let raf = 0
    let start: number | null = null
    let done = false

    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start
      const lifeLeft = Math.max(0, 1 - elapsed / duration)
      const alpha = Math.min(1, lifeLeft * 2.5) // fade out near the end

      ctx.clearRect(0, 0, width, height)
      let onScreen = false

      for (const p of pieces) {
        p.vy += gravity
        p.vx *= 0.992
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        p.tilt += p.vtilt

        if (p.y < height + 40) onScreen = true

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        // scaleX by the tilt gives a paper-fluttering, edge-on shimmer.
        ctx.scale(Math.cos(p.tilt), 1)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (!done && elapsed < duration && (onScreen || elapsed < 500)) {
        raf = window.requestAnimationFrame(tick)
      } else if (!done) {
        done = true
        ctx.clearRect(0, 0, width, height)
        finish?.()
      }
    }

    raf = window.requestAnimationFrame(tick)

    return () => {
      done = true
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, duration])

  if (reduce) return null

  // Portal to <body> so a transformed ancestor (framer-motion sets transforms,
  // which would make it the containing block) can't clip the fixed canvas.
  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />,
    document.body,
  )
}
