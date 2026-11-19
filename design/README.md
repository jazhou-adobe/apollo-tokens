# Splitbook design system

The brand master for every Splitbook app: tokens, the two core themes, the seeded-world contract, components and domain widgets, blueprints, the agent contract, a live preview, and a validator that gates all of it.

## Start here

1. Read [brief.md](brief.md). It is the contract; if anything here disagrees with it, the brief wins.
2. Read [foundations/design-language.md](foundations/design-language.md) for the Pace Clock direction, then [tokens/token-taxonomy.md](tokens/token-taxonomy.md) for every token, role, knob, and gate.
3. Building a screen? Follow [agent-contract/screen-generation-rules.md](agent-contract/screen-generation-rules.md) (summary in [AGENTS.md](AGENTS.md)).
4. Open the preview and switch themes while you read.

## Run the preview

```sh
cd design
npm install
npm run dev          # http://localhost:3200/splitbook/design
```

| Command | What it does |
|---|---|
| `npm run dev` | Preview server on port 3200, under the basePath `/splitbook`. |
| `npm run build` / `npm start` | Production build, then serve on port 3200 (also under `/splitbook`). |
| `npm run validate` | The design-system validator: token contract, CSS parity, contrast, Deck knob, density and target floors, reduced motion, world rules, style bans, copy guards, raw values. |
| `npm run test:validator` | Proves each validator rule fails on a broken fixture. |
| `npx tsc --noEmit` | Type check. |

## Routes

The app is served under the Next.js basePath `/splitbook` (set once in `next.config.mjs`, exposed as `process.env.BASE_PATH`; raw links and iframe sources go through `withBase` in `preview/paths.ts`). Standalone, open `http://localhost:3200/splitbook/design`; through the shared preview hub, `http://localhost:3000/splitbook/design`. The routes below are relative to that base.

Every route accepts `?theme=<value>` and, for worlds, `?palette=<id>` (applied before first paint, not saved). `?density=deck` previews the Deck size knob with any theme or world; `?density=compact` previews compact density. `/specimen?demo=midswim` opens the Capture specimen mid-Swim.

| Route | Shows |
|---|---|
| `/design` | The system. It opens on the chosen design itself (a live Length rail, running split and counts) straight after the theme controls, then foundations (colour roles with live contrast read-outs, type and numerals, spacing, radius and elevation, the Deck knob), core components, domain widgets (a working Tap Pad, Length strip, split read-out, rating, fault flag, chips, Review sheet, Swim/Session/Set rows, Metric and Technique trends, Profile switcher, Configuration list and publish bar), watcher, admin, and system blueprints, and the agent recipe. The sidebar holds the theme, colour, and density switches and an index. |
| `/specimen` | One Capture screen: a Tap Pad and a Review sheet sharing one preview Swim. While ready or recording it is the Tap Pad alone, centred at every width; once the Swim ends the ended Tap Pad (a compact result) pairs with the Review sheet. World gallery frames open it mid-Swim at Deck sizing. |
| `/overview` | Every theme on one screen as live `/tile` thumbnails. |
| `/tile` | The thumbnail composition `/overview` frames. |
| `/worlds` | The seeded-world gallery. Empty until worlds are registered. |

## Theme contract

| Attribute | Values | Where |
|---|---|---|
| `data-theme` | `splitbook-light` (default, also `:root`), `splitbook-deck`, `splitbook-<slug>` for a world | `<html>` only |
| `data-palette` | a world's colour option id | `<html>`, beside a world theme |
| `data-density` | `deck` (the Deck size knob, for Capture in any theme or world), `compact` | `deck` on the root of a Capture screen; `compact` on the Admin console region only |

- Variables are `--sb-*`. Components are `.sb-<component>`; variants use `data-variant`, sizes `data-size`, state ARIA attributes or `data-state`.
- **Light** is for desk pages. **Deck** is a palette and a size knob for Capture at the pool: positive polarity (dark ink on light planes) at glare-grade 7:1 contrast, the live state on a black LED plate with safety-yellow figures, 56 CSS px targets, larger Tap Pad keys and numerals, roomier density.
- The four hands of the pace clock each have one job: `live` (recording now), `metric` (a captured value), `improvement` (better than before), `foreground` (ink).

## Layout of this folder

| Path | Holds |
|---|---|
| `tokens/` | `tokens.json` (DTCG source), `themes.css` (runtime variables), `tailwind-theme.css` (Tailwind 4 bridge), `token-taxonomy.md`, `worlds/` |
| `foundations/`, `components/`, `patterns/`, `agent-contract/`, `governance.md` | The written system |
| `research/` | Sources the docs cite |
| `app/`, `preview/` | The Next.js 16 preview; `preview/splitbook-components.css` is the shippable component stylesheet, `preview/splitbook-preview.css` is preview-only |
| `validation/` | Validator, its tests, and the browser smoke report |

## Register a world

Two files in `tokens/worlds/`, one import in `app/globals.css`, one line in `preview/themes.ts`. The steps are in [tokens/token-taxonomy.md → How to add a world](tokens/token-taxonomy.md#how-to-add-a-world).
