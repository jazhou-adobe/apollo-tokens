# Splitbook studio review

## Verdict: fix then ship

**The system clears its mechanical gates but scores 6/10 against a studio-level bar: the identities are expressed more convincingly through surface styling than through composition, typography hierarchy, and trustworthy interaction.**

No critical gate failures. The major findings concern Capture behaviour, sizing, keyboard access, and excessive visual emphasis.

## Scores and creative direction

Scores judge the shipped design—not the ambition of the brief. **8/10** means a distinctive, disciplined, production-ready identity; **9/10** means exceptional execution across screens and states.

| Design | Intended aesthetic | Score | Biggest gap to studio-level execution |
|---|---|---:|---|
| **Pace Clock Light** | Municipal-pool modernism: chalk, black ink, functional grotesques, disciplined signal colours | **6.5/10** | The pace-clock idea mostly becomes a large stopwatch number inside a conventional rounded panel. The surrounding composition does not feel equally authored. |
| **Pace Clock Deck** | Glare-grade poolside instrument: oversized controls, positive polarity, black-and-yellow live plate | **6/10** | The size knob enlarges components without sufficiently redesigning the task. Mobile Capture remains a scrolling document rather than a stable one-handed instrument. |
| **Approach Lights** | Used-future approach instrumentation: numbered lamps, condensed signage, opaque equipment panels | **6.5/10** | The numbered Length lamps establish identity; repeating dots across headers, dividers, and the central axis dilutes their meaning. |
| **Flight Deck** | Carrier-deck industrial graphics: stencil placards, hazard edges, cockpit typography, crew-role colours | **5.5/10** | Too many familiar military-interface signals compete. The stencil, chevrons, frames, labels, glow, and split animation need an intensity hierarchy. |
| **Sortie Board** | Ready-room scheduling: condensed headlines, ruled rows, callsign-like identifiers, matte slate | **6/10** | It looks like a briefing board without consistently composing information like one. The underlying card-and-panel structure remains dominant. |
| **System overall** | A common swimming-product anatomy with materially different skins | **6/10** | Token completeness is ahead of interaction completeness. The examples currently teach several behaviours that contradict the written system. |

### What a top studio would change

#### Pace Clock Light

- **Build the identity through alignment, not another graphic.** Align metric labels, counts, Lengths, and review values to a shared numeric grid. The central T-line currently carries more compositional responsibility than the information.
- **Reduce the border hierarchy.** In the specimen, the Tap Pad, Review sheet, action trays, controls, rating circles, and fault flags all announce their boundaries. Three levels would suffice: workspace, actionable control, selected state.
- **Give counts equal typographic authorship.** The running time is highly resolved; technique and count summaries feel like ordinary form content. Preserve the live timer, but make post-Swim comparison unmistakably “better before faster.”

Evidence: [Light specimen, 1440](/tmp/splitbook-studio/03-1440.png).

#### Pace Clock Deck

- **Design the phone posture before the desktop pairing.** Counter keys above Wall; Wall and undo in a stable lower action region; End Swim away from that cluster.
- **Remove non-operational reading during recording.** Theme descriptions, specimen navigation, and the long tap log make sense in an inspector, not inside the instrument being demonstrated.
- **Spend size on the task, not uniformly on containers.** Bigger padding and stacked trays consume the space the enlarged controls need.

Evidence: [Deck live and finished, 390](/tmp/splitbook-studio/states-deck.jpg).

#### Approach Lights

- **Make completed Lengths the lights that matter.** Reserve the strongest lamp treatment for actual progress. Header dots and dotted dividers should be subordinate registration marks, not another light chain.
- **Separate instrument type from reading type more decisively.** The 32 px condensed Tap Pad labels compete with the counts. Keep the distinctive face; reduce its jurisdiction.
- **Palette direction:** retain **Deck Daylight** as the lead. **Fresnel Sand** is a coherent material alternative. **Blue Hour** needs stricter restraint around coloured states. **Original** has the weakest distinction between equipment atmosphere and reading plane.

