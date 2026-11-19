# Approach Lights: focused review (2026-11-20)

Reviewer: `design-reviewer` (gpt-6.1-sol, effort medium). Screenshot links point at the reviewer's temporary captures and are not kept.

## Verdict: fix then ship

**Keep Approach Lights and Deck Daylight as the default.** The numbered Length lamps give this design a product-specific identity; Deck-sized phone Capture still fails the one-handed composition the brief requires.

## Taste

### What works

- **Numbered Length lamps — `/specimen`, all four palettes, 1440 and 390.** Completed, current and upcoming Lengths have distinct fill and ring treatments. Wall taps actually advance them; undo reverses them. This is the identity to build around.
- **Chassis versus reading plane — Deck Daylight and Fresnel Sand, both widths.** The darker outer material, opaque pale panels and dark lamp housing separate equipment from information without decorative glass or texture.
- **Mobile rating rows — Review sheet, 390.** Numbers, full cue text and a check make selection understandable without colour. This is more useful than instrument styling.

### Colour ranking

| Rank | Option | Judgment |
|---|---|---|
| **1** | **Deck Daylight — recommended default** | Best separation of chassis, reading plane and signals. Navy actions remain quieter than the recording state. Most credible for a poolside instrument. |
| **2** | **Fresnel Sand** | Most materially distinctive alternative. Sand and olive support the used-future idea without looking distressed. Keep it warm, not more military. |
| **3** | **Blue Hour** | Selection fills are now restrained, but slate panels, pale-blue actions and coral recording still resemble a conventional developer-tool dashboard. Not the poolside default. |
| **4** | **Sodium Night (`original`)** | Amber lamps, coral recording, blue counters and pale controls compete on charcoal. More cockpit atmosphere than information hierarchy. Retain as an alternative, not the lead. |

Evidence: [desktop comparison](/tmp/fr-live-1440.jpg), [phone comparison](/tmp/fr-live-390.jpg).

## Studio

**Aesthetic: civil-airfield instrumentation translated into a swimming clipboard.**

**Score: 7/10 against the requested top-studio bar.** The lamps are authored; too much surrounding composition is still a conventional component library wearing condensed type, square corners and bevels.

A top-studio execution would:

1. **Design the phone instrument first.** One stable field of counts, Length progress, Wall and undo—not an enlarged document.
2. **Make the lamp rail the unmistakable asset.** Remove competing halos; develop its geometry and state transitions rather than adding industrial decoration.
3. **Use a stricter typographic hierarchy.** Condensed numerals and short headings; open reading type for labels and observations. No broken words or default specimen typography doing brand work.
4. **Compose desktop states deliberately.** A live instrument should not sit beside a mostly empty “Review opens later” panel.
5. **Express material through construction.** Consistent edges, grouping and alignment—not the same inset bevel applied to almost every control.

The largest gap is structural, not chromatic. Changing fonts or adding more sci-fi detail will not fix it.

## Findings

### FR-01 — Major: Deck sizing pushes correction controls off-screen

- **Location:** `/specimen?theme=splitbook-approach-lights&density=deck`, **390 × 844**, recording.
- **Evidence:** Wall occupies document **y=728–836**; Undo wall begins at **858**; counter undo ends at **1011**. At the top scroll position, every undo control is below the viewport. [Capture](/var/folders/xl/vv18ktdj17s7h9psl9s7sl880000gq/T/omp-sshots-15d4be5054bd4be2.png).
- **Impact:** A watcher must scroll to correct a tap while watching the swimmer. Large targets do not compensate for inaccessible placement.
- **Fix:** Recompose the phone Capture shell around a stable lower action region: counters → Wall → undo, all visible together. Compress title, status and read-out chrome; move the tap log below the operational viewport. Preserve Deck target floors.

**The rendered UI is wrong; the brief’s one-handed Capture requirement is right.**

### FR-02 — Minor: Deck metric labels break inside words

- **Location:** Same route and viewport; **Underwater kicks** counter.
- **Evidence:** The label breaks “Underwater” across lines. `.sb-tap-key-label` permits `overflow-wrap: break-word`; the Deck capture shows the resulting fragmented label.
- **Impact:** The metric takes longer to recognise precisely where glance reading matters most.
- **Fix:** Fit the label through the label-type scale and key’s internal composition. Keep “Underwater” intact and “kicks” on the next line; do not shrink the target or substitute an unexplained abbreviation.

