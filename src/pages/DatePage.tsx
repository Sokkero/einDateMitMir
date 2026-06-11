import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import HeartsBackground from '../components/HeartsBackground.tsx'
import GlassCard from '../components/GlassCard.tsx'
import Confetti from '../components/Confetti.tsx'
import HeartBurst from '../components/HeartBurst.tsx'
import StepAsk from '../components/date/StepAsk.tsx'
import StepDay from '../components/date/StepDay.tsx'
import StepActivities from '../components/date/StepActivities.tsx'
import StepVibe from '../components/date/StepVibe.tsx'
import StepExcitement from '../components/date/StepExcitement.tsx'
import StepNote from '../components/date/StepNote.tsx'
import { decodeInvite } from '../lib/invite.ts'
import { emptyAnswers, type DateAnswers, type TimeOfDay } from '../lib/dateForm.ts'
import { buildEmail } from '../lib/email.ts'
import { sendEmail } from '../lib/sendEmail.ts'

const TOTAL_STEPS = 6 // 0 = Ask, 1..5 = content steps
const CONTENT_STEPS = 5 // hearts in the progress meter
const CONFETTI_MS = 4800 // full confetti burst length
const SLIDE_AFTER_MS = 1900 // slide while the confetti is still raining thickly
// Red hearts radiating from behind the form on every forward step. 0..1 — the
// amount of hearts in each burst (0 = none, 1 = a thick burst).
const HEART_INTENSITY = 0.7