Evidence: [Approach Lights palette comparison](/tmp/splitbook-studio/approach-1440-sheet.jpg).

#### Flight Deck

- **Choose one dominant carrier convention per region.** Navigation can use deck-edge markings; headings can use stencil; the live read-out can use the catapult signature. They do not all need to appear together.
- **Keep B612 operational; ration the stencil.** Whole headings and ordinary actions in heavy stencil flatten the hierarchy into a succession of placards.
- **Palette direction:** **Primer** makes the clearest functional case; **Non-skid** communicates the concept most immediately. **Night Recovery** moves closest to generic game-HUD territory. **Original** gives the panels too little separation.

Evidence: [Flight Deck palette comparison](/tmp/splitbook-studio/flight-1440-sheet.jpg).

#### Sortie Board

- **Let rows—not boxes—carry the identity.** Align Swim identifier, Focus metric, technique, Faults, and time into repeatable schedule columns. Use the existing Swim/Session/Set anatomy; no layout-token fork is needed.
- **Restrict extra-condensed capitals to board titles.** Ordinary labels need more openness. A board feels authoritative through information alignment, not universal uppercase.
- **Palette direction:** retain **Ready Room**. **Haze Gray** best exposes the typographic structure. **Grease Board** is a credible secondary direction. **Original** feels closer to a generic navy dashboard.

Evidence: [Sortie Board palette comparison](/tmp/splitbook-studio/sortie-1440-sheet.jpg).

**The strongest AI-template signal is repetition:** the same paired composition, multiple nested frames, and small uppercase technical labels used as instant “world-building.” More decoration will not close this gap. More selective hierarchy will.

## Findings

### Major

#### ST-01 — Capture shortcuts and announcements do not match the contract

- **Location:** `design/preview/components/widgets.tsx:29–174`; all five `/specimen` themes.
- **Evidence:** With Wall focused, pressing `1` left the kick counter at zero in every theme. In Deck, Space activated the focused Wall button, but Backspace did not undo it. After a wall tap, the status regions contained only `Recording` and an empty string—not the completed Length summary.
- **Impact:** Keyboard and switch users cannot use the advertised interaction model. Screen-reader users receive no per-Length result.
- **Fix:** Implement the documented shortcuts on the labelled Tap Pad group, excluding editable fields. Add a dedicated polite status region for completed Lengths and undo results. Retain the native button path.

The **rendered implementation is wrong** relative to `components/capture-widgets.md` and `foundations/accessibility.md`.

#### ST-02 — Capture target floors are breached; worlds lose the Deck knob

- **Location:** `design/preview/components/widgets.tsx:150–165`; world Capture specimens.
- **Evidence:** Tap-log Undo buttons measured **36 px high** in Light and every world, **42 px in Deck**. Required floors are 48 and 56 px respectively. All three worlds computed `--sb-button-min-target: 3rem`; Deck computed `3.5rem`.
- **Impact:** Wet-hand corrections—the safety mechanism for missed or doubled taps—receive smaller targets than ordinary Capture actions. Selecting a world also drops Capture back to base sizing.
- **Fix:** Remove the small-size variant from Capture undo actions. Make the Deck sizing contract compose with a world instead of being replaced by the world’s theme selector; keep world files free of component-size overrides.

The **implementation is wrong** relative to the brief’s target floors and “Deck still applies” world contract.

#### ST-03 — End and identity transitions are unsafe exemplars

- **Location:** `design/preview/components/widgets.tsx`; `/specimen`, all themes.
- **Evidence:** The Profile menu opened during recording in every theme. Deck’s **End early** transitioned to `Finished`, offering only **Undo last tap** and **Next Swim**—no Resume.
- **Impact:** The exemplar permits identity changes mid-Capture and provides no explicit recovery from an accidental early end.
- **Fix:** Make the Profile switcher read-only during recording. Model `ended` separately from completed distance; expose **Resume** and **Review this Swim** without clearing events.

