# Splitbook design taste review

## Verdict: fix then ship

The five designs are distinguishable, but mobile Swim rows overlap, Capture undo targets miss their size floor, and the worlds lean too heavily on stencil type and repeated borders instead of their individual signatures.

## Priority findings

### Major — Swim rows collide at 390 px across every design

- **Location:** `/design` → “Swim, Session and Set rows”; all five themes; 390 px.
- **Evidence:** [Mobile row comparison](/tmp/splitbook-taste/dw-rows-390-sheet.jpg). Metric labels cross into the Swim description; values collide with titles; the noted-fault badge overlaps the final row’s numbers. Deck’s larger type intensifies the collision.
- **Impact:** Readers cannot reliably associate counts, ratings and times with their labels. Absence of horizontal page overflow conceals the internal layout failure.
- **Fix:** Below the mobile breakpoint, make `.sb-swim-row` a two-part composition: full-width Swim identity, then a metric grid. Put the Fault summary on its own full-width line. Allow labels to wrap; keep each value and label together. Do not solve this by shrinking type.

### Major — Per-event Undo controls are too small for Capture

- **Location:** `/specimen`, after a counter tap and wall tap; all themes; both widths.
- **Evidence:** Event-log Undo buttons measured **36 px high** in Light and the worlds; **42 px high** in Deck. Capture requires 48 px, or 56 px in Deck. The larger “Undo last tap” button does not correct the smaller independent targets.
- **Impact:** The controls needed to correct individual mistakes are the least forgiving targets for wet fingers.
- **Fix:** Remove the small-size treatment from `.sb-tap-log` actions. Bind their minimum height to `--sb-button-min-target`, including Deck’s override.

### Major — Mobile scroll regions lack keyboard access

- **Location:** `/design`; all themes; 390 px.
- **Evidence:** axe reported:

  > `[serious] scrollable-region-focusable: Scrollable region must have keyboard access`

  Affected regions include the typography table, Deck comparison, data-display table, formula preview and recipe code block.
- **Impact:** Keyboard users cannot consistently reach content clipped inside horizontal scrollers.
- **Fix:** Give overflowing wrappers `tabindex="0"`, an appropriate accessible name and a visible focus ring. The rendered wrappers are wrong; the documented focusable-scroll-region contract is correct.

---

## 1. Pace Clock Light

**Evidence:** [Desktop and mobile specimens](/tmp/splitbook-taste/core-sheet.jpg), [mobile rows](/tmp/splitbook-taste/dw-rows-390-sheet.jpg).

### Taste

- **Keep:** The off-white canvas, black action buttons and blue captured counts. On `/specimen` at 1440 px, these establish a legible distinction between action, measurement and recording without needing decorative imagery.
- **Generic:** The rounded outlined panels, circular rating controls and full-width black Save button could belong to almost any competent form application. The numerical hierarchy supplies more identity than the surrounding components.
- **Overdone:** On `/specimen` at 390 px, the Review sheet has an outer frame, section frames, control outlines and another frame around the save area. These produce boxes within boxes rather than a clear reading sequence.
- **Composition:** At 1440 px, the running split is substantially louder than the captured counts. The first impression is a stopwatch with an attached form, not a technique-recording tool.
- **Mobile:** The specimen is a long stack of Capture followed by Review. The review’s final action sits well beyond the initial viewport, while ready-state Capture spends substantial space on disabled keys.

### Recommended tweaks

1. Keep the Tap Pad perimeter; remove redundant Review-section rectangles. Separate review sections with spacing and a single rule.
2. Keep the running split dominant during recording, but promote counts and technique in the ended/review state.
3. Use a consistent metric cluster: prominent value, directly attached unit, then a short label. Apply the same grouping to Swim rows.
4. For a task-facing mobile Capture screen, show only Capture while recording; transition to Review after ending. Keep the side-by-side arrangement for the desktop specimen.
5. Give rating selection an unmistakable shape cue—a check alongside the numeral—not just a filled circle.

### Existing colour ranking

