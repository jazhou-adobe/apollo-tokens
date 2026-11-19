# Mature design-system references

## Scope and source posture

Official design-system docs, W3C and community-group specifications, and first-party tooling docs. The goal is to borrow the **artifact shape** Splitbook needs (principles, tokens, themes, component anatomy, patterns, accessibility, preview, agent rules), not another system's look. Adapted from the reference implementation's survey; every source below was re-checked for this repo.

## Reference set

| Reference | URL | What Splitbook borrows |
|---|---|---|
| Material Design 3 | https://m3.material.io/ | Foundations, styles and components as separate layers; component usage guidance at scale. |
| IBM Carbon | https://carbondesignsystem.com/ | Foundations, components, patterns and data visualisation as distinct sections; contribution paths. |
| Carbon MCP | https://www.carbondesignsystem.com/getting-started/carbon-mcp/overview | Precedent for giving AI clients source-of-truth components, tokens and guidance. |
| Adobe Spectrum | https://spectrum.adobe.com/ | One connected system across platforms, backed by tokens and guidance. |
| Spectrum design tokens | https://spectrum.adobe.com/page/design-tokens/ | Global → semantic → component token tiers; semantic names describe purpose, not value. |
| Atlassian design tokens | https://atlassian.design/foundations/design-tokens/ | Names that carry foundation, property and modifier; themes as collections of token values (light, dark, high contrast, density, motion). |
| GOV.UK Design System | https://design-system.service.gov.uk/ | Styles, components and task patterns kept separate; accessibility as strategy; lifecycle and contribution. |
| Shopify Polaris | https://shopify.dev/docs/api/polaris | One language across several product surfaces. |
| Microsoft Fluent 2 | https://fluent2.microsoft.design/ | Product-neutral language with platform-specific implementations. |
| DTCG Format Module 2025.10 | https://www.designtokens.org/TR/2025.10/format/ | Typed tokens with `$value`, `$type`, `$description`; aliases; groups do not imply type. |
| Open UI | https://open-ui.org/ | Component specs as parts, states, behaviours and accessibility requirements. |
| WCAG 2.2 | https://www.w3.org/TR/WCAG22/ | Accessibility baseline. |
| WAI-ARIA APG | https://www.w3.org/WAI/ARIA/apg/ | Widget roles, names, keyboard support. |
| Storybook | https://storybook.js.org/docs/writing-stories | Rendered component states as structured examples. |
| Figma Code Connect | https://developers.figma.com/docs/code-connect/ | Mapping design components to code for agents. |

## 1. Principles and product language

GOV.UK ties its system to design principles and an accessibility strategy; Spectrum frames itself as a shared language across products. Splitbook's equivalent is the **Pace Clock** metaphor, the four-hand colour rule, **better before faster**, and the coach's-clipboard voice ([design-language.md](../foundations/design-language.md)). Agents and humans need the same decision lens when two layouts compete.

## 2. Foundations and tokens

Spectrum separates global, semantic and component tokens; Atlassian chooses tokens by meaning, not visual match; DTCG 2025.10 standardises typed, described tokens with aliases. Splitbook keeps primitives authoring-only, exposes semantic roles (46 colour roles in the brief) and adds component tokens only where a stable contract is needed (`tap-key-size`, `rating-step-size`, `length-cell-size`, `dial-size`). See [theme-token-architecture-sources.md](theme-token-architecture-sources.md).

## 3. Theming and customization rails

Atlassian describes themes as token collections for mode, contrast, density and motion. Splitbook's rails are deliberately few: **Light** (desk), **Deck** (Capture: palette and size knob), **compact** density (Admin console only), and five **worlds** that may change only type, shape and depth. Fixed rails stop a theme from breaking glare contrast or target size.

## 4. Typography and numerals

Material, GOV.UK and Atlassian treat typography as a foundation with tokens for family, size, weight and line height. Splitbook adds a separate tabular **numeral scale** (`numeral-xl|lg|md`) because glance-reading a running split is a different job from reading a sentence ([typography.md](../foundations/typography.md)).

## 5. Component anatomy and behavior

Open UI specifies controls by parts, states, behaviours and accessibility; APG gives roles and keyboard maps. Every Splitbook component doc lists anatomy, variants, states, token bindings and the APG pattern it follows; domain widgets (Tap Pad, Length strip, rating, fault flag) add poolside rules ([capture-widgets.md](../components/capture-widgets.md)).

## 6. Patterns and page templates

GOV.UK and Carbon separate components from task patterns. Splitbook's blueprints are grouped by actor: watcher, admin and system ([patterns/](../patterns/)), each with regions, states and its Deck/Light choice.

## 7. Accessibility baseline

WCAG 2.2 is the baseline and APG the behaviour reference. Splitbook adds poolside conditions from the product brief: glare, wet hands, one hand, ≥ 48 px / ≥ 56 px targets, undo for every tap, nothing time-critical behind a dialog ([accessibility.md](../foundations/accessibility.md); evidence in [poolside-conditions.md](poolside-conditions.md)).

## 8. Preview and gallery tooling

Storybook and Spectrum show components live with their props. Splitbook uses a Next.js preview route with a theme switcher, worlds gallery and overview ([preview-gallery-options.md](preview-gallery-options.md)).

## 9. Guidance for agents generating screens

Carbon MCP and Figma Code Connect give agents source-of-truth components and tokens. Splitbook's [agent contract](../agent-contract/screen-generation-rules.md) gives a numbered flow, allowed tokens, forbidden patterns and a worked Tap Pad example; the validator rejects raw values outside `tokens/`.