The **implementation is wrong** relative to `navigation-and-chrome.md` and `capture-widgets.md`.

#### ST-04 — Mobile tables and code samples cannot be reached for keyboard scrolling

- **Location:** `/design`, **390 wide**, all themes.
- **Evidence:** Axe reported:

  > `scrollable-region-focusable: Scrollable region must have keyboard access`

  Six affected regions in Light, Deck, Approach Lights, and Flight Deck; five in Sortie Board. Targets include `#type-numerals > .sb-table-wrap`, `#deck-knob > .sb-table-wrap`, `.sb-formula-preview > .sb-table-wrap`, and `pre`.

- **Impact:** Keyboard users cannot reliably inspect horizontally clipped reference material.
- **Fix:** Give overflowing table/code wrappers `tabindex="0"`, an appropriate region role, a specific accessible name, and the shared visible focus ring.

The **implementation is wrong** relative to `components/data-display.md`.

#### ST-05 — The Review sheet claims a result its controller does not produce

- **Location:** `design/preview/components/widgets.tsx:254–305`; `/specimen`.
- **Evidence:** Submit only sets `saved` to `true`, then displays:

  > `Saved. Metric trends now include this Swim.`

  Changing the count afterwards leaves that message unchanged. The Review summary remains the fixed `1:18.42`, independent of the captured Swim.

- **Impact:** The example teaches an inaccurate save lifecycle and suggests that Capture, review, and trends share data when they do not.
- **Fix:** Bind the demonstrated Capture and Review to one preview model. Invalidate saved state on edits. Remove the trend-update claim unless the preview actually updates a trend; explicitly describe any simulated save state.

Illustrative data labelling does not make an unsupported interaction result accurate.

#### ST-06 — The Capture composition prioritises the wrong control sequence

- **Location:** `design/preview/components/widgets.tsx:96–132`; `/specimen`, 390 wide.
- **Evidence:** Wall renders **above** the counters in every theme. In Flight Deck, its document position started around **555 px**, with counters below at **687 px**. End early sits with undo beneath the keys rather than in the slim app bar.
- **Impact:** The primary action is not the final, stable thumb target described by the system. Reaching through the control stack increases accidental-action risk.
- **Fix:** Use the documented order: counters → full-width Wall → undo. Put End Swim in the app bar. Keep the live action cluster stable as the log grows.

Evidence: [Flight Deck live state](/tmp/splitbook-studio/states-flight-deck.jpg). The **implementation is wrong** relative to the Capture anatomy.

#### ST-07 — World signatures spend too much attention per wall tap

- **Location:** `design/tokens/worlds/flight-deck.css:423–447`; `sortie-board.css:811–815`.
- **Evidence:** A normal wall tap triggered **1,280 ms** Flight Deck flash/ink animations and a **1,400 ms** Sortie Board feed/ink sequence. The shorter ignition/launch/print actions used 320 ms.
- **Impact:** Frequent input causes prolonged visual activity in a product whose watcher should be looking at the swimmer.
- **Fix:** Keep wall acknowledgement to one `--sb-motion-flash` sequence. Reserve the longer board-feed treatment for the completed-Swim transition. Do not animate across a read-out longer than necessary to confirm the action.

These animations are bounded and reduced-motion-aware; the problem is their **attention budget**, not an infinite-animation violation.

### Minor

#### ST-08 — Rating selection repurposes the metric colour

- **Location:** `design/preview/splitbook-components.css`, `.sb-rating-step`; core themes, Flight Deck, Sortie Board.
- **Evidence:** Selected rating backgrounds computed to the `metric` colour: Light blue, Deck deep blue, Flight Deck green, Sortie Board blue. Approach Lights uses its own dark treatment.
- **Impact:** A technique selection looks like a Focus metric, weakening the semantic colour system.
- **Fix:** Use the documented ink/background selection treatment, with the selected check shape. Keep `metric` on named captured metrics.