Only **one Light palette** is exposed. There are no existing Light alternatives to rank. Keep the current Chalk palette first.

### Recommended colour options

| Rank | Option | Background | Surface | Ink | Primary | Recording state |
|---|---|---|---|---|---|---|
| 1 | Chalk — current | `#F4F5F1` | `#FFFFFF` | `#121517` | `#121517` | `#C4241A` |
| 2 | Porcelain | `#F1F3F4` | `#FCFDFD` | `#151A1D` | `#151A1D` | `#B52B22` |
| 3 | Warm tile | `#F3F0E8` | `#FFFDFA` | `#201E1A` | `#201E1A` | `#AF2D24` |

Use white text on Primary and Recording. These directions preserve semantic red without turning the whole interface into a red-branded application.

---

## 2. Pace Clock Deck

**Evidence:** [Core specimens](/tmp/splitbook-taste/core-sheet.jpg), [live mobile comparison](/tmp/splitbook-taste/live-390-sheet.jpg).

### Taste

- **Keep:** The yellow figures on the black recording plate. This is the most immediately recognisable product-specific element in either core theme.
- **Keep:** The larger physical controls. The measured mobile Wall target is **274 × 96 px**.
- **Generic:** Outside the live plate, Deck reads as enlarged Light. That is appropriate for an operational mode; it does not need another decorative identity.
- **Overdone:** The large outlined rating circles occupy substantial width without exposing their individual cue text. At 390 px, they look like a survey scale rather than a poolside observation tool.
- **Composition:** Larger padding leaves the live controls only 274 px wide inside a 390 px viewport. The Underwater kicks label wraps, while several nested containers consume the missing width.
- **Hierarchy:** “Undo last tap” and “End early” become separate stacked rows on mobile. That makes the correction area tall and puts ending close to routine correction work.

### Recommended tweaks

1. Preserve Deck’s target sizes; reclaim width by removing redundant nested Capture wrappers.
2. Put End Swim in the slim app bar, away from routine tapping. Reserve the lower action area for Wall and undo.
3. Render mobile rating choices as full-width labelled rows with the number and cue visible. The current horizontal numeral-only presentation disagrees with the component contract.
4. Keep yellow confined to recording figures and the live Wall action. Do not expand it into section decoration.
5. Use Deck’s increased space between actionable groups, not between every nested border.

### Existing colour ranking

Only **one Deck palette** is exposed. Keep the current glare-oriented palette; do not treat the dark worlds as equivalent poolside replacements.

### Recommended colour options

| Rank | Option | Background | Surface | Ink | Primary | Recording plate → figures |
|---|---|---|---|---|---|---|
| 1 | Glare — current | `#F6F7F3` | `#FFFFFF` | `#0B0D0E` | `#0B0D0E` | `#0A0C0D` → `#FFD21A` |
| 2 | Neutral deck | `#F0F2EF` | `#FFFFFF` | `#0B0D0E` | `#0B0D0E` | `#0A0C0D` → `#FFE04A` |
| 3 | Warm deck | `#F7F3E8` | `#FFFEF8` | `#11120F` | `#11120F` | `#0A0C0D` → `#FFD21A` |

Use white on Primary. Yellow belongs **on the dark plate**, never as small text on the pale surfaces.

---

## 3. Approach Lights

**Evidence:** [Desktop palette comparison](/tmp/splitbook-taste/approach-lights-1440-sheet.jpg), [mobile palette comparison](/tmp/splitbook-taste/approach-lights-390-sheet.jpg), [live states](/tmp/splitbook-taste/live-390-sheet.jpg).

### Taste

- **Keep:** The numbered bulbs in the dark Length strip. On `/specimen`, they communicate the world through an actual progress representation rather than an unrelated illustration.
- **Keep:** Deck Daylight’s grey-green outer material and warmer reading plane. It separates chassis from content without simulated glass or noise.
- **Overdone:** Dot-chain dividers recur in the app bar, Tap Pad header and Set grouping. Repetition weakens the idea: some lights represent progress, others merely decorate a boundary.
- **Generic/AI-styled:** Amber date tiles, condensed headings, widely tracked technical captions and panel outlines accumulate into a familiar “retro instrument dashboard” recipe.
- **At 390 px:** Uppercase metric labels such as “STROKES PER LENGTH” are too expansive for the narrow Swim rows. The light-chain identity does not compensate for broken text composition.
- **Palette:** Blue Hour and Sodium Night introduce enough bright controls and cool highlights that the world moves toward a conventional cockpit UI. Fresnel Sand feels more materially specific.

