# Typography and numerals

Splitbook type does two jobs: plain reading text for watchers and admins, and big **tabular numerals** that can be read at a glance on a wet phone in glare. Material, GOV.UK and Atlassian treat typography as a foundation with its own tokens for family, size, weight and line height ([mature-design-system-references.md §4](../research/mature-design-system-references.md#4-typography-and-numerals)). Values live in [`tokens/tokens.json`](../tokens/tokens.json) → `typography`; this page explains how to use them.

## Families

Every face is self-hosted through `next/font` in `app/fonts.ts` and exposed on `<html>` as a `--font-<family>` variable; the tokens never rely on a face being installed locally.

| Role | Token | Use |
|---|---|---|
| Display and numerals | `--sb-font-display` | Schibsted Grotesk 700 and 800: page titles, panel headings and every numeral role. It ships tabular figures |
| Reading text and labels | `--sb-font-sans` | Atkinson Hyperlegible Next 400 and 700: body, labels, controls, cue text, feedback. A family designed for low-vision legibility |
| Technical | `--sb-font-mono` | Atkinson Hyperlegible Mono 400 and 700: metric keys, formula source, Configuration version IDs in the Admin console (the `code` text style) |

Only these weights are fetched, so the browser never synthesises one. The values live in `tokens.json` → `primitive.font` and `app/fonts.ts`; this page names roles, so a face swap is a token change. Light and Deck use the same faces. Worlds may override families (type, shape and depth are the only things a world may change).

## Text scale

Each row is a DTCG `typography` token exported as `--sb-type-<token>-size`, `-line-height`, `-weight` and `-family`, and as a Tailwind `text-<token>` utility.

| Token | Family | Use |
|---|---|---|
| `display` | display | Preview headers only |
| `heading-lg` | display | Page titles ("Maya's Session, 14 Nov") |
| `heading-md` | display | Panel and section headings |
| `body-lg` | sans | Lead sentences, trend findings |
| `body` | sans | General UI text. Deck raises `type-body-size`; compact density lowers it |
| `body-sm` | sans | Admin supporting text, captions, cue text under a rating step |
| `label` | sans | Form labels, chip text, status words on badges and fault flags |
| `code` | mono | Metric keys and formula source in the Admin console |

## Numeral scale

The numeral scale is separate from the text scale and always uses tabular, lining figures (`font-variant-numeric: tabular-nums lining-nums`), so a running split does not shift sideways as digits change and columns of splits align.

| Token | Use | Knob |
|---|---|---|
| `numeral-xl` | The Tap Pad's running split and the live Focus-metric count | Deck raises `type-numeral-xl-size` |
| `numeral-lg` | Swim summary values (strokes per Length, total time), the centre of a trend dial | — |
| `numeral-md` | Length strip cells, table cells with values, the secondary number in a pair | — |

Rules:

- One `numeral-xl` per screen region. The Tap Pad shows at most two (split and one count) when there are two Focus metrics; the second steps down to `numeral-lg`.
- A numeral has its unit and label in words close by. Abbreviated units (`s`, `m`) are `aria-hidden` with the full word in visually hidden text, so "32.4 s" reads as "32.4 seconds".
- Times format as `m:ss.d` from 60 seconds up and `ss.d` below; never drop the unit in a sentence.
- Use the true minus sign (U+2212) for negative differences, not a hyphen.
- Numerals take `foreground` (ink) by default. `metric` colours a captured value only where it is the Focus metric; `live` colours the running split only while recording; `improvement` colours a gain only next to its words.

## Glyph test

Glance reading fails on confusable glyphs. A face is fit for a numeral role only if, at `numeral-md` size:

- `1`, `l` and `I` are distinct; `0` and `O` are distinct.
- `3`, `5`, `6`, `8` and `9` stay distinct when slightly blurred (glare, water droplets).
- All digits share one advance width (tabular).
- The colon and decimal point are heavy enough to read at arm's length.

Run the preview's numeral specimen in every theme and world when a family changes.

## Density

| Density | Where | Treatment |
|---|---|---|
| Light default | Desk pages | Default `density-*`, `type-body-size` |
| Deck | Capture screens | Larger body and `numeral-xl`, roomier `density-inset` / `density-gap` |
| Compact | Admin console (`data-density="compact"`) | Smaller body, tighter rows; targets stay ≥ 24 CSS px |

## Copy rules for type

- Sentence case everywhere. No all-caps eyebrows on reading surfaces; worlds may use uppercase stencil labels for short status words only.
- Explain jargon where it appears: "SWOLF (seconds plus strokes for one Length; lower is more efficient)".
- No exclamation marks.
