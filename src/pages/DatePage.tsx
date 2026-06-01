import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { decodeInvite, type Invite } from '../lib/invite'
import { emptyAnswers, type DateAnswers, type TimeOfDay } from '../lib/dateForm'
import { buildEmail } from '../lib/email'
import { sendResultEmail } from '../lib/sendEmail'
import Letter from '../components/Letter'
import StepAsk from '../components/date/StepAsk'
import StepDay from '../components/date/StepDay'
import StepActivities from '../components/date/StepActivities'
import StepVibe from '../components/date/StepVibe'
import StepExcitement from '../components/date/StepExcitement'
import StepNote from '../components/date/StepNote'

/**
 * Letter-backed steps (everything after the Ask). Each is a headline + a pure
 * body component + a validity gate for the Continue button. Append here as the
 * note/done steps get built (see docs/MVP.md §6.2). The Ask (step 0) is handled
 * separately below — it has no letter, headline or footer.
 */
interface StepDef {
  titleKey: string
  canContinue: (a: DateAnswers) => boolean
  render: (
    a: DateAnswers,
    set: React.Dispatch<React.SetStateAction<DateAnswers>>,
    invite: Invite,
  ) => React.ReactNode
}

const STEPS: StepDef[] = [
  {
    titleKey: 'date.day.title',
    canContinue: (a) => a.date !== null && a.timeOfDay !== null,
    render: (a, set) => (
      <StepDay
        date={a.date}
        timeOfDay={a.timeOfDay}
        onDateChange={(date: string) => set((prev) => ({ ...prev, date }))}
        onTimeOfDayChange={(timeOfDay: TimeOfDay) => set((prev) => ({ ...prev, timeOfDay }))}
      />
    ),
  },
  {
    titleKey: 'date.activities.title',
    canContinue: (a) => a.activities.length > 0,
    render: (a, set) => (
      <StepActivities
        selected={a.activities}
        onToggle={(id: string) =>
          set((prev) => ({
            ...prev,
            activities: prev.activities.includes(id)
              ? prev.activities.filter((x) => x !== id)
              : [...prev.activities, id],
          }))
        }
      />
    ),
  },
  {
    titleKey: 'date.vibe.title',
    canContinue: (a) => a.vibe !== null,
    render: (a, set) => (
      <StepVibe
        selected={a.vibe}
        onSelect={(id: string) => set((prev) => ({ ...prev, vibe: id }))}
      />
    ),
  },
  {
    titleKey: 'date.excitement.title',
    canContinue: () => true,
    render: (a, set) => (
      <StepExcitement
        value={a.excitement}
        onChange={(excitement: number) => set((prev) => ({ ...prev, excitement }))}
      />
    ),
  },
  {
    titleKey: 'date.note.title',
    canContinue: () => true,
    render: (a, set, invite) => (
      <StepNote
        inviterName={invite.inviterName}
        value={a.note}
        onChange={(note: string) => set((prev) => ({ ...prev, note }))}
      />
    ),
  },
]

// Step 0 is the Ask; steps 1..STEPS.length are the letter-backed form pages.
const LAST_STEP = STEPS.length

// Body slides as one unit with its letter: forward → out left / in from right;
// back → out right / in from left. `dir` is +1 forward, -1 back.
const bodyVariants = {
  enter: (dir: number) => ({ x: `${dir * 100}%`, opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir: number) => ({ x: `${dir * -100}%`, opacity: 0 }),
}

// Headline "fades up" to the new text.
const headlineVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

export default function DatePage() {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  const invite = useMemo(() => decodeInvite(params.get('d')), [params])

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<DateAnswers>(emptyAnswers)
  // True once the send succeeds — swaps to the result screen.
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(LAST_STEP, next))
    if (clamped === step) return
    setDirection(clamped > step ? 1 : -1)
    setStep(clamped)
  }

  const handleSubmit = async () => {
    if (!invite) return
    setSending(true)
    setError(false)
    try {
      const email = buildEmail(answers, invite, t, i18n.language)
      await sendResultEmail(invite.inviterEmail, email)
      setDone(true)
    } catch (err) {
      console.error('[email] send failed', err)
      setError(true)
    } finally {
      setSending(false)
    }
  }

  if (!invite) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className="text-lg text-blush-600">{t('date.invalidLink')}</p>
      </main>
    )
  }

  const def = step >= 1 ? STEPS[step - 1] : null
  const canContinue = def ? def.canContinue(answers) : false
  const isLast = step === LAST_STEP

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-x-clip px-2 py-2">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          // Result — sent. A landing-page-style letter card with a sweet wrap-up.
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="aspect-square w-[max(625px,min(94vw,94vh))] shrink-0 overflow-hidden"
          >
            <Letter>
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <h1 className="text-3xl font-bold text-blush-600">{t('date.done.title')}</h1>
                <p className="max-w-xs whitespace-pre-line text-base font-semibold text-blush-500">
                  {t('date.done.message', { name: invite.inviterName })}
                </p>
              </div>
            </Letter>
          </motion.div>
        ) : step === 0 ? (
          // Page 1 — the Ask. No letter/headline/footer; fades out on "Yes".
          <motion.div
            key="ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full max-w-2xl"
          >
            <StepAsk
              inviterName={invite.inviterName}
              inviteeName={invite.inviteeName}
              onYes={() => go(1)}
            />
          </motion.div>
        ) : (
          // Pages 2+ — headline (fade-up) / letter body (slides) / footer.
          // Mounts only after the Ask has faded out (mode="wait"), so the body
          // flies in while the headline and footer fade in.
          <motion.div
            key="form"
            className="flex min-h-[90dvh] w-full max-w-2xl flex-col items-center justify-between gap-2 py-2"
          >
            <div className="flex min-h-[3.5rem] items-center justify-center px-2 pt-2">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={step}
                  variants={headlineVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="text-center text-2xl font-bold text-blush-600"
                >
                  {def && t(def.titleKey)}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="relative aspect-square w-[max(625px,min(92vw,72vh))] shrink-0 overflow-hidden">
              <AnimatePresence custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={bodyVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <Letter>
                    <div className="flex h-full flex-col items-center justify-center">
                      {def?.render(answers, setAnswers, invite)}
                    </div>
                  </Letter>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 pb-2"
            >
              <div className="flex items-center gap-4">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => go(step - 1)}
                    disabled={sending}
                    className="text-sm font-semibold text-blush-500 underline disabled:opacity-40"
                  >
                    {t('date.nav.back')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={isLast ? handleSubmit : () => go(step + 1)}
                  disabled={!canContinue || sending}
                  className="rounded-2xl bg-blush-500 px-8 py-3 font-bold text-white shadow-md transition-transform enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-40"
                >
                  {isLast ? (sending ? t('date.nav.sending') : t('date.nav.send')) : t('date.nav.next')}
                </button>
              </div>
              {error && (
                <p className="text-sm font-semibold text-blush-600">{t('date.sendError')}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
