export interface Invite {
  inviterName: string
  inviteeName: string
  inviterEmail: string
}

/** Encode a UTF-8 string to base64url (no padding). */
function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Decode a base64url string back to a UTF-8 string. */
function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Encode an invite as a base64url-encoded JSON string for the `?d=` param. */
export function encodeInvite(invite: Invite): string {
  return toBase64Url(JSON.stringify(invite))
}

/** Decode a `?d=` param back into an Invite, or null if missing/invalid. */
export function decodeInvite(param: string | null | undefined): Invite | null {
  if (!param) return null
  try {
    const parsed = JSON.parse(fromBase64Url(param)) as Partial<Invite>
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

/** Build the full shareable `/date?d=…` URL for an invite. */
export function buildInviteUrl(invite: Invite): string {
  return `${window.location.origin}/date?d=${encodeInvite(invite)}`
}