### Recommended tweaks

1. Make numbered Length bulbs the primary signature. Use an unlit structural rule for ordinary separators.
2. Keep condensed type for headings and short identifiers; return units and explanatory labels to the reading face.
3. Remove amber emphasis from routine calendar dates. Reserve the luminous accent for meaningful indicators.
4. Keep the dark Length rail in the light palettes, but avoid putting every selected control on another dark plate.
5. In Blue Hour, reduce the visual area occupied by pale-blue action fills; retain them for the principal action rather than every selectable element.

### Existing colour ranking

1. **Deck Daylight** — clearest material separation and least theatrical.
2. **Fresnel Sand** — strongest alternative; warmer and more tactile.
3. **Blue Hour** — readable, but closer to a standard dark technical dashboard.
4. **Sodium Night** (`original`) — amber, coral and blue compete for ownership.

### Recommended colour options

Keep the first three existing options rather than adding another near-duplicate.

| Rank | Option | Background | Surface | Ink | Primary | Recording state |
|---|---|---|---|---|---|---|
| 1 | Deck Daylight | `#DCDDD5` | `#F5F4EF` | `#14181D` | `#1F3A5C` | `#AD2E19` |
| 2 | Fresnel Sand | `#E3DBC7` | `#F6F1E4` | `#1E1C16` | `#3D4829` | `#B12F1B` |
| 3 | Blue Hour | `#111923` | `#1A2431` | `#E6EDF5` | `#A7C8FF` | `#FF7A59` |

Use white on Primary and Recording in the light options. Blue Hour uses `#0B1522` on Primary and `#1A0B06` on Recording.

---

## 4. Flight Deck

**Evidence:** [Desktop palettes](/tmp/splitbook-taste/flight-deck-1440-sheet.jpg), [mobile palettes](/tmp/splitbook-taste/flight-deck-390-sheet.jpg), [live comparison](/tmp/splitbook-taste/live-390-sheet.jpg).

### Taste

- **Keep:** The charcoal/cream/yellow relationship. It reads as operational equipment before the copy is read.
- **Keep:** The green counters against the yellow Wall key. These distinguish measurement from the recording action.
- **Overdone:** Hazard chevrons appear beneath the app bar and on both edges of the Wall key. In the live state, yellow key fill, chevrons and the yellow split plate all compete.
- **Generic/AI-styled:** Stencil headings plus hazard stripes plus dark panels is a common industrial-interface shortcut. Here those cues sometimes substitute for a more specific interaction identity.
- **At 1440 px:** The Review sheet has nearly the same material intensity as the Tap Pad. The eye has no clear quiet plane to return to.
- **At 390 px:** Long uppercase fault labels and stencil headings make the Review sheet feel more severe than observational.
- **Primer:** The pale material improves reading, but the live fill becomes brown-gold. It loses the immediate safety-yellow association.

### Recommended tweaks

1. Keep one chevron treatment around the Wall action. Remove the page-wide hazard strip and the duplicate edge treatment.
2. Let the catapult acknowledgement carry the signature: one bounded sweep on a wall tap, then a quiet resting state.
3. Restrict stencil type to world identity and short panel titles. Use the reading face for faults, instructions, units and buttons.
4. Flatten the Review plane: opaque matte surface, fewer internal boxes, restrained borders.
5. For Primer, use a dark live plate with yellow figures rather than trying to make yellow itself pass as a boundary on a pale surface.

### Existing colour ranking

