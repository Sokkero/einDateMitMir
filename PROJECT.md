# einDateMitMir 💌 — Project Brief

A playful, romantic web app for asking your partner or crush on a date. The
inviter fills in a tiny form and gets a shareable link. They send it to their
crush, who opens it and is walked through a cute, flirty, multi-step "date
form" — a dodging "No" button, a calendar, activity tiles, a vibe picker, an
excitement heart-meter, and a sweet note — that ends with a confetti
celebration and emails the answers back to the inviter.

**The charm is the experience: it should feel like a love letter, not a form.**
Every screen should make the person smile. Flirty, intimate, lovey-dovey, a
little cheeky.

> This document is the complete source of truth. Build the entire app from it.
> There is no prior codebase to reference.

---

## 1. Hard constraints (do not violate)

1. **No backend, no database.** All invite data lives in the URL. Everything is
   a static single-page app. Email is sent client-side.
2. **No image/raster assets whatsoever.** No PNG, JPG, SVG files, no icon
   libraries that ship images, no illustration packs. Everything visual is
   built from **pure CSS, gradients, CSS shapes/animations, emojis, and web
   fonts.** A favicon may be an inline emoji/SVG-in-`index.html` data URI, but
   ship no asset files. Activity/vibe icons are **emojis rendered as text.**
3. **German only.** All user-facing copy is German. No i18n library, no language
   toggle. Hardcode German strings (keep them tidy — see §9 for a copy deck).
4. **Fully responsive.** Must look genuinely nice on small phones (≈320px wide)
   through large desktop monitors (≥1440px). Test mentally at 320, 390, 768,
   1024, 1440. No horizontal scroll, no clipped content, touch targets ≥44px.
5. **The "No" button can never be clicked** (see §6, Step 1).

---

## 2. Tech stack (top-level — keep exactly this)

- **Vite + React 19 + TypeScript** — SPA, no SSR.
- **React Router v7** (`react-router-dom`) — routes `/` (landing) and `/date`
  (the wizard).
- **Tailwind CSS v4** via `@tailwindcss/vite`. **No `tailwind.config` file** —
  the theme lives in an `@theme { … }` block inside `src/index.css`.
- **framer-motion** (v12) — page/step transitions, the dodging-"No" gag, hearts,
  micro-interactions.
- **@emailjs/browser** (v4) — client-side email send to the inviter.
- Confetti: **do not add a confetti library.** Implement confetti with
  framer-motion + emojis/CSS (hearts and sparkles raining/bursting). Keeps the
  "no assets, pure design" rule and avoids extra deps.

Target `package.json` dependencies: `react`, `react-dom`, `react-router-dom`,
`framer-motion`, `@emailjs/browser`. Dev: `@vitejs/plugin-react`, `vite`,
`tailwindcss`, `@tailwindcss/vite`, `typescript`, `@types/react`,
`@types/react-dom`.

Scripts: `dev` (`vite`), `build` (`tsc -b && vite build`), `preview`
(`vite preview`), `typecheck` (`tsc -b --noEmit`).

`index.html` should have `lang="de"`, a viewport meta, an emoji/data-URI
favicon, and `<title>einDateMitMir 💘</title>`.

---

## 3. Architecture

### Routing & data flow
- **Route `/`** — landing page: the invite-creation form + generated link.
- **Route `/date`** — the date wizard. Reads invite data from the `?d=` query
  param. If the param is missing/invalid, show a friendly "this link is
  invalid" screen.
- **All invite data is URL-encoded.** Encode `{ inviterName, inviteeName,
  inviterEmail }` as **base64url-encoded JSON** into a single `?d=` param. The
  date page decodes it to personalize the copy. No storage anywhere.
  - Known/accepted trade-off: the inviter's email is visible in the link. That's
    fine (the invitee usually knows the inviter).
- **Deployment note:** the SPA needs a catch-all rewrite to `index.html` so deep
  links to `/date?d=…` don't 404 on static hosts. Mention this in the README.

### Wizard state
- The wizard is a single host component holding **one `DateAnswers` object** and
  a `step` index. Each step is a **presentational child component** — it
  receives the current value(s) and change callbacks; it owns no navigation or
  business state. Going back/forward preserves all input.
- Drive step transitions with a framer-motion `AnimatePresence`. Track a
  `direction` (+1 forward / −1 back) so the card slides the correct way.

