# Agent rules: Hermes Hub design system

Read [brief.md](brief.md) first; it outranks every other file here. Then [tokens/token-taxonomy.md](tokens/token-taxonomy.md) and [agent-contract/screen-generation-rules.md](agent-contract/screen-generation-rules.md).

- Colours, lengths, durations, shadows, and z-indexes come from `--hh-*` tokens. Raw values belong only in `tokens/`; `npm run validate` fails anything else.
- Edit `tokens/tokens.json` and `tokens/themes.css` together; the validator checks parity.
- Status never relies on colour: holders print a status word, callsign chips print the callsign, diff lines carry a sign.
- Glow (`--hh-elevation-live`) only on live state. Reading planes stay opaque. No gradient text, glass, scanlines, or noise.
- The holder frames a strip on every side. Never a thin coloured side stripe on a card.
- Copy uses the glossary (Hub, Command Center, Agent, Human, Round, Question, Answer, Unanswered Policy) in the dispatcher voice: status word first, no exclamation marks, no emoji. Label fixture data as illustrative.
- New or retired world: `tokens/worlds/<slug>.{json,css}`, its faces in `app/fonts.ts`, its slug in `WORLD_SLUGS` in `preview/themes.ts`; the validator fails on any registry or font mismatch. Retired worlds move to `archive/worlds/<slug>/`.
- Before handing back: `npm run check` (validator, its tests, type check, build; the pre-commit hook runs all but the build). Then, from `../../apollo-tokens`, `npm run smoke -- hermes` against the hub (`npm run preview`). Dev-server errors: `../../apollo-tokens/preview-hub/logs/hermes.log`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
