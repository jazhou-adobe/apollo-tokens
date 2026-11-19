# Verdict: fix then ship

The strip-board idea is legible, but duplicated information, excessive framing and weak mobile composition make six designs feel more alike—and more laborious—than their visual identities warrant.

## Highest-priority findings

### Major — Mobile preserves the desktop sequence instead of prioritising the decision

- **Location:** `/specimen`, every theme, 390 px; worse with `density=glance`.
- **Evidence:** In the dark glance specimen, the open Round starts approximately **1,716 CSS px down the document**, after the entire queue. Full-page captures: [default]( /tmp/hermes-taste/03-390.png), [glance](/tmp/hermes-taste/26-390.png).
- **Impact:** Selecting a Round does not produce a focused phone experience. The user traverses queue content before reaching the questions they need to answer.
- **Fix:** Below the mobile breakpoint, show either the queue or the selected Round. Opening a Round should bring its heading and first Question into view; provide a labelled “Back to pending” control. Keep the queue available without stacking it above every decision.

### Major — Confirmation overlays the next decision’s action area

- **Location:** `/specimen`, Comms Deck, Deck Handling and Starship, 1440 px, immediately after submission.
- **Evidence:** The confirmation toast occupies the lower-right action area while the next Round is already open. [Deck Handling capture](/tmp/hermes-taste/signature-hermes-deck-handling.png).
- **Impact:** Success feedback competes with the next task and visually obscures its controls.
- **Fix:** Put submission confirmation in a reserved bay-status region, or position the toast below the app bar rather than over the Answer bar. Keep the world’s signature attached to that confirmation region.

### Major — Starship’s viewport frame crosses content

- **Location:** `/specimen?theme=hermes-starship`, 1440 and 390 px.
- **Evidence:** The ornamental frame is a fixed `body::after`, viewport-height, at `z-index: 20`. Its lower horizontal band crosses the document rather than marking its end. [Desktop](/tmp/hermes-taste/22-1440.png).
- **Impact:** Ornament becomes a foreground obstruction, particularly around the sticky Answer bar.
- **Fix:** Keep the meander on the two outside vertical edges. Remove the fixed bottom band; do not frame the viewport over scrolling reading or action surfaces.

### Minor — The selected strip repeats the open Round

- **Location:** `/specimen`, every theme, 1440 px.
- **Evidence:** The selected queue entry repeats Question summaries and recommendations already displayed in the adjacent panel. [Dark specimen](/tmp/hermes-taste/03-1440.png).
- **Impact:** The selected item becomes the tallest object in the queue, reducing scanability without adding decision context.
- **Fix:** When the detail panel is visible, retain the strip’s callsign, title, status and policy; suppress its expanded Question summary. Keep expansion available when no detail panel is shown.

### Minor — The mobile design-system index consumes the opening screen

- **Location:** `/design`, every theme, 390 px.
- **Evidence:** The opening viewport is primarily theme controls and the long section index, not a specimen. [Dark capture](/tmp/hermes-taste/02-390.png).
- **Impact:** Comparing designs on a phone starts with navigation overhead.
- **Fix:** Collapse the section index into an “On this page” disclosure. Keep theme, colour and density controls together, followed immediately by the first rendered example.

---

# Taste review by design

## 1. Ops room — `hermes-dark`

**Evidence:** `/design` and `/specimen`, [1440 px](/tmp/hermes-taste/03-1440.png), [390 px](/tmp/hermes-taste/03-390.png).

### Retain

- Cream strips against near-black slate establish a physical information object rather than another dark dashboard.
- Condensed Round titles, monospace identifiers and plain reading text have distinguishable jobs.
- The amber holder makes pending work recognisable without tinting every reading surface.

### What does not work

- **1440 px, specimen:** Holder, inner cell divisions, selected outline, Question boundaries and option borders accumulate into too many competing rectangles.
- **1440 px, specimen:** The large cream detail panel dominates the board. The visual impression is closer to a form pasted onto a console than a compact operational workspace.
- **390 px, specimen:** Repeated status and policy sentences become vertical bulk. Glance increases control size, but does not reduce the amount of information competing for attention.
- **Generic/AI-generated impression:** Not the palette itself. The repeated badge–border–metadata treatment on almost every object is the generic part.

### Concrete tweaks