### Suggested file layout
```
src/
  main.tsx                 # React root + BrowserRouter
  App.tsx                  # <Routes>: "/" and "/date"
  index.css                # @import "tailwindcss" + @theme tokens + globals
  pages/
    LandingPage.tsx        # invite form + link generation + copy button
    DatePage.tsx           # wizard host (step state, answers, submit)
  components/
    GlassCard.tsx          # the frosted-glass card frame (see §5)
    HeartsBackground.tsx   # animated gradient + drifting-hearts backdrop
    Confetti.tsx           # emoji/CSS confetti burst for the finale
    LanguageToggle?        # NOT NEEDED (German only)
    date/
      StepAsk.tsx          # Step 1 — the dodging "No" ask
      StepDay.tsx          # Step 2 — calendar + time-of-day
      Calendar.tsx         # reusable month calendar (future days only)
      StepActivities.tsx   # Step 3 — emoji activity tiles (multi-select)
      StepVibe.tsx         # Step 4 — vibe tiles (single-select)
      StepExcitement.tsx   # Step 5 — heart-meter slider
      StepNote.tsx         # Step 6 — sweet note textarea
  lib/
    invite.ts              # Invite type + base64url encode/decode + buildInviteUrl
    dateForm.ts            # DateAnswers/TimeOfDay types, emptyAnswers, toIsoDate
    email.ts               # buildEmail(answers, invite) -> EmailParams
    sendEmail.ts           # EmailJS wrapper (no-op if env missing)
  config/
    activities.json        # editable activity tile list (emoji icons)
    vibes.json             # editable vibe tile list (emoji icons)
```

### Data types
```ts
// lib/invite.ts
interface Invite { inviterName: string; inviteeName: string; inviterEmail: string }

// lib/dateForm.ts
type TimeOfDay = 'morning' | 'afternoon' | 'evening'
interface DateAnswers {
  date: string | null        // local ISO yyyy-mm-dd
  timeOfDay: TimeOfDay | null
  activities: string[]       // selected activity ids
  vibe: string | null        // single vibe id
  excitement: number         // 0–100
  note: string               // optional free text
}
const emptyAnswers: DateAnswers = { date: null, timeOfDay: null, activities: [], vibe: null, excitement: 50, note: '' }
```

**Date handling:** treat days as local `yyyy-mm-dd` strings throughout
(`toIsoDate(d: Date)`), and parse them back as **local** dates. Never use
`toISOString()` for day values — it causes timezone drift. The calendar is
locale-aware German (`Intl.DateTimeFormat('de', …)`), Monday-first.

---

## 4. Visual direction — "Floating glass cards"

The whole app sits on an **animated romantic backdrop** with **frosted-glass
cards** floating in the foreground. Lovey-dovey, dreamy, intimate.

### Backdrop (`HeartsBackground`, rendered behind everything)
- A **soft, slowly-shifting gradient** in the blush/rose palette (animate the
  gradient angle or background-position over ~20–30s, very gentle). Optionally
  a couple of large, blurred radial "glow" blobs that drift.
- **Drifting hearts:** a handful of translucent emoji hearts (💕 💗 🤍 💞)
  slowly floating upward/diagonally with varied size, speed, opacity, and a
  slight sway. Subtle — atmospheric, not busy. Keep count modest for perf
  (~10–18). Respect `prefers-reduced-motion` (see §8).

### Glass cards (`GlassCard`)
- Frosted glass: semi-transparent white background, `backdrop-blur`, soft inner
  highlight, a hairline light border, and a generous soft drop shadow with a
  rosy tint. Rounded-3xl corners.
- This replaces the old paper-letter metaphor. Each landing screen and each
  wizard step renders inside a glass card centered on the backdrop.
- **Responsive sizing:** card is fluid — comfortable max-width on desktop
  (~`min(560px, 92vw)`), full breathing room on mobile with sensible padding.
  Content inside must reflow naturally (flex/grid), **not** be uniformly
  scaled — make it genuinely responsive so text stays crisp at every size.
- Cards animate in with a gentle spring (slight rise + fade + tiny scale).

### Palette & type (define as Tailwind v4 `@theme` tokens in `index.css`)
Pink-forward blush palette (use these or refine tastefully):
```
--color-blush-50:  #fff5f8;
--color-blush-100: #ffe4ee;
--color-blush-200: #ffc9dd;
--color-blush-300: #ffa6c8;
--color-blush-400: #ff7aad;
--color-blush-500: #ff4f93;   /* primary */
--color-blush-600: #e63a7c;
--color-blush-700: #c12a64;   /* default text */
```
Consider adding a warm accent (coral/rose-gold, e.g. `#ff8a8a`) for highlights
and a deep berry for contrast text where needed.

