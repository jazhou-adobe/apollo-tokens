import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { loadPackage, validateDesignSystem } from './validate-design-system.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

function freshPackage() {
  const pkg = loadPackage(root);
  return {
    ...pkg,
    tokens: structuredClone(pkg.tokens),
    sources: new Map(pkg.sources),
    codeFiles: new Map(pkg.codeFiles),
    artifacts: new Set(pkg.artifacts),
    worlds: pkg.worlds.map((world) => ({ ...world, json: structuredClone(world.json) })),
  };
}

const DEFAULT_PALETTES = [{ id: 'alt-a' }, { id: 'alt-b' }, { id: 'original' }];

// A fixture world built from the core Light palette, so world tests never depend on a shipped world's design. It is
// registered in preview/themes.ts WORLD_FILES and app/globals.css unless `register` is false.
// Each palette starts from the same colours; `color` replaces roles and `extra` adds raw declarations to its block.
function withFixtureWorld(pkg, { color = {}, overrides = {}, css = '', palettes = DEFAULT_PALETTES, register = true } = {}) {
  const theme = 'splitbook-fixture';
  const light = pkg.tokens.themes['splitbook-light'].color;
  const colourSet = (changes) => {
    const set = structuredClone(light);
    for (const [role, value] of Object.entries(changes)) set[role] = { $type: 'color', $value: value };
    return set;
  };
  const roleLines = (set) => Object.entries(set).map(([role, token]) => `  --sb-${role}: ${token.$value};`);
  const roles = colourSet(color);
  const declarations = [...roleLines(roles), ...Object.entries(overrides).map(([key, token]) => `  --sb-${key}: ${token.$value};`)];
  const paletteJson = palettes.map(({ id, color: changes = {} }) => ({ id, label: id, colorScheme: 'light', color: colourSet(changes) }));
  const paletteCss = palettes.map(
    ({ id, extra = [] }, index) => `html[data-theme="${theme}"][data-palette="${id}"] {\n  color-scheme: light;\n${[...roleLines(paletteJson[index].color), ...extra].join('\n')}\n}\n`,
  );
  pkg.worlds.push({
    slug: 'fixture',
    theme,
    json: { label: 'Fixture', order: 999, $description: 'Test world.', signature: 'None.', colorScheme: 'light', color: roles, overrides, palette: { label: 'Default' }, palettes: paletteJson },
    css: `html[data-theme="${theme}"] {\n  color-scheme: light;\n${declarations.join('\n')}\n}\n${paletteCss.join('')}${css}`,
  });
  if (register) {
    pkg.sources.set('preview/themes.ts', pkg.sources.get('preview/themes.ts').replace(/WORLD_FILES([^=]*)=\s*\[/, "WORLD_FILES$1= [\n  ['fixture', fixture],"));
    pkg.sources.set('app/globals.css', `${pkg.sources.get('app/globals.css')}@import '../tokens/worlds/fixture.css';\n`);
  }
  return pkg;
}

function themeBlockEdit(css, theme, edit) {
  const selector = `html[data-theme="${theme}"] {`;
  const start = css.indexOf(selector);
  assert.notEqual(start, -1, `fixture needs a standalone ${theme} block`);
  const end = css.indexOf('}', start);
  return css.slice(0, start) + edit(css.slice(start, end)) + css.slice(end);
}

function setThemeColour(pkg, theme, role, value) {
  pkg.tokens.themes[theme].color[role].$value = value;
  pkg.themesCss = themeBlockEdit(pkg.themesCss, theme, (block) => block.replace(new RegExp(`--sb-${role}: [^;]+;`), `--sb-${role}: ${value};`));
}

function failuresMatching(pkg, pattern) {
  return validateDesignSystem(pkg).filter((failure) => pattern.test(failure));
}

const all = (pkg) => validateDesignSystem(pkg).join('\n');

test('the shipped design-system package passes validation', () => {
  assert.deepEqual(validateDesignSystem(freshPackage()), []);
});

test('the shipped package passes with a well-formed fixture world, so worlds can be dropped in later', () => {
  const pkg = withFixtureWorld(freshPackage());
  assert.deepEqual(validateDesignSystem(pkg), []);
});

test('a world file dropped into tokens/worlds/ is loaded as splitbook-<slug>', () => {
  const dir = mkdtempSync(join(tmpdir(), 'splitbook-worlds-'));
  try {
    mkdirSync(join(dir, 'tokens', 'worlds'), { recursive: true });
    writeFileSync(join(dir, 'tokens', 'tokens.json'), readFileSync(join(root, 'tokens', 'tokens.json')));
    writeFileSync(join(dir, 'tokens', 'themes.css'), readFileSync(join(root, 'tokens', 'themes.css')));
    writeFileSync(join(dir, 'tokens', 'worlds', 'flight-deck.json'), '{"label":"Flight Deck"}');
    writeFileSync(join(dir, 'tokens', 'worlds', 'flight-deck.css'), '');
    writeFileSync(join(dir, 'tokens', 'worlds', 'orphan.css'), '');
    const pkg = loadPackage(dir);
    assert.deepEqual(pkg.worlds.map((world) => world.theme), ['splitbook-flight-deck']);
    assert.ok(pkg.loadErrors.some((error) => /orphan\.css has no matching \.json/.test(error)), pkg.loadErrors.join('\n'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a missing required artifact fails', () => {
  const pkg = freshPackage();
  pkg.artifacts.delete('components/capture-widgets.md');
  assert.equal(failuresMatching(pkg, /Missing required artifact: components\/capture-widgets\.md/).length, 1, all(pkg));
});

test('a text pair below 4.5:1 fails in the theme that ships it', () => {
  const pkg = freshPackage();
  setThemeColour(pkg, 'splitbook-light', 'metric', '#6a9be0');
  const failures = failuresMatching(pkg, /splitbook-light: text metric-foreground on metric/);
  assert.equal(failures.length, 1, all(pkg));
  assert.match(failures[0], /needs 4\.5:1/);
});

test('Deck text pairs must reach the 7:1 glare grade, not just 4.5:1', () => {
  const pkg = freshPackage();
  // Mid grey on Deck's chalk background: about 6:1, enough for Light's 4.5:1 gate but not for the 7:1 glare grade.
  setThemeColour(pkg, 'splitbook-deck', 'muted-foreground', '#5c6368');
  const failures = failuresMatching(pkg, /splitbook-deck: text muted-foreground on background/);
  assert.equal(failures.length, 1, all(pkg));
  assert.match(failures[0], /needs 7:1/);
});

test('a border below 3:1 against a surface fails', () => {
  const pkg = freshPackage();
  setThemeColour(pkg, 'splitbook-light', 'border', '#c9cdd0');
  assert.ok(failuresMatching(pkg, /splitbook-light: non-text border against surface-card.*3:1/).length > 0, all(pkg));
});

test('a focus ring below 3:1 against the Tap Pad fails', () => {
  const pkg = freshPackage();
  setThemeColour(pkg, 'splitbook-deck', 'ring', '#c9cdd0');
  assert.ok(failuresMatching(pkg, /splitbook-deck: non-text ring against tap-pad/).length > 0, all(pkg));
});

test('a hand colour that cannot hold 3:1 as a boundary on the Tap Pad fails', () => {
  const pkg = freshPackage();
  // Safety yellow as a fill on a white Tap Pad: why Deck puts yellow figures on a black live plate instead.
  setThemeColour(pkg, 'splitbook-light', 'live', '#ffd21a');
  setThemeColour(pkg, 'splitbook-light', 'live-foreground', '#0a0c0d');
  assert.ok(failuresMatching(pkg, /splitbook-light: non-text live against tap-pad/).length > 0, all(pkg));
  assert.ok(failuresMatching(pkg, /splitbook-light: non-text live against surface-card/).length > 0, all(pkg));
});

test('a chart series below 3:1 against the card fails', () => {
  const pkg = freshPackage();
  setThemeColour(pkg, 'splitbook-light', 'chart-3', '#e8e2d8');
  assert.ok(failuresMatching(pkg, /splitbook-light: non-text chart-3 against surface-card/).length > 0, all(pkg));
});

test('a role missing from one theme block fails even when another block defines it', () => {
  const pkg = freshPackage();
  pkg.themesCss = themeBlockEdit(pkg.themesCss, 'splitbook-deck', (block) => block.replace(/\n\s*--sb-fault: [^;]+;/, ''));
  assert.ok(failuresMatching(pkg, /splitbook-deck: themes\.css block is missing --sb-fault$/).length > 0, all(pkg));
});

test('theme CSS that drifts from tokens.json fails', () => {
  const pkg = freshPackage();
  pkg.tokens.themes['splitbook-deck'].color.muted.$value = '#000000';
  assert.ok(failuresMatching(pkg, /splitbook-deck: themes\.css --sb-muted .* tokens\.json/).length > 0, all(pkg));
});

test('base tokens that drift from tokens.json fail', () => {
  const pkg = freshPackage();
  pkg.tokens.component['tap-key-size'].$value = '5rem';
  assert.ok(failuresMatching(pkg, /:root --sb-tap-key-size .* tokens\.json component\.tap-key-size/).length > 0, all(pkg));
});

test('Deck must override every knob in the brief, not only colours', () => {
  const pkg = freshPackage();
  delete pkg.tokens.themes['splitbook-deck'].overrides['length-cell-size'];
  assert.ok(failuresMatching(pkg, /splitbook-deck: tokens\.json must override Deck knob --sb-length-cell-size/).length > 0, all(pkg));
});

test('a Deck knob that is not larger than the base fails', () => {
  const pkg = freshPackage();
  pkg.tokens.themes['splitbook-deck'].overrides['type-numeral-xl-size'].$value = '4.5rem';
  pkg.themesCss = themeBlockEdit(pkg.themesCss, 'splitbook-deck', (block) => block.replace(/--sb-type-numeral-xl-size: [^;]+;/, '--sb-type-numeral-xl-size: 4.5rem;'));
  assert.ok(failuresMatching(pkg, /splitbook-deck: --sb-type-numeral-xl-size \(4\.5rem\) must be larger than the base/).length > 0, all(pkg));
});

test('Deck targets below 56 CSS px fail even when larger than Light', () => {
  const pkg = freshPackage();
  pkg.tokens.themes['splitbook-deck'].overrides['button-min-target'].$value = '3.25rem';
  pkg.themesCss = themeBlockEdit(pkg.themesCss, 'splitbook-deck', (block) => block.replace(/--sb-button-min-target: [^;]+;/, '--sb-button-min-target: 3.25rem;'));
  assert.ok(failuresMatching(pkg, /splitbook-deck: --sb-button-min-target \(3\.25rem\) is below the Deck floor of 56/).length > 0, all(pkg));
});

test('the deck density mode must carry every Deck knob, match splitbook-deck, and meet the Deck floors', () => {
  const missing = freshPackage();
  delete missing.tokens.densityModes.deck.overrides['tap-key-size'];
  assert.ok(failuresMatching(missing, /density deck: tokens\.json must override Deck knob --sb-tap-key-size/).length > 0, all(missing));

  const drifted = freshPackage();
  drifted.tokens.densityModes.deck.overrides['rating-step-size'].$value = '3.5rem';
  drifted.themesCss = drifted.themesCss.replace(/(\[data-density="deck"\] \{[^}]*--sb-rating-step-size: )[^;]+;/, '$13.5rem;');
  assert.ok(failuresMatching(drifted, /density deck: --sb-rating-step-size \(3\.5rem\) must match splitbook-deck/).length > 0, all(drifted));

  const small = freshPackage();
  small.tokens.densityModes.deck.overrides['tap-key-size'].$value = '4.75rem';
  small.themesCss = small.themesCss.replace(/(\[data-density="deck"\] \{[^}]*--sb-tap-key-size: )[^;]+;/, '$14.75rem;');
  assert.ok(failuresMatching(small, /density deck: --sb-tap-key-size \(4\.75rem\) is below the Deck floor of 80/).length > 0, all(small));

  const absent = freshPackage();
  delete absent.tokens.densityModes.deck;
  assert.ok(failuresMatching(absent, /densityModes must include "deck"/).length > 0, all(absent));
});

test('compact density that drops a target below 24 CSS px fails', () => {
  const pkg = freshPackage();
  pkg.tokens.densityModes.compact.overrides['button-min-target'].$value = '1.25rem';
  pkg.themesCss = pkg.themesCss.replace(/(\[data-density="compact"\] \{[^}]*--sb-button-min-target: )[^;]+;/, '$11.25rem;');
  assert.ok(failuresMatching(pkg, /\[data-density="compact"\]: --sb-button-min-target 1\.25rem is below the 24px target floor/).length > 0, all(pkg));
  assert.ok(failuresMatching(pkg, /component\.control-size-sm is 15px at the smallest target/).length > 0, all(pkg));
});

test('reduced motion must collapse every duration', () => {
  const pkg = freshPackage();
  pkg.themesCss = pkg.themesCss.replace(/\n\s*--sb-motion-flash: 1ms;/, '');
  assert.ok(failuresMatching(pkg, /Reduced-motion block does not collapse --sb-motion-flash/).length > 0, all(pkg));
});

test('tokens must be typed and described', () => {
  const pkg = freshPackage();
  delete pkg.tokens.semantic.color.fault.$description;
  delete pkg.tokens.component['dial-size'].$type;
  assert.ok(failuresMatching(pkg, /semantic\.color\.fault is missing \$description/).length > 0, all(pkg));
  assert.ok(failuresMatching(pkg, /component\.dial-size is missing \$type/).length > 0, all(pkg));
});

test('a component token that the preview never consumes fails', () => {
  const pkg = freshPackage();
  for (const [path, text] of pkg.sources) pkg.sources.set(path, text.replaceAll('--sb-rating-step-size', '--sb-unused'));
  assert.ok(failuresMatching(pkg, /--sb-rating-step-size is exported but not consumed/).length > 0, all(pkg));
});

test('raw visual values fail in preview code but are allowed in the token layer', () => {
  const pkg = freshPackage();
  const raw = '.x { box-shadow: 0 10px 30px rgba(0, 0, 0, .1); padding: 1.25rem; color: #c4241a; font-weight: 700; transition: opacity 200ms ease-out; }\n';
  pkg.sources.set('preview/raw.css', raw);
  pkg.sources.set('tokens/raw.css', raw);
  const failures = validateDesignSystem(pkg);
  for (const label of ['raw shadow', 'raw colour value', 'raw length/duration', 'unitless visual value', 'raw easing']) {
    assert.ok(failures.some((failure) => failure.startsWith('preview/raw.css') && failure.includes(label)), `${label}\n${failures.join('\n')}`);
  }
  assert.ok(!failures.some((failure) => failure.includes('tokens/raw.css')), failures.join('\n'));
});

test('hex colours in docs outside tokens/ fail', () => {
  const pkg = freshPackage();
  pkg.sources.set('components/capture-widgets.md', 'The live frame is #c4241a.\n');
  assert.ok(failuresMatching(pkg, /components\/capture-widgets\.md: raw colour value/).length > 0, all(pkg));
});

test('Tailwind arbitrary values, palette utilities, and z utilities fail in preview TSX', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/raw.tsx', 'export const X = () => <div className="p-[13px] bg-red-500 z-50" />;\n');
  const failures = failuresMatching(pkg, /preview\/raw\.tsx/);
  for (const label of [/arbitrary/, /palette/, /z-index/]) assert.ok(failures.some((failure) => label.test(failure)), failures.join('\n'));
});

test('media queries outside the token layer must use breakpoint tokens', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/raw.css', '@media (min-width: 700px) { .x { display: block; } }\n');
  assert.ok(failuresMatching(pkg, /preview\/raw\.css: media query uses 700px/).length > 0, all(pkg));
});

test('gradient text and decorative glass are banned in every stylesheet', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/raw.css', '.x { background-clip: text; } .y { backdrop-filter: blur(var(--sb-space-2)); }\n');
  assert.ok(failuresMatching(pkg, /preview\/raw\.css: gradient text/).length > 0, all(pkg));
  assert.ok(failuresMatching(pkg, /preview\/raw\.css: decorative glass/).length > 0, all(pkg));
});

test('preview copy never names the reference product or calls a Fault a DQ', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/copy.tsx', 'export const X = () => <p>Built on MathGo. Flagged as a DQ.</p>;\n');
  assert.ok(failuresMatching(pkg, /preview\/copy\.tsx: names MathGo/).length > 0, all(pkg));
  assert.ok(failuresMatching(pkg, /preview\/copy\.tsx: says "DQ"/).length > 0, all(pkg));
});

