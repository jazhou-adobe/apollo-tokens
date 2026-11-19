# Accessibility foundation

Accessibility is a gate, not a clean-up pass. The baseline is **WCAG 2.2 AA** plus **poolside conditions** from `../training-track/PRODUCT.md`. WAI-ARIA APG is the widget-behaviour reference ([mature-design-system-references.md §7](../research/mature-design-system-references.md#7-accessibility-baseline)); the success criteria and their token implications are in [theme-token-architecture-sources.md](../research/theme-token-architecture-sources.md); the evidence for the poolside rules is in [poolside-conditions.md](../research/poolside-conditions.md).

## Poolside conditions

The Capture flow (pre-Swim setup, live Capture, Review sheet) is used on a phone or tablet on the pool deck or in the stands: in glare, often with wet hands, one hand free, while watching a Swimmer who is moving. Every Capture screen opts into `data-theme="splitbook-deck"` and follows these rules.

| Condition | Rule | How it is enforced |
|---|---|---|
| **Glare** | Glare-grade contrast (every Deck text pair at 7:1). Dark ink on a light face (positive polarity) for reading planes in both themes; in Deck the live state is a near-black LED plate with safety-yellow figures, never yellow on white. No thin hairlines carrying meaning; boundaries use `border-width-thick` or `border-width-heavy` in colours that pass 3:1. | Deck palette in `tokens.json`; contrast gates (and the 7:1 glare grade) in the validator |
| **Wet hands** | Big targets with space between them. Activate on release (pointer up), so a wet finger that slides off cancels. No long-press, no swipe-only actions, no double-tap. | `button-min-target`, `tap-key-size`; WCAG SC 2.5.2 Pointer Cancellation |
| **One hand** | Primary actions (wall tap, counter keys, Done) sit in the lower half of the screen, in thumb reach. While recording, the counters, the Wall key and every undo control are on the first phone screen together (390 × 844, Deck sizing included), so a correction never needs a scroll. Nothing needs two hands or a pinch. | Deck layout rules in [capture-widgets.md](../components/capture-widgets.md#tap-pad--sb-tap-pad); SC 2.5.1 Pointer Gestures |
| **Target size** | **≥ 48 px** for every target in Capture (Light); **≥ 56 px** (`button-min-target` 3.5rem) in Deck; Tap Pad keys ≥ 5rem (`tap-key-size`). | Validator: Deck must raise `button-min-target`, `tap-key-size`, `rating-step-size`, `length-cell-size` above base |
| **Undo for every tap** | Each live tap is a Capture event that can be undone from the same place, without a dialog. Undo removes the last tap of that counter or split only. Capture events are superseded, never deleted. | Tap Pad anatomy; `.sb-tap-pad` undo cluster |
| **Nothing time-critical behind a dialog** | While a Swim is recording, no modal opens on its own: no confirm, no alert, no sheet. Ending a Swim, a missed tap or an error is handled inline on the Tap Pad. Dialogs are for after the Swim. | Agent contract forbidden patterns |
| **Never colour alone** | Fault flags carry the word "Fault" and a flag shape; rating levels carry their number and cue text; the live state carries the word "Recording" and a moving split; trend gains carry "Up"/"Down" in words. | Component states below; SC 1.4.1 |
| **Glance reading** | One hero numeral per region; labels in words; no information that needs reading a paragraph mid-Swim. | [typography.md](typography.md#numeral-scale) |

## Contrast

- Text: at least 4.5:1 (SC 1.4.3). Every `<role>` / `<role>-foreground` pair passes, and `muted-foreground` passes on `background`, every surface, `muted` and `tap-pad`.
- Non-text: at least 3:1 (SC 1.4.11). `border` and `ring` against every surface, `input` and `tap-pad`; `live`, `metric`, `improvement` and `fault` as boundaries against `surface-card` and `tap-pad`; `chart-1` … `chart-5` against `surface-card` and `surface-panel`.
- Ratios are truncated, never rounded up. `validation/validate-design-system.mjs` measures every documented pair in every theme and every world colour option.

## Non-colour state cues

| State | Required cue besides colour |
|---|---|
| Recording (`live`) | The word "Recording", the running split, and a filled record disc shape |
| Captured value (`metric`) | The metric's name in words beside the number |
| Improvement | "Up" / "Down" / "Held" in words, the amount, and the comparison ("than in March") |
| Fault noted (`fault`) | The word "Fault", the rule name in words, and a flag shape |
| Rating level 1–5 | The number and the level's cue text |
| Destructive | A destructive verb naming the object ("Delete Swim 3") and the cross icon |
| Draft / Published | The word, and a dashed (Draft) or solid (Published) outline |

## Targets and density

- WCAG floor: 24 × 24 CSS px (SC 2.5.8). Nothing in Splitbook goes below it, including compact Admin rows.
- Desk pages: `button-min-target` default (≥ 44 px recommended for touch on desk pages viewed on tablets).
- Capture (Light, if someone has not switched to Deck): every control ≥ 48 px.
- Deck: `button-min-target` ≥ 56 px, `tap-key-size` ≥ 80 px, larger rating steps and Length cells.
- Admin console (`data-density="compact"`): smaller, never below 24 px; the Admin console is a desk tool.
- Spacing between adjacent live targets is at least `density-gap`, so a wet finger does not hit two keys.

## Keyboard and focus

- Every interactive element shows `--sb-ring` at `--sb-focus-ring-width` with `--sb-focus-ring-offset`, above the 2 px perimeter guidance in SC 2.4.13; the ring passes 3:1 on every surface. Focus is never hidden behind a sticky bar (SC 2.4.11 Focus Not Obscured).
- Desk pages are fully keyboard operable. The Tap Pad has keyboard parity (Space = wall tap, digit keys = counters, Backspace/`Z` = undo) for desktop and switch users; see [capture-widgets.md](../components/capture-widgets.md#keyboard-and-touch).
- Composite widgets follow the APG pattern named in their spec: tabs, radio group (rating), checkbox and switch (fault flag), menu button (Profile switcher), modal dialog, toolbar, grid (Length strip, read-only), table, listbox, disclosure.
- Overlays return focus to their trigger. Tooltips are dismissible with Escape, hoverable and persistent (SC 1.4.13), and never the only name of a control.
- Live announcements: `role="status"` for counts and splits (polite, throttled to one per Length), `role="alert"` only for blocking errors.

## Motion

- `prefers-reduced-motion: reduce` collapses every `--sb-motion-*` duration (validated). See [motion.md](motion.md).
- The running split keeps counting under reduced motion: changing digits are information, not animation.
- No flashing. Nothing flashes more than three times a second (SC 2.3.1); world signatures run once.

## Cognitive load and timing

- Live input is limited to one or two Focus metrics plus the wall tap. Everything else waits for the Review sheet.
- Nothing important leaves on a timer (SC 2.2.1): toasts stay until dismissed or replaced; the "Undo" for a deleted Swim stays until the next action.
- Jargon is explained where it appears.
- Errors say what happened and what still worked: "We couldn't save Length 4. Your taps are kept on this phone. Try again." (SC 3.3.1, 3.3.3)

## Preview requirements

The preview must show: focus on every control, Deck vs Light side by side for the Capture widgets, every non-colour cue above, target-size notes for Capture, Deck and compact, and reduced-motion behaviour.
