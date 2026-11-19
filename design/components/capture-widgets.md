# Capture widgets

The widgets used at the pool: the **Tap Pad** during a Swim and the **Review sheet** straight after, with the Length strip, split read-out, rating and fault flag they are built from. Every Capture screen sets `data-theme="splitbook-deck"`; sizes below grow with the Deck knob. Read [accessibility.md](../foundations/accessibility.md#poolside-conditions) first: these widgets exist to satisfy those rules.

Shared poolside rules:

- One hand, wet fingers, glare. Targets ≥ 48 px in Light, ≥ 56 px in Deck; Tap Pad keys at `--sb-tap-key-size` (≥ 5rem in Deck).
- Activation on pointer release; a finger that slides off cancels. No long-press, swipe, double-tap or two-finger gestures.
- Every tap can be undone from the same screen, without a dialog.
- Nothing time-critical behind a dialog; nothing opens on its own while recording.
- The four hands do their one job: `live` = recording now, `metric` = a captured value, `improvement` never appears mid-capture.

## Tap Pad — `.sb-tap-pad`

The live capture surface: wall taps for splits and counters for one or two Focus metrics.

### Anatomy (top to bottom, Deck, phone)

1. **Head** (`.sb-tap-pad-head`): the Swim line, "Swim 3 · 100 m freestyle · Length 3 of 4" (`label` type, `tap-pad-foreground`), and the status: `.sb-live-mark` with the word "Recording" and a filled disc in `live` (`data-state="live"`), or "Ready" / "Ended".
2. **Split read-out** (`.sb-split-readout`): the running split for the current Length in `numeral-xl`; the last Length's split below in `numeral-md`.
3. **Length strip** (`.sb-length-strip`): the Lengths so far, newest last.
4. **Keys** (`.sb-tap-keys`), in thumb reach at the bottom. Each is a `.sb-tap-key` at least `--sb-tap-key-size` square with its words in `.sb-tap-key-label`:
   - Focus-metric counters (1 or 2), `data-kind="counter"`: the metric's name in words and the current count in `numeral-lg`, both in `metric`.
   - The Wall key, `data-kind="wall"`: the widest key, "Wall". While recording it is the one key filled with `live` / `live-foreground`.
5. **Undo tray** (`.sb-tray`): "Undo wall tap" and one "Undo" per counter, each naming what it will undo ("Undo stroke, back to 13").
6. **Tap log** (`.sb-tap-log`): the last few taps in words ("Length 3 · wall · 32.4 s"), so a missed or doubled tap is visible before it is undone.

End Swim lives in the slim app bar at the top, away from the thumb, so a reach for the Wall key cannot end the Swim. It needs no dialog: ending switches the Tap Pad to **Ended** with "Resume" (undoes the end) and "Review this Swim".

With two Focus metrics the counters sit side by side above the Wall key; with one, the counter spans the width. Keys never move, resize or reflow while recording.

### Tokens

`tap-pad` / `tap-pad-foreground` (surface), `live` / `live-foreground` (wall key and status while recording), `metric` / `metric-foreground` (counter labels and counts), `border`, `ring`, `--sb-tap-key-size`, `--sb-button-min-target`, `--sb-type-numeral-xl-size`, `--sb-density-gap` between keys, `--sb-motion-flash` for the one-shot tap flash.

### States

| State | Shows | Non-colour cue |
|---|---|---|
| Ready (no `data-state`) | "Start" in the Wall key position; counters disabled with "Starts with the Swim" | Words |
| Recording (`data-state="live"`) | Running split, live Wall key, enabled counters | "Recording", the moving split, record disc |
| Ended (no `data-state`) | Final split and counts, "Resume", "Review this Swim" | "Ended" in the head |
| Saving offline | Status line "Saved on this phone. Will sync when you're back online." | Words and a cloud-off icon |

Undo is available while recording and after ending. When a tap lands, that key gets `data-flash="true"` for one `--sb-live` outline flash on `--sb-motion-flash`; it never loops, and the changed number and the tap log carry the meaning.

### Undo and Capture events

Every tap is a Capture event, timed in milliseconds from the start of the Swim. Undo supersedes the last event of that counter (or the last wall tap); it never deletes it. Undo is per counter, one step at a time, as often as needed. The status line confirms what changed: "Undid stroke. Strokes, Length 3: 13."

### Keyboard and touch

The Tap Pad is a set of ordinary buttons (APG [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)) inside a labelled `role="group"`; on desktop it also listens for shortcuts while it has focus, shown with `.sb-kbd`.

| Action | Touch | Keyboard |
|---|---|---|
| Start / wall tap | Wall key | Space |
| Counter 1 / 2 | Counter key | `1` / `2` |
| Undo last wall tap | Undo wall tap | Backspace |
| Undo counter 1 / 2 | Undo on that counter | Shift + `1` / Shift + `2` |
| End Swim | End Swim (app bar) | Tab to End Swim, then Enter |

- Accessible names state the action and current value: "Add stroke, now 13".
- One `role="status"` region announces once per Length, not every tap: "Length 3: 32.4 seconds, 14 strokes."
- The running split is `role="timer"` (not announced each tick).

## Split read-out — `.sb-split-readout`

The running split and recent splits.

- `.sb-split-readout-value` holds the running split in `numeral-xl` (Deck raises `type-numeral-xl-size`); `.sb-split-readout-caption` holds the words and the last split in `numeral-md`.
- Format `ss.d` under a minute, `m:ss.d` above; tabular figures so digits do not jitter.
- While recording (`data-state="live"`), the running split is `live`; after the Swim it returns to `foreground`.
- Counts outside the Tap Pad use `.sb-numeral` with `data-size="xl|lg"` and `data-tone="metric"`, beside the metric's name in words.

## Length strip — `.sb-length-strip`

One cell per Length, at `--sb-length-cell-size`, on the out-and-back axis.

- Anatomy: an ordered list of `.sb-length-cell`s; each shows the Length number (`.sb-length-cell-number`), a direction arrow (out → / back ←, mirroring the pool) and the value, split or count, in `numeral-md` (`.sb-length-cell-value`).
- States per cell: captured (no attribute); current (`data-state="current"`, `aria-current="true"`, `live` boundary and "Now" while recording); upcoming (`data-state="upcoming"`, dashed, the Lengths still to swim in the Event); corrected (the word "Corrected" beside the value); missing ("No tap" in words).
- On the Tap Pad the cells are read-only list items. On the Review sheet each cell is a `button.sb-length-cell` with `aria-pressed="true"` while its inline editor is open (not a dialog); arrow keys move between cells as a [toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).
- Accessible text per cell: "Length 3, back, 32.4 seconds, 14 strokes, corrected."
- Long Swims wrap to new rows; the strip never scrolls sideways.

## Rating — `.sb-rating`

A 1–5 rating of a Technique point, with cue text for each level.

- Anatomy: the Technique point name and a toggletip explaining it; `.sb-rating-steps` holding five `.sb-rating-step`s at `--sb-rating-step-size`, each a native radio input with its number and its cue text in words in `.sb-rating-cue` (for example, head position: 1 "Head lifted, hips sink" … 5 "Neutral spine, waterline at hairline"; cues come from Configuration).
- Pattern: [APG Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), built on native radios in a `fieldset` with a `legend`. Arrow keys move and select; the group is one tab stop.
- Selected step (`:checked`): ink (`foreground`) fill with `background` numeral, a check icon and bold cue text. Unselected: `surface-card` with `border`. The number and cue carry the level, never colour.
- States: unrated ("Not rated" in words; allowed), rated, previously rated (the last Session's rating shown as "Last time: 3" beside it, not pre-selected).
- In Deck, steps stack vertically on phones so each step's cue text is readable and the target is full width.

## Fault flag — `.sb-fault-flag`

Records one Fault as **an observer's note**, never an official call.

- Anatomy: a toggle button (`aria-pressed`) with a flag icon and the fault's plain name: "One-hand touch at the turn (breaststroke)"; a toggletip "Rule" that gives the World Aquatics rule reference in words; optional Length scope.
- On (`aria-pressed="true"`, and `data-state="noted"` when shown read-only in Swim detail): `fault` boundary and flag fill, the word "Noted", and the flag icon filled. Off: outline flag, `border`. The words and the filled flag carry the state.
- Helper text on the Faults section, once: "Faults are your notes of what you saw. They are not an official call."
- Never write "DQ", "disqualified", "illegal" or "violation". Never use `destructive` for a fault.
- Faults are captured on the Review sheet. On the Tap Pad a fault can only be a Focus metric, as a counter labelled with the fault's name.

## Review sheet — `.sb-review-sheet`

The surface completed right after a Swim. It is a page panel, not an overlay, so it cannot be dismissed by accident.

- Composition: an out-and-back pair. On tablets and wider, the Swim summary (Tap Pad result: splits, counts, Length strip) sits on the left, the Review form on the right, either side of the axis. On phones the summary is a compact header above the form.
- Sections (each a `.sb-review-section`), in this order: **Lengths** (editable Length strip, correct counts and splits), **Technique** (ratings for the Capture template's Technique points), **Faults** (fault flags), **Context** (chips: equipment, start type; RPE; notes).
- Every section is optional; the watcher can stop at any point. Values save as they change (to the phone first, then the server) with a status line: "Saved".
- Primary action, in thumb reach: "Done". Secondary: "Next Swim" (keeps the Session open).
- Tokens: `surface-panel`, `surface-card` for each section, `metric` for captured values, `fault` for noted Faults, `border`, `ring`.
- States: in progress, saved, saving offline ("Saved on this phone"), error (inline alert in the section that failed; other sections still save).

## Agent recipe: live Capture

1. Set `data-theme="splitbook-deck"` on the Capture route.
2. Compose `.sb-tap-pad` exactly as the anatomy above; never add controls between counters and the Wall key.
3. Wire undo per counter and per wall tap; announce once per Length.
4. No dialogs, toasts or sheets while `data-state="live"`.
5. After End Swim, go to the Review sheet; Faults and ratings live there.
