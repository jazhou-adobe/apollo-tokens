# Admin widgets

The Admin console is where Configuration is edited and published: Sports, Events, Training types, Metric definitions, Technique points and cue text, Faults, Capture templates and Formulas. It is a desk tool behind a separate password. Every Admin region sets `data-density="compact"`; targets stay ≥ 24 CSS px. Published Configuration never rewrites recorded Swims, and the UI says so where it matters.

## Configuration list — `.sb-config-list`

The index of one area of the Draft, for example Metric definitions.

- Anatomy: toolbar (search, filter by scope and input widget, "Add Metric definition"), then a `.sb-table` with columns Name, Key (`--sb-font-mono`), Input widget, Scope, Unit, Status, and a row menu.
- Status column uses `.sb-badge`: "Draft change", "Published", "Retired". Words and outline style carry the status (dashed for Draft, solid for Published).
- Retiring is an action ("Retire…" opens a dialog that explains: "Retired metrics are no longer offered for capture. Recorded Values and trends stay visible."). There is no Delete for a published Metric definition.
- Keys are stable: once published, the Key field is read-only with a hint saying why.
- States: populated, filtered to nothing ("No Metric definitions match 'kick'. Clear filters."), loading, error.

## Metric definition editor

A form panel composed from inputs (no new class): Name, Key, Input widget (select: counter, split, mark, rating, chips, number, fault, derived), Scope (radio: Length, Swim, Set, Session), Unit, Strokes and Training types it applies to (chips), allowed Value sources (checkboxes).

- **Formula preview** (derived metrics): an out-and-back pair. Left: the formula in a `.sb-textarea` set in `--sb-font-mono`, with errors inline ("Unknown metric key 'strokez'"). Right: a live preview table computing the result on sample Swims labelled "(example data)".
- **Applies to**: a radio group, "All history" or "From this version onward", with a hint stating the consequence in plain words.
- Rating cue text: one textarea per level (1–5 unless configured), shown beside a live `.sb-rating` preview.
- Faults: a rule reference field and the observer-note helper text preview; the editor refuses "DQ" or "disqualified" in labels with an inline error explaining why.

## Draft/publish bar — `.sb-publish-bar`

A tray docked to the bottom of every Admin page while a Draft exists.

- Anatomy: Draft status ("Draft: 4 changes since v12"), "Review changes", "Discard Draft…", primary "Publish…".
- Publish opens a dialog that lists changes and asks for the **reach**: which Formula changes apply to all history and which apply from this version onward, with a summary sentence ("2 changes apply from v13 onward. Recorded Swims are never rewritten."). The publish button names the result: "Publish v13".
- States: no Draft (bar hidden; Config list shows "Start a Draft"), Draft with changes, publishing (`aria-busy`, "Publishing v13…"), published (toast "Published v13." with "View version"), failed (alert in the dialog, Draft unchanged).
- Tokens: `surface-tray` / `surface-tray-foreground`, `border`, `primary`, `destructive` for Discard.
- Never a side stripe for Draft state; the word and the dashed outline carry it.

## Configuration version history

A `.sb-table` of versions: Version, Published (date), Changes (count, link to the diff), Reach summary. Rows open a read-only view with a then ↔ now pair for each changed definition.

## Agent recipe

1. Wrap the Admin console in `data-density="compact"`.
2. Index → editor → publish bar; one Draft at a time.
3. Never offer Delete for published definitions; offer Retire.
4. State the history consequence of every publish and Formula change in words.