1. **Non-skid** — strongest alignment between material, controls and recording colour.
2. **Primer (day deck)** — useful daylight alternative, with the live-treatment adjustment above.
3. **Night recovery** — coherent but less materially distinctive; familiar navy technical UI.
4. **Original (haze grey)** — the mid-grey surfaces make the whole screen feel flatter and less decisively composed.

### Recommended colour options

| Rank | Option | Background | Surface | Ink | Primary | Recording state |
|---|---|---|---|---|---|---|
| 1 | Non-skid | `#1E2224` | `#2A2F32` | `#F2EFE6` | `#F2EFE6` | `#FFD21F` |
| 2 | Primer — existing base | `#E3E1DA` | `#F7F6F2` | `#15171A` | `#15171A` | `#8A6100` |
| 3 | Night recovery | `#10161D` | `#18212B` | `#E9EEF2` | `#E9EEF2` | `#FFB547` |

Non-skid uses `#141719` on Primary and Recording. Primer uses `#F7F6F2` on Primary and white on its existing Recording fill. Night recovery uses `#10161D` on both.

---

## 5. Sortie Board

**Evidence:** [Desktop palettes](/tmp/splitbook-taste/sortie-board-1440-sheet.jpg), [mobile palettes](/tmp/splitbook-taste/sortie-board-390-sheet.jpg), [Session/Swim rows](/tmp/splitbook-taste/dw-rows-390-sheet.jpg).

### Taste

- **Keep:** Matte slate, cream type and orange recording state. The default has a coherent briefing-board relationship without relying on black-and-yellow hazards.
- **Keep:** Square rating controls and ruled rows. These belong more naturally to a board than the circular controls used in the core.
- **Identity gap:** On `/specimen`, the dominant object remains a boxed stopwatch. The promised board is more convincing in `/design`’s Session and Swim rows than in the primary specimen.
- **Generic/AI-styled:** Condensed uppercase text, monospaced captions and dark rectangular panels overlap heavily with Flight Deck. With colour removed, the two worlds depend too much on type treatment for differentiation.
- **At 390 px:** The narrow uppercase labels and strong rules compress the Review sheet into a dense control panel. “Board” should mean alignment and record structure, not simply more capitals.
- **Original:** Navy plus yellow Primary reads more like a military command dashboard than a quietly maintained launch record.

### Recommended tweaks

1. Make a ruled Swim record the signature composition: identifier, Length state, counts and completion state in aligned fields.
2. Tie the print-in treatment to completing a Length or ending a Swim; do not spend it on unrelated panel entrances.
3. Keep condensed uppercase for row identifiers and short headings. Use sentence case for faults and explanatory labels.
4. Separate this world from Flight Deck through rules, column alignment and a paper-strip completion record—not more borders around individual controls.
5. Keep orange exclusively as recording emphasis; leave the principal Save action cream.

### Existing colour ranking

1. **Ready Room** — slate and signal orange give the clearest hierarchy.
2. **Haze Gray** — the most useful light alternative; reads as an actual maintained board.
3. **Grease Board** — materially distinctive, but yellow Primary competes with the warm recording and fault colours.
4. **Original** — navy and yellow are less specific to this world and too close to generic command-centre styling.

### Recommended colour options

| Rank | Option | Background | Surface | Ink | Primary | Recording state |
|---|---|---|---|---|---|---|
| 1 | Ready Room | `#22282E` | `#2F373F` | `#ECE7DA` | `#ECE7DA` | `#F27452` |
| 2 | Haze Gray | `#D2D6D8` | `#EBECEA` | `#12171C` | `#1B2129` | `#B0271D` |
| 3 | Grease Board | `#20241E` | `#2E342B` | `#EEEAD6` | `#F2D15A` | `#FF8357` |

Ready Room uses `#1E2328` on Primary and `#1A1310` on Recording. Haze Gray uses `#F3F3F0` on Primary and white on Recording. Grease Board uses `#1D200F` on Primary and `#1E120C` on Recording.

---

## Cross-design findings

### Minor — Mobile documentation chrome delays the design itself

