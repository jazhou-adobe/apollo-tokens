# Watcher blueprints

Page compositions for the person watching: a parent on the deck or a private coach. Each blueprint lists its theme, regions, states and how it differs between **Deck** (Capture screens, `data-theme="splitbook-deck"`) and **Light** (desk pages, default). Separating reusable components from task-level patterns follows GOV.UK and Carbon ([mature-design-system-references.md §6](../research/mature-design-system-references.md#6-patterns-and-page-templates)).

Every page shares: skip link, app bar with the Profile switcher, one `h1`, a feedback slot under the heading (for `role="alert"` errors), and empty / loading / error / offline states. Capture screens drop the side and bottom nav ([navigation-and-chrome.md](../components/navigation-and-chrome.md#page-chrome-at-a-glance)).

## Swimmer home

Light. The watcher's start page for the selected Swimmer.

- Regions: heading ("Maya"); primary action card "Start a Session"; latest finding panel (one Metric trend finding and one Technique trend dial); recent Sessions shelf (`.sb-session-row` × 3, "All Sessions"); Capture templates shelf.
- States: no Swimmers (empty state, "Add a Swimmer"); no Sessions ("No Sessions yet for Maya. Start one at the pool."); not enough for trends (finding panel explains how many Sessions are needed); loading (skeletons); error (alert, shelves that loaded stay); offline ("You're offline. You can still start a Session; it will sync later.").
- Deck vs Light: Light only. "Start a Session" switches the route to Deck.

## Pre-Swim setup

Deck. Pick what this Swim is and what to watch.

- Regions: Swim line ("Swim 3 · Session 14 Nov"); chip pickers for stroke, distance, training type (pre-filled from the Capture template and Profile defaults); Focus-metric picker (up to two, `metric` chips); Capture template select; primary "Start Swim" in the bottom tray.
- States: defaults filled (most Swims: one tap to start); invalid ("Pick a distance" inline); offline (works fully; status line says it will sync).
- Deck vs Light: Deck. If shown in Light (desk planning), targets still ≥ 48 px.

## Live Capture

Deck. The Tap Pad, nothing else. See the worked example in [screen-generation-rules.md](../agent-contract/screen-generation-rules.md#worked-example-live-capture).

- Regions: slim app bar (Swim title, Swimmer name read-only, End Swim); `.sb-tap-pad` filling the viewport: status, split read-out, Focus-metric counters, Length strip, Wall key, undo tray.
- States: ready, recording, ended, saving offline. No empty state (setup is required to arrive here). Error never interrupts recording: taps are kept on the device and the status line says so.
- Deck vs Light: Deck only. No dialogs, toasts or sheets while recording.

## Review sheet

Deck. Completed straight after a Swim.

- Regions: Swim summary (left / top) ↔ Review form (right / below) on the T-line axis; form sections Lengths, Technique, Faults, Context; bottom tray "Done" and "Next Swim".
- States: in progress, saved, saving offline, section error (only that section shows an alert), nothing to review ("This template has no Review items. Done.").
- Deck vs Light: Deck at the pool. Opened later from Swim detail ("Edit review"), it renders in Light with the same anatomy.

## Session history

Light. All Sessions for the Swimmer.

- Regions: heading; filter tray (date range, stroke, pool length) — a bottom sheet on phones; list of `.sb-session-row`; pagination ("Show earlier Sessions").
- States: empty ("No Sessions yet"), filtered to nothing ("No Sessions match. Clear filters."), loading, error, offline (cached Sessions with "Showing Sessions saved on this device").

## Swim detail

Light.

- Regions: breadcrumbs; heading ("Swim 3 · 100 m freestyle"); summary stats (counts first, time last); tabs: Lengths (`.sb-length-strip` and splits table) · Technique (ratings with cue text) · Faults (noted Faults, with the observer-note helper) · Context; row actions (Edit review, Group into a Set, Delete Swim…).
- States: loading, not found (system blueprint), corrected values marked "Corrected", captured under an older Configuration version ("Captured under v11").
- Deck vs Light: Light; Edit review keeps Light.

## Metric trends

Light.

- Regions: heading; filters (stroke, distance, pool length, date range); `.sb-trend-line` panels, one per Metric, each with finding, plot and data table; then ↔ now pair when the watcher picks two Sessions.
- States: not enough data per Metric; no Metrics captured yet; loading; error.

## Technique trend

Light.

- Regions: heading; stroke filter; grid of `.sb-trend-dial`, one per Technique point; selected point's history as a small table of ratings with cue text.
- States: not rated yet, loading, error.

## Profile and Account defaults

Light.

- Regions: Swimmers shelf (cards with initials avatar, name, main stroke; "Add a Swimmer"); Profile defaults form (usual pool length, main stroke, target counts, level); Account defaults form (units, Capture templates); save tray.
- Copy: "Profile defaults override Account defaults, which override Configuration."
- States: saved (toast "Saved."), invalid (inline), unsaved changes (save tray shows "2 unsaved changes"), delete Swimmer (alertdialog naming the Swimmer and that their Sessions are deleted).