test('every /design section the brief asks for must be rendered', () => {
  const pkg = freshPackage();
  for (const [path, text] of pkg.sources) pkg.sources.set(path, text.replaceAll('Deck knob', 'Size knob'));
  assert.ok(failuresMatching(pkg, /\/design preview is missing section: Deck knob/).length > 0, all(pkg));
});

test('a seeded world faces the same contrast gates as the core themes', () => {
  const pkg = withFixtureWorld(freshPackage(), { color: { accent: '#3b3f42', 'accent-foreground': '#4a4f52' } });
  assert.equal(failuresMatching(pkg, /splitbook-fixture: text accent-foreground on accent/).length, 1, all(pkg));
});

test('every world colour option faces the same contrast gates', () => {
  const pkg = withFixtureWorld(freshPackage(), { palettes: [{ id: 'alt-a', color: { border: '#e0e0e0' } }, { id: 'alt-b' }, { id: 'original' }] });
  assert.ok(failuresMatching(pkg, /splitbook-fixture palette "alt-a": non-text border against/).length > 0, all(pkg));
});

test('a world needs exactly four colour options, ending with original', () => {
  const short = withFixtureWorld(freshPackage(), { palettes: [{ id: 'alt-a' }, { id: 'original' }] });
  assert.ok(failuresMatching(short, /splitbook-fixture: .*needs exactly 4 colour options.*found 2/).length > 0, all(short));
  const misordered = withFixtureWorld(freshPackage(), { palettes: [{ id: 'original' }, { id: 'alt-a' }, { id: 'alt-b' }] });
  assert.ok(failuresMatching(misordered, /splitbook-fixture: .*must list "original" as its last colour option/).length > 0, all(misordered));
});

