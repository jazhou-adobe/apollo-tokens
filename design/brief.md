# Splitbook design system: brief

This file is the Phase 1 record for `build-brand-design-system`. It holds the owner's interview answers (2026-11-19 and 2026-11-20) and the contract every artifact in `design/` follows. If an artifact and this brief disagree, the brief wins until the owner changes it.

## Inputs

- Product: `../training-track/PRODUCT.md` and `../training-track/GLOSSARY.md`, the sibling repo. Read both before designing anything.
- Reference implementation: `../mathgo-master/design`. It is the system this skill came from. Reuse its structure, validator rules, world contract and preview mechanics. Don't reuse its look, fonts or copy.

## Owner decisions

| Topic | Decision |
|---|---|
| Repo | This repo is the Splitbook brand master. It is separate from the Hermes master. |
| Scope this run | Phases 1–4: frame, seeded brainstorm, tokens/themes/worlds/foundations/preview/validator, then critique and fixes. Specs, coverage, motion catalogue and handoff skill come later. |
| Stack | DTCG `tokens.json` → `--sb-*` CSS variables plus a Tailwind 4 `@theme` bridge. Next.js 16 / React 19 preview on port **3200**. |
| Core themes | `splitbook-light` (default) and `splitbook-deck`. There is no dark or high-contrast theme. |
| Deck | A palette **and** a size knob, like MathGo's Junior. Glare-grade contrast, a safety-yellow live state, `button-min-target` ≥ 3.5rem (56 px), Tap Pad keys ≥ 5rem, larger numerals, roomier density, primary actions in the one-handed reach zone. Capture screens opt into Deck; desk pages stay Light. |
| Density | `[data-density="compact"]` applies to the Admin console only. |
| Core direction | **Pace Clock**, calm and grounded, with no sci-fi in the core. |
| Worlds | Five sci-fi worlds in a **used-future** style were previewed: Approach Lights, Flight Deck, Sortie Board, Pressure Suit, Plotting Glass. After seeing the quick previews (`research/world-previews/`), the owner chose to build **Approach Lights, Flight Deck, Sortie Board**. Pressure Suit and Plotting Glass stay as previews only. Each built world has 4 colour options. |
| Reviewer | `design-reviewer`, copied from MathGo (`github-copilot/gpt-6.1-sol`), with thinking-level **medium**. |

## Brand constraints (from PRODUCT.md)

- The product name is **Splitbook**. MathGo never appears.
- Voice: the coach's clipboard. Calm, precise, plain-spoken and quietly encouraging. No hype and no exclamation marks. Jargon (SWOLF, DPS, stroke rate, breakout) is always explained in plain words.
- Stance: **better before faster**. Counts and technique lead; times are shown as the result.
- Anti-references: gamified streaks, badges and confetti; Strava-style feeds and leaderboards; Garmin- or Apple-style dense ring dashboards; clinical sports-science walls of terms.
- Accessibility: WCAG 2.2 AA plus poolside conditions. Targets are ≥ 48 px everywhere in Capture. Legible in glare. No precision or two-hand gestures. Undo for every tap. Nothing time-critical behind a dialog. Information never by colour alone: fault flags and rating levels always carry a label, shape or number.
- Faults are an observer's notes, never a referee's call. Never write "DQ" or "disqualified".
- Do not fabricate testimonials, user counts, endorsements or accuracy claims. Label illustrative data as illustrative.
- Use the glossary terms: Session, Swim (Effort), Length (Segment), Set, Focus metric, Tap Pad, Review sheet, Metric trend, Technique trend, Technique point, Fault, Capture template, Admin console, Configuration.

## Core direction: Pace Clock

The core is built on the big analogue pace clock on a pool wall. Chalk-tile white surfaces and ink-black type. The clock's four hand colours each do **one** job and are never decorative:

| Hand | Role | Meaning |
|---|---|---|
| Red | `live` | Recording now: live Tap Pad state, the running split. |
| Blue | `metric` | A captured metric value or Focus metric. |
| Green | `improvement` | Better than before: trend gains, "3 more kicks off every wall than in March". |
| Black | `foreground` | Ink. |

Big tabular numerals set in a grotesque display face are the hero. Progress and trends are drawn as clock dials and plain lines, never as concentric fitness rings. The out-and-back symmetry of a length and its return is the compositional motif: paired panels (Tap Pad ↔ Review sheet, then ↔ now) sit on a central axis like the pool's T-line.

## Token contract

The prefix is `--sb-`. Theme selector: `html[data-theme="<theme>"]`. World colour option: `[data-palette="<id>"]` on the same element. The tiers and naming follow `../mathgo-master/design/tokens/token-taxonomy.md`, with `mg` replaced by `sb`.

### Colour roles (each theme and each world colour option defines all of them)

