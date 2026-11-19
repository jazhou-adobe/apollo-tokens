#!/usr/bin/env node
// Hermes Hub design-system validator: token contract, per-theme CSS parity, WCAG contrast, density knobs, world rules,
// and raw-value guardrails.
// Usage: node validation/validate-design-system.mjs (from design/), or npm run validate.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PREFIX = '--hh-';
const THEME_PREFIX = 'hermes-';

const REQUIRED_ARTIFACTS = [
  'README.md',
  'AGENTS.md',
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
  'components/round-widgets.md',
  'components/agent-widgets.md',
  'components/status-widgets.md',
  'patterns/command-center-blueprints.md',
  'patterns/phone-blueprints.md',
  'patterns/system-blueprints.md',
  'agent-contract/screen-generation-rules.md',
  'research/mature-design-system-references.md',
  'research/theme-token-architecture-sources.md',
  'research/ops-room-and-strip-references.md',
  'research/preview-gallery-options.md',
  'app/layout.tsx',
  'app/globals.css',
  'app/fonts.ts',
  'app/design/page.tsx',
  'app/worlds/page.tsx',
  'app/overview/page.tsx',
  'app/specimen/page.tsx',
  'app/tile/page.tsx',
  'preview/themes.ts',
  'preview/theme-constants.ts',
  'preview/fixtures.ts',
  'preview/hermes-components.css',
  'validation/smoke-report.md',
];

const REQUIRED_PREVIEW_SECTIONS = [
  'Colour roles', 'Typography', 'Spacing, radius and elevation', 'Density modes', 'Core components', 'Domain widgets',
  'Strip bay', 'Command Center blueprints', 'Phone blueprints', 'System blueprints', 'Agent recipe',
];

// Density knobs from the brief. Compact must lower these (and keep the target floor); glance must raise these.
const COMPACT_LOWERS = ['density-inset', 'density-gap', 'density-control-padding-block', 'density-control-padding-inline', 'density-row-height', 'strip-min-height'];
const GLANCE_RAISES = [
  'button-min-target', 'option-row-min-height', 'density-inset', 'density-gap', 'density-control-padding-block',
  'density-control-padding-inline', 'density-row-height', 'type-body-size',
];
const TARGET_FLOOR_PX = 24;
const GLANCE_TARGET_FLOOR_PX = 48;
const ROOT_FONT_PX = 16;

const SOURCE_EXTENSIONS = new Set(['.css', '.ts', '.tsx', '.md']);
const SKIPPED_DIRS = new Set(['node_modules', '.next', 'out', 'research', 'validation']);
const WORLD_REGISTRY = 'preview/themes.ts';

