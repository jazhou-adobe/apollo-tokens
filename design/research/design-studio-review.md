## Verdict

**Rework.** The token system passes its gates; the rendered system still has a broken mobile composition, incomplete keyboard contracts, and worlds differentiated more by lettering and decoration than by an authored visual language.

**Overall: 6.0/10 against the requested studio-level bar.** This is not a WCAG score or a percentage of implemented components.

## Studio scores and aesthetic direction

| Design | Intended aesthetic | Score | Studio-level execution versus what ships |
|---|---|---:|---|
| **Core dark** | **Carrier-ops industrial modernism**: cream flight strips, slate equipment, instrument typography. | **6.5/10** | A studio would make priority unmistakable through disciplined alignment, controlled contrast and economical metadata. Here, amber holders, green recommendations, coloured callsigns, cyan live counts and orange selection compete. The expanded strip repeats the Questions already displayed alongside it. Too much emphasis; insufficient hierarchy. |
| **Core light** | **Day-shift aviation paperwork**: Swiss operational graphics on a physical working board. | **6.8/10** | A studio would treat this as a precise printed information system: consistent rules, aligned identifiers, deliberate white space. Here, holders, panels, options, chips and badges repeatedly box the same information. It reads as a component catalogue assembled into a screen rather than one composed instrument. |
| **Comms Deck** | **Bakelite naval communications console**: patch bays, channel lamps, enamel plates. | **6.3/10** | A studio would build identity around channel addressing, connection state and the act of patching. The shipped screen leans on olive, stencil lettering, bevels and small lamps. Those are recognisable references, but also familiar military-retrofuture shorthand. The channel model needs to carry more identity than the stencil font. |
| **Deck Handling Board** | **Carrier deck-planning board**: cut-plastic craft templates, zone markings, technical drafting. | **5.9/10** | A studio would make position and dispatch feel spatially consequential. The shipped experience remains a vertical strip queue with aircraft silhouettes and deck-line decoration. The launch happens inside a toast, not from the craft’s position on the board. The central metaphor is illustrated, not enacted. |
| **Flight Director 2169** | **Apollo mission-control modernism pushed forward**: modular consoles, annunciators, GO/NO-GO polling. | **5.6/10** | A studio would use broad geometry sparingly, with compact technical lettering doing the operational work. Michroma is instead used for everyday Round titles at **15px**, smaller than the **17px** Question prompts. The result is a familiar “sci-fi font” treatment with weakened scanning hierarchy. |
| **Starship Hermes** | **Hellenic merchant-freighter industrialism**: terracotta, soot, hull inscriptions, courier insignia. | **5.8/10** | A studio would establish one convincing shipboard identity: a distinctive dispatch emblem, serial system and restrained inscriptional typography. Here, Marcellus SC, Saira Condensed, Instrument Sans and Plex Mono coexist with meanders, rivets, bevels and a stamp. Too many explanations of the idea. It risks “Greek-themed console” rather than a believable working ship. |

**Text-removal test:** the worlds would still share nearly the same cream rectangles, amber frames and dark workbench. Comms lamps, deck markings and Starship’s meander survive, but the differences are primarily surface cues. Preserve the shared anatomy; make its parts speak more distinctly. Do not solve this by forking page layouts.

Visual comparison: [six base specimens](/tmp/hermes-studio-review/base-specimens.jpg).

## Findings

### Major

#### ST-01 — The sticky Answer bar covers content before the Round reaches the viewport

- **Location:** `/specimen?theme=hermes-dark&density=glance`, 390px; `design/preview/hermes-components.css:1612`.
- **Evidence:** At initial scroll, the Round header occupied **y=1700–1867**, while the sticky Answer bar occupied **y=1700–1899**. The first Question began at **y=1867**. The bar therefore covered the header and the beginning of the Question. The captured mobile pages show notes and Send appearing before the Questions.
- **Impact:** Phone users encounter submission controls before the content they must evaluate. Status and policy information are obscured.
- **Fix:** Correct the shared `.hh-round` scroll model. Keep the Answer bar in normal flow until its intended sticky boundary, or make it the footer of the documented Round sheet with a separately scrolling Question region. Reserve its occupied space; do not patch this with world-specific offsets.

