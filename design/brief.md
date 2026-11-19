# Hermes Hub design system: brief

This file is the Phase 1 record for `build-brand-design-system`. It holds the owner's interview answers (2026-11-19 and 2026-11-20) and the contract every artifact in `design/` follows. If an artifact and this brief disagree, the brief wins until the owner changes it.

## Inputs

- Product: `../hermes-hub/GLOSSARY.md` and the research notes on the `research/*` branches of `../hermes-hub`. Read them with `git -C ../hermes-hub show research/<branch>:docs/research/<branch>.md`. The branches are `agent-human-transport-options`, `agent-detection-signals`, `lan-tailnet-exposure-auth` and `mcp-bun-tasks`. There is no PRODUCT.md; this brief stands in for its brand section.
- Reference implementation: `../mathgo-master/design`. It is the system this skill came from. Reuse its structure, validator rules, world contract and preview mechanics. Don't reuse its look, fonts or copy.

## Product in one paragraph

Hermes Hub is a local human-in-the-loop command center. Many AI **Agents** (Claude Code, Codex CLI, Cursor, VS Code Copilot, omp, scripts), running in separate processes and sometimes on other machines over a tailnet, send the **Hub** **Rounds**. A Round is a batch of **Questions**: single choice, multiple choice, free text, or approve/reject. A Question can carry context attachments and a recommended option, and each one declares an **Unanswered Policy**: keep waiting, apply the recommended option, or cancel. One **Human** answers every Round from the **Command Center** in a browser, which receives updates over SSE. An **Answer** covers a whole Round: one value per Question, plus notes. Agents learn the protocol from the **Hub Skill**.

## Owner decisions

| Topic | Decision |
|---|---|
| Repo | This repo is the Hermes brand master. It is separate from the Splitbook master. |
| Scope this run | Phases 1–4: frame, seeded brainstorm, tokens/themes/worlds/foundations/preview/validator, then critique and fixes. Specs, coverage, motion catalogue and handoff skill come later. |
| Stack | DTCG `tokens.json` → `--hh-*` CSS variables (framework-free, so they also work in a Bun-served UI) plus a Tailwind 4 `@theme` bridge. Next.js 16 / React 19 preview on port **3300**. |
| Audience | One developer. Desktop first: dense, keyboard-driven triage beside terminals. Phone second: quick approve/reject over the tailnet. |
| Core themes | `hermes-dark` (default) and `hermes-light`. There is no high-contrast theme. |
| Density | `[data-density="compact"]` for the triage list and dense desktop regions. `[data-density="glance"]` for phone use: touch-sized targets (`button-min-target` ≥ 3rem), roomier rows, larger body text. |
| Voice | **Dispatcher**: terse, exact, unhurried. Every Round is a decision with stakes. No chatter, no emoji, no exclamation marks. Status words come before adjectives ("Pending · 2 Questions · waits 10 min, then applies recommended"). |
| Core direction | **Flight Strips, carrier ops-room edition** (sci-fi, used future). |
| Worlds | Five sci-fi worlds in a **used-future** style were previewed: Deck Handling Board, Comms Deck, Starship Hermes, Flight Director 2169, Telemetry Ribbon. After seeing the quick previews (`research/world-previews/`), the owner chose to build **Deck Handling Board, Comms Deck, Starship Hermes, Flight Director 2169**. Telemetry Ribbon stays as a preview only. Each built world has 4 colour options. |
| Reviewer | `design-reviewer`, copied from MathGo (`github-copilot/gpt-6.1-sol`), with thinking-level **medium**. |

## Core direction: Flight Strips, carrier ops room

The Command Center is the strip board in a spacecraft carrier's operations room. Each **Round** is a flight-progress **strip** in a holder. The holder colour gives the Round's status, and it is always paired with a status word:

| Holder | Role | Meaning |
|---|---|---|
| Amber | `pending` | Waiting for the Human. |
| Cyan-steel | `answered` | Answered and delivered to the Agent. |
| Grey | `expired` | The Unanswered Policy fired, or the Round was cancelled. |
| Signal green | `recommended` | Marks the Agent's recommended option. This is a marker, not a status. |

`hermes-dark` (default) is ops-room slate with paper-cream strips; text on strips is dark ink. `hermes-light` is the day-shift board: pale bay with white strips. The Unanswered Policy timer runs along the strip's edge. Each Agent is identified by a **callsign** chip (`agent-1` … `agent-6` colours, always with the callsign text, such as `CLAUDE·api-refactor`). Live values (counts, timers, connection) use mono tabular numerals, and glow appears **only** on live state. Typography: a plain grotesque for reading, a mono for callsigns, ids and timers, and a condensed face for strip headers.

The seed suggested call-and-response pairs and a grid of 64 positions: the strip bay is a disciplined grid, and every Question sits beside its Answer slot.

Style rule for core and worlds alike: **used future**. Real carrier, ops-room, cockpit and console conventions pushed forward in time: tactile, worn-in, functional. No gradient text, decorative glass, glow-everywhere, scanline noise or neon-on-black reading surfaces. Reading planes (Question text, attachments, free-text answers) stay opaque and high-contrast.

