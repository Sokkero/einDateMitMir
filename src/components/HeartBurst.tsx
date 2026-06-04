import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

// Shades of red/rose for the radiating hearts.
const COLORS = ['#ff2d55', '#ff4d6d', '#e63950', '#ff5d8f', '#d61f4e', '#ff758f']

const MAX_HEARTS = 80 // hearts at full intensity (1)

interface HeartBurstProps {
  /**
   * How many hearts radiate out, 0..1. 0 → none, 1 → a thick burst.
   * Anything outside the range is clamped.
   */
  intensity?: number
  /** How long the burst runs before fading out, in ms. */
  duration?: number
  /** Fired once finished (or immediately for reduced motion). */
  onComplete?: () => void
}

interface Heart {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rot: number
  vrot: number
}

// Trace a heart centred on the current origin, spanning roughly `size` px.
function traceHeart(ctx: CanvasRenderingContext2D, size: number) {
  const w = size
  const h = size
  const top = -h * 0.4 // shift up so the shape sits centred on the origin
  const topCurve = h * 0.3
  ctx.beginPath()
  ctx.moveTo(0, top + topCurve)
  ctx.bezierCurveTo(0, top, -w / 2, top, -w / 2, top + topCurve)
  ctx.bezierCurveTo(-w / 2, top + (h + topCurve) / 2, 0, top + (h + topCurve) / 2, 0, top + h)
  ctx.bezierCurveTo(0, top + (h + topCurve) / 2, w / 2, top + (h + topCurve) / 2, w / 2, top + topCurve)
  ctx.bezierCurveTo(w / 2, top, 0, top, 0, top + topCurve)
  ctx.closePath()
}

/**
 * Global red-heart burst on a canvas: hearts spray outward from the centre of
 * the viewport (behind the form) and drift apart while fading. The number of
 * hearts scales with `intensity` (0..1). Honors prefers-reduced-motion (skips
 * the animation but still calls onComplete so the flow continues).
 */
export default function HeartBurst({ intensity = 0.7, duration = 1600, onComplete }: HeartBurstProps) {
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
    const count = Math.round(Math.min(1, Math.max(0, intensity)) * MAX_HEARTS)

    // All hearts start near the centre (behind the form) and fly outward.
    const cx = width / 2
    const cy = height / 2
    const hearts: Heart[] = Array.from({ length: count }, () => {
      const angle = rand(0, Math.PI * 2)
      const speed = rand(6, 16)
      const r0 = rand(0, 36)
      return {
        x: cx + Math.cos(angle) * r0,
        y: cy + Math.sin(angle) * r0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(14, 30),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: rand(-0.4, 0.4),
        vrot: rand(-0.05, 0.05),
      }
    })

    let raf = 0
    let start: number | null = null
    let done = false

    const tick = (now: number) => {
      if (start === null) start = now
      const elapsed = now - start
      const lifeLeft = Math.max(0, 1 - elapsed / duration)
      const alpha = Math.min(1, lifeLeft * 2) // fade out near the end

      ctx.clearRect(0, 0, width, height)

      for (const p of hearts) {
        p.vx *= 0.97 // drag, so they fan out then ease to a stop
        p.vy *= 0.97
        p.vy -= 0.06 // gentle buoyancy — hearts drift upward as they slow
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        traceHeart(ctx, p.size)
        ctx.fill()
        ctx.restore()
      }

      if (!done && elapsed < duration) {
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
  }, [reduce, duration, intensity])

  if (reduce) return null

  // Fixed, full-screen, and sitting *behind* the form: the transformed
  // GlassCard paints in the z-index:0 group, so a negative z-index here keeps
  // the hearts behind it but above the -z-10 backdrop.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[1] h-full w-full"
    />
  )
}
