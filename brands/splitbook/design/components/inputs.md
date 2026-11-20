# Inputs

Fields, choices and pickers for pre-Swim setup, the Review sheet, Account and Profile defaults, and the Admin console. All inputs sit inside a field so label, hint and error are wired the same way everywhere.

## Which one to use

| The person is… | Use |
|---|---|
| Typing a short value (Session venue, a corrected count) | Input |
| Writing notes (Review sheet notes) | Textarea |
| Picking one from a long list (pool, Event) | Select |
| Picking stroke, distance, training type | Chips (single-select) |
| Tagging observations (head-up, crossover) | Chips (multi-select) |
| Turning a setting on or off (units: metres / yards is a radio; "Show cue text" is a switch) | Switch |
| One of a few options that must all be visible | Radio group |
| Agreeing or ticking one item | Checkbox |
| Rating a Technique point 1–5 | Rating ([capture-widgets.md](capture-widgets.md#rating--sb-rating)) |
| Noting a Fault | Fault flag ([capture-widgets.md](capture-widgets.md#fault-flag--sb-fault-flag)) |

## Field — `.sb-field`

- Anatomy: label (`label` type), optional hint (`body-sm`, `muted-foreground`), control, error message.
- The control's `aria-describedby` lists the hint and, when present, the error.
- Optional fields say "(optional)"; required ones are the default and are not starred.
- Error: `aria-invalid="true"` on the control, a `destructive` border at `--sb-border-width-thick`, the cross icon and a message that names the fix: "Enter a whole number of strokes, 0 to 99." Errors appear on submit or blur, never on every keystroke (SC 3.3.1, 3.3.3).

## Input — `.sb-input` and textarea — `.sb-textarea`

- Height at least `--sb-button-min-target`; Deck raises it.
- Tokens: `input` (border), `background` (fill), `foreground`, `ring`, `muted-foreground` for placeholder (never the only label).
- Numeric fields use `inputmode="numeric"` or `"decimal"`, not `type="number"` spin boxes, so wet fingers get the right keyboard and no tiny steppers.
- States: empty, focus, filled, invalid, disabled (with a reason), read-only.
- Textarea shows a character count only when a limit exists.

## Select — `.sb-select`

Native `<select>` styled with tokens. Use for lists longer than about six options. On phones the native picker is the most reliable choice with wet hands.

## Checkbox — `.sb-checkbox`, radio — `.sb-radio`, switch — `.sb-switch`

- The box, circle or track is at least 24 px; the whole row (control + label) is the target at `button-min-target`.
- Checked state: a check mark, dot or thumb position plus the label, not colour alone.
- Switch: `role="switch"` with `aria-checked`; the label is fixed and names the setting; "On"/"Off" text beside it.
- Keyboard: Space toggles; radios move with arrows within a group ([APG Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), [APG Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), [APG Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)).
- Tokens: `input`, `primary` / `primary-foreground` for the checked fill, `ring`.

## Chip — `.sb-chip`

The picker for stroke, distance and training type in pre-Swim setup, and observation tags on the Review sheet.

- Anatomy: a group (`role="radiogroup"` for single-select, `role="group"` of toggle buttons for multi-select) with a visible group label; each chip has a word, an optional icon (stroke pictogram) and, when selected, a check icon.
- Size: at least `button-min-target` tall; chips wrap, never scroll sideways at 390 px.
- Tokens: unselected `surface-card` with `border`; selected takes a thick `foreground` (ink) boundary and check, so it passes 3:1 on every surface. The Focus-metric picker is the one exception: its selected chips take the `metric` boundary (gated at 3:1 against `surface-card`), because they name the values about to be captured. Selection is shown by the check icon, a heavier border and bold text, not colour alone.
- Keyboard: single-select follows the radio group pattern (arrows move and select); multi-select chips are buttons with `aria-pressed`.
- Pre-filled from the Capture template and Profile defaults, so most Swims need no chip taps.

## Keyboard shortcut hint — `.sb-kbd`

Shows a key in Tap Pad help on desktop ("Space: wall tap"). `<kbd>` on `muted` with `border`. Never the only way to learn an action.

## Copy

- Labels are nouns: "Pool length", "Strokes", "Notes".
- Hints explain units and jargon: "DPS: distance per stroke, in metres."
- Errors say how to fix it, never "Invalid".

## Agent recipe

1. Wrap every control in `.sb-field` with a visible label.
2. Prefer chips for stroke, distance and training type; select for long lists.
3. Use `inputmode` for numbers; never spin boxes.
4. Validate on submit or blur; name the fix.
5. On Capture screens, check sizes in Deck.
