import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface StepAskProps {
  inviteeName: string
  inviterName: string
  onYes: () => void
}

interface Pos {
  x: number
  y: number
}

const DODGE_RADIUS = 90 // px — how close the pointer can get before "Nein" flees
const MAX_YES_SCALE = 1.6

/**
 * Step 1 — the ask. The "Nein" button can never be clicked: on desktop it
 * dodges the cursor, on touch it jumps the instant a finger lands on it.
 * Each dodge grows "Ja!" a little and drops a cheeky taunt where "Nein" was.
 */
export default function StepAsk({ inviteeName, inviterName, onYes }: StepAskProps) {
  const playRef = useRef<HTMLDivElement>(null)
  const noRef = useRef<HTMLButtonElement>(null)
  const yesRef = useRef<HTMLButtonElement>(null)
  const [noPos, setNoPos] = useState<Pos | null>(null)
  const [yesScale, setYesScale] = useState(1)
  const [dodges, setDodges] = useState(0)
  const [taunt, setTaunt] = useState<Pos | null>(null)
  const [celebrating, setCelebrating] = useState(false)

  function flee() {
    const play = playRef.current
    const noBtn = noRef.current
    if (!play || !noBtn) return

    const playRect = play.getBoundingClientRect()
    const bw = noBtn.offsetWidth
    const bh = noBtn.offsetHeight
    const maxX = Math.max(0, playRect.width - bw)
    const maxY = Math.max(0, playRect.height - bh)

    // "Ja!" sits centered and grows; "Nein" must never land behind it.
    // Compute the forbidden rectangle in play-relative coordinates, padded
    // so the two buttons never even visually touch.
    const PAD = 16
    let forbidden: { x1: number; y1: number; x2: number; y2: number } | null = null
    const yesBtn = yesRef.current
    if (yesBtn) {
      const yesRect = yesBtn.getBoundingClientRect()
      forbidden = {
        x1: yesRect.left - playRect.left - bw - PAD,
        y1: yesRect.top - playRect.top - bh - PAD,
        x2: yesRect.right - playRect.left + PAD,
        y2: yesRect.bottom - playRect.top + PAD,
      }
    }
    const overlapsYes = (x: number, y: number) =>
      forbidden !== null &&
      x > forbidden.x1 &&
      x < forbidden.x2 &&
      y > forbidden.y1 &&
      y < forbidden.y2

    // Mark where "Nein" currently sits so the taunt can appear there.
    const current = noPos ?? {
      x: noBtn.offsetLeft,
      y: noBtn.offsetTop,
    }
    setTaunt(current)

    // Pseudo-random far jump that (a) moves a meaningful distance and
    // (b) does not overlap the "Ja!" button. Keep the best non-overlapping
    // candidate found; fall back to any non-overlapping spot.
    let nx = current.x
    let ny = current.y
    let found = false
    for (let i = 0; i < 40; i++) {
      const candX = Math.random() * maxX
      const candY = Math.random() * maxY
      if (overlapsYes(candX, candY)) continue
      nx = candX
      ny = candY
      found = true
      if (Math.hypot(candX - current.x, candY - current.y) > 120) break
    }

    // Extreme fallback (tiny play area): hug a corner away from center.
    if (!found) {
      nx = current.x < maxX / 2 ? maxX : 0
      ny = current.y < maxY / 2 ? maxY : 0
    }

    setNoPos({ x: nx, y: ny })
    setDodges((d) => d + 1)
    setYesScale((s) => Math.min(MAX_YES_SCALE, s + 0.08))
  }

  function handleYes() {
    if (celebrating) return
    setCelebrating(true)
    // Confetti + the (delayed) slide are orchestrated by the parent.
    onYes()
  }

  function handlePointerMove(e: React.PointerEvent) {
    const noBtn = noRef.current
    if (!noBtn) return
    const rect = noBtn.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < DODGE_RADIUS) flee()
  }

  const taunts = ['😏', '😜', '🙈', '💨', '😋']

  return (
    <div className="text-center" onPointerMove={handlePointerMove}>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-2xl font-bold text-blush-600 sm:text-3xl"
      >
        Hey {inviteeName}! 💕
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-3 text-lg text-blush-700 sm:text-xl"
      >
        Möchtest du mit {inviterName} ausgehen?
      </motion.p>

      {/* Play area — generously tall so "Nein" always has somewhere to flee. */}
      <div ref={playRef} className="relative mt-8 h-64 w-full sm:h-72">
        {/* Ja! sits centered and grows with every dodge. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            ref={yesRef}
            type="button"
            onClick={handleYes}
            animate={{ scale: yesScale }}
            whileHover={{ scale: yesScale * 1.04 }}
            whileTap={{ scale: yesScale * 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="z-10 rounded-2xl bg-blush-500 px-8 py-4 font-display text-xl font-bold text-white shadow-xl shadow-blush-300/60"
          >
            Ja! 💘
          </motion.button>
        </div>

        {/* Nein — absolutely positioned, springs to a new spot when chased. */}
        <motion.button
          ref={noRef}
          type="button"
          aria-label="Nein (dieser Knopf lässt sich nicht drücken)"
          onPointerEnter={flee}
          onTouchStart={(e) => {
            e.preventDefault()
            flee()
          }}
          onClick={(e) => {
            e.preventDefault()
            flee()
          }}
          animate={
            noPos
              ? { left: noPos.x, top: noPos.y, x: 0, y: 0 }
              : { left: '50%', top: '70%', x: '-50%', y: '-50%' }
          }
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="absolute rounded-2xl border border-blush-300 bg-white/80 px-6 py-3 font-display font-bold text-blush-600 shadow-md"
        >
          Nein
        </motion.button>

        {/* Cheeky taunt flashes where "Nein" just was. */}
        <AnimatePresence>
          {taunt && (
            <motion.span
              key={dodges}
              initial={{ opacity: 0, scale: 0.4, left: taunt.x, top: taunt.y }}
              animate={{ opacity: 1, scale: 1.2, y: -16 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute select-none text-2xl"
              style={{ left: taunt.x, top: taunt.y }}
            >
              {taunts[dodges % taunts.length]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {dodges > 2 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-blush-500"
        >
          Komm schon, „Ja" ist viel einfacher zu treffen … 😉
        </motion.p>
      )}
    </div>
  )
}
