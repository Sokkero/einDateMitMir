interface Props {
  /** Inviter's name, interpolated into the placeholder. */
  inviterName: string
  /** Current note text. */
  value: string
  /** Called with the new text as the invitee types. */
  onChange: (value: string) => void
}

/**
 * Sweet-note page body — an optional free-text message from the invitee back to
 * the inviter. The last input step; always passable (empty is fine), so
 * DatePage gates it with `canContinue: () => true`. Title and nav live in
 * DatePage's headline and footer. See docs/MVP.md §6.2.
 */
export default function StepNote({ inviterName, value, onChange }: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Schreib ${inviterName} etwas Liebes ...`}
        rows={9}
        className="w-full max-w-sm resize-none rounded-3xl border-2 border-blush-200 bg-white/70 px-4 py-3 text-center text-blush-600 placeholder:text-blush-300 focus:border-blush-400 focus:outline-none"
      />
    </div>
  )
}
