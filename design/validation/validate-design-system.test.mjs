import assert from 'node:assert/strict';
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
    artifacts: new Set(pkg.artifacts),
    worlds: pkg.worlds.map((world) => ({ ...world, json: structuredClone(world.json) })),
  };
}

const failuresMatching = (pkg, pattern) => validateDesignSystem(pkg).filter((failure) => pattern.test(failure));
const all = (pkg) => validateDesignSystem(pkg).join('\n');

// Edit the body of the first CSS block whose prelude starts with `selector`.
function blockEdit(css, selector, edit) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `fixture needs a block starting ${selector}`);
  const end = css.indexOf('}', start);
  return css.slice(0, start) + edit(css.slice(start, end)) + css.slice(end);
}

const setVar = (css, selector, name, value) => blockEdit(css, selector, (block) => block.replace(new RegExp(`--hh-${name}: [^;]+;`), `--hh-${name}: ${value};`));
const DARK = 'html[data-theme="hermes-dark"]';
const LIGHT = 'html[data-theme="hermes-light"]';

// A fixture world built from the hermes-dark colours and registered in preview/themes.ts, so world tests never depend
// on a shipped world. `color` replaces roles; palette `extra` adds raw declarations to that palette's block.
function withFixtureWorld(pkg, { color = {}, overrides = {}, css = '', palettes = [{ id: 'alt-a' }, { id: 'alt-b' }, { id: 'original' }], register = true } = {}) {
  const theme = 'hermes-fixture';
  const base = pkg.tokens.themes['hermes-dark'].color;
  const colourSet = (changes) => {
    const set = structuredClone(base);
    for (const [role, value] of Object.entries(changes)) set[role] = { $type: 'color', $value: value };
    return set;
  };
  const roleLines = (set) => Object.entries(set).map(([role, token]) => `  --hh-${role}: ${token.$value};`);
  const roles = colourSet(color);
  const declarations = [...roleLines(roles), ...Object.entries(overrides).map(([key, token]) => `  --hh-${key}: ${token.$value};`)];
  const paletteJson = palettes.map(({ id, color: changes = {} }) => ({ id, label: id, colorScheme: 'dark', color: colourSet(changes) }));
  const paletteCss = palettes.map(
    ({ id, extra = [] }, index) => `html[data-theme="${theme}"][data-palette="${id}"] {\n  color-scheme: dark;\n${[...roleLines(paletteJson[index].color), ...extra].join('\n')}\n}\n`,
  );
  pkg.worlds.push({
    slug: 'fixture',
    theme,
    json: { label: 'Fixture', order: 999, $description: 'Test world.', signature: 'None.', colorScheme: 'dark', color: roles, overrides, palette: { label: 'Recommended' }, palettes: paletteJson },
    css: `html[data-theme="${theme}"] {\n  color-scheme: dark;\n${declarations.join('\n')}\n}\n${paletteCss.join('')}${css}`,
  });
  if (register) {
    const registry = pkg.sources.get('preview/themes.ts');
    pkg.sources.set('preview/themes.ts', registry.replace(/WORLD_SLUGS([^=]*)=\s*\[/, "WORLD_SLUGS$1= ['fixture', "));
  }
  return pkg;
}

// ---------- the shipped package ----------

test('the shipped design-system package passes validation', () => {
  assert.deepEqual(validateDesignSystem(freshPackage()), []);
});

test('a missing required artifact fails', () => {
  const pkg = freshPackage();
  pkg.artifacts.delete('components/round-widgets.md');
  assert.equal(failuresMatching(pkg, /Missing required artifact: components\/round-widgets\.md/).length, 1, all(pkg));
});

test('a /design section that disappears from the preview fails', () => {
  const pkg = freshPackage();
  for (const [path, text] of pkg.sources) if (path.startsWith('preview/') || path.startsWith('app/')) pkg.sources.set(path, text.replaceAll('Strip bay', 'Rack'));
  assert.equal(failuresMatching(pkg, /missing section: Strip bay/).length, 1, all(pkg));
});

// ---------- contrast gates ----------

test('a role / foreground pair below 4.5:1 fails in the theme that ships it', () => {
  const pkg = freshPackage();
  pkg.themesCss = setVar(pkg.themesCss, LIGHT, 'pending', '#d9a441');
  const failures = failuresMatching(pkg, /^hermes-light: text pending-foreground on pending/);
  assert.equal(failures.length, 1, all(pkg));
  assert.match(failures[0], /\d\.\d\d:1; needs 4\.5:1/);
});

test('code-foreground must reach 4.5:1 on diff-add and diff-remove', () => {
  const pkg = freshPackage();
  pkg.themesCss = setVar(pkg.themesCss, DARK, 'diff-add', '#5f7f68');
  assert.equal(failuresMatching(pkg, /^hermes-dark: text code-foreground on diff-add/).length, 1, all(pkg));
});

test('muted-foreground must reach 4.5:1 on muted', () => {
  const pkg = freshPackage();
  pkg.themesCss = setVar(pkg.themesCss, LIGHT, 'muted-foreground', '#8a8f96');
  assert.ok(failuresMatching(pkg, /^hermes-light: text muted-foreground on muted /).length > 0, all(pkg));
});

test('a border below 3:1 against the strip fails', () => {
  const pkg = freshPackage();
  pkg.themesCss = setVar(pkg.themesCss, DARK, 'border', '#c3c9cf');
  assert.equal(failuresMatching(pkg, /^hermes-dark: non-text border against strip /).length, 1, all(pkg));
});

test('a focus ring below 3:1 against a surface fails', () => {
  const pkg = freshPackage();
  pkg.themesCss = setVar(pkg.themesCss, DARK, 'ring', '#2a3038');
  assert.ok(failuresMatching(pkg, /^hermes-dark: non-text ring against surface-card /).length > 0, all(pkg));
});

test('a holder colour below 3:1 against the strip or the board fails', () => {
  const pkg = freshPackage();
  pkg.themesCss = setVar(pkg.themesCss, DARK, 'answered', '#9cc3d6');
  assert.equal(failuresMatching(pkg, /^hermes-dark: non-text answered against strip /).length, 1, all(pkg));
});

test('an Agent identity colour below 3:1 against the card fails', () => {
  const pkg = freshPackage();
  pkg.themesCss = setVar(pkg.themesCss, LIGHT, 'agent-3', '#e6c9c4');
  assert.equal(failuresMatching(pkg, /^hermes-light: non-text agent-3 against (surface-card|surface-panel|background) /).length, 3, all(pkg));
});

test('removing a brief contrast pair from tokens.json fails, so a gate cannot be silenced', () => {
  const pkg = freshPackage();
  pkg.tokens.contrast.nonText.pairs = pkg.tokens.contrast.nonText.pairs.filter(([a, b]) => !(a === 'recommended' && b === 'strip'));
  assert.equal(failuresMatching(pkg, /contrast\.nonText is missing the brief's pair recommended against strip/).length, 1, all(pkg));
});

// ---------- parity and typing ----------

test('a role missing from one theme block fails even when another block defines it', () => {
  const pkg = freshPackage();
  pkg.themesCss = blockEdit(pkg.themesCss, LIGHT, (block) => block.replace(/\n\s*--hh-secondary: [^;]+;/, ''));
  assert.ok(failuresMatching(pkg, /^hermes-light: .*missing --hh-secondary\b(?!-)/).length > 0, all(pkg));
});

test('theme CSS that drifts from tokens.json fails', () => {
  const pkg = freshPackage();
  pkg.tokens.themes['hermes-dark'].color.muted.$value = '#000000';
  assert.ok(failuresMatching(pkg, /^hermes-dark: themes\.css --hh-muted .* tokens\.json/).length > 0, all(pkg));
});

test('a root token that drifts from tokens.json fails', () => {
  const pkg = freshPackage();
  pkg.tokens.component['strip-holder-width'].$value = '0.5rem';
  assert.equal(failuresMatching(pkg, /:root --hh-strip-holder-width .* component\.strip-holder-width/).length, 1, all(pkg));
});

test('semantic roles must be typed and described', () => {
  const pkg = freshPackage();
  delete pkg.tokens.semantic.color.ring.$description;
  assert.equal(failuresMatching(pkg, /semantic\.color\.ring is missing \$description/).length, 1, all(pkg));
});

test('the default theme must share its block with :root', () => {
  const pkg = freshPackage();
  pkg.themesCss = pkg.themesCss.replace(':root,\nhtml[data-theme="hermes-dark"]', 'html[data-theme="hermes-dark"]');
  assert.equal(failuresMatching(pkg, /default theme hermes-dark must share its block with :root/).length, 1, all(pkg));
});

test('a component token that is never consumed by the preview fails', () => {
  const pkg = freshPackage();
  for (const [path, text] of pkg.sources) pkg.sources.set(path, text.replaceAll('--hh-timer-track-height', '--hh-unused'));
  assert.equal(failuresMatching(pkg, /--hh-timer-track-height is exported but not consumed/).length, 1, all(pkg));
});

// ---------- density, targets, motion ----------

test('compact may not drop a target below the 24px floor', () => {
  const pkg = freshPackage();
  pkg.themesCss = setVar(pkg.themesCss, '[data-density="compact"]', 'button-min-target', '1.25rem');
  pkg.tokens.densityModes.compact.overrides['button-min-target'].$value = '1.25rem';
  assert.ok(failuresMatching(pkg, /--hh-button-min-target 1\.25rem is below the 24px target floor/).length > 0, all(pkg));
});

test('compact must lower strip-min-height and the density knobs', () => {
  const pkg = freshPackage();
  pkg.tokens.densityModes.compact.overrides['strip-min-height'].$value = '5rem';
  assert.equal(failuresMatching(pkg, /density compact: --hh-strip-min-height \(5rem\) must be smaller than the base/).length, 1, all(pkg));
});

test('glance must raise the option row and reach a 3rem target', () => {
  const pkg = freshPackage();
  delete pkg.tokens.densityModes.glance.overrides['option-row-min-height'];
  pkg.tokens.densityModes.glance.overrides['button-min-target'].$value = '2.5rem';
  pkg.themesCss = setVar(pkg.themesCss, '[data-density="glance"] [data-density="compact"]', 'button-min-target', '2.5rem');
  assert.equal(failuresMatching(pkg, /density glance: tokens\.json must override --hh-option-row-min-height/).length, 1, all(pkg));
  assert.equal(failuresMatching(pkg, /density glance: --hh-button-min-target 2\.5rem is below the 48px/).length, 1, all(pkg));
});

test('a small control size that would drop below the 24px floor fails', () => {
  const pkg = freshPackage();
  pkg.tokens.component['control-size-sm'].$value = 'calc(var(--hh-button-min-target) * 0.7)';
  assert.ok(failuresMatching(pkg, /^component\.control-size-sm is 22\.4px at the smallest target \(32px\)/).length > 0, all(pkg));
});

test('reduced motion must collapse every duration', () => {
  const pkg = freshPackage();
  pkg.themesCss = pkg.themesCss.replace(/\n\s*--hh-motion-signature: 1ms;/, '');
  assert.equal(failuresMatching(pkg, /Reduced-motion block does not collapse --hh-motion-signature/).length, 1, all(pkg));
});

// ---------- guardrails ----------

test('raw visual values fail in preview code but are allowed in the token layer', () => {
  const pkg = freshPackage();
  const raw = '.x { padding: 1.25rem; color: #182032; font-weight: 700; box-shadow: 0 2px 4px black; }\n';
  pkg.sources.set('preview/raw.css', raw);
  pkg.sources.set('tokens/raw.css', raw);
  const failures = validateDesignSystem(pkg);
  assert.ok(failures.some((failure) => failure.startsWith('preview/raw.css: raw colour value')), failures.join('\n'));
  assert.ok(failures.some((failure) => failure.startsWith('preview/raw.css: raw length')), failures.join('\n'));
  assert.ok(failures.some((failure) => failure.startsWith('preview/raw.css: raw shadow')), failures.join('\n'));
  assert.ok(!failures.some((failure) => failure.includes('tokens/raw.css')), failures.join('\n'));
});

test('color-mix() is a raw colour outside the token layer', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/raw.css', '.x { background: color-mix(in srgb, var(--hh-pending) 40%, transparent); }\n');
  assert.equal(failuresMatching(pkg, /^preview\/raw\.css: raw colour function/).length, 1, all(pkg));
});

test('Tailwind arbitrary values, palette utilities, and z utilities fail in preview TSX', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/Raw.tsx', 'export const X = () => <div className="p-[13px] bg-amber-500 z-50" />;\n');
  const failures = failuresMatching(pkg, /^preview\/Raw\.tsx/);
  assert.ok(failures.some((failure) => /arbitrary/.test(failure)), failures.join('\n'));
  assert.ok(failures.some((failure) => /palette/.test(failure)), failures.join('\n'));
  assert.ok(failures.some((failure) => /z-index/.test(failure)), failures.join('\n'));
});

test('media queries outside the token layer must use breakpoint tokens', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/raw.css', '@media (max-width: 860px) { .x { display: block; } }\n');
  assert.equal(failuresMatching(pkg, /^preview\/raw\.css: media query uses 860px/).length, 1, all(pkg));
});

