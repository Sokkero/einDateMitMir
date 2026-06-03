// Answers collected across the multi-step date form (see docs/MVP.md §6.2).
// Nothing is persisted until final submit; this is just in-memory wizard state.

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

/** German labels for each time of day, shared by the form and the email. */
export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning: 'Morgens',
  afternoon: 'Nachmittags',
  evening: 'Abends',
}

export interface DateAnswers {
  /** Chosen day as a local ISO date string (yyyy-mm-dd), or null. */
  date: string | null
  /** Chosen time of day, or null. */
  timeOfDay: TimeOfDay | null
  /** Selected activity ids (see src/config/activities.json). */
  activities: string[]
  /** Chosen vibe id (single-select, see src/config/vibes.json), or null. */
  vibe: string | null
  /** Excitement level, 0–100, from the heart-meter slider. */
  excitement: number
  /** Optional sweet note from the invitee. */
  note: string
}

export const emptyAnswers: DateAnswers = {
  date: null,
  timeOfDay: null,
  activities: [],
  vibe: null,
  excitement: 50,
  note: '',
}

/** Format a local date as yyyy-mm-dd without timezone drift. */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