test('a palette block may only recolour, never restyle', () => {
  const pkg = withFixtureWorld(freshPackage(), { palettes: [{ id: 'alt-a', extra: ['  --sb-radius-md: 0;'] }, { id: 'alt-b' }, { id: 'original' }] });
  assert.ok(failuresMatching(pkg, /palette block "alt-a" may only set color-scheme, colour roles/).length > 0, all(pkg));
});

test('a world rule that escapes its theme scope fails, so one world cannot restyle another', () => {
  const scope = 'html[data-theme="splitbook-fixture"]';
  const css = `.sb-card { border-radius: 0; }\n${scope} :is(.sb-panel, .sb-shelf) { border-radius: 0; }\n`;
  const failures = failuresMatching(withFixtureWorld(freshPackage(), { css }), /splitbook-fixture: selector/);
  assert.equal(failures.length, 1, failures.join('\n'));
  assert.match(failures[0], /selector "\.sb-card" must start with html\[data-theme="splitbook-fixture"\]/);
});

test('a world may override type, shape, and depth only: never motion, density, or component sizes', () => {
  const overrides = {
    'motion-flash': { $type: 'duration', $value: '900ms', $description: 'Slow flash' },
    'density-gap': { $type: 'dimension', $value: '0.25rem', $description: 'Tight' },
    'tap-key-size': { $type: 'dimension', $value: '3rem', $description: 'Small keys' },
    'radius-md': { $type: 'dimension', $value: '0', $description: 'Square' },
  };
  const failures = failuresMatching(withFixtureWorld(freshPackage(), { overrides }), /splitbook-fixture: override/);
  for (const key of ['motion-flash', 'density-gap', 'tap-key-size']) assert.ok(failures.some((failure) => failure.includes(`--sb-${key} is not allowed`)), failures.join('\n'));
  assert.ok(!failures.some((failure) => failure.includes('--sb-radius-md')), failures.join('\n'));
});

