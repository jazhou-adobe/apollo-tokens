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

## Phase 4 review fixes (taste TR and studio ST items)

Checked on the shared dev server, Light, Deck, Approach Lights, Flight Deck and Sortie Board, at 1440 and 390 wide:

- **Routes:** `/design`, `/specimen`, `/specimen?demo=midswim&density=deck`, `/tile` in all five themes; `/overview`, `/worlds`, `/` in both core themes. All 52 loads applied the theme, had no sideways scroll, and logged no console errors or warnings.
- **Capture model** (`/specimen`, all ten theme/width combinations): Space on the focused Start key started the Swim; `1`, `1`, `2` added counts; Shift + `1` undid a kick ("Undid underwater kick. Underwater kicks, Length 1: 1."); Space tapped the wall ("Length 1: … seconds, 1 strokes, 1 underwater kicks."); Backspace undid it ("Undid wall tap. Length 1 is open again."). While recording the Profile switcher was locked and End Swim sat in the app bar; on phones the Review sheet was hidden. End Swim gave "Ended" with Resume; the Review sheet showed the captured time; Save gave the preview-only message and a count edit changed it to "Changed since you saved"; Resume returned to Recording.
- **Targets:** tap-log and undo-cluster buttons measured 48 px in Light, 56 px in Deck, and at least 56 px in worlds at `density=deck`.
- **Key order:** counters above the full-width Wall key in every theme.
- **`/design`:** no overlapping text in any Swim row in any theme at either width; from md, figures share three right-aligned columns. Every overflowing table or code region is focusable and named; no duplicate landmark names; no skipped heading levels inside main. At 390 the Theme select and a live split read-out are in the first viewport; Density sits in Contents.
- **`/worlds`:** each card leads with name, one sentence and a mid-Swim frame at Deck sizing (`--sb-button-min-target` 3.5rem inside the frame); "Try wall tap" pressed the frame's Wall key and its status announced Length 3.
- **Not met at 390 × 844 (mid-Swim):** Light fits the Tap Pad, Wall key and undo cluster in the first screen (undo ends at 743 px). In Deck the Wall key ends at 700 px but the undo cluster ends at 856 px. In the worlds at `density=deck` the Wall key itself ends between 891 and 952 px, because of the worlds' own Tap Pad chrome (headers, rules, wrapped Length strips).

## Not checked here

Screen-reader output, Windows high-contrast mode, real devices in sunlight, and reduced motion in the browser (the token-level collapse is enforced by the validator). These belong to the Phase 4 review.
