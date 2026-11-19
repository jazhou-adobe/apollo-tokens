# Theme and token architecture sources

## Scope

Standards and implementation sources behind Splitbook's tokens: DTCG JSON → `--sb-*` CSS variables → a Tailwind 4 `@theme` bridge, themed by `html[data-theme]`, with WCAG 2.2 gates enforced by the validator.

## Sources

| Source | Key facts | Implication for Splitbook |
|---|---|---|
| Design Tokens Community Group, **Format Module 2025.10**: https://www.designtokens.org/TR/2025.10/format/ | A token is a named record with a required `$value`; `$type` and `$description` are defined properties; aliases are first-class; tools must not infer type from group names or values. | Every token in `tokens.json` is typed and described. Role descriptions state the role's one job and its contrast gate, so agents never guess purpose from a name. |
| W3C **CSS Custom Properties Level 1**: https://www.w3.org/TR/css-variables-1/ | Custom properties cascade, inherit, can be scoped to elements and media rules, and resolve at computed-value time. | Themes override the same `--sb-*` names under one selector; Deck and compact are just more overrides. |
| W3C **Media Queries Level 5**: https://www.w3.org/TR/mediaqueries-5/ | Defines `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`, `prefers-color-scheme`. | All `--sb-motion-*` durations collapse under `prefers-reduced-motion: reduce` (validated). |
| W3C **CSS Color Adjustment Level 1**: https://www.w3.org/TR/css-color-adjust-1/ | `color-scheme` and forced colours mode. | Each theme and world sets `color-scheme`; components do not fight forced colours. |
| WCAG 2.2 **SC 1.4.3 Contrast (Minimum)**: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html | Text 4.5:1; large text 3:1; thresholds are not rounded. | Every `<role>` / `<role>-foreground` pair ≥ 4.5; ratios truncated. |
| WCAG 2.2 **SC 1.4.11 Non-text Contrast**: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html | UI component boundaries, states and meaningful graphics 3:1 against adjacent colours. | `border`, `ring`, the hands and `fault` as boundaries, and `chart-*` are gated at 3:1. |
| WCAG 2.2 **SC 1.4.1 Use of Color**: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html | Colour is never the only means of conveying information. | Ratings, faults, trends and live state all carry words, numbers or shapes. |
| WCAG 2.2 **SC 2.5.8 Target Size (Minimum)**: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | 24 × 24 CSS px floor. | No `button-min-target` (base, Deck, compact) below 24 px; Capture far above it. |
| WCAG 2.2 **SC 2.4.13 Focus Appearance** (AAA): https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html | Indicator at least a 2 CSS px perimeter with 3:1 change of contrast. | `focus-ring-width` and `focus-ring-offset` tokens; `ring` gated at 3:1 on every surface. |
| WCAG 2.2 **SC 2.4.11 Focus Not Obscured (Minimum)**: https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html | A focused component is not entirely hidden by author content. | Sticky app bars and the Deck action tray must not cover focus; layer tokens order them. |
| Tailwind CSS **Theme variables**: https://tailwindcss.com/docs/theme | v4 theme variables in namespaces (`--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--spacing-*`, `--breakpoint-*`) generate utilities; `@theme inline` for variables that reference other variables. | `tailwind-theme.css` resets defaults and maps only semantic `--sb-*` roles, so only semantic utilities exist. |
| Tailwind CSS **Dark mode**: https://tailwindcss.com/docs/dark-mode | Variants can key off a class or data attribute. | One selector contract: `html[data-theme="<theme>"]`, plus `[data-palette]` for world colour options. |
| Next.js **CSS**: https://nextjs.org/docs/app/getting-started/css | Global CSS imported at the root; ordering follows import order. | Token CSS, the bridge and component CSS import once in the root layout, in a fixed order. |
| shadcn/ui **Theming**: https://ui.shadcn.com/docs/theming | Semantic pairs (`background`/`foreground`, `card`, `primary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`). | Splitbook's base roles stay shadcn-compatible; Splitbook roles (`live`, `metric`, `improvement`, `fault`, `tap-pad`) are added beside them. |
| Style Dictionary: https://styledictionary.com/getting-started/installation/ | Transforms DTCG-shaped tokens into platform artifacts. | A later export (for the Mobile release) can read the same `tokens.json` without renaming. |

## Decisions locked

1. Three tiers: primitives (authoring only) → semantic roles (46, per the brief) → component tokens.
2. Runtime theming by CSS custom properties under `html[data-theme]`; world options under `[data-palette]` on the same element; density under `[data-density]`.
3. Deck is a theme that changes palette **and** size tokens; the validator requires its size overrides to be larger than the base.
4. Worlds override only type, shape and depth tokens.
5. Contrast is approved by pairs and boundaries, not single colours; ratios are truncated.
6. Raw values live only in `tokens/`; everything else uses `--sb-*` or semantic utilities.
7. Reduced motion collapses every duration.
