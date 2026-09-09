# Astra polish QA — 9 September 2026

Polish instructions for Grok Build. No product implementation or deployment was performed in this review.

| Page | Grade | Main reason | Fix list |
| --- | --- | --- | --- |
| EvalCase | **BORDERLINE** | Coherent editorial styling, but a cost-led hero, dense interview, and unfinished offer language weaken the pitch. | [EvalCase](fixes-evalcase.md) |
| PayMatrix | **FAIL** | Text-input CSS affects radios and checkboxes; default fieldsets and weak control boundaries undermine the entire conversion flow. | [PayMatrix](fixes-paymatrix.md) |
| CompatLab | **BORDERLINE** | Strongest existing layout, but unloaded font families, dense jargon, ambiguous scoring, and internal implementation copy miss the trust bar. | [CompatLab](fixes-compatlab.md) |
| CatalogSlim | **FAIL** | Broken success visibility, full-width radios, and a score that rewards a reported routing problem are release blockers. | [CatalogSlim](fixes-catalogslim.md) |

These are grades of the supplied snapshots, not a claim that the current deployments were exercised. All four live URLs failed to open through the web tool; shell DNS resolution also failed. Local Chrome could not start under this environment's restrictions. Inspected all four `src/*.html` files, the supplied EvalCase desktop hero and scorecard PNGs, and the older `../../proof/evalcase/form.png`. EvalCase references external hashed CSS/JS absent from the supplied directory. The older `/tmp/evalcase-deploy-files.json` contains matching component names and useful CSS/JS context, but its equivalence to the live hashed assets is unverified. Findings based on it are explicitly conditional in EvalCase's fix list. No fresh browser, mobile, screen-reader, or submission pass is claimed.

## Scope and order

Keep these as standalone demand-test waitlists outside SOLVD. Keep FormSubmit capture at `https://formsubmit.co/thespencerlowe@gmail.com` and its AJAX equivalent. Keep each product's ten-item scorecard, five required interview questions, required email, required budget band, existing budget choices, soft price amounts, package scopes, and optional fields. Preserve field names, source attribution, score vector, total, timestamp, and site-specific email subject. Do not add checkout, accounts, a working product demo, fabricated customers, performance claims, or a delivery guarantee.

Build order: fix CatalogSlim's state/scoring defects and PayMatrix's controls first; apply the shared component rules next; then apply each site's copy and identity changes. P0 = release blockers, P1 = required craft/hierarchy work, P2 = final refinement. All applicable acceptance checks remain required for PASS.

## Shared design tokens

Use the same semantic token names and component behavior across the four pages. Map existing token names to them; avoid a second conflicting stylesheet. Values below are implementation targets, not claims about current computed styles.

| Token | Target |
| --- | --- |
| `--font-body` | `"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif`; load only 400, 500, 600 with `font-display: swap`. |
| `--font-mono` | `"IBM Plex Mono", ui-monospace, monospace`; use for scores, prices, short identifiers only. Do not set question paragraphs in mono. |
| `--text-xs / --text-sm / --text-base / --text-lead` | `0.8125rem / 0.875rem / 1rem / 1.125rem`; helper text at least 14px, body and inputs 16px, lead 18px. |
| H1 | `clamp(2rem, 4.4vw, 3.5rem)`, line-height `1.08–1.12`, weight 600 or 700 actually loaded, letter-spacing `-0.025em`, width `20–24ch`. No hard line breaks. |
| Section H2 / card H3 | `clamp(1.5rem, 2.4vw, 2rem)` at `1.2`; card headings `1.25rem` at `1.3`. Change benefit-card H2s to H3s under a real section heading. |
| Body / label line height | `1.55 / 1.4`; paragraph measure at most `65ch`; long field labels at most `60ch`. |
| Spacing scale | `4, 8, 12, 16, 24, 32, 48, 64px`. Use 8px label-to-control, 24px between fields, 16–24px inside cards. |
| `--content-max / --form-max` | `1080px / 720px`. `.wrap`: `width:min(1080px, calc(100% - 48px))`; below 600px use `calc(100% - 32px)`. |
| Section rhythm | Hero: 64px top / 32px bottom desktop, 40px / 24px mobile. Benefits: 24px top / 48px bottom. Major sections: 64px vertical desktop / 40px mobile. Avoid stacking two 64–72px paddings between adjacent short sections. |
| Control / panel radius | `6px / 10px`; avoid a different radius for every component. EvalCase may use 4px / 8px to retain its print-like character. |
| Shadow | At most `0 8px 24px rgb(0 0 0 / 8%)` on a featured example; remove heavy shadows from every card. |

### Color and identity mappings