#### ST-02 — Phone triage is a long desktop stack, not the documented glance experience

- **Location:** `/specimen`, all six designs, 390px; `design/app/specimen/page.tsx:14`.
- **Evidence:** In glance density, the bay was **1,447px tall** and the open Round began at **y=1699**. The page had no bottom navigation or Round sheet. Keyboard hints remained visible. “Open Round” measured **38.39px high**, below the documented 48px glance target.
- **Impact:** A phone user must pass the entire queue to reach the decision. Enlarging the desktop layout makes the distance worse.
- **Fix:** Implement the existing phone blueprint: pending list → full-screen Round sheet → sticky Answer bar → return to pending. Hide keyboard hints in glance. Give the entry action the normal glance target, not `control-size-sm`.
- **Contract judgment:** The implementation is wrong; `patterns/phone-blueprints.md` already specifies the required structure.

#### ST-03 — The working keyboard subset is presented as a complete keyboard system

- **Location:** `design/preview/components/hermes/StripBay.tsx:159,238,299`; `QuestionBlock.tsx:99–107`.
- **Evidence:**
  - `j/k`, digits, `a/r` and Command+Enter worked.
  - Tab after the first strip entered its inner **Open Round** button; the bay was not one roving Tab stop.
  - The bay had no composite role; sampled controls had **zero `aria-keyshortcuts` attributes**.
  - `n` did not focus notes; Escape did not close the Round.
  - Incomplete submission left focus on the radio; the error had no `role="alert"`.
  - Approve/reject used two pressed buttons instead of the documented radio-group interaction.
- **Impact:** Keyboard and assistive-technology users cannot rely on the documented navigation, focus recovery or announcements.
- **Fix:** Complete the shared controller and semantics. Because expanded strips contain inner actions, use the documented grid model or remove those inner actions from the composite. Implement notes/close transitions, shortcut declarations, first-unanswered focus and the failed-submit alert region. Use the specified approve/reject radio pattern.
- **Contract judgment:** The implementation is wrong, not the accessibility documentation.

#### ST-04 — Repetition is flattening the information hierarchy

- **Location:** `/specimen`, every theme, 1440px; [comparison](/tmp/hermes-studio-review/base-specimens.jpg).
- **Evidence:** The selected strip expands into a Question-and-recommendation summary while the same Questions and recommendations appear in the adjacent Round. Policy information appears in the holder tab, strip summary and Round header. Multiple green Recommended markers occupy both regions.
- **Impact:** The Human has to distinguish duplicate information from new information. The actual decision receives little more visual authority than its preview.
- **Fix:** Keep the selected bay item compact when its Round is open. Retain the required status, callsign, title, policy and timer; remove the parallel expanded Question transcript. Reserve the full Question/Answer relationship for the open Round. Reduce optional nested boundaries rather than weakening contrast tokens.

#### ST-05 — Deck Handling’s signature does not fulfil its central spatial promise

- **Location:** `design/tokens/worlds/deck-handling.css:703–720`; `/specimen?theme=hermes-deck-handling`.
- **Evidence:** Submitting triggered `deck-handling-launch` on the toast’s `::after`. The selected-strip animation runs when selection changes. The answered craft does not visibly taxi from its board position to dispatch.
- **Impact:** The distinctive interaction is detached from the object the Human acted on. The world becomes aircraft-themed notification decoration.
- **Fix:** Expose a shared outgoing/answered transition before removing a Round, then let the world skin animate that existing strip’s craft through the dispatch state. Keep the core controller and anatomy shared. Keep the status word and reduced-motion outcome independent of movement.
- **Contract judgment:** The brief promises departure from the board; the current toast implementation falls short.

### Minor

#### ST-06 — Comms Deck bypasses the live-only glow rule

- **Location:** `design/tokens/worlds/comms-deck.css:433–437,473`.
- **Evidence:** A pending strip lamp rendered a **5px amber halo**: `rgba(242, 169, 59, 0.55) 0px 0px 5px 0px`. It is selected by pending status, not live connection state.
- **Impact:** “Waiting for a decision” and “currently live” acquire the same light-emitting vocabulary. The world contradicts the brief despite passing validation.
- **Fix:** Keep pending lamps visibly filled but unglowing. Reserve halos for the connection lamp and live values. Extend the validator beyond references to `elevation-live` so custom shadow helpers cannot bypass the rule.

