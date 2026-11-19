# Smoke report

Browser check of the preview against `npm run dev` (Next.js 16.4.1, Turbopack) on port 3200, in headless Chromium driven by Puppeteer. First run on 2026-11-20 with the original Deck; re-run the same day after Deck was reworked to positive polarity (below), against the shared dev server. The table records the re-run.

## What was checked

For each route, each core theme (`?theme=splitbook-light`, `?theme=splitbook-deck`), and each viewport width (1440 and 390 CSS px, 900 tall):

- **Theme applied:** `document.documentElement.dataset.theme` equals the requested theme after load (the pre-paint script in `app/layout.tsx`).
- **No horizontal scroll:** `documentElement.scrollWidth` ≤ `clientWidth`.
- **No console errors or warnings:** Puppeteer `console` (error and warning) and `pageerror` events captured from navigation start to 500 ms after `networkidle0`.
- **Colour scheme and contrast read-outs:** computed `color-scheme` is `light` in both themes; no `/design` contrast read-out reports a failure.

| Route | Light 1440 | Light 390 | Deck 1440 | Deck 390 |
|---|---|---|---|---|
| `/design` | pass | pass | pass | pass |
| `/overview` | pass | pass | pass | pass |
| `/specimen` | pass | pass | pass | pass |
| `/tile` | pass | pass | pass | pass |
| `/worlds` | pass | pass | pass | pass |
| `/` | pass | pass | pass | pass |

24 of 24 combinations: theme applied, scroll width equal to the viewport, zero console errors or warnings, zero failing contrast read-outs.

## Interaction and visual checks

- **Tap Pad** (`/specimen?theme=splitbook-deck` at 390): Start Swim → status "Recording", one Underwater kicks tap, one Wall tap. The log listed both taps newest first, each with its own Undo; Length 1 showed its split as done, Length 2 became current (heavy live frame, "now" for screen readers), Lengths 3–4 dashed. The running split and the Wall key render on the live plate: computed background near-black, figures safety yellow (rgb 255, 210, 26), on white reading planes. The split fits the phone column.
- **Colour roles** (`/design`, both themes at 1440 and 390): every live contrast read-out passed (no `data-pass="false"`), including the 7:1 glare grade in Deck.
- **Overview** (`/overview` at 1440): both core themes render as live, scaled `/tile` thumbnails; `/worlds` shows its empty state (no worlds registered at the time of the run).

## Deck rework: positive polarity

Deck was first built as a dark theme (an LED clock face as the page). It now keeps positive polarity, matching foundations/accessibility.md and the Dobres et al. (2017) evidence in research/poolside-conditions.md: near-black ink on white and chalk reading planes, every text pair at 7:1 or more, and the live state as a near-black LED plate (`live`) with safety-yellow figures (`live-foreground`). Live read-outs (`.sb-split-readout[data-state='live']`, `.sb-numeral[data-tone='live']`) and the Wall key while recording now render on that plate in both themes (red plate in Light). The split read-out's size cap now allows for the plate's padding: `min(var(--sb-type-numeral-xl-size), calc((100cqi - var(--sb-space-6)) / 4.8))`.

## Issues found and fixed during the run

1. `/design` at 390 scrolled sideways (546 px). Cause: visually hidden labels (absolutely positioned) inside the Admin Configuration table escaped the table's `overflow-x: auto` scroller because the scroller was not positioned. Fix: `.sb-table-wrap { position: relative; }`. Grid containers also gained `grid-template-columns: minmax(0, 1fr)` so wide content scrolls inside its own scroller.
2. Deck at 390: the running split (6rem numerals) was wider than the Capture column. Fix: `.sb-split-readout` is an inline-size container and the value size is capped (see the Deck rework above for the current formula).
3. Contrast read-outs showed "–" for white: the CSS pipeline minifies six-digit hex to three digits. The read-out now expands short hex before measuring.
4. Build warned "Failed to find font override values" for both Atkinson faces through `next/font/google`. They are now self-hosted from `app/fonts/` with `next/font/local`; the build is warning-free.

## Not checked here

Screen-reader output, Windows high-contrast mode, real devices in sunlight, and reduced motion in the browser (the token-level collapse is enforced by the validator). These belong to the Phase 4 review.