### FR-03 — Minor: Desktop live Capture has an uncomposed second half

- **Location:** `/specimen`, all four palettes, **1440 × 844**.
- **Evidence:** A tall operational Tap Pad sits beside a shallow waiting Review panel and a large empty area. [Desktop states](/tmp/fr-live-1440.jpg).
- **Impact:** The page reads as an unfinished component demonstration rather than one coherent instrument.
- **Fix:** While recording, use one centred Capture region at desktop too. Introduce the out-and-back pair when Review becomes actionable; pair the form with a compact result summary, not the entire disabled Capture stack.

### FR-04 — Minor: Live glow competes with the signature

- **Location:** `/specimen`, all palettes, both widths; `tokens/worlds/approach-lights.css` live Tap Pad and split-readout rules.
- **Evidence:** The panel perimeter, running read-out, recording mark and current Length bulb all carry luminous emphasis. The broad red/coral perimeter is more conspicuous than the small progress lamps. [Phone states](/tmp/fr-live-390.jpg).
- **Impact:** Attention spreads across several “live” effects; the distinctive Length chain becomes one effect among many.
- **Fix:** Remove the outer Tap Pad halo and soften or remove the read-out halo. Keep the solid recording plate and reserve luminous depth for the current numbered bulb.

This is excessive treatment, not a prohibition on live-state glow.

### FR-05 — Minor: Too many atoms use the same equipment cliché

- **Location:** `/design#cc-inputs`, `#cc-navigation`, `#cc-feedback`; Deck Daylight and Blue Hour, both widths.
- **Evidence:** Inputs, switches, chips, navigation frames and actions repeatedly use squared outlines and inset bottom bevels. Without the lamp rail, Blue Hour reads like a standard dark admin theme. [Atoms](/tmp/fr-atoms-1440.jpg).
- **Impact:** The world’s identity depends disproportionately on one widget; ordinary surfaces feel generic rather than designed as a family.
- **Fix:** Ration bevels to pressable keys. Keep reading fields flat and recessed; use one consistent structural rule for navigation and grouping. Derive distinction from construction, not extra ornament.

### FR-06 — Minor: Review Length selection does not implement its documented keyboard pattern

- **Location:** `design/preview/components/capture.tsx:461–477`; Review sheet, all four palettes at 390.
- **Evidence:** ArrowRight on focused **L1** leaves focus on L1. The implementation uses `role="group"` and independent buttons; the component contract specifies arrow navigation as a toolbar.
- **Impact:** Keyboard users encounter a different interaction from the documented component and must Tab through every Length.
- **Fix:** Implement the documented toolbar pattern with roving focus and Left/Right/Home/End navigation; retain Enter/Space selection.

**The implementation is wrong; `components/capture-widgets.md` is the intended contract.**

### FR-07 — Minor: Documentation still opens with generic brand theatre

- **Location:** `/design`, Deck Daylight and Blue Hour, **390 × 844**.
- **Evidence:** “PACE CLOCK · SPLITBOOK DESIGN SYSTEM” sits above the oversized “Better before faster.” headline after roughly 320 CSS px of selector chrome. The live example now enters the first viewport, but only near its bottom. [Capture](/var/folders/xl/vv18ktdj17s7h9psl9s7sl880000gq/T/omp-sshots-15d4bf89815bf61c.png).
- **Impact:** The opening spends space naming the concept instead of demonstrating the chosen design.
- **Fix:** Remove the eyebrow; reduce the mobile headline’s footprint. Put the live Length rail and count/read-out composition immediately after the controls.

## Previous resolutions: do they hold?

Only items applicable to Approach Lights are assessed.

