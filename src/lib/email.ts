import type { DateAnswers, TimeOfDay } from './dateForm.ts'
import { fromIsoDate } from './dateForm.ts'
import type { Invite } from './invite.ts'
import activities from '../config/activities.json'
import vibes from '../config/vibes.json'

/**
 * Plain-text params sent to the EmailJS template. EmailJS HTML-escapes
 * variables, so the email layout lives in the dashboard template (see
 * docs/email-template.html) and we only fill these {{tokens}}.
 */
export interface EmailParams {
  to_email: string
  subject: string
  header: string
  intro: string
  tag: string
  tageszeit: string
  stimmung: string
  aufregung: string
  aktivitaeten: string
  nachricht: string
  closing: string
  message: string
}

const LONG_DATE_FMT = new Intl.DateTimeFormat('de', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morgens',
  afternoon: 'Nachmittags',
  evening: 'Abends',
}

/** Render 0–100 excitement as a 5-heart meter; 0 → a single broken heart. */
function excitementMeter(value: number): string {
  if (value <= 0) return '💔'
  const filled = Math.round((value / 100) * 5)
  return '❤️'.repeat(filled) + '🤍'.repeat(5 - filled)
}

function resolveActivityLabels(ids: string[]): string {
  const byId = new Map(activities.map((a) => [a.id, a.label]))
  const labels = ids.map((id) => byId.get(id) ?? id)
  return labels.length > 0 ? labels.join(', ') : '–'
}

function resolveVibeLabel(id: string | null): string {
  if (!id) return '–'
  return vibes.find((v) => v.id === id)?.label ?? id
}

/** Build the German email params from the wizard answers + invite. */
export function buildEmail(answers: DateAnswers, invite: Invite): EmailParams {
  const { inviterName, inviteeName, inviterEmail } = invite

  const tag = answers.date
    ? LONG_DATE_FMT.format(fromIsoDate(answers.date))
    : '–'
  const tageszeit = answers.timeOfDay ? TIME_LABELS[answers.timeOfDay] : '–'
  const stimmung = resolveVibeLabel(answers.vibe)
  const aufregung = excitementMeter(answers.excitement)
  const aktivitaeten = resolveActivityLabels(answers.activities)
  const nachricht = answers.note.trim() || '(keine Nachricht hinterlassen)'

  const subject = `💌 ${inviteeName} hat Ja gesagt!`
  const header = `${inviterName}, gute Neuigkeiten! 💌`
  const intro = `${inviteeName} möchte mit dir ausgehen!`
  const closing = `Meld dich bei ${inviteeName} – viel Glück bei eurem Date! 🍀💕`

  const message = [
    header,
    '',
    intro,
    '',
    `Tag: ${tag}`,
    `Tageszeit: ${tageszeit}`,
    `Stimmung: ${stimmung}`,
    `Aufregung: ${aufregung}`,
    `Aktivitäten: ${aktivitaeten}`,
    `Süße Nachricht: ${nachricht}`,
    '',
    closing,
  ].join('\n')

  return {
    to_email: inviterEmail,
    subject,
    header,
    intro,
    tag,
    tageszeit,
    stimmung,
    aufregung,
    aktivitaeten,
    nachricht,
    closing,
    message,
  }
}
