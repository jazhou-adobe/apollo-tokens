---
name: apply-apollo-theme
description: Use when applying, switching, or setting the default design-system theme of an Apollo brand (Splitbook or Hermes Hub) in a new or existing sub-application - a core theme such as splitbook-light, splitbook-deck, hermes-dark or hermes-light, or a brand world such as Approach Lights or Flight Director 2169, optionally with a colour option - by copying the brand's design system (tokens, fonts, component CSS, specs, agent contract) from its master repo.
tags: [apollo, splitbook, hermes, design-system, theme, tokens, nextjs]
---

# Apply an Apollo brand theme

Repository-local skill. Input: a **brand**, optionally a **theme** and a world **colour option**. Output: a Next.js 16 / React 19 / Tailwind 4 app that renders in that theme using design-system files copied from the brand's design folder in this repo. The design system is shared by copying, never by package or git dependency.

Brands are registered in `preview-hub/brands.json` (slug, label, design folder, token prefix, default theme):

| Brand | Design folder | Tokens | Core themes | World (default for new apps) | Colour options | Densities |
|---|---|---|---|---|---|---|
| `splitbook` | `brands/splitbook/design` | `--sb-*` | `splitbook-light`, `splitbook-deck` | `splitbook-approach-lights` (Approach Lights) | default Deck Daylight; `blue-hour`, `fresnel-sand`, `original` (Sodium Night) | `deck` (Capture sizing), `compact` (Admin console) |
| `hermes` | `brands/hermes/design` | `--hh-*` | `hermes-dark`, `hermes-light` | `hermes-flight-director` (Flight Director 2169) | default Console slate; `night-watch`, `day-shift`, `original` | `compact` (dense triage), `glance` (phone) |

The table is a summary; the manifest script reads the brand's files directly and is the source of truth.

## 1. Resolve the theme

```bash
node .skills/apply-apollo-theme/scripts/theme-manifest.mjs <brand> [theme] [colour-option]
```

- `<brand>` is a slug or label (`splitbook`, `"Hermes Hub"`).
- `[theme]` accepts a short core name (`light`, `deck`, `dark`), a world slug (`approach-lights`), a world label (`"Flight Director 2169"`), or the full value (`hermes-light`). Omit it to use the brand's default, the world the owner chose (`defaultTheme` in `brands.json`).
- An unknown brand, theme or colour option exits 1 and lists the valid values; show them to the user and stop.

