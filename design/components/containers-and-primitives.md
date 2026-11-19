# Containers and primitives

Component docs here capture parts, states, behaviour and accessibility, the dimensions Open UI and the WAI-ARIA Authoring Practices use for UI controls ([mature-design-system-references.md §5](../research/mature-design-system-references.md#5-component-anatomy-and-behavior)). Every class is `.sb-<component>`; variants use `data-variant`, sizes `data-size`, and state uses ARIA attributes or `data-state`. Token names below are the `--sb-` CSS variables generated from [`tokens/tokens.json`](../tokens/tokens.json).

Shared rules for every component:

- Tokens only: no raw hex, lengths, durations or z-index values outside `tokens/`.
- Focus: `--sb-ring` at `--sb-focus-ring-width`, offset `--sb-focus-ring-offset`.
- State is never colour alone ([accessibility.md](../foundations/accessibility.md#non-colour-state-cues)).
- No side-stripe accents: tone is carried on the whole perimeter or the whole shape, never a coloured bar on one edge.

## Card — `.sb-card`

One self-contained object: a Swimmer, a Session summary, one Metric trend.

- Anatomy: heading, optional meta line, content, optional status badge, optional action row.
- Tokens: `surface-card` / `surface-card-foreground`, `border`, `radius-*`, `elevation-*` (decorative only, coloured by `shadow`).
- Whole-card link: the heading's link stretches over the card, so the card is one tab stop. No extra attribute.
- States: default, hover (border thickens), focus-visible (ring), `aria-current="true"` when it is the selected Swimmer.
- Avoid: cards inside cards more than one level deep.

## Panel — `.sb-panel`

A major section or workspace: the Tap Pad, the Review sheet, a trend panel, the Metric definition editor.

- Anatomy: heading, optional description, content region, optional toolbar, optional footer.
- Tokens: `surface-panel` / `surface-panel-foreground`, `border`.
- Out-and-back pairs: two panels in a `.sb-pair` wrapper on a central axis; `.sb-pair-axis` draws the axis rule in `border` between them, and the pair stacks below 48rem.

## Shelf — `.sb-shelf`

A labelled collection: recent Sessions, Swimmers, Capture templates.

- Anatomy: heading, optional filter or sort control, item collection, empty state.
- Tokens: `surface-shelf` / `surface-shelf-foreground`.
- States: populated, loading (skeleton rows), empty ([data-display.md](data-display.md#empty-state--sb-empty-state)).

## Tray — `.sb-tray`

Temporary tools or actions: the Tap Pad's undo tray, a chip picker, the Draft/publish bar.

- Anatomy: label, compact action group, optional dismiss.
- Tokens: `surface-tray` / `surface-tray-foreground`, `border`.
- In Deck the action tray docks to the bottom of the viewport, inside thumb reach, above the safe-area inset; it never covers the Swimmer's current numbers.

## Button — `.sb-button`

| `data-variant` | Use |
|---|---|
| (none) or `primary` | The one main action in a region: "Start Swim", "Done", "Publish" |
| `secondary` | The alternative beside it: "Cancel", "Edit Lengths" |
| `ghost` | No fill until hover or pressed: toolbars, row actions, Close |
| `destructive` | Removes something: "Delete Swim 3". Names the object, adds the cross icon |

An action that looks like a link but acts in place is a `ghost` button; navigation is always `<a class="sb-link">`.

- Sizes (`data-size`): `sm` → `--sb-control-size-sm`; default → `--sb-button-min-target`; `lg` → `--sb-control-size-lg`. Deck raises `button-min-target` to ≥ 3.5rem, so every size grows with it; compact lowers it (never below 24 px).
- Tokens: `primary` / `primary-foreground`, `secondary` / `secondary-foreground`, `destructive` / `destructive-foreground`, `ring`.
- States: default, hover (underline as well as colour), focus-visible, pressed (`--sb-press-scale`), disabled (`aria-disabled="true"` with a reason linked by `aria-describedby`), busy (`aria-busy="true"` and "Saving…" text).
- Toggle buttons use `aria-pressed` and a fixed label, plus a check icon when pressed.
- `live` is never a button fill. The only red-hand button is the Tap Pad's wall key while recording ([capture-widgets.md](capture-widgets.md#tap-pad--sb-tap-pad)).
- Keyboard: Enter and Space activate ([APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)). Activation is on release.

## Icon button — `.sb-icon-button`

A square button at the current target size with one icon and an `aria-label` that names what it acts on ("More actions for Swim 3", "Close"). Pair with a tooltip that repeats the name. Never used for a primary Capture action; the wall tap and counters always show words.

## Alert — `.sb-alert`

An inline message in the page feedback slot.

- Tone through `data-tone`: `success`, `warning`, `destructive`, `improvement` (a gain worth calling out on a desk page, with its words); no attribute is the neutral `info` tone.
- Anatomy: `.sb-alert-mark` (the icon disc in the tone colour), `.sb-alert-body` (title, message, optional action).
- Tone is carried by a thick border in the tone colour on **every** edge and the icon disc; never a side stripe.
- Tokens: `info`, `success`, `warning`, `destructive`, `improvement` and their `-foreground` pairs; `surface-card` for the body.
- Role: `role="alert"` only for blocking errors; `role="status"` otherwise.
- Copy: what happened, what still worked, what to do. "We couldn't save this Swim. Your taps are kept on this phone. Try again."
- A Fault is **not** an alert. Use the fault flag.

## Divider — `.sb-divider`

A thin rule in `border`. `<hr>` inside a card or panel; `data-variant="axis"` is the vertical T-line between an out-and-back pair (decorative, `aria-hidden`). Prefer spacing first; never as a side stripe.

## Spinner — `.sb-spinner`

The busy icon beside visible words ("Saving Swim…"). Rotates on `--sb-easing-linear`, stops under reduced motion while the words stay. Inside a button use `aria-busy` instead. Never on the Tap Pad while recording: saving happens in the background and is reported in a status line.

## Agent recipe

1. Pick the blueprint, then the container hierarchy: panel for the workspace, cards for objects, shelves for collections, trays for temporary actions.
2. One primary button per region.
3. Use foreground pairs from the same role as the surface.
4. Add loading, empty and error states for every container that holds data.
5. Check focus, target size (Deck on Capture screens) and non-colour cues.
