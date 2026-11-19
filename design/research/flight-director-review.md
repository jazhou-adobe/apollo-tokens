# Flight Director 2169: focused review (2026-11-20)

Reviewer: `design-reviewer` (gpt-6.1-sol, effort medium). Screenshot links point at the reviewer's /tmp captures and are not kept.


**Verdict: fix then ship.** Keep the direction; fix unsafe keyboard behaviour, expiry recovery and selected-state focus before further visual refinement.

**Studio score: 6.7/10.** Recognisable console identity; insufficient editorial restraint and interaction precision for a top-studio finish.

## 1. Taste

### What earns its place

- **Paper strips against console paint** — `/specimen`, all palettes, 1440 and 390. The material separation communicates queue versus working document without relying on the theme name. Keep the opaque cream/white reading planes.
- **Archivo for operational titles** — `/specimen`, 1440. Round titles now render at **18px/600**, Question prompts at **17px/600**. Michroma stays on the brand and short legends. The previous “sci-fi font everywhere” problem is substantially fixed.
- **GO / NO-GO as a decision state** — `/specimen`, both widths. Standby → Polling → GO/NO-GO is triggerable through real choices. It belongs to this product rather than decorating a generic dashboard.

### What still feels overdone

**The decision is expressed too many times.** On `/specimen`, particularly 390, one approval produces a native selected radio, check icon, Approved label, coloured key, GO annunciator and aggregate poll tally. This is console cosplay at the margin: several instruments reporting one fact.

Keep the per-Question GO/NO-GO call. Make the aggregate subordinate; for one approval Question, it does not need its own large footer row.

**The shell competes with the work.** At 390, the wide Command Center masthead, preview metadata, confirmation region and second Live indicator consume substantial vertical space before the first decision. The controls look engineered; the composition still looks assembled.

Keep “Illustrative data”, shorten the theme metadata, remove the empty “No Answer sent yet” message, and show one connection readout per operational surface.

**The gallery sells the wrong moment.** `/worlds`, 390: after Play signature, the frame returns to the next queue. The lasting view is a miniature specimen with metadata and confirmation, not the GO/NO-GO instrument. Hold the completed poll visibly until replay or palette change.

### Colour ranking

| Rank | Option | Judgment |
|---|---|---|
| **1** | **Console slate — recommended default** | Best separation of cool machinery, warm paper and live green. Least likely to turn every status into atmosphere. |
| **2** | **Day shift** | Most useful alternative: white documents, pale equipment and dark signals. A genuine operating condition, not an inverted dark theme. Its checked-control focus needs correction first. |
| **3** | **Night watch** | Strongest mood: brown-black equipment and buff paper convey used-future night operations. More theatrical and less neutral for daily triage. |
| **4** | **Original** | Too close to Console slate, with bluer equipment and louder green. Keep as the required archival option; do not lead with it. |

Evidence: [four-palette desktop comparison](/tmp/fr-palettes.jpg), [mobile palette states](/tmp/fr-review/mobile-1.jpg).

## 2. Studio

### Aesthetic

**Mission-control modernism: paper flight strips inside a restrained retro-futurist console.**

A top studio would make this an information instrument first:

- One disciplined hierarchy: consequence → Question → evidence → choice → send.
- A repeatable relationship between bay columns, document divisions and answer slots.
- Broad geometric lettering used as identity, not as the main source of personality.
- One authored polling instrument, with exact focus, keyboard and accessibility behaviour.
- Material expressed through proportion, seams and depth—not additional badges, frames or hardware decoration.

### Biggest gaps against that bar

1. **Interaction precision falls below the visual promise.** A console cannot silently reject a different Question from the one holding focus.
2. **The available viewport is not treated as a designed composition.** The Round footer can begin below the initial viewport; the large tally makes that worse.
3. **Status hierarchy remains indiscriminate.** Pending holders, connection boxes, recommendation badges and poll summaries all demand attention.
4. **The signature is more visual than systemic.** Its aggregate tally exists in CSS counters, not dependable accessible text.
5. **Preview chrome obscures the chosen design.** Especially on phone, metadata and demo scaffolding occupy space that should demonstrate the decision flow.

**Do not add more science-fiction detail. Remove competing signals and make the existing instrument exact.**

## 3. Findings

### Major

**FR-01 — Expiry removes the draft and strands the phone detail view**

- **Location:** `/specimen`, Console slate, 390, glance; `design/preview/components/hermes/StripBay.tsx:115,139–155,508–512`.
- **Evidence:** Entered Reject and notes on R-0144, then allowed its real policy timer to expire. The Round became “No Round open · Pick a strip, or press J.” Notes disappeared; the queue remained hidden and no Back control remained. [Capture](/tmp/fr-review/expiry-trap-390.png).
- **Impact:** A timed decision removes the Human’s working context and pointer-accessible recovery.
- **Fix:** Retain an expired/cancelled Round presentation with **Not sent**, preserved answers/notes, **Copy draft**, and **Back to pending**. The rendered UI is wrong; the retention contract is explicit.