1. Preserve the full holder frame around strips; use quieter separators inside Question groups.
2. Reserve the strongest outline for keyboard focus and the current selection. Do not give every nested object equal boundary weight.
3. Collapse optional notes behind “Add notes”; keep the pinned Answer bar principally about completion and submission.
4. Keep Big Shoulders for Round titles and major headings. Avoid extending its uppercase treatment into supporting copy.
5. On desktop, reduce selected-strip expansion before reducing type size.

### Existing colour ranking

Only one colour set is exposed for this core theme. Keep it as the primary dark direction; the proposed alternatives below are additions, not existing menu options.

---

## 2. Day shift — `hermes-light`

**Evidence:** `/design` and `/specimen`, [1440 px](/tmp/hermes-taste/05-1440.png), [390 px](/tmp/hermes-taste/05-390.png).

### Retain

- A darker action colour instead of another bright accent separates actions from status.
- White strips remain distinct from the warm-grey board.
- Dark ink provides a less theatrical reading environment than the dark worlds.

### What does not work

- **1440 px, specimen:** Warm grey, white, mustard and numerous grey outlines produce an administrative-form impression. The carrier identity is mostly carried by typography.
- **1440 px, specimen:** The pale outer workspace and pale detail panel are insufficiently differentiated compositionally; additional borders compensate for weak surface hierarchy.
- **390 px, specimen:** The large stacked pale regions feel longer than their dark equivalents.
- **Generic/AI-generated impression:** This is the most interchangeable core design. Without the strip holders, much of it could belong to an enterprise settings application.

### Concrete tweaks

1. Establish three clear planes: warm-grey board, white strip, slightly recessed input/code region.
2. Use fewer container outlines, not darker outlines everywhere.
3. Retain the dark primary action. Do not make pending amber the default button colour.
4. Introduce a restrained cool-grey alternative rather than adding more beige variants.
5. Keep metallic or registration details on outer chrome; do not add texture to the white reading planes.

### Existing colour ranking

Only one colour set is exposed for this core theme. It remains the daylight counterpart, not a separate visual concept.

---

## 3. Comms Deck — `hermes-comms-deck`

**Evidence:** `/design` and `/specimen`, [1440 px](/tmp/hermes-taste/07-1440.png), [390 px](/tmp/hermes-taste/07-390.png), [submission state](/tmp/hermes-taste/signature-hermes-comms-deck.png).

### Retain

- Olive-black casing, warm paper and brass controls communicate old communication equipment.
- Circular channel indicators differentiate it from the aircraft vocabulary.
- Green live indicators belong naturally in this material palette.

### What does not work

- **1440 px, design/specimen:** Stencil display type, corner fasteners, dotted rails, lamps and heavy holder frames all announce the theme simultaneously.
- **1440 px, specimen:** The central Questions and responses still read largely like the core system. The comms identity is strongest around the outside.
- **390 px, specimen:** Small stamped labels and condensed uppercase metadata become visual grit.
- **Generic/overdone impression:** A military-console theme pack rather than a specific communication instrument. Too many familiar signifiers; too little channel logic.

### Concrete tweaks

1. Make channel identity the dominant motif: one persistent channel indicator per Agent, visibly changing from pending to answered.
2. Remove some screw heads and perforation treatments. Keep one casing detail, not every available detail.
3. Use stencil type for the board name and equipment labels only. Keep status words, buttons and dense metadata in clearer faces.
4. Style selected options as a decisive patch/connection state, while preserving native radio and checkbox cues.
5. On submission, change the relevant channel indicator in place; let the toast support that transition rather than contain the entire signature.

### Existing colour ranking

1. **Bakelite Olive** — most specific to this world.
2. **Day Watch** — coherent pale equipment casing; useful daylight counterpart.
3. **Night Watch** — readable, but the teal pushes toward a familiar submarine/SaaS hybrid.
4. **Original** — too close to the core dark palette to justify equal prominence.

---

## 4. Deck Handling Board — `hermes-deck-handling`

**Evidence:** `/design` and `/specimen`, [1440 px](/tmp/hermes-taste/12-1440.png), [390 px](/tmp/hermes-taste/12-390.png), [submission state](/tmp/hermes-taste/signature-hermes-deck-handling.png).

### Retain

- Aircraft silhouettes and runway-like markings are understandable without explanatory copy.
- Squared controls and high-visibility yellow fit the handling-board idea.
- The green Original palette provides a recognisably different physical material.

### What does not work

