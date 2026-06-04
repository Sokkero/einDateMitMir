export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export interface DateAnswers {
  date: string | null // local ISO yyyy-mm-dd
  timeOfDay: TimeOfDay | null
  activities: string[] // selected activity ids
  vibe: string | null // single vibe id
  excitement: number // 0–100
  note: string // optional free text
}

export const emptyAnswers: DateAnswers = {
  date: null,
  timeOfDay: null,
  activities: [],
  vibe: null,
  excitement: 50,
  note: '',
}

/**
 * Format a Date as a local `yyyy-mm-dd` string.
 * Never use toISOString() for day values — it causes timezone drift.
 */
export function toIsoDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Parse a local `yyyy-mm-dd` string back into a local Date. */
export function fromIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}
