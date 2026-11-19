# Governance and Adoption

## Source of truth

This `design/` package is the source for Hermes Hub screen design until a production package or the Hub's own UI supersedes it. [`brief.md`](brief.md) is the contract: if any artifact disagrees with it, the brief wins until the owner changes it.

## Contribution rule

A contribution updates every layer it touches:

- **Design language** when it changes the metaphor, holder vocabulary, voice or density modes ([foundations/design-language.md](foundations/design-language.md)).
- **Tokens and themes** when it changes values or roles: `tokens/tokens.json` first, then `tokens/themes.css` and `tokens/tailwind-theme.css`, and the taxonomy in `tokens/token-taxonomy.md`. Every new colour role needs a value in both core themes and every world colour option, and a contrast pair.
- **Component docs** when anatomy, states, keyboard or token bindings change ([components/](components/)).
- **Blueprints** when page composition changes ([patterns/](patterns/)).
- **Preview** when people or agents need to see the behaviour: a specimen at `/design` in every theme and world.
- **Agent contract** when generation rules, allowed tokens or forbidden patterns change ([agent-contract/screen-generation-rules.md](agent-contract/screen-generation-rules.md)).
- **Validator** when the rule can be checked mechanically (`validation/validate-design-system.mjs` and its tests).
- **Research** when a decision rests on a source: cite it in the matching note under [research/](research/).

## Review checklist

1. Does it keep the Flight Strips direction and the used-future rule?
2. Does every Round show its holder with a status word, its callsign text and its policy sentence?
3. Does it use only documented components and semantic `--hh-*` tokens?
4. Does it work in `hermes-dark`, `hermes-light` and every world colour option without forking components?
5. Does it work in compact and glance density?
6. Does it pass contrast, focus, target size, non-colour status and reduced motion?
7. Is the keyboard path complete, with visible hints and scoped single-key shortcuts?
8. Does it include empty, reconnecting, offline, expired and failed states?
9. Is the copy in the Dispatcher voice and the glossary's terms?
10. Does `npm run validate` pass?

The `design-reviewer` agent (configured in `.omp/agents/design-reviewer.md`) applies this checklist and the side-stripe, glass and glow bans.

## Adding a world

1. Write the idea, signature and four colour options (recommended default, two alternatives, `original`) and get owner sign-off.
2. Create `tokens/worlds/<slug>.json` with every colour role for each option, typed overrides limited to type, shape and depth, and the signature description.
3. Create `tokens/worlds/<slug>.css`: one `html[data-theme="hermes-<slug>"]` block, one `[data-palette="<id>"]` block per option, then the skin. Every selector starts with the theme selector; keyframes start with `<slug>-`; no `infinite`; motion on `--hh-motion-*` tokens; no `@import`, `@font-face` or `@layer`.
4. Spend material by the intensity budget: identity surfaces (page edges, the bay floor, one signature) carry the world; functional components keep its shape and type with restrained material; reading planes (Question text, attachments, notes) stay opaque and quiet.
5. Load any new face in `app/fonts.ts`, import the stylesheet in `app/globals.css`, register the world in the preview theme registry.
6. Run the validator; every gate the core themes pass applies to every colour option.
7. Add a quick-preview note under `research/world-previews/` with screenshots in both densities.

A world never adds markup, tokens or behaviour that the core lacks, and never changes motion, density, spacing, layout or component sizes.

## Versioning

Versioned by repository history. If a package is published, keep a changelog with Added, Changed, Deprecated, Removed and Fixed sections. Renaming a token or class is a breaking change: deprecate first, keep the alias for one release, then remove.

## Adoption

**Placeholder — Phase 9 (adoption and handoff) has not been run.** This run covers Phases 1–4 (frame, brainstorm, core system, critique). The adoption guide, the handoff skill for the Hub repository, and the copy-list of files a consuming app needs will be written in Phase 9.

Until then:

- Do not copy files into `hermes-hub` piecemeal.
- Treat `tokens/themes.css`, `tokens/tailwind-theme.css`, `tokens/tokens.json` and `preview/hermes-components.css` as the candidate runtime set; the list is not final.
- Record any gap found while building the Hub UI as a contribution here, not a one-off exception in the Hub.