test('world animations must collapse under reduced motion and stay bounded', () => {
  const scope = 'html[data-theme="splitbook-fixture"]';
  const css = [
    `${scope} .sb-badge { animation: fixture-pop 400ms var(--sb-easing-enter) 1; }`,
    `${scope} .sb-live-mark { animation: fixture-glow var(--sb-motion-pulse) var(--sb-easing-linear) infinite; }`,
    `@media (prefers-reduced-motion: no-preference) { ${scope} .sb-tap-key { transition: transform 90ms var(--sb-easing-standard); } }`,
    '@keyframes fixture-pop { from { opacity: 0; } }',
    '@keyframes fixture-glow { to { opacity: 0.5; } }',
  ].join('\n');
  const failures = failuresMatching(withFixtureWorld(freshPackage(), { css }), /splitbook-fixture/);
  assert.ok(failures.some((failure) => /animation: fixture-pop 400ms.*raw duration/.test(failure)), failures.join('\n'));
  assert.ok(failures.some((failure) => /fixture-glow.*loops forever/.test(failure)), failures.join('\n'));
  assert.ok(!failures.some((failure) => /transition: transform 90ms/.test(failure)), failures.join('\n'));
});

test('world keyframes and properties must carry the world prefix', () => {
  const css = '@keyframes pop { from { opacity: 0; } }\n@property --glow { syntax: "<number>"; inherits: false; initial-value: 0; }\n';
  const pkg = withFixtureWorld(freshPackage(), { css });
  assert.ok(failuresMatching(pkg, /splitbook-fixture: @keyframes pop must be prefixed "fixture-"/).length > 0, all(pkg));
  assert.ok(failuresMatching(pkg, /splitbook-fixture: @property --glow must be prefixed "--fixture-"/).length > 0, all(pkg));
});

