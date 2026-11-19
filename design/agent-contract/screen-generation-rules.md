# Agent screen-generation contract

Mandatory for any agent building a Splitbook screen. Read [`brief.md`](../brief.md) and [design-language.md](../foundations/design-language.md) first. The preview at `/design` (port 3200) shows every component and blueprint live in Light, Deck and each world.

## Required flow

1. **Name the actor and the goal.** Watcher at the pool, watcher at a desk, or admin. One sentence: "A parent captures stroke counts for Maya's 100 m freestyle."
2. **Pick one blueprint** from [watcher-blueprints.md](../patterns/watcher-blueprints.md), [admin-blueprints.md](../patterns/admin-blueprints.md) or [system-blueprints.md](../patterns/system-blueprints.md). Its regions and states are the skeleton; do not invent a new page type.
3. **Set the knobs.**
   - Capture screens (pre-Swim setup, live Capture, Review sheet): `data-theme="splitbook-deck"` on `<html>`.
   - Desk pages: `splitbook-light` (default).
   - Admin console: `data-density="compact"` on the Admin region.
   - A world only if the product has adopted one: `data-theme="splitbook-<slug>"` plus `data-palette="<id>"`. Never invent a world in a screen.
4. **Lay out with containers**: panel for the workspace, cards for objects, shelves for collections, trays for temporary actions. Use the out-and-back pair where the blueprint names one.
5. **Choose components** from `components/*.md` by their `.sb-*` class. Set only the `data-variant`, `data-size`, `data-state` and ARIA attributes the doc defines. Never hand-roll a Tap Pad, rating, fault flag, dialog, menu or chart.
6. **Bind tokens by role** (below). Every value comes from a `--sb-*` variable or a semantic Tailwind utility.
7. **Wire behaviour**: APG pattern per component; undo for every live tap; one `role="status"` announcement per Length on the Tap Pad.
8. **Write coach's-clipboard copy**: calm, precise, kind, specific, no exclamation marks; glossary terms only; explain jargon.
9. **Add every non-happy state** the blueprint lists: empty, loading, error, offline, and for Capture: ready, recording, ended, saving offline.
10. **Check accessibility**: contrast (validator), focus, ≥ 48 px Capture targets (≥ 56 px Deck), one-hand reach, no gestures, undo, no dialog while recording, non-colour cues, reduced motion.
11. **Hand off** with the checklist at the end of this page.

## Allowed tokens

- Surfaces: `background`, `surface-card`, `surface-panel`, `surface-shelf`, `surface-tray`, `tap-pad`, each with its `-foreground`.
- Text: `foreground`, `muted-foreground`, and the foreground of the surface or role underneath.
- Actions: `primary`, `secondary`, `accent`, `destructive` and their foregrounds.
- Status: `success`, `warning`, `info` and their foregrounds.
- The four hands, one job each: `live` (recording now), `metric` (a captured value or Focus metric), `improvement` (better than before, always with words), `foreground` (ink).
- Faults: `fault` / `fault-foreground`, only on fault flags and fault counts.
- System: `border`, `input`, `ring`, `muted`, `scrim` (modal backdrop only), `shadow` (decorative elevation only).
- Data: `chart-1` … `chart-5`, always with markers, dashes or direct labels.
- Component tokens: `button-min-target`, `control-size-sm`, `control-size-lg`, `focus-ring-width`, `focus-ring-offset`, `tap-key-size`, `rating-step-size`, `length-cell-size`, `progress-track-height`, `chart-height`, `dial-size`, `icon-size`, `avatar-size-sm|md|lg`, `overlay-dialog-width`, `overlay-sheet-width`, `overlay-popover-width`, `overlay-tooltip-width`, `overlay-menu-width`, `press-scale`, `enter-scale`, `enter-offset`.
- Type: `type-<name>-*` for `display`, `heading-lg`, `heading-md`, `body-lg`, `body`, `body-sm`, `label`, `code`, and the numeral scale `numeral-xl`, `numeral-lg`, `numeral-md`.
- Rails: `space-*`, `radius-*`, `border-width-*`, `density-*`, `elevation-*`, `layer-*`, `motion-*`, `easing-*`.

## Forbidden patterns

