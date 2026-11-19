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
- **Not met at 390 × 844 (mid-Swim) at the time:** Light fits the Tap Pad, Wall key and undo cluster in the first screen (undo ends at 743 px). In Deck the Wall key ends at 700 px but the undo cluster ends at 856 px. In the worlds at `density=deck` the Wall key itself ends between 891 and 952 px, because of the worlds' own Tap Pad chrome (headers, rules, wrapped Length strips). Resolved by FR-01 below.

## Approach Lights focused review fixes (FR-01 to FR-07), 2026-11-20

Checked through the preview hub (http://localhost:3000/splitbook/, proxying the shared dev server) in headless Chromium, with a pre-load hook recording `console.error`, `console.warn`, uncaught errors and unhandled rejections.

- **Routes:** `/specimen?demo=midswim` in `splitbook-light`, `splitbook-deck` and `splitbook-approach-lights` with each of its four palettes, each with and without `density=deck` (12 combinations); `/design` in Light, Deck and every Approach Lights palette (Blue Hour also at `density=deck`); `/worlds`; `/overview`; `/tile` (Approach Lights). Each at 1440 × 844 and 390 × 844: theme, palette and density applied, `scrollWidth` equal to the viewport, zero console errors or warnings, zero failing contrast read-outs on `/design`.
- **FR-01, mid-Swim y-positions (CSS px, top of the page; the viewport is 844 tall).** Undo is the whole cluster (wall tap and both counters, one row). "Undo min" and "key min" are the smallest width or height among the undo buttons and the Tap Pad keys.

| Width | Theme · density | Counters | Wall | Undo | Undo min | Key min |
|---|---|---|---|---|---|---|
| 390 | Light | 339–421 | 437–523 | 539–601 | 62 | 82 |
| 390 | Light · deck | 428–555 | 578–686 | 708–816 | 96 | 108 |
| 390 | Deck | 354–450 | 470–566 | 586–681 | 96 | 96 |
| 390 | Deck · deck | 428–555 | 578–686 | 708–816 | 96 | 108 |
| 390 | Approach Lights, each palette | 362–448 | 464–551 | 567–628 | 62 | 86 |
| 390 | Approach Lights, each palette · deck | 413–540 | 563–671 | 693–801 | 96 | 108 |
| 1440 | Light | 363–445 | 461–548 | 564–625 | 62 | 82 |
| 1440 | Light · deck / Deck · deck | 453–561 | 584–692 | 714–798 | 84 | 108 |
| 1440 | Deck | 403–499 | 519–615 | 635–710 | 75 | 96 |
| 1440 | Approach Lights, each palette | 399–485 | 501–588 | 604–666 | 62 | 86 |
| 1440 | Approach Lights, each palette · deck | 485–593 | 615–723 | 746–830 | 84 | 108 |

  Every combination keeps counters, Wall and every undo control inside 844 px, with undo targets ≥ 48 px at default density and ≥ 56 px at Deck sizing and keys at or above `--sb-tap-key-size`. Not met: 768 × 844 with Approach Lights at `density=deck` (undo ends at 904 px), where the page header wraps to two lines.
- **FR-02:** each word of each `.sb-tap-key-label` measured as one line box. At Deck sizing on phones (Light, Deck, Approach Lights, and the `/worlds` frame) "Underwater" sits on one line and "kicks" on the next; at wider keys the label is one line. No word broke in any combination.
- **FR-03:** at 1440 while recording, `/specimen` renders one region (480–960 px wide in Approach Lights) with no Review panel or axis. End Swim gives the pair: ended Tap Pad (final time, Length strip, count summary, Resume, tap log) left of the axis, Review sheet right; focus moved to Resume. Resume (Enter) returned to Recording with focus on the Wall key. On phones the Review sheet follows the ended pad.
- **FR-04:** Approach Lights (Sodium Night) computed styles while recording: Tap Pad outline `none` and no glow (only the core raised elevation), split read-out `box-shadow: none` on its solid live plate, status-disc `box-shadow: none`; the current Length bulb alone keeps its glow.
- **FR-05:** Approach Lights (Blue Hour) computed `box-shadow`: chips, switch thumb, rating steps, noted fault flags, current side-nav item, alerts, panels and the app bar `none`; inputs keep the inset top well; buttons keep the bottom bevel. Review sections use a solid 2 px rule.
- **FR-06:** Review sheet Length toolbar in Approach Lights (Deck Daylight) at 1440 and at 390 with `density=deck`: one tab stop; ArrowRight/ArrowLeft moved focus with wrapping, Home/End to L1/L4, the tabindex followed focus, Enter (1440) and Space (390) selected the focused Length (`aria-pressed` and the count editors' label changed); at 1440 Tab left the toolbar and Shift+Tab returned to the last focused cell. At 1440, with the toolbar first scrolled under the sticky app bar, tabbing and arrowing into it left the focused cell at y = 84, below the bar's bottom at 72; at 390, "Review this Swim" put focus on the current cell at y = 258, below the bar's bottom at 83.
- **FR-07:** `/design` at 390 (Blue Hour): no hero eyebrow; the sidebar controls end at 321 px; the live specimen card follows at 353–740 (Length rail 420–500, running split 516–600, counts 616–682); the headline follows at 756 in `heading-lg` (32 px).
- **Gates:** `npm run validate` passed (43 artifacts, 60 source files scanned); `npm run test:validator` 38/38; `npx tsc --noEmit` clean; `npm run build` compiled and prerendered all 7 routes. Its only warning is Next.js's own notice that 16.4.1 has a published security advisory (a dependency upgrade, outside this change).

## Not checked here

Screen-reader output, Windows high-contrast mode, real devices in sunlight, and reduced motion in the browser (the token-level collapse is enforced by the validator). These belong to the Phase 4 review.
