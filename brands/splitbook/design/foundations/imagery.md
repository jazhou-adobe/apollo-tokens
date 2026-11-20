# Imagery

Splitbook's imagery is the data: numerals, dials, lines and the Length strip. There are no photos in the core product UI. This page covers what pictures may appear, avatars, illustration rules, alt text for trend figures, placeholders and formats.

## What may appear

| Kind | Where | Rule |
|---|---|---|
| Dials and lines | Technique trend, Metric trends | Drawn in SVG on tokens; see [trend-widgets.md](../components/trend-widgets.md) |
| Length strip and pool diagram | Swim detail, Review sheet | A schematic of Lengths on the T-line axis; numerals carry the meaning |
| Stroke icons | Chip pickers (stroke) | Simple line pictograms beside the stroke's name, never alone |
| Avatars | Profile switcher, Swimmer cards | Initials only (see below) |
| Empty-state marks | Empty states | One small line drawing on tokens; optional |

## Never

- **Photos of children.** Splitbook never asks for, uploads or shows photos of Swimmers. Many are children and the product is private by default.
- Stock pool or athlete photography, splash or water-droplet textures, lens flares.
- Medals, trophies, confetti, flames, streak icons (anti-references).
- Concentric fitness rings, or gauges with nested sweeps.
- AI sparkle imagery, gradients, glow, grain or noise in the core.
- Logos or marks of World Aquatics, federations, clubs or any other brand.

## Avatars

- **Initials** on `surface-panel` with a ring from `chart-1` … `chart-5` chosen by a stable hash of the Profile ID. The ring tells Swimmers apart and means nothing else. Sizes: `avatar-size-sm|md|lg`.
- The avatar is decorative beside the Swimmer's name (`aria-hidden`); the name is the accessible text.

## Illustration language (core)

- Flat line drawing on `border` and `foreground`, at `border-width-*` tokens, no fills except `surface-*` and the four hands used for their one job.
- Draw like the pace clock: round faces, tick marks, at most two hands (then and now). Dials are clock dials; tick marks are levels.
- A drawing that carries a number is content and needs alt text; one that does not is decorative (`alt=""` or `aria-hidden="true"`).

Worlds draw differently (lit bulbs, hazard edges, sortie rows, quilted pads, plot marks), on the same tokens and the same rules: every mark that carries meaning has a numeral or label.

## Alt text for trend figures

Describe the finding, then the numbers, then the range. The test: could a parent tell the Swimmer what changed from the alt text alone?

| Figure | Do | Don't |
|---|---|---|
| Metric trend line | "Strokes per Length, freestyle, 25 m pool: 18 in March, 15 in November (example data)." | "A blue line going down." |
| Technique trend dial | "Head position: 4 of 5 in the latest Session, up from 3." | "A dial three-quarters full." |
| Length strip | "8 Lengths. Strokes: 14, 14, 15, 15, 15, 16, 16, 17 (example data)." | "Bars." |

Every chart also has a one-sentence text summary and a data table; see [data-display.md](../components/data-display.md#table--sb-table) and [trend-widgets.md](../components/trend-widgets.md).

## Placeholders

- **Loading:** hold the final shape (`chart-height`, `dial-size`) with a `muted` block and the words "Loading Maya's trend…". The pulse runs three times and stops under reduced motion.
- **Not enough data:** a dashed panel saying what's missing and the next step: "Two Sessions with stroke counts are needed for a trend. Capture another Swim with Strokes as a Focus metric."
- Never an empty box or a broken-image icon.

## Formats

| Kind | Format |
|---|---|
| Dials, lines, strips, icons | Inline SVG on tokens (recolours with theme and world) |
| Exported trend (future) | PNG with the summary sentence in the file and in alt text |
