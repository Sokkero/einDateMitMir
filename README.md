# einDateMitMir 💘

<a url="einDateMitMir.com">The webpage for your girlfriend.</a>


A playful, romantic single-page web app for asking your crush on a date. See
[`PROJECT.md`](./PROJECT.md) for the full project brief — it is the source of
truth for the design and feature set.

> **Status:** project scaffold only. The tooling, routing, types, config, and
> email plumbing are in place and the app builds and runs. The actual page UI
> and wizard (PROJECT.md §5–§6) are **not yet implemented** — the pages render
> placeholders, ready for implementation.

## Tech stack

- **Vite + React 19 + TypeScript** — SPA, no SSR.
- **React Router v7** — routes `/` (landing) and `/date` (wizard).
- **Tailwind CSS v4** via `@tailwindcss/vite`. No `tailwind.config` file — the
  theme lives in an `@theme { … }` block in [`src/index.css`](./src/index.css).
- **framer-motion** (v12) — transitions, the dodging-"No" gag, micro-interactions.
- **@emailjs/browser** (v4) — client-side email send to the inviter.
- Confetti is hand-built (framer-motion + emoji/CSS) — no confetti library.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build      # tsc -b && vite build (run before declaring work done)
npm run preview    # preview the production build
npm run typecheck  # tsc -b --noEmit
```

## URL-encoding approach (no backend, no database)

All invite data lives in the URL — there is no backend or storage. The landing
page encodes `{ inviterName, inviteeName, inviterEmail }` as **base64url-encoded
JSON** into a single `?d=` query param (see [`src/lib/invite.ts`](./src/lib/invite.ts)).
The date page decodes it to personalize the copy.

Known/accepted trade-off: the inviter's email is visible in the link.

Test the wizard directly with a link like `/date?d=<base64url of the JSON>`.

## EmailJS setup

The email send ([`src/lib/sendEmail.ts`](./src/lib/sendEmail.ts)) reads three
**client-side public** values from Vite env. Create a `.env` file in the project
root with:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

If these are unset, the app still runs and the send **no-ops with a
`console.warn`** — so you can develop without EmailJS configured.

The email layout lives in the EmailJS dashboard template (EmailJS HTML-escapes
variables, so we only pass plain-text tokens). A paste-ready template scaffold
is in [`docs/email-template.html`](./docs/email-template.html).

## Deployment — SPA catch-all rewrite

This is a client-routed SPA, so static hosts must rewrite all paths to
`index.html`, otherwise deep links like `/date?d=…` 404 on reload.

- **Netlify:** handled by [`public/_redirects`](./public/_redirects).
- **Vercel:** add a rewrite `{ "source": "/(.*)", "destination": "/index.html" }`.
- **GitHub Pages / other static hosts:** configure an equivalent SPA fallback.
