# PayMatrix

Priestley demand-test interest page for **PayMatrix** — facilitator ship matrix for agent payments (x402/MPP). Outside SOLVD. Static Vite site: landing copy, client-side Facilitator Ship Scorecard, and a waitlist form. No product backend, facilitator probes, Stripe, or payments.

Capture: **thespencerlowe@gmail.com**

Meta title: `PayMatrix — facilitator ship matrix for agent payments`

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build
npm run preview
```

`build` writes a static `dist/` you can host anywhere. `preview` serves that build locally.

## Deploy on Vercel

Import this repo as a Vite project. Build command: `npm run build`. Output directory: `dist`. No serverless functions are required.

If you switch the form to Formspree, add `VITE_FORM_ENDPOINT` as a Vercel environment variable and redeploy.

## Form

The form’s default action is FormSubmit.co:

`https://formsubmit.co/thespencerlowe@gmail.com`

The first live submit sends FormSubmit an activation mail to that address. After you confirm it, later submissions arrive as email.

To point the same form at Formspree (or another endpoint) instead, copy `.env.example` to `.env` and set:

```bash
VITE_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

Then rebuild. Leave it unset to keep FormSubmit → thespencerlowe@gmail.com.

Hidden fields on submit: `source` (`paymatrix-scorecard` or `paymatrix-waitlist`), `score_total`, `score_vector` (Y/N), and `timestamp`.

## What’s on the page

- Exact demand-test copy (headline, subhead, bullets, soft ranges, who / who not)
- 10-gate Facilitator Ship Scorecard (Yes = 10, No = 0, bands 0–100: Blind / Partial / Fragile settle / Production-ready)
- Priestley form (required email + Q1–Q5 + budget bands Under $500 / $500–$1,500 / $1,500–$4,000 / $4,000+ / Not sure yet)
- Optional facilitator / chain / endpoint fields

This is a waitlist / score follow-up page only. Packaging is unproven until budget distribution is visible.

## Preview

Browser-verified shots of the shipped page:

- [docs/hero.png](docs/hero.png) — hero
- [docs/scorecard.png](docs/scorecard.png) — Facilitator Ship Scorecard
- [docs/form.png](docs/form.png) — Priestley form