The JSON output gives `htmlAttributes`, `colorScheme`, `densities`, `tokenPrefix`, `componentsCss`, `copy` (paths relative to the brand's design folder), and `fonts` (imports, the exact `next/font` calls, their names, and the CSS variables they set). Use it as the single source; don't hand-pick files or fonts.

## 2. Copy the files into the target app

1. Copy every path in `copy` from the brand's design folder into one folder of the target app, keeping the relative layout, for example `<app>/design-system/tokens/themes.css`. Never copy `preview/*-preview.css`, `app/`, `research/`, `archive/` or `validation/`; they belong to the preview and the master repo.
2. Copy React components only as the screens need them, from `preview/components/` (Hermes domain widgets are in `preview/components/hermes/`). Their data types live in `preview/fixtures.ts` next to sample data: copy only the type declarations and helpers the components import (for example Hermes `Round`, `Question`, `STATUS_WORD`, `agentById`) into the app's own module, never the sample arrays, and pass data as props. A brand that ships `preview/<brand>-icons.json` (Hermes) lists it in `copy`: it is the icon set (name → SVG path); draw it with the components stylesheet's `.hh-icon` class.
3. Write `<app>/design-system/SOURCE.md` with the brand, the master-repo commit (`git -C <brand-master> rev-parse HEAD`), the theme value and colour option. Copied files are read-only in the app; changes go to the master repo first.
4. Replacing a theme in an app that already has one: remove the old `tokens/worlds/<slug>.css`/`.json` and fonts no longer listed before adding the new ones.

## 3. Wire it

- **Global CSS**, in this order (from the brand's `app/globals.css`):
  ```css
  @import 'tailwindcss';
  @import '../design-system/tokens/themes.css';
  @import '../design-system/tokens/tailwind-theme.css';
  @import '../design-system/<componentsCss>' layer(components);
  /* world only, unlayered so its skin wins: */ @import '../design-system/tokens/worlds/<slug>.css';
  ```
  Then copy the `@layer base` rules from the brand's `app/globals.css` (background, foreground and body type tokens). Leave out the `*-preview.css` import. Hermes's preview inlines world CSS from `app/layout.tsx` only so `next dev` picks up edits without a restart; an app imports it as above.
- **Fonts**: create `app/fonts.ts` with `fonts.imports` and `fonts.calls` verbatim. Keep every `variable` name exactly; tokens reference them. Calls with a `src` (self-hosted variable fonts) are relative to `app/fonts.ts`, so repoint them at the copied file: with the layout above, `'./fonts/X.woff2'` becomes `'../design-system/app/fonts/X.woff2'`. Export the joined class names, for example `export const fontVariables = [<fonts.names>].map((font) => font.variable).join(' ');`.
- **Root layout**: put the font classes and every key of `htmlAttributes` on `<html>`, for example `<html lang="en" data-theme="hermes-flight-director" className={fontVariables}>`. A fixed theme needs no pre-paint script; add one (pattern in the brand's `app/layout.tsx`) only if users can switch themes or colour options.
- **Density** (`data-density` on `<html>` or a section; the default is no attribute):
  - Splitbook: `deck` on Capture screens used poolside (the Deck size knob, any theme); `compact` on the Admin console only. Never `compact` on watcher screens.
  - Hermes: `compact` for dense triage on desktop; `glance` on the phone surface (thumb-sized targets). The phone queue applies glance itself unless the page sets a density.
- **AGENTS.md** in the target app: point agents at the copied `agent-contract/screen-generation-rules.md`, `components/`, `patterns/` and `foundations/`, and name the brand, theme and colour option. `next dev` writes its own `<!-- BEGIN:nextjs-agent-rules -->` block into `AGENTS.md` and re-adds it if removed; keep that block and add the brand section after it.
- **Next.js version**: use the latest Next 16 patch (the brand repos pin 16.4.6 as of 2026-11-20; 16.4.1 has a published security advisory). If `next dev` or `next build` stops with a security notice, run `npx next upgrade --agent=security` in the app rather than retrying past it.

## 4. Motion

Motion is system-wide: no theme or world changes it. Durations and curves are tokens in `themes.css` (`--<prefix>-motion-*`, `--<prefix>-easing-*`), and the component recipes and keyframes are already in the components stylesheet. Rules are in the copied `foundations/motion.md`.

- Use only the motion tokens; never a hand-written `ms`/`s` value. Reduced motion collapses every `--<prefix>-motion-*` token, so anything that doesn't use them ignores it.
- Each world has one signature tied to an outcome (Approach Lights: the current Length bulb lights on a Wall tap; Flight Director: GO / NO-GO polling on approve/reject). It runs once, collapses under reduced motion, and never carries meaning alone. Don't add other decorative motion.
- Put `var(--<prefix>-easing-*)` on the element's `animation` or `transition`, never inside `@keyframes`; Chrome ignores it there.

## 5. Verify

1. `npx tsc --noEmit` and `npm run build` in the target app.
2. Open a page at 1440 px and 390 px. `document.documentElement.dataset.theme` equals the manifest `theme`, `dataset.palette` matches the colour option (absent for the default), and `getComputedStyle(document.documentElement).colorScheme` equals `colorScheme`.
3. Every variable in `fonts.variables` resolves on `<html>` (`getComputedStyle(document.documentElement).getPropertyValue('--font-archivo')` is non-empty).
4. axe (WCAG 2.2 AA) reports 0 violations, and `document.documentElement.scrollWidth` equals the viewport width at 390 px.
5. `getComputedStyle(document.documentElement).getPropertyValue('--<prefix>-motion-panel')` is 240 ms (Chrome reports `.24s`); with reduced motion emulated it is `1ms`, and each animated screen still shows its end state and status text.

Report the brand, theme, colour option, source commit, files copied, and the check results.

## Failure modes

- **Wrong faces render**: a font `variable` was renamed, its class is missing from `<html>`, or a self-hosted `src` still points at `./fonts/`.
- **Theme ignored**: `data-theme` is on `<body>` instead of `<html>`, or `themes.css` or the world stylesheet was imported inside a layer (both must stay unlayered).
- **World skin loses to components**: the components stylesheet was imported without `layer(components)`, so it outranks the unlayered world rules.
- **Utility classes missing**: Tailwind 3 in the target app; the bridge in `tailwind-theme.css` requires Tailwind 4.
- **Unknown palette**: colour options exist only for worlds; core themes take none.
- **Splitbook Deck theme vs Deck sizing**: `splitbook-deck` is a theme (glare colours plus Deck sizes); `data-density="deck"` is only the size knob and works with any theme. Don't confuse them.
- **Preview look leaks in**: `*-preview.css` or preview shell components (`PreviewShell`, `ThemeSwitcher`, `WorldCard`, `OverviewGrid`) were copied; they are preview-only.