**Fonts:** load via Google Fonts `<link>` in `index.html` (a font CDN link is
allowed — it ships no asset file to the repo). Pair a **friendly rounded display
face for headings** (e.g. *Quicksand*, *Baloo 2*, or *Fredoka*) with a clean
readable body face (e.g. *Nunito* or system rounded). Expose as
`--font-display` / `--font-body` theme tokens. Headings should feel warm and
playful; body text clean.

### Motion & micro-interactions
- Buttons: gentle hover scale (~1.03) and active press (~0.95), soft shadow.
- Selected tiles get a satisfying pop + glow.
- Step transitions slide horizontally with the navigation direction; headline
  cross-fades up.
- Sprinkle tasteful emoji flourishes (💕 ✨ 🌸 💌) — charming, never cluttered.
- Everything should feel soft and springy (framer-motion springs), not linear.

---

## 5. Pages

### 5.1 Landing page (`/`)
A single glass card, centered, with the drifting-hearts backdrop.

- **Hook headline** (German), warm and inviting, e.g.
  *"Lade jemanden auf ein Date ein 💘"* with a flirty subline.
- **Form fields** (all required, light validation):
  - *An:* invitee's name (`inviteeName`) — placeholder *"Ihr/Sein Name"*
  - *Von:* your name (`inviterName`) — placeholder *"Dein Name"*
  - *E-Mail:* your email (`inviterEmail`, `type="email"`) — placeholder
    *"Deine E-Mail-Adresse"*
- **"Senden!"** button → generates the `/date?d=…` link.
- **After generating:** the form cross-fades to a result state showing a sweet
  confirmation message, the link in a copyable code box, and a **"Link
  kopieren"** button (uses `navigator.clipboard`, shows *"Kopiert!"* briefly
  after copying). Tell the inviter they'll get an email with the answer and to
  check spam. Add a gentle "share" affordance if easy (e.g. Web Share API on
  supported devices).
- Validation: names non-empty, email matches a basic email pattern. Show
  friendly inline hints, not harsh errors.

### 5.2 Date wizard (`/date?d=…`)
Decode the invite. If invalid → friendly invalid-link screen (German).
Otherwise run the step flow below inside a glass card, with a **progress
indicator made of hearts** (filled hearts = completed steps) above the card.

The wizard host owns `answers`, `step`, `direction`, and submit state
(`sending`, `error`, `done`). A footer holds **Zurück** (back, hidden on the
first wizard step) and a primary **Weiter** / **Senden!** button that's disabled
until the current step's validity gate passes.

---

## 6. Wizard steps (keep all, add flourishes)

Personalize copy with the inviter's/invitee's names where noted.

**Step 1 — The Ask** (`StepAsk`) — *no progress shown yet; full-bleed moment.*
- Greeting: *"Hey {inviteeName}! 💕"* and the question
  *"Möchtest du mit {inviterName} ausgehen?"*
- Two buttons: **"Ja!"** and **"Nein"**.
- The **"Nein" button can never be clicked:**
  - **Desktop:** it *dodges the cursor* — when the pointer gets within a small
    radius (~90px) of the button, it springs to a far, random spot within its
    play area, never overlapping the "Ja!" button.
  - **Touch:** there's no hover, so it must re-render/jump away the instant a
    finger lands on or near it (`onTouchStart`, prevent default), so it visually
    behaves as if it dodged the finger.
  - Keep it fun, not frustrating — springy motion, and never let it land off
    screen or under "Ja!".
- **Flourish:** every time "Nein" flees, the **"Ja!" button grows** a little
  (cap the growth) and the dodging gets cheekier. Optional: a tiny floating
  taunt emoji (😏) near where "Nein" was.
- **"Ja!"** → advance to Step 2 (consider a little burst of hearts on yes).

**Step 2 — Pick a day & time** (`StepDay` + `Calendar`)
- Headline: *"Welcher Tag passt dir am besten?"*
- **Calendar:** single-day select, **future days only** (today + past disabled),
  German locale, **Monday-first**, month navigation (can't go before the current
  month). Selected day gets the primary blush highlight. Build it from scratch
  with `Intl.DateTimeFormat('de', …)` for month + weekday labels. Must be
  finger-friendly on mobile (round day cells, ≥44px tap targets).
- **Time of day:** three buttons — *Morgens / Nachmittags / Abends* (single
  choice), stored as `morning | afternoon | evening`.
- Validity gate: a day **and** a time are both selected.

