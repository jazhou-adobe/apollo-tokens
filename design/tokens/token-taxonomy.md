# Token taxonomy

Splitbook tokens are design decisions with names, values, types, descriptions, and theme behaviour. They follow Design Tokens Community Group (DTCG) concepts: every token has a `$value`, a `$type`, and a `$description`, so agents never infer purpose from a group name or a raw value ([theme-token-architecture-sources.md](../research/theme-token-architecture-sources.md), DTCG Format Module 2025.10). The tiers are primitive → semantic → component, as in Spectrum and Atlassian ([mature-design-system-references.md](../research/mature-design-system-references.md)).

Sources:

- [tokens.json](tokens.json): the source of truth.
- [themes.css](themes.css): runtime CSS variables. `validation/validate-design-system.mjs` fails if it drifts from `tokens.json`.
- [tailwind-theme.css](tailwind-theme.css): the Tailwind v4 `@theme` bridge.

## Direction: Pace Clock

The core is the big analogue pace clock on a pool wall: chalk-tile white surfaces, ink-black type, and the clock's four hands, each with **one** job.

| Hand | Role | Job |
|---|---|---|
| Red (in Deck: a near-black LED plate with safety-yellow figures) | `live` | Recording now: the live Tap Pad frame, the live Wall key, the running split shown on the live plate. Glow is allowed here and nowhere else. |
| Blue | `metric` | A captured metric value or Focus metric. |
| Green | `improvement` | Better than before: trend gains. Never plain success (that is `success`). |
| Black | `foreground` | Ink. Primary actions are ink too, so the hands stay free for their jobs. |

Numerals are the hero: `numeral-xl|lg|md` set Schibsted Grotesk in tabular figures. Paired panels (Tap Pad ↔ Review sheet, then ↔ now) sit either side of a central ink axis (`.sb-pair` + `.sb-pair-axis`, `border-width-heavy`), like the T-line on the pool floor.

## Layers