| Token | EvalCase | PayMatrix | CompatLab | CatalogSlim |
| --- | --- | --- | --- | --- |
| `--bg` | `#f4eee2` | `#071018` | `#0b1020` | `#0b1020` |
| `--surface` | `#fffdf8` | `#10202c` | `#171e36` | `#171e36` |
| `--text` | `#1c1e16` | `#e8eef4` | `#e8edf8` | `#e8edf8` |
| `--text-muted` | `#5b5e52` | `#aab8c6` | `#acb6ce` | `#acb6ce` |
| `--border` decorative | `#cfc4ad` | `#1e3344` | `#2a3354` | `#2a3354` |
| `--control-border` | `#8a806f` | `#698294` | `#70819b` | `#70819b` |
| `--accent` | `#9a4318` | `#3ee0b0` | `#5b8cff` | `#b8a2ff` |
| `--on-accent` | `#ffffff` | `#042018` | `#061024` | `#061024` |
| `--accent-hover` | `#803713` | `#70ebc8` | `#7aa3ff` | `#cabbff` |
| `--error` | `#8a2416` | `#ffb4ac` | `#ffb3bb` | `#ffb3bb` |
| Display family | Fraunces 600 | Outfit 600 | Space Grotesk 600 | IBM Plex Sans 600 |

Keep EvalCase's light paper, copper and dark scorecard; PayMatrix's navy/mint; CompatLab's cobalt and existing example matrix; CatalogSlim's plain catalog layout with a restrained lavender accent to distinguish it from CompatLab. This is a token change, not a new brand or product. On EvalCase's dark scorecard locally override surface to `#1b1e16`, text to `#f4eee2`, muted to `#d8d2c2`, and control border to `#8a8e7b`; use light-colored focus rings there. Do not inherit dark body copy onto that panel.

Measured from source hex values using relative luminance: PayMatrix's current field border `#1e3344` against `#08141c` is about **1.43:1**; CompatLab/CatalogSlim's `#2a3354` against `#10162c` is **1.45:1**. Those are poor sole boundaries for controls. Their existing muted text on panels is about **5.5:1**, so blanket brightening is unnecessary. Proposed control borders exceed 3:1 against their intended adjacent surfaces. EvalCase's older copper button pair is about **4.21:1**; proposed white on `#9a4318` is **6.58:1**. Recheck actual rendered states and opacity: target 4.5:1 normal text, 3:1 large text, and 3:1 meaningful control boundaries/focus indicators. Decorative separators need not carry the control contrast requirement.

## Shared component instructions