**Step 3 — Activities** (`StepActivities`) — multi-select
- Headline: *"Was hättest du Lust mit {inviterName} zu unternehmen?"*
- A responsive grid of tiles from `config/activities.json`. Each tile = a big
  **emoji icon** + a German label. Multi-select, **no cap**, at least one
  required to continue. Selected tiles get a checkmark badge + glow + pop.
- Grid: ~3 columns on phones, more on wider screens; equal-size square-ish
  tiles; labels reserve consistent height so wrapping doesn't resize tiles.
- See §7 for the activity list (all emoji — **no SVGs**).

**Step 4 — Vibe** (`StepVibe`) — single-select
- Headline: *"Welche Stimmung soll es sein?"*
- Same tile pattern as activities but **single-select** (picking one clears the
  rest). List from `config/vibes.json` (emoji icons). Exactly one required.

**Step 5 — Excitement heart-meter** (`StepExcitement`)
- Headline: *"Wie aufgeregt bist du?"*
- A `0–100` slider (`accent` = blush). A big heart ❤️ **grows** as the slider
  moves right (spring animation); at `0` it shrinks into a broken heart 💔.
  Always valid (any value passes). Default 50.
- **Flourish:** at high values, emit a few floating hearts; maybe the heart
  pulses/beats faster as excitement rises.

**Step 6 — Sweet note** (`StepNote`)
- Headline: *"Hinterlasse eine süße Nachricht"*
- A rounded, frosted textarea, placeholder *"Schreib {inviterName} etwas
  Liebes …"*. Optional (empty is fine). This is the last input; its primary
  button reads **"Senden!"**.

**Finale — Submit & celebrate**
- On submit: build the email and send via EmailJS (§8). While sending, button
  shows *"Senden …"* and is disabled. On error, show a friendly retry message
  (*"Hoppla, das hat nicht geklappt. Versuch es bitte nochmal."*).
- On success: cross-fade to a **celebration screen** with **confetti** (emoji
  hearts/sparkles bursting and raining — pure framer-motion/CSS, no library):
  headline *"Juhu! 🎉"* and a sweet wrap-up, e.g.
  *"Wir haben deine Antwort an {inviterName} geschickt. {inviterName} meldet
  sich bei dir – viel Glück bei eurem Date! 💕"*. Make this moment feel like a
  payoff.

**Added flourishes to weave throughout (per the brief):**
- An **opening reveal** on the wizard's first paint (the glass card and first
  question easing in).
- A **heart-based progress indicator** above the card (one heart per step,
  filling as you advance).
- The **celebratory confetti finale** above.
- Subtle hover/press life on every interactive element.

---

## 7. Config data (emoji icons only — no image files)

`src/config/activities.json` — editable tile list. Shape:
`{ "id": string, "icon": <emoji>, "label": <German> }`. Suggested set:

```json
[
  { "id": "cinema",          "icon": "🎬", "label": "Kino" },
  { "id": "dinner",          "icon": "🍝", "label": "Abendessen" },
  { "id": "walk",            "icon": "🌳", "label": "Spaziergang" },
  { "id": "picnic",          "icon": "🧺", "label": "Picknick" },
  { "id": "sports",          "icon": "🏃", "label": "Sport" },
  { "id": "netflixandchill", "icon": "🍿", "label": "Netflix & Chillen" },
  { "id": "bicycletour",     "icon": "🚲", "label": "Fahrradtour" },
  { "id": "cooking",         "icon": "🍳", "label": "Zusammen kochen" },
  { "id": "privateTime",     "icon": "💕", "label": "Zweisamkeit" },
  { "id": "icecream",        "icon": "🍦", "label": "Eis essen" },
  { "id": "zoo",             "icon": "🦁", "label": "Zoo-Besuch" },
  { "id": "hangout",         "icon": "🛋️", "label": "Abhängen" },
  { "id": "coffee",          "icon": "☕", "label": "Kaffee-Date" },
  { "id": "gardening",       "icon": "🪴", "label": "Gärtnern" }
]
```

`src/config/vibes.json` — single-select. Suggested set:

```json
[
  { "id": "casual",      "icon": "😎",  "label": "Locker" },
  { "id": "fancy",       "icon": "🥂",  "label": "Schick" },
  { "id": "adventurous", "icon": "🧗",  "label": "Abenteuerlich" },
  { "id": "cozy",        "icon": "🛋️", "label": "Gemütlich" },
  { "id": "spicy",       "icon": "🌶️", "label": "Heiß" }
]
```

Components render `icon` directly as text (e.g. `<span>{activity.icon}</span>`),
sized with font-size. The submitted result stores selected `id`s; labels are
resolved from these files for the email.

