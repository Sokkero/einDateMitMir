import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { buildInviteUrl, type Invite } from '../lib/invite'
import Letter from '../components/Letter'

export default function LandingPage() {
  const { t } = useTranslation()
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

  const inputClass =
    'w-full rounded-2xl border border-blush-200 bg-white/80 px-4 py-3 text-blush-700 placeholder-blush-300 outline-none focus:border-blush-400 focus:ring-2 focus:ring-blush-200'

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden px-2 py-2">
      <Letter>
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blush-600">{t('landing.headline')}</h1>
            <p className="mt-1 text-sm text-blush-500">{t('landing.subline')}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className={inputClass}
          placeholder={t('landing.yourName')}
          value={form.inviterName}
          onChange={update('inviterName')}
          required
        />
        <input
          className={inputClass}
          placeholder={t('landing.theirName')}
          value={form.inviteeName}
          onChange={update('inviteeName')}
          required
        />
        <input
          className={inputClass}
          type="email"
          placeholder={t('landing.yourEmail')}
          value={form.inviterEmail}
          onChange={update('inviterEmail')}
          required
        />
        <button
          type="submit"
          className="mt-2 rounded-2xl bg-blush-500 px-6 py-3 font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
        >
          {t('landing.generate')}
        </button>
      </form>

      <AnimatePresence>
        {link && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="flex flex-col gap-2 rounded-2xl bg-white/70 p-4 shadow-sm"
          >
            <p className="whitespace-pre-line text-center text-sm font-semibold text-blush-600">
              {t('landing.linkReady')}
            </p>
            <code className="break-all rounded-lg bg-blush-50 p-2 text-xs text-blush-700">
              {link}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="self-center rounded-full bg-blush-400 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blush-500"
            >
              {copied ? t('landing.copied') : t('landing.copy')}
            </button>
          </motion.div>
          )}
          </AnimatePresence>
        </div>
      </Letter>
    </main>
  )
}