#### ST-07 — Hardware decoration exceeds the craft floor

- **Location:** `design/tokens/worlds/flight-director.css:85`; Deck Handling and Starship elevation overrides; `starship.css:721–734`.
- **Evidence:** Flight Director uses a hard **0 2px 0** raised shadow; Deck Handling and Starship also include hard contact offsets. Starship’s dispatch keyframes cross the resting position and scale to **1.02** before settling.
- **Impact:** The worlds drift toward game-interface skins and theatrical confirmation effects. Neither is the brief’s unhurried working equipment.
- **Fix:** Replace hard external offsets with restrained inset bevels or soft contact depth. Make dispatch settle monotonically—no overshoot. Keep material concentrated in identity regions.

#### ST-08 — Typography is being used to announce genre rather than organise work

- **Location:** All world specimens; computed assignments below.
- **Evidence:** Flight Director’s operational titles use Michroma 400 at 15px. Comms callsigns are 11.5px at 87.5% width. Deck Handling and Starship each use four families. Several worlds apply tracked capitals across buttons, labels and navigation as well as identity surfaces.
- **Impact:** Long identifiers and ordinary actions inherit decorative treatment. The worlds feel generated from “stencil / spaceship / Greek” prompts rather than developed from a coherent lettering system.
- **Fix:** Restrict the signature face to identity and short legends. Give operational titles a robust reading cut. Use two functional families plus, at most, one tightly restricted identity face. Do not shrink metadata to accommodate an over-wide font.

#### ST-09 — Heading and landmark structure remains unresolved

- **Location:** `/specimen`, `/design`, `/worlds`, both widths.
- **Evidence:** Axe reported:
  - `/specimen`: `heading-order` at **Pending Rounds**, an `h3` following the page `h1`.
  - `/design`: `landmark-unique` for repeated Round forms and answered-log regions.
  - `/worlds`: both rules within loaded specimen frames.
- **Impact:** Heading navigation skips levels; repeated landmark names make the long design page harder to navigate.
- **Fix:** Decouple heading level from visual class. Give repeated demonstrations context-specific accessible names. Correct the shared specimen before the gallery inherits it.

#### ST-10 — The presentation pages explain the design before letting it demonstrate itself

- **Location:** `/design`, `/worlds`; `design/preview/components/FoundationSections.tsx:64`.
- **Evidence:** `/design` opens with the eyebrow “Flight Strips · carrier ops-room edition · used future.” `/worlds` leads each card with descriptive and signature prose, while its narrow live frame mostly displays the queue—not the decision or signature.
- **Impact:** Reviewers must read the intended identity because the comparison surface does not expose it. The eyebrow also violates the review’s craft floor.
- **Fix:** Remove the eyebrow. Retain necessary illustrative-data labelling. Make `/overview` the primary comparison surface and let world cards lead with an inspectable state, a short identity statement and a trigger for the signature—not a paragraph describing an interaction below the fold.

## Fonts actually rendered

Computed styles were checked in Chromium, followed by `CSS.getPlatformFontsForNode` to verify the fonts supplying the sampled glyphs—not merely the declared stacks.

| Design | Display | Round titles | Question prompts | Callsigns / machine text |
|---|---|---|---|---|
| **Core dark** | Big Shoulders **800 / 44px** | Big Shoulders **700 / 20px** | Schibsted Grotesk **600 / 17px** | Spline Sans Mono; callsigns **600 / 12px**, timers **400 / 14px** |
| **Core light** | Same as dark | Same as dark | Same as dark | Same as dark |
| **Comms Deck** | Big Shoulders Stencil **800 / 44px** | Archivo **700 / 20px**, **75% width** | Archivo **600 / 17px** | Martian Mono; callsigns **600 / 11.5px**, **87.5% width** |
| **Deck Handling** | Saira Stencil **600 / 44px** | Barlow Condensed **700 / 20px** | Archivo **600 / 17px** | Martian Mono; callsigns **600 / 12px**, **87.5% width** |
| **Flight Director** | Michroma **400 / 34px** | Michroma **400 / 15px** | Archivo **600 / 17px** | IBM Plex Mono; callsigns **600 / 12px** |
| **Starship** | Marcellus SC **400 / 44px** | Saira Condensed **700 / 20px** | Instrument Sans **600 / 17px** | IBM Plex Mono; callsigns **600 / 12px** |

