# einDateMitMir 💌

https://www.einDateMitMir.com

> ⚠️ **Vibe-coded project — caveat emptor.**
> This was built fast and for fun, largely with an AI coding assistant, guided
> by vibes more than rigor. There are no tests, the architecture favors "cute
> and shippable" over robust, and corners were knowingly cut (see _Known
> trade-offs_ below). Read the code before trusting it with anything serious.

A playful little web app for inviting your partner or crush on a date. You fill
in a short form, get a shareable link, and send it off. They open it and get
walked through a cute multi-step "date form" — a dodging "No" button, a calendar,
activity tiles, a vibe picker, an excitement heart-meter, and a sweet note — that
ends by emailing their answers back to you.

The charm is the experience: it should feel like a love letter, not a form.

## Stack

- **Vite + React 19 + TypeScript** SPA — **no backend, no database** (a hard
  product constraint, not a temporary shortcut).
- **React Router v7** — routes `/` (landing) and `/date` (the form).
- **Tailwind CSS v4** via `@tailwindcss/vite`; theme lives in `@theme { … }`
  inside `src/index.css` (no `tailwind.config`).
- **react-i18next** — German is the default, English via the toggle.
- **framer-motion** — the dodging-"No" gag and step transitions.
- **EmailJS** (`@emailjs/browser`) — emails the answers to the inviter,
  client-side.

## How it works

- **All invite data lives in the URL.** The landing page encodes
  `{ inviterName, inviteeName, inviterEmail }` as base64url JSON into a single
  `?d=` param; the date page decodes it. No storage anywhere. (Consequence: the
  inviter's email is visible in the link — an accepted trade-off.)
- **The `/date` flow is a step wizard** in `src/pages/DatePage.tsx`: Ask → Day &
  time → Activities → Vibe → Excitement → Note → result. All answers live in one
  `DateAnswers` object lifted into the page; each step is a presentational
  component under `src/components/date/`.
- **On submit, EmailJS sends the answers** to the inviter. The email layout is a
  template in the EmailJS dashboard (see `docs/email-template.html`); the copy is
  passed in as plain-text params built in `src/lib/email.ts`, all from i18n.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Quick way to open the form locally: generate a link on `/`, or hit
`/date?d=<base64url of {inviterName,inviteeName,inviterEmail}>`.

### EmailJS setup

Email send needs three EmailJS values in a `.env` at the repo root (gitignored):

```
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
```

These are client-side values (safe to expose); **never put the private key here**.
The EmailJS dashboard template's Content should be the markup from
`docs/email-template.html` (HTML mode), with **To** = `{{to_email}}` and
**Subject** = `{{subject}}`. Without `.env`, the app runs fine — the send just
no-ops with a console warning.

## Commands

- `npm run dev` — dev server
- `npm run build` — type-check (`tsc -b`) + production build
- `npm run typecheck` — types only

## Project layout

- `src/pages/` — `LandingPage` (invite form + link), `DatePage` (wizard host)
- `src/components/date/` — one component per wizard step + shared `Calendar`
- `src/lib/` — `invite.ts` (URL encode/decode), `dateForm.ts` (`DateAnswers`),
  `email.ts` (builds email params), `sendEmail.ts` (EmailJS wrapper)
- `src/config/` — `activities.json`, `vibes.json` (editable tile lists)
- `src/i18n/` — i18next setup + `locales/{de,en}.json` (keep both in sync)
- `docs/` — `MVP.md` (product spec, source of truth) + `email-template.html`

## Known trade-offs

- **Deliverability:** emails go through EmailJS's free tier and often land in
  spam. The inviter is told to check their spam folder. Proper inbox placement
  needs domain auth (SPF/DKIM/DMARC) via a real ESP, which means a backend —
  out of scope.
- **No spam protection on send**, and the EmailJS allowed-origins lockdown is a
  paid feature, so it's deferred. The free monthly quota caps abuse.
- **The inviter's email is in the share link.** Accepted (the invitee normally
  knows the inviter).
- **No tests.** Vibe-coded, remember.

See `docs/MVP.md` for the full product spec and decisions.
