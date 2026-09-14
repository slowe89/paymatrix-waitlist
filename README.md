# PayMatrix

Demand-test waitlist for **PayMatrix** — payment testing for agent-facing APIs (x402/MPP). Outside SOLVD. Static Vite site: landing copy, client-side Facilitator Ship Scorecard, and a waitlist form. No product backend, facilitator probes, Stripe, or payments.

Capture: **thespencerlowe@gmail.com** via FormSubmit.

Meta title: `PayMatrix — find out why agent payments fail to settle`

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

Hidden fields on the Priestley waitlist submit: `source` (`paymatrix-scorecard` or `paymatrix-waitlist`), `score_total`, `score_vector` (Y/N), and `timestamp`.

The hero email-only form posts to the same FormSubmit address via AJAX (`source=paymatrix-email-first`, `cta=hero-email-only`). Email is the only required field.

## What’s on the page

- Landing copy (headline, email-first hero CTA, Ship pack benefits, who for / who not, soft ranges)
- 10-question Facilitator Ship Scorecard (Yes = 10, No = 0; completed result /100)
- Score bands: Baseline not established / Some checks covered / Most checks covered / Checklist largely covered
- Waitlist form (required email + Q1–Q5 + budget bands Under $500 / $500–$1,500 / $1,500–$4,000 / $4,000+ / Not sure yet)
- Optional facilitator / chain / endpoint fields

This is a waitlist / score follow-up page only. No payment is taken here.

## Preview

Polish QA shots:

- [docs/polish-qa/hero-desktop.png](docs/polish-qa/hero-desktop.png)
- [docs/polish-qa/hero-mobile.png](docs/polish-qa/hero-mobile.png)
- [docs/polish-qa/scorecard.png](docs/polish-qa/scorecard.png)
- [docs/polish-qa/form-checkboxes.png](docs/polish-qa/form-checkboxes.png)
- [docs/polish-qa/form-checkboxes-selected.png](docs/polish-qa/form-checkboxes-selected.png)
- [docs/polish-qa/success-mock.png](docs/polish-qa/success-mock.png)