Sampled glyphs came from the intended custom fonts, not system fallbacks. Big Shoulders’ internal platform name includes “Thin”; its rendered variable instances correctly carried the requested 700/800 weights. That name is not evidence of a weight-loading failure.

Evidence: [computed roles](/tmp/hermes-studio-review/computed-fonts.json), [actual platform fonts](/tmp/hermes-studio-review/platform-fonts.json).

## Broader font directions

A **982-character random alphanumeric seed** was generated with a shell command and used to shuffle exploration lenses. The seed is not reproduced or retained in the report.

All families below are available through Google Fonts’ OFL collection. Every listed weight was checked against its current metadata. These are **proposed directions, not browser-tested replacements**. Fix composition before selecting a new font.

**Order within each row: identity/strip lettering → reading → machine.** Use the heavier listed cut for short headings, not for entire screens.

### Core dark and core light — three directions for each

Keep the families synchronised between dark and light. A colour-theme change should not become a typography change.

| Direction | Families and real weights | Why |
|---|---|---|
| **A — Public-service instrument** | **IBM Plex Sans Condensed 600, 700** → **Public Sans 400, 600** → **IBM Plex Mono 400, 500** | Less poster-like than Big Shoulders; operational authority without military costume. First direction to prototype for both cores. |
| **B — Transport manual** | **Barlow Semi Condensed 600, 700** → **Source Sans 3 400, 600** → **Source Code Pro 400, 600** | A quieter, more human technical system. Semi-condensed lettering leaves more room for long Round titles than a wide geometric face. |
| **C — One engineered voice** | **Roboto Condensed 600, 700** → **Recursive 400, 600** with `MONO=0`, `CASL=0` → **Recursive 400, 500** with `MONO=1`, `CASL=0` | A controlled proportional/mono relationship instead of three unrelated personalities. Keep the axes static, not animated. |

### Comms Deck

| Direction | Families and real weights | Why |
|---|---|---|
| **A — Broadcast engineering** | **Chivo 600, 700** → **Source Sans 3 400, 600** → **Chivo Mono 400, 500** | Blunt equipment lettering and related machine text. Removes stencil-as-identity dependence. |
| **B — Switchboard placards** | **IBM Plex Sans Condensed 600, 700** → **Public Sans 400, 600** → **IBM Plex Mono 400, 500** | Channel numbers, jack labels and states can establish the world. The font stops acting out the setting. |
| **C — Cockpit communications** | **B612 700** → **B612 400** → **B612 Mono 400, 700** | An aerospace human-factors direction rather than nostalgia. B612 has only 400/700 here—do not request 500 or 600. |

### Deck Handling Board

| Direction | Families and real weights | Why |
|---|---|---|
| **A — Flight-deck drafting** | **Barlow Semi Condensed 600, 700** → **Public Sans 400, 600** → **JetBrains Mono 400, 500** | Compact labels with clear operational reading. Let craft silhouettes and deck zones provide identity. |
| **B — Maintenance schedule** | **Roboto Condensed 600, 700** → **Source Sans 3 400, 600** → **Source Code Pro 400, 600** | More working technical document, less game faction. No stencil required. |
| **C — Cut-template system** | **Saira 600, 700**, `wdth=75` → **B612 400, 700** → **B612 Mono 400, 700** | A structured, narrow industrial face without stencil breaks; aircraft readability carried into the functional text. |

### Flight Director 2169