- **1440 px, specimen:** Aircraft marks, dashed edge treatments and yellow holders repeat the same signal at multiple scales.
- **1440 px, specimen:** The screen still reads as a vertical strip queue, not craft organised within a deck vocabulary. The aircraft primarily act as labels.
- **390 px, specimen:** The aircraft consumes scarce callsign space while the surrounding metadata remains verbose.
- **Generic/overdone impression:** Hazard markings are doing too much identity work. More yellow dashes will not make the metaphor more convincing.

### Concrete tweaks

1. Keep the aircraft silhouette; remove redundant runway marks from functional containers.
2. Use small deck-position identifiers in existing strip metadata slots rather than adding more framing.
3. Make the send signature originate from the answered strip or its aircraft marker. The observed toast-level taxi motif feels detached from the item that departed.
4. Differentiate controls through squared geometry and restrained inset depth, not additional warning colour.
5. On mobile, give callsign text priority over the aircraft mark.

### Existing colour ranking

1. **Night Deck** — best balance of operational clarity and restraint.
2. **Original** — strongest deck-board identity, but the yellow needs disciplined use.
3. **Day Plot** — credible daylight alternative; less atmospheric.
4. **Red Lens** — attractive warmth, but reads as brown/red casing rather than a meaningful red-light operating condition.

---

## 5. Flight Director 2169 — `hermes-flight-director`

**Evidence:** `/design` and `/specimen`, [1440 px](/tmp/hermes-taste/17-1440.png), [390 px](/tmp/hermes-taste/17-390.png), [GO state](/tmp/hermes-taste/flight-go.png).

### Retain

- Wide geometric headings distinguish the world immediately.
- The dark approve/reject instrument panel and explicit GO state connect styling to an actual decision.
- Phosphor readouts are more convincing when surrounded by otherwise restrained surfaces.

### What does not work

- **1440 px, specimen:** The wide face makes ordinary Round titles wrap sooner. It increases the apparent size of information that is not always high priority.
- **1440 px, specimen:** Cream paper strips and amber holders still dominate, pulling the world back toward the core board.
- **390 px, specimen:** The wide title face is especially expensive in narrow columns; the full specimen is taller than the dark core capture.
- **Generic/overdone impression:** The geometric type and green displays approach a familiar science-fiction HUD. The GO/NO-GO interaction is more distinctive than the surrounding styling.

### Concrete tweaks

1. Limit the wide face to the board title, short Round titles and GO/NO-GO labels. Use the reading face for long operational names.
2. Keep most controls neutral. Use phosphor for live values and the polling state, not as general emphasis.
3. Make GO, NO-GO and standing-by counts the focal signature; avoid adding more console ornament.
4. Keep the approval panel visually distinct, but reduce competing borders around neighbouring Questions.
5. For Day shift, use a darker green for exposed live marks; reserve bright phosphor for dark readout wells.

### Existing colour ranking

1. **Console slate** — clearest match between material, typography and live state.
2. **Original** — stronger instrument-room character, slightly more synthetic.
3. **Night watch** — coherent, but its warm brown shifts toward another world.
4. **Day shift** — useful functionally; least convincing as this particular identity.

---

## 6. Starship Hermes — `hermes-starship`

**Evidence:** `/design` and `/specimen`, [1440 px](/tmp/hermes-taste/22-1440.png), [390 px](/tmp/hermes-taste/22-390.png), [submission state](/tmp/hermes-taste/signature-hermes-starship.png).

### Retain

- Terracotta, soot and the restrained classical display face distinguish it from the military-console worlds.
- The emblem and meander establish a recognisable cultural reference without explanatory text.
- Kiln Day extends the material idea rather than merely inverting the dark palette.

### What does not work

- **1440 and 390 px, specimen:** The fixed ornamental frame crosses functional content.
- **1440 px, specimen:** Classical display type, modern condensed strip titles and ordinary sans-serif panel headings feel like three separate authors.
- **Original palette, both widths:** Terracotta reading strips turn the signature material into the dominant reading surface. The colour becomes tiring rather than precious.
- **Generic/AI-generated impression:** “Greek ornament plus rust” is the obvious interpretation. The dispatch emblem is the more product-specific opportunity.

### Concrete tweaks

1. Remove the fixed lower frame; retain narrow vertical edge bands.
2. Establish a stricter type relationship: classical face for ship-level identity, one consistent operational face beneath it.
3. Keep terracotta on actions, edge material and the dispatch mark. Keep Questions and Answers on parchment.
4. Make the dispatch seal appear alongside the answered Round’s identity, not only in a general confirmation.
5. Replace the Original palette’s saturated reading strips with pale clay or parchment while preserving its red-figure colour relationship in non-reading regions.

