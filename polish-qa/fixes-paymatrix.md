# PayMatrix — polish fixes for Grok Build

**Grade: FAIL**

The navy/mint identity is usable, but controls inherit inappropriate CSS and the buyer-facing copy reads like a technical build brief. Fix the interaction surface before adding visual decoration.

Evidence: [supplied HTML, inline CSS and JS](src/paymatrix.html). [Live target](https://paymatrix-waitlist.vercel.app) was unreachable. No PayMatrix PNG was available when reviewed; local browser startup was blocked. CSS/JS defects below are source-confirmed; rendered layout, mobile and actual provider delivery still require Build QA.

## Top 5 quality problems

1. **Radio and checkbox inputs inherit text-field sizing.** The global `input,textarea,select` rule sets `width:100%`, padding and borders on `.yn input`, `.check input` and `.radio input`. Flex shrink may alter the final width, but these controls still compete with their labels instead of using an explicit intrinsic size. It affects all ten score questions, Q2 and budget selection.
2. **Native fieldset chrome is mixed with custom cards.** `.items li` is bordered, then its child fieldset retains browser-default border, margin and padding. The same occurs in Q2 and budget fieldsets. `.yn label` is only `2.2rem` minimum height; full-width field boundaries have approximately 1.43:1 contrast against their background. No explicit focus/hover system is defined.
3. **Hierarchy repeats jargon instead of explaining the deliverable.** `.hero h1` diagnoses an HTTP 402 problem but does not state the outcome. `.subhead` and `.bullet-grid` repeat facilitator/payload terminology. H2/card typography is not explicitly scaled beyond the shared font rule. Every main section, including short ones, receives 64px top and bottom padding.
4. **The trust layer reads like instructions accidentally shipped.** `.pricing-note` shouts `UNPROVEN`; `.form-hint` exposes the transport; `.privacy` says `No SOLVD branding.` `#fit` is below the form, and “Crypto tourists with no endpoint” dismisses readers without explaining fit constructively.
5. **Completion and failure states overstate certainty.** `BANDS` calls a 90-point self-assessment `Production-ready`. The submit handler accepts HTTP success without checking the response body and calls `form.submit()` after any AJAX failure. `#form-error` is never populated; Q2's error doesn't receive focus or an accessible association. The scorecard list is empty without JavaScript.

## Ordered Build fix list

### P0 — controls and truthful interaction

1. **Scope input rules and reset fieldsets.** Replace the bare `input` branch of `input,textarea,select` with `input[type=email], input[type=url], input[type=text]`; preserve textarea/select styling. Set radios/checkboxes to `width:18px;height:18px;min-width:18px;padding:0;flex:0 0 18px;accent-color:var(--mint)`. Reset `.items fieldset` and `.priestley fieldset` to border/margin/padding 0 and `min-inline-size:0`. Keep native semantics. Set `.yn` to flex with 8px gap; labels to inline-flex, 44px minimum height and 8px internal gap. Give `.check,.radio` 44px minimum clickable rows. Apply `[hidden]{display:none!important}` consistently; preserve the existing honeypot's off-screen treatment.
2. **Create visible control states.** Introduce `--control-border:#698294`; use it on inputs, textareas, secondary CTAs and unselected Yes/No choices, leaving `--rule` for decorative lines. Add 3px mint `:focus-visible` rings with 3px offset on links/buttons/controls and their containing choice labels. Primary hover `#70ebc8`; secondary hover `--panel`; keep readable disabled/loading states. Preserve the native checked mark as well as the existing filled selected label. Do not globally brighten already-readable body copy.
3. **Repair submission feedback and Q2 validation.** Follow the shared capture-state contract in [the rollup](astra-rollup.md): inspect confirmed provider success, announce `#form-error`, retain answers on failure, and replace unconditional native resubmission with an explicit retry state. Preserve FormSubmit recipient, `_subject`, metadata and `_honey` in submitted data. Associate `#ship-error` with the Q2 fieldset and focus the first checkbox when empty. Make `We have none of these` and `Not sure` mutually exclusive with substantive answers and each other; clear the error when valid.
4. **Make score claims match what was measured.** Keep ten questions, Yes=10/No=0 and existing thresholds. Replace the visible `BANDS` labels, band key and completion text together: `Blind` → `Baseline not established`; `Partial` → `Some checks covered`; `Fragile settle` → `Most checks covered`; `Production-ready` → `Checklist largely covered`. Add `Self-assessment; a high score does not verify that a payment will settle.` Mark partial totals as partial and show the completed result `/100`. Keep score free and optional for waitlist submission.

### P1 — deliberate layout and copy

5. **Rework the hero within the same offer.** Apply the copy table. H1 uses the shared 32–56px scale, `max-width:22ch`; subhead 18px/1.55, `max-width:60ch`. Reduce hero/benefit padding to the rollup rhythm. `.cta-row` uses 12px gaps and 48px buttons, full-width stacked at ≤600px. Retain existing `href` and `data-source` attributes. Add 80px scroll offset to `#top`, `#scorecard` and `#waitlist` for the sticky header. Add a focusable skip link to `#main`.
6. **Refine benefits and fit.** Add `What’s in a Ship pack` H2 and use three 20px H3s inside `.bullet-grid`. Cards have 24px padding and matching 10px corners, without forced equal text heights. Move existing `#fit` between benefits and pricing; use the specific operator-focused copy below. Keep the navy/mint palette and restrained background glow.
7. **Make pricing and interview easy to scan.** Add `Early pricing` H2 and the rollup's honest sentence-case note. Keep **Ship pack $1,997–$4,997** and **Retest retainer $497–$997/mo**, including units and scope. Stack table rows with explicit labels on phones instead of forcing the existing 32rem table to scroll. Center `#waitlist` intro and `.priestley` in 720px; use 24px field gaps, 8px label gaps, 16px text, 48px single-line controls and 96px minimum vertically resizable textareas. Keep five questions, Q2 multi-select, required email and all five existing budget choices.
8. **Give the scorecard a consistent component layout.** Add visible 01–10 numbering, 16px question text and 16px row padding. Use a nested answer-row wrapper for desktop question/choice alignment and stack at ≤600px. Reset `#score-band` and `#score-progress` margins, put total/band/progress in a compact `.score-readout`, and style `.score-invite` as a padded result panel with a clear next CTA. Remove the tiny inline `.band-key` style; use 14px sentence-case text. Keep the final score next to its invite.

### P2 — finish and resilience

9. Use Outfit 600 headings, IBM Plex Sans 400/500/600 body and IBM Plex Mono for short numeric content only. Replace `.req,.form-hint,.pricing-note` all-caps 12px styling with 14px sentence-case body text. Update title/description to the revised offer language. Add descriptive OG title/description if absent; verify existing favicon rather than inventing decorative artwork.
10. Add a `<noscript>` explanation next to the currently JS-generated `#score-items`: scoring requires JavaScript; link directly to `#waitlist`. Keep native POST usable, with a clear Q2 selection instruction. Respect reduced motion in any smooth scrolling; verify keyboard and font-blocked states.

## Copy rewrites — before → after

| Location | Before | After |
| --- | --- | --- |
| Eyebrow | `Facilitator ship matrix for agent payments · x402 / MPP` | `Payment testing for agent-facing APIs · x402 / MPP` |
| H1 | `Your SDK says valid. The facilitator says 402 with no reason.` | `Find out why agent payments fail to settle.` |
| Subhead | `PayMatrix probes which x402/MPP facilitators + chains + payload shapes actually verify and settle for your endpoint — then ships a fix brief for silent 402s and undocumented constraints.` | `Test your payment endpoint across the facilitators, chains and request formats you need to support. Get a results matrix and a fix brief for rejected or unsettled payments.` |
| Hero CTAs | `Get your Facilitator Ship Score (free)` / `Join the waitlist for a Ship pack` | `Check your payment setup — free` / `Join the waitlist` |
| Benefit headings | `Black-box facilitator matrix` / `Undocumented constraint catch` / `Retest when facilitators churn` | `See which payment paths work` / `Find the cause of failed payments` / `Retest after changes` |
| Benefit 2 paragraph | `Silent 402s, header-version drift, and payload rules that never made the docs. The Ship pack is a fix brief.` | `Identify rejected requests, mismatched header versions and undocumented format rules. Get a short list of fixes for your endpoint.` |
| Score lede | `Answer yes or no. Your total is 0–100. After you score, share it via the Priestley form.` | `Answer 10 yes/no questions to see which payment checks you cover. Each Yes adds 10 points. No email needed to see your score.` |
| Form eyebrow / H2 | `Priestley interview` / `PayMatrix waitlist / score follow-up` | `Join the waitlist` / `Tell us about your payment endpoint` |
| Q2 | `Which ship-path pieces do you have?` | `Which parts of the payment flow have you already set up?` Add helper: `Select all that apply, or choose None or Not sure.` |
| Q4 | `What does a silent 402 cost you?` | `What do failed or unexplained payments cost you in lost sales or troubleshooting time?` |
| Q5 | `What would “worth it” look like for a matrix + fix brief in ~10 days?` | `If a payment test matrix and fix brief could be ready in about 10 days, what result would make it worth paying for?` |
| Who for | `API sellers enabling machine payments; agent-wallet builders.` | `Operators of paid APIs and agent wallets with an endpoint ready to test.` |
| Who not | `Crypto tourists with no endpoint.` | `Teams still exploring payment ideas without an endpoint to test.` |
| Form hint | `Delivers to thespencerlowe@gmail.com via formsubmit.co.` | `Spencer may reply from thespencerlowe@gmail.com about your answers. Joining doesn't commit you to buy.` |
| Footer | `Demand test — packaging unproven until we see budget distribution. Capture: thespencerlowe@gmail.com.` | `We're testing interest before committing to Ship packs and retests. No payment is taken here.` |
| Privacy | `Answers are used only to reply about PayMatrix Ship packs and retests. No SOLVD branding.` | `Your answers are used only to reply about PayMatrix Ship packs and retests.` |

Keep Q1 and Q3; apply shared pricing note, `Early access` badge, `Join the waitlist` submit label and a final-result CTA `Join the waitlist with this score`. Keep existing input values/names even when labels become plainer.

## Acceptance checks for Build QA

- [ ] Inspect computed styles: every score/budget radio and Q2 checkbox is 18px, stays beside its label and has a 44px clickable row. No nested default fieldset borders remain.
- [ ] At 320/360/390/768/1280/1440px and 200% zoom, no page overflow, crushed legends, awkward CTA clipping or horizontally hidden pricing. The primary CTA is above the fold at 1280×800 and 390×844.
- [ ] Text and control boundaries meet the rollup contrast targets. Keyboard users can see focus, use arrow keys on radios, and reach anchored content below the header.
- [ ] All ten score items render with JS. Test all No=0, all Yes=100, every band boundary and changed/partial answers; no result claims production certification.
- [ ] Empty Q2 is announced and focused; None/Not sure exclusivity works. All selected substantive values are retained in serialization.
- [ ] Required email, five questions and budget remain; all five original budget choices and both soft price ranges remain intact. Direct waitlist path works without a score.
- [ ] Mock provider success reveals and focuses confirmation; body-level rejection, HTTP error and network error keep answers visible and show retry. Rapid repeat clicks do not send twice.
- [ ] Native/AJAX capture still targets thespencerlowe@gmail.com via FormSubmit, with site subject, source, score vector/total, timestamp and honeypot. Do not send synthetic leads.
- [ ] No public `UNPROVEN`, `Priestley`, `Capture:` or `No SOLVD branding` remains; honest offer status and who-for/who-not are clear before the form.
- [ ] No-JS guidance, reduced-motion behavior and font fallback are usable; collect the desktop/mobile state screenshots listed in the rollup.
