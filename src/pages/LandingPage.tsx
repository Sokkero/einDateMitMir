import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import HeartsBackground from '../components/HeartsBackground.tsx'
import GlassCard from '../components/GlassCard.tsx'
import { buildInviteUrl, type Invite } from '../lib/invite.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  inviteeName?: string
  inviterName?: string
  inviterEmail?: string
}

export default function LandingPage() {
  const [inviteeName, setInviteeName] = useState('')
  const [inviterName, setInviterName] = useState('')
  const [inviterEmail, setInviterEmail] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!inviteeName.trim()) next.inviteeName = 'Wie heißt dein Schwarm?'
    if (!inviterName.trim()) next.inviterName = 'Und wie heißt du?'
    if (!EMAIL_RE.test(inviterEmail.trim()))
      next.inviterEmail = 'Bitte eine gültige E-Mail-Adresse.'
    return next
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    const invite: Invite = {
      inviteeName: inviteeName.trim(),
      inviterName: inviterName.trim(),
      inviterEmail: inviterEmail.trim(),
    }
    setLink(buildInviteUrl(invite))
  }

  async function copyLink() {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard unavailable — the link is still visible to copy manually.
    }
  }

  async function share() {
    if (!link || !navigator.share) return
    try {
      await navigator.share({
        title: 'einDateMitMir 💘',
        text: `${inviterName.trim()} möchte dich auf ein Date einladen 💕`,
        url: link,
      })
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  }

  function reset() {
    setLink(null)
    setCopied(false)
  }

  const fieldClass =
    'w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-blush-700 ' +
    'placeholder:text-blush-300 shadow-inner outline-none transition focus:border-blush-400 ' +
    'focus:ring-2 focus:ring-blush-300'

  return (
    <main className="relative flex min-h-full flex-col items-center justify-center p-5 sm:p-8">
      <HeartsBackground />
      <GlassCard>
        <AnimatePresence mode="wait">
          {!link ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <header className="mb-6 text-center">
                <h1 className="font-display text-2xl font-bold text-blush-600 sm:text-3xl">
                  Lade jemanden auf ein Date ein 💘
                </h1>
                <p className="mt-2 text-blush-700/80">
                  Erstelle einen süßen Link und überrasche deinen Schwarm.
                </p>
              </header>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                <div>
                  <label htmlFor="inviteeName" className="mb-1 block font-display font-semibold text-blush-600">
                    An:
                  </label>
                  <input
                    id="inviteeName"
                    type="text"
                    autoComplete="off"
                    placeholder="Ihr/Sein Name"
                    value={inviteeName}
                    onChange={(e) => setInviteeName(e.target.value)}
                    className={fieldClass}
                  />
                  {errors.inviteeName && (
                    <p className="mt-1 text-sm text-blush-600">💌 {errors.inviteeName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="inviterName" className="mb-1 block font-display font-semibold text-blush-600">
                    Von:
                  </label>
                  <input
                    id="inviterName"
                    type="text"
                    autoComplete="off"
                    placeholder="Dein Name"
                    value={inviterName}
                    onChange={(e) => setInviterName(e.target.value)}
                    className={fieldClass}
                  />
                  {errors.inviterName && (
                    <p className="mt-1 text-sm text-blush-600">💌 {errors.inviterName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="inviterEmail" className="mb-1 block font-display font-semibold text-blush-600">
                    E-Mail:
                  </label>
                  <input
                    id="inviterEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="Deine E-Mail-Adresse"
                    value={inviterEmail}
                    onChange={(e) => setInviterEmail(e.target.value)}
                    className={fieldClass}
                  />
                  {errors.inviterEmail && (
                    <p className="mt-1 text-sm text-blush-600">💌 {errors.inviterEmail}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-2 rounded-2xl bg-blush-500 px-6 py-3 font-display text-lg font-bold text-white shadow-lg shadow-blush-300/60 transition hover:bg-blush-600"
                >
                  Senden! 💕
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <h1 className="font-display text-2xl font-bold text-blush-600 sm:text-3xl">
                Dein Link ist bereit! 💌
              </h1>
              <p className="mt-2 text-blush-700/80">
                Schick ihn <span className="font-semibold">{inviteeName.trim()}</span> und warte
                gespannt – du bekommst die Antwort per E-Mail. Schau auch im Spam-Ordner nach. 💕
              </p>

              <div className="mt-5 break-all rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-left font-mono text-sm text-blush-700 shadow-inner">
                {link}
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <motion.button
                  type="button"
                  onClick={copyLink}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-2xl bg-blush-500 px-6 py-3 font-display font-bold text-white shadow-lg shadow-blush-300/60 transition hover:bg-blush-600"
                >
                  {copied ? 'Kopiert! ✨' : 'Link kopieren'}
                </motion.button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <motion.button
                    type="button"
                    onClick={share}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-2xl border border-blush-300 bg-white/70 px-6 py-3 font-display font-bold text-blush-600 transition hover:bg-white"
                  >
                    Teilen 💞
                  </motion.button>
                )}
              </div>

              <button
                type="button"
                onClick={reset}
                className="mt-5 text-sm text-blush-500 underline-offset-2 hover:underline"
              >
                Noch jemanden einladen
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </main>
  )
}