// Worlds live beside the core tokens: tokens/worlds/<slug>.json (theme definition) + <slug>.css (runtime block and skins).
// They join validation as themes named hermes-<slug>. A file that fails to parse is reported, not thrown, so one broken
// world never hides the state of the others. Zero worlds is a valid state.
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
    worlds.push({ slug, theme: `${THEME_PREFIX}${slug}`, json, css: existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : null });
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
      if (SOURCE_EXTENSIONS.has(extname(entry)) && !SKIPPED_DIRS.has(topDir)) sources.set(rel, readFileSync(full, 'utf8'));
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
export function splitSelectorList(prelude) {
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
const sameSelectors = (block, selectors) => block.selectors.length === selectors.length && selectors.every((selector) => block.selectors.includes(selector));

// ---------- token helpers ----------

const cssValue = (value) => String(value).replace(/\s+/g, ' ').trim();

function aliasToCss(value) {
  return String(value)
    .replace(/\{primitive\.font\.([\w-]+)\}/g, `var(${PREFIX}font-$1)`)
    .replace(/\{primitive\.fontWeight\.([\w-]+)\}/g, `var(${PREFIX}font-weight-$1)`)
    .replace(/\{semantic\.color\.([\w-]+)\}/g, `var(${PREFIX}$1)`);
}

// Easing tokens are DTCG cubicBezier arrays; CSS needs the function form.
const cssTokenValue = (token) => (token?.$type === 'cubicBezier' && Array.isArray(token.$value) ? `cubic-bezier(${token.$value.join(', ')})` : token?.$value);

const PRIMITIVE_NAMES = {
  space: 'space', radius: 'radius', borderWidth: 'border-width', font: 'font', fontWeight: 'font-weight',
  letterSpacing: 'letter-spacing', motion: 'motion', easing: 'easing', opacity: 'opacity',
};

// Every theme-independent token exported to :root, as [cssVar, expectedValue, tokenPath].
function exportedBaseTokens(tokens) {
  const out = [];
  for (const [group, prefix] of Object.entries(PRIMITIVE_NAMES)) {
    for (const [key, token] of Object.entries(tokens.primitive?.[group] ?? {})) out.push([`${PREFIX}${prefix}-${key}`, cssTokenValue(token), `primitive.${group}.${key}`]);
  }
  for (const [key, token] of Object.entries(tokens.typography ?? {})) {
    const value = token.$value ?? {};
    out.push([`${PREFIX}type-${key}-family`, aliasToCss(value.fontFamily), `typography.${key}`]);
    out.push([`${PREFIX}type-${key}-size`, value.fontSize, `typography.${key}`]);
    out.push([`${PREFIX}type-${key}-line-height`, value.lineHeight, `typography.${key}`]);
    out.push([`${PREFIX}type-${key}-weight`, aliasToCss(value.fontWeight), `typography.${key}`]);
  }
  for (const [key, token] of Object.entries(tokens.density ?? {})) out.push([`${PREFIX}density-${key}`, token.$value, `density.${key}`]);
  for (const [key, token] of Object.entries(tokens.elevation ?? {})) {
    const shadow = token.$value ?? {};
    out.push([`${PREFIX}elevation-${key}`, `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} ${aliasToCss(shadow.color)}`, `elevation.${key}`]);
  }
  for (const [key, token] of Object.entries(tokens.layout ?? {})) out.push([`${PREFIX}layout-${key}`, token.$value, `layout.${key}`]);
  for (const [key, token] of Object.entries(tokens.layer ?? {})) out.push([`${PREFIX}layer-${key}`, token.$value, `layer.${key}`]);
  for (const [key, token] of Object.entries(tokens.component ?? {})) out.push([`${PREFIX}${key}`, token.$value, `component.${key}`]);
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

export function contrastPairs(tokens) {
  const roles = Object.keys(tokens.semantic?.color ?? {});
  const text = roles
    .filter((role) => role.endsWith('foreground'))
    .map((role) => [role, role === 'foreground' ? 'background' : role.replace(/-foreground$/, '')]);
  for (const pair of tokens.contrast?.text?.pairs ?? []) text.push(pair);
  return [
    { kind: 'text', minimum: tokens.contrast?.text?.minimum ?? 4.5, pairs: text },
    { kind: 'non-text', minimum: tokens.contrast?.nonText?.minimum ?? 3, pairs: tokens.contrast?.nonText?.pairs ?? [] },
  ];
}

// The brief's gates. tokens.json → contrast must list each one, so removing a pair from the JSON cannot silence a gate.
const SURFACES = ['background', 'surface-card', 'surface-panel', 'surface-shelf', 'surface-tray'];
const HOLDERS = ['pending', 'answered', 'expired', 'recommended'];
const IDENTITY_ROLES = ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5', 'agent-6', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
const BRIEF_TEXT_PAIRS = [
  ['foreground', 'input'],
  ['code-foreground', 'diff-add'],
  ['code-foreground', 'diff-remove'],
  ...[...SURFACES, 'muted'].map((surface) => ['muted-foreground', surface]),
];
const BRIEF_NON_TEXT_PAIRS = [
  ...['border', 'ring'].flatMap((role) => [...SURFACES, 'strip', 'input'].map((surface) => [role, surface])),
  ...HOLDERS.flatMap((holder) => ['strip', 'background'].map((surface) => [holder, surface])),
  ...IDENTITY_ROLES.flatMap((role) => ['surface-card', 'surface-panel', 'background'].map((surface) => [role, surface])),
];

function briefPairFailures(tokens) {
  const failures = [];
  const has = (list, [a, b]) => list.some(([x, y]) => x === a && y === b);
  const text = tokens.contrast?.text?.pairs ?? [];
  const nonText = tokens.contrast?.nonText?.pairs ?? [];
  if ((tokens.contrast?.text?.minimum ?? 4.5) < 4.5) failures.push('tokens.json contrast.text.minimum must be at least 4.5');
  if ((tokens.contrast?.nonText?.minimum ?? 3) < 3) failures.push('tokens.json contrast.nonText.minimum must be at least 3');
  for (const pair of BRIEF_TEXT_PAIRS) if (!has(text, pair)) failures.push(`tokens.json contrast.text is missing the brief's pair ${pair.join(' on ')}`);
  for (const pair of BRIEF_NON_TEXT_PAIRS) if (!has(nonText, pair)) failures.push(`tokens.json contrast.nonText is missing the brief's pair ${pair.join(' against ')}`);
  return failures;
}

// Colour parity with the JSON definition, then every documented contrast pair, for one theme or palette block.
function colourFailures(label, definition, block, roles, pairGroups, sources) {
  const failures = [];
  const fail = (message) => failures.push(`${label}: ${message}`);
  if (block.decls.get('color-scheme') !== definition.colorScheme) fail(`color-scheme should be ${definition.colorScheme}`);
  const colors = new Map();
  for (const role of roles) {
    const cssVar = `${PREFIX}${role}`;
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
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(/g;
const LENGTH_OR_TIME = /(?<![\w.-])\d*\.?\d+(?:px|rem|em|ms|pt|ch)\b/g;
// Opacity 0 and 1 are the off and on states of a fade or reveal, not visual tuning, so they stay allowed.
const UNITLESS_VISUAL = /\b(?:font-weight|line-height|letter-spacing|z-index)\s*:\s*-?\.?\d|\bopacity\s*:\s*(?![01](?![\d.]))-?\.?\d/g;
const RAW_SHADOW = /\bbox-shadow\s*:(?!\s*(?:var\(|none|inherit|initial|unset))[^;}]+/g;
// Timing functions come from --hh-easing-*; keywords and literal curves are raw values (gradients are not easings).
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
    // Media and container query breakpoints both come from the breakpoint tokens.
    code = code.replace(/@(media|container)([^{]*)\{/g, (_, kind, prelude) => {
      const lengths = prelude.match(LENGTH_OR_TIME) ?? [];
      const offTokens = lengths.filter((length) => !breakpoints.has(length));
      if (offTokens.length) failures.push(`${path}: ${kind} query uses ${offTokens.join(', ')}; use a breakpoint token (${[...breakpoints].join(', ')})`);
      return `@${kind} {`;
    });
    report('raw shadow', code.match(RAW_SHADOW) ?? []);
    report('unitless visual value (use a type, opacity, or layer token)', code.match(UNITLESS_VISUAL) ?? []);
    report(`raw easing (use a ${PREFIX}easing-* token)`, code.match(RAW_EASING) ?? []);
  }
  report('raw colour function', code.match(COLOR_FUNCTION) ?? []);
  report('raw length/duration', code.match(LENGTH_OR_TIME) ?? []);
  if (ext === '.tsx' || ext === '.ts') {
    report('Tailwind arbitrary value', code.match(TAILWIND_ARBITRARY) ?? []);
    report('raw Tailwind palette utility', code.match(TAILWIND_PALETTE) ?? []);
    report(`raw Tailwind z-index utility (use a ${PREFIX}layer-* token)`, code.match(TAILWIND_Z) ?? []);
  }
  return failures;
}

// Glow is reserved for live state: a rule that paints the live glow must target a live selector.
const LIVE_GLOW = new RegExp(`var\\(${PREFIX}elevation-live\\)|(?<![\\w-])shadow-live(?![\\w-])`);
function liveGlowFailures(path, css) {
  const failures = [];
  for (const block of parseCssBlocks(css)) {
    if (block.parents.some((parent) => parent.startsWith('@keyframes'))) continue;
    const glows = [...block.decls.values()].some((value) => LIVE_GLOW.test(value));
    if (!glows) continue;
    for (const selector of block.selectors) {
      if (!/live/.test(selector)) failures.push(`${path}: "${selector}" paints the live glow (${PREFIX}elevation-live) but does not target live state; glow is for live state only`);
    }
  }
  return failures;
}

// A halo is a shadow layer with no offset and a blur: light emitted around a shape. Worlds may not paint one, through any
// value or helper, outside live state (the connection lamp, a live value); pending, selection, and decoration never glow.
const GLOW_PROPERTIES = new Set(['box-shadow', 'filter', 'text-shadow']);

function splitTopLevel(value, separator = ',') {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === separator && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function isHalo(layer) {
  if (/\binset\b/.test(layer) || /^none$/.test(layer)) return false;
  // Drop colours (functions, hex, keywords stay as words) so only the length list remains.
  const lengths = layer
    .replace(/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\([^()]*(?:\([^()]*\)[^()]*)*\)/g, ' ')
    .replace(/#[0-9a-fA-F]{3,8}\b/g, ' ')
    .match(/var\([^()]*(?:\([^()]*\)[^()]*)*\)|calc\([^()]*(?:\([^()]*\)[^()]*)*\)|-?\d*\.?\d+[a-z%]*/g);
  if (!lengths || lengths.length < 3) return false;
  const zero = (token) => /^-?0*\.?0+[a-z%]*$/.test(token);
  const [offsetX, offsetY, blur] = lengths;
  return zero(offsetX) && zero(offsetY) && !zero(blur);
}

function haloLayers(property, value) {
  if (property === 'filter') return [...value.matchAll(/drop-shadow\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g)].map((match) => match[1]).filter(isHalo);
  return splitTopLevel(value).filter(isHalo);
}

function worldHaloFailures(world, blocks, scope, paletteBlockPattern) {
  const failures = [];
  // Helper values (--<slug>-*) and documented overrides from the theme and palette blocks, so a glow hidden in a helper is
  // still found. Core elevation tokens other than live are plain shadows.
  const helpers = new Map();
  for (const block of blocks) {
    const selector = block.selectors.length === 1 ? block.selectors[0] : '';
    if (block.media || !(selector === scope || paletteBlockPattern.test(selector))) continue;
    for (const [property, value] of block.decls) if (property.startsWith(`--${world.slug}-`) || property.startsWith(`${PREFIX}elevation-`)) helpers.set(property, value);
  }
  const resolve = (value, depth = 0) =>
    depth > 5 ? value : value.replace(/var\((--[\w-]+)(?:\s*,\s*([^()]*))?\)/g, (match, name, fallback) => (helpers.has(name) ? resolve(helpers.get(name), depth + 1) : fallback ?? match));
  for (const [name, value] of helpers) {
    if (name.startsWith(`${PREFIX}elevation-`) && name !== `${PREFIX}elevation-live` && haloLayers('box-shadow', resolve(value)).length) {
      failures.push(`${name} is overridden as a glow; only elevation-live may glow`);
    }
  }
  for (const block of blocks) {
    if (block.parents.some((parent) => parent.startsWith('@keyframes'))) continue;
    for (const [property, value] of block.decls) {
      if (!GLOW_PROPERTIES.has(property) || LIVE_GLOW.test(value)) continue;
      const halos = haloLayers(property, resolve(value));
      if (!halos.length) continue;
      for (const selector of block.selectors) {
        if (!/live/.test(selector)) failures.push(`"${selector}" paints a glow (${property}: ${halos[0]}) outside live state; halos belong only to .hh-connection[data-state='live'] and .hh-live-value[data-live]`);
      }
    }
  }
  return failures;
}

// ---------- worlds ----------

const KEBAB = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
// Worlds may restyle type, shape, and depth. Motion, density, spacing, layout, and component sizes stay system-wide so
// reduced motion, density knobs, and target floors cannot be bypassed by a world.
const WORLD_OVERRIDE = /^(?:font-(?:sans|mono|condensed)|font-weight-[\w-]+|letter-spacing-[\w-]+|type-[\w-]+-(?:family|size|line-height|weight)|radius-[\w-]+|border-width-[\w-]+|elevation-[\w-]+)$/;
const WORLD_MOTION_PROPERTIES = new Set(['animation', 'animation-duration', 'animation-delay', 'transition', 'transition-duration', 'transition-delay']);
const RAW_TIME = /(?<![\w.-])\d*\.?\d+m?s\b/;
// Each world ships exactly four colour options: the recommended default (theme block), two alternatives, then original.
const WORLD_PALETTE_COUNT = 3;
const ORIGINAL_PALETTE = 'original';
// `color: var(--hh-destructive)` in a world skin (not background-, border-, or text-decoration-color).
const DESTRUCTIVE_TEXT = new RegExp(`(?<![\\w-])color\\s*:\\s*var\\(${PREFIX}destructive\\)`);
const DESTRUCTIVE_TEXT_PAIRS = { kind: 'text', minimum: 4.5, pairs: [['destructive', 'background'], ['destructive', 'surface-card'], ['destructive', 'surface-panel']] };

function worldFailures(world, roles) {
  const failures = [];
  const fail = (message) => failures.push(`${world.theme}: ${message}`);
  const { json, css, slug } = world;
  const scope = themeSelector(world.theme);

  if (!KEBAB.test(slug)) fail(`tokens/worlds/${slug}.json: the slug must be kebab-case`);
  for (const field of ['label', '$description', 'signature']) {
    if (typeof json[field] !== 'string' || !json[field].trim()) fail(`tokens/worlds/${slug}.json needs a non-empty "${field}"`);
  }
  if (!Number.isInteger(json.order)) fail(`tokens/worlds/${slug}.json needs an integer "order"`);
  if (!['light', 'dark'].includes(json.colorScheme)) fail(`tokens/worlds/${slug}.json colorScheme must be "light" or "dark"`);
  const overrideKeys = Object.keys(json.overrides ?? {});
  for (const key of overrideKeys) {
    if (!WORLD_OVERRIDE.test(key)) fail(`override ${PREFIX}${key} is not allowed in a world (only font, type, letter-spacing, radius, border-width, and elevation tokens)`);
  }
  for (const [key, token] of Object.entries(json.overrides ?? {})) {
    if (!token?.$type) fail(`overrides.${key} is missing $type`);
    if (!token?.$description) fail(`overrides.${key} is missing $description`);
    if (token?.$value === undefined) fail(`overrides.${key} is missing $value`);
  }

  // Colour options: "palette" names the default colours in the theme block; each entry in "palettes" is a full colour
  // set applied by html[data-theme="hermes-<slug>"][data-palette="<id>"].
  const palettes = json.palettes === undefined ? [] : json.palettes;
  const paletteIds = new Set();
  if (!Array.isArray(palettes)) fail(`tokens/worlds/${slug}.json "palettes" must be an array`);
  else {
    if (typeof json.palette?.label !== 'string' || !json.palette.label.trim()) fail(`tokens/worlds/${slug}.json needs "palette": { "label" } naming its recommended default colours`);
    if (palettes.length !== WORLD_PALETTE_COUNT) {
      fail(`tokens/worlds/${slug}.json needs exactly ${WORLD_PALETTE_COUNT + 1} colour options (recommended default + ${WORLD_PALETTE_COUNT} in "palettes"); found ${palettes.length + 1}`);
    }
    if (palettes.length && palettes[palettes.length - 1]?.id !== ORIGINAL_PALETTE) fail(`tokens/worlds/${slug}.json: the last colour option must be "${ORIGINAL_PALETTE}"`);
    for (const palette of palettes) {
      const at = `palette "${palette?.id}"`;
      if (!KEBAB.test(palette?.id ?? '')) fail(`${at} needs a kebab-case id`);
      else if (paletteIds.has(palette.id)) fail(`${at} is defined twice`);
      paletteIds.add(palette?.id);
      if (typeof palette?.label !== 'string' || !palette.label.trim()) fail(`${at} needs a label`);
      if (!['light', 'dark'].includes(palette?.colorScheme)) fail(`${at} colorScheme must be "light" or "dark"`);
    }
  }

  for (const [pattern, label] of [[/@import\b/, '@import'], [/@font-face\b/, '@font-face (load faces in app/fonts.ts)'], [/@layer\b/, '@layer']]) {
    if (pattern.test(css)) fail(`tokens/worlds/${slug}.css must not use ${label}`);
  }
  for (const [, name] of css.matchAll(/@keyframes\s+([\w-]+)/g)) {
    if (!name.startsWith(`${slug}-`)) fail(`@keyframes ${name} must be prefixed "${slug}-" so worlds never collide`);
  }
  for (const [, name] of css.matchAll(/@property\s+(--[\w-]+)/g)) {
    if (!name.startsWith(`--${slug}-`)) fail(`@property ${name} must be prefixed "--${slug}-"`);
  }

  const allowedTokens = new Set([...roles, ...overrideKeys].map((key) => `${PREFIX}${key}`));
  const roleTokens = new Set(roles.map((role) => `${PREFIX}${role}`));
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
      if (property.startsWith(PREFIX)) {
        if (!isThemeBlock) fail(`${property} may only be set in the ${scope} block, where tokens/worlds/${slug}.json documents it`);
        else if (!allowedTokens.has(property)) fail(`${property} is not a colour role or a documented override in tokens/worlds/${slug}.json`);
      }
      if (!WORLD_MOTION_PROPERTIES.has(property) && property !== 'animation-iteration-count') continue;
      if (/\binfinite\b/.test(value)) fail(`"${property}: ${value}" loops forever; animations must be bounded`);
      if (WORLD_MOTION_PROPERTIES.has(property) && RAW_TIME.test(value) && !(block.media ?? '').includes('prefers-reduced-motion: no-preference')) {
        fail(`"${property}: ${value}" uses a raw duration; use var(${PREFIX}motion-*) or wrap it in @media (prefers-reduced-motion: no-preference)`);
      }
    }
  }
  if (themeBlocks !== 1) fail(`tokens/worlds/${slug}.css needs exactly one ${scope} block (found ${themeBlocks})`);
  for (const id of paletteIds) if ((paletteBlocks.get(id) ?? 0) !== 1) fail(`palette "${id}" needs exactly one ${paletteSelector(world.theme, id)} block (found ${paletteBlocks.get(id) ?? 0})`);
  for (const failure of liveGlowFailures(`tokens/worlds/${slug}.css`, css)) fail(failure);
  for (const failure of worldHaloFailures(world, parseCssBlocks(css), scope, paletteBlockPattern)) fail(failure);
  return failures;
}

// Worlds are registered by slug in preview/themes.ts (WORLD_SLUGS). Every world on disk must be registered, and every
// registered slug must have both files, so the preview and the validator always see the same set.
function registryFailures(worlds, sources) {
  const failures = [];
  const registry = sources.get(WORLD_REGISTRY);
  if (registry === undefined) return failures;
  const match = /WORLD_SLUGS[^=]*=\s*\[([^\]]*)\]/.exec(registry);
  if (!match) return [`${WORLD_REGISTRY} must declare the WORLD_SLUGS array`];
  const registered = [...match[1].matchAll(/['"]([\w-]+)['"]/g)].map(([, slug]) => slug);
  const onDisk = new Set(worlds.map((world) => world.slug));
  for (const slug of onDisk) if (!registered.includes(slug)) failures.push(`${THEME_PREFIX}${slug}: tokens/worlds/${slug}.json exists but is not registered in ${WORLD_REGISTRY} WORLD_SLUGS`);
  for (const slug of registered) if (!onDisk.has(slug)) failures.push(`${WORLD_REGISTRY} registers "${slug}" but tokens/worlds/${slug}.json does not exist`);
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
  failures.push(...registryFailures(worlds, sources));
  const coreThemes = coreTokens.meta?.themes ?? [];
  for (const world of loadedWorlds) if (coreThemes.includes(world.theme)) fail(`${world.theme}: a world cannot reuse a core theme name`);
  const tokens = {
    ...coreTokens,
    meta: { ...coreTokens.meta, themes: [...coreThemes, ...loadedWorlds.map((world) => world.theme)] },
    themes: { ...coreTokens.themes, ...Object.fromEntries(loadedWorlds.map((world) => [world.theme, world.json])) },
  };
  const themesCss = [coreCss, ...loadedWorlds.map((world) => world.css)].join('\n');

  // Typed and described tokens.
  for (const [group, entries] of typedTokenGroups(coreTokens)) {
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
  failures.push(...briefPairFailures(coreTokens));

  for (const world of loadedWorlds) failures.push(...worldFailures(world, roles));
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

  // The default theme also paints :root, so a page without data-theme still gets a full colour set.
  const defaultTheme = coreThemes[0];
  if (defaultTheme && !findBlock(blocks, (block) => !block.media && block.selectors.includes(':root') && block.selectors.includes(themeSelector(defaultTheme)))) {
    fail(`themes.css: the default theme ${defaultTheme} must share its block with :root`);
  }

  const themes = tokens.meta?.themes ?? [];
  const pairGroups = contrastPairs(tokens);
  // A world whose skin prints text in the destructive role must keep that text legible on the surfaces forms sit on.
  const colourPairsFor = (world) => (world && DESTRUCTIVE_TEXT.test(world.css) ? [...pairGroups, DESTRUCTIVE_TEXT_PAIRS] : pairGroups);
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
    const sourceNames = world ? { json: `tokens/worlds/${world.slug}.json`, css: `tokens/worlds/${world.slug}.css` } : { json: 'tokens.json', css: 'themes.css' };
    failures.push(...colourFailures(theme, definition, block, roles, colourPairsFor(world), sourceNames));

    for (const [key, token] of Object.entries(definition.overrides ?? {})) {
      const cssVar = `${PREFIX}${key}`;
      if (!baseDecls.has(cssVar)) fail(`${theme}: override ${cssVar} does not exist in :root`);
      const actual = block.decls.get(cssVar);
      if (actual === undefined) fail(`${theme}: ${sourceNames.css} block is missing override ${cssVar}`);
      else if (cssValue(actual) !== cssValue(token.$value)) fail(`${theme}: ${sourceNames.css} ${cssVar} is ${actual} but ${sourceNames.json} has ${token.$value}`);
    }
  }

  // Each world colour option is a complete colour set: same parity and contrast gates as the theme it recolours.
  for (const world of loadedWorlds) {
    for (const palette of Array.isArray(world.json.palettes) ? world.json.palettes : []) {
      const selector = paletteSelector(world.theme, palette.id);
      const block = findBlock(blocks, (candidate) => !candidate.media && candidate.selectors.length === 1 && candidate.selectors[0] === selector);
      if (!block) {
        fail(`${world.theme} palette "${palette.id}": tokens/worlds/${world.slug}.css has no ${selector} block`);
        continue;
      }
      const sourceNames = { json: `tokens/worlds/${world.slug}.json palettes`, css: `tokens/worlds/${world.slug}.css` };
      failures.push(...colourFailures(`${world.theme} palette "${palette.id}"`, palette, block, roles, colourPairsFor(world), sourceNames));
    }
  }

  // Density modes: CSS parity, then the brief's direction rules.
  const modeBlocks = {};
  for (const [mode, definition] of Object.entries(tokens.densityModes ?? {})) {
    const selectors = splitSelectorList(String(definition.selector ?? ''));
    const block = findBlock(blocks, (candidate) => !candidate.media && sameSelectors(candidate, selectors));
    if (!block) {
      fail(`themes.css is missing density mode ${mode} (${definition.selector})`);
      continue;
    }
    modeBlocks[mode] = block;
    for (const [key, token] of Object.entries(definition.overrides ?? {})) {
      const cssVar = `${PREFIX}${key}`;
      if (!baseDecls.has(cssVar)) fail(`density ${mode}: override ${cssVar} does not exist in :root`);
      const actual = block.decls.get(cssVar);
      if (actual === undefined) fail(`density ${mode}: themes.css is missing ${cssVar}`);
      else if (cssValue(actual) !== cssValue(token.$value)) fail(`density ${mode}: themes.css ${cssVar} is ${actual} but tokens.json has ${token.$value}`);
    }
  }
  const knobCheck = (mode, knobs, direction) => {
    const overrides = tokens.densityModes?.[mode]?.overrides;
    if (!overrides) {
      fail(`tokens.json densityModes.${mode} is required`);
      return;
    }
    for (const knob of knobs) {
      const value = overrides[knob]?.$value;
      if (value === undefined) {
        fail(`density ${mode}: tokens.json must override ${PREFIX}${knob}`);
        continue;
      }
      const base = baseDecls.get(`${PREFIX}${knob}`);
      if (base === undefined) continue;
      const ok = direction === 'lower' ? toPx(value) < toPx(base) : toPx(value) > toPx(base);
      if (!ok) fail(`density ${mode}: ${PREFIX}${knob} (${value}) must be ${direction === 'lower' ? 'smaller' : 'larger'} than the base (${base})`);
    }
  };
  knobCheck('compact', COMPACT_LOWERS, 'lower');
  knobCheck('glance', GLANCE_RAISES, 'raise');
  const glanceTarget = modeBlocks.glance?.decls.get(`${PREFIX}button-min-target`);
  if (glanceTarget !== undefined && !(toPx(glanceTarget) >= GLANCE_TARGET_FLOOR_PX)) {
    fail(`density glance: ${PREFIX}button-min-target ${glanceTarget} is below the ${GLANCE_TARGET_FLOOR_PX}px (3rem) touch floor`);
  }

  // Target-size floor in every scope that sets it.
  const targets = [[':root', baseDecls.get(`${PREFIX}button-min-target`)]];
  for (const block of blocks) if (block !== baseBlock && block.decls.has(`${PREFIX}button-min-target`)) targets.push([block.selectors.join(', '), block.decls.get(`${PREFIX}button-min-target`)]);
  for (const [scope, value] of targets) {
    if (value !== undefined && !(toPx(value) >= TARGET_FLOOR_PX)) fail(`${scope}: ${PREFIX}button-min-target ${value} is below the ${TARGET_FLOOR_PX}px target floor`);
  }

  // Control sizes scale the target, so the smallest target in any scope sets their floor.
  const smallestTarget = Math.min(...targets.map(([, value]) => toPx(value)).filter((px) => !Number.isNaN(px)));
  const scaled = new RegExp(`^calc\\(var\\(${PREFIX}button-min-target\\)\\s*\\*\\s*(\\d*\\.?\\d+)\\)$`);
  for (const [key, token] of Object.entries(tokens.component ?? {})) {
    if (!key.startsWith('control-size-')) continue;
    const factor = scaled.exec(String(token.$value).trim())?.[1];
    const px = factor !== undefined ? Number(factor) * smallestTarget : toPx(token.$value);
    if (Number.isNaN(px)) fail(`component.${key} must be a length or calc(var(${PREFIX}button-min-target) * <factor>)`);
    else if (px < TARGET_FLOOR_PX) fail(`component.${key} is ${Math.round(px * 10) / 10}px at the smallest target (${smallestTarget}px); it must stay at or above the ${TARGET_FLOOR_PX}px target floor`);
  }

  // Reduced motion collapses every motion duration.
  const reducedMotion = findBlock(blocks, (block) => block.media?.includes('prefers-reduced-motion: reduce') && block.selectors.includes(':root'));
  for (const key of Object.keys(tokens.primitive?.motion ?? {})) {
    const value = reducedMotion?.decls.get(`${PREFIX}motion-${key}`);
    if (value === undefined) fail(`Reduced-motion block does not collapse ${PREFIX}motion-${key}`);
    else {
      const time = /^(\d*\.?\d+)(ms|s)$/.exec(value.trim());
      const ms = value.trim() === '0' ? 0 : time ? Number(time[1]) * (time[2] === 's' ? 1000 : 1) : Number.NaN;
      if (!(ms <= 1)) fail(`Reduced-motion ${PREFIX}motion-${key} is ${value}; it must collapse to 1ms or less`);
    }
  }

  // Component, density, layer, and elevation tokens must be consumed by the preview, not re-hard-coded.
  const consumerText = [...sources].filter(([path]) => !path.startsWith('tokens/') && !path.endsWith('.md')).map(([, text]) => text).join('\n');
  const consumed = [
    ...Object.keys(tokens.component ?? {}).map((key) => `${PREFIX}${key}`),
    ...Object.keys(tokens.density ?? {}).map((key) => `${PREFIX}density-${key}`),
    ...Object.keys(tokens.layer ?? {}).map((key) => `${PREFIX}layer-${key}`),
  ];
  for (const cssVar of consumed) {
    if (!new RegExp(`${cssVar}(?![\\w-])`).test(consumerText)) fail(`${cssVar} is exported but not consumed by the preview`);
  }
  for (const key of Object.keys(tokens.elevation ?? {})) {
    if (!new RegExp(`(${PREFIX}elevation-${key}|shadow-${key})(?![\\w-])`).test(consumerText)) fail(`${PREFIX}elevation-${key} is exported but not consumed by the preview`);
  }

  // Raw visual values: allowed only in tokens/. Live glow: only on live selectors.
  const breakpoints = new Set(Object.values(tokens.breakpoint ?? {}).map((token) => token.$value));
  for (const [path, text] of sources) {
    if (path.startsWith('tokens/')) continue;
    failures.push(...rawValueFailures(path, text, breakpoints));
    if (extname(path) === '.css') failures.push(...liveGlowFailures(path, text));
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
    console.error('Hermes design-system validation failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  const pairCount = contrastPairs(pkg.tokens).reduce((sum, group) => sum + group.pairs.length, 0);
  const paletteCount = pkg.worlds.reduce((sum, world) => sum + (Array.isArray(world.json?.palettes) ? world.json.palettes.length : 0), 0);
  console.log('Hermes design-system validation passed.');
  console.log(
    `Checked ${REQUIRED_ARTIFACTS.length} artifacts, ${pkg.tokens.meta.themes.length} core themes + ${pkg.worlds.length} worlds with ${paletteCount} extra colour options, ` +
      `${Object.keys(pkg.tokens.semantic.color).length} semantic roles, ${pairCount} contrast pairs per colour set, and ${pkg.sources.size} source files for raw values.`,
  );
}