- Base: `background`, `foreground`, `surface-card`, `surface-card-foreground`, `surface-panel`, `surface-panel-foreground`, `surface-shelf`, `surface-shelf-foreground`, `surface-tray`, `surface-tray-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`.
- Status: `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`.
- Splitbook: `live`, `live-foreground`, `metric`, `metric-foreground`, `improvement`, `improvement-foreground`, `fault`, `fault-foreground` (an observer-noted fault, distinct from `destructive`), `tap-pad`, `tap-pad-foreground` (the Tap Pad surface).
- Utility: `shadow` (decorative elevation only), `scrim` (modal backdrop; text never sits on it), `chart-1` … `chart-5` (categorical series).

That is 46 roles in total.

Contrast gates (WCAG ratios, truncated, never rounded up): every `<role>` / `<role>-foreground` pair ≥ 4.5; `muted-foreground` on background, every surface, `muted` and `tap-pad` ≥ 4.5; `border` and `ring` against every surface, `input` and `tap-pad` ≥ 3; `live`, `metric`, `improvement` and `fault` as boundaries against `surface-card` and `tap-pad` ≥ 3; `chart-*` against `surface-card` and `surface-panel` ≥ 3.

### Component tokens (minimum set)

`button-min-target`, `control-size-sm`, `control-size-lg`, `focus-ring-width`, `focus-ring-offset`, `tap-key-size` (Tap Pad key), `rating-step-size` (one 1–5 rating step), `length-cell-size` (one Length in the Length strip), `progress-track-height`, `chart-height`, `dial-size` (trend dial), `icon-size`, `avatar-size-sm|md|lg`, `overlay-dialog-width`, `overlay-sheet-width`, `overlay-popover-width`, `overlay-tooltip-width`, plus motion contracts `press-scale`, `enter-scale`, `enter-offset`.

Typography adds a tabular numeral scale: `numeral-xl` (the Tap Pad's running split and count), `numeral-lg`, `numeral-md`.

### Deck knob

`splitbook-deck` must override, and make larger than the base: `button-min-target`, `tap-key-size`, `rating-step-size`, `length-cell-size`, `density-inset`, `density-gap`, `type-body-size` and `type-numeral-xl-size`. The validator enforces this.

### Worlds

A world is `tokens/worlds/<slug>.json` plus `<slug>.css`, theme value `splitbook-<slug>`, with exactly 4 colour options (recommended default, two alternatives, `original`). Worlds may override only type, shape and depth tokens. They never change motion, density, spacing, layout or component sizes. They follow the scoping, keyframe-prefix, no-`infinite` and intensity-budget rules in MathGo's token taxonomy.

Style: **used future**. Real carrier, cockpit and flight-deck conventions pushed forward in time: tactile, worn-in, functional. No gradient text, decorative glass, glow-everywhere, scanline noise or neon-on-black reading surfaces. Glow is allowed on live state only. Reading planes stay opaque and high-contrast.

| Slug | Idea | Signature |
|---|---|---|
| `approach-lights` | The lane rope as a carrier deck-approach light chain. Dividers and Set groups are runs of lights. | The Length counter lights bulb by bulb, each bulb with a numeral, never colour alone. |
| `flight-deck` | Carrier deck markings, with black and yellow hazard chevrons on edges only. Deck-crew jersey colours (yellow, green, red, purple, white) give each metric family a role colour, always with a label. | A wall tap fires a catapult-style split flash. |
| `sortie-board` | A briefing-room launch schedule: dense typeset sortie rows, callsign-style Swim IDs, condensed type on matte slate. | A Swim prints in as a sortie row. |
| `pressure-suit` | Padded flight-suit panels with rounded quilted pads, stitched seams and mission-patch badges. Depth comes from padding, not glow. | Buttons compress like a suit pad. |
| `plotting-glass` | A carrier CIC's edge-lit acrylic plot board marked with grease pencil. | Tallies and ticks are drawn as plot marks in five-bar gates. |

## Domain widgets

Tap Pad (wall tap and 1–2 Focus-metric counters, with undo per tap), Length strip, running split read-out, rating 1–5 with cue text, fault flag (observer's note), chip pickers (stroke, distance, training type), count and split read-outs, Review sheet, Session row and Swim row, Metric trend (line) and Technique trend (dial), Profile switcher (Swimmer), Set grouping, Admin console Configuration list and Draft/publish bar.

## Blueprints

- Watcher: Swimmer home, pre-Swim setup, live Capture (Tap Pad, Deck), Review sheet, Session history, Swim detail, Metric trends, Technique trend, Profile and Account defaults.
- Admin (compact): Configuration list, Metric definition editor with formula preview, publish with reach choice, Configuration version history.
- System: sign-in (Clerk card localised to Splitbook), empty, loading, offline, error, not found.

## Phase 2 seed

The core direction and world list were drawn from a private random seed. Never reveal it in the design.