---

## 8. Email (EmailJS, client-side)

On final submit, send the collected answers to the inviter via EmailJS.

- **`lib/email.ts` — `buildEmail(answers, invite): EmailParams`.** EmailJS
  HTML-escapes variables, so you **cannot** inject a prebuilt HTML body. The
  email *layout* lives in the EmailJS dashboard template (HTML); we pass
  **plain-text params** that fill `{{tokens}}`. Build these German values:
  - `subject` — e.g. `💌 {inviteeName} hat Ja gesagt!`
  - `header` — e.g. `{inviterName}, gute Neuigkeiten! 💌`
  - `intro` — e.g. `{inviteeName} möchte mit dir ausgehen!`
  - label/value pairs for: **Tag** (German long date — parse the ISO string as a
    *local* date), **Tageszeit** (Morgens/Nachmittags/Abends), **Stimmung**
    (vibe label), **Aufregung** (render 0–100 as a 5-heart meter, e.g.
    `❤️❤️❤️❤️🤍`; `0` → `💔`), **Aktivitäten** (comma-joined labels), **Süße
    Nachricht** (the note, or a German fallback like *"(keine Nachricht
    hinterlassen)"* since the free tier has no conditionals).
  - `closing` — e.g. `Meld dich bei {inviteeName} – viel Glück bei eurem Date! 🍀💕`
  - Also include a plain-text `message` (all the above joined with newlines) as
    a fallback token.
- **`lib/sendEmail.ts`** — thin wrapper around `@emailjs/browser`. Read three
  values from Vite env: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`,
  `VITE_EMAILJS_PUBLIC_KEY`. These are client-side public values (safe to
  expose). Send with `To = {{to_email}}` set to the inviter's email and spread
  the params. **If env is missing, no-op with a `console.warn`** so the app
  still runs locally without EmailJS configured. Provide a `.env.example` and
  document setup in the README.
- Ship a paste-ready EmailJS HTML template in `docs/email-template.html`: a
  mobile-friendly blush-themed card (max-width ~600px, rows stack label-over-
  value, table-based for email-client compatibility) using the tokens above.

**Reduced motion:** honor `prefers-reduced-motion` — drop/greatly reduce the
drifting hearts, confetti, and large animations; keep essential transitions
minimal. Accessibility basics: real `<button>`/`<label>` elements, `aria-label`
on icon-only controls, `aria-pressed` on toggle tiles, visible focus states,
sufficient contrast for body text.

---

## 9. Copy deck (German — adjust tone to flirty/intimate, keep it tasteful)

- Landing headline: **"Lade jemanden auf ein Date ein 💘"**
- Landing subline: e.g. **"Erstelle einen süßen Link und überrasche deinen Schwarm."**
- Field labels: **An:** / **Von:** / **E-Mail:**
- Send: **"Senden!"** · Copy link: **"Link kopieren"** / **"Kopiert!"**
- Link-ready message: a warm note that the link is ready, to send it to their
  crush, and that they'll get an email with the answer (check spam) 💕
- Invalid link: **"Dieser Link ist leider ungültig."**
- Step titles & buttons: see §6. Nav: **"Zurück"** / **"Weiter"** / **"Senden!"**
  (sending: **"Senden …"**).
- Finale: **"Juhu! 🎉"** + the wrap-up in §6.
- Keep it warm, a little cheeky, intimate — but never crude.

---

## 10. Commands & definition of done

- `npm install` → `npm run dev` (http://localhost:5173).
- `npm run build` must pass `tsc -b` cleanly and produce a production build —
  **run it before declaring the work done.**
- Quick local test of the wizard without the landing page: build a link as
  `/date?d=<base64url of {"inviterName","inviteeName","inviterEmail"}>`.

**Done means:**
1. Both routes work; invite encode/decode round-trips.
2. All six steps + finale work, with validity gates and back/forward preserving
   answers.
3. The "Nein" button is genuinely unclickable on both desktop (dodge) and touch
   (jump).
4. Confetti finale fires; EmailJS sends (or no-ops cleanly without env).
5. **Looks polished and responsive** at 320 / 390 / 768 / 1024 / 1440px — no
   overflow, no clipping, comfortable touch targets.
6. **Zero image asset files** in the repo; all visuals are CSS/emoji/fonts.
7. German throughout; no i18n library.
8. `npm run build` passes.
9. README documents the stack, the URL-encoding approach, EmailJS env setup, and
   the static-host catch-all rewrite for deep links.