**FR-02 — A/R can answer an off-focus Question**

- **Location:** `/specimen`, all palettes; `StripBay.tsx:303–308`.
- **Evidence:** With focus on Q1’s single-choice radio, pressing R changes Q2 to Reject/NO-GO. The controller explicitly falls back to the first approve/reject Question.
- **Impact:** An accelerator can record a high-stakes decision outside the Human’s current Question.
- **Fix:** Apply A/R only when the current focused Question is approve/reject. Remove the fallback search.

**FR-03 — Focus loses contrast on selected GO/NO-GO keys**

- **Location:** `/specimen`, all palettes, both widths; `design/tokens/worlds/flight-director.css:303–305,571–579`.
- **Evidence:** Rendered ring-to-selected-fill ratios:

  | Palette | GO | NO-GO |
  |---|---:|---:|
  | Console slate | 2.27:1 | 1.48:1 |
  | Night watch | 2.48:1 | 1.59:1 |
  | Day shift | **1.05:1** | **1.01:1** |
  | Original | 2.41:1 | 1.40:1 |

- **Impact:** Keyboard focus becomes difficult to distinguish precisely when a decision is selected.
- **Fix:** Give checked keys a contrasting focus treatment using the selected foreground, or a two-colour perimeter. Validate the actual filled key, not only the underlying surface.

**FR-04 — The Round fits the viewport height, not the space available**

- **Location:** `/specimen`, 1440 and 390; `design/preview/hermes-components.css:1453–1470`.
- **Evidence:** Independent rendered measurement at 1440×1000 placed the Round near **y=215** and the Answer bar near **y=1019**. The previous overlap is gone, but the action remains below the initial viewport. Explicit phone interaction can scroll it into view; it is not consistently fitted on entry.
- **Impact:** The Human must discover additional page scrolling around an already internally scrolling document.
- **Fix:** Size and position the Round against the available viewport after its top offset. Keep only the Question body scrolling; retain the glance-sized Send action.

**FR-05 — Phone presentation does not complete the phone contract**

- **Location:** `/specimen`, 390; `StripBay.tsx:388–406`; `design/app/specimen/page.tsx:30–37`.
- **Evidence:** The phone queue remains a roving-focus **listbox**, rather than the documented list of native buttons. Without `density=glance`, the route also retains keyboard hints and a **40px** Send target; explicit glance gives **56px** choice rows and a **60px** Send target.
- **Impact:** Phone callers must know an undocumented integration requirement; swipe navigation and target sizing do not consistently match the approved phone model.
- **Fix:** Use the phone blueprint’s list/button semantics and apply glance deliberately on the phone surface, preserving explicit preview density overrides.

### Minor

**FR-06 — Poll tally is oversized repetition and absent from the accessible footer**

- **Location:** `/specimen`, both widths; `flight-director.css:581–594`.
- **Evidence:** An **18px** CSS-counter tally takes a separate footer row and wraps at 390. The Answer-bar accessibility subtree exposes completion and Send, but omits the tally.
- **Impact:** Sighted users pay a space penalty; assistive-technology users do not receive the equivalent aggregate.
- **Fix:** Render real tally text from Answer state, style it as secondary metadata, and suppress redundant aggregate prominence for a single-position poll.

**FR-07 — Deadline and connection announcements are incomplete**

- **Location:** `StripBay.tsx:129–155`; `ConnectionStatus.tsx:10–15`.
- **Evidence:** Timer updates announce expiry, not the contracted five-minute/one-minute thresholds. Connection text lacks live-region semantics.
- **Impact:** Screen-reader users miss advance warning and connection changes.
- **Fix:** Add threshold-based announcements and a polite connection status; announce the open Round’s final minute once, assertively.

**FR-08 — Offline Send looks available until activated**

- **Location:** `/design`, compact; `StripBay.tsx:234–236,490–495`.
- **Evidence:** Selected Offline: Send had no `aria-disabled` state. Activation then produced “Not sent. The Hub is offline; your Answers stay here until it is back.”
- **Impact:** The primary action promises availability it cannot fulfil.
- **Fix:** Expose offline unavailability and its reason before activation; keep the draft.

**FR-09 — Preview chrome dilutes the instrument**

- **Location:** `/specimen`, 390; `ActiveTheme.tsx:24–27`; `.hh-bay-status`.
- **Evidence:** [Initial glance capture](/tmp/fr-review/glance-round1.png): multi-line tracked metadata, empty confirmation copy, and duplicate Live readouts precede the queue.
- **Impact:** Slower access to pending work; generic demo scaffolding dominates the authored world.
- **Fix:** Condense metadata, keep illustrative-data labelling, remove empty confirmation copy and duplicate connection presentation without reintroducing overlay confirmations.

**FR-10 — Pending queue includes expired, non-openable strips**

- **Location:** `/specimen`, both widths; `StripBay.tsx:116,388–406`.
- **Evidence:** “Pending Rounds” contains disabled Expired rows; keyboard movement includes these rows.
- **Impact:** Queue naming and position stop expressing actionability.
- **Fix:** Move expired rows to the answered log; keep pending navigation actionable.

