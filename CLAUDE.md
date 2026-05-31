# einDateMitMir

Playful web app to invite a partner/crush on a date. See `docs/MVP.md` for the
full product spec and decisions.

## Stack
- **Vite + React + TypeScript** SPA (no backend, no database).
- **React Router** — routes `/` (landing) and `/date` (the form).
- **Tailwind CSS v4** via `@tailwindcss/vite` (theme tokens in `src/index.css`).
- **react-i18next** — German default, English toggle (`src/i18n/`).
- **EmailJS** — answers are emailed to the inviter client-side (not wired yet).
- **framer-motion** — for the dodging-"No" gag and page transitions.

## How it works
Invite data (`inviterName`, `inviteeName`, `inviterEmail`) is encoded into the
URL — no storage. The landing page builds a `/date?d=<base64url>` link; the date
page decodes it. Encode/decode lives in `src/lib/invite.ts`.

## Layout
- `src/pages/` — `LandingPage`, `DatePage`
- `src/components/` — shared UI (e.g. `LanguageToggle`)
- `src/lib/invite.ts` — URL invite encode/decode
- `src/config/activities.json` — editable activity tiles (labels are i18n keys)
- `src/i18n/` — i18next setup + `locales/{de,en}.json`

## Commands
- `npm run dev` — dev server (http://localhost:5173)
- `npm run build` — type-check + production build
- `npm run typecheck` — types only

## Status
Scaffold + foundations done. The multi-step form (dodging "No", calendar +
time-of-day, activity tiles, sweet note, confetti) and the EmailJS send are
still to be built — see `docs/MVP.md` §6 and §9.