| Direction | Families and real weights | Why |
|---|---|---|
| **A — Actual console engineering** | **Saira 600, 700**, `wdth=112.5` for short identity labels → **B612 400, 700** → **B612 Mono 400, 700** | Keeps wide geometry where it belongs. Operational titles use a readable cut rather than shrinking Michroma. |
| **B — Quiet future** | **Manrope 600, 700** → **Manrope 400, 600** → **IBM Plex Mono 400, 500** | Removes the obvious sci-fi-font cue. Build futurism through polling states, modular boundaries and numerals. |
| **C — Controlled polygonal** | **Oxanium 500, 600** → **Public Sans 400, 600** → **JetBrains Mono 400, 500** | A deliberately more expressive challenger. Restrict Oxanium to short legends; blanket use would recreate the current problem. |

### Starship Hermes

| Direction | Families and real weights | Why |
|---|---|---|
| **A — Courier’s ship register** | **Newsreader 500, 600** → **Public Sans 400, 600** → **IBM Plex Mono 400, 500** | A literate maritime identity rather than faux-antique small caps. Keep serif use to the ship name and major headings. |
| **B — Archival engineering** | **Literata 500, 600** → **Source Sans 3 400, 600** → **Source Code Pro 400, 600** | Makes the used-future premise feel accumulated and documented, not ornamentally Greek. |
| **C — Cast-metal inscription** | **Fraunces 500, 600**, `SOFT=0`, `WONK=0` → **Manrope 400, 600** → **IBM Plex Mono 400, 500** | A harder inscriptional contrast. The fixed axes matter: soft, wonky Fraunces would pull this toward hospitality branding. |