test('raw easing fails, and a gradient is not an easing', () => {
  const pkg = freshPackage();
  pkg.sources.set(
    'preview/raw.css',
    ['.a { transition: opacity var(--hh-motion-fast) ease-out; }', '.b { background: repeating-linear-gradient(90deg, var(--hh-muted) 0 var(--hh-space-2), transparent var(--hh-space-2)); }'].join('\n'),
  );
  const failures = failuresMatching(pkg, /^preview\/raw\.css: raw easing/);
  assert.equal(failures.length, 1, all(pkg));
  assert.match(failures[0], /ease-out$/);
});

test('opacity 0 and 1 are on and off states, but any other raw opacity fails', () => {
  const onOff = freshPackage();
  onOff.sources.set('preview/raw.css', '.a { opacity: 0; }\n.b { opacity: 1; }\n');
  assert.equal(failuresMatching(onOff, /^preview\/raw\.css: unitless/).length, 0, all(onOff));
  const tuned = freshPackage();
  tuned.sources.set('preview/raw.css', '.c { opacity: 0.4; }\n');
  assert.equal(failuresMatching(tuned, /^preview\/raw\.css: unitless/).length, 1, all(tuned));
});

test('the live glow on a selector that is not live state fails', () => {
  const pkg = freshPackage();
  pkg.sources.set('preview/raw.css', '.hh-card { box-shadow: var(--hh-elevation-live); }\n.hh-connection[data-state="live"] .lamp { box-shadow: var(--hh-elevation-live); }\n');
  const failures = failuresMatching(pkg, /^preview\/raw\.css: .* paints the live glow/);
  assert.equal(failures.length, 1, all(pkg));
  assert.match(failures[0], /"\.hh-card"/);
});

