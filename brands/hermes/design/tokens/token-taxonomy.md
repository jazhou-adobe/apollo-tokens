# Token taxonomy

Hermes Hub tokens are design decisions with names, values, types, descriptions, and theme behaviour. They follow the Design Tokens Community Group (DTCG) format: every token has a `$value`, a `$type`, and a `$description`, so agents never infer purpose from a group name or a raw value. The tiers run primitive → semantic → component, as in Spectrum and Atlassian ([research/theme-token-architecture-sources.md](../research/theme-token-architecture-sources.md), [research/mature-design-system-references.md](../research/mature-design-system-references.md)).

Sources:

- [tokens.json](tokens.json): the source of truth.
- [themes.css](themes.css): runtime CSS variables, `--hh-*`. Framework-free, so a Bun-served UI can import it as is. `validation/validate-design-system.mjs` fails if it drifts from `tokens.json`.
- [tailwind-theme.css](tailwind-theme.css): the Tailwind 4 `@theme` bridge.
- [worlds/](worlds/): one `<slug>.json` and one `<slug>.css` per world. Empty until a world ships.

## Layers

| Group in `tokens.json` | CSS variable | Purpose |
|---|---|---|
| `primitive.color` | not exported | Raw palette. Token authors use it; screens never do. |
| `primitive.space` / `radius` / `borderWidth` / `font` / `fontWeight` / `letterSpacing` / `motion` / `easing` / `opacity` | `--hh-space-4`, `--hh-radius-md`, `--hh-border-width-thin`, `--hh-font-mono`, `--hh-font-weight-bold`, `--hh-letter-spacing-caps`, `--hh-motion-fast`, `--hh-easing-standard`, `--hh-opacity-disabled` | Shared rails. Faces: `sans` (Schibsted Grotesk, reading), `mono` (Spline Sans Mono, callsigns, ids, timers, code), `condensed` (Big Shoulders, strip headers and display). Durations: `fast`, `standard`, `panel` (dialogs, sheets, strip expand), `signature` (a world's one signature moment; rare, never looping), `pulse` (skeleton and reconnecting lamp, bounded), `stagger`. Easing values are DTCG `cubicBezier` arrays exported as `cubic-bezier()`: `standard`, `enter`, `exit`, `linear` (spinners and the policy timer), `drawer`. There is no overshoot curve: nothing in an ops room bounces. |
| `semantic.color.<role>` | `--hh-<role>` | The 58 roles components consume. Typed `color`, described, aliased to the `hermes-dark` value. |
| `typography.<name>` | `--hh-type-<name>-size`, `-line-height`, `-weight`, `-family` | Type scale (DTCG `typography`): `display`, `heading-lg`, `heading-md`, `body-lg`, `body`, `body-sm`, `label`, `mono`, `mono-sm`, `strip-header`. |
| `density.<name>` | `--hh-density-<name>` | `inset`, `gap`, `control-padding-block`, `control-padding-inline`, `row-height`. |
| `elevation.<name>` | `--hh-elevation-<name>` | `raised` and `overlay` (decorative, coloured by `shadow`) and `live`, a glow coloured by `live`. The validator fails any rule that paints `elevation-live` on a selector that does not target live state. |
| `layout.<name>` | `--hh-layout-<name>` | Sidebar width (also the Feed index column), content max (preview pages only: Command Center pages are full width), reading measure, `sticky-top` (the offset below the sticky app bar for sticky columns, a Round's scroll margin and the top toast region), strip bay width, phone frame width, gallery and thumbnail sizes. |
| (component stylesheet) | `--timer-fraction`, `--progress-value` | Not tokens: per-element fill values (0–1) set by script through the CSSOM, or by `data-fill="0…100"` (steps of 5) on the fill for pages whose Content-Security-Policy blocks `style` attributes. |
| `layer.<name>` | `--hh-layer-<name>` | Stacking order: `raised` 10 (Answer bar), `sticky` 20 (app bar), `dropdown` 30, `overlay` 40, `popover` 50, `toast` 60, `tooltip` 70, `skip-link` 80. Native `<dialog>` and `[popover]` render in the browser top layer above every z-index. |
| `breakpoint.<name>` | literal in media queries and Tailwind `--breakpoint-*` | `md` 48rem (below it the phone layout applies), `lg` 64rem (strip bay beside the open Round; Feed index beside the Feed; side nav as a column). |
| `component.<name>` | `--hh-<name>` | Stable component contracts: `button-min-target`, `control-size-sm` and `control-size-lg` (0.8 and 1.25 × the target), `focus-ring-width`, `focus-ring-offset`, `strip-min-height`, `strip-holder-width` (the holder frame around a strip), `timer-track-height` (the Unanswered Policy timer), `callsign-chip-height`, `option-row-min-height` (one choice row), `kbd-size` (key hint), `icon-size`, `avatar-size-sm|md`, `overlay-dialog-width`, `overlay-drawer-width`, `overlay-popover-width`, `overlay-tooltip-width`, `overlay-menu-width`, `code-max-height`, `progress-track-height`, and the motion contracts `press-scale`, `enter-scale`, `enter-offset`. |

The validator fails if any component, density, layer, or elevation token is exported but never consumed by the preview, so a value cannot be re-hard-coded beside its token.

## Naming rules

- Lowercase ASCII kebab-case.
- Named for purpose, not value: `pending`, `strip`, `surface-tray`, `ring`. Never `amber-500-holder` or `cool-cyan`.
- Glossary terms only: Hub, Command Center, Agent, Human, Round, Question, Answer, Unanswered Policy.

## Colour roles (58)

Every theme, every world, and every world colour option defines all of them.

- **Base:** `background`, `foreground`, `surface-card`, `surface-card-foreground`, `surface-panel`, `surface-panel-foreground`, `surface-shelf`, `surface-shelf-foreground`, `surface-tray`, `surface-tray-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`.
- **Status:** `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`.
- **Hermes:** `strip`, `strip-foreground` (Round strip paper and its ink); `pending`, `answered`, `expired` (holder colours) and `recommended` (a marker, not a status), each with a `-foreground` for the word printed on it; `live`, `live-foreground` (connected and streaming); `code`, `code-foreground` (attachments, diffs, logs); `diff-add`, `diff-remove` (diff line backgrounds).
- **Agent identity:** `agent-1` … `agent-6`.
- **Utility:** `shadow` (decorative elevation only), `scrim` (backdrop behind a modal; text never sits on it), `chart-1` … `chart-5`.

Each role's `$description` in `tokens.json` states what it is for and which contrast gate applies.

## Themes

`tokens.json` → `themes.<name>` holds a full typed colour set and its `colorScheme`. `themes.css` has one block per theme keyed by `html[data-theme="<name>"]`; the default theme shares its block with `:root`.

| Theme | What it is |
|---|---|
| `hermes-dark` (default) | Ops-room slate with paper-cream strips in dark ink. |
| `hermes-light` | The day shift: a pale bay with white strips. Same holders, callsigns, and anatomy. |

There is no high-contrast theme. Themes must not remove a foreground pair, fork component anatomy, change the selector contract, or make a status colour-only.

## Density modes

Density lives in `densityModes`, applied by attribute on any element, and changes no colours.

| Mode | Selector | What it does |
|---|---|---|
| default | none | Desktop: `button-min-target` 2.25rem (36px). |
| `compact` | `[data-density="compact"]` | The triage list, the answered log, and other dense desktop regions. Lowers `density-*`, `strip-min-height`, `option-row-min-height`, and body size; `button-min-target` 2rem (32px) and the redeclared `control-size-sm` (25.6px) stay above the 24px floor. |
| `glance` | `[data-density="glance"]`, and any compact region inside it | Phone use over the tailnet. Raises `button-min-target` to 3rem (48px), `option-row-min-height`, every `density-*`, `strip-min-height`, and `type-body-size`. A compact list inside a glance screen still gets glance values. |

The validator enforces both directions: compact must lower each listed knob and keep every target at or above 24px; glance must raise each listed knob, and its target must be at least 3rem.

## Worlds

A world is a complete alternative skin over the same anatomy: palette, faces, shape, depth, texture, and one signature interaction, in the **used-future** style the brief sets (real carrier, ops-room, cockpit, and console conventions pushed forward in time). It never changes motion, density, spacing, layout, or component sizes.

| File | Holds |
|---|---|
| `worlds/<slug>.json` | `label`, `order`, `$description` (the idea), `signature`, `colorScheme`, a full typed `color` set for all 58 roles, typed and described `overrides`, `palette` (a `label` naming the recommended default colours), and `palettes`: exactly three more colour options, each with `id`, `label`, `colorScheme`, and a full 58-role `color` set. The last one has id `original`. |
| `worlds/<slug>.css` | One `html[data-theme="hermes-<slug>"]` block with every role and override, one `html[data-theme="hermes-<slug>"][data-palette="<id>"]` block per colour option, then the world's skin rules, keyframes, and textures. |

The theme value is `hermes-<slug>`. The validator loads every world on disk and applies every theme gate unchanged (roles, CSS parity, contrast), plus world-only rules:

- **Four colour options**, in this order: the recommended default (the theme block), two alternatives, then `original`. Each is a complete colour set that clears every contrast gate on its own. A palette block may set only `color-scheme`, the 58 roles, and the world's own `--<slug>-*` helpers, so a palette recolours textures and signatures as well as surfaces.
- **Overrides** are limited to type, shape, and depth: `font-sans`, `font-mono`, `font-condensed`, `font-weight-*`, `letter-spacing-*`, `type-*-family|size|line-height|weight`, `radius-*`, `border-width-*`, `elevation-*`. Motion, density, spacing, layout, and component sizes stay system-wide, so reduced motion, the glance and compact knobs, and the target floor cannot be bypassed.
- **Scope:** every selector starts with `html[data-theme="hermes-<slug>"]`; `--hh-*` tokens are set only in the theme block and only when the JSON documents them; no `@import`, `@font-face`, or `@layer`.
- **Collisions:** `@keyframes` names start with `<slug>-`, `@property` names with `--<slug>-`.
- **Motion:** animations and transitions use `--hh-motion-*` durations (which collapse to 1ms under reduced motion) or sit inside `@media (prefers-reduced-motion: no-preference)`. `infinite` is rejected in every world.
- **Glow:** `elevation-live` only on selectors that target live state.
- **Intensity budget:** a world keeps every component but spends its material at three levels. *Identity* (page edges, the app bar, the signature moment) carries the full material. *Function* (buttons, inputs, menus, dialogs, navigation, strips' holders) keeps the world's shape, type, and boundaries with restrained material. *Reading and writing* (Question text, attachments, diffs, free-text Answers, notes) stays a quiet, opaque, high-contrast plane. Textures never sit behind text the Human reads or writes. No gradient text, decorative glass, glow-everywhere, scanlines, noise grain, or neon-on-black reading surfaces.

World stylesheets are unlayered (like `themes.css`), so their skins beat the layered component styles without raising specificity.

### How to add a world

1. Create `tokens/worlds/<slug>.json` and `tokens/worlds/<slug>.css` as above (start by copying the `hermes-dark` colour set from `tokens.json`).
2. Load any new face in [`app/fonts.ts`](../app/fonts.ts) with `next/font` (`preload: false`, `variable: '--font-<family>'`), add it to `worldFontVariables`, and reference `var(--font-<family>)` from the world's `font-*` overrides. Check the face ships every weight the world's tokens name.
3. Add the slug to `WORLD_SLUGS` in [`preview/themes.ts`](../preview/themes.ts). That one line registers it: the switcher, `/worlds`, `/overview`, and the inlined stylesheet all follow.
4. Run `npm run validate`. It fails on an unregistered world, a registered slug without files, and every rule above.

## Accessibility gates (enforced)

`tokens.json` → `contrast` lists the documented pairs; the validator also requires every pair the brief names to be listed, so a gate cannot be silenced by deleting it. Ratios use the WCAG relative-luminance formula and are truncated, never rounded up.

- **Text, 4.5:1:** every `<role>` / `<role>-foreground` pair (and `foreground` on `background`); `foreground` on `input`; `code-foreground` on `diff-add` and `diff-remove`; `muted-foreground` on `background`, every surface, and `muted` (never on `strip`, which uses `strip-foreground`).
- **Non-text, 3:1:** `border` and `ring` against every surface, `strip`, and `input`; `pending`, `answered`, `expired`, and `recommended` as holder boundaries against `strip` and `background`; `agent-*` and `chart-*` against `surface-card`, `surface-panel`, and `background`.
- **Target size:** every `button-min-target` value at or above 24 CSS px, `control-size-*` at or above 24px at the smallest target, glance at or above 48px.
- **Reduced motion:** the `prefers-reduced-motion: reduce` block collapses every `motion` duration to 1ms.
- **Infinite animation:** the core has exactly one, `.hh-spinner`. It loops only while work is in progress, always sits beside visible words naming that work ("Loading the answered log"), and stops under `prefers-reduced-motion: reduce`. Every other core animation runs a bounded number of times, and worlds may not use `infinite` at all.
- **Status is never colour alone:** holders print a status word, callsign chips print the callsign, diff lines carry a sign, chart series are labelled.

## Raw-value guardrail

Raw hex and colour functions (including `color-mix()`), `px`/`rem`/`em`/`ms`/`pt`/`ch` lengths and durations, unitless font-weight, line-height, letter-spacing, opacity, and z-index, literal shadows, easing keywords and curves, off-token media query breakpoints, Tailwind arbitrary values, Tailwind palette utilities, and Tailwind `z-*` utilities are allowed only in `tokens/`. Everything else, including the preview CSS and TSX, uses tokens. Opacity 0 and 1 stay allowed as off and on states.

## Tailwind compatibility

`tailwind-theme.css` resets Tailwind's default colours, radii, shadows, text sizes, and breakpoints, then maps the Hermes variables with `@theme inline`. Only semantic utilities exist: `bg-strip`, `text-strip-foreground`, `border-pending`, `bg-surface-panel`, `text-muted-foreground`, `rounded-md`, `shadow-raised`, `text-body`, `font-mono`; spacing runs on `--hh-space-1`. Tailwind 3 apps can map the same `--hh-*` variables in `theme.extend`.
