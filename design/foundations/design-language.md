# Design language: Pace Clock

This page explains why Splitbook looks the way it does. The contract behind it is [`brief.md`](../brief.md); when this page and the brief disagree, the brief wins. Product facts come from `../training-track/PRODUCT.md` and the terms from `../training-track/GLOSSARY.md`.

## Creative spine

Every pool has one: a big analogue **pace clock** on the wall, white face, black numerals, four coloured sweep hands. Swimmers read it between repeats without stopping to think. It is calm, legible from across the water, and it has been doing one job for decades.

Splitbook's core is built on that clock. Chalk-tile white surfaces, ink-black type, big numerals, and four hand colours that each mean one thing. The core is calm and grounded: no sci-fi, no gloss, no dashboard theatre. Tying the system to one named metaphor and a short set of principles follows GOV.UK and Spectrum ([mature-design-system-references.md §1](../research/mature-design-system-references.md#1-principles-and-product-language)).

The metaphor names structure; it is not decoration. Do not draw clock faces, tiles or lane ropes behind content. The clock shows up as type, colour discipline, dials for progress, and the out-and-back composition below.

## The four hands

The clock's four hand colours are four semantic roles. Each does **one** job and is never used as decoration, a brand tint, or a section colour.

| Hand | Role (`--sb-…`) | One job | Examples | Never |
|---|---|---|---|---|
| Red | `live` / `live-foreground` | Recording now | The Tap Pad's live state, the running split, the "Recording" label | An error, a fault, a destructive action, a highlight |
| Blue | `metric` / `metric-foreground` | A captured value | A metric value, the Focus metric's label and count, a Focus-metric chip once chosen in pre-Swim setup | A link colour, a primary button fill, a theme tint, a stroke or distance chip |
| Green | `improvement` / `improvement-foreground` | Better than before | A trend gain: "3 more kicks off every wall than in March" | "Saved", "Done", success toasts (use `success`) |
| Black | `foreground` | Ink | Body text, numerals, headings, the face rules | — |

Two neighbours sit just outside the hands:

- `fault` / `fault-foreground` marks an **observer's note** of a Fault. It is deliberately not `destructive` (which means "this removes something") and not `live`. A fault flag always carries its label and a shape; see [capture-widgets.md](../components/capture-widgets.md#fault-flag--sb-fault-flag).
- `tap-pad` / `tap-pad-foreground` is the Tap Pad's own surface, so live capture can be tuned for glare without touching every card.

The contrast gates are in the brief and enforced by the validator: the hands and `fault` pass 3:1 as boundaries against `surface-card` and `tap-pad`, and every `<role>` / `<role>-foreground` pair passes 4.5:1.

## Numerals are the hero

The thing people come to Splitbook for is a number: 14 strokes, 6 kicks, 32.4 seconds. Big **tabular** numerals set in a grotesque display face are the main image of every screen that has one. Tabular figures keep columns and running splits from jittering as digits change. The numeral scale (`numeral-xl`, `numeral-lg`, `numeral-md`) is separate from the text scale; see [typography.md](typography.md).

- One hero numeral per region. If two numbers compete, one of them is a `numeral-md` caption.
- A numeral always has its unit and its label nearby in words ("Strokes, Length 3").
- Times are the result, not the headline (**better before faster**). On a Swim summary, counts and ratings come first; the time follows.

## Out-and-back symmetry

A Length goes out and comes back. The composition motif is the pool's **T-line**: paired panels sit either side of a central axis.

| Left (out) | Axis | Right (back) |
|---|---|---|
| Tap Pad | Swim title and Length | Review sheet |
| Then (an earlier Session) | Metric name | Now (the latest Session) |
| Draft Configuration | Version | Published Configuration |

