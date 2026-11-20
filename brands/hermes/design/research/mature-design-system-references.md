# Mature design-system references for Hermes Hub

## Scope and source posture

This survey uses official design-system documentation, W3C and community-group specifications, and first-party tooling docs. The goal is not to copy another system's visual language; it is to borrow the **artifact shape** Hermes needs: a small, keyboard-first, status-heavy command center that agents can also build screens for. Links were checked on 2026-11-20.

## High-trust reference set

| Reference | Primary URL | What Hermes borrows |
| --- | --- | --- |
| Material Design 3 | https://m3.material.io/ | Foundations → styles → components organisation; component pages that cover anatomy, behaviour and usage. |
| IBM Carbon | https://www.carbondesignsystem.com/ | Foundations, components, patterns and data visualisation as separate layers; working code beside guidance. |
| Carbon status indicators | https://carbondesignsystem.com/patterns/status-indicator-pattern/ | Status indicators "communicate severity-level information through distinct shapes and colors"; the icon indicator variant requires "an icon, a shape, a meaningful color, and a descriptive inline label". This is the model for the holder: colour + shape + word. |
| Carbon MCP | https://www.carbondesignsystem.com/getting-started/carbon-mcp/overview | Precedent for giving AI clients live access to components, tokens and guidance so generated UI matches the source of truth. |
| Adobe Spectrum design tokens | https://spectrum.adobe.com/page/design-tokens/ | Primitive/global, semantic and component token tiers; semantic names describe purpose, not value. |
| Atlassian design tokens | https://atlassian.design/foundations/design-tokens/ | Token names communicate foundation, property and modifier; themes switch token values for light, dark, density and motion preferences. |
| Atlassian lozenge | https://atlassian.design/components/lozenge/ | "A prominent, compact label used to communicate a meaningful attribute that affects how people understand, prioritize or act on an object" — the role of the holder's status tab and `.hh-badge`. |
| GOV.UK Design System | https://design-system.service.gov.uk/ | Styles, components and patterns as separate layers; component lifecycle statuses and a contribution path. |
| GOV.UK tag | https://design-system.service.gov.uk/components/tag/ | "Tags are only used to indicate a status… Do not use colour alone to convey information". Hermes status words follow the same rule. |
| GOV.UK patterns | https://design-system.service.gov.uk/patterns/ | Task-level patterns separate from components; the model for the blueprint files. |
| Microsoft Fluent 2 | https://fluent2.microsoft.design/ | Separation between product-neutral language and platform packages. |
| DTCG Format Module 2025.10 | https://www.designtokens.org/TR/2025.10/format/ | Typed, described tokens with aliases; the shape of `tokens.json`. |
| W3C Open UI | https://open-ui.org/ | Component parts, states, behaviours and accessibility as the dimensions of a component spec. |
| WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | The accessibility baseline. |
| WAI-ARIA APG | https://www.w3.org/WAI/ARIA/apg/ | Keyboard and ARIA patterns for every composite widget Hermes uses. |
| Storybook | https://storybook.js.org/docs/writing-stories | Stories as portable examples of component states; considered for the preview ([preview-gallery-options.md](preview-gallery-options.md)). |
| Figma Code Connect | https://developers.figma.com/docs/code-connect/ | Mapping design components to code for agent handoff. |

## Artifact categories

### 1. Principles and product language

**Reference pattern:** GOV.UK ties its system to design principles and service standards; Spectrum frames itself as a shared language across products.

**Hermes artifact:** [design-language.md](../foundations/design-language.md) states the Flight Strips direction, the used-future rule, the Dispatcher voice, the holder status vocabulary and the glossary terms from `hermes-hub/GLOSSARY.md`.

**Why:** one Human, many Agents, and agents building screens all need the same decision lens.

### 2. Foundations and tokens

**Reference pattern:** Spectrum's three tiers; Atlassian's purpose-first names; DTCG `$value`, `$type`, `$description` and aliases.

