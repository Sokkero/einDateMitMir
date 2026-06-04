import emailjs from '@emailjs/browser'
import type { EmailParams } from './email.ts'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined

/**
 * Send the collected answers to the inviter via EmailJS.
 * If env vars are missing, no-ops with a console.warn so the app still runs
 * locally without EmailJS configured.
 */
export async function sendEmail(params: EmailParams): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn(
      '[sendEmail] EmailJS env vars missing — skipping send. ' +
        'Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY.',
    )
    return
  }

  await emailjs.send(SERVICE_ID, TEMPLATE_ID, { ...params }, { publicKey: PUBLIC_KEY })
}
