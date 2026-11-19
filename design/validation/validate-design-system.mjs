#!/usr/bin/env node
// Splitbook design-system validator: token contract, per-theme CSS parity, WCAG contrast (plus the Deck glare grade),
// the Deck size knob, density and target floors, reduced motion, seeded-world rules, style bans, copy guards, and
// raw-value guardrails.
// Usage: npm run validate (from design/), or node validation/validate-design-system.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PREFIX = 'sb';
export const BRAND = 'splitbook';

const REQUIRED_ARTIFACTS = [
  'README.md',
  'AGENTS.md',
  'brief.md',
  'governance.md',
  'foundations/design-language.md',
  'foundations/typography.md',
  'foundations/accessibility.md',
  'foundations/imagery.md',
  'foundations/motion.md',
  'tokens/token-taxonomy.md',
  'tokens/tokens.json',
  'tokens/themes.css',
  'tokens/tailwind-theme.css',
  'components/containers-and-primitives.md',
  'components/navigation-and-chrome.md',
  'components/overlays.md',
  'components/inputs.md',
  'components/data-display.md',
  'components/capture-widgets.md',
  'components/trend-widgets.md',
  'components/admin-widgets.md',
  'patterns/watcher-blueprints.md',
  'patterns/admin-blueprints.md',
  'patterns/system-blueprints.md',
  'agent-contract/screen-generation-rules.md',
  'research/mature-design-system-references.md',
  'research/theme-token-architecture-sources.md',
  'research/poolside-conditions.md',
  'research/preview-gallery-options.md',
  'app/layout.tsx',
  'app/fonts.ts',
  'app/globals.css',
  'app/design/page.tsx',
  'app/worlds/page.tsx',
  'app/overview/page.tsx',
  'app/specimen/page.tsx',
  'app/tile/page.tsx',
  'preview/themes.ts',
  'preview/theme-constants.ts',
  'preview/fixtures.ts',
  'preview/splitbook-components.css',
  'preview/splitbook-preview.css',
  'validation/smoke-report.md',
];

// Section titles the /design page must render (see SECTIONS in preview/fixtures.ts).
const REQUIRED_PREVIEW_SECTIONS = [
  'Colour roles', 'Type and numerals', 'Spacing, radius and elevation', 'Deck knob', 'Core components',
  'Domain widgets', 'Watcher blueprints', 'Admin blueprints', 'System states', 'Agent recipe',
];

// Deck is a palette and a size knob: each of these must be overridden by splitbook-deck and be larger than the base.
const DECK_KNOBS = ['button-min-target', 'tap-key-size', 'rating-step-size', 'length-cell-size', 'density-inset', 'density-gap', 'type-body-size', 'type-numeral-xl-size'];
const DECK_THEME = `${BRAND}-deck`;
// The same knob as a density mode ([data-density="deck"]), so Capture keeps Deck sizing in any world.
const DECK_DENSITY = 'deck';
const TARGET_FLOOR_PX = 24;
// The brief's Deck floors: 56 CSS px targets and Tap Pad keys of at least 5rem.
const DECK_FLOORS = { 'button-min-target': 56, 'tap-key-size': 80 };
const ROOT_FONT_PX = 16;

const SOURCE_EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.md']);
// archive/ holds retired worlds (raw token values, unregistered); it is not part of the live system.
const SKIPPED_DIRS = new Set(['node_modules', '.next', 'out', 'research', 'validation', 'archive']);
const SKIPPED_FILES = new Set(['brief.md']);

// Seeded worlds: tokens/worlds/<slug>.json (theme definition) + <slug>.css (runtime block, palettes, skins). They join
// validation as themes named splitbook-<slug>. A file that fails to parse is reported, not thrown, so one broken world
// never hides the state of the others. With no worlds (only .gitkeep) the loader returns an empty list.
function loadWorlds(root) {
  const dir = join(root, 'tokens', 'worlds');
  const worlds = [];
  const loadErrors = [];
  if (!existsSync(dir)) return { worlds, loadErrors };
  const files = readdirSync(dir);
  for (const file of files.filter((name) => name.endsWith('.css'))) {
    if (!files.includes(file.replace(/\.css$/, '.json'))) loadErrors.push(`tokens/worlds/${file} has no matching .json theme definition`);
  }
  for (const file of files.filter((name) => name.endsWith('.json')).sort()) {
    const slug = file.replace(/\.json$/, '');
    let json = null;
    try {
      json = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    } catch (error) {
      loadErrors.push(`tokens/worlds/${file} is not valid JSON: ${error.message}`);
    }
    const cssPath = join(dir, `${slug}.css`);
    worlds.push({ slug, theme: `${BRAND}-${slug}`, json, css: existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : null });
  }
  return { worlds, loadErrors };
}

