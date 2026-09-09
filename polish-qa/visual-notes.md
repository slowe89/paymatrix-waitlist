# Visual notes — polish QA (2026-09-09)

## EvalCase Factory
- Mobile demand-test pricing table overflows horizontally and exposes a horizontal scrollbar; the “WHAT” column is clipped.
- Mobile form is very long and dense; the sticky header consumes noticeable vertical space while scrolling.
- Scorecard uses a dark panel with small mono labels; readable, but the visual density is high across the ten-question stack.

## PayMatrix
- The ship-path checkbox group is visibly misaligned: checkboxes sit in a centered column while labels are pushed far right, leaving a large empty gap.
- The same checkbox/label spacing problem is more severe on mobile, with labels wrapping in a detached right-hand column.
- Form labels and required markers are small against the dark theme; the form feels cramped despite the oversized checkbox fieldset.

## CompatLab
- Mobile hero CTA wraps “(free)” onto a second line, creating an awkward two-line button at the primary action.
- Mobile form heading/body copy and required markers create a tall, text-heavy opening section; several labels wrap over multiple lines.
- Scorecard relies heavily on small monospace copy and thin dark borders, which reduces scanability at a glance.

## CatalogSlim
- Scorecard radio controls appear centered far away from their Yes/No labels, making the control-to-label association unclear.
- The radio alignment issue persists across scorecard rows and is especially conspicuous on the wide desktop layout.
- Mobile hero CTA wraps to two lines and becomes unusually tall; required markers in the form are also inconsistently lowercase.