**FR-11 — Gallery playback does not retain the signature**

- **Location:** `/worlds`, 390 and 1440; `WorldCard.tsx:18–35`.
- **Evidence:** Play signature sends the first Round and leaves the next queue as the settled frame. [Gallery capture](/tmp/fr-review/worlds-390.png).
- **Impact:** The world’s distinguishing interaction is transient; the lasting comparison is generic triage.
- **Fix:** Hold the completed GO/NO-GO specimen until replay or palette change.

## 4. Previous resolutions: do they hold?

| Previous item | Rendered verdict |
|---|---|
| **TR-01 / ST-02 — phone queue/detail** | **Partial.** Separate list/detail, Back and post-send return work. Phone semantics and expiry recovery remain wrong. |
| **TR-02 — confirmation placement** | **Holds.** Confirmation occupies the reserved region, not the next Answer bar. |
| **TR-04 / ST-04 — duplicated strip transcript** | **Holds.** Selected queue strips no longer expand into duplicate Questions. |
| **TR-05 — folded notes, lean footer** | **Partial.** Notes disclosure works. Flight Director’s large tally reintroduces footer bulk. |
| **TR-06 — mobile index** | **Holds.** On this page is initially collapsed and opens through its control. |
| **TR-07 — nested framing** | **Holds structurally.** Ordinary options are quieter; the polling module remains intentionally framed. |
| **TR-10 / ST-11 — typography and signature** | **Holds visually.** Archivo operational titles; triggerable GO/NO-GO. Focus and accessible tally remain gaps. |
| **TR-13 / ST-14 — gallery signature, eyebrows** | **Partial.** Live frame and Play signature exist; the settled result does not retain the signature. The old hero eyebrow is removed, but tracked preview metadata remains. Overview tile not rechecked. |
| **TR-14 / ST-13 — headings and landmarks** | **Holds in checked pages.** Axe reported no heading/landmark violations. |
| **TR-15 — palette set** | **Holds.** Exactly the four existing options remain. |
| **ST-01 — Answer-bar overlap** | **Holds narrowly.** No covering of Question content; initial viewport fit remains unresolved. |
| **ST-07 — hard offset shadows** | **Holds for Flight Director.** Soft external depth and inset control bevels replace hard external offsets. |
| **ST-08 — core faces** | Previously deferred; not reopened. |

Other-world-only resolutions were excluded.

## 5. Checked

- **Gates:** `npm run validate` passed; `npm run test:validator` passed **45/45**.
- **Browser:** existing localhost:3000 hub; no servers started or stopped.
- **Capture:** two screenshot rounds; all captures opened individually or in contact sheets. Specimen: all four palettes at **1440 and 390**. Design: default and Night watch at both widths; compact at both widths. Glance specimen at 390. Worlds at both widths.
- **Interactions:** J/K, Enter, single choice, multiple choice, free text, A/R, notes, incomplete submit, Cmd+Enter, Escape/Back, successful send, next-strip focus, offline send, real timer expiry, gallery playback.
- **Accessibility:** axe-core **4.13.0**, zero reported violations on audited surfaces; incomplete checks remained. Manual checked-focus inspection found FR-03 despite clean axe results.
- **Reduced motion:** Original’s selected GO animation computed to **0.001s**; state remained visible.
- **Overflow:** checked mobile documents measured **390px** wide.
- **Detector:** zero hits on scanned route/component markup; not evidence that world CSS or interaction contracts pass.
- **Limits:** no screen-reader session, Safari or Firefox run. No repository files edited.

## Action table

| ID | Action | Why | Severity | Effort | Owner | Status |
|---|---|---|---|---|---|---|---|
| FR-01 | Retain expired drafts with Copy draft and Back | Prevent lost context and phone dead ends | major | M | core | open |
| FR-02 | Restrict A/R to the focused approval Question | Prevent off-focus decisions | major | S | core | open |
| FR-03 | Add selected-state-aware focus contrast | Make checked-key focus visible in every palette | major | S | world | open |
| FR-04 | Fit Round to available viewport space | Keep Send reachable without nested page discovery | major | M | core | open |
| FR-05 | Complete phone semantics and glance application | Match phone navigation and target contract | major | M | core | open |
| FR-06 | Replace CSS tally with compact accessible text | Remove repetition and expose equivalent information | minor | M | core | open |
| FR-07 | Implement deadline and connection announcements | Warn before policy action and connection changes | minor | M | core | open |
| FR-08 | Expose Offline Send state and reason | Prevent misleading action availability | minor | S | core | open |
| FR-09 | Condense preview chrome and redundant readouts | Put the decision ahead of demo scaffolding | minor | S | core | open |
| FR-10 | Remove expired rows from the pending queue | Preserve actionable ordering and truthful labels | minor | S | core | open |
| FR-11 | Hold the completed gallery poll until replay | Make the signature inspectable, not fleeting | minor | M | core | open |
