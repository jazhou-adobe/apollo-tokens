# Theme and token architecture sources

## Scope

Sources behind the Hermes token architecture: design-token format, CSS custom-property theming, user-preference media features, the WCAG 2.2 criteria that become gates, and the Tailwind 4 bridge. The tokens must work in two hosts: the Next.js 16 / React 19 preview on port 3300, and the Hub's own framework-free UI served by Bun. That is why the runtime contract is plain `--hh-*` CSS variables, with Tailwind as an optional layer on top.

## Primary sources

| Source | Key facts | Implication for Hermes |
|---|---|---|
| DTCG **Design Tokens Format Module 2025.10**: https://www.designtokens.org/TR/2025.10/format/ | A token is a named value record; `$value` is required; `$type` and `$description` are defined properties; groups do not imply type; aliases are first-class; tools must not infer type from values. | `tokens.json` is DTCG-shaped: every token typed and described, semantic roles aliased to primitives, so agents never guess a token's purpose from its group. |
| W3C **CSS Custom Properties Level 1**: https://www.w3.org/TR/css-variables-1/ | Custom properties cascade, inherit, can be scoped to elements and media rules, are read with `var()`; cycles are invalid at computed-value time. | Themes override the same `--hh-*` names on `html[data-theme]`; density overrides on any element with `data-density`; works in any host, no build step required. |
| W3C **Media Queries Level 5**: https://www.w3.org/TR/mediaqueries-5/ | Defines `prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme`, `forced-colors`. | `prefers-reduced-motion: reduce` collapses every `--hh-motion-*` duration; `hermes-dark` is the default regardless of system scheme, by owner decision. |
| W3C **CSS Color Adjustment Level 1**: https://www.w3.org/TR/css-color-adjust-1/ | `color-scheme` aligns UA controls and scrollbars with the theme; forced colors mode enforces a user palette. | Each theme and world colour option sets `color-scheme`. Holder status survives forced colours because the status word is text. |
| **WCAG 2.2 SC 1.4.3** Contrast (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html | Text ≥ 4.5:1; large text ≥ 3:1; thresholds are not rounded. | Every `<role>`/`<role>-foreground` pair, `code-foreground` on `diff-add`/`diff-remove`, and `muted-foreground` on surfaces ≥ 4.5:1, truncated. |
| **WCAG 2.2 SC 1.4.11** Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html | UI component boundaries, states, focus indicators and meaningful graphics ≥ 3:1 against adjacent colours. | `border`, `ring`, holder colours against `strip` and `background`, `agent-*` and `chart-*` against surfaces ≥ 3:1. |
| **WCAG 2.2 SC 1.4.1** Use of Color: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html | Colour cannot be the only means of conveying information. | Holder status always has its word; callsigns always have text; diff lines have gutter signs. |
| **WCAG 2.2 SC 2.5.8** Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html | Pointer targets ≥ 24 × 24 CSS px, with spacing and other exceptions. | `button-min-target` ≥ 24 CSS px in compact density (validated); glance raises it to ≥ 3rem. |
| **WCAG 2.2 SC 2.4.13** Focus Appearance (AAA): https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html | Guidance: indicator at least a 2 CSS px perimeter with 3:1 change of contrast. | `focus-ring-width` and `focus-ring-offset` tokens exceed it; `ring` passes 3:1 on every surface. |
| **WCAG 2.2 SC 2.4.11** Focus Not Obscured (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html | The focused component is not entirely hidden by author-created content. | The sticky app bar and Answer bar never cover the focused strip or Question (`scroll-padding`). |
| **WCAG 2.2 SC 2.1.4** Character Key Shortcuts: https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html | Single-character shortcuts must be able to be turned off, remapped, or be active only when the component has focus. | `j`/`k`, `1`–`9`, `a`/`r` are active only while the bay or open Round has focus, and a switch turns them off. |
| **WCAG 2.2 SC 2.2.1** Timing Adjustable: https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html | Time limits must be adjustable, with exceptions including real-time events. | The Unanswered Policy is the Agent's real-time constraint; Hermes compensates by showing the policy, warning at thresholds and never sending the Human's draft. |
| **WCAG 2.2 SC 4.1.3** Status Messages: https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html | Status messages must be programmatically determinable without receiving focus. | Bay status region, connection region and Answer bar alerts. |
| **WCAG 2.2 SC 2.3.3** Animation from Interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html | Motion triggered by interaction can be disabled unless essential. | Reduced motion collapses all motion tokens; world signatures do not run. |
| **WCAG 2.2 SC 2.3.1** Three Flashes or Below Threshold: https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html | No content flashes more than three times per second. | Pending and connection lamps hold steady; nothing blinks. |
| **WAI-ARIA 1.2** `aria-keyshortcuts`: https://www.w3.org/TR/wai-aria-1.2/#aria-keyshortcuts | Declares the keyboard shortcuts an author implemented for an element. | Every control with a shortcut declares it, beside the visible `.hh-kbd` hint. |
| **Tailwind CSS v4 theme variables**: https://tailwindcss.com/docs/theme | Theme variables in namespaces (`--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, `--spacing-*`, `--breakpoint-*`) generate utilities; `@theme inline` is for variables that reference other variables. | `tailwind-theme.css` resets defaults and maps `--hh-*` with `@theme inline`, so only semantic utilities exist. The Bun-served UI can ignore it and use the variables directly. |
| **Tailwind dark mode**: https://tailwindcss.com/docs/dark-mode | The `dark` variant can be bound to a class or data-attribute selector. | One selector contract, `html[data-theme]`, in preview and Hub alike. |
| **Next.js App Router CSS**: https://nextjs.org/docs/app/getting-started/css | Global CSS imported at the root; production CSS order follows import order. | The preview imports Tailwind, `themes.css`, `tailwind-theme.css`, component CSS and world CSS in one root stylesheet. |
| **shadcn/ui theming**: https://ui.shadcn.com/docs/theming | CSS-variable roles in background/foreground pairs (`card`, `primary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-*`). | Hermes base roles keep shadcn-compatible names so familiar utilities (`bg-primary`, `border-border`) work. |

## Decisions locked for Hermes

1. **Runtime contract is CSS variables**, prefix `--hh-`, lowercase kebab-case ASCII.
2. **Selectors**: `html[data-theme="<theme>"]`; world colour options on `[data-palette="<id>"]` of the same element; density on `[data-density="compact"|"glance"]` anywhere.
3. **58 colour roles** in every theme and world colour option: shadcn-compatible base roles, status roles, Hermes roles (`strip`, `pending`, `answered`, `expired`, `recommended`, `live`, `code`, `diff-add`, `diff-remove`), `agent-1` … `agent-6`, `shadow`, `scrim`, `chart-1` … `chart-5`.
4. **Gates are pairs, not swatches**, measured by the validator, truncated, never rounded up.
5. **Component tokens are contracts**: strip, holder, timer track, callsign chip, option row, key hint, overlay widths, code max height, motion contracts.
6. **Worlds override only type, shape and depth.** Motion, density, spacing, layout and component sizes are system-wide.
7. **Raw values only in `tokens/`.** Everything else uses tokens.

## Flexible choices

- Exact primitive values and palette steps.
- Exact faces, as long as the glyph test passes.
- Whether a token export pipeline (for example Style Dictionary, https://styledictionary.com/) is added later; DTCG shape keeps that path open.
