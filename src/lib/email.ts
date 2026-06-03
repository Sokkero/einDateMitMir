// Builds the params for the result email sent to the inviter when the invitee
// finishes the date form.
//
// EmailJS escapes HTML passed through a variable, so we CANNOT inject a prebuilt
// HTML body. Instead the layout lives in the EmailJS template (typed HTML, see
// docs/email-template.html) and we send the text pieces as plain-text params —
// all the copy is German. Values are sent RAW (no manual HTML escaping):
// EmailJS escapes them on substitution, which is what we want.
// See docs/MVP.md §6.3.

import { TIME_OF_DAY_LABELS, type DateAnswers } from './dateForm'
import type { Invite } from './invite'
import activities from '../config/activities.json'
import vibes from '../config/vibes.json'

/** German labels for the email, formerly the i18n `email.*` namespace. */
const LABELS = {
  day: 'Tag',
  time: 'Tageszeit',
  vibe: 'Stimmung',
  excitement: 'Aufregung',
  activities: 'Aktivitäten',
  note: 'Süße Nachricht',
} as const

const ACTIVITY_LABELS: Record<string, string> = Object.fromEntries(
  activities.map((a) => [a.id, a.label]),
)
const VIBE_LABELS: Record<string, string> = Object.fromEntries(vibes.map((v) => [v.id, v.label]))

/** Plain-text params passed to EmailJS; names match the {{tokens}} in the
 * dashboard template (docs/email-template.html). */
export interface EmailParams extends Record<string, string> {
  subject: string
  header: string
  intro: string
  label_day: string
  value_day: string
  label_time: string
  value_time: string
  label_vibe: string
  value_vibe: string
  label_excitement: string
  value_excitement: string
  label_activities: string
  value_activities: string
  label_note: string
  value_note: string
  closing: string
  /** Plaintext fallback for the {{message}} variable. */
  message: string
}

/** Parse a yyyy-mm-dd string as a LOCAL date (no timezone drift). */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 0–100 → a 5-heart meter, e.g. 70 → ❤️❤️❤️❤️🤍 (broken heart at 0). */
function heartMeter(value: number): string {
  if (value === 0) return '💔'
  const filled = Math.max(1, Math.min(5, Math.round(value / 20)))
  return '❤️'.repeat(filled) + '🤍'.repeat(5 - filled)
}

export function buildEmail(answers: DateAnswers, invite: Invite): EmailParams {
  // All values render in German.
  const valueDay = answers.date
    ? new Intl.DateTimeFormat('de', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(parseLocalDate(answers.date))
    : '—'
  const valueTime = answers.timeOfDay ? TIME_OF_DAY_LABELS[answers.timeOfDay] : '—'
  const valueVibe = answers.vibe ? VIBE_LABELS[answers.vibe] ?? '—' : '—'
  const valueActivities = answers.activities.map((id) => ACTIVITY_LABELS[id] ?? id).join(', ')
  const valueExcitement = heartMeter(answers.excitement)
  const note = answers.note.trim()
  const valueNote = note || '(keine Nachricht hinterlassen)'

  const labels = LABELS

  const header = `${invite.inviterName}, gute Neuigkeiten! 💌`
  const intro = `${invite.inviteeName} möchte mit dir ausgehen!`
  const closing = `Meld dich bei ${invite.inviteeName} – viel Glück bei eurem Date! 🍀💕`

  const message = [
    header,
    '',
    intro,
    '',
    `${labels.day}: ${valueDay}`,
    `${labels.time}: ${valueTime}`,
    `${labels.vibe}: ${valueVibe}`,
    `${labels.excitement}: ${valueExcitement}`,
    `${labels.activities}: ${valueActivities}`,
    '',
    `${labels.note}: ${valueNote}`,
    '',
    closing,
  ].join('\n')

  return {
    subject: `💌 ${invite.inviteeName} hat Ja gesagt!`,
    header,
    intro,
    label_day: labels.day,
    value_day: valueDay,
    label_time: labels.time,
    value_time: valueTime,
    label_vibe: labels.vibe,
    value_vibe: valueVibe,
    label_excitement: labels.excitement,
    value_excitement: valueExcitement,
    label_activities: labels.activities,
    value_activities: valueActivities,
    label_note: labels.note,
    value_note: valueNote,
    closing,
    message,
  }
}
