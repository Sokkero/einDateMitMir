# einDateMitMir — MVP Requirements

> Status: **Draft / in discussion.** Several sections are intentionally open
> and marked as such. This document captures the agreed direction so far and
> the decisions still to be made.

---

## 1. Vision

A playful web platform for couples — or anyone with a crush — to invite their
partner/crush on a date. The person inviting fills in a few details and gets a
shareable link. The invitee opens the link and is walked through a cute,
multi-step "date form" with little minigames and questions. When they finish,
their answers (chosen day + activities) are emailed back to the inviter.

The charm is in the experience: it should feel like a love letter, not a form.

---

## 2. MVP scope

**Chosen ambition level: _Lean + polish_** — ship the core loop end to end, but
make it genuinely delightful (nice styling, animations, a couple of extra form
pages beyond the minimum three).

### In scope (MVP)
- Landing page with the invite-creation form.
- Link generation (data encoded in the URL — see §5).
- Multi-step date form (pages defined in §6).
- Cute styling + light animations / transitions.
- Email delivery of the completed answers to the inviter.
- **Language toggle**: German by default, switchable to English.

### Out of scope (for now)
- User accounts / login.
- Saving or revisiting past dates / a results dashboard.
- A database of any kind.
- Multiple themes, multi-language switching, payments.
- Native mobile apps (the repo's Expo `.gitignore` is a leftover — see §4).

---

## 3. Target users & core flow

**Inviter** — wants to ask someone out in a fun way.
**Invitee** — the partner/crush who receives and completes the invite.

Core loop:
1. Inviter visits `www.einDateMitMir.com`, enters **their name**, **the
   invitee's name**, and **their own email address**.
2. App generates a link: `www.einDateMitMir.com/date?[data]`.
3. Inviter sends that link to the invitee (manually, via their own channel).
4. Invitee opens the link → multi-step form → completes it.
5. On submit, the invitee's answers + the inviter's email are sent to a
   serverless function, which emails the results to the inviter.

---

## 4. Tech stack

**Target: pure web app.** (The current `.gitignore` is a React Native / Expo
template and should be replaced with a web-app `.gitignore`.)

**Recommended stack:**
- **Vite + React** SPA — no backend is needed (email is sent client-side via
  EmailJS, see §5), so a plain SPA is the simplest fit.
- **React Router** for `/` and `/date`.
- **TypeScript**.
- **Tailwind CSS** (or CSS modules) for styling.
- **Framer Motion** for the dodging-button + page-transition animations.
- **i18n: `react-i18next`** for the German/English toggle (German default).
- **Email: EmailJS** (browser-side send — see §5).
- **Deployment: any static host** (Vercel / Netlify / Cloudflare Pages) with
  the custom domain.

> _Note:_ Since EmailJS removes the need for a server, a SPA is enough. If we
> later want **rich link previews** (Open Graph cards when the invite link is
> shared in chat apps), we'd move to an SSR framework like Next.js — noted as a
> future consideration, not MVP.

---

## 5. Data handling & architecture

**Approach: URL-encoded, no database.** All invite data lives in the link.

- The landing-page form encodes `{ inviterName, inviteeName, inviterEmail }`
  into the URL (e.g. base64-encoded JSON in a single query param) when
  generating the `/date?[data]` link.
- The `/date` page decodes this to personalize the form ("Would you like to go
  out with **{inviterName}**?" etc.).
- No data is persisted server-side. Responses are **not stored** — they are
  only delivered by email at submit time.

### Sending the email — EmailJS (decided)
Email is sent **client-side via EmailJS** at final submit, with no backend.
- Pros: zero infrastructure, fits the SPA + no-DB approach perfectly.
- Trade-offs to keep in mind:
  - EmailJS uses a **public key exposed in the browser** — protect the account
    with EmailJS's allowed-domains setting and rate limits.
  - Deliverability is weaker than a transactional provider; the inviter should
    check spam if they don't see it.
  - No spam protection on send by default — consider a lightweight honeypot /
    rate limit. _Open item._

### Known trade-offs of URL-encoding (accepted)
- The inviter's **email address is visible in the link** the invitee receives.
  Accepted for the MVP (the invitee normally knows the inviter).
- Links can get long; use a tidy base64 encoding of the JSON payload.

---

## 6. Pages & features

A **language toggle** (DE/EN, German default) is available throughout.

### 6.1 Landing page — `/`
- Branding / hook ("Lade jemanden auf ein Date ein 💌" — copy TBD).
- Form fields: **Your name**, **Their name**, **Your email**.
- "Generate link" action → produces the `/date?[data]` URL.
- A way to **copy the link** (copy-to-clipboard button) and ideally a quick
  "share" affordance.
- Light validation (name not empty, valid email format).

### 6.2 Date form — `/date?[data]`
A multi-step ("wizard") flow. Progress is local; nothing is sent until final
submit. **The page list may still grow — see §7.**

**Page 1 — The Ask**
- Question: _"Would you like to go out with me?"_ (personalized with the
  inviter's name).
- Two buttons: **Yes** and **No**.
- The **No** button **dodges the cursor** so it can never be clicked. On
  **touch devices**, there is no hover, so the button **re-renders offset from
  the tap point** the instant a touch lands near/on it — visually behaving as
  if it dodged the finger. The gag must still feel fun, not frustrating.
- **Yes** → next page.

**Page 2 — Pick a day & time**
- A calendar to select the day that works best.
  - **Single day only.**
  - **Future days only** (today and past are disabled).
- A **time-of-day** picker on the same page — **simple, three buckets:
  morning / afternoon / evening** (single choice).

**Page 3 — What shall we do?**
- Multi-select grid of activity tiles. Each tile has a **title** and an
  **icon/image**.
  - **Fixed list** (no free-text "something else").
  - **No cap** on the number of selections.
  - The list is **configurable via a JSON file** (e.g.
    `src/config/activities.json`) so activities/icons can be added or changed
    without touching component code. Tile labels are i18n keys (DE/EN).
- **Placeholder activities for now** (final list TBD — see §6.4):
  Cinema 🎬, Coffee date ☕, Dinner 🍝, Walk in the park 🌳, Picnic 🧺,
  Gym 🏋️, Bowling 🎳, Concert 🎵.

**Page 4 — Leave a sweet note (last page)**
- Optional free-text message from the invitee back to the inviter.
- This is the final input step; submitting it triggers the email and the
  celebration screen.

**Final — Submit & celebrate**
- A confirmation/celebration screen with **confetti** and a sweet message.
- Triggers the EmailJS send to the inviter with all collected answers.

### 6.3 Email to inviter
Sent on final submit. Contains:
- Invitee's name, the chosen day + time of day, selected activities, and the
  optional sweet note.
- Friendly subject + body, in the inviter's chosen language. Copy TBD.

### 6.4 Activities config
Activities are data, not code — kept in a JSON file (e.g.
`src/config/activities.json`) and rendered into the Page 3 grid. Shape sketch
(final fields TBD):

```json
[
  { "id": "cinema",  "icon": "🎬", "labelKey": "activities.cinema" },
  { "id": "coffee",  "icon": "☕", "labelKey": "activities.coffee" },
  { "id": "dinner",  "icon": "🍝", "labelKey": "activities.dinner" },
  { "id": "walk",    "icon": "🌳", "labelKey": "activities.walk" }
]
```
- `icon` may later become an image path instead of an emoji.
- `labelKey` resolves through i18n so each activity has DE + EN labels.
- The submitted result stores the selected `id`s.

---

## 7. Additional form-page ideas (brainstorm — INCOMPLETE)

> This list is **not final**. Captured here as candidates; we'll keep adding
> ideas and pick which make future cuts.

**Adopted into the MVP** (now in §6):
- ✅ **Time-of-day picker** — folded into Page 2 alongside the calendar.
- ✅ **Leave a sweet note** — its own page, the last input step (Page 4).
- ✅ **Confetti celebration** — the final screen.

**Still candidates (not in MVP yet):**
- **Vibe selector** — casual / fancy / adventurous / cozy.
- **"How excited are you?" slider** — a heart-meter that fills up.
- **Mini quiz** — "How well do you know me?" a couple of light questions.
- **Scratch-card / reveal** — scratch to uncover a compliment or the question.
- **Spin-the-wheel / slot machine** — playful randomizer for a surprise prompt.
- **Heart-matching memory minigame** — match pairs before continuing.
- **"Catch the falling hearts" microgame** — quick, skippable bit of fun.
- **Dress-code / who-plans-it toggle** — lighthearted logistics.

---

## 7b. Branding & visual direction

- **Mood:** cute, lovey-dovey, romantic.
- **Palette:** **pink-forward** — soft pinks, blush, with warm accents (reds /
  rose). Exact tokens TBD.
- **Logo:** a **cupid** (or similar love motif). Placeholder until designed.
- **Tone of voice:** playful, warm, a little cheeky (matches the dodging "No").
- **Fonts:** TBD — likely a friendly rounded display face for headings + a
  clean readable body face.

---

## 8. Decisions & open questions

### Decided
- ✅ Email mechanism: **EmailJS** (client-side).
- ✅ Framework: **Vite + React** SPA.
- ✅ Data: **URL-encoded, no DB**; inviter email visible in link is accepted.
- ✅ Language: **German default, English toggle** (both).
- ✅ Calendar: **single day, future days only**.
- ✅ Activity tiles: **fixed list, no free-text, no selection cap**; driven by a
      **JSON config**; placeholder activities chosen for now.
- ✅ Extra pages: time-of-day (on Page 2), sweet note (Page 4), confetti finish.
- ✅ Time-of-day: **simple** morning / afternoon / evening.
- ✅ Touch "No" button: **re-render offset from the tap point** to fake a dodge.
- ✅ Spam protection: **not for now**.
- ✅ Branding direction: **cute, pink-forward, cupid logo** (see §7b).

### Still open
- [ ] Replace the Expo `.gitignore` with a web-app one.
- [ ] Finalize the activity list + real icons/images (placeholders for now).
- [ ] Branding specifics: exact palette tokens, logo design, fonts.
- [ ] Copy for landing page, form steps, and the email (DE + EN).

---

## 9. Rough milestones (tentative)

1. **Setup** — Vite + React + TS + Tailwind + React Router + i18n, replace
   `.gitignore`, deploy skeleton with the domain.
2. **Landing page** — invite form + link generation + copy-to-clipboard.
3. **Date form shell** — multi-step wizard + URL decoding/personalization +
   language toggle.
4. **Pages 1–4** — dodging "No"; calendar + time-of-day; activity tiles; sweet
   note.
5. **Submit + email** — EmailJS send + confetti celebration screen.
6. **Polish** — styling, animations, DE/EN copy, mobile pass.
7. **(Optional)** — pick & build extra pages from §7.
