# Agent rules for the Splitbook design system

Read [brief.md](brief.md) first; it outranks everything else. The full screen-building flow is [agent-contract/screen-generation-rules.md](agent-contract/screen-generation-rules.md). This is the summary.

## Building a screen

1. Pick the blueprint (watcher, Admin console, or system state) from `patterns/` and the theme: the owner's chosen design is the `splitbook-approach-lights` world; the core themes are `splitbook-light` for desk pages and `splitbook-deck` for Capture at the pool.
2. Set `data-theme` (and `data-palette` for a world) on `<html>` only. Put `data-density="compact"` on the Admin console region only, never on Capture or watcher pages.
3. Compose from `.sb-*` components and domain widgets (`components/*.md`, live at `/design`). Do not fork anatomy or invent new classes for existing parts.
4. Use semantic tokens (`--sb-*` or the Tailwind bridge's semantic utilities) only. No hex, colour functions, px/rem/ms literals, Tailwind arbitrary values, or palette utilities outside `tokens/`.
5. Hand colours do one job each: `live` = recording now, `metric` = a captured value, `improvement` = better than before. `destructive` is not a Fault; `fault` is an observer's note.
6. Never carry state by colour alone: Faults get a flag and a label, ratings a number and cue text, Lengths a number and a frame style, trends a printed value and a sentence.
7. Capture: targets at least 48 CSS px (56 in Deck), the primary action in the bottom tray, undo for every tap, nothing time-critical behind a dialog, no precision or two-hand gestures.
8. Numbers use tabular display numerals (`.sb-numeral`, `numeral-*` tokens). Counts and technique lead; times are the result.
9. Copy: the coach's clipboard. Calm, precise, plain words, no exclamation marks, glossary terms (Session, Swim, Length, Set, Focus metric, Tap Pad, Review sheet, Metric trend, Technique trend, Technique point, Fault, Capture template, Admin console, Configuration). Explain jargon. Never write "DQ" or "disqualified". Label fixture data as illustrative.
10. No gradient text, decorative glass, glow outside live state, scanlines, grain, or neon-on-black reading surfaces. No streaks, badges-as-rewards, confetti, leaderboards, or ring dashboards.

## Worlds

A new or retired world touches `tokens/worlds/<slug>.{json,css}`, `WORLD_FILES` in `preview/themes.ts`, its `@import` in `app/globals.css`, and its faces in `app/fonts.ts`; the validator fails on any registry or font mismatch. Retired worlds move to `archive/worlds/<slug>/`.

## Checks before you hand off

Run `npm run check` (validator, its tests, type check, build; the pre-commit hook runs all but the build). Then, from `../../apollo-tokens`, run `npm run smoke -- splitbook` against the hub (`npm run preview`), and check changed pages by keyboard and with reduced motion. Dev-server errors: `../../apollo-tokens/preview-hub/logs/splitbook.log`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