1. **Header and hero.** Header inner container: flex, center alignment, 16px gap, minimum 64px height, wrapping allowed. Use a quiet sentence-case `Early access` badge; put honest demand-test detail beside pricing and the form. Keep one H1 that names the result, a short explanation, and one filled CTA to the free scorecard. Secondary outlined CTA says `Join the waitlist`. Below 600px stack both CTAs at full width. Do not create an empty hero column, decorative dashboard, or huge minimum-height hero just to fill space.
2. **Buttons and links.** `.btn`: inline-flex, centered, `min-height:48px`, `padding:12px 20px`, `font:600 1rem/1.25 var(--font-body)`, 1px border, 6px radius, no exterior margin. `.cta-row`: flex/wrap, gap 12px. Secondary buttons use `--control-border`. Add hover and `:focus-visible` with a 3px ring and 3px offset. Disabled submit must remain readable, say `Sending…`, and prevent duplicate sends. Allow text wrapping; never fix button height.
3. **Section order.** Hero → three deliverables → compact who-for/who-not → soft pricing → scorecard → interview → footer. Move the existing audience section; don't duplicate a long fit section at the bottom. Keep form and scorecard accessible by their existing fragment IDs. Sticky headers need `scroll-margin-top:80px` on targets and focused field wrappers.
4. **Pricing.** Add an H2 `Early pricing` and readable note: `We're testing demand for this offer. These are estimated ranges; scope and timing would be agreed before any work starts. No payment is taken here.` Preserve all amounts and units, including add-ons. Headers: `Offer`, `Estimated price`, `What’s included`. Price cells use tabular numerals. At ≤600px present each row as a vertical offer block with its labels; preserve accessible table relationships and hide the desktop header accessibly if needed. Do not require horizontal swiping to discover the amount or deliverable. Use `th scope="row"` for offers and `scope="col"` for headers.
5. **Scorecard.** Ten numbered fieldsets, Yes/No radio labels at least 44px high, 18px radios with `flex:0 0 18px`, and an obvious selected state in addition to the native checked dot. Reset fieldsets with border/margin/padding 0 and `min-inline-size:0`; legends need `max-width:100%`. Use a nested answer-row wrapper if needed rather than assuming a fieldset's legend will become a normal CSS grid child. Desktop: question plus answers in balanced columns; mobile: question above two equal-width choices. Readout: reset paragraph margins, show `x / 10 answered`, partial state explicitly, and completed total `/100`. Repeat the final result beside its form CTA so users don't need to scroll back. No sticky element that obscures questions.
6. **Interview.** Center the introduction and `.priestley` in the same 720px column. Keep all five questions numbered and required, with 24px spacing, 8px label gap, 16px control text, 48px minimum single-line controls, and 96px minimum resizable textareas. Use `input[type=email]`, `[type=url]`, `[type=text]`, textarea and select for full-width styles; never blanket-style radio/checkbox inputs. Use sentence-case `Required` / `Optional`, with text rather than color alone. Preserve optional context below the core questions. Put persistent examples below labels with `aria-describedby`, rather than relying on placeholders.
7. **Capture states.** Use `[hidden]{display:none!important}` consistently and remove conflicting permanent `.success{display:none}` rules. Submit only to the existing FormSubmit destination. Confirm a successful response body as well as HTTP status, according to the provider's current documented schema. Keep entered data and show an inline, announced error on rejection/network failure; re-enable a clear retry action. Do not automatically issue a second native POST after an ambiguous AJAX error. Retain the native form action for ordinary non-JS use. Preserve the honeypot in the submission path. Focus the success panel (`tabindex="-1"`) after a confirmed success; never treat a user-supplied `?submitted` query alone as proof of delivery. Mock these paths for QA instead of sending test leads.
8. **Plain-language honesty.** Keep Priestley's scorecard/interview method internally, remove `Priestley interview`, `Client-side`, `UNPROVEN`, `not a cart`, `Capture:`, `No SOLVD branding`, and provider fallback instructions from visitor-facing copy. Do not replace honesty with fake availability. Form note: `We're testing interest before committing to this offer. Spencer may reply from thespencerlowe@gmail.com about your answers. Joining doesn't commit you to buy.` Keep each page's existing restricted-use privacy promise in ordinary sentence case. The implementation remains FormSubmit.

## Shared Build QA gate

- [ ] Check 1440×900, 1280×800, 768×1024, 390×844, 360×800 and 320×568, plus 200% zoom. No horizontal document overflow, clipped labels, split radio/text pairs, or unusable pricing rows. Also test reflow at a 320 CSS-pixel content width.
- [ ] At 1280×800 and 390×844, the promise, short explanation and primary CTA are visible without scrolling. At 320px width everything remains usable even if content extends below the fold.
- [ ] Keyboard focus reaches skip link, CTAs, every fieldset and form control in reading order; arrow keys operate native radios; focus rings are visible in every theme and aren't covered by the header.
- [ ] Compare actual normal, hover, selected, invalid and focus colors against the contrast targets above; verify no forced-colors mode loss of control state. Test with fonts blocked as well as loaded.
- [ ] Score tests: no answers; one Yes; one No; all No; all Yes; 30/40, 60/70 and 80/90 boundaries; change an answer after completion. Never label a partial result as a completed band. Direct waitlist remains usable without a score.
- [ ] Preserve all five required interview answers, budget choices, optional values, source, score metadata and timestamp. Repeated checkbox values must all survive serialization. Group errors point to and focus the relevant controls.
- [ ] Intercept submissions: confirmed success, HTTP error, HTTP 200 with failure body, network failure, and repeated clicks. Verify accurate visible/announced outcomes, retained answers on failure, no automatic duplicate send, and the exact FormSubmit recipient. Do not email synthetic submissions during QA.
- [ ] Keep a useful no-JS scorecard explanation and the native waitlist form. Respect reduced motion in both CSS and JS scrolling. No new console errors or missing local assets.
- [ ] Capture hero, pricing, completed scorecard, form validation and success-state screenshots on desktop and mobile for each site; compare against its fix list before assigning PASS.

The goal is a credible, well-finished waitlist for each existing offer. Shared typography, spacing, control states and honest copy should do most of the work.

## Live screenshot confirmation (2026-09-09)
ComputerUse captured 20 live screenshots under this folder. Visual notes (`visual-notes.md`) confirm Astra's control-alignment FAIL themes:
- PayMatrix: checkbox/label misalignment (desktop + mobile)
- CatalogSlim: radio far from Yes/No labels
- EvalCase: mobile pricing table horizontal overflow
- CompatLab: mobile CTA wrap; dense mono scorecard
Build must fix against both Astra lists and these live screenshots.