On a wide screen the pair sits side by side with a thin rule on the axis. Below 48rem the pair stacks in reading order (out first). Symmetry is a layout grammar, not a requirement to fill both halves; an empty half shows an [empty state](../components/data-display.md#empty-state--sb-empty-state).

## Progress as dials and lines

Progress is drawn as a **clock dial** (one dial per Technique point: a dashed "then" hand, a solid "now" hand and the number in the middle) or a **plain line** over time (a Metric trend). Never concentric fitness rings, never a wall of gauges. See [trend-widgets.md](../components/trend-widgets.md).

## Knobs

One base system, real knobs expressed as token overrides rather than separate components (themes as token collections, following Atlassian: [mature-design-system-references.md §3](../research/mature-design-system-references.md#3-theming-and-customization-rails)).

| Knob | Applied as | Who gets it | What changes |
|---|---|---|---|
| Light (default) | `html[data-theme="splitbook-light"]` (also `:root`) | Every desk page: history, trends, Profiles, Account defaults | Core palette |
| **Deck** | `html[data-theme="splitbook-deck"]` | Capture screens: pre-Swim setup, live Capture, Review sheet | Glare-grade palette with a safety-yellow live state, **and** size: `button-min-target` ≥ 3.5rem (56 px), `tap-key-size` ≥ 5rem, larger `rating-step-size`, `length-cell-size`, `density-inset`, `density-gap`, `type-body-size` and `type-numeral-xl-size`; primary actions in the one-handed reach zone |
| **Compact** | `[data-density="compact"]` on the Admin console region | Admin console only | Lower inset, gap, row height and body size; targets stay above the 24 px floor |

Deck is opted into by the Capture screens; desk pages stay Light. There is no dark or high-contrast theme in the core. Deck exists for glare and wet hands, not as a night mode.

## Containers

| Container | Meaning | Splitbook use | Avoid |
|---|---|---|---|
| **Card** | One self-contained object | A Session row's detail, a Swimmer, a Metric trend | Cards inside cards more than one level deep |
| **Panel** | A major section or workspace | The Tap Pad, the Review sheet, a trend panel, the Metric definition editor | A panel for a badge-sized item |
| **Shelf** | A collection | Recent Sessions, Swimmers, Capture templates | Unlabelled loose cards |
| **Tray** | Temporary actions or tools | The undo tray under the Tap Pad, chip pickers, the Draft/publish bar | Permanent content or main navigation in a tray |

Anatomy, states and token bindings: [containers-and-primitives.md](../components/containers-and-primitives.md).

## Voice: the coach's clipboard

Calm, precise, plain-spoken, quietly encouraging. No hype and no exclamation marks.

Do:

- "3 more kicks off every wall than in March."
- "Strokes per Length held at 14 while the time dropped 0.8 seconds."
- "SWOLF (seconds plus strokes for one Length; lower is more efficient) fell from 46 to 43."
- "Fault noted: one-hand touch at the turn. This is your note, not an official call."
- "Recording. Tap the wall button at each touch."

Do not:

- "Amazing!", "New PB!", "Crushed it", "Keep your streak alive".
- "DQ", "disqualified", "illegal", "violation". A Fault is an observer's note, never a referee's call.
- "Worse", "slower again", any ranking between Swimmers.
- Unexplained jargon. SWOLF, DPS (distance per stroke), stroke rate and breakout are explained in plain words where they first appear on a screen.
- Fabricated proof: testimonials, user counts, club or federation endorsements, accuracy claims. Label illustrative data "(example data)".

Use the glossary words exactly: Session, Swim, Length, Set, Focus metric, Tap Pad, Review sheet, Metric trend, Technique trend, Technique point, Fault, Capture template, Admin console, Configuration. Never "lap", "workout", "rep", "stopwatch" or "settings" (unqualified).

## Anti-references

| Not this | Because | Splitbook instead |
|---|---|---|
| Gamified habit apps: streaks, badges, confetti, nagging | Children are being watched, not trained to chase rewards | A plain improvement line and a kind, specific sentence |
| Strava-style feeds, kudos, leaderboards | Private by default; no ranking between children | One Swimmer at a time; no social surfaces |
| Garmin- or Apple-style ring dashboards | Dense rings led by time and distance | One dial per Technique point, one line per Metric trend, counts first |
| Clinical sports-science walls of terms | Parents get left behind | Plain words, jargon explained, one finding per chart |

## Worlds: the used-future rule

Splitbook has five sci-fi **worlds** built over the same anatomy: Approach Lights, Flight Deck, Sortie Board, Pressure Suit and Plotting Glass. Each lives in `tokens/worlds/<slug>.json` + `.css`, uses the theme value `splitbook-<slug>`, and offers four colour options through `data-palette` (the recommended default, two alternatives, `original`).

Worlds are **used future**: real carrier, cockpit and flight-deck conventions pushed forward in time. Tactile, worn-in, functional. The rule applies to every world and to nothing in the core.

- Allowed: matte surfaces, stencil and condensed type, stitched seams, edge hazard markings, lit indicators with numerals, plot marks.
- Banned: gradient text, decorative glass or blur, glow everywhere, scanlines, noise grain, neon-on-black reading surfaces.
- Glow only on **live** state (the recording Tap Pad, the running split).
- Reading planes (the Review sheet, tables, trend summaries, form fields) stay opaque and high contrast.
- A world changes how Splitbook looks, never how it behaves: same components, copy, states, voice and gates. Worlds may override only type, shape and depth tokens; never motion, density, spacing, layout or component sizes ([governance.md](../governance.md#adding-a-world)).
- Status is never colour alone in any world: every lit bulb, jersey colour and plot mark carries a numeral or label.

## Principles

1. **See what a stopwatch can't.** Counts and technique come first; times give context.
2. **Better before faster.** Show gains in efficiency and technique even when the clock doesn't move.
3. **Capture without missing the swim.** One or two taps per Length live; everything else waits for the Review sheet.
4. **Every tap can be undone.** No live action is final, and nothing time-critical hides behind a dialog.
5. **Four hands, four jobs.** Colour means one thing or nothing.
6. **Configuration, not code.** Admin screens make that visible: Draft, version, publish, history.
7. **Agents choose from rails.** Screens start from a blueprint and semantic tokens ([screen-generation-rules.md](../agent-contract/screen-generation-rules.md)); Carbon MCP and Figma Code Connect are the precedents ([mature-design-system-references.md §9](../research/mature-design-system-references.md#9-guidance-for-agents-generating-screens)).