The **implementation is wrong** relative to the rating specification.

#### ST-09 — World typography exceeds its allowed uppercase scope

- **Location:** `flight-deck.css:255–265`; `sortie-board.css:260–299`; `approach-lights.css:280–305`.
- **Evidence:** Whole headings, captions, legends, table headings, and—in Sortie Board—ordinary labels receive uppercase transformations. The typography contract permits uppercase stencil treatment for **short status words only**.
- **Impact:** Reading hierarchy becomes louder and less differentiated; several worlds converge on the same technical-label mannerism.
- **Fix:** Restore sentence case to reading and form content. Reserve capitals for short status/identity marks. Keep the world’s face and shape vocabulary.

The **stylesheets are wrong** relative to `foundations/typography.md`.

#### ST-10 — Shared semantic structure is incomplete

- **Location:** `design/app/specimen/page.tsx`; repeated demos on `/design` and `/worlds`.
- **Evidence:** The specimen contains no `.sb-skip-link`; its `h1` jumps to Tap Pad `h3`. Axe reported `heading-order` on every specimen and `landmark-unique` on `/design` and `/worlds`.
- **Impact:** Heading and landmark navigation becomes less predictable, especially among repeated examples.
- **Fix:** Add the shared skip link, use page-appropriate heading levels, and give repeated landmarks contextual accessible names.

#### ST-11 — The galleries compare skins more effectively than product character

- **Location:** `/overview` and `/worlds`, 1440 and 390 wide.
- **Evidence:** Overview uses repeated miniature compositions; world cards put descriptions, signature explanations, and four palette choices before the live specimen. The default specimens begin with zero counts and disabled controls.
- **Impact:** A reviewer reads about the signature before seeing it. Different palettes and frames dominate the comparison.
- **Fix:** Lead each world with a meaningful captured example and one short distinguishing sentence. Put palette exploration and the live inspector second. Preserve explicit illustrative-data labelling.

## Fonts: what actually renders

Checked after `document.fonts.ready`, using **computed CSS** and Chromium’s **rendered-font inspection**, not token declarations alone.

| Design | Headings/display | Reading text and labels | Numerals | Technical text |
|---|---|---|---|---|
| **Light** | Schibsted Grotesk, 700/800 | Atkinson Hyperlegible Next, 400/700 | Schibsted Grotesk, 700/800 | Atkinson Hyperlegible Mono, 400 sampled |
| **Deck** | Schibsted Grotesk, 700/800 | Atkinson Hyperlegible Next, 400/700 | Schibsted Grotesk, 700/800 | Atkinson Hyperlegible Mono, 400 sampled |
| **Approach Lights** | Barlow Condensed, 700/800 | Archivo, 400/700; some instrument labels switch to Barlow Condensed or Martian Mono | Barlow Condensed, 700/800 | Martian Mono, 400 sampled |
| **Flight Deck** | Big Shoulders Stencil, 700/800 | B612, 400/700; Tap Pad labels switch to Big Shoulders Stencil | B612, 700 | **Inherited Atkinson Hyperlegible Mono**, 400 sampled |
| **Sortie Board** | Sofia Sans Extra Condensed, 700/800 | IBM Plex Sans Condensed, 400/700; some labels switch to Sofia | IBM Plex Sans Condensed, 700 | IBM Plex Mono, 400 sampled |

No fallback font appeared in the sampled heading, body, numeral, or code text.

### Typographic judgement

- **Light:** Schibsted and Atkinson are not the central problem. The hierarchy gives the timer more authorship than the rest of the information.
- **Deck:** Preserve clear, open body text. Condensing this theme for “sportiness” would solve the wrong problem.
- **Approach Lights:** The combination has enough identity already. Reduce the number of elements allowed to use the instrument voice.
- **Flight Deck:** B612 is more convincing than the stencil. Make it the operational centre; use stencil as punctuation.
- **Sortie Board:** Extra-condensed headings plus condensed body plus monospaced captions leave too little contrast in width and texture.