test('a world may not load faces, import, or open a cascade layer itself', () => {
  const css = "@font-face { font-family: X; src: url(x.woff2); }\n@import 'other.css';\n@layer skins { }\n";
  const failures = failuresMatching(withFixtureWorld(freshPackage(), { css }), /splitbook-fixture: tokens\/worlds\/fixture\.css must not use/);
  assert.equal(failures.length, 3, failures.join('\n'));
});

test('a world stylesheet with gradient text fails', () => {
  const css = 'html[data-theme="splitbook-fixture"] .sb-display { background-clip: text; }\n';
  assert.ok(failuresMatching(withFixtureWorld(freshPackage(), { css }), /splitbook-fixture: tokens\/worlds\/fixture\.css: gradient text/).length > 0);
});

// ---------- fonts and world registry ----------

test('a next/font call whose variable no theme or registered world uses fails, naming the call', () => {
  const pkg = freshPackage();
  const unused = "const unusedFace = Archivo({ subsets: ['latin'], weight: ['400'], display: 'swap', preload: false, variable: '--font-unused-face' });\n";
  pkg.sources.set('app/fonts.ts', `${pkg.sources.get('app/fonts.ts')}${unused}`);
  assert.equal(failuresMatching(pkg, /^app\/fonts\.ts: next\/font call unusedFace \(--font-unused-face\) is not used by tokens\/themes\.css or any registered world$/).length, 1, all(pkg));
});

