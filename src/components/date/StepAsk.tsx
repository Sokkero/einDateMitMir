import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface Props {
  /** Inviter's name, interpolated into the question. */
  inviterName: string
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
export default function StepAsk({ inviterName, onYes }: Props) {
  const { t } = useTranslation()
  const areaRef = useRef<HTMLDivElement>(null)
  const noRef = useRef<HTMLButtonElement>(null)
  // Offset of the No button within the play area; null until measured.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

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

  // Place the No button centred in the play area on mount.
  useEffect(() => {
    const b = measure()
    if (b) setPos({ x: b.maxX / 2, y: b.maxY * 0.6 })
  }, [measure])

  /** Jump to the spot (within the area) farthest from the given point. */
  const dodgeAway = useCallback(
    (pointerAreaX: number, pointerAreaY: number) => {
      const b = measure()
      if (!b) return
      let best = { x: 0, y: 0 }
      let bestDist = -1
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * b.maxX
        const y = Math.random() * b.maxY
        const dist = Math.hypot(x + b.bw / 2 - pointerAreaX, y + b.bh / 2 - pointerAreaY)
        if (dist > bestDist) {
          bestDist = dist
          best = { x, y }
        }
      }
      setPos(best)
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
    <div className="flex flex-col items-center gap-8 text-center">
      <h1 className="text-3xl font-bold text-blush-600">
        {t('date.ask.question', { name: inviterName })}
      </h1>

      <div ref={areaRef} onMouseMove={handleAreaMouseMove} className="relative h-72 w-full max-w-sm">
        <button
          type="button"
          onClick={onYes}
          className="absolute left-1/2 top-4 -translate-x-1/2 rounded-2xl bg-blush-500 px-10 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          {t('date.ask.yes')}
        </button>

        <motion.button
          ref={noRef}
          type="button"
          onMouseEnter={(e) => dodgeFromClient(e.clientX, e.clientY)}
          onTouchStart={handleNoTouch}
          onClick={(e) => e.preventDefault()}
          animate={pos ? { x: pos.x, y: pos.y } : undefined}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          style={{ position: 'absolute', left: 0, top: 0, opacity: pos ? 1 : 0 }}
          className="rounded-2xl border-2 border-blush-300 bg-white px-10 py-3 text-lg font-bold text-blush-500 shadow-sm"
        >
          {t('date.ask.no')}
        </motion.button>
      </div>
    </div>
  )
}