### Seeded font directions

A shell command generated a **256-character random alphanumeric seed**. Its derived values rotated the exploration order below; the seed is not disclosed. These are directions to audition, not fifteen recommendations to load.

**All listed weights were checked against Google Fonts’ upstream metadata.** Every family below is in its OFL collection. Proposed alternatives have **not** been rendered, numeral-width-tested, or blur-tested in Splitbook.

| Design | Direction | Families and existing weights | Why audition it |
|---|---|---|---|
| **Light** | Contemporary editorial instrument | [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) **400, 600, 700** | More character in the grotesque without turning the core into sci-fi. Use 700 for numerals; do not request 800. |
| Light | Public-pool noticeboard | [Libre Franklin](https://fonts.google.com/specimen/Libre+Franklin) **400, 600, 800** + Fragment Mono **400** | A firmer civic/editorial voice; useful contrast between human reading text and technical annotations. |
| Light | Civic utility | [Public Sans](https://fonts.google.com/specimen/Public+Sans) **400, 600, 800** + Roboto Mono **400, 500** | Less “designed app,” more dependable public instrument. Strongest conservative alternative. |
| **Deck** | Open-aperture field instrument | [Noto Sans](https://fonts.google.com/specimen/Noto+Sans) **400, 600, 800** + Roboto Mono **500, 700** | Robust text and data distinction without decorative styling. |
| Deck | Legibility-led continuity | [Atkinson Hyperlegible Next](https://fonts.google.com/specimen/Atkinson+Hyperlegible+Next) **400, 700** + Archivo **700, 800** for display/numerals | Retains the body face while testing a sturdier numeric voice. |
| Deck | Wide, quiet scoreboard | [Lexend](https://fonts.google.com/specimen/Lexend) **400, 600, 700** | A deliberately broader alternative to condensed sports typography. Test long metric labels carefully. |
| **Approach Lights** | Civil-airfield signage | [Barlow Semi Condensed](https://fonts.google.com/specimen/Barlow+Semi+Condensed) **400, 600, 800** + Space Mono **400, 700** | Opens the current narrow voice while retaining equipment character. |
| Approach Lights | Squared approach instrument | [Rajdhani](https://fonts.google.com/specimen/Rajdhani) **500, 600, 700** + Source Sans 3 **400, 600, 700** | Stronger instrument geometry, with an intentionally plain reading companion. Keep Rajdhani out of prose. |
| Approach Lights | Industrial grotesque | [Chivo](https://fonts.google.com/specimen/Chivo) **400, 600, 800** + Red Hat Mono **400, 600** | A less predictable used-future direction without another stencil or condensed headline. |
| **Flight Deck** | Squared avionics | [Chakra Petch](https://fonts.google.com/specimen/Chakra+Petch) **400, 600, 700** + IBM Plex Sans **400, 600, 700** | Equipment-specific letterforms without literal military stencil everywhere. |
| Flight Deck | Deck-marking stencil | [Saira](https://fonts.google.com/specimen/Saira) **400, 600, 700, 800** + Saira Stencil One **400** | Related industrial vocabulary; stencil restricted to short identity marks. Never synthesize a bold stencil weight. |
| Flight Deck | Cockpit-first | [B612](https://fonts.google.com/specimen/B612) **400, 700** + Teko **600, 700** | Keep the operational face; replace busy stencil headings with cleaner tall signage. |
| **Sortie Board** | Typed operations ledger | [Archivo Narrow](https://fonts.google.com/specimen/Archivo+Narrow) **400, 600, 700** + Inconsolata **400, 600, 700** | Distinct record/identifier voices without making every line extra-condensed. |
| Sortie Board | Modern scheduling board | [Roboto Condensed](https://fonts.google.com/specimen/Roboto+Condensed) **400, 600, 700** + IBM Plex Mono **400, 600** | A more neutral row face that puts alignment and values ahead of costume. |
| Sortie Board | Printed launch schedule | [Oswald](https://fonts.google.com/specimen/Oswald) **400, 500, 600** + Source Sans 3 **400, 600** | Strong board titles against genuinely open reading text. Do not use Oswald for all form labels. |

**First auditions:** Public Sans for Light; Atkinson + Archivo for Deck; Chivo for Approach Lights; B612 + Teko for Flight Deck; Archivo Narrow + Inconsolata for Sortie Board.

Font-source evidence: [verified family metadata](/tmp/splitbook-studio/font-sources.json). Weight availability does not establish suitability for Capture numerals; the system’s confusable-glyph and tabular-figure checks still apply.

## Checked

### Mechanical gates

Both required gates passed:

```text
Splitbook design-system validation passed.
Checked 43 artifacts, 2 core themes + 3 seeded worlds with 9 extra colour options, 46 semantic roles, 58 contrast pairs per colour set, and 60 source files for raw values.
```

```text
# tests 37
# pass 37
# fail 0
```

Impeccable detector over `design/app` and `design/preview`: `[]`.

### Browser coverage

- **All 21 requested URLs**, each at **1440 × 1000** and **390 × 1000**: **42 route/viewport combinations**.
- Both core themes and all three built worlds.
- Every requested palette: recommended defaults plus Blue Hour, Fresnel Sand, Primer, Night Recovery, Haze Gray, Grease Board, and each world’s Original.
- Screenshots opened individually or in labelled contact sheets. Section captures corrected for smooth scrolling before assessment.
- Additional desktop inspection of actions, fields, navigation, feedback, tables, history rows, trends, watcher blueprints, and system states.
- **No document-level horizontal overflow** in the 42 combinations.
- Axe on the same 42 combinations. Overview had no violations; the other routes reported the semantic or keyboard-scroll findings above. No colour-contrast violation was reported; incomplete checks prevent treating that as certification.
- In every theme: Start Swim, counter tap, wall tap, undo, four-Length finish, rating arrow-key selection, fault toggle, Review submit, edit after submit, and Profile menu during recording.
- Deck: focused-button Space activation, Backspace undo attempt, End early transition.
- All worlds: signature animation names and durations observed after wall taps.
- All five themes: reduced-motion emulation collapsed the six `--sb-motion-*` durations to **1 ms**; Capture remained operable.
- Visible **3 px focus outlines with 2 px offset** observed on the focused Wall button; rating focus also remained visible.

Not checked: real sunlight/wet-device use, screen-reader speech output, Windows forced colours, or rendered alternatives from the font shortlist.

No repository files edited. No servers started or stopped.

## Action table

| ID | Design | Action | Why | Severity | Effort | Status |
|---|---|---|---|---|---|---|
| **ST-01** | All | Implement the documented Tap Pad shortcuts and per-Length/undo announcements | Restore keyboard and assistive-technology parity | major | M | open |
| **ST-02** | All / worlds | Enforce Capture-sized undo targets and compose Deck sizing with world identity | Corrections currently fall below poolside floors; worlds revert to base sizing | major | M | open |
| **ST-03** | All | Lock Profile switching while recording; add explicit Ended → Resume transition | Prevent identity changes and unrecoverable accidental endings | major | M | open |
| **ST-04** | All | Make overflowing table and code regions keyboard-focusable and named | Mobile reference content is inaccessible by keyboard | major | S | open |
| **ST-05** | All | Share Capture/Review preview state; invalidate saved status on edits; remove unsupported trend claims | Make demonstrated outcomes truthful | major | M | open |
| **ST-06** | All / Deck | Reorder counters → Wall → undo; move End Swim to the app bar | Match the documented one-handed Capture anatomy | major | M | open |
| **ST-07** | Flight Deck / Sortie Board | Shorten wall feedback to one flash interval; reserve long feed for completion | Reduce attention captured by frequent input | major | S | open |
| **ST-08** | Core / Flight Deck / Sortie Board | Change rating selection to ink/background with a check shape | Preserve the metric colour’s meaning | minor | S | open |
| **ST-09** | Worlds | Restore sentence case to reading/form content and ration display typography | Resolve contract drift and reduce technical-label sameness | minor | M | open |
| **ST-10** | All | Add specimen skip link, correct heading levels, distinguish repeated landmarks | Make navigation predictable for assistive technology | minor | S | open |
| **ST-11** | Overview / worlds | Lead with meaningful captured examples; move explanation and palette controls behind the visual comparison | Let users see world identity before reading its rationale | minor | M | open |
| **ST-12** | Light | Establish a numeric alignment grid and reduce nested frame levels | Make Pace Clock an information structure, not merely a timer style | major | M | open |
| **ST-13** | Deck | Compose a stable phone instrument rather than a uniformly enlarged document | Preserve reach and glanceability under the size knob | major | L | open |
| **ST-14** | Approach Lights | Concentrate the lamp vocabulary on Length progress; subordinate decorative dot runs | Make the signature meaningful rather than ubiquitous | minor | M | open |
| **ST-15** | Flight Deck | Assign stencil, chevrons, and live effects separate regions and intensity levels | Remove competing military-interface clichés | major | M | open |
| **ST-16** | Sortie Board | Strengthen aligned Swim/Session/Set rows and open up ordinary labels | Make the board metaphor structural | major | M | open |
| **ST-17** | All | Audition the three font directions per design using real labels, times, counts, and confusable glyphs | Select typography through product evidence rather than atmosphere alone | minor | M | open |


---

## Resolution (2026-11-20)

The owner paused further review passes after this report. These items were applied before the pause. Status per item:

| ID | Status | Notes |
|---|---|---|
| ST-01 | done | Tap Pad shortcuts (Space, 1/2, Shift+1/2, Backspace) and a polite status line for Lengths and undo. |
| ST-02 | done | Undo targets fixed; Deck knob added as `[data-density="deck"]` so it composes with any world; validator enforces it. |
| ST-03 | done | Profile switcher locked while recording; Ended state with Resume and Review this Swim. |
| ST-04 | done | Same as TR-03. |
| ST-05 | done | Capture and Review share one preview Swim; saved state invalidated on edit; trend claim removed. |
| ST-06 | done | Counters, then full-width Wall, then undo; End Swim in the app bar / Tap Pad header. |
| ST-07 | done | Flight Deck and Sortie Board wall acknowledgement is one `--sb-motion-flash` (320 ms); long effects only on Swim completion. |
| ST-08 | done | Rating selection is ink with a check, not `metric`. |
| ST-09 | done | Same as TR-10. |
| ST-10 | done | Same as TR-12. |
| ST-11 | done | Same as TR-11. |
| ST-12 | done | Fixed numeric columns in Swim rows; nested frames removed. |
| ST-13 | partly done | Phone Capture shows only the Tap Pad while recording. At 390×844 with Deck sizing mid-Swim, the Wall key ends at 836 px (Approach Lights), 810 px (Sortie Board), 894 px (Flight Deck) and 904 px (core Deck). Finishing it needs a core layout change, held until the owner picks designs. |
| ST-14 | done | Same as TR-09. |
| ST-15 | done | Same as TR-07. |
| ST-16 | done | Same as TR-08. |
| ST-17 | deferred | Font auditions are an owner decision; the seeded directions above stay on record. Only Sortie Board changed faces (reading text moved to IBM Plex Sans). |

Gates after the fixes: `npm run validate`, `npm run test:validator`, `npx tsc --noEmit` and `npm run build` pass with no warnings; a browser pass of `/overview`, `/worlds`, `/design` and `/specimen` across themes and worlds at 1440 and 390 showed no console errors and no horizontal scroll.
