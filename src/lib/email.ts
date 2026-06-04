import type { DateAnswers } from './dateForm.ts'
import type { Invite } from './invite.ts'

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

/**
 * Build the German email params from the wizard answers + invite.
 *
 * TODO (implementation): fill in the real German copy and value formatting
 * per PROJECT.md §8 (long local date, time-of-day labels, vibe/activity label
 * resolution, 5-heart excitement meter, note fallback).
 */
export function buildEmail(_answers: DateAnswers, invite: Invite): EmailParams {
  return {
    to_email: invite.inviterEmail,
    subject: '',
    header: '',
    intro: '',
    tag: '',
    tageszeit: '',
    stimmung: '',
    aufregung: '',
    aktivitaeten: '',
    nachricht: '',
    closing: '',
    message: '',
  }
}