- **Location:** `/design`, all themes, 390 px.
- **Evidence:** [Mobile first viewports](/tmp/splitbook-taste/design-mobile-sheet.jpg). Theme, density, Contents, introductory copy and navigation links consume most of the opening screen.
- **Impact:** A visitor comparing designs sees documentation controls before meaningful specimens.
- **Fix:** Keep Theme and Colour immediately available; collapse Density and secondary links into the contents area. Bring one live component into the initial viewport.

### Minor — The gallery describes signatures before demonstrating them

- **Location:** `/worlds`, 1440 and 390 px.
- **Evidence:** [Desktop gallery](/tmp/splitbook-taste/worlds-loaded-1440.webp), [mobile gallery](/tmp/splitbook-taste/worlds-loaded-390.png). The large frames open in Ready state; mobile visitors read substantial explanatory copy before reaching each interactive preview.
- **Impact:** The worlds are compared primarily through palettes and typography, not their distinguishing product-state behaviour.
- **Fix:** Add one visible “Try wall tap” demonstration control per preview, using the real controller. Keep the summary to one sentence before the preview; move the signature explanation below it.

### Minor — Heading and landmark semantics repeat across specimens

- **Location:** All `/specimen` variants; `/design`; `/worlds` embedded specimens.
- **Evidence:** axe reported `heading-order` on the Tap Pad heading and `landmark-unique` on repeated forms/regions.
- **Impact:** Screen-reader heading and landmark navigation becomes less predictable.
- **Fix:** Use the correct heading level for standalone versus embedded specimens, and uniquely name repeated Review forms, Set regions and publish bars.

### Minor — Review save feedback implies a linked Swim while Capture is still recording

- **Location:** `/specimen`, all five designs.
- **Evidence:** Saving the Review sheet produced **“Saved. Metric trends now include this Swim.”** while the adjacent Tap Pad remained **Recording**.
- **Impact:** The preview suggests one coherent workflow while its two halves behave as independent demos.
- **Fix:** Either connect the controller transition from ended Capture to Review, or label the Review explicitly as a separate illustrative Swim. Do not imply live product persistence from an independent specimen.

## Colour verification

The 15 recommended directions were checked numerically for the pairs specified above:

- Lowest ink contrast against background or surface: **9.78:1**.
- Lowest Primary/on-Primary contrast: **9.73:1**.
- Lowest Recording/on-Recording contrast: **5.54:1**.
- Lowest Recording boundary contrast against the listed surface: **4.25:1**.
- Deck’s proposed yellow-on-black recording pairs: **13.52:1–14.94:1**.

These are plausible AA starting points, not complete theme certification. Muted text, inputs, focus rings, fault colours, charts and every interaction state still require their full token-pair checks. The proposed core alternatives are recommendations, not rendered implementations.

## Checked

- **Coverage:** All **21 supplied URLs**, captured at **1440 and 390 CSS px**, with a 1000 px viewport height. Specimens and galleries received full-page captures; `/design` received first-viewport and targeted form/row captures.
- **Themes:** Light, Deck, Approach Lights, Flight Deck and Sortie Board.
- **Palettes:** Every supplied world palette, including each `original`.
- **Visual evidence:** Two batched capture rounds; captures opened directly or in labelled comparison sheets. Gallery previews were loaded before the final gallery captures.
- **Interactions:** Start Swim; counter tap; keyboard Space on focused Wall; wall undo; rating selection and ArrowLeft; Fault toggle; Review count increment; Save Swim. Exercised across all five designs at both widths.
- **Keyboard focus:** Deck Profile control and Wall key showed a visible **3 px** focus outline.
- **Reduced motion:** Deck’s six motion-duration tokens resolved to **1 ms** with reduced motion enabled.
- **axe:** Run on all 42 URL/viewport combinations. Findings above; incomplete results were not treated as passes.
- **Mechanical gates:** `npm run validate` passed. `npm run test:validator` passed **37/37** tests.
- **Server/files:** Used the existing server; started or stopped none. No repository files edited.
- **Method limitation:** The review role required consulting the system contract and running its gates; this is therefore not a fully context-blind review. Taste observations above are tied to the rendered surfaces.
- **Not established:** Real-device sunlight performance, screen-reader announcements, complete keyboard-path coverage or full WCAG conformance.