export function loadPackage(root) {
  const artifacts = new Set();
  const sources = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = relative(root, full).split(sep).join('/');
      if (statSync(full).isDirectory()) {
        if (entry === 'node_modules' || entry === '.next' || entry === 'out') continue;
        walk(full);
        continue;
      }
      artifacts.add(rel);
      const topDir = rel.split('/')[0];
      if (SOURCE_EXTENSIONS.has(extname(entry)) && !SKIPPED_DIRS.has(topDir) && !SKIPPED_FILES.has(rel)) sources.set(rel, readFileSync(full, 'utf8'));
    }
  };
  walk(root);
  const worlds = loadWorlds(root);
  return {
    tokens: JSON.parse(readFileSync(join(root, 'tokens', 'tokens.json'), 'utf8')),
    themesCss: readFileSync(join(root, 'tokens', 'themes.css'), 'utf8'),
    sources,
    artifacts,
    worlds: worlds.worlds,
    loadErrors: worlds.loadErrors,
  };
}

// ---------- CSS parsing ----------

// Split a selector list on top-level commas only, so `:is(.a, .b)` and `[title="a, b"]` stay one selector.
function splitSelectorList(prelude) {
  const selectors = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let index = 0; index < prelude.length; index += 1) {
    const char = prelude[index];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") quote = char;
    else if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    else if (char === ',' && depth === 0) {
      selectors.push(prelude.slice(start, index).trim());
      start = index + 1;
    }
  }
  selectors.push(prelude.slice(start).trim());
  return selectors;
}

export function parseCssBlocks(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [];
  const stack = [];
  let buffer = '';
  for (const char of text) {
    if (char === '{') {
      stack.push({ prelude: buffer.trim(), body: '' });
      buffer = '';
    } else if (char === '}') {
      const frame = stack.pop();
      if (!frame) continue;
      const media = stack.filter((parent) => parent.prelude.startsWith('@media')).map((parent) => parent.prelude).join(' and ') || null;
      const parents = stack.map((parent) => parent.prelude);
      if (!frame.prelude.startsWith('@')) {
        const decls = new Map();
        for (const declaration of (frame.body + buffer).split(';')) {
          const colon = declaration.indexOf(':');
          if (colon === -1) continue;
          decls.set(declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim().replace(/\s+/g, ' '));
        }
        blocks.push({ selectors: splitSelectorList(frame.prelude), media, decls, parents });
      }
      buffer = '';
    } else if (char === ';') {
      if (stack.length) stack[stack.length - 1].body += `${buffer};`;
      buffer = '';
    } else {
      buffer += char;
    }
  }
  return blocks;
}

const findBlock = (blocks, predicate) => blocks.find(predicate);
const themeSelector = (theme) => `html[data-theme="${theme}"]`;
const paletteSelector = (theme, palette) => `${themeSelector(theme)}[data-palette="${palette}"]`;

// ---------- token helpers ----------

const cssValue = (value) => String(value).replace(/\s+/g, ' ').trim();

function aliasToCss(value) {
  return String(value)
    .replace(/\{primitive\.font\.([\w-]+)\}/g, `var(--${PREFIX}-font-$1)`)
    .replace(/\{primitive\.fontWeight\.([\w-]+)\}/g, `var(--${PREFIX}-font-weight-$1)`)
    .replace(/\{semantic\.color\.([\w-]+)\}/g, `var(--${PREFIX}-$1)`);
}

// Easing tokens are DTCG cubicBezier arrays; CSS needs the function form.
const cssTokenValue = (token) => (token?.$type === 'cubicBezier' && Array.isArray(token.$value) ? `cubic-bezier(${token.$value.join(', ')})` : token?.$value);

// Every theme-independent token exported to :root, as [cssVar, expectedValue, tokenPath].
function exportedBaseTokens(tokens) {
  const out = [];
  const primitiveNames = { space: 'space', radius: 'radius', borderWidth: 'border-width', font: 'font', fontWeight: 'font-weight', motion: 'motion', easing: 'easing', opacity: 'opacity' };
  for (const [group, prefix] of Object.entries(primitiveNames)) {
    for (const [key, token] of Object.entries(tokens.primitive?.[group] ?? {})) {
      if (key.startsWith('$')) continue;
      out.push([`--${PREFIX}-${prefix}-${key}`, cssTokenValue(token), `primitive.${group}.${key}`]);
    }
  }
  for (const [key, token] of Object.entries(tokens.typography ?? {})) {
    const value = token.$value ?? {};
    out.push([`--${PREFIX}-type-${key}-family`, aliasToCss(value.fontFamily), `typography.${key}`]);
    out.push([`--${PREFIX}-type-${key}-size`, value.fontSize, `typography.${key}`]);
    out.push([`--${PREFIX}-type-${key}-line-height`, value.lineHeight, `typography.${key}`]);
    out.push([`--${PREFIX}-type-${key}-weight`, aliasToCss(value.fontWeight), `typography.${key}`]);
  }
  for (const [key, token] of Object.entries(tokens.density ?? {})) out.push([`--${PREFIX}-density-${key}`, token.$value, `density.${key}`]);
  for (const [key, token] of Object.entries(tokens.elevation ?? {})) {
    const shadow = token.$value ?? {};
    out.push([`--${PREFIX}-elevation-${key}`, `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} ${aliasToCss(shadow.color)}`, `elevation.${key}`]);
  }
  for (const [key, token] of Object.entries(tokens.layout ?? {})) out.push([`--${PREFIX}-layout-${key}`, token.$value, `layout.${key}`]);
  for (const [key, token] of Object.entries(tokens.layer ?? {})) out.push([`--${PREFIX}-layer-${key}`, token.$value, `layer.${key}`]);
  for (const [key, token] of Object.entries(tokens.component ?? {})) out.push([`--${PREFIX}-${key}`, token.$value, `component.${key}`]);
  return out;
}