### Existing colour ranking

1. **Soot & Terracotta** — strongest complete identity.
2. **Kiln Day** — most convincing alternative; potentially the better long-reading option.
3. **Patina Watch** — usable, but teal weakens the terracotta identity.
4. **Original · red-figure** — distinctive, but overspends colour on reading surfaces.

---

# Shared composition and gallery findings

## Minor — Comparison thumbnails exaggerate the designs’ sameness

- **Location:** `/overview`, 1440 and 390 px.
- **Evidence:** [Desktop overview](/tmp/hermes-taste/00-1440.png).
- **Observation:** Every tile is dominated by the same amber-and-cream strip composition. The differences most worth judging—GO/NO-GO, dispatch, channel state and aircraft departure—are absent from the static comparison.
- **Fix:** Preserve the same comparison anatomy, but include one small, labelled signature-state sample per tile. Do not make decorative chrome compensate for missing behavioural evidence.

## Minor — `/worlds` is an inspection tool with too much repeated scaffolding

- **Location:** `/worlds`, 1440 and 390 px.
- **Evidence:** [Desktop](/tmp/hermes-taste/01-1440.png), [mobile](/tmp/hermes-taste/01-390.png).
- **Observation:** Repeated live specimen frames make colour comparison a scrolling exercise.
- **Fix:** Show one specimen per world with a local four-option colour selector. Offer an explicit “Compare all colours” expansion for simultaneous inspection.

## Minor — Semantic colour and decoration compete

Across the worlds, amber holders, coloured callsign edges, recommendation green, connection lamps and themed primary actions can all appear together.

**Fix:** Establish a clear order:

1. Current decision and selected Answer.
2. Pending status and policy.
3. Agent identity.
4. Material decoration.

Lower decorative contrast and frequency before reducing semantic contrast. Do not solve visual noise by making text harder to read.

---

# Recommended colour options

**These are palette recommendations, not complete 58-role replacements.** Existing options are retained where appropriate; new proposals are identified.

- **Ink** is for background and surface text, not automatically for filled buttons.
- Ratios below were calculated for flat colours. Across these proposals, ink/background and ink/surface are at least **11.19:1**.
- Primary and state fills each support at least **4.61:1** with the appropriate dark or white label.
- Full adoption still requires checking strip, input, border, focus, disabled and diff roles in the rendered UI.

## Core dark

Key state: **Pending**.

| Option | Background | Surface | Ink | Primary | Pending |
|---|---|---|---|---|---|
| **1. Ops slate — retain** | `#111519` | `#1A1F25` | `#E8E2D0` | `#E9C46A` | `#B17419` |
| 2. Cold watch — new | `#10191E` | `#19262D` | `#E6E9E3` | `#B9D2D1` | `#B27B27` |
| 3. Warm blackout — new | `#171613` | `#24221C` | `#EFE8D6` | `#D8B969` | `#B77A26` |

Use `#111519` labels on these primary and Pending fills. Cold watch reduces the current abundance of warm accents; Warm blackout strengthens the paper-and-equipment relationship.

## Core light

Key state: **Pending**.

| Option | Background | Surface | Ink | Primary | Pending |
|---|---|---|---|---|---|
| **1. Day shift — retain** | `#E4E1D8` | `#F7F6F1` | `#16191D` | `#1F262E` | `#965C0C` |
| 2. Chart paper — new | `#E2E8E7` | `#F7FAF9` | `#17242A` | `#264D5A` | `#885B12` |
| 3. Warm drafting — new | `#E9E1D2` | `#FFFCF5` | `#28221B` | `#493D2D` | `#8A5916` |

Use white labels on primary and Pending fills. Chart paper is the strongest candidate for reducing the current beige administrative character.

## Comms Deck

Key state: **Live/channel connected**.

| Option | Background | Surface | Ink | Primary | Live |
|---|---|---|---|---|---|
| **1. Bakelite Olive — retain** | `#13150E` | `#1D2016` | `#ECE6D1` | `#C99A3C` | `#62B552` |
| 2. Day Watch — retain | `#D6CFBA` | `#E4DDC9` | `#1B1A14` | `#2F3A26` | `#1D6B33` |
| 3. Night Watch — retain | `#07151A` | `#0B222A` | `#E2ECEC` | `#8FC9CF` | `#58B77A` |