## Prioritised action table

Effort: **S** = local component/token adjustment; **M** = responsive composition or controller work.

| ID | Design | Change | Severity | Effort |
|---|---|---|---|---|
| TR-01 | All | Recompose mobile Swim rows into identity, metric grid and full-width Fault summary; eliminate overlapping text. | Major | M |
| TR-02 | All / Deck | Raise per-event Undo targets to 48 px / 56 px through `button-min-target`. | Major | S |
| TR-03 | All | Make overflowing tables and code regions keyboard-focusable and named. | Major | S |
| TR-04 | Deck | Use full-width mobile rating choices with visible cue text. | Minor | M |
| TR-05 | All | Clarify or connect the independent Capture and Review demos; remove misleading save implications. | Minor | M |
| TR-06 | Light / Deck | Remove redundant nested Review frames; retain section spacing and structural rules. | Minor | S |
| TR-07 | Flight Deck | Reduce chevrons to one meaningful Wall-action treatment; quiet the Review plane. | Minor | S |
| TR-08 | Sortie Board | Make aligned records and the state-triggered print strip—not stencil type—the defining signature. | Minor | M |
| TR-09 | Approach Lights | Reserve light chains for numbered progress; remove ornamental repetitions and amber date emphasis. | Minor | S |
| TR-10 | All worlds | Restrict stencil/condensed uppercase to short identifiers; restore readable labels and observer notes. | Minor | S |
| TR-11 | Galleries | Put a real, triggerable signature demonstration ahead of long explanatory copy. | Minor | M |
| TR-12 | All | Correct standalone heading levels and uniquely name repeated landmarks. | Minor | S |
| TR-13 | `/design` | Compress mobile documentation chrome so a meaningful specimen appears sooner. | Minor | S |
| TR-14 | Colour system | Retain the ranked defaults; use the proposed alternatives selectively rather than adding more similar palettes. | Nit | S |


---

## Resolution (2026-11-20)

The owner paused further review passes after this report. These items were applied before the pause. Status per item:

| ID | Status | Notes |
|---|---|---|
| TR-01 | done | Swim rows below md: identity, wrapping value-over-label figures, full-width fault line; three fixed right-aligned columns from md. |
| TR-02 | done | Tap-log Undo at `--sb-button-min-target` (48 px Light, 56 px Deck and Deck sizing). |
| TR-03 | done | All 8 overflowing table/code regions focusable, uniquely named, with the focus ring. |
| TR-04 | done | Below md, rating levels are full-width rows with number, cue and check; from md, round steps with a check badge. |
| TR-05 | done | `/specimen` Review shows the Swim captured on the Tap Pad; `/design` Review sheets labelled illustrative. |
| TR-06 | done | Framed trays replaced by unframed `.sb-action-row`. |
| TR-07 | done | Flight Deck: one chevron band on the Wall key, flat Review plane, B612 as operational face, Primer live as dark plate with yellow figures. |
| TR-08 | done | Sortie Board: aligned board columns for Swim/Session rows; long print reserved for Swim completion. |
| TR-09 | done | Approach Lights: numbered Length bulbs are the only lamps; amber removed from routine dates. |
| TR-10 | done | Sentence case restored in all three worlds; capitals only on short status/identity marks. |
| TR-11 | done | `/worlds` cards lead with a live mid-Swim frame and a Try wall tap button. |
| TR-12 | done | Heading levels, specimen skip link, unique landmark names. |
| TR-13 | done | `/design` at 390: Theme/Colour first, Density and links in Contents, live read-out in the first viewport. |
| TR-14 | done | Ranked defaults kept; no new palettes added. |

Gates after the fixes: `npm run validate`, `npm run test:validator`, `npx tsc --noEmit` and `npm run build` pass with no warnings; a browser pass of `/overview`, `/worlds`, `/design` and `/specimen` across themes and worlds at 1440 and 390 showed no console errors and no horizontal scroll.