## Token contract

The prefix is `--hh-`. Theme selector: `html[data-theme="<theme>"]`. World colour option: `[data-palette="<id>"]` on the same element. The tiers and naming follow `../mathgo-master/design/tokens/token-taxonomy.md`, with `mg` replaced by `hh`.

### Colour roles (each theme and each world colour option defines all of them)

- Base: `background`, `foreground`, `surface-card`, `surface-card-foreground`, `surface-panel`, `surface-panel-foreground`, `surface-shelf`, `surface-shelf-foreground`, `surface-tray`, `surface-tray-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`.
- Status: `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`.
- Hermes: `strip`, `strip-foreground` (the Round strip paper), `pending`, `pending-foreground`, `answered`, `answered-foreground`, `expired`, `expired-foreground`, `recommended`, `recommended-foreground`, `live`, `live-foreground` (connected and streaming), `code`, `code-foreground` (attachments, diffs, logs), `diff-add`, `diff-remove` (line backgrounds; `code-foreground` must reach 4.5 on both).
- Agent identity: `agent-1` … `agent-6`.
- Utility: `shadow`, `scrim`, `chart-1` … `chart-5`.

That is 58 roles in total.

Contrast gates (WCAG ratios, truncated, never rounded up):

- Every `<role>` / `<role>-foreground` pair ≥ 4.5.
- `code-foreground` on `diff-add` and on `diff-remove` ≥ 4.5.
- `muted-foreground` on background, every surface and `muted` ≥ 4.5. `muted-foreground` on `strip` is excluded; strips use `strip-foreground`.
- `border` and `ring` against every surface, `strip` and `input` ≥ 3.
- `pending`, `answered`, `expired` and `recommended` as holder boundaries against `strip` and `background` ≥ 3.
- `agent-*` and `chart-*` against `surface-card`, `surface-panel` and `background` ≥ 3.

### Component tokens (minimum set)

`button-min-target`, `control-size-sm`, `control-size-lg`, `focus-ring-width`, `focus-ring-offset`, `strip-min-height`, `strip-holder-width` (status edge), `timer-track-height` (Unanswered Policy timer), `callsign-chip-height`, `option-row-min-height` (one choice row), `kbd-size` (key hint), `icon-size`, `avatar-size-sm|md`, `overlay-dialog-width`, `overlay-drawer-width`, `overlay-popover-width`, `overlay-tooltip-width`, `code-max-height`, plus motion contracts `press-scale`, `enter-scale`, `enter-offset`.

Typography includes a mono scale (`mono`, `mono-sm`) and `strip-header`.

### Density modes

`compact` lowers padding, gaps, row height and `strip-min-height`, and keeps `button-min-target` ≥ 24 CSS px. `glance` raises `button-min-target` (≥ 3rem), `option-row-min-height`, `density-*` and `type-body-size`. The validator enforces both directions.

### Worlds

A world is `tokens/worlds/<slug>.json` plus `<slug>.css`, theme value `hermes-<slug>`, with exactly 4 colour options (recommended default, two alternatives, `original`). Worlds may override only type, shape and depth tokens. They never change motion, density, spacing, layout or component sizes. They follow the scoping, keyframe-prefix, no-`infinite` and intensity-budget rules in MathGo's token taxonomy.

| Slug | Idea | Signature |
|---|---|---|
| `deck-handling` | The carrier "Ouija board": a top-down deck plan where handlers move aircraft templates. Agents are craft parked in deck zones. | When a Round is answered, its craft taxis to the catapult and off the board. |
| `comms-deck` | A ship's comms console. Agents are channels on a jack field, and pending Rounds are lit channel lamps. | Answering patches the channel, and the lamp goes dark. |
| `starship` | Starship Hermes: the courier god as a ship's emblem. Engraved hull plates with a meander band on page edges only, in terracotta and soot. | A winged-sandal dispatch mark appears when a Round is sent back. |
| `flight-director` | Flight Director 2169: future flight-director consoles in a wide geometric face, with phosphor used only on live values. | GO / NO-GO polling for approve/reject Rounds, with text labels. |
| `telemetry-ribbon` | Scrolling telemetry tape from a cockpit recorder: banded rows and sprocket margins in hull grey. | The Round log feeds up line by line. |

## Domain widgets

Round strip (collapsed and expanded), strip bay and triage queue, Question blocks (single, multi, free text, approve/reject), recommended-option marker, attachments (diff, code, file, link), callsign chip, Agent roster with detection details (client kind, session id, cwd/git), Unanswered Policy timer and badge, Answer bar (submit the whole Round, add notes), keyboard hints (j/k, 1–9, a/r, ⌘↵), connection status (SSE live, reconnecting, offline), answered log, expired/cancelled states, empty bay.

## Blueprints

- Command Center: triage (strip bay plus open Round), Round detail, answered log, Agent roster, Agent detail, settings (tokens, exposure, notifications).
- Phone (glance): pending list and single-Round approve/reject.
- System: sign-in (one-time link or passkey), not reachable, reconnecting, empty, error.

## Phase 2 seed

The core direction and world list were drawn from a private random seed. Never reveal it in the design.