test('a world face is unused once its world is no longer registered', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/themes.ts', pkg.sources.get('preview/themes.ts').replace(/^ {2}\['approach-lights', approachLights\],\n/m, ''));
  assert.equal(failuresMatching(pkg, /^app\/fonts\.ts: next\/font call archivo \(--font-archivo\) is not used/).length, 1, all(pkg));
});

test('every self-hosted font file is loaded by a src, and every src exists', () => {
  const orphan = freshPackage();
  orphan.artifacts.add('app/fonts/Orphan-latin.woff2');
  assert.equal(failuresMatching(orphan, /^app\/fonts\/Orphan-latin\.woff2 is not referenced by a src in app\/fonts\.ts$/).length, 1, all(orphan));
  const missing = freshPackage();
  missing.sources.set('app/fonts.ts', missing.sources.get('app/fonts.ts').replace('./fonts/AtkinsonHyperlegibleMono-Variable-latin.woff2', './fonts/Missing.woff2'));
  assert.equal(failuresMatching(missing, /^app\/fonts\.ts: src \.\/fonts\/Missing\.woff2 does not exist$/).length, 1, all(missing));
  assert.equal(failuresMatching(missing, /^app\/fonts\/AtkinsonHyperlegibleMono-Variable-latin\.woff2 is not referenced/).length, 1, all(missing));
});

