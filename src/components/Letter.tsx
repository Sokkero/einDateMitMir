import type { ReactNode } from 'react'
import letter from '../assets/openLetter.png'

/**
 * Frames its children on the openLetter.png stationery (a tilted paper sheet
 * with hearts). The letter is shown whole and undistorted; children are placed
 * over the white paper area via the inset padding below.
 *
 * Fills its parent — the caller sizes the square box (see LandingPage and the
 * date wizard's body region). The image is nudged 8px right and rotated 6°/
 * scaled to taste; `main` is clipped (`overflow-hidden`) so the oversized art
 * never spawns scrollbars.
 */
export default function Letter({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <img
        src={letter}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full translate-x-[8px] rotate-[6deg] scale-[1.08] select-none object-contain drop-shadow-xl"
      />
      {/* Padding tuned to keep content on the tilted white paper region. */}
      <div className="absolute inset-0 flex items-center justify-center px-[20%] py-[13%]">
        <div className="h-full w-full overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
