interface StepNoteProps {
  inviterName: string
  value: string
  onChange: (v: string) => void
}

/** Step 6 — optional sweet note. Last input; primary button reads "Senden!". */
export default function StepNote({ inviterName, value, onChange }: StepNoteProps) {
  return (
    <div className="text-center">
      <h2 className="mb-5 font-display text-xl font-bold text-blush-600 sm:text-2xl">
        Hinterlasse eine süße Nachricht 💌
      </h2>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        maxLength={500}
        placeholder={`Schreib ${inviterName} etwas Liebes …`}
        aria-label="Süße Nachricht"
        className="w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-blush-700 placeholder:text-blush-300 shadow-inner outline-none transition focus:border-blush-400 focus:ring-2 focus:ring-blush-300"
      />
      <p className="mt-2 text-sm text-blush-400">Ganz wie du magst – auch leer ist okay. 💕</p>
    </div>
  )
}