test('a world must be registered in WORLD_FILES and imported in globals.css, and neither may name a missing world', () => {
  const unregistered = withFixtureWorld(freshPackage(), { register: false });
  assert.equal(failuresMatching(unregistered, /^splitbook-fixture: tokens\/worlds\/fixture\.json exists but is not registered in preview\/themes\.ts WORLD_FILES$/).length, 1, all(unregistered));
  assert.equal(failuresMatching(unregistered, /^splitbook-fixture: tokens\/worlds\/fixture\.css is not imported in app\/globals\.css$/).length, 1, all(unregistered));
  const ghost = freshPackage();
  ghost.sources.set('preview/themes.ts', ghost.sources.get('preview/themes.ts').replace(/WORLD_FILES([^=]*)=\s*\[/, "WORLD_FILES$1= [\n  ['ghost', ghost],"));
  ghost.sources.set('app/globals.css', `${ghost.sources.get('app/globals.css')}@import '../tokens/worlds/ghost.css';\n`);
  assert.equal(failuresMatching(ghost, /^preview\/themes\.ts registers "ghost" but tokens\/worlds\/ghost\.json does not exist$/).length, 1, all(ghost));
  assert.equal(failuresMatching(ghost, /^app\/globals\.css imports tokens\/worlds\/ghost\.css but tokens\/worlds\/ghost\.json does not exist$/).length, 1, all(ghost));
  const unstyled = freshPackage();
  unstyled.worlds[0].css = null;
  assert.equal(failuresMatching(unstyled, /^splitbook-approach-lights: tokens\/worlds\/approach-lights\.css is missing$/).length, 1, all(unstyled));
});

test('a world face that no next/font call loads fails', () => {
  const css = 'html[data-theme="splitbook-fixture"] .sb-display { font-family: var(--font-nowhere), sans-serif; }\n';
  const pkg = withFixtureWorld(freshPackage(), { css });
  assert.equal(failuresMatching(pkg, /^splitbook-fixture: tokens\/worlds\/fixture\.css uses var\(--font-nowhere\) but app\/fonts\.ts has no next\/font call with that variable$/).length, 1, all(pkg));
});

test('live code that names an archived world fails; prose and docs do not', () => {
  const pkg = freshPackage();
  pkg.artifacts.add('archive/worlds/retired-fixture/retired-fixture.json');
  pkg.sources.set('preview/legacy.ts', "export const LEGACY = 'retired-fixture';\n");
  pkg.codeFiles.set('tokens/legacy.json', '{ "theme": "splitbook-retired-fixture" }\n');
  pkg.sources.set('app/prose.tsx', 'export const Copy = () => <p>The retired-fixture idea lives on.</p>;\n');
  pkg.sources.set('foundations/prose.md', 'The `retired-fixture` world is archived.\n');
  const failures = failuresMatching(pkg, /names archived world "retired-fixture"/);
  assert.deepEqual(failures.map((failure) => failure.split(':')[0]).sort(), ['preview/legacy.ts', 'tokens/legacy.json'], failures.join('\n'));
});
