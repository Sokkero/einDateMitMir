import { useSearchParams } from 'react-router-dom'
import { decodeInvite } from '../lib/invite.ts'

// Scaffold placeholder. Implementation TODO: the multi-step date wizard
// (PROJECT.md §5.2 + §6). For now it only decodes the invite and shows a
// friendly placeholder / invalid-link state.
export default function DatePage() {
  const [params] = useSearchParams()
  const invite = decodeInvite(params.get('d'))

  if (!invite) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-blush-700">Dieser Link ist leider ungültig.</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="font-display text-2xl font-bold text-blush-600">
        Hey {invite.inviteeName}! 💕
      </h1>
      <p className="text-blush-700">Date-Wizard — bereit für die Umsetzung.</p>
    </main>
  )
}
