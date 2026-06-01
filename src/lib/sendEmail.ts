// Thin wrapper around EmailJS for the one send this app does (invitee answers →
// inviter). Reads credentials from VITE_ env (client-side, safe to expose — see
// docs/MVP.md §5). If env is missing it no-ops with a warning so the app still
// works locally before EmailJS is configured.

import emailjs from '@emailjs/browser'
import type { EmailParams } from './email'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

/** True only when all three EmailJS values are present. */
export const emailConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

/** Send the built email to the inviter. The params match the {{tokens}} in the
 * EmailJS dashboard template (docs/email-template.html); To = {{to_email}}. */
export async function sendResultEmail(toEmail: string, params: EmailParams): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[email] EmailJS env not configured — skipping send.', { toEmail, params })
    return
  }
  await emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    { to_email: toEmail, ...params },
    { publicKey: PUBLIC_KEY },
  )
}