**Hermes artifact:** `tokens/tokens.json` with primitives (not exported), semantic colour roles including the Hermes roles (`strip`, `pending`, `answered`, `expired`, `recommended`, `live`, `code`, `diff-*`, `agent-*`), and component tokens for the strip, holder, timer, callsign, option row and key hint.

**Why:** status colours must stay consistent across both core themes and five worlds × four colour options.

### 3. Theming and customization rails

**Reference pattern:** Atlassian treats themes as token collections for colour mode, density and motion. Fluent and Spectrum separate one connected system from platform implementations.

**Hermes artifact:** two core themes on `data-theme`, worlds on `data-theme` + `data-palette`, density on `data-density` (`compact`, `glance`). Worlds may override only type, shape and depth.

**Why:** worlds can be radical without breaking contrast, targets, motion or the keyboard map.

### 4. Typography

**Reference pattern:** Material, GOV.UK and Atlassian treat typography as a foundation with tokens for family, size, weight and line height.

**Hermes artifact:** [typography.md](../foundations/typography.md): three families (reading grotesque, mono, condensed strip header), a type scale with `mono`, `mono-sm` and `strip-header`, tabular live numerals, and a glyph test for ids and callsigns.

**Why:** session ids, Round ids and timers must be unambiguous at a glance.

### 5. Component anatomy and behavior

**Reference pattern:** Open UI's parts/states/behaviours; APG roles, names and keyboard support.

**Hermes artifact:** each doc in [components/](../components/) lists anatomy classes, variants, states, token bindings and the APG pattern: listbox or grid for the strip bay, radio group and checkbox for Questions, feed for the answered log, dialog and alert dialog, tabs, menu button, switch, tooltip, disclosure.

**Why:** the strip bay and Question blocks are not standard widgets; their keyboard model has to be written down.

### 6. Patterns and page templates

**Reference pattern:** GOV.UK separates components from patterns; Carbon separates patterns from components and data visualisation.

**Hermes artifact:** [command-center-blueprints.md](../patterns/command-center-blueprints.md), [phone-blueprints.md](../patterns/phone-blueprints.md), [system-blueprints.md](../patterns/system-blueprints.md).

**Why:** agents building Hermes screens need composition rules, not just parts.

### 7. Accessibility baseline

**Reference pattern:** WCAG 2.2 as the standard; APG for widget behaviour; GOV.UK's accessibility strategy.

**Hermes artifact:** [accessibility.md](../foundations/accessibility.md): keyboard-first triage with scoped single-key shortcuts (SC 2.1.4), live regions for new Rounds and timers (SC 4.1.3), timers that never auto-submit and always show the Unanswered Policy, contrast gates, non-colour status (SC 1.4.1), targets for compact and glance density (SC 2.5.8), focus not obscured (SC 2.4.11), reduced motion (SC 2.3.3).

**Why:** the Human may be keyboard-only, a screen-reader user, or on a phone.

### 8. Preview and gallery

**Reference pattern:** Storybook stories; Spectrum's interactive docs; Carbon's working code.

**Hermes artifact:** a Next.js `/design` route on port 3300 showing tokens, every component state, every holder status, both densities, and every theme and world.

### 9. Guidance for agents generating screens

**Reference pattern:** Carbon MCP, Figma Code Connect, Storybook CSF.

**Hermes artifact:** [screen-generation-rules.md](../agent-contract/screen-generation-rules.md): a numbered flow, allowed tokens, forbidden patterns and a worked triage example.

**Why:** Hermes screens will be built by agents; the rails must be explicit.

## Implications for Hermes

- [x] Principles, voice and glossary before components.
- [x] Typed, described tokens in three tiers, with Hermes status roles.
- [x] Themes, worlds and densities as token overrides.
- [x] Typography with mono and condensed roles and tabular numerals.
- [x] Component docs with anatomy, states, tokens and APG keyboard models.
- [x] Blueprints for desktop, phone and system states.
- [x] WCAG 2.2 and APG as the accessibility baseline.
- [x] A preview route and an agent contract.
