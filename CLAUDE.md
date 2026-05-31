# einDateMitMir

Playful web app to invite a partner/crush on a date in a cute, gamified way.
The inviter fills in a short form and gets a shareable link; the invitee opens
it and is walked through a multi-step "date form" (a dodging "No" button, a
calendar, activity tiles, a sweet note) that ends by emailing the answers back
to the inviter.

**Read `docs/MVP.md` first** — it is the source of truth for product decisions,
scope, and open questions. This file is the engineering briefing.

## Stack
- **Vite + React 19 + TypeScript** SPA — **no backend, no database** (a hard
  product constraint, not a temporary shortcut).
- **React Router v7** — routes `/` (landing) and `/date` (the form).
- **Tailwind CSS v4** via `@tailwindcss/vite`. No `tailwind.config` file — the
  theme lives in `@theme { … }` inside `src/index.css`.
- **react-i18next** — **German is the default**, English via the toggle.
- **framer-motion** — the dodging-"No" gag and the step transitions.
- **EmailJS** (`@emailjs/browser`) — emails answers to the inviter client-side.
  **Not wired up yet.**

## Core architecture
- **All invite data lives in the URL — there is no storage.** The landing page
  encodes `{ inviterName, inviteeName, inviterEmail }` as base64url JSON into a
  single `?d=` param; the date page decodes it. Encode/decode + the `Invite`
  type live in `src/lib/invite.ts`. Consequence to remember: the inviter's
  email is visible in the link (an accepted trade-off — see MVP §5).
- **The `/date` flow is a step wizard** held in `src/pages/DatePage.tsx`:
  a `step` index + `direction` drive a framer-motion `AnimatePresence`
  slide/fade. All collected answers live in one `DateAnswers` object
  (`src/lib/dateForm.ts`) lifted into `DatePage` and passed down to each step,
  so going back/forward preserves input. Each step is a presentational
  component under `src/components/date/` — state and navigation stay in the
  parent.

## Layout
- `src/pages/` — `LandingPage` (invite form + link generation), `DatePage`
  (the step wizard host)
- `src/components/` — `LanguageToggle`
- `src/components/date/` — one component per wizard step + shared `Calendar`
- `src/lib/invite.ts` — URL invite encode/decode (`Invite`)
- `src/lib/dateForm.ts` — `DateAnswers`/`TimeOfDay` types, `emptyAnswers`,
  `toIsoDate`
- `src/config/activities.json` — editable activity tiles; each has
  `{ id, icon, labelKey }` where `labelKey` is an i18n key
- `src/i18n/` — i18next setup + `locales/{de,en}.json` (keep both in sync)

## Conventions
- **Every user-facing string is an i18n key** — add it to **both** `de.json`
  and `en.json`. No hardcoded copy in components.
- **Styling is Tailwind utilities + the `blush-*` pink palette** defined in
  `src/index.css`. Reach for those tokens; avoid ad-hoc colors.
- Step components are dumb/presentational; lift state to `DatePage`.
- Dates are handled as local `yyyy-mm-dd` strings via `toIsoDate` to avoid
  timezone drift — don't pass raw `Date`s around or `toISOString()` days.

## Commands
- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` — type-check (`tsc -b`) + production build; **run before
  declaring work done**
- `npm run typecheck` — types only

Quick way to open the form locally: generate a link on `/`, or hit
`/date?d=<base64url of {inviterName,inviteeName,inviterEmail}>`.

## Status
- ✅ Scaffold + foundations (routing, i18n, theme, URL encode/decode)
- ✅ Landing page — invite form, link generation, copy-to-clipboard
- ✅ Wizard shell with animated step transitions
- ✅ Page 1 — the Ask: "Yes" advances; "No" dodges the cursor (desktop) /
  re-renders away from the tap point (touch). In `StepAsk.tsx`.
- ✅ Page 2 — calendar (single day, future only, locale-aware, Monday-first) +
  morning/afternoon/evening picker. In `StepDay.tsx` + `Calendar.tsx`.
- ⬜ **Page 3 — activity tiles** (multi-select grid from `activities.json`).
  `StepActivities.tsx` is currently a placeholder.
- ⬜ Page 4 — sweet note (optional free text), the last input step.
- ⬜ Final — confetti celebration screen.
- ⬜ EmailJS send of the collected answers on submit.
- ⬜ Deploy: SPA needs a catch-all rewrite to `index.html` so deep links to
  `/date?d=…` don't 404.

See `docs/MVP.md` §6 and §9 for the full spec and remaining open items
(activity list/icons, branding, copy).
