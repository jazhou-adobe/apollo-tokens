# Data display

Tables, list rows, badges, progress, avatars, skeletons and empty states: the components that summarise records on desk pages and in the Admin console. Splitbook-specific history rows (Session row, Swim row, Set group) and trend figures are in [trend-widgets.md](trend-widgets.md).

Rules: tokens only; state never by colour alone; numbers in tabular numerals; compact density only inside the Admin console.

## Table — `.sb-table`

Splits per Length, Values in a Swim, Configuration versions, Metric definitions.

- Anatomy: `<table>` with a `<caption>` (visible, or visually hidden when the heading above says the same), `<thead>` with `scope="col"`, row headers with `scope="row"` where a row names a thing (Length 1, Length 2).
- Numbers are right-aligned in `numeral-md` tabular figures with the unit in the column header ("Split (s)").
- Tokens: `surface-card`, `border` for rules, `muted` for the header row, `muted-foreground` for secondary text.
- Wide tables sit in a focusable scroll region with `role="region"`, `aria-label` and `tabindex="0"`; the page itself never scrolls sideways at 390 px.
- A value that differs from the live tap (corrected on the Review sheet) shows "Corrected" in words beside it.
- Sortable headers are buttons with `aria-sort` ([APG Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/)).
- Every trend chart has a table with the same numbers.

## List row — `.sb-list-row`

A generic row in a list: Account defaults, Capture templates, notification-free activity lists.

- Anatomy: leading icon or avatar, primary text, secondary text, trailing value or action.
- The whole row is one link when it opens something; trailing actions are separate buttons with their own names.
- Height at least `button-min-target`.

## Badge — `.sb-badge`

A short status word with an icon: "Draft", "Published", "Retired", "Corrected", "Illustrative", "Recording", "2 Faults noted".

- Tone through `data-tone`, each kept to its role's one job: `outline` (Draft and other unsettled states), `info`, `success` (Published, Saved), `warning`, `live` ("Recording" only), `metric` ("Focus metric"), `improvement` ("Up 3", with its words), `fault` (a count of noted Faults on a Swim row). No attribute is the neutral badge.
- Always a word plus an icon; never colour alone.
- Never "PB", "Streak", "Level up" or reward badges (anti-references).
- Recording a Fault is the fault flag's job; a `fault` badge only summarises Faults already noted.

## Progress — `.sb-progress`

Progress through a known task: Lengths completed of the Event's total, a Configuration publish in progress.

- `role="progressbar"` with `aria-valuenow`, `aria-valuemax` and `aria-valuetext` in words ("Length 5 of 8").
- Track `muted`, fill `foreground` (ink), height `--sb-progress-track-height`. The numerals beside it carry the value; the fill is never the only cue.
- Progress over **time** is a trend line or dial, never a progress bar or ring.

## Avatar — `.sb-avatar`

Initials on `surface-panel` with a ring from `chart-1` … `chart-5` by a stable hash. Sizes `data-size="sm|md|lg"` → `--sb-avatar-size-sm|md|lg`. Decorative beside the name (`aria-hidden`). No photos ([imagery.md](../foundations/imagery.md#avatars)).

## Skeleton — `.sb-skeleton`

Loading placeholder in the final layout's shape on `muted`. The region has `aria-busy="true"` and a visible text label ("Loading Sessions…"). The pulse runs three times on `--sb-motion-pulse` and stops under reduced motion.

## Empty state — `.sb-empty-state`

- Anatomy: optional line mark, heading saying what is missing, one sentence on why it matters, one action.
- Dashed `border` on `surface-card`.
- Copy examples:
  - No Swimmers: "Add a Swimmer to start capturing Swims." Action: "Add a Swimmer".
  - No Sessions: "No Sessions yet for Maya. Start one at the pool." Action: "Start a Session".
  - Not enough for a trend: "Two Sessions with stroke counts are needed for a trend."
  - Admin, no Draft: "No Draft. Published Configuration v12 is live." Action: "Start a Draft".

## Agent recipe

1. Every number has a label and unit; tables carry the numbers behind every chart.
2. Badges are words with icons; no reward badges.
3. Show loading (skeleton), empty (empty state) and error (alert) for every data region.
4. Label illustrative data "(example data)".
