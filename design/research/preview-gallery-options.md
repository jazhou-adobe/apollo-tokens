# Preview gallery options

## Scope

How to preview the Hermes design system. The owner fixed the stack: DTCG tokens → `--hh-*` CSS variables (framework-free, so the Hub's Bun-served UI can use them directly) plus a Tailwind 4 `@theme` bridge, and a Next.js 16 / React 19 preview on port **3300** ([brief.md](../brief.md#owner-decisions)). This note records why a custom `/design` route fits, and what the alternatives would cost.

Criteria:

- **Setup cost**: dependencies, config, mocks.
- **Theme switching**: two core themes, five worlds × four colour options, two densities.
- **Component states**: every holder status, timer threshold, connection state, Answer bar state.
- **Blueprint demos**: whole Command Center, phone and system pages.
- **Agent readability**: can an agent read the example source and copy it?
- **Fit with the Hub**: does the preview exercise the same CSS the Bun-served Hub will load?

## Primary-source findings

### Storybook

- The Next.js Vite framework is Storybook's recommended framework for Next.js projects, set up with `create storybook`, with static output from `build-storybook` ([Storybook Next.js Vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)).
- Stories are Component Story Format files with named exports per state and `args` ([Writing stories](https://storybook.js.org/docs/writing-stories)).
- Theme switching uses `globalTypes`, toolbar items and decorators that read `context.globals` ([Toolbars and globals](https://storybook.js.org/docs/essentials/toolbars-and-globals)).
- Autodocs and MDX generate docs pages ([Autodocs](https://storybook.js.org/docs/writing-docs/autodocs), [MDX](https://storybook.js.org/docs/writing-docs/mdx)).

**Hermes implication:** strong for isolated states and visual review, but a second runtime and story conventions before the inventory is stable. A theme × palette × density matrix needs three globals.

### Ladle

- A Vite-based, lighter alternative to Storybook for React components ([Ladle docs](https://ladle.dev/docs/)); stories are named exports ([Stories](https://ladle.dev/docs/stories/)).
- Next.js features (`next/image`, `next/link`, `next/navigation`) need aliases or providers ([Ladle and Next.js](https://ladle.dev/docs/nextjs/)).

**Hermes implication:** lighter than Storybook, weaker for full-page blueprints.

### Custom Next.js `/design` route

- App Router folders are route segments; `page` files expose routes; route groups organise without changing the URL ([Project structure](https://nextjs.org/docs/app/getting-started/project-structure)).
- Layouts and pages are React components that nest ([Layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)).
- Tailwind's `dark` variant can bind to a data attribute ([Dark mode](https://tailwindcss.com/docs/dark-mode)); Tailwind v4 theme variables drive utilities ([Theme variables](https://tailwindcss.com/docs/theme)).

**Hermes implication:** lowest cost; renders every blueprint with the real `themes.css`, component CSS and world CSS; fixtures are plain TypeScript an agent can read; a small local switcher sets `data-theme`, `data-palette` and `data-density` on `<html>`.

### Static output

- `output: 'export'` writes one HTML file per route, hostable anywhere, without server-only features ([Static exports](https://nextjs.org/docs/app/guides/static-exports)).

**Hermes implication:** a way to share a frozen preview; not the authoring model.

## Comparison

| Option | Setup | Themes × palettes × density | Component states | Blueprints | Agent readability | Fit with the Hub |
|---|---|---|---|---|---|---|
| Storybook | Medium-high | Excellent (globals) | Excellent | Good, mocked | Good (CSF) | Medium: React stories, Hub is framework-free |
| Ladle | Low-medium | Good | Good | Fair | Good | Medium |
| `/design` route | Low | Good, local switcher | Good with fixtures | Excellent | Excellent | **Good**: the same CSS classes and variables the Hub loads |
| Static export | Variable | Client toggle only | Snapshot | Good if static | Poor for output | — |

## Recommendation

Use a **custom Next.js `/design` route** on port 3300 as the preview, with:

1. Token swatches with contrast ratios per theme and world colour option.
2. A component state matrix: every holder status, policy timer state, connection state, Answer bar state, option state, overlay.
3. Blueprints: Triage, Round detail, answered log, roster, Agent detail, settings, phone pending list and approve/reject, sign-in, not reachable, reconnecting, empty, error.
4. A switcher for theme, world colour option and density, plus a reduced-motion explanation.
5. Plain-class markup (`.hh-*`) in examples, so the Bun-served Hub can copy markup without React.

Risks:

- No automatic controls or arg tables; keep local controls small.
- Examples must not depend on a live Hub; use fixtures for Rounds, Agents and connection states.
- If React components wrap the classes, keep the class contract primary so the framework-free Hub stays in sync.