Use dark labels for Olive and Night Watch fills; white for Day Watch. Keep brass scarce enough that green channel state remains identifiable.

## Deck Handling Board

Key state: **Pending craft/decision**.

| Option | Background | Surface | Ink | Primary | Pending |
|---|---|---|---|---|---|
| **1. Night Deck — retain** | `#14191D` | `#1D2429` | `#E8E3D5` | `#E2B54A` | `#966B15` |
| 2. Deck green / Original — retain | `#1C261F` | `#232F27` | `#E9EADF` | `#F0C419` | `#926D0F` |
| 3. Day Plot — retain | `#D6DBD3` | `#F4F3EE` | `#15191C` | `#1F3A4A` | `#875800` |

Use white labels on Pending fills. Use dark primary labels for Night Deck and Deck green; white for Day Plot. Keep safety yellow out of ordinary separators.

## Flight Director 2169

Key state: **Live instrument/poll**.

| Option | Background | Surface | Ink | Primary | Live |
|---|---|---|---|---|---|
| **1. Console slate — retain** | `#101519` | `#1A2228` | `#E4E1D7` | `#E6DCC0` | `#7DF0A8` |
| 2. Night watch — retain | `#0F0C0B` | `#1C1715` | `#ECE0D2` | `#E9C9A0` | `#6FE6C8` |
| 3. Day shift — refine Live | `#D4D1C6` | `#ECEBE5` | `#1A1C1D` | `#23343E` | `#256D44` |

Use dark labels on dark-mode primary/live fills; white on Day shift fills. The proposed daytime green is for exposed indicators; bright phosphor can remain inside dark readout wells.

## Starship Hermes

Key state: **Pending dispatch**.

| Option | Background | Surface | Ink | Primary | Pending |
|---|---|---|---|---|---|
| **1. Soot & Terracotta — retain** | `#15110E` | `#201A15` | `#EDE4D6` | `#CF6A43` | `#A8762A` |
| 2. Kiln Day — retain | `#EBE2D3` | `#F7F1E7` | `#1E1712` | `#A3431F` | `#8A5A0C` |
| 3. Oxide watch — new | `#1C1412` | `#2B1E19` | `#F0E3D3` | `#DB8C62` | `#B77E32` |

Use dark labels on Soot and Oxide fills; white on Kiln Day. Oxide watch is a warmer alternative to Patina Watch without surrendering the world’s terracotta identity.

---

# Accessibility and verification

## Observed accessibility findings

| Severity | Location | Evidence | Impact and fix |
|---|---|---|---|
| Minor | Every inspected `/specimen`, both widths | axe: **“Heading levels should only increase by one”**; `Pending Rounds` is an `h3` below the page `h1` | Screen-reader heading navigation receives a misleading hierarchy. Change the semantic level without changing its visual size. |
| Minor | Every inspected `/design`, both widths | axe: **“Landmarks should have a unique role or role/label/title … combination”** | Repeated Round and log demos are difficult to distinguish. Give each demo landmark a unique contextual accessible name. |
| Minor | `/worlds`, both widths | axe reported heading-order and duplicate-landmark findings inside specimen frames | Fix the specimen heading level and disambiguate repeated framed regions. |

No axe contrast violation was reported in these runs. Axe left incomplete checks; this is not a complete WCAG conformance result.

## Checked

- **Captures:** All **28 supplied URLs**, at **1440 × 1000** and **390 × 1000**: **56 primary captures**, plus component-detail and interaction captures.
- **Routes:** `/overview`, `/worlds`, `/design`, `/specimen`.
- **Themes:** Both core themes and all four worlds.
- **Colours:** Every supplied world palette URL, including each Original.
- **Density:** Supplied dark compact and glance URLs; also changed the visible density control to Glance and observed a `3rem` target token.
- **Overflow:** Document horizontal overflow measured **0 px** across all 56 primary page-viewports. This does not imply that deliberately scrollable code content has no internal overflow.
- **Keyboard:** `j`/`k`, numeric option selection, `a`/`r`, empty submission and `Cmd+Enter`.
- **Questions:** Single choice, multiple choice, free text and approve/reject exercised. Two dark-core Rounds submitted; pending counts and confirmation status updated.
- **World states:** Submitted a Round in all four worlds; inspected Flight Director’s GO state and the other worlds’ submission signatures.
- **Focus:** Observed a visible **2 px** orange outline on a keyboard-focused attachment in the mobile glance specimen.
- **Touch sizing:** Mobile glance option rows measured approximately **59–100 px** high; approve/reject controls **60 px**; Send Answer **48 px**.
- **Reduced motion:** Browser emulation matched the reduced-motion preference; all six inspected motion-duration variables resolved to **1 ms**.
- **Gates:** `npm run validate` passed. `npm run test:validator` passed **42/42**.
- **Limits:** No screen-reader session, physical touch test or cross-browser pass. Source detector not run. No files edited; no servers started or stopped.
- **Evidence directory:** `/tmp/hermes-taste/`; palette readings and axe results are recorded in `observations.json`.