| Previous items | Rendered result |
|---|---|
| **TR-01** mobile Swim rows | **Holds.** Identity, metric figures and Fault summary no longer overlap at 390; desktop figures align. |
| **TR-02 / ST-02** undo targets and world + Deck composition | **Holds for size.** Default undo targets measured 48 px; Deck-sized targets exceeded 56 px. **Placement remains unresolved:** FR-01. |
| **TR-03 / ST-04** overflowing reference regions | **Holds for structure.** All eight overflowing mobile table/code regions are named and focusable, with visible outlines. |
| **TR-04 / ST-08** rating presentation | **Holds.** Full-width mobile cue rows; selected state uses ink and a check, not the metric colour. Arrow selection works. |
| **TR-05 / ST-05** Capture/Review truth | **Holds for exercised paths.** Review uses captured splits; Save explicitly says preview-only; a count edit changes status to “Changed since you saved.” |
| **TR-06 / ST-12**, shared frame/alignment changes | **Holds in this world.** Unframed action rows and aligned Swim figures are rendered. No judgment on the out-of-scope Light design. |
| **TR-09 / ST-14** lamps and dates | **Holds.** Decorative lamp runs are gone; routine dates are unlit ink. Remaining excessive live glow is FR-04, not a return of decorative chains. |
| **TR-10 / ST-09** sentence case | **Holds.** Reading labels and observer notes use sentence case. Short identity/status marks retain capitals. |
| **TR-11 / ST-11** gallery signature | **Holds.** Approach Lights leads with a live mid-Swim frame. “Try wall tap” advanced Length 3 in the frame at both widths. |
| **TR-12 / ST-10** navigation semantics | **Holds on standalone pages.** Skip link present; one main heading; no skipped main heading levels. Exact requested `/worlds` also returned zero axe violations. |
| **TR-13** mobile documentation opening | **Technically holds.** Live content appears in the first viewport; the opening remains wasteful: FR-07. |
| **TR-14** palette defaults | **Holds.** Four options remain; Deck Daylight is recommended. |
| **ST-01** shortcuts and announcements | **Holds.** Space, 1/2, Shift+1 and Backspace changed the controller and produced Length/undo status messages. |
| **ST-03** identity lock and Resume | **Holds.** Swimmer switching becomes read-only while recording; Ended → Resume → Recording works. |
| **ST-06** action order | **Holds.** Counters → Wall → undo; End Swim is in the app bar. |
| **ST-13** stable phone instrument | **Still partial.** Review disappears during recording, but Deck undo remains below the screen: FR-01. |
| **ST-17** font auditions | **Still deferred.** Rendered faces remain Barlow Condensed, Archivo and Martian Mono. No alternative audition was assessed. |

## Checked

- **Routes:** All eight requested URL variants, at **1440 × 844** and **390 × 844**. `/worlds` inspection and interaction confined to Approach Lights.
- **Captures:** Two batched rounds; every capture opened individually or in labelled contact sheets.
- **Interactions:** All four palettes at both widths: Start, both counters, counter undo, Wall, wall undo, four-Length finish, Resume, End Swim, Review navigation, rating arrow selection, Fault toggle, Save and edit-after-save.
- **Accessibility:** Axe on requested surfaces and completed Review states; no violations on the exact requested URLs. Incomplete checks remain, so this is not WCAG certification. Visible focus inspected; Review navigation left focused Length controls below the sticky header.
- **Motion:** All four palettes at 390 collapsed all six motion durations to **1 ms** under reduced motion. Normal Length ignition measured **320 ms**.
- **Layout:** No document-level horizontal overflow in the initial 16 combinations.
- **Gates:** `npm run validate` passed; `npm run test:validator` passed **38/38**. Impeccable detector returned `[]`.
- **Live-tree caveat:** An initial missing-font build overlay appeared during concurrent repository changes. Its font registration was subsequently removed from source; clean startup was not reverified. It is not counted as an open design finding.
- **Not checked:** Real sunlight, wet-hand hardware use, screen-reader speech or forced colours. No repository files edited; no servers started or stopped.

## Action table

| ID | Action | Why | Severity | Effort | Owner | Status |
|---|---|---|---|---|---|---|---|
| FR-01 | Recompose Deck phone Capture so counters, Wall and undo remain visible together | Corrections currently require scrolling during recording | major | L | core | open |
| FR-02 | Keep metric-label words intact at Deck sizing | Restore glance recognition without reducing targets | minor | S | core | open |
| FR-03 | Use a single live Capture region on desktop; introduce the pair for actionable Review | Remove the empty waiting half and clarify state hierarchy | minor | M | core | open |
| FR-04 | Remove panel/read-out halos; concentrate luminous depth on the current Length bulb | Give the signature visual ownership | minor | S | world | open |
| FR-05 | Ration bevels and establish a consistent flat/recessed/key material hierarchy | Replace generic cockpit styling with coherent construction | minor | M | world | open |
| FR-06 | Implement toolbar keyboard navigation for Review Length selection | Match the documented component interaction | minor | S | core | open |
| FR-07 | Remove the documentation eyebrow and compress its mobile headline | Demonstrate the chosen design before explaining it | minor | S | core | open |

