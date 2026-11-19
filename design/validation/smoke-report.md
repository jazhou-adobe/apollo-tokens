# Smoke report

Date: 2026-11-20. Next.js 16.4.1 dev server on port 3300, headless Chromium driven through Puppeteer. The server was stopped afterwards.

## Method

Each page was loaded with `?theme=<theme>` and, for glance, `&density=glance`, at a viewport of 1440 × 900 and 390 × 900. After network idle plus a short settle, the check read `data-theme` and `data-density` on `<html>` (both applied from the query by the pre-paint script in every run), compared `document.documentElement.scrollWidth` with `clientWidth` (horizontal scroll), and read the Next.js dev overlay's issue count, which collects console errors, hydration errors, and React key warnings.

## Results

| Viewport | Route | hermes-dark | hermes-dark + glance | hermes-light | hermes-light + glance |
|---|---|---|---|---|---|
| 1440 | `/design` | pass | pass | pass | pass |
| 1440 | `/overview` | pass | pass | pass | pass |
| 1440 | `/specimen` | pass | pass | pass | pass |
| 390 | `/design` | pass | pass | pass | pass |
| 390 | `/overview` | pass | pass | pass | pass |
| 390 | `/specimen` | pass | pass | pass | pass |

Pass = 0 dev-overlay issues, no horizontal scroll, and the requested theme and density painted on `<html>`.

Also loaded: `/worlds` (empty state) at both widths in both themes, with no issues and no horizontal scroll. `/tile` renders at the fixed thumbnail viewport (`--hh-layout-thumbnail-width`, 720px) by design, so it scrolls sideways when opened directly at 390; `/overview` scales it inside an iframe.

## Behaviour checked on `/specimen` (hermes-dark, 1440)

| Action | Observed |
|---|---|
| Focus the first strip, press `J` | R-0143 opens in the Round panel and its strip head takes focus. |
| Press `K` | Back to R-0142. |
| `⌘↵` with nothing answered | Not sent; the Answer bar shows "Not sent. Q1, Q2 need an Answer." |
| Press `1` | Q1 takes option 1 (URL prefix /v2); counter reads 1 of 2. |
| Press `A` | Q2 approved; counter reads 2 of 2. |
| `Ctrl↵` | Round sent: R-0142 leaves the bay, the answered log gains it, pending drops 4 → 3, a toast and the polite live region read "Answer sent · R-0142 · 3 Questions delivered to CLAUDE·api-refactor.", R-0143 opens. |
| Wait 78 s (hermes-light) | R-0144's cancel policy fires: holder turns Expired, tab reads "Cancelled hh:mm by policy", the live region announces it, pending drops to 3. |

## Fixed during the check

- A diff's visually hidden "Added:/Removed:" labels escaped the scrolling code plane at 390 px; the code plane is now their containing block.
- Option rows lost a grid cell when key hints were off, which squeezed the label column; the slot is now always present and the Recommended marker sits inside the label cell.
- Duplicate React keys in the colour-role readouts (a pair listed both automatically and in `tokens.json`).
- Big Shoulders through `next/font/google` warned "Failed to find font override values" on every build; it is now self-hosted through `next/font/local`, which measures its own fallback.

## Not covered

- No screen-reader pass; live-region text was read from the DOM.
- No Safari or Firefox run.
- `prefers-reduced-motion` was checked by the validator (every duration collapses to 1ms), not in the browser.

## Phase 4 re-check (taste TR and studio ST fixes)

Run 2026-11-20 against the shared dev server on 3300. No server was started or stopped, and no build was run.

- **Overflow and dev-overlay issues:** `/design` and `/specimen` in both core themes and all four worlds, at default, compact (core) and glance density, plus `/overview` and `/worlds`, at 1440 and 390. Every load showed no horizontal scroll, no Next.js issues, and no duplicate ids. One page failed on the first pass: `/design` in Flight Director, compact density, at 390. A hidden tooltip widened the page; hidden tooltips are now out of layout, and the page passed the re-check.
- **Desktop keyboard (`/specimen`, hermes-dark, 1440):** the strip list is one Tab stop. `J` and arrows move between strips and the open Round follows. `N` opens notes and focuses them. `Ctrl↵` with a Question unanswered moves focus to it and shows a `role="alert"` error. `Esc` closes the Round and focuses its strip. `Enter` reopens it. `⌘↵` sends; the strip stays as `data-state="departing"` with the status word Answered for about 480 ms, then leaves. The confirmation appears in the bay-status region and the next strip takes focus.
- **Phone flow (`/specimen`, 390, glance):** the pending list shows alone. Tapping a strip opens the Round sheet: the head sits just below the top of the viewport, the Answer bar ends at 828 px of an 844 px viewport, and the Questions scroll inside the sheet. "Back to pending" returns to the list and focuses the strip. Sending returns to the list, focuses the next strip and shows the confirmation. Key hints are hidden.
