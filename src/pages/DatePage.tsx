import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { decodeInvite } from '../lib/invite'
import { emptyAnswers, type DateAnswers, type TimeOfDay } from '../lib/dateForm'
import StepAsk from '../components/date/StepAsk'
import StepDay from '../components/date/StepDay'
import StepActivities from '../components/date/StepActivities'
import Letter from '../components/Letter'

// Slide + fade between steps. `direction` is +1 going forward, -1 going back.
const variants = {
  enter: (dir: number) => ({ x: dir * 80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -80, opacity: 0 }),
}

export default function DatePage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const invite = useMemo(() => decodeInvite(params.get('d')), [params])

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<DateAnswers>(emptyAnswers)

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  if (!invite) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className="text-lg text-blush-600">{t('date.invalidLink')}</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden px-2 py-2">
      <Letter>
        <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full"
        >
          {step === 0 && (
            <StepAsk
              inviterName={invite.inviterName}
              inviteeName={invite.inviteeName}
              onYes={() => go(1)}
            />
          )}
          {step === 1 && (
            <StepDay
              date={answers.date}
              timeOfDay={answers.timeOfDay}
              onDateChange={(date: string) => setAnswers((a) => ({ ...a, date }))}
              onTimeOfDayChange={(timeOfDay: TimeOfDay) => setAnswers((a) => ({ ...a, timeOfDay }))}
              onNext={() => go(2)}
            />
          )}
          {step === 2 && (
            <StepActivities
              selected={answers.activities}
              onToggle={(id: string) =>
                setAnswers((a) => ({
                  ...a,
                  activities: a.activities.includes(id)
                    ? a.activities.filter((x) => x !== id)
                    : [...a.activities, id],
                }))
              }
              onBack={() => go(1)}
              onNext={() => go(3)}
            />
          )}
        </motion.div>
        </AnimatePresence>
      </Letter>
    </main>
  )
}
