import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { buildInviteUrl, type Invite } from '../lib/invite'
import Letter from '../components/Letter'

export default function LandingPage() {
  const [form, setForm] = useState<Invite>({
    inviterName: '',
    inviteeName: '',
    inviterEmail: '',
  })
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const update = (key: keyof Invite) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setLink(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLink(buildInviteUrl(form, window.location.origin))
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
  }

  // Field offset + width are in cqw (1% of the letter's content area) so they
  // scale with the letter background and keep their position on the paper.
  const inputClass =
    'w-[60cqw] rounded-xl border border-blush-200 bg-white/80 px-3 py-2 text-blush-700 placeholder-blush-300 outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-200'
  const labelClass = 'w-12 shrink-0 text-right text-sm font-semibold text-blush-500'

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-x-clip px-2 py-2">
      <div className="aspect-square w-[max(625px,min(94vw,94vh))] shrink-0 overflow-hidden">
        <Letter>
          <AnimatePresence mode="wait">
            {!link ? (
              // The letter: intro at top, then the To / From / Email fields + Send.
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full"
              >
                <form onSubmit={handleSubmit} className="@container flex h-full flex-col justify-between pb-6 pt-16">
                  <div className="text-center">
                    <h1 className="text-xl font-bold text-blush-600">Lade jemanden auf ein Date ein 💘</h1>
                    <p className="mt-1 whitespace-pre-line text-sm text-blush-500">
                      Erstelle süßen Link und überrasche deinen Schwarm.
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 pl-[12cqw]">
                    <label className="flex items-center gap-2">
                      <span className={labelClass}>An:</span>
                      <input
                        className={inputClass}
                        placeholder="Ihr/Sein Name"
                        value={form.inviteeName}
                        onChange={update('inviteeName')}
                        required
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      <span className={labelClass}>Von:</span>
                      <input
                        className={inputClass}
                        placeholder="Dein Name"
                        value={form.inviterName}
                        onChange={update('inviterName')}
                        required
                      />
                    </label>
                    <label className="mt-6 flex items-center gap-2">
                      <span className={labelClass}>E-Mail:</span>
                      <input
                        className={inputClass}
                        type="email"
                        placeholder="Deine E-Mail-Adresse"
                        value={form.inviterEmail}
                        onChange={update('inviterEmail')}
                        required
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="mx-auto rounded-2xl bg-blush-500 px-6 py-2.5 font-semibold text-white shadow-md transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    Senden!
                  </button>
                </form>
              </motion.div>
            ) : (
              // After Send: the form fades out and the ready link takes its place.
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex h-full flex-col items-center justify-center gap-3 text-center"
              >
                <p className="max-w-[34rem] whitespace-pre-line text-base font-semibold text-blush-600">
                  {'Dein Link ist fertig! 🍀\nSchick ihn deinem Schwarm. Sobald das Formular ausgefüllt ist, bekommst du eine E-Mail mit der Antwort – schau bitte auch in deinen Spam-Ordner, falls sie nicht im Posteingang landet! 💕'}
                </p>
                <code className="w-full max-w-[26rem] break-all rounded-lg bg-blush-50 p-2 text-xs text-blush-700">
                  {link}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full bg-blush-400 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blush-500"
                >
                  {copied ? 'Kopiert!' : 'Link kopieren'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </Letter>
      </div>
    </main>
  )
}
