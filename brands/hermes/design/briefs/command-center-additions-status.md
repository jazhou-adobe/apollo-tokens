# Status: Command Center additions

Status of [command-center-additions.md](command-center-additions.md) (hermes-hub issue #25). Every item is specified, previewed at `/design` (every theme, world colour option and density the switcher sets), and named in the `.hh-*` vocabulary, so the Hub can replace its `pv-*` glue (`web/src/app.css`, logged in hermes-hub `web/preview/GAPS.md`) by re-copying the files the manifest lists. Fixtures are illustrative.

## Items

Preview anchors are on `/design` (through the hub: `/hermes/design#<anchor>`).

| # | Item | Specified in | Preview |
|---|---|---|---|
| Feed | Triage becomes a Feed | [command-center-blueprints.md](../patterns/command-center-blueprints.md) Feed (strip-bay triage kept as reference), [feed-widgets.md](../components/feed-widgets.md) The Feed, keyboard map, live regions | `#bp-feed`; strip-bay reference `#bp-triage` |
| 1 | Feed index | [feed-widgets.md](../components/feed-widgets.md) Feed index | `#cmd-index`, `#bp-feed` |
| 2 | Page-scroll Round, diff folds, sticky action bar | [round-widgets.md](../components/round-widgets.md) Page-scroll Round, Diff | `#cmd-round` (two Rounds: only the bar in view sticks), `#bp-feed` |
| 3 | Lock soon | [feed-widgets.md](../components/feed-widgets.md) Lock soon | `#cmd-index`, `#cmd-round` head |
| 4 | Dismiss and Redirect panels, Outcome words | [feed-widgets.md](../components/feed-widgets.md) Inline panel; [round-widgets.md](../components/round-widgets.md) Answer bar states; [status-widgets.md](../components/status-widgets.md) Answered log | `#cmd-round` (Dismiss `d`, Redirect `e`, empty Redirect shows the error) |
| 5 | Edit-then-approve Proposal | [round-widgets.md](../components/round-widgets.md) Proposal | `#cmd-round` Q2 (Edit, change the text: Edited, Approve (edited), Reset) |
| 6 | Advisor states | [feed-widgets.md](../components/feed-widgets.md) Advisor | `#cmd-advisor` (working, ready, unparsed, timed out, cancelled, run history); picker in `#cmd-round` (`v`); markers in `#cmd-round` Q1 and Q2 |
| 7 | Locked Question | [round-widgets.md](../components/round-widgets.md) Locked Question | `#cmd-round` Q4, `#cmd-ended` |
| 8 | Per-Question policy | [status-widgets.md](../components/status-widgets.md) Per-Question policy | `#cmd-round` Q3 |
| 9 | Supersede | [round-widgets.md](../components/round-widgets.md) Supersede | `#cmd-round` head ("Replaces"), `#cmd-ended` (ended state, Open r_…), `#bp-log` (log wording) |
| 10 | Markdown and image Attachments | [round-widgets.md](../components/round-widgets.md) Markdown Attachment, Image Attachment | `#cmd-round` Q4; no-alt state `#cmd-attachments` |
| 11 | Delivery states, Answered log | [status-widgets.md](../components/status-widgets.md) Answered log | `#bp-log` |
| 12 | Agents page: Forget, Detection, Lanes with drawer | [agent-widgets.md](../components/agent-widgets.md) Detection details, Forget Agent, Lanes; [command-center-blueprints.md](../patterns/command-center-blueprints.md) Agents, Agent detail | `#cmd-agents`, `#bp-roster`, `#bp-agent` |
| 13 | Settings blueprint | [command-center-blueprints.md](../patterns/command-center-blueprints.md) Settings; [feed-widgets.md](../components/feed-widgets.md) Settings parts | `#bp-settings` |
| 14 | Notification toasts with Open | [overlays.md](../components/overlays.md) Toast variants with Open | `#cmd-toasts` |
| 15 | Free-text Recommended | [round-widgets.md](../components/round-widgets.md) Free-text Recommended | `#cmd-round` Q3 |

Smaller findings (hermes-hub `web/preview/GAPS.md`):

| Finding | Resolution |
|---|---|
| `[data-recommended]` has no CSS | `.hh-option[data-recommended="true"]` rule (thick `--hh-recommended` boundary; chosen boundary wins) |
| `.hh-round[data-state="ended"]` has no CSS | Bar never sticks; options read-only with the default cursor; ink unchanged |
| Timer and progress fills need inline custom properties under a strict CSP | CSSOM path documented (React's `style` prop is allowed) and a `data-fill="0…100"` scale in steps of 5 ([status-widgets.md](../components/status-widgets.md)); specimen `#cmd-small`, Storage in `#bp-settings` |
| `.hh-visually-hidden` widened a scrolling table | `.hh-table-wrap { position: relative }` |
| `.hh-icon` has no stroke styles | Stroke, fill, caps and joins in `.hh-icon`; `Icon.tsx` no longer sets presentation attributes |
| Long `.hh-badge` / `.hh-recommended` labels overflow | Both wrap (`white-space: normal`, `max-width: 100%`) |
| Muted ink on strip paper | On `.hh-strip-paper` / `.hh-round` (or `.hh-dl[data-plane="strip"]`), `dt`, `.hh-hint`, `.hh-muted` and table headers take the paper's ink; `dt` bold |
| Strip-header uppercases long Round titles in the core themes | `.hh-round-title` beside `.hh-strip-header`: sentence case, normal tracking |
| Missing icons | `copy`, `image`, `markdown`, `trash`, `lock-open` added to the icon set, now `preview/hermes-icons.json` |
| The triangle glyph for In view | `chevron-right` icon plus "In view"; the validator now fails glyph icons in code and styles |
| Full width | Blueprints and the agent contract: no content max-width; only `--hh-layout-measure` caps lines |
| Toast placement | `.hh-toast-region[data-placement="top"]` at `--hh-layout-sticky-top`, out of the flow ([overlays.md](../components/overlays.md)) |
| Focusable headings | `[tabindex="-1"]` headings in `.hh-page-head`, `.hh-round-head`, `.hh-strip-bay-head` show the ring after a keyboard move, none after a pointer action |
| Feed index on narrow screens | Below 64rem the index list scrolls inside itself (three strip heights) |
| Big Shoulders shipped although Flight Director sets the condensed face to Michroma | No change: the manifest lists the core faces for every theme because the Hub's Appearance setting can switch to `hermes-dark` / `hermes-light` |

## New token

`--hh-layout-sticky-top` (4rem): the offset below the sticky app bar (replaces the Hub's `--pv-top`). Layout token only; no colour role was needed, so no theme, world or contrast change.

## Files the Hub re-copies

`node .skills/apply-apollo-theme/scripts/theme-manifest.mjs hermes flight-director` lists them; new since `1d03cf9`: `preview/hermes-icons.json` (the icon set; the Hub's `web/src/icons.tsx` can import it) and `components/feed-widgets.md` (inside `components/`). `tokens/themes.css`, `tokens/tokens.json`, `preview/hermes-components.css`, `components/`, `patterns/` and `agent-contract/` changed.

## `pv-*` → `.hh-*`

| Hub glue | Master |
|---|---|
| `--pv-top` | `--hh-layout-sticky-top` |
| `pv-shell` | `.hh-app-shell` |
| `pv-nav` (on `.hh-side-nav`) | `.hh-app-shell-nav` |
| `pv-main` | `.hh-app-shell-main` |
| `pv-surface` | `.hh-page` |
| `pv-page-head` | `.hh-page-head` |
| `pv-toasts` (on `.hh-toast-region`) | `data-placement="top"` |
| `pv-feed-layout` | `.hh-feed` |
| `pv-index` | `.hh-feed-index` |
| `pv-index-head` | `.hh-feed-index-head` |
| `pv-chips` | `fieldset.hh-feed-index-filters` (one per kind, visually hidden legend) |
| `pv-index-list` | `.hh-feed-index-list` |
| `pv-index-item` | `.hh-feed-index-item` |
| `pv-index-link` | `.hh-feed-index-link` |
| `pv-index-title` | `.hh-feed-index-title` |
| `pv-index-meta` | `.hh-feed-index-meta` |
| `pv-inview` | `.hh-feed-index-inview` |
| `pv-feed-column` | `.hh-feed-column` |
| `pv-feed-list` | `.hh-feed-list` |
| `pv-feed-item`, `pv-detail-strip` | `.hh-feed-item` |
| `form.hh-round` in the Feed and Round detail | add `data-layout="page"` |
| `h2.hh-strip-header` in the Round head | add `.hh-round-title` |
| `pv-action-bar` | `.hh-answer-bar[data-sticky="true"]` |
| `pv-ended-bar` | drop it (`.hh-round[data-state="ended"] .hh-answer-bar` is static) |
| `pv-inline-panel` | `.hh-inline-panel` |
| `pv-round-error` | `.hh-round-error` |
| `pv-advisor-row` | `.hh-advisor-row` |
| `pv-advisor` | `.hh-advisor-status[data-state="running|succeeded|unparsed|timed-out|cancelled"]` |
| `pv-suggestion` | `.hh-advisor-suggestion` (its rationale `p` → `.hh-advisor-rationale`) |
| `pv-suggest-offer` | `.hh-advisor-offer` |
| `pv-changed` | `.hh-advisor-changed` |
| `pv-briefing` | `.hh-advisor-briefing` |
| Advisor radios in the panel | `fieldset.hh-advisor-picker` |
| `pv-recommended-text` | `.hh-recommended-text` |
| `pv-quote` | `.hh-recommended-text-quote` |
| `pv-prose` | `.hh-attachment-prose.hh-prose` (Attachment) or `.hh-prose` (Round context, Question detail) |
| `pv-prose-code`, `pv-prose-title` | drop: `pre` and headings inside `.hh-prose` are styled |
| `pv-image-plane` | `.hh-attachment-image` (`data-state="expanded"` for Expand) |
| `pv-image` | drop: `img` inside `.hh-attachment-image` is styled |
| `pv-diff-fold` | `.hh-diff-fold` |
| `pv-fold-summary` | `.hh-diff-fold-summary` |
| `pv-proposal` | `.hh-proposal` (`data-state="read|edit|edited|invalid"`) |
| `pv-proposal-edit` | `.hh-proposal-edit` |
| `pv-proposal-input` | `.hh-proposal-input` |
| `pv-agent-version` | `details.hh-proposal-original` |
| `pv-locked-draft` | `.hh-question-draft`; the Question gets `data-state="locked"` |
| `pv-round-note` | `.hh-round-note` |
| `pv-paper-dl`, `pv-paper-note` | drop: paper ink is automatic inside `.hh-strip-paper` / `.hh-round`; elsewhere `.hh-dl[data-plane="strip"]` |
| `pv-filter-grid`, `pv-filters` | `.hh-filter-tray` |
| `pv-filter-actions` | `.hh-filter-tray-actions` |
| `pv-values` | `.hh-log-values` |
| `pv-setter` | `.hh-log-setter` |
| `pv-match` | `mark.hh-match` |
| Day-group rows in the log | `tr.hh-answered-log-day > th[scope="colgroup"]` |
| `pv-popover-anchor` | `.hh-popover-anchor` |
| `pv-detect` | `details.hh-detection` > `summary.hh-detection-summary` |
| `pv-lanes-layout` | `.hh-lanes-layout` |
| `pv-lanes` | `.hh-lanes` |
| `pv-lane` | `.hh-shelf.hh-lane` |
| `pv-lane-head` | `.hh-lane-head` |
| `pv-lane-list` | `.hh-lane-list` (with `.hh-strip-bay-list`) |
| `pv-slot` | `.hh-lane-slot` (with `.hh-strip-bay-slot`) |
| `aside.hh-panel.pv-drawer` | `aside.hh-drawer` |
| `pv-settings-grid` | `.hh-settings` (panels in `.hh-settings-panels`) |
| Read-only config line | `.hh-config-source` |
| `pv-time-row` | `.hh-field-pair` |
| `pv-switch-state` | `.hh-switch-state` |
| `pv-skel` | `.hh-skeleton[data-shape="strip"]` |
| `pv-route` | drop (plain `.hh-mono`) |

Glue rules on existing classes the Hub can delete once it re-copies: `.hh-icon` stroke; `.hh-option[data-recommended]`; `.hh-recommended, .hh-badge { white-space: normal }`; `.hh-option-label` / `.hh-option-text` min-width and wrapping; `.hh-table-wrap { position: relative }`; `.hh-table .hh-button` wrapping; `.hh-question-prompt` and `.hh-input[type="search"]` measure caps; `.hh-question > :is(…)` full-width children; the `.hh-strip-header:focus` pair; the `.hh-round-head > .hh-body` margin rules (use `.hh-prose`); `.pv-popover-anchor .hh-popover` width; the narrow-screen index-list cap. `[hidden] { display: none !important }` is app plumbing and stays in the Hub.

## Deviations

- The phone blueprints and the sign-in blueprint stay in the master as references (marked "not in the Hub's Phase 1"), because glance density and a later tailnet mode still depend on them; removing documented blueprints would also be a breaking change under [governance.md](../governance.md). Settings → Tokens and Exposure are removed from the Settings blueprint.