function typedTokenGroups(tokens) {
  const groups = [];
  for (const [group, entries] of Object.entries(tokens.primitive ?? {})) groups.push([`primitive.${group}`, entries]);
  for (const name of ['typography', 'density', 'elevation', 'layout', 'layer', 'breakpoint', 'component']) groups.push([name, tokens[name] ?? {}]);
  groups.push(['semantic.color', tokens.semantic?.color ?? {}]);
  for (const [theme, definition] of Object.entries(tokens.themes ?? {})) groups.push([`themes.${theme}.overrides`, definition.overrides ?? {}]);
  for (const [mode, definition] of Object.entries(tokens.densityModes ?? {})) groups.push([`densityModes.${mode}.overrides`, definition.overrides ?? {}]);
  return groups;
}

function toPx(value) {
  const match = /^(-?\d*\.?\d+)(rem|px)$/.exec(String(value).trim());
  if (!match) return Number.NaN;
  return Number(match[1]) * (match[2] === 'rem' ? ROOT_FONT_PX : 1);
}

// ---------- WCAG contrast ----------

function relativeLuminance(hex) {
  let digits = String(hex).replace('#', '');
  if (digits.length === 3) digits = [...digits].map((digit) => digit + digit).join('');
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(digits)) return Number.NaN;
  const [r, g, b] = [0, 2, 4].map((index) => {
    const channel = parseInt(digits.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [high, low] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

// WCAG thresholds must not be rounded up, so the displayed ratio is truncated.
const formatRatio = (ratio) => (Math.floor(ratio * 100) / 100).toFixed(2);

function contrastPairs(tokens, theme) {
  const roles = Object.keys(tokens.semantic?.color ?? {});
  const text = roles
    .filter((role) => role.endsWith('foreground'))
    .map((role) => [role, role === 'foreground' ? 'background' : role.replace(/-foreground$/, '')]);
  for (const pair of tokens.contrast?.text?.pairs ?? []) text.push(pair);
  const glare = tokens.contrast?.glare;
  const textMinimum = glare && (glare.themes ?? []).includes(theme) ? glare.minimum : tokens.contrast?.text?.minimum ?? 4.5;
  return [
    { kind: 'text', minimum: textMinimum, pairs: text },
    { kind: 'non-text', minimum: tokens.contrast?.nonText?.minimum ?? 3, pairs: tokens.contrast?.nonText?.pairs ?? [] },
  ];
}

// Colour parity with the JSON definition, then every documented contrast pair, for one theme or palette block.
function colourFailures(label, definition, block, roles, pairGroups, sources) {
  const failures = [];
  const fail = (message) => failures.push(`${label}: ${message}`);
  if (block.decls.get('color-scheme') !== definition.colorScheme) fail(`color-scheme should be ${definition.colorScheme}`);
  const colors = new Map();
  for (const role of roles) {
    const cssVar = `--${PREFIX}-${role}`;
    const expected = definition.color?.[role]?.$value;
    const actual = block.decls.get(cssVar);
    if (expected === undefined) fail(`${sources.json} is missing color.${role}`);
    if (actual === undefined) {
      fail(`${sources.css} block is missing ${cssVar}`);
      continue;
    }
    if (expected !== undefined && actual.toLowerCase() !== String(expected).toLowerCase()) fail(`${sources.css} ${cssVar} is ${actual} but ${sources.json} has ${expected}`);
    colors.set(role, actual);
  }
  for (const { kind, minimum, pairs } of pairGroups) {
    for (const [foregroundRole, backgroundRole] of pairs) {
      const foreground = colors.get(foregroundRole);
      const background = colors.get(backgroundRole);
      if (!foreground || !background) continue;
      const ratio = contrastRatio(foreground, background);
      if (Number.isNaN(ratio)) fail(`cannot measure ${foregroundRole} (${foreground}) against ${backgroundRole} (${background})`);
      else if (ratio < minimum) fail(`${kind} ${foregroundRole} ${kind === 'text' ? 'on' : 'against'} ${backgroundRole} is ${formatRatio(ratio)}:1; needs ${minimum}:1`);
    }
  }
  return failures;
}

// ---------- raw-value guardrails ----------

const HEX = /(?<![\w&])#[0-9a-fA-F]{3,8}\b/g;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/g;
const LENGTH_OR_TIME = /(?<![\w.-])\d*\.?\d+(?:px|rem|em|ms|pt|ch)\b/g;
// Opacity 0 and 1 are the off and on states of a fade or reveal, not visual tuning, so they stay allowed.
const UNITLESS_VISUAL = /\b(?:font-weight|line-height|letter-spacing|z-index)\s*:\s*-?\.?\d|\bopacity\s*:\s*(?![01](?![\d.]))-?\.?\d/g;
const RAW_SHADOW = /\bbox-shadow\s*:(?!\s*(?:var\(|none|inherit|initial|unset))[^;}]+/g;
// Timing functions come from --sb-easing-*; keywords and literal curves are raw values (gradients are not easings).
const RAW_EASING = /\b(?:cubic-bezier|steps)\(|(?<![\w-])(?:ease|ease-in|ease-out|ease-in-out|linear)(?![\w(-])/g;
const TAILWIND_ARBITRARY = /(?<![\w-])[a-z][\w:-]*-\[[^\]\s]+\]/g;
const TAILWIND_PALETTE = /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|divide|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{2,3})?\b/g;
const TAILWIND_Z = /(?<![\w-])(?:[a-z-]+:)*-?z-\d+\b/g;

function rawValueFailures(path, text, breakpoints) {
  const failures = [];
  const ext = extname(path);
  const report = (label, matches) => {
    if (matches.length) failures.push(`${path}: ${label} outside the token layer: ${[...new Set(matches)].slice(0, 5).join(', ')}`);
  };
  report('raw colour value', text.match(HEX) ?? []);
  if (ext === '.md') return failures;

  let code = ext === '.css' ? text.replace(/\/\*[\s\S]*?\*\//g, '') : text;
  if (ext === '.css') {
    code = code.replace(/@media([^{]*)\{/g, (_, prelude) => {
      const lengths = prelude.match(LENGTH_OR_TIME) ?? [];
      const offTokens = lengths.filter((length) => !breakpoints.has(length));
      if (offTokens.length) failures.push(`${path}: media query uses ${offTokens.join(', ')}; use a breakpoint token (${[...breakpoints].join(', ')})`);
      return '@media {';
    });
    report('raw shadow', code.match(RAW_SHADOW) ?? []);
    report('unitless visual value (use a type, opacity, or layer token)', code.match(UNITLESS_VISUAL) ?? []);
    report(`raw easing (use a --${PREFIX}-easing-* token)`, code.match(RAW_EASING) ?? []);
  }
  report('raw colour function', code.match(COLOR_FUNCTION) ?? []);
  report('raw length/duration', code.match(LENGTH_OR_TIME) ?? []);
  if (ext === '.tsx' || ext === '.ts') {
    report('Tailwind arbitrary value', code.match(TAILWIND_ARBITRARY) ?? []);
    report('raw Tailwind palette utility', code.match(TAILWIND_PALETTE) ?? []);
    report(`raw Tailwind z-index utility (use a --${PREFIX}-layer-* token)`, code.match(TAILWIND_Z) ?? []);
  }
  return failures;
}

// ---------- style bans (brief: no gradient text, no decorative glass; worlds also ban infinite loops below) ----------

const STYLE_BANS = [
  [/background-clip\s*:\s*text/, 'gradient text (background-clip: text)'],
  [/backdrop-filter\s*:(?!\s*none)/, 'decorative glass (backdrop-filter)'],
];

function styleBanFailures(path, css) {
  const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return STYLE_BANS.filter(([pattern]) => pattern.test(code)).map(([, label]) => `${path}: ${label} is banned`);
}

// ---------- copy guards (brief: brand name, faults are an observer's notes) ----------

const COPY_BANS = [
  [/mathgo/i, 'names MathGo; the product is Splitbook and MathGo never appears'],
  [/\bDQ\b|disqualif/i, 'says "DQ" or "disqualified"; a Fault is an observer\'s note, never a referee\'s call'],
];

function copyFailures(path, text) {
  return COPY_BANS.filter(([pattern]) => pattern.test(text)).map(([, label]) => `${path}: ${label}`);
}

// ---------- seeded worlds ----------

// Worlds may restyle type, shape, and depth. Motion, density, spacing, layout, and component sizes stay system-wide so
// reduced motion, the Deck knob, compact density, and target floors cannot be bypassed by a world.
const WORLD_OVERRIDE = /^(?:font-(?:sans|display|mono)|font-weight-[\w-]+|type-[\w-]+-(?:family|size|line-height|weight)|radius-[\w-]+|border-width-[\w-]+|elevation-[\w-]+)$/;
const WORLD_MOTION_PROPERTIES = new Set(['animation', 'animation-duration', 'animation-delay', 'transition', 'transition-duration', 'transition-delay']);
const RAW_TIME = /(?<![\w.-])\d*\.?\d+m?s\b/;
const KEBAB = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
// Every world ships exactly four colour options: the recommended default (theme block), two alternatives, then original.
const WORLD_PALETTE_COUNT = 3;
const ORIGINAL_PALETTE = 'original';

function worldFailures(world, roles) {
  const failures = [];
  const fail = (message) => failures.push(`${world.theme}: ${message}`);
  const { json, css, slug } = world;
  const scope = themeSelector(world.theme);

  for (const field of ['label', '$description', 'signature']) {
    if (typeof json[field] !== 'string' || !json[field].trim()) fail(`tokens/worlds/${slug}.json needs a non-empty "${field}"`);
  }
  if (!Number.isInteger(json.order)) fail(`tokens/worlds/${slug}.json needs an integer "order"`);
  if (!['light', 'dark'].includes(json.colorScheme)) fail(`tokens/worlds/${slug}.json colorScheme must be "light" or "dark"`);
  const overrideKeys = Object.keys(json.overrides ?? {});
  for (const key of overrideKeys) {
    if (!WORLD_OVERRIDE.test(key)) fail(`override --${PREFIX}-${key} is not allowed in a world (only font, type, radius, border-width, and elevation tokens)`);
  }

  // "palette" names the default colours in the theme block; each entry in "palettes" is a full colour set applied by
  // html[data-theme="splitbook-<slug>"][data-palette="<id>"].
  const palettes = Array.isArray(json.palettes) ? json.palettes : [];
  if (!Array.isArray(json.palettes)) fail(`tokens/worlds/${slug}.json needs "palettes": an array of ${WORLD_PALETTE_COUNT} alternative colour options`);
  else if (palettes.length !== WORLD_PALETTE_COUNT) {
    fail(`tokens/worlds/${slug}.json needs exactly 4 colour options: the default plus ${WORLD_PALETTE_COUNT} palettes (found ${palettes.length})`);
  }
  if (palettes.length && palettes[palettes.length - 1]?.id !== ORIGINAL_PALETTE) fail(`tokens/worlds/${slug}.json must list "${ORIGINAL_PALETTE}" as its last colour option`);
  if (typeof json.palette?.label !== 'string' || !json.palette.label.trim()) fail(`tokens/worlds/${slug}.json needs "palette": { "label" } naming its default colours`);
  const paletteIds = new Set();
  for (const palette of palettes) {
    const at = `palette "${palette?.id}"`;
    if (!KEBAB.test(palette?.id ?? '')) fail(`${at} needs a kebab-case id`);
    else if (paletteIds.has(palette.id)) fail(`${at} is defined twice`);
    paletteIds.add(palette?.id);
    if (typeof palette?.label !== 'string' || !palette.label.trim()) fail(`${at} needs a label`);
    if (!['light', 'dark'].includes(palette?.colorScheme)) fail(`${at} colorScheme must be "light" or "dark"`);
  }

  for (const [pattern, label] of [[/@import\b/, '@import'], [/@font-face\b/, '@font-face (load faces in app/fonts.ts)'], [/@layer\b/, '@layer']]) {
    if (pattern.test(css)) fail(`tokens/worlds/${slug}.css must not use ${label}`);
  }
  for (const failure of styleBanFailures(`tokens/worlds/${slug}.css`, css)) fail(failure);
  for (const [, name] of css.matchAll(/@keyframes\s+([\w-]+)/g)) {
    if (!name.startsWith(`${slug}-`)) fail(`@keyframes ${name} must be prefixed "${slug}-" so worlds never collide`);
  }
  for (const [, name] of css.matchAll(/@property\s+(--[\w-]+)/g)) {
    if (!name.startsWith(`--${slug}-`)) fail(`@property ${name} must be prefixed "--${slug}-"`);
  }

  const allowedTokens = new Set([...roles, ...overrideKeys].map((key) => `--${PREFIX}-${key}`));
  const roleTokens = new Set(roles.map((role) => `--${PREFIX}-${role}`));
  const paletteBlockPattern = new RegExp(`^${scope.replace(/[[\]"().]/g, '\\$&')}\\[data-palette="([^"]+)"\\]$`);
  const paletteBlocks = new Map();
  let themeBlocks = 0;
  for (const block of parseCssBlocks(css)) {
    if (block.parents.some((parent) => parent.startsWith('@keyframes'))) continue;
    const isThemeBlock = !block.media && block.selectors.length === 1 && block.selectors[0] === scope;
    if (isThemeBlock) themeBlocks += 1;
    const paletteId = !block.media && block.selectors.length === 1 ? paletteBlockPattern.exec(block.selectors[0])?.[1] : undefined;
    if (paletteId !== undefined) {
      paletteBlocks.set(paletteId, (paletteBlocks.get(paletteId) ?? 0) + 1);
      if (!paletteIds.has(paletteId)) fail(`palette block "${paletteId}" has no matching palette in tokens/worlds/${slug}.json`);
      for (const property of block.decls.keys()) {
        if (property === 'color-scheme' || property.startsWith(`--${slug}-`)) continue;
        if (!roleTokens.has(property)) fail(`palette block "${paletteId}" may only set color-scheme, colour roles, and --${slug}-* helpers (found ${property})`);
      }
      continue;
    }
    for (const selector of block.selectors) {
      if (!selector.startsWith(scope)) fail(`selector "${selector}" must start with ${scope}`);
    }
    for (const [property, value] of block.decls) {
      if (property.startsWith(`--${PREFIX}-`)) {
        if (!isThemeBlock) fail(`${property} may only be set in the ${scope} block, where tokens/worlds/${slug}.json documents it`);
        else if (!allowedTokens.has(property)) fail(`${property} is not a colour role or a documented override in tokens/worlds/${slug}.json`);
      }
      if (!WORLD_MOTION_PROPERTIES.has(property) && property !== 'animation-iteration-count') continue;
      if (/\binfinite\b/.test(value)) fail(`"${property}: ${value}" loops forever; animations must be bounded`);
      if (WORLD_MOTION_PROPERTIES.has(property) && RAW_TIME.test(value) && !(block.media ?? '').includes('prefers-reduced-motion: no-preference')) {
        fail(`"${property}: ${value}" uses a raw duration; use var(--${PREFIX}-motion-*) or wrap it in @media (prefers-reduced-motion: no-preference)`);
      }
    }
  }
  if (themeBlocks !== 1) fail(`tokens/worlds/${slug}.css needs exactly one ${scope} block (found ${themeBlocks})`);
  for (const id of paletteIds) if ((paletteBlocks.get(id) ?? 0) !== 1) fail(`palette "${id}" needs exactly one ${paletteSelector(world.theme, id)} block (found ${paletteBlocks.get(id) ?? 0})`);
  return failures;
}

// ---------- validation ----------

export function validateDesignSystem({ tokens: coreTokens, themesCss: coreCss, sources, artifacts, worlds = [], loadErrors = [] }) {
  const failures = [...loadErrors];
  const fail = (message) => failures.push(message);

  for (const artifact of REQUIRED_ARTIFACTS) if (!artifacts.has(artifact)) fail(`Missing required artifact: ${artifact}`);

  // Worlds join the theme set, so every theme gate (roles, parity, contrast, overrides) applies to them unchanged.
  const readyWorlds = worlds.filter((world) => world.json);
  for (const world of readyWorlds) if (world.css === null) fail(`${world.theme}: tokens/worlds/${world.slug}.css is missing`);
  const loadedWorlds = readyWorlds.filter((world) => world.css !== null);
  const coreThemes = coreTokens.meta?.themes ?? [];
  const tokens = {
    ...coreTokens,
    meta: { ...coreTokens.meta, themes: [...coreThemes, ...loadedWorlds.map((world) => world.theme)] },
    themes: { ...coreTokens.themes, ...Object.fromEntries(loadedWorlds.map((world) => [world.theme, world.json])) },
  };
  const themesCss = [coreCss, ...loadedWorlds.map((world) => world.css)].join('\n');

  // Typed and described tokens.
  for (const [group, entries] of typedTokenGroups(tokens)) {
    for (const [key, token] of Object.entries(entries)) {
      if (key.startsWith('$')) continue;
      if (!token?.$type) fail(`${group}.${key} is missing $type`);
      if (!token?.$description) fail(`${group}.${key} is missing $description`);
      if (token?.$value === undefined) fail(`${group}.${key} is missing $value`);
    }
  }

  const roles = Object.keys(tokens.semantic?.color ?? {});
  for (const role of roles) {
    if (role.endsWith('-foreground') && !roles.includes(role.replace(/-foreground$/, ''))) fail(`semantic.color.${role} has no matching surface role`);
  }
  for (const surface of roles.filter((role) => role.startsWith('surface-') && !role.endsWith('-foreground'))) {
    if (!roles.includes(`${surface}-foreground`)) fail(`semantic.color.${surface} is missing its foreground pair`);
  }

  for (const world of loadedWorlds) {
    if (coreThemes.includes(world.theme)) fail(`${world.theme}: a world cannot reuse a core theme name`);
    failures.push(...worldFailures(world, roles));
  }
  for (const field of ['order', 'label']) {
    const seen = new Map();
    for (const world of loadedWorlds) {
      const value = world.json[field];
      if (seen.has(value)) fail(`${world.theme}: ${field} ${JSON.stringify(value)} is already used by ${seen.get(value)}`);
      else seen.set(value, world.theme);
    }
  }

  const blocks = parseCssBlocks(themesCss);
  const baseBlock = findBlock(blocks, (block) => !block.media && block.selectors.length === 1 && block.selectors[0] === ':root');
  if (!baseBlock) fail('themes.css is missing the theme-independent :root block');
  const baseDecls = baseBlock?.decls ?? new Map();

  for (const [cssVar, expected, path] of exportedBaseTokens(tokens)) {
    const actual = baseDecls.get(cssVar);
    if (actual === undefined) fail(`:root is missing ${cssVar} (${path})`);
    else if (cssValue(actual) !== cssValue(expected)) fail(`:root ${cssVar} is "${actual}" but tokens.json ${path} is "${expected}"`);
  }

  const themes = tokens.meta?.themes ?? [];
  if (!coreThemes.includes(DECK_THEME)) fail(`tokens.json meta.themes must include ${DECK_THEME}`);
  for (const theme of themes) {
    const definition = tokens.themes?.[theme];
    if (!definition) {
      fail(`tokens.json is missing theme ${theme}`);
      continue;
    }
    const block = findBlock(blocks, (candidate) => !candidate.media && candidate.selectors.includes(themeSelector(theme)));
    if (!block) {
      fail(`themes.css is missing a block for ${themeSelector(theme)}`);
      continue;
    }
    const world = loadedWorlds.find((candidate) => candidate.theme === theme);
    const sources = world ? { json: `tokens/worlds/${world.slug}.json`, css: `tokens/worlds/${world.slug}.css` } : { json: 'tokens.json', css: 'themes.css' };
    failures.push(...colourFailures(theme, definition, block, roles, contrastPairs(tokens, theme), sources));

    for (const [key, token] of Object.entries(definition.overrides ?? {})) {
      const cssVar = `--${PREFIX}-${key}`;
      if (!baseDecls.has(cssVar)) fail(`${theme}: override ${cssVar} does not exist in :root`);
      const actual = block.decls.get(cssVar);
      if (actual === undefined) fail(`${theme}: themes.css block is missing override ${cssVar}`);
      else if (cssValue(actual) !== cssValue(token.$value)) fail(`${theme}: themes.css ${cssVar} is ${actual} but tokens.json has ${token.$value}`);
    }
  }

  // Each world palette is a complete colour set: same parity and contrast gates as the theme it recolours.
  for (const world of loadedWorlds) {
    for (const palette of Array.isArray(world.json.palettes) ? world.json.palettes : []) {
      const selector = paletteSelector(world.theme, palette.id);
      const block = findBlock(blocks, (candidate) => !candidate.media && candidate.selectors.length === 1 && candidate.selectors[0] === selector);
      if (!block) {
        fail(`${world.theme} palette "${palette.id}": tokens/worlds/${world.slug}.css has no ${selector} block`);
        continue;
      }
      const sources = { json: `tokens/worlds/${world.slug}.json palettes`, css: `tokens/worlds/${world.slug}.css` };
      failures.push(...colourFailures(`${world.theme} palette "${palette.id}"`, palette, block, roles, contrastPairs(tokens, world.theme), sources));
    }
  }

  // The Deck size knob: overridden in tokens.json and in the Deck block, and larger than the base.
  const deckOverrides = tokens.themes?.[DECK_THEME]?.overrides ?? {};
  const deckBlock = findBlock(blocks, (candidate) => !candidate.media && candidate.selectors.includes(themeSelector(DECK_THEME)));
  for (const knob of DECK_KNOBS) {
    const override = deckOverrides[knob]?.$value;
    if (override === undefined) {
      fail(`${DECK_THEME}: tokens.json must override Deck knob --${PREFIX}-${knob}`);
      continue;
    }
    if (deckBlock && !deckBlock.decls.has(`--${PREFIX}-${knob}`)) fail(`${DECK_THEME}: themes.css block must set Deck knob --${PREFIX}-${knob}`);
    const base = baseDecls.get(`--${PREFIX}-${knob}`);
    if (base !== undefined && !(toPx(override) > toPx(base))) fail(`${DECK_THEME}: --${PREFIX}-${knob} (${override}) must be larger than the base (${base})`);
  }
  for (const [knob, floor] of Object.entries(DECK_FLOORS)) {
    const value = deckOverrides[knob]?.$value;
    if (value !== undefined && !(toPx(value) >= floor)) fail(`${DECK_THEME}: --${PREFIX}-${knob} (${value}) is below the Deck floor of ${floor} CSS px`);
  }

  // The Deck size knob as a density mode, so it composes with any theme or world: every knob overridden, larger than the
  // base, at the Deck floors, and equal to what splitbook-deck sets (one knob, two ways to switch it on).
  const deckDensity = tokens.densityModes?.[DECK_DENSITY]?.overrides;
  if (!deckDensity) fail(`tokens.json densityModes must include "${DECK_DENSITY}" (the Deck size knob for any theme or world)`);
  else {
    for (const knob of DECK_KNOBS) {
      const value = deckDensity[knob]?.$value;
      if (value === undefined) {
        fail(`density ${DECK_DENSITY}: tokens.json must override Deck knob --${PREFIX}-${knob}`);
        continue;
      }
      const base = baseDecls.get(`--${PREFIX}-${knob}`);
      if (base !== undefined && !(toPx(value) > toPx(base))) fail(`density ${DECK_DENSITY}: --${PREFIX}-${knob} (${value}) must be larger than the base (${base})`);
      const themeValue = deckOverrides[knob]?.$value;
      if (themeValue !== undefined && cssValue(themeValue) !== cssValue(value)) fail(`density ${DECK_DENSITY}: --${PREFIX}-${knob} (${value}) must match ${DECK_THEME} (${themeValue})`);
    }
    for (const [knob, floor] of Object.entries(DECK_FLOORS)) {
      const value = deckDensity[knob]?.$value;
      if (value !== undefined && !(toPx(value) >= floor)) fail(`density ${DECK_DENSITY}: --${PREFIX}-${knob} (${value}) is below the Deck floor of ${floor} CSS px`);
    }
  }

  // Density modes.
  for (const [mode, definition] of Object.entries(tokens.densityModes ?? {})) {
    const block = findBlock(blocks, (candidate) => !candidate.media && candidate.selectors.includes(definition.selector));
    if (!block) {
      fail(`themes.css is missing density mode ${mode} (${definition.selector})`);
      continue;
    }
    for (const [key, token] of Object.entries(definition.overrides ?? {})) {
      const cssVar = `--${PREFIX}-${key}`;
      if (!baseDecls.has(cssVar)) fail(`density ${mode}: override ${cssVar} does not exist in :root`);
      const actual = block.decls.get(cssVar);
      if (actual === undefined) fail(`density ${mode}: themes.css is missing ${cssVar}`);
      else if (cssValue(actual) !== cssValue(token.$value)) fail(`density ${mode}: themes.css ${cssVar} is ${actual} but tokens.json has ${token.$value}`);
    }
  }

  // Target-size floor in every scope that sets it (base, Deck, compact, and any world block).
  const targetVar = `--${PREFIX}-button-min-target`;
  const targets = [[':root', baseDecls.get(targetVar)]];
  for (const block of blocks) if (block !== baseBlock && block.decls.has(targetVar)) targets.push([block.selectors.join(', '), block.decls.get(targetVar)]);
  for (const [scope, value] of targets) {
    if (value !== undefined && !(toPx(value) >= TARGET_FLOOR_PX)) fail(`${scope}: ${targetVar} ${value} is below the ${TARGET_FLOOR_PX}px target floor`);
  }

  // Control sizes scale the target, so the smallest target in any scope (compact) sets their floor.
  const smallestTarget = Math.min(...targets.map(([, value]) => toPx(value)).filter((px) => !Number.isNaN(px)));
  const controlSizes = new Map(Object.entries(tokens.component ?? {}).filter(([key]) => key.startsWith('control-size-')).map(([key, token]) => [key, token.$value]));
  for (const definition of Object.values(tokens.densityModes ?? {})) {
    for (const [key, token] of Object.entries(definition.overrides ?? {})) if (key.startsWith('control-size-')) controlSizes.set(`${key} (density)`, token.$value);
  }
  for (const [key, value] of controlSizes) {
    const factor = new RegExp(`^calc\\(var\\(${targetVar}\\)\\s*\\*\\s*(\\d*\\.?\\d+)\\)$`).exec(String(value).trim())?.[1];
    const px = factor !== undefined ? Number(factor) * smallestTarget : toPx(value);
    if (Number.isNaN(px)) fail(`component.${key} must be a length or calc(var(${targetVar}) * <factor>)`);
    else if (px < TARGET_FLOOR_PX) fail(`component.${key} is ${Math.round(px * 10) / 10}px at the smallest target (${smallestTarget}px); it must stay at or above the ${TARGET_FLOOR_PX}px target floor`);
  }

  // Reduced motion collapses every motion duration.
  const reducedMotion = findBlock(blocks, (block) => block.media?.includes('prefers-reduced-motion: reduce') && block.selectors.includes(':root'));
  for (const key of Object.keys(tokens.primitive?.motion ?? {})) {
    if (key.startsWith('$')) continue;
    const value = reducedMotion?.decls.get(`--${PREFIX}-motion-${key}`);
    if (value === undefined) fail(`Reduced-motion block does not collapse --${PREFIX}-motion-${key}`);
    else if (!/^(?:0|0?\.\d+|1)m?s$/.test(value)) fail(`Reduced-motion block sets --${PREFIX}-motion-${key} to ${value}; collapse it to 1ms or less`);
  }

  // Component, density, layer, and elevation tokens must be consumed by the preview, not re-hard-coded.
  const consumerText = [...sources].filter(([path]) => !path.startsWith('tokens/') && !path.endsWith('.md')).map(([, text]) => text).join('\n');
  const consumed = [
    ...Object.keys(tokens.component ?? {}).map((key) => `--${PREFIX}-${key}`),
    ...Object.keys(tokens.density ?? {}).map((key) => `--${PREFIX}-density-${key}`),
    ...Object.keys(tokens.layer ?? {}).map((key) => `--${PREFIX}-layer-${key}`),
  ];
  for (const cssVar of consumed) {
    if (!new RegExp(`${cssVar}(?![\\w-])`).test(consumerText)) fail(`${cssVar} is exported but not consumed by the preview`);
  }
  for (const key of Object.keys(tokens.elevation ?? {})) {
    if (!new RegExp(`(--${PREFIX}-elevation-${key}|shadow-${key})(?![\\w-])`).test(consumerText)) fail(`--${PREFIX}-elevation-${key} is exported but not consumed by the preview`);
  }

  // Raw visual values: allowed only in tokens/. Style bans apply to every stylesheet; copy guards to the preview.
  const breakpoints = new Set(Object.values(tokens.breakpoint ?? {}).map((token) => token.$value));
  for (const [path, text] of sources) {
    if (path.endsWith('.css')) failures.push(...styleBanFailures(path, text));
    if (path.startsWith('app/') || path.startsWith('preview/')) failures.push(...copyFailures(path, text));
    if (path.startsWith('tokens/')) continue;
    failures.push(...rawValueFailures(path, text, breakpoints));
  }

  const previewText = [...sources].filter(([path]) => path.startsWith('preview/') || path.startsWith('app/')).map(([, text]) => text).join('\n');
  for (const section of REQUIRED_PREVIEW_SECTIONS) if (!previewText.includes(section)) fail(`/design preview is missing section: ${section}`);

  return failures;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const pkg = loadPackage(root);
  const failures = validateDesignSystem(pkg);
  if (failures.length) {
    console.error('Splitbook design-system validation failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  const pairCount = contrastPairs(pkg.tokens).reduce((sum, group) => sum + group.pairs.length, 0);
  const paletteCount = pkg.worlds.reduce((sum, world) => sum + (Array.isArray(world.json?.palettes) ? world.json.palettes.length : 0), 0);
  console.log('Splitbook design-system validation passed.');
  console.log(
    `Checked ${REQUIRED_ARTIFACTS.length} artifacts, ${pkg.tokens.meta.themes.length} core themes + ${pkg.worlds.length} seeded worlds with ${paletteCount} extra colour options, ` +
      `${Object.keys(pkg.tokens.semantic.color).length} semantic roles, ${pairCount} contrast pairs per colour set, and ${pkg.sources.size} source files for raw values.`,
  );
}
