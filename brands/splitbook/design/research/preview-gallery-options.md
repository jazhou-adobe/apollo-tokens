# Preview gallery options

## Scope

How to preview the Splitbook system: tokens, Light and Deck, compact density, five worlds with four colour options each, components, Capture widgets and blueprints. Stack per the brief: Next.js 16 / React 19 / Tailwind 4, preview on port **3200**.

Criteria: setup cost, theme switching, component examples, blueprint demos, agent readability, fit with the stack.

## Options

| Option | Setup cost | Theme switching | Component examples | Blueprint demos | Agent readability |
|---|---|---|---|---|---|
| Storybook with the Next.js Vite framework ([docs](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)) | Medium–high: a second runtime, `.storybook` config, stories | Excellent: toolbar globals and decorators ([docs](https://storybook.js.org/docs/essentials/toolbars-and-globals)) | Excellent: CSF stories, args, Autodocs ([docs](https://storybook.js.org/docs/writing-stories)) | Good, with mocks for App Router navigation | Good: CSF is structured |
| Ladle ([docs](https://ladle.dev/docs/)) | Low–medium, plus Next-specific aliases ([Next.js notes](https://ladle.dev/docs/nextjs/)) | Good: theme addon and provider | Good | Fair: page shells need mocks | Good |
| Custom Next.js route (`/design`) ([project structure](https://nextjs.org/docs/app/getting-started/project-structure)) | Low: a route, fixtures and a small theme switcher | Good: set `data-theme` / `data-palette` / `data-density` on `<html>` | Good enough: plain TSX fixtures | Excellent: real layouts, fonts and CSS | Excellent: ordinary source files |
| MDX docs ([Next.js MDX](https://nextjs.org/docs/app/guides/mdx)) | Medium: MDX packages and config | Inherits the route's switcher | Good for prose with examples | Fair | Mixed |
| Static export ([Next.js static exports](https://nextjs.org/docs/app/guides/static-exports)) | Variable | Client-side only | Output, not authoring | Good for frozen shares | Poor for generated output |

## Recommendation

A **custom Next.js preview** on port 3200, as the reference implementation proved workable:

1. `/design`: one section per area (tokens and themes, typography and numerals, containers, navigation, inputs, overlays, data display, Capture widgets, trend widgets, admin widgets, blueprints), with Light ↔ Deck and compact toggles.
2. `/worlds`: the five worlds, each with its four colour options.
3. An overview page with every theme and world on one screen.
4. Fixtures are plain TypeScript with sample Swimmers, Sessions and Swims labelled "(example data)"; no auth or database.

Risks: no built-in controls or story index (keep local controls small); fixtures can drift from production components (compose the same primitives the product will copy); Storybook remains the upgrade path if a component workbench is needed later.