Weight sources: [Google Fonts OFL repository](https://github.com/google/fonts/tree/main/ofl), [per-family metadata evidence](/tmp/hermes-studio-review/font-sources.json).

## Checked

| Area | Actual coverage |
|---|---|
| **Routes and viewports** | All **28 supplied URLs** at **1440px and 390px**: 56 matrix captures. `/design` captures cover the first viewport; specimen captures are full-page. Captures were opened into labelled comparison sheets. |
| **Themes** | Both cores and all four worlds. |
| **Palettes** | Every supplied default, alternative and original palette URL. |
| **Density** | Supplied compact/glance URLs; clicked the density switch to Glance and observed `data-density="glance"` and a **3rem** target token. |
| **Fonts** | Computed role styles across the URL matrix; actual glyph-supplying platform fonts sampled in all six designs. |
| **Accessibility** | Axe on all 56 matrix pages. No horizontal document overflow measured. Focus ring observed as **2px solid**, **2px offset**. Heading/landmark findings reported above. |
| **Live interactions** | Strip expansion; `j/k`; single choice; multiple-choice selection; free text; reject and approve; incomplete submission; Command+Enter submission; next-Round focus; successful submissions for two complete Rounds. |
| **World signatures** | Triggered Comms patch/lamp-out, Deck launch, Flight Director GO latch, and Starship dispatch/stamp through actual submissions. Animation names and generated states recorded. |
| **Reduced motion** | Browser preference set to reduce; all six motion-duration tokens rendered as **1ms**. |
| **Mechanical gates** | `npm run validate` passed: **41 artifacts, 2 core themes, 4 worlds, 12 extra colour options, 58 roles, 84 contrast pairs per colour set**. `npm run test:validator`: **42 passed, 0 failed**. |
| **Optional detector** | Ran against `design/app` and `design/preview`; output was `[]`. It did not detect the contract failures above. |
| **Limits** | No screen-reader session, Safari/Firefox pass, timed policy-expiry scenario, or exhaustive visual inspection of every below-fold `/design` atom. Axe is not proof of complete accessibility. |
| **Environment** | Used the existing server only. No servers started or stopped. No repository files edited. |

Evidence index: [capture manifest](/tmp/hermes-studio-review/captures.json), [measurements and axe results](/tmp/hermes-studio-review/results.json), [signature evidence](/tmp/hermes-studio-review/signatures.json).

## Action table

| ID | Design | Action | Why | Severity | Effort | Status |
|---|---|---|---|---|---|---|
| ST-01 | System | Correct `.hh-round` / `.hh-answer-bar` sticky containment and reserve footer space. | Submission controls currently cover status, policy and Question content. | major | M | open |
| ST-02 | System / phone | Implement the documented pending-list → Round-sheet glance flow; hide keyboard hints; correct entry-action targets. | The decision begins roughly 1,700px down the phone page. | major | L | open |
| ST-03 | System | Complete composite keyboard semantics, notes/close shortcuts, shortcut declarations and failed-submit focus/announcements. | The rendered interaction does not satisfy its documented keyboard contract. | major | L | open |
| ST-04 | All designs | Remove the parallel expanded Question transcript when a Round is open; consolidate optional framing and repeated emphasis. | Repetition makes the decision compete with its own preview. | major | M | open |
| ST-05 | Deck Handling | Tie departure to the outgoing strip’s shared controller transition, not a toast illustration. | The signature does not enact the board metaphor promised by the brief. | major | L | open |
| ST-06 | Comms Deck | Remove pending-state halos and extend the glow validator to custom shadow helpers. | Pending and live states currently share prohibited glow vocabulary. | minor | S | open |
| ST-07 | Worlds | Remove hard external offset shadows and Starship dispatch overshoot. | Decorative hardware effects exceed the craft floor. | minor | S | open |
| ST-08 | Core dark + light | Prototype the three paired core font directions with one shared family system across themes. | The hierarchy needs operational lettering, not more personality in every role. | minor | M | open |
| ST-09 | Comms Deck | Prototype broadcast-engineering lettering; make channel addressing and patch state carry identity. | Olive, stencil and bevels currently do too much of the branding. | minor | M | open |
| ST-10 | Deck Handling | Prototype drafting/template typography; remove stencil dependence from ordinary controls. | Craft geometry should distinguish the world before its font does. | minor | M | open |
| ST-11 | Flight Director | Remove Michroma from operational Round titles; prototype Saira/B612 and quiet-future alternatives. | A 15px decorative title is a poor scanning instrument. | major | M | open |
| ST-12 | Starship | Choose one inscriptional direction; reduce competing families and concentrate ornament in ship identity regions. | Four families plus meanders, rivets, bevels and stamps over-explain the concept. | minor | M | open |
| ST-13 | System | Correct heading levels and give repeated demonstration landmarks distinct names. | Axe reports navigation-structure defects across specimen and documentation surfaces. | minor | S | open |
| ST-14 | Presentation | Remove eyebrow kickers and make world comparison expose decisions and triggerable signatures. | The gallery describes differences more effectively than it demonstrates them. | minor | M | open |


---

## Resolution (2026-11-20)

The owner paused further review passes after this report. These items were applied before the pause. Status per item:

| ID | Status | Notes |
|---|---|---|
| ST-01 | done | The Round is a sheet: head, scrolling Questions, Answer bar as footer. |
| ST-02 | done | Same as TR-01; key hints hidden in glance; Send at the large control size. |
| ST-03 | done | Listbox bay with one Tab stop; J/K, arrows, Home/End, Enter, 1–9, A/R, N, Esc, Cmd/Ctrl+Enter; aria-keyshortcuts; failed send focuses the first unanswered Question with role=alert; approve/reject is a radio group. |
| ST-04 | done | Same as TR-04. |
| ST-05 | done | Core `.hh-strip[data-state='departing']` transition; Deck Handling taxis and launches the strip itself. |
| ST-06 | done | Comms Deck pending lamps unglowing; validator rejects any blurred zero-offset shadow outside live selectors. |
| ST-07 | done | Hard offset shadows removed in Flight Director, Deck Handling and Starship; Starship dispatch has no overshoot. |
| ST-08 | deferred | Core faces are an owner decision; world faces were reduced per ST-09–ST-12. |
| ST-09 | done | Comms Deck: Chivo, Source Sans 3, Chivo Mono. |
| ST-10 | done | Deck Handling: Barlow Semi Condensed, Public Sans, JetBrains Mono; no stencil. |
| ST-11 | done | Same as TR-10. |
| ST-12 | done | Same as TR-11. |
| ST-13 | done | Same as TR-14. |
| ST-14 | done | Eyebrow kickers removed; same as TR-13. |

Gates after the fixes: `npm run validate`, `npm run test:validator`, `npx tsc --noEmit` and `npm run build` pass with no warnings; a browser pass of `/overview`, `/worlds`, `/design` and `/specimen` across themes and worlds at 1440 and 390 showed no console errors and no horizontal scroll.