| Group in `tokens.json` | CSS variable | Purpose |
|---|---|---|
| `primitive.color` | not exported | Named raw colours (chalk, ink, the hands, safety yellow, the LED face). Token authors use them; screens never do. |
| `primitive.space` / `radius` / `borderWidth` / `font` / `fontWeight` / `motion` / `easing` / `opacity` | `--sb-space-4`, `--sb-radius-md`, `--sb-border-width-heavy`, `--sb-font-display`, `--sb-font-weight-heavy`, `--sb-motion-flash`, `--sb-easing-standard`, `--sb-opacity-ghost` | Shared rails. Durations: `fast`, `standard`, `panel` (dialogs, sheets, popovers), `flash` (the one-off tap acknowledgement), `pulse` (skeletons, spinners), `stagger`. Easing values are DTCG `cubicBezier` arrays exported as `cubic-bezier()`: `standard`, `enter`, `exit`, `linear`, `drawer`. There is no overshoot curve: the core stays calm. |
| `semantic.color.<role>` | `--sb-<role>` | The 46 roles components consume. Typed `color`, described, aliased to the Light value. |
| `typography.<name>` | `--sb-type-<name>-size`, `-line-height`, `-weight`, `-family` | `display`, `heading-lg`, `heading-md`, `body-lg`, `body`, `body-sm`, `label`, `code`, and the tabular numeral scale `numeral-xl` (the Tap Pad's running split and counts), `numeral-lg`, `numeral-md`. DTCG `typography` composite. |
| `density.<name>` | `--sb-density-<name>` | `inset`, `gap`, `control-padding-block`, `control-padding-inline`, `row-height`. |
| `elevation.<name>` | `--sb-elevation-<name>` | `raised` (one tight contact shadow) and `overlay`. DTCG `shadow`, coloured by the `shadow` role. |
| `layout.<name>` | `--sb-layout-<name>` | `sidebar-width`, `content-max`, `measure`, `capture-max` (phone proportions for the Capture column), `thumbnail-width`, `thumbnail-height`. |
| `layer.<name>` | `--sb-layer-<name>` | `raised` 10 (sticky tray, publish bar), `sticky` 20 (app bars), `dropdown` 30, `overlay` 40, `popover` 50, `toast` 60, `tooltip` 70, `skip-link` 80. Native `<dialog>` with `showModal()` and `[popover]` render in the top layer above every z-index. |
| `breakpoint.<name>` | literal in media queries and Tailwind `--breakpoint-*` | `md` 48rem (paired panels side by side), `lg` 64rem (sidebar beside content). |
| `component.<name>` | `--sb-<name>` | `button-min-target` (3rem, the 48 CSS px Capture floor), `control-size-sm` and `control-size-lg` (0.75 and 1.25 × the target), `focus-ring-width`, `focus-ring-offset`, `tap-key-size`, `rating-step-size`, `length-cell-size`, `progress-track-height`, `chart-height`, `dial-size`, `icon-size`, `avatar-size-sm|md|lg`, `overlay-dialog-width`, `overlay-sheet-width`, `overlay-popover-width`, `overlay-tooltip-width`, `overlay-menu-width`, and the motion contracts `press-scale`, `enter-scale`, `enter-offset`. |

The validator fails if any component, density, layer, or elevation token is exported but never consumed by the preview, so a value cannot be re-hard-coded beside its token.

## Naming rules

- Lowercase, ASCII, kebab-case.
- Purpose-oriented, not value-oriented.
- Glossary words where a role is domain-specific (`tap-pad`, `fault`, `metric`), never hues.

Good: `live`, `tap-pad`, `length-cell-size`, `surface-tray`. Avoid: `red-hand`, `blue-500`, `pool-blue-bg`.

## Required semantic roles (46)

Every theme, every world, and every world colour option defines all of them.

- **Base:** `background`, `foreground`, `surface-card`, `surface-card-foreground`, `surface-panel`, `surface-panel-foreground`, `surface-shelf`, `surface-shelf-foreground`, `surface-tray`, `surface-tray-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `ring`.
- **Status:** `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`.
- **Splitbook:** `live`, `live-foreground`, `metric`, `metric-foreground`, `improvement`, `improvement-foreground`, `fault`, `fault-foreground` (an observer-noted Fault, distinct from `destructive`), `tap-pad`, `tap-pad-foreground` (the Tap Pad surface).
- **Utility:** `shadow` (decorative elevation only), `scrim` (modal backdrop; text never sits on it), `chart-1` … `chart-5` (categorical series; charts also label every series).

Each role's `$description` in `tokens.json` says what it is for and which contrast rule applies.

## Themes and knobs

`tokens.json` → `themes.<name>` holds a full typed colour set per theme plus optional `overrides` for non-colour tokens. `themes.css` has one block per theme keyed by `html[data-theme="<name>"]`; the Light block also matches `:root`.

| Theme | What changes |
|---|---|
| `splitbook-light` (default) | Pace Clock: chalk-tile white, ink, red/blue/green hands. Every desk page. |
| `splitbook-deck` | Pace Clock for the pool deck, **and the Deck size knob**. Positive polarity (near-black ink on white and chalk reading planes) with glare-grade contrast (text pairs at 7:1); `live` is a near-black LED pace-clock plate with safety-yellow figures (`live-foreground`); `metric`, `improvement`, and `fault` are deep enough to carry white text at 7:1 and hold 3:1 as boundaries on white. Larger: `button-min-target` 3.5rem (56 CSS px), `tap-key-size` 6rem, `rating-step-size` 3.75rem, `length-cell-size` 3.75rem, `density-inset` 1.75rem, `density-gap` 1.25rem, `type-body-size` 1.125rem, `type-numeral-xl-size` 6rem, plus taller rows and controls and larger labels and read-outs. Capture screens opt in; desk pages stay Light. |

Deck keeps positive polarity because dark text on a light face reads better in bright light (Dobres et al. 2017, in [poolside-conditions.md](../research/poolside-conditions.md)). Safety yellow cannot hold a 3:1 boundary on white, so it is never a fill or a line on a reading plane: it is the figure colour on the black LED plate, which itself holds far more than 3:1 against every white surface.

**Reach zone:** on Capture screens the primary action sits in the bottom tray (`.sb-tray`, `data-sticky="true"` on phones), within one thumb's reach, in both themes.

**Density:** `densityModes.compact` applies with `[data-density="compact"]` on the **Admin console** region only. It lowers padding, gaps, row height, body size, and `button-min-target` (2rem, so `control-size-sm` is 24 CSS px, exactly the floor). It is never used on Capture or watcher pages.

Themes must not:

- Remove a foreground pair.
- Fork component anatomy.
- Use a different selector contract.
- Replace semantic roles with raw values in reusable examples.
- Make any state colour-only.

## Seeded worlds

A seeded world is a complete alternative skin over the same anatomy: palette, faces, shape, depth, texture, and one signature interaction. Splitbook's worlds share a **used-future** style: real carrier, cockpit, and flight-deck conventions pushed forward in time, tactile and worn-in. No gradient text, decorative glass, glow-everywhere, scanlines, noise grain, or neon-on-black reading surfaces; glow only on live state; reading planes opaque and high-contrast. Worlds are browsable at `/worlds` once registered.

Each world is two files in [`worlds/`](worlds/):

| File | Holds |
|---|---|
| `worlds/<slug>.json` | `label`, `order`, `$description` (the idea), `signature`, `colorScheme`, a full typed `color` set for all 46 roles, typed and described `overrides`, `palette` (`label` naming the default colours), and `palettes`: exactly three alternative colour options, each with `id`, `label`, `colorScheme`, and a full 46-role `color` set. The last is `original`. |
| `worlds/<slug>.css` | One `html[data-theme="splitbook-<slug>"]` block with every role and override, one `html[data-theme="splitbook-<slug>"][data-palette="<id>"]` block per palette, then the world's skin rules, keyframes, and textures. |

The theme value is `splitbook-<slug>`. The validator loads every world it finds and applies all theme gates unchanged (roles, CSS parity, overrides, contrast), plus world-only rules:

- **Four colour options:** the default in the theme block (the review's recommended colours) and exactly three `palettes`: two alternatives, then `original` (the world's first colours). Each option is a complete colour set that clears every contrast gate on its own.
- **Overrides** are limited to type, shape, and depth: `font-sans`, `font-display`, `font-mono`, `font-weight-*`, `type-*-family|size|line-height|weight`, `radius-*`, `border-width-*`, `elevation-*`. Motion, density, spacing, layout, and component sizes stay system-wide, so reduced motion, the Deck knob, compact density, and the target floors cannot be bypassed.
- **Scope:** every selector starts with `html[data-theme="splitbook-<slug>"]`; `--sb-*` tokens are set only in the theme block and only when the JSON documents them; no `@import`, `@font-face`, or `@layer`.
- **Palette blocks** may set only `color-scheme`, the 46 roles, and the world's own `--<slug>-*` helpers. Skins take every decorative colour from roles or those helpers, so a palette recolours textures and signatures too.
- **Collisions:** `@keyframes` names start with `<slug>-` and `@property` names with `--<slug>-`.
- **Motion:** animations and transitions use `--sb-motion-*` durations (which collapse to 1ms under reduced motion) or sit inside `@media (prefers-reduced-motion: no-preference)`; `infinite` is rejected.
- **Style bans:** `background-clip: text` (gradient text) and `backdrop-filter` (decorative glass) fail in every stylesheet, worlds included.
- **Intensity budget:** a world keeps every component but spends its material at three levels. *Identity* (page edges, the hero, one signature) carries the full material; *function* (buttons, inputs, menus, dialogs, navigation, charts) keeps the world's shape, type, and boundaries with restrained material; *reading and writing* (prose, the Review sheet, form fields, numerals being read) stays a quiet, opaque, stable plane. Textures never sit behind text a watcher reads or types, and the hands keep their single jobs: a world may restyle `live`, never repurpose it.

World stylesheets are unlayered (like `themes.css`), so skins win over the layered component styles without raising specificity.

### How to add a world

1. Create `tokens/worlds/<slug>.json` and `tokens/worlds/<slug>.css` as above.
2. If it needs a new face, add one `next/font` call in [`app/fonts.ts`](../app/fonts.ts) with `preload: false` and `variable: '--font-<family>'`, append it to `worldFontVariables`, and reference `var(--font-<family>)` from the world's `font-*` or `type-*-family` overrides.
3. Import the stylesheet in [`app/globals.css`](../app/globals.css), below the comment that marks the world imports: `@import '../tokens/worlds/<slug>.css';`
4. Register the JSON in [`preview/themes.ts`](../preview/themes.ts): one `import` line and one `['<slug>', <name>],` entry in `WORLD_FILES`. The theme menu, colour menu, pre-paint script, `/worlds`, and `/overview` all follow.
5. Run `npm run validate`.

## Accessibility gates (enforced)

`tokens.json` → `contrast` lists the documented pairs; the validator measures them in every theme, world, and colour option with the WCAG relative-luminance formula and truncates, never rounds up ([WCAG 2.2 SC 1.4.3, 1.4.6 and 1.4.11](../research/theme-token-architecture-sources.md)).

- **Text, 4.5:1:** every `<role>` / `<role>-foreground` pair (and `foreground` on `background`), `foreground` on `input`, and `muted-foreground` on `background`, every surface, `muted`, and `tap-pad`.
- **Glare grade, 7:1:** in `splitbook-deck` every text pair above must reach 7:1 (`contrast.glare`).
- **Non-text, 3:1:** `border` and `ring` against `background`, every surface, `input`, and `tap-pad`; `live`, `metric`, `improvement`, and `fault` as boundaries against `surface-card` and `tap-pad`; `chart-1` … `chart-5` against `surface-card` and `surface-panel`.
- **Target size:** every `button-min-target` value (base, Deck, compact, any world) is at least 24 CSS px; `control-size-*` stays at or above 24 CSS px at the smallest target; Deck's `button-min-target` is at least 56 CSS px and `tap-key-size` at least 80 CSS px ([WCAG 2.2 SC 2.5.8](../research/theme-token-architecture-sources.md)).
- **Deck knob:** `button-min-target`, `tap-key-size`, `rating-step-size`, `length-cell-size`, `density-inset`, `density-gap`, `type-body-size`, and `type-numeral-xl-size` are overridden by `splitbook-deck` and larger than the base.
- **Reduced motion:** the `prefers-reduced-motion: reduce` block collapses every `motion` duration to 1ms.
- **State never by colour alone:** Faults carry a flag and a label, rating levels a number and cue text, Length cells a number and a frame style, trends a printed value and a sentence.

## Raw-value guardrail

Raw hex and colour functions, `px`/`rem`/`em`/`ms` lengths and durations, unitless font-weight, line-height, opacity, letter-spacing, and z-index, literal shadows, easing keywords and curves (`ease-out`, `linear`, `cubic-bezier()`, `steps()`), off-token media-query breakpoints, Tailwind arbitrary values (`p-[13px]`), Tailwind palette utilities (`bg-blue-500`), and Tailwind `z-*` utilities are allowed only in `tokens/`. Everything else, including the preview CSS and TSX and the docs (no hex in Markdown outside `tokens/` and `research/`), uses tokens. The preview copy is also guarded: it never names the reference product and never says "DQ" or "disqualified".

## Tailwind compatibility

`tailwind-theme.css` resets Tailwind's default colours, radii, shadows, text sizes, and breakpoints, then maps the Splitbook variables with `@theme inline`. Only semantic utilities exist (`bg-surface-card`, `text-muted-foreground`, `border-border`, `bg-live`, `text-metric`, `rounded-md`, `shadow-raised`, `text-body`, `text-numeral-xl`), and spacing utilities run on `--sb-space-1`. Tailwind v3 apps can map the same `--sb-*` variables in `theme.extend`.
