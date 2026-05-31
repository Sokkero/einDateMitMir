import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { decodeInvite } from '../lib/invite'

// Skeleton for the multi-step date form (see docs/MVP.md §6.2).
// Steps to build: 1) the dodging-"No" ask, 2) day + time of day,
// 3) activity tiles, 4) sweet note, then submit + confetti.
export default function DatePage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const invite = useMemo(() => decodeInvite(params.get('d')), [params])

  if (!invite) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className="text-lg text-blush-600">{t('date.invalidLink')}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-12 text-center">
      <h1 className="text-3xl font-bold text-blush-600">
        {t('date.ask.question', { name: invite.inviterName })}
      </h1>
      {/* Multi-step wizard goes here — placeholder buttons for now. */}
      <div className="flex justify-center gap-4">
        <button className="rounded-2xl bg-blush-500 px-6 py-3 font-semibold text-white shadow-md">
          {t('date.ask.yes')}
        </button>
        <button className="rounded-2xl border border-blush-300 px-6 py-3 font-semibold text-blush-500">
          {t('date.ask.no')}
        </button>
      </div>
    </main>
  )
}
