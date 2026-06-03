import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  /** Inviter's name, interpolated into the question. */
  inviterName: string
  /** Invitee's name, used for the greeting. */
  inviteeName: string
  /** Called when "Yes" is clicked — advances to the next step. */
  onYes: () => void
}

// How close (px) the pointer may get to the No button before it flees.
const DODGE_RADIUS = 90

/**
 * Page 1 — "Would you like to go out with {name}?"
 * The Yes button advances. The No button dodges and can never be clicked:
 * on desktop it flees the cursor; on touch it re-renders away from the tap
 * point (there is no hover on touch). See docs/MVP.md §6.2.
 */
export default function StepAsk({ inviterName, inviteeName, onYes }: Props) {
  const areaRef = useRef<HTMLDivElement>(null)
  const noRef = useRef<HTMLButtonElement>(null)
  const yesRef = useRef<HTMLButtonElement>(null)
  // Offsets within the play area; null until measured.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [yesPos, setYesPos] = useState<{ x: number; y: number } | null>(null)
  // Every time the No button flees, the Yes button grows a little.
  const [dodges, setDodges] = useState(0)
  const yesScale = Math.min(1 + dodges * 0.04, 4)
  // False until the start positions are measured. Used to remount the buttons
  // so they appear directly at their spots (next to each other) rather than
  // animating in from the top-left corner.
  const [placed, setPlaced] = useState(false)

  const measure = useCallback(() => {
    const area = areaRef.current
    const btn = noRef.current
    if (!area || !btn) return null
    return {
      maxX: Math.max(0, area.clientWidth - btn.offsetWidth),
      maxY: Math.max(0, area.clientHeight - btn.offsetHeight),
      bw: btn.offsetWidth,
      bh: btn.offsetHeight,
    }
  }, [])

  // Start both buttons side by side, the pair centred in the play area.
  // Yes and No have identical dimensions, so `bw`/`bh` apply to both.
  // Runs before paint so the buttons never flash at the top-left corner.
  useLayoutEffect(() => {
    const b = measure()
    if (!b) return
    const gap = 16
    const areaW = b.maxX + b.bw
    const startX = Math.max(0, (areaW - (b.bw * 2 + gap)) / 2)
    const y = b.maxY / 2
    setYesPos({ x: startX, y })
    setPos({ x: startX + b.bw + gap, y })
    setPlaced(true)
  }, [measure])

  /**
   * Jump to the spot (anywhere in the area) farthest from the given point,
   * while never landing on top of the Yes button.
   */
  const dodgeAway = useCallback(
    (pointerAreaX: number, pointerAreaY: number) => {
      const b = measure()
      if (!b) return

      // Yes button's current footprint, in area coords (+margin to keep clear).
      const area = areaRef.current
      const yesEl = yesRef.current
      let yes: { left: number; top: number; right: number; bottom: number } | null = null
      if (area && yesEl) {
        const ar = area.getBoundingClientRect()
        const yr = yesEl.getBoundingClientRect()
        const m = 16
        yes = {
          left: yr.left - ar.left - m,
          top: yr.top - ar.top - m,
          right: yr.right - ar.left + m,
          bottom: yr.bottom - ar.top + m,
        }
      }
      const hitsYes = (x: number, y: number) =>
        !!yes &&
        x < yes.right &&
        x + b.bw > yes.left &&
        y < yes.bottom &&
        y + b.bh > yes.top

      // Prefer the farthest non-overlapping candidate; fall back to farthest.
      let best: { x: number; y: number } | null = null
      let bestDist = -1
      let fallback = { x: 0, y: 0 }
      let fallbackDist = -1
      for (let i = 0; i < 32; i++) {
        const x = Math.random() * b.maxX
        const y = Math.random() * b.maxY
        const dist = Math.hypot(x + b.bw / 2 - pointerAreaX, y + b.bh / 2 - pointerAreaY)
        if (dist > fallbackDist) {
          fallbackDist = dist
          fallback = { x, y }
        }
        if (!hitsYes(x, y) && dist > bestDist) {
          bestDist = dist
          best = { x, y }
        }
      }
      setPos(best ?? fallback)
      // Once it has to flee, the Yes button takes centre stage.
      setYesPos({ x: b.maxX / 2, y: b.maxY / 2 })
      setDodges((n) => n + 1)
    },
    [measure],
  )

  const dodgeFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const area = areaRef.current
      if (!area) return
      const rect = area.getBoundingClientRect()
      dodgeAway(clientX - rect.left, clientY - rect.top)
    },
    [dodgeAway],
  )

  // Desktop: flee when the cursor gets near the button.
  const handleAreaMouseMove = (e: React.MouseEvent) => {
    const btn = noRef.current
    if (!btn || !pos) return
    const r = btn.getBoundingClientRect()
    const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
    if (dist < DODGE_RADIUS) dodgeFromClient(e.clientX, e.clientY)
  }

  // Touch: there is no hover, so dodge the instant a finger lands on it.
  const handleNoTouch = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0] ?? e.changedTouches[0]
    if (touch) dodgeFromClient(touch.clientX, touch.clientY)
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold text-blush-400">
          Hey {inviteeName}! 💕
        </p>
        <h1 className="text-3xl font-bold text-blush-600">
          Möchtest du mit {inviterName} ausgehen?
        </h1>
      </div>

      <div ref={areaRef} onMouseMove={handleAreaMouseMove} className="relative h-64 w-full sm:h-72">
        <motion.button
          key={`yes-${placed}`}
          ref={yesRef}
          type="button"
          onClick={onYes}
          initial={false}
          animate={yesPos ? { x: yesPos.x, y: yesPos.y, scale: yesScale } : { scale: yesScale }}
          whileTap={{ scale: yesScale * 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          style={{ position: 'absolute', left: 0, top: 0, transformOrigin: 'center', opacity: yesPos ? 1 : 0 }}
          className="rounded-2xl border-2 border-transparent bg-blush-500 px-10 py-3 text-lg font-bold text-white shadow-md"
        >
          Ja!
        </motion.button>

        <motion.button
          key={`no-${placed}`}
          ref={noRef}
          type="button"
          onMouseEnter={(e) => dodgeFromClient(e.clientX, e.clientY)}
          onTouchStart={handleNoTouch}
          onClick={(e) => e.preventDefault()}
          initial={false}
          animate={pos ? { x: pos.x, y: pos.y } : { x: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          style={{ position: 'absolute', left: 0, top: 0, opacity: pos ? 1 : 0 }}
          className="rounded-2xl border-2 border-blush-300 bg-white px-10 py-3 text-lg font-bold text-blush-500 shadow-sm"
        >
          Nein
        </motion.button>
      </div>
    </div>
  )
}