## Resolution (2026-11-20)

Applied to the core components (so to Splitbook Light, Splitbook Deck and Approach Lights alike) and to `tokens/worlds/approach-lights.css`. Measured evidence is in [smoke-report.md](../validation/smoke-report.md#approach-lights-focused-review-fixes-fr-01-to-fr-07-2026-11-20).

| ID | Status | Notes |
|---|---|---|
| FR-01 | done | The Tap Pad is one instrument composition at every width: chrome rows (head at label size beside the status mark, read-out with one caption line, Length strip) sit `space-2` apart in `space-3` padding; keys keep `density-gap` on every side; the undo cluster is one row of three directly under the Wall key (icon over "Undo" and its object). On phones the `/specimen` page header is one short line, the page frame narrows, and the status line and tap log sit below the fold. Mid-Swim at 390 × 844 the undo cluster ends at 801 px (Approach Lights, every palette, `density=deck`), 816 px (Light and Deck at `density=deck`) and 601–681 px at default density; at 1440 × 844 it ends by 830 px. No target shrank: undo ≥ 62 px at default density, ≥ 96 px at Deck sizing on phones; keys at or above `--sb-tap-key-size`. Files: `preview/splitbook-components.css`, `preview/splitbook-preview.css`, `preview/components/capture.tsx`, `components/capture-widgets.md`, `patterns/watcher-blueprints.md`, `agent-contract/screen-generation-rules.md`, `foundations/accessibility.md`. A 768 × 844 tablet at Approach Lights `density=deck` still ends undo at 904 px (outside the reviewed widths). |
| FR-02 | done | `.sb-tap-key-label` wraps only between words (`overflow-wrap: normal`, `word-break: normal`, `hyphens: manual`, balanced) in `label` type; counters give the label the key's width with `space-1` inline padding. "Underwater" stays whole with "kicks" on the next line at Deck sizing; no smaller target, no abbreviation. |
| FR-03 | done | While ready or recording `/specimen` is one centred Capture region (`--sb-layout-capture-max`) under a one-row page header; the waiting Review panel is gone. When the Swim ends the pair appears: the ended Tap Pad becomes a compact result (final time, Length strip, a count summary `.sb-tap-summary` in place of the keys, Resume, tap log) beside the Review sheet. Focus moves to Resume when the control that had it disappears, and back to the Wall key after Resume. |
| FR-04 | done | Approach Lights drops the live Tap Pad's outer ring and halo, the read-out halo and the status-disc glow. The solid live plates (read-out, Wall key) and the live frame stay; the current Length bulb is the only luminous element. |
| FR-05 | done | Approach Lights uses three constructions: a bottom bevel on pressable keys only (buttons, icon buttons, Tap Pad keys); flat recessed wells for fields, the switch track and the formula preview; one structural rule (`border-width-thick`, solid `border`) for dividers, section heads, the app bar, trays, bottom nav and tab rails, Set brackets, table heads and Review sections. Chips, switch thumbs, rating steps, fault flags, the Profile switcher, key caps, current nav items, panels, alerts and the app bar lost their bevels, highlights or shadows; dashed rules are gone outside the Length strip. Documented in the world stylesheet header and `foundations/design-language.md`. |
| FR-06 | done | The Review sheet's Length cells are a `role="toolbar"` with roving tabindex; Left/Right (wrapping) and Home/End move focus; Enter and Space select. Pages under the sticky app bar set `scroll-padding-block-start`, so focus never lands under it. Documented in `components/capture-widgets.md` and `components/navigation-and-chrome.md`. |
| FR-07 | done | `/design` opens with the live specimen straight after the controls: Recording mark, Length rail, running split and counts (underwater kicks, strokes), then the headline, which is `heading-lg` below md. The eyebrow is gone. README updated. |