- Raw hex, colour functions, px/rem/ms literals, Tailwind arbitrary values or palette utilities outside `tokens/`.
- Using a hand colour for anything but its job: `live` as an error or highlight, `metric` as a link or brand tint, `improvement` for "saved".
- `destructive` or `live` on a Fault. Any of "DQ", "disqualified", "illegal", "violation".
- Concentric fitness rings, gauge walls, streaks, badges as rewards, confetti, leaderboards, kudos, rankings between Swimmers.
- Exclamation marks; hype ("Amazing", "Crushed it"); shaming ("worse", "failed").
- Any dialog, sheet, toast or confirm that opens while a Swim is recording; End Swim behind a confirm.
- Long-press, swipe-only, double-tap, pinch or drag-only actions on Capture screens. Activation on pointer down.
- Targets below 48 px in Capture or below 56 px in Deck; keys that move or reflow while recording.
- State by colour alone: rating levels without numbers, fault flags without the word, trend changes without "Up"/"Down"/"Held".
- Side-stripe accents: a coloured bar on one edge of a card, alert, row or nav item.
- Gradient text, decorative glass or `backdrop-filter`, glow, scanlines, noise grain, neon-on-black reading surfaces (in worlds, glow on live state only).
- Toasts or messages that leave on a timer.
- Photos of children, stock photography, federation or club logos.
- Fabricated testimonials, user counts, endorsements or accuracy claims; unlabelled sample data.
- Any mention of another product name in the UI.

## Worked example: live Capture

**Goal**: a parent on the pool deck captures splits and stroke counts for Maya's 100 m freestyle, Swim 3, in a 25 m pool.

- Actor: watcher, poolside, one hand, glare.
- Blueprint: Live Capture ([watcher-blueprints.md](../patterns/watcher-blueprints.md#live-capture)).
- Knobs: `<html data-theme="splitbook-deck">`. No density attribute.
- Chrome: skip link; slim `.sb-app-bar` with "Swim 3 · 100 m freestyle", Swimmer name (Profile switcher read-only), End Swim (`.sb-button[data-variant="secondary"]`).
- Body: one `.sb-tap-pad` panel, `data-state="live"` (recording):
  - `.sb-tap-pad-head`: "Swim 3 · Length 3 of 4" and `.sb-live-mark[data-state="live"]` with the word "Recording" and the record disc in `live`.
  - `.sb-split-readout[data-state="live"]`: running split "18.6" in `numeral-xl` (`live`); "Last Length 32.4 s" in `numeral-md`.
  - `.sb-length-strip`: Length 1 → 15, Length 2 ← 16, Length 3 → "Now" (`data-state="current"`), Length 4 upcoming; each `.sb-length-cell` at `--sb-length-cell-size`.
  - `.sb-tap-keys`: one counter `.sb-tap-key[data-kind="counter"]` "Strokes" at `--sb-tap-key-size`, count "9" in `numeral-lg`, both `metric`, accessible name "Add stroke, now 9"; then the Wall key `.sb-tap-key[data-kind="wall"]`, full width at the bottom, `live` / `live-foreground`, label "Wall", shortcut Space.
  - `.sb-tray` undo tray: "Undo wall tap", "Undo stroke"; `.sb-tap-log` listing the last taps in words.
- Tokens: `tap-pad`, `tap-pad-foreground`, `live`, `live-foreground`, `metric`, `metric-foreground`, `border`, `ring`, `tap-key-size`, `length-cell-size`, `button-min-target`, `density-gap`, `type-numeral-xl-size`.
- Behaviour: activation on release; the tapped key gets `data-flash="true"` for one outline flash; per-Length announcement "Length 2: 32.4 seconds, 16 strokes"; undo supersedes the last Capture event; End Swim removes `data-state="live"` and shows "Ended" with Resume and "Review this Swim", no dialog.
- States shown: ready ("Start"), recording, ended, saving offline ("Saved on this phone. Will sync when you're back online.").
- Accessibility: keys ≥ 5rem in Deck, ≥ `density-gap` apart, Wall key in thumb reach, End Swim far from it; "Recording" in words; reduced motion keeps the split counting and drops the press scale.
- Copy: "Recording. Tap Wall at each touch." Nothing else on screen.

## Handoff checklist

- Which blueprint, actor and knobs (theme, palette, density)?
- Which `.sb-*` components with which attributes?
- Which tokens; is any hand colour used outside its job?
- Which non-happy states are included?
- How does each state read without colour?
- Keyboard path and focus return?
- Capture: target sizes in Deck, thumb reach, undo, no dialogs while recording?
- Reduced motion?
- Copy in the coach's-clipboard voice, glossary terms, jargon explained?
