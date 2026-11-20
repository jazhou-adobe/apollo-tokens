# Trend and history widgets

How Splitbook shows progress and history on desk pages (Light): the **Metric trend** line, the **Technique trend** dial, and the Session row, Swim row and Set group that list what was captured. Progress is drawn as clock dials and plain lines, never concentric fitness rings ([design-language.md](../foundations/design-language.md#progress-as-dials-and-lines)).

**Better before faster.** Trends lead with counts, efficiency and technique; times appear as the result. A trend panel's first sentence is the finding in plain words.

## Metric trend — `.sb-trend-line`

One Metric over time for one Swimmer, filtered by stroke, distance and pool length (values from different pool lengths are never mixed in one line).

- Anatomy: a `.sb-figure` on `surface-card` with a `figcaption` holding the title (Metric name, stroke, pool length) and the **finding** sentence; the plot (SVG at `--sb-chart-height`) with `.sb-trend-path`, `.sb-trend-point`, `.sb-trend-axis-label` and `.sb-trend-value-label`; a `.sb-legend` when there are two series; a "Show data table" disclosure holding a `.sb-table` with the same numbers.
- Finding examples: "Strokes per Length, freestyle, 25 m: down from 18 to 15 since March." "Kicks off each wall: 3 more than in March." Jargon is explained in the caption: "DPS (distance per stroke): how far one stroke carries Maya."
- Drawing:
  - The line is `chart-1`, with a circle marker per Session and the latest value labelled directly in `numeral-md`. When the latest value is a gain, its point carries `data-gain="true"` and takes `improvement`, next to the words that say so; otherwise it stays `chart-1`.
  - When the change is a gain, the finding sentence and an "Up 3" / "Down 3" label with a direction arrow are shown; the label takes `improvement` / `improvement-foreground`. Whether "down" is a gain comes from the Metric definition (fewer strokes is better), so the words decide, never colour alone.
  - A second series (then vs now, or a target count) is `.sb-trend-path[data-series="2"]`: `chart-2`, dashed, with its own marker shape, direct label and `.sb-legend-key`.
  - Axes and gridlines in `border`; tick labels in `muted-foreground`.
  - Retired metrics still draw, with "Retired" in the title.
  - A Formula change mid-history is marked on the axis with "Formula changed in v12" when the Formula applies only from that version.
- Accessibility: the plot is `role="img"` named by the title and finding (`aria-labelledby`); every number is in the table; no hover-only data.
- States: ready; loading (skeleton at chart height, "Loading Maya's trend…"); not enough data ("Two Sessions with this metric are needed for a trend."); error (inline alert, table hidden).

## Technique trend — `.sb-trend-dial`

One Technique point's rating, drawn as a pace-clock dial, at `--sb-dial-size`.

- Anatomy: `.sb-dial-face` with five `.sb-dial-tick`s (one per level; major ticks carry `data-major="true"`), two hands and a hub: `.sb-dial-hand[data-hand="then"]` (dashed, `muted-foreground`) to the comparison rating and `.sb-dial-hand[data-hand="now"]` (solid ink, `foreground`) to the latest; `.sb-dial-hub`; the rating in `.sb-dial-number` (`numeral-lg`) with "of 5"; the Technique point name below; and a then → now line in words: "Head position: 3 in March, 4 now." A `.sb-legend` names the two hands in words.
- When the latest rating is higher than the comparison, an "Up 1" label with `improvement` sits under the dial; equal shows "Held"; lower shows "Down 1" in `foreground` with no alarm colour. The hands differ by dash and weight, not only colour.
- Dials sit in a grid, one per Technique point; never nested or concentric.
- Accessibility: `role="img"` with the name "Head position, 4 of 5, up from 3 in March". Cue text for the current level is shown below the dial.
- States: rated, not yet rated ("Not rated yet" and an empty face), loading.

## Session row — `.sb-session-row`

One Session in history.

- Anatomy: date and venue (link to the Session), pool length, number of Swims, the Focus metrics captured, and one plain finding if there is one ("Strokes per Length 15, down 1"). Time totals come last.
- Tokens: `surface-card`, `border`, `metric` for captured values, `improvement` only on a labelled gain.
- The whole row is one link; actions (Delete, Export) live in a row menu named "More actions for 14 Nov Session".

## Swim row — `.sb-swim-row`

One Swim inside a Session.

- Anatomy: Swim number, stroke · distance · training type, Focus-metric values in `numeral-md` with their names, ratings summary ("Technique 4 of 5 average"), Faults noted (count with the word "Faults noted" and the flag icon, never "DQ"), then total time.
- Corrected values show "Corrected". Values from a later Formula show the Configuration version in the Swim detail, not in the row.

## Set group — `.sb-set-group`

Groups Swims done as one block ("8 × 100 freestyle on 1:45"), formed after capture.

- Anatomy: a labelled group (`role="group"`, `aria-labelledby` the Set heading) containing Swim rows; the heading shows the Set description and a summary ("Strokes per Length held at 15–16 across all 8").
- "Group into a Set" is an action on selected Swim rows (checkboxes in a selection mode), never a drag. "Ungroup" undoes it.
- Tokens: `surface-shelf` for the group, `border` between Swims.

## Agent recipe

1. Write the finding sentence first; then pick a line (Metric) or a dial (Technique point).
2. Filter so like is compared with like (stroke, distance, pool length).
3. Use `improvement` only with its words; never colour a loss red.
4. Add the data table, a loading state and a not-enough-data state.
5. Label illustrative data "(example data)".
