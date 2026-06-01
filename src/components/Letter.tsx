import type { ReactNode } from 'react'
import letter from '../assets/openLetter.png'

/**
 * Frames its children on the openLetter.png stationery (a tilted paper sheet
 * with hearts). The letter is shown whole and undistorted; children are placed
 * over the white paper area via the inset padding below. Used by both the
 * landing form and the date wizard so the two pages share the same backdrop.
 */
export default function Letter({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto aspect-square w-[min(94vw,94vh)]">
      <img
        src={letter}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full translate-x-[8px] rotate-[6deg] scale-[1.08] select-none object-contain drop-shadow-xl"
      />
      {/* Padding tuned to keep content on the tilted white paper region. */}
      <div className="absolute inset-0 flex items-center justify-center px-[20%] py-[13%]">
        <div className="max-h-full w-full overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