# Prioritised action table

Effort: **S** = local styling/content change; **M** = shared component or controller change; **L** = responsive flow change.

| ID | Design | Change | Severity | Effort |
|---|---|---|---|---|
| TR-01 | All | Replace mobile queue-plus-detail stacking with focused queue/detail navigation | Major | L |
| TR-02 | All | Move submission confirmation outside the next Round’s Answer-bar area | Major | M |
| TR-03 | Starship | Remove the fixed bottom ornament; retain vertical edge bands only | Major | S |
| TR-04 | All | Suppress selected-strip Question summaries while the adjacent detail panel is visible | Minor | M |
| TR-05 | All | Collapse optional notes; reduce the pinned tray to essential completion and submission controls | Minor | M |
| TR-06 | All `/design` | Collapse the mobile section index and expose the first specimen sooner | Minor | M |
| TR-07 | All | Reduce nested framing; preserve strong boundaries for holders, focus and selected Answers | Minor | M |
| TR-08 | Comms Deck | Make channel-state change the signature; remove redundant stencil and casing ornament | Minor | M |
| TR-09 | Deck Handling | Attach aircraft departure to the answered strip; remove repeated hazard markings | Minor | M |
| TR-10 | Flight Director | Restrict wide display type; make GO/NO-GO polling the dominant signature | Minor | M |
| TR-11 | Starship | Unify operational typography and restore parchment reading planes in Original | Minor | M |
| TR-12 | Core light | Strengthen board/strip/input plane separation without adding more outlines | Minor | S |
| TR-13 | `/overview`, `/worlds` | Show signature-state evidence; reduce repeated specimen scaffolding | Minor | M |
| TR-14 | All | Correct specimen heading levels and give repeated demo landmarks unique names | Minor | S |
| TR-15 | Colour system | Keep the ranked defaults; prototype proposed core alternatives before adding menu options | Nit | M |


---

## Resolution (2026-11-20)

The owner paused further review passes after this report. These items were applied before the pause. Status per item:

| ID | Status | Notes |
|---|---|---|
| TR-01 | done | Below 48rem the bay shows either the pending list or the open Round as a full-width sheet, with Back to pending and focus management. |
| TR-02 | done | Confirmations land in a reserved `.hh-bay-status` region above the bay. |
| TR-03 | done | Starship: fixed frame removed; meander on the two outer edges only. |
| TR-04 | done | Bay strips no longer expand; policy shown once; recommended markers only in the open Round. |
| TR-05 | done | Notes fold into an Add notes disclosure; Answer bar holds completion count, Send and error. |
| TR-06 | done | `/design` index behind On this page at 390. |
| TR-07 | done | Nested framing removed in core and all four worlds. |
| TR-08 | done | Comms Deck: channel number and lamp states carry identity; stencil and casing ornament removed. |
| TR-09 | done | Deck Handling: departure plays on the answered strip; hazard markings removed. |
| TR-10 | done | Flight Director: Michroma off operational titles; GO/NO-GO poll is the dominant signature. |
| TR-11 | done | Starship: three families, parchment reading planes in Original. |
| TR-12 | done | `hermes-light`: darker board, deeper tray, recessed inputs and code. |
| TR-13 | done | `/overview` tiles include a signature sample; `/worlds` cards lead with a live frame and Play signature. |
| TR-14 | done | Heading levels by context; unique landmark names. |
| TR-15 | done | Ranked defaults kept; no new palettes added. |

Gates after the fixes: `npm run validate`, `npm run test:validator`, `npx tsc --noEmit` and `npm run build` pass with no warnings; a browser pass of `/overview`, `/worlds`, `/design` and `/specimen` across themes and worlds at 1440 and 390 showed no console errors and no horizontal scroll.
