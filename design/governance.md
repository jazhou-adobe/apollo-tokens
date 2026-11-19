# Governance

## Source of truth

This repository is the Splitbook brand master. [`brief.md`](brief.md) is the contract; `tokens/tokens.json` is the source for every value; the docs in `foundations/`, `components/`, `patterns/` and `agent-contract/` explain how to use them; `validation/validate-design-system.mjs` enforces what can be checked mechanically. When a doc and the brief disagree, the brief wins until the owner changes it.

## Contribution rules

A change updates every layer it touches, in the same change:

- **Brief** first, when it changes a decision (roles, knobs, worlds, voice). Only the owner changes the brief.
- **Tokens** (`tokens.json`, then regenerate `themes.css` and the Tailwind bridge) when it changes a value or adds a role. New roles need a `$description` naming their one job and the contrast gate that applies. A new colour role is defined in every theme and every world colour option.
- **Foundations** when it changes the metaphor, voice, type, motion or accessibility rules.
- **Component docs** when it changes anatomy, variants, states, token bindings or keyboard behaviour. Class names stay `.sb-<component>`.
- **Blueprints** when it changes a page composition or its states.
- **Preview** so humans and agents can see it in Light, Deck and every world.
- **Agent contract** when the rules agents follow change.
- **Validator** when the rule can be checked, with a failing fixture in the test file.

Rules that never bend:

- The four hand colours keep one job each.
- Faults stay observer's notes; no "DQ" language anywhere.
- Capture keeps ≥ 48 px targets, ≥ 56 px in Deck, undo for every tap and no dialog while recording.
- No dark or high-contrast core theme without an owner decision in the brief.
- No mention of any other product in UI, copy or artifacts.

## Review checklist

1. Does it keep the Pace Clock direction calm and grounded (no sci-fi in the core)?
2. Does every colour use match its role's one job?
3. Does it work in Light, Deck (Capture), compact (Admin) and every world?
4. Are empty, loading, error and offline states covered?
5. Does it pass contrast, focus, target size, non-colour cues and reduced motion?
6. Is the copy in the coach's-clipboard voice with glossary terms?
7. Does the validator pass?

## Adding a world

A world is a complete alternative look over the same anatomy.

1. Owner decision in the brief: slug, idea, signature. Worlds are used future: tactile, worn-in, functional; no gradient text, decorative glass, glow-everywhere, scanlines, noise grain or neon-on-black reading surfaces; glow on live state only.
2. `tokens/worlds/<slug>.json`: label, description (the idea), signature, colour scheme, the full 46-role colour set, typed and described overrides, and exactly **four** colour options: the recommended default, two alternatives, and `original`.
3. `tokens/worlds/<slug>.css`: one `html[data-theme="splitbook-<slug>"]` block, one `[data-palette="<id>"]` block per option, then the skin. Every selector starts with the theme selector; keyframes start with `<slug>-`; no `infinite`; motion only on `--sb-motion-*`.
4. Overrides limited to type, shape and depth. Never motion, density, spacing, layout or component sizes, so Deck and compact still hold.
5. Intensity budget: identity (page edges, the signature) carries the full material; function (buttons, inputs, menus) keeps the world's shape with restrained material; reading planes (Review sheet, tables, trend summaries, fields) stay opaque and quiet.
6. Every meaningful mark carries a numeral or label.
7. Load any new face in `app/fonts.ts`, import the stylesheet, register the world in the preview, and run the validator.

A product adopts at most one world, in one colour option, after owner sign-off. Deck and compact still apply on top of it.

## Versioning

Artifacts are versioned by repository history. Record changes as Added, Changed, Deprecated, Removed and Fixed.

## Adoption

**Not yet done.** Handoff to the product repo (Phase 9 of the build playbook) has not started. Until it does:

- Nothing here is consumed by the Splitbook product yet.
- There is no copy list, install order or adoption skill. Those will be written in Phase 9 and recorded in this section.
- Product work that needs a design decision now should cite the file and section it follows here, and raise any gap as a contribution to this repository rather than a one-off in the product.
