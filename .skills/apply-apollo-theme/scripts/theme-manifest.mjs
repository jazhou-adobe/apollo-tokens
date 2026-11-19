#!/usr/bin/env node
// Resolve an Apollo brand theme to everything a consuming app needs: <html> attributes, files to copy, and next/font calls.
// Usage: node .skills/apply-apollo-theme/scripts/theme-manifest.mjs <brand> [theme] [palette-id]
// <brand>: a slug or label from preview-hub/brands.json (splitbook, "Hermes Hub").
// [theme]: a core theme (light), a world slug (approach-lights) or label (Approach Lights), or the full data-theme value
// (splitbook-light). Omitted: the brand's defaultTheme in brands.json.
// Everything is read from the brand's design/ folder, so new themes, worlds, colour options and fonts need no edit here.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const brands = JSON.parse(readFileSync(join(REPO, 'preview-hub/brands.json'), 'utf8'));
const [, , rawBrand, rawTheme, rawPalette] = process.argv;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const slugify = (text) => text.trim().toLowerCase().replace(/\s+/g, '-');
if (!rawBrand) fail(`Usage: theme-manifest.mjs <brand> [theme] [palette-id]. Brands: ${brands.map((b) => b.slug).join(', ')}.`);

const brand = brands.find((b) => b.slug === slugify(rawBrand) || slugify(b.label) === slugify(rawBrand));
if (!brand) fail(`Unknown brand "${rawBrand}". Brands: ${brands.map((b) => `${b.slug} (${b.label})`).join(', ')}.`);
const DESIGN = resolve(REPO, brand.dir);
if (!existsSync(DESIGN)) fail(`Design system for ${brand.label} not found at ${DESIGN}`);
const read = (path) => readFileSync(join(DESIGN, path), 'utf8');

// Core themes: every html[data-theme="<brand>-<name>"] block in themes.css, with the color-scheme it declares.
const themesCss = read('tokens/themes.css');
const core = [...themesCss.matchAll(/data-theme="([\w-]+)"\]\s*\{[^}]*?color-scheme:\s*(\w+)/g)].map((m) => ({ value: m[1], colorScheme: m[2] }));
const worlds = readdirSync(join(DESIGN, 'tokens/worlds'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => {
    const slug = file.slice(0, -5);
    const json = JSON.parse(read(`tokens/worlds/${file}`));
    return { slug, value: `${brand.slug}-${slug}`, json, label: json.label };
  });

const key = slugify(rawTheme ?? brand.defaultTheme);
const full = key.startsWith(`${brand.slug}-`) ? key : `${brand.slug}-${key}`;
const coreTheme = core.find((t) => t.value === full);
const world = worlds.find((w) => w.value === full || slugify(w.label) === key);
if (!coreTheme && !world) {
  fail(`Unknown ${brand.label} theme "${rawTheme}". Core: ${core.map((t) => t.value).join(', ')}. Worlds: ${worlds.map((w) => `${w.value} (${w.label})`).join(', ')}.`);
}

const palettes = world ? (world.json.palettes ?? []).map((p) => p.id) : [];
const palette = rawPalette ? rawPalette.trim().toLowerCase() : '';
if (palette && !palettes.includes(palette)) {
  fail(world ? `Unknown colour option "${rawPalette}" for ${world.label}. Options: ${palettes.join(', ')} (omit for the default, ${world.json.palette?.label}).` : 'Core themes have no colour options.');
}

// One next/font call per `const name = Loader({ ... });`, possibly spanning lines.
const fontsSource = read('app/fonts.ts');
const fontCalls = [...fontsSource.matchAll(/^const (\w+) = (\w+)\(\{[\s\S]*?\}\);$/gm)].map((m) => ({
  name: m[1],
  code: m[0],
  loader: m[2],
  variable: m[0].match(/variable: '(--font-[\w-]+)'/)?.[1],
  src: m[0].match(/src: '\.\/(fonts\/[^']+)'/)?.[1],
}));
const coreNames = fontsSource.match(/coreFontVariables = \[([^\]]+)\]/)?.[1].split(',').map((name) => name.trim()) ?? [];
const coreFonts = coreNames.map((name) => fontCalls.find((c) => c.name === name) ?? fail(`app/fonts.ts lists ${name} in coreFontVariables but has no call for it`));
const worldCss = world ? read(`tokens/worlds/${world.slug}.css`) : '';
const worldVariables = [...new Set([...worldCss.matchAll(/var\((--font-[\w-]+)\)/g)].map((m) => m[1]))].filter((v) => !coreFonts.some((f) => f.variable === v));
const fonts = [
  ...coreFonts,
  ...worldVariables.map((variable) => fontCalls.find((c) => c.variable === variable) ?? fail(`No next/font call in app/fonts.ts declares ${variable}`)),
];

// Density modes from preview/theme-constants.ts (DENSITIES entries keyed by `value` or `id`); '' is the default.
const densities = [...read('preview/theme-constants.ts').matchAll(/\{\s*(?:value|id): '([\w-]*)',\s*label: '([^']+)'/g)]
  .filter((m) => m[1])
  .map((m) => ({ value: m[1], label: m[2] }));

const componentsCss = readdirSync(join(DESIGN, 'preview')).find((file) => file.endsWith('-components.css'));
const files = [
  'tokens/themes.css',
  'tokens/tailwind-theme.css',
  'tokens/tokens.json',
  `preview/${componentsCss}`,
  'agent-contract/screen-generation-rules.md',
  'foundations/',
  'components/',
  'patterns/',
  ...fonts.filter((f) => f.src).map((f) => `app/${f.src}`),
  ...(world ? [`tokens/worlds/${world.slug}.css`, `tokens/worlds/${world.slug}.json`] : []),
];

const value = world ? world.value : coreTheme.value;
const colorScheme = world ? (world.json.palettes ?? []).find((p) => p.id === palette)?.colorScheme ?? world.json.colorScheme : coreTheme.colorScheme;
const googleLoaders = [...new Set(fonts.map((f) => f.loader).filter((l) => l !== 'localFont'))];

console.log(
  JSON.stringify(
    {
      brand: brand.slug,
      brandLabel: brand.label,
      tokenPrefix: brand.tokenPrefix,
      theme: value,
      label: world ? world.label : value,
      kind: world ? 'world' : 'core theme',
      isDefault: value === brand.defaultTheme,
      palette: palette || null,
      paletteLabel: world ? (palette ? world.json.palettes.find((p) => p.id === palette).label : world.json.palette?.label) : null,
      paletteOptions: palettes,
      colorScheme,
      htmlAttributes: { 'data-theme': value, ...(palette ? { 'data-palette': palette } : {}) },
      densities,
      sourceRoot: relative(process.cwd(), DESIGN) || '.',
      componentsCss: `preview/${componentsCss}`,
      copy: files,
      fonts: {
        imports: [
          ...(googleLoaders.length ? [`import { ${googleLoaders.join(', ')} } from 'next/font/google';`] : []),
          ...(fonts.some((f) => f.loader === 'localFont') ? ["import localFont from 'next/font/local';"] : []),
        ],
        calls: fonts.map((f) => f.code),
        names: fonts.map((f) => f.name),
        variables: fonts.map((f) => f.variable),
      },
    },
    null,
    2,
  ),
);
