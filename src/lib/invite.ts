// Invite data is carried entirely in the URL — no backend, no database.
// See docs/MVP.md §5. The landing page encodes the invite into a single `d`
// query param; the /date page decodes it.

export interface Invite {
  /** Name of the person sending the invite. */
  inviterName: string
  /** Name of the person being invited (the crush/partner). */
  inviteeName: string
  /** Inviter's email — where the completed answers get sent. */
  inviterEmail: string
}

/** Base64url-encode UTF-8 JSON (URL-safe, no padding). */
function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Encode an invite into the `d` query-param value. */
export function encodeInvite(invite: Invite): string {
  return toBase64Url(JSON.stringify(invite))
}

/** Decode the `d` query-param value back into an invite, or null if invalid. */
export function decodeInvite(value: string | null): Invite | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(fromBase64Url(value)) as Partial<Invite>
    if (
      typeof parsed.inviterName === 'string' &&
      typeof parsed.inviteeName === 'string' &&
      typeof parsed.inviterEmail === 'string'
    ) {
      return parsed as Invite
    }
    return null
  } catch {
    return null
  }
}

/** Build the full shareable `/date?d=...` URL for an invite. */
export function buildInviteUrl(invite: Invite, origin: string): string {
  return `${origin}/date?d=${encodeInvite(invite)}`
}