// ---------- worlds ----------

test('a well-formed fixture world passes, proving the world loader and registry work', () => {
  assert.deepEqual(validateDesignSystem(withFixtureWorld(freshPackage())), []);
});

test('a world on disk that is not registered in preview/themes.ts fails, and so does a slug without files', () => {
  const unregistered = withFixtureWorld(freshPackage(), { register: false });
  assert.equal(failuresMatching(unregistered, /hermes-fixture: .*not registered in preview\/themes\.ts WORLD_SLUGS/).length, 1, all(unregistered));
  const ghost = freshPackage();
  ghost.sources.set('preview/themes.ts', ghost.sources.get('preview/themes.ts').replace(/WORLD_SLUGS([^=]*)=\s*\[/, "WORLD_SLUGS$1= ['ghost', "));
  assert.equal(failuresMatching(ghost, /registers "ghost" but tokens\/worlds\/ghost\.json does not exist/).length, 1, all(ghost));
});

test('a world faces the same contrast gates as the core themes', () => {
  const pkg = withFixtureWorld(freshPackage(), { color: { pending: '#e8c27a' } });
  assert.equal(failuresMatching(pkg, /^hermes-fixture: non-text pending against strip /).length, 1, all(pkg));
});

test('a world colour option faces the same gates as the theme it recolours', () => {
  const pkg = withFixtureWorld(freshPackage(), { palettes: [{ id: 'washed', color: { 'agent-2': '#202a24' } }, { id: 'alt-b' }, { id: 'original' }] });
  assert.ok(failuresMatching(pkg, /^hermes-fixture palette "washed": non-text agent-2 against/).length > 0, all(pkg));
});

test('a world needs exactly four colour options, ending with original', () => {
  const short = withFixtureWorld(freshPackage(), { palettes: [{ id: 'alt-a' }, { id: 'original' }] });
  assert.equal(failuresMatching(short, /needs exactly 4 colour options .* found 3/).length, 1, all(short));
  const order = withFixtureWorld(freshPackage(), { palettes: [{ id: 'original' }, { id: 'alt-a' }, { id: 'alt-b' }] });
  assert.equal(failuresMatching(order, /the last colour option must be "original"/).length, 1, all(order));
});

test('a palette block may only recolour, never restyle', () => {
  const pkg = withFixtureWorld(freshPackage(), { palettes: [{ id: 'square', extra: ['  --hh-radius-md: 0;'] }, { id: 'alt-b' }, { id: 'original' }] });
  assert.equal(failuresMatching(pkg, /palette block "square" may only set color-scheme, colour roles, and --fixture-\* helpers \(found --hh-radius-md\)/).length, 1, all(pkg));
});

test('a world rule that escapes its theme scope fails, so one world cannot restyle another', () => {
  const scope = 'html[data-theme="hermes-fixture"]';
  const css = `.hh-strip { border-radius: 0; }\n${scope} :is(.hh-card, .hh-panel) { border-radius: 0; }\n`;
  const failures = failuresMatching(withFixtureWorld(freshPackage(), { css }), /hermes-fixture: selector/);
  assert.equal(failures.length, 1, failures.join('\n'));
  assert.match(failures[0], /selector "\.hh-strip" must start with html\[data-theme="hermes-fixture"\]/);
});

test('a world may override type, shape, and depth, but never motion, density, or component sizes', () => {
  const allowed = withFixtureWorld(freshPackage(), { overrides: { 'font-condensed': { $type: 'fontFamily', $value: 'serif', $description: 'Test face' } } });
  assert.deepEqual(validateDesignSystem(allowed), []);
  for (const key of ['motion-signature', 'density-gap', 'button-min-target']) {
    const pkg = withFixtureWorld(freshPackage(), { overrides: { [key]: { $type: 'dimension', $value: '1rem', $description: 'Not allowed' } } });
    assert.ok(failuresMatching(pkg, new RegExp(`hermes-fixture: override --hh-${key} is not allowed`)).length > 0, all(pkg));
  }
});

test('world animations must collapse under reduced motion and stay bounded', () => {
  const scope = 'html[data-theme="hermes-fixture"]';
  const css = [
    `${scope} .hh-strip { animation: fixture-taxi 400ms var(--hh-easing-exit) 1; }`,
    `${scope} .hh-connection-lamp { animation: fixture-blink var(--hh-motion-pulse) var(--hh-easing-linear) infinite; }`,
    `@media (prefers-reduced-motion: no-preference) { ${scope} .hh-kbd { transition: transform 90ms var(--hh-easing-standard); } }`,
    '@keyframes fixture-taxi { to { translate: 100% 0; } }',
    '@keyframes fixture-blink { to { opacity: 0; } }',
  ].join('\n');
  const failures = failuresMatching(withFixtureWorld(freshPackage(), { css }), /hermes-fixture/);
  assert.ok(failures.some((failure) => /animation: fixture-taxi 400ms.*raw duration/.test(failure)), failures.join('\n'));
  assert.ok(failures.some((failure) => /fixture-blink.*loops forever/.test(failure)), failures.join('\n'));
  assert.ok(!failures.some((failure) => /transition: transform 90ms/.test(failure)), failures.join('\n'));
});

test('world keyframes must carry the world prefix so worlds never collide', () => {
  const pkg = withFixtureWorld(freshPackage(), { css: '@keyframes taxi { from { opacity: 0; } }\n' });
  assert.equal(failuresMatching(pkg, /hermes-fixture: @keyframes taxi must be prefixed "fixture-"/).length, 1, all(pkg));
});

test('a world may not load faces or layers itself', () => {
  const pkg = withFixtureWorld(freshPackage(), { css: '@font-face { font-family: X; src: url(x.woff2); }\n' });
  assert.equal(failuresMatching(pkg, /hermes-fixture: tokens\/worlds\/fixture\.css must not use @font-face/).length, 1, all(pkg));
});

test('a world glow outside live state fails', () => {
  const scope = 'html[data-theme="hermes-fixture"]';
  const pkg = withFixtureWorld(freshPackage(), { css: `${scope} .hh-strip { box-shadow: var(--hh-elevation-live); }\n` });
  assert.equal(failuresMatching(pkg, /hermes-fixture: .*paints the live glow/).length, 1, all(pkg));
});

test('a world that prints error text in the destructive role must keep it legible on the surfaces forms sit on', () => {
  const scope = 'html[data-theme="hermes-fixture"]';
  const dim = { color: { destructive: '#7a2a24', 'destructive-foreground': '#ffffff' } };
  const pattern = /^hermes-fixture: text destructive on surface-card/;
  const filled = failuresMatching(withFixtureWorld(freshPackage(), { ...dim, css: `${scope} .hh-error { border-color: var(--hh-destructive); }\n` }), pattern);
  assert.equal(filled.length, 0, filled.join('\n'));
  const printed = failuresMatching(withFixtureWorld(freshPackage(), { ...dim, css: `${scope} .hh-error { color: var(--hh-destructive); }\n` }), pattern);
  assert.equal(printed.length, 1, printed.join('\n'));
});
