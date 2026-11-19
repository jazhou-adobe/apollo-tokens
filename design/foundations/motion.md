# Motion and interaction

Colour, type and shape say what something is; motion says what just happened. Splitbook motion is a pace clock's: steady, mechanical, never bouncy. On the pool deck it must never pull the watcher's eyes off the Swimmer for longer than a glance.

## Decide first

1. **How often does it happen?**
   - **Constant** (every Length): wall taps and counter taps. A press response (`--sb-press-scale` on `--sb-motion-fast`) and one outline flash on the tapped key (`--sb-motion-flash`, once, never looping); no travel, no entrance.
   - **Frequent** (every Swim): opening the Review sheet, adding a Swim to the Session row list. Short enter on `--sb-motion-fast` or `--sb-motion-standard`.
   - **Occasional**: dialogs, sheets, menus. `--sb-motion-standard` to `--sb-motion-panel`.
   - **Rare**: none in the core. No celebrations. A trend gain is shown in words, not animated.
2. **What is its job?** Feedback, spatial, state or continuity. Delight is not a job in the core product.
3. **Which recipe?** Use the shared durations, easings, `--sb-enter-offset`, `--sb-enter-scale` and `--sb-press-scale`. Do not invent a curve or a duration.

## Rules

- **Tokens only.** Durations `--sb-motion-*`, curves `--sb-easing-*`, travel `--sb-enter-offset`, scale `--sb-enter-scale` and `--sb-press-scale`. The validator rejects literal durations and curves outside `tokens/`.
- **Transform and opacity.** Animate transform, opacity, clip-path and stroke-dashoffset (a dial sweep). Never width, height, top or left.
- **Interruptible.** Taps run on CSS transitions so a second tap retargets instead of queueing.
- **Leave faster, the same way.** Exits use `--sb-motion-fast` and return along the entry path; a sheet that rose from the bottom sinks back to it.
- **Hover is a bonus.** Hover motion sits inside `@media (hover: hover) and (pointer: fine)`; focus gets the same affordance through `:focus-visible`.
- **Meaning never rides on motion.** Every state has text, a number or a shape.

## Capture-specific motion

| Moment | Motion | Reduced motion |
|---|---|---|
| Wall tap | Key compresses by `--sb-press-scale`; the new Length cell appears in the Length strip without travel; the split read-out updates | Same, without the compress |
| Counter tap | Key compresses; the count changes in place | Count changes in place |
| Undo | The last cell or count reverts in place; a `role="status"` line says what was undone | Same |
| Running split | Digits change every tenth of a second. No sweep animation, no glow in the core | Digits still change (information, not decoration) |
| Fault flag | Toggles fill and the word changes; no shake | Same |
| Review sheet opens after a Swim | Rises from the bottom edge on `--sb-motion-panel` with `--sb-easing-drawer` | Appears in place |

Wrong or missed input never shakes, flashes or bounces.

## What never moves

- Numbers being compared: trend tables, Session history rows, Admin tables.
- The Tap Pad layout while recording: keys never reflow, slide or resize mid-Swim.
- A control switching between disabled and enabled.
- Blocking alerts.

## Reduced motion

`prefers-reduced-motion: reduce` collapses every `--sb-motion-*` duration to near zero in `themes.css` (validated), so CSS motion jumps to its end state. Script-driven motion reads its durations from the same tokens.

## Worlds

Worlds may not override motion tokens. Each world's one signature (a bulb lighting, a split flash, a sortie row printing in, a pad compressing, a plot mark drawn) runs once on these tokens, never `infinite`, collapses under reduced motion, and never carries the only copy of a state. Glow is allowed on the live state only.
