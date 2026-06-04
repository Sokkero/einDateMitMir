import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
}

/**
 * Frosted-glass card frame floating on the romantic backdrop.
 * Semi-transparent white, backdrop blur, hairline border, rosy drop shadow.
 * Animates in with a gentle spring (rise + fade + tiny scale).
 */
export default function GlassCard({ children, className = '' }: GlassCardProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduce
          ? { duration: 0.2 }
          : { type: 'spring', stiffness: 220, damping: 24, mass: 0.9 }
      }
      className={
        'w-[min(560px,92vw)] rounded-[2rem] border border-white/60 bg-white/55 ' +
        'p-6 shadow-[0_24px_60px_-12px_rgba(193,42,100,0.35)] backdrop-blur-xl ' +
        'ring-1 ring-white/40 sm:p-8 ' +
        className
      }
    >
      {children}
    </motion.div>
  )
}
