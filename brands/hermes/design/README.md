# Hermes Hub design system

The brand master for Hermes Hub, the local human-in-the-loop Command Center where many Agents send Rounds and one Human answers them. This folder holds the tokens, themes, density modes, world contract, docs, a live preview, and the validator that gates them. [brief.md](brief.md) is the contract; where an artifact and the brief disagree, the brief wins.

Direction: **Flight Strips, carrier ops-room edition**, in a used-future style. Each Round is a paper strip in a holder whose colour gives its status, always with the status word. Each Agent is a callsign chip. Live values sit in mono tabular numerals, and only live state glows.

## Preview

```sh
npm install
npm run dev          # http://localhost:3300/hermes/design
```

The app runs under the Next.js basePath `/hermes` (set once in `next.config.mjs`), so the apollo-tokens hub can serve both brand previews from one server: standalone at `http://localhost:3300/hermes/design`, through the hub at `http://localhost:3000/hermes/design`. Routes below are relative to `/hermes`. Internal links go through `withBase()` in `preview/paths.ts`.

| Route | What it shows |
|---|---|
| `/design` | Everything, with a sidebar index: colour roles with live contrast readouts, type, spacing, radius, elevation, density comparison, core components, domain widgets (a working strip bay), Command Center, phone, and system blueprints, and the agent recipe. |
| `/worlds` | The world gallery, one live `/specimen` frame per world and colour option. Empty until a world is registered. |
| `/overview` | Every theme on one screen, as live `/tile` thumbnails. |
| `/specimen` | One compact triage screen: the frame every world is judged in. |
| `/tile` | The thumbnail composition `/overview` scales. |

Every route takes `?theme=<value>`, `?palette=<id>` (world colour options), and `?density=compact|glance`. These preview without saving; the sidebar switcher saves your choice in `localStorage`.

The strip bay on `/design` and `/specimen` is live: Unanswered Policy timers tick and fire, the Answer bar sends the whole Round, and, with focus inside the bay, `J`/`K` move between Rounds, `1`–`9` choose an option in the current Question, `A`/`R` approve or reject, and `⌘↵`/`Ctrl↵` sends. Single-key shortcuts can be switched off. All data is illustrative.

## Layout

| Path | Holds | Owner |
|---|---|---|
| `tokens/tokens.json` | DTCG source of truth: primitive → semantic → typography → density → elevation → layout → layer → component, themes, density modes, contrast pairs. | tokens |
| `tokens/themes.css` | Runtime `--hh-*` variables: `:root` + `hermes-dark`, `hermes-light`, `[data-density="compact"]`, `[data-density="glance"]`, reduced motion. Framework-free. | tokens |
| `tokens/tailwind-theme.css` | Tailwind 4 `@theme` bridge: semantic utilities only. | tokens |
| `tokens/token-taxonomy.md` | Roles, density modes, the world contract, gates, how to add a world. | tokens |
| `tokens/worlds/` | `<slug>.json` + `<slug>.css` per world. Empty for now. | worlds |
| `foundations/`, `components/*.md`, `patterns/`, `agent-contract/`, `governance.md`, `research/` | Docs: design language, typography, accessibility, imagery, motion, component families (including the Command Center Feed, `components/feed-widgets.md`), blueprints, the screen-generation rules, governance, sources. | docs |
| `briefs/` | Contribution briefs from the Hub and their status (`command-center-additions.md`, `command-center-additions-status.md` with the `pv-*` → `.hh-*` map). | docs |
| `app/` | Next.js 16 routes, `fonts.ts`, `layout.tsx` (pre-paint theme, palette, and density script). | preview |
| `preview/` | Theme registry (`themes.ts`), fixtures, `hermes-components.css` (every `.hh-*` component), `hermes-icons.json` (the icon set apps copy), `hermes-preview.css` (preview-only layout), React components. | preview |
| `public/fixtures/` | Illustrative images for preview specimens (the image Attachment). | preview |
| `validation/` | The validator, its tests, and the smoke report. | validation |

## Themes, density, fonts

- `hermes-dark` (default, also `:root`): ops-room slate, paper-cream strips in dark ink.
- `hermes-light`: the day shift, a pale bay with white strips.
- Density: default (desktop), `compact` (triage list, logs; targets ≥ 24px), `glance` (phone; targets ≥ 3rem, roomier rows, larger body text, and it overrides compact regions inside it).
- Faces, self-hosted through `next/font` in `app/fonts.ts`: **Schibsted Grotesk** (reading), **Spline Sans Mono** (callsigns, ids, timers, code), **Big Shoulders** (strip headers, display). All three load as variable files, so every weight the tokens name exists.

## Using the tokens elsewhere

Import `tokens/themes.css` (and `tokens/tailwind-theme.css` after `tailwindcss` in a Tailwind 4 app), set `data-theme` on `<html>`, load the three faces as `--font-schibsted-grotesk`, `--font-spline-sans-mono`, and `--font-big-shoulders`, then compose `.hh-*` classes from `preview/hermes-components.css` inside `@layer components`. A Bun-served UI can use the CSS files as they are.

## Adding a world

1. Create `tokens/worlds/<slug>.json` and `tokens/worlds/<slug>.css` following [tokens/token-taxonomy.md](tokens/token-taxonomy.md#worlds): theme value `hermes-<slug>`, all 58 roles, exactly four colour options (recommended default, two alternatives, `original`), overrides limited to type, shape, and depth.
2. Load any new face in `app/fonts.ts` (`preload: false`, `variable: '--font-<family>'`) and add it to `worldFontVariables`.
3. Add the slug to `WORLD_SLUGS` in `preview/themes.ts`. That one line registers the world with the switcher, `/worlds`, `/overview`, and the inlined stylesheet.
4. Run `npm run validate`.

## Checks

```sh
npm run validate        # token contract, parity, contrast, density, worlds, raw values
npm run test:validator  # each rule fails on a broken fixture
npx tsc --noEmit
npm run build
```

Browser smoke results are in [validation/smoke-report.md](validation/smoke-report.md).
