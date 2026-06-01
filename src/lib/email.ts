// Builds the params for the result email sent to the inviter when the invitee
// finishes the date form.
//
// EmailJS escapes HTML passed through a variable, so we CANNOT inject a prebuilt
// HTML body. Instead the layout lives in the EmailJS template (typed HTML, see
// docs/email-template.html) and we send the text pieces as plain-text params —
// the copy still all comes from our i18n. Values are sent RAW (no manual HTML
// escaping): EmailJS escapes them on substitution, which is what we want.
// See docs/MVP.md §6.3.

import type { TFunction } from 'i18next'
import type { DateAnswers } from './dateForm'
import type { Invite } from './invite'

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

export function buildEmail(
  answers: DateAnswers,
  invite: Invite,
  t: TFunction,
  locale: string,
): EmailParams {
  // Localized values, in the invitee's current language.
  const valueDay = answers.date
    ? new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(parseLocalDate(answers.date))
    : '—'
  const valueTime = answers.timeOfDay ? t(`date.day.${answers.timeOfDay}`) : '—'
  const valueVibe = answers.vibe ? t(`vibes.${answers.vibe}`) : '—'
  const valueActivities = answers.activities.map((id) => t(`activities.${id}`)).join(', ')
  const valueExcitement = heartMeter(answers.excitement)
  const note = answers.note.trim()
  const valueNote = note || t('email.noteEmpty')

  const labels = {
    day: t('email.day'),
    time: t('email.time'),
    vibe: t('email.vibe'),
    excitement: t('email.excitement'),
    activities: t('email.activities'),
    note: t('email.note'),
  }

  const header = t('email.header', { name: invite.inviterName })
  const intro = t('email.intro', { name: invite.inviteeName })
  const closing = t('email.closing', { name: invite.inviteeName })

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
    subject: t('email.subject', { name: invite.inviteeName }),
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
