# Poolside conditions: sources and implications

## Scope

Why the Capture flow has the rules in [accessibility.md](../foundations/accessibility.md#poolside-conditions): glare, wet hands, one hand, big targets, undo, no dialogs while recording, never colour alone, and observer-note faults. The product context comes from `../training-track/PRODUCT.md` ("used poolside on a phone or tablet in glare, often with wet hands and one hand free, while watching a Swimmer who is moving"). Items marked **[INFERENCE]** are design judgements, not sourced facts.

## Context of use (from the product)

| Fact | Source |
|---|---|
| Capture happens on a phone or tablet poolside; history is read later on a laptop or desktop | `training-track/PRODUCT.md` → Users, Platform |
| Watchers are mostly parents of age-group swimmers (about 8–16) and private coaches | `PRODUCT.md` → Users |
| One watcher can track only one or two counts or timings live; everything else waits for the Review sheet | `PRODUCT.md` → Operating Context; `GLOSSARY.md` → Focus metric |
| Requirements: ≥ 48 px thumb targets reachable one-handed, glare-legible contrast, no precision or two-hand gestures, undo for every tap, nothing time-critical behind a dialog, never colour alone | `PRODUCT.md` → Accessibility & Inclusion |
| Capture events are never edited or deleted, only superseded | `GLOSSARY.md` → Capture event |
| Faults are one person's observation, never an official call | `GLOSSARY.md` → Fault; `PRODUCT.md` → Evidence on Hand |

## Glare and glance reading

| Source | Finding | Implication |
|---|---|---|
| Dobres, Chahine & Reimer (2017), *Effects of ambient illumination, contrast polarity, and letter size on text legibility under glance-like reading*, Applied Ergonomics 60:68–73. [doi:10.1016/j.apergo.2016.11.001](http://dx.doi.org/10.1016/j.apergo.2016.11.001) ([author PDF](https://jdobr.es/pdf/Dobres-etal-2017-Ambient.pdf)) | Under glance-like reading, legibility thresholds were worst for light-on-dark (negative polarity) text under dark ambient light; dark-on-light text, and all conditions under bright light, were read faster. The authors attribute the positive-polarity advantage to pupil contraction under brighter light. They tested two type sizes and expected smaller text to need longer. | Reading planes stay dark ink on a light face; worlds may not put reading surfaces in neon-on-black. Deck raises numeral and body sizes for glance reading. |
| WCAG 2.2 SC 1.4.3 and SC 1.4.11 ([1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)) | 4.5:1 text, 3:1 non-text; thresholds are not rounded. | These are the floor. Deck's palette is tuned for glare above them **[INFERENCE: no WCAG figure is specific to sunlight]**. |
| W3C Media Queries Level 5, `prefers-contrast` ([spec](https://www.w3.org/TR/mediaqueries-5/)) | Lets a page respond to a user's request for more contrast. | Deck is chosen by the Capture route, not by a media query, because glare is about the place, not a user preference **[INFERENCE]**. |

## Wet hands

| Source | Finding | Implication |
|---|---|---|
| Tung, Goel, Zinda & Wobbrock (2018), *RainCheck: Overcoming Capacitive Interference Caused by Rainwater on Smartphones*, ICMI '18. [PDF](http://faculty.washington.edu/wobbrock/pubs/icmi-18.01.pdf) | "Touch interactions are disrupted by raindrops, water smear, and wet fingers because capacitive touchscreens cannot distinguish finger touches from other conductive materials." Their filtering technique improved touch accuracy by 47.9% and gesture accuracy by 75.7%, showing how much accuracy water costs on stock devices. | Splitbook cannot change the touch driver, so it compensates in layout: large keys, space between them, no gestures, activation on release, and undo for every tap. |
| WCAG 2.2 SC 2.5.2 Pointer Cancellation ([Understanding](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html)) | Single-pointer functions should complete on the up-event, or be abortable or undoable. | Tap Pad keys activate on release; a finger that slides off cancels; every tap is undoable. |
| WCAG 2.2 SC 2.5.1 Pointer Gestures ([Understanding](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html)) and SC 2.5.7 Dragging Movements ([Understanding](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)) | Multipoint or path-based gestures and dragging need a single-pointer alternative. | No swipe, pinch or drag on Capture; Set grouping uses selection and a button, not drag. |

## One hand and target size

| Source | Finding | Implication |
|---|---|---|
| Hoober (2013), *How Do Users Really Hold Mobile Devices?*, UXmatters. [Article](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php) | In 1,333 observations of people touching their screens, 49% used one hand, 36% cradled the phone, and 15% used two hands; people switch grips often. | Primary Capture actions (Wall key, counters, Done) sit in the lower half in thumb reach; End Swim sits away from them. Two-handed use still works. |
| WCAG 2.2 SC 2.5.8 Target Size (Minimum) ([Understanding](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)) and SC 2.5.5 Target Size (Enhanced, AAA) ([Understanding](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)) | AA floor 24 × 24 CSS px; AAA 44 × 44 CSS px. | 24 px is the system floor (compact Admin); Capture goes well past AAA. |
| Apple Human Interface Guidelines, Accessibility ([HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility)) | Recommends controls of at least 44 × 44 pt. | Platform guidance agrees that touch targets should be larger than the WCAG AA floor. |
| Android Developers, *Make apps more accessible* ([guide](https://developer.android.com/guide/topics/ui/accessibility/apps)) | Recommends touch targets of at least 48dp × 48dp. | Matches the product's ≥ 48 px Capture rule. Deck's ≥ 56 px and ≥ 5rem keys add margin for wet fingers and divided attention **[INFERENCE]**. |

## Divided attention and time pressure

| Source | Finding | Implication |
|---|---|---|
| WCAG 2.2 SC 2.2.1 Timing Adjustable ([Understanding](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)) | Time limits must be adjustable, with exceptions for real-time events. | A Swim is a real-time event the watcher cannot pause, so the UI must never add its own time pressure: no dialogs while recording, no messages that leave on a timer. |
| WCAG 2.2 SC 4.1.3 Status Messages ([Understanding](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)) | Status messages are announced without taking focus. | One polite `role="status"` per Length; focus never moves during recording. |
| WCAG 2.2 SC 1.4.1 Use of Color ([Understanding](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)) | Colour cannot be the only means of conveying information. | Fault flags carry "Fault"/"Noted" and a flag shape; ratings carry numbers and cue text; trends carry "Up"/"Down"/"Held". In glare, colour is the first cue to wash out **[INFERENCE]**. |

## Faults as observer's notes

| Source | Finding | Implication |
|---|---|---|
| World Aquatics Competition Regulations, in force from 25 June 2025, Part Two: Swimming Rules. [PDF](https://resources.fina.org/fina/document/2025/07/01/ed3110a4-2291-411d-8526-6f641bd9237a/Competition-Regulations_June-2025_Clean-updated-01.07.2025-.pdf); [rules page](https://www.worldaquatics.com/swimming/rules) | Stroke rules a watcher can observe, for example: Article 5.3 (freestyle: head must break the surface by 15 m after the start and each turn); 6.4 (backstroke turn: touch the wall, back on the back when leaving it); 7.1 (breaststroke: one butterfly kick permitted before the first breaststroke kick after the start and each turn); 7.6 and 8.4 (breaststroke and butterfly: touch with both hands separated and simultaneously at each turn and the finish); 8.5 (butterfly: submerged no more than 15 m after the start and each turn). In competition, only appointed officials report infractions and "all disqualifications are subject to the decision of the Referee" (Part Two, Article 2.1.7). | Fault labels name the observed action in plain words and cite the article in a toggletip. The UI never says "DQ" or "disqualified": an observer at a training session is not an official. Rule numbers change between editions; Configuration stores the reference, so Admins update it there. The training-track metric catalogue (`research/swim-metric-catalogue` branch) cites the 2026 edition, whose article numbers may differ from the June 2025 text quoted here. |

## Implications checklist

- [x] Deck theme on Capture: glare-grade palette, larger numerals and body, bigger targets.
- [x] Dark-on-light reading planes; no neon-on-black reading surfaces in worlds.
- [x] Activation on release; undo for every tap; no gestures.
- [x] Primary Capture actions in thumb reach; End Swim away from them.
- [x] No overlays while recording; no timed messages.
- [x] Every state readable without colour.
- [x] Faults as observer's notes with rule references in Configuration.