export default function DatePage() {
  const [params] = useSearchParams()
  const invite = decodeInvite(params.get('d'))
  const reduce = useReducedMotion()

  const [answers, setAnswers] = useState<DateAnswers>(emptyAnswers)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const [done, setDone] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  // Bumped on every forward step to remount (and replay) the heart burst.
  const [heartBurst, setHeartBurst] = useState(0)

  if (!invite) {
    return (
      <main className="relative flex min-h-full flex-col items-center justify-center p-6 text-center">
        <HeartsBackground />
        <GlassCard>
          <div className="py-6">
            <p className="text-5xl">💔</p>
            <p className="mt-4 font-display text-xl font-bold text-blush-600">
              Dieser Link ist leider ungültig.
            </p>
          </div>
        </GlassCard>
      </main>
    )
  }

  const set = (patch: Partial<DateAnswers>) => setAnswers((a) => ({ ...a, ...patch }))

  const toggleActivity = (id: string) =>
    setAnswers((a) => ({
      ...a,
      activities: a.activities.includes(id)
        ? a.activities.filter((x) => x !== id)
        : [...a.activities, id],
    }))

  function isStepValid(s: number): boolean {
    switch (s) {
      case 1:
        return answers.date !== null && answers.timeOfDay !== null
      case 2:
        return answers.activities.length > 0
      case 3:
        return answers.vibe !== null
      default:
        return true // Ask (0, handled separately), Excitement (4), Note (5)
    }
  }

  function goNext() {
    setDirection(1)
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1))
    setHeartBurst((n) => n + 1) // red hearts radiate from behind the form
  }

  // "Ja!" — fire the confetti, then slide to the next step while the burst is
  // still raining thickly, so the transition visibly happens over the
  // celebration. Confetti is rendered at this level (and runs the full
  // CONFETTI_MS) so it keeps falling across the step change.
  function celebrateThenAdvance() {
    setCelebrating(true)
    window.setTimeout(goNext, SLIDE_AFTER_MS)
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(0, s - 1))
  }

  async function submit() {
    setSending(true)
    setError(false)
    try {
      await sendEmail(buildEmail(answers, invite!))
      setDone(true)
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  // ----- Finale -----
  if (done) {
    return (
      <main className="relative flex min-h-full flex-col items-center justify-center p-6 text-center">
        <HeartsBackground />
        <Confetti />
        <GlassCard>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="py-4"
          >
            <p className="text-6xl">🎉</p>
            <h1 className="mt-4 font-display text-3xl font-bold text-blush-600">Juhu!</h1>
            <p className="mt-3 text-blush-700">
              Wir haben deine Antwort an {invite.inviterName} geschickt. {invite.inviterName} meldet
              sich bei dir – viel Glück bei eurem Date! 💕
            </p>
          </motion.div>
        </GlassCard>
      </main>
    )
  }

  const slideX = reduce ? 0 : 80
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? slideX : -slideX, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -slideX : slideX, opacity: 0 }),
  }

  const filledHearts = Math.min(CONTENT_STEPS, Math.max(0, step - 1))
  const isLast = step === TOTAL_STEPS - 1

  return (
    <main className="relative flex min-h-full flex-col items-center justify-center p-5 sm:p-8">
      <HeartsBackground />

      {celebrating && (
        <Confetti duration={CONFETTI_MS} onComplete={() => setCelebrating(false)} />
      )}

      {heartBurst > 0 && <HeartBurst key={heartBurst} intensity={HEART_INTENSITY} />}

      {/* Heart progress indicator — hidden on the Ask step */}
      {step >= 1 && (
        <div className="mb-4 flex gap-1.5" aria-label={`Schritt ${step} von ${CONTENT_STEPS}`}>
          {Array.from({ length: CONTENT_STEPS }, (_, i) => (
            <motion.span
              key={i}
              animate={{ scale: i < filledHearts ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className="text-xl"
            >
              {i < filledHearts ? '❤️' : '🤍'}
            </motion.span>
          ))}
        </div>
      )}

      <GlassCard>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {step === 0 && (
              <StepAsk
                inviteeName={invite.inviteeName}
                inviterName={invite.inviterName}
                onYes={celebrateThenAdvance}
              />
            )}
            {step === 1 && (
              <StepDay
                date={answers.date}
                timeOfDay={answers.timeOfDay}
                onDateChange={(iso) => set({ date: iso })}
                onTimeChange={(t: TimeOfDay) => set({ timeOfDay: t })}
              />
            )}
            {step === 2 && (
              <StepActivities
                inviterName={invite.inviterName}
                selected={answers.activities}
                onToggle={toggleActivity}
              />
            )}
            {step === 3 && (
              <StepVibe selected={answers.vibe} onSelect={(id) => set({ vibe: id })} />
            )}
            {step === 4 && (
              <StepExcitement value={answers.excitement} onChange={(v) => set({ excitement: v })} />
            )}
            {step === 5 && (
              <StepNote
                inviterName={invite.inviterName}
                value={answers.note}
                onChange={(v) => set({ note: v })}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer nav — not shown on the full-bleed Ask step */}
        {step >= 1 && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <motion.button
              type="button"
              onClick={goBack}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border border-blush-300 bg-white/60 px-5 py-3 font-display font-semibold text-blush-600 transition hover:bg-white"
            >
              Zurück
            </motion.button>

            {error && (
              <p className="flex-1 text-center text-sm text-blush-600">
                Hoppla, das hat nicht geklappt. Versuch es bitte nochmal.
              </p>
            )}

            {isLast ? (
              <motion.button
                type="button"
                onClick={submit}
                disabled={sending}
                whileHover={sending ? undefined : { scale: 1.03 }}
                whileTap={sending ? undefined : { scale: 0.95 }}
                className="rounded-2xl bg-blush-500 px-6 py-3 font-display font-bold text-white shadow-lg shadow-blush-300/60 transition hover:bg-blush-600 disabled:opacity-60"
              >
                {sending ? 'Senden …' : 'Senden! 💌'}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={goNext}
                disabled={!isStepValid(step)}
                whileHover={isStepValid(step) ? { scale: 1.03 } : undefined}
                whileTap={isStepValid(step) ? { scale: 0.95 } : undefined}
                className="rounded-2xl bg-blush-500 px-6 py-3 font-display font-bold text-white shadow-lg shadow-blush-300/60 transition hover:bg-blush-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Weiter
              </motion.button>
            )}
          </div>
        )}
      </GlassCard>
    </main>
  )
}
