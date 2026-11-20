import type { CSSProperties } from 'react';
import tokens from '../../tokens/tokens.json';
import { ContrastSwatches, type Swatch, type SwatchGroup } from './ContrastSwatches';
import { SubSection } from './primitives';

const descriptions = tokens.semantic.color as Record<string, { $description: string }>;
const describe = (role: string) => descriptions[role]?.$description ?? '';

const pair = (role: string): Swatch => ({ role, description: describe(role), fill: role, ink: `${role}-foreground`, measure: [`${role}-foreground`, role], kind: 'text' });
const boundary = (role: string, against = 'surface-card'): Swatch => ({ role, description: describe(role), fill: against, mark: role, measure: [role, against], kind: 'non-text' });

const SWATCH_GROUPS: SwatchGroup[] = [
  {
    label: 'Base',
    swatches: [
      { role: 'background', description: describe('background'), fill: 'background', ink: 'foreground', measure: ['foreground', 'background'], kind: 'text' },
      pair('surface-card'),
      pair('surface-panel'),
      pair('surface-shelf'),
      pair('surface-tray'),
      pair('primary'),
      pair('secondary'),
      pair('muted'),
      { role: 'muted-foreground', description: describe('muted-foreground'), fill: 'background', ink: 'muted-foreground', measure: ['muted-foreground', 'background'], kind: 'text' },
      pair('accent'),
      pair('destructive'),
      { role: 'input', description: describe('input'), fill: 'input', ink: 'foreground', measure: ['foreground', 'input'], kind: 'text' },
      boundary('border'),
      boundary('ring', 'background'),
    ],
  },
  { label: 'Status (always with a word or icon)', swatches: [pair('success'), pair('warning'), pair('info')] },
  { label: 'Pace Clock hands and the Tap Pad (one job each)', swatches: [pair('live'), pair('metric'), pair('improvement'), pair('fault'), pair('tap-pad')] },
  {
    label: 'Hands as boundaries on the Tap Pad (3:1)',
    swatches: ['live', 'metric', 'improvement', 'fault'].map((role) => boundary(role, 'tap-pad')),
  },
  {
    label: 'Utility',
    swatches: [
      { role: 'shadow', description: describe('shadow'), fill: 'shadow' },
      { role: 'scrim', description: describe('scrim'), fill: 'scrim' },
      ...[1, 2, 3, 4, 5].map((n) => boundary(`chart-${n}`)),
    ],
  },
];

export function ColourRoles() {
  const roleCount = Object.keys(tokens.semantic.color).length;
  return (
    <SubSection id="colour-roles" title="Colour roles" note={`${roleCount} roles, live for the theme painted now`}>
      <p className="sb-measure">
        Chalk-tile white and ink, plus the four hands of the pool&apos;s pace clock. Each hand does one job and is never decorative: <strong>red</strong> means recording
        now, <strong>blue</strong> a captured metric, <strong>green</strong> better than before, and <strong>black</strong> is ink. Deck keeps dark ink on light planes for
        glare, shows the live state as a black LED plate with safety-yellow figures, and holds text to the 7:1 glare grade. Every read-out below is measured from the variables
        on this page, so switching theme or world re-measures it.
      </p>
      <ContrastSwatches groups={SWATCH_GROUPS} glare={{ minimum: tokens.contrast.glare.minimum, themes: tokens.contrast.glare.themes }} />
    </SubSection>
  );
}

type TypeToken = { $value: { fontSize: string; lineHeight: number; fontWeight: string; fontFamily: string }; $description: string };
const typography = tokens.typography as Record<string, TypeToken>;
const FACE: Record<string, string> = { display: 'Schibsted Grotesk', sans: 'Atkinson Hyperlegible Next', mono: 'Atkinson Hyperlegible Mono' };
const fontWeights = tokens.primitive.fontWeight as Record<string, { $value: number }>;

const SAMPLE: Record<string, string> = {
  display: 'See what a stopwatch can’t',
  'heading-lg': 'Metric trends for Mia',
  'heading-md': 'Review sheet',
  'body-lg': '3 more kicks off every wall than in July.',
  body: 'Tap the wall key each time Mia touches the wall. Undo takes back the last tap.',
  'body-sm': 'SWOLF adds strokes and seconds for one Length; lower means more efficient.',
  label: 'Underwater kicks',
  code: 'swolf = stroke_count + split_seconds',
  'numeral-xl': '1:18.42',
  'numeral-lg': '17.0',
  'numeral-md': '6 kicks',
};

export function TypeAndNumerals() {
  return (
    <SubSection id="type-numerals" title="Type and numerals" note="Schibsted Grotesk · Atkinson Hyperlegible Next · Atkinson Hyperlegible Mono">
      <p className="sb-measure">
        Numerals are the hero. Splits and counts set in a grotesque display face with tabular figures, so digits hold their column as a split runs. Reading text uses
        Atkinson Hyperlegible Next, drawn so 1, l and I, and 0 and O never blur, which helps in glare.
      </p>
      <div className="sb-table-wrap" role="region" aria-label="Typography tokens table" tabIndex={0}>
        <table className="sb-table">
          <caption className="sb-body-sm sb-muted">Every typography token, rendered with its own variables</caption>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Specimen</th>
              <th scope="col">Face · weight · size / line</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(typography).map(([name, token]) => (
              <tr key={name}>
                <th scope="row">
                  <code>type-{name}</code>
                </th>
                <td>
                  <span
                    style={
                      {
                        fontFamily: `var(--sb-type-${name}-family)`,
                        fontSize: `var(--sb-type-${name}-size)`,
                        lineHeight: `var(--sb-type-${name}-line-height)`,
                        fontWeight: `var(--sb-type-${name}-weight)`,
                        fontVariantNumeric: name.startsWith('numeral') ? 'tabular-nums' : undefined,
                      } as CSSProperties
                    }
                  >
                    {SAMPLE[name] ?? name}
                  </span>
                </td>
                <td className="sb-body-sm">
                  {FACE[/primitive\.font\.(\w+)/.exec(token.$value.fontFamily)?.[1] ?? '']} · {fontWeights[/fontWeight\.(\w+)/.exec(token.$value.fontWeight)?.[1] ?? '']?.$value} ·{' '}
                  {token.$value.fontSize} / {token.$value.lineHeight}
                  <br />
                  <span className="sb-muted">{token.$description}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sb-pair">
        <figure className="sb-card" style={{ margin: 0 }}>
          <figcaption className="sb-label">Tabular figures: splits stay in their column</figcaption>
          <div className="sb-numeral" data-size="lg">
            17.84
            <br />
            19.92
            <br />
            11.11
          </div>
        </figure>
        <div className="sb-pair-axis" aria-hidden="true" />
        <figure className="sb-card" style={{ margin: 0 }}>
          <figcaption className="sb-label">Proportional figures: not for read-outs</figcaption>
          <div className="sb-numeral" data-size="lg" style={{ fontVariantNumeric: 'proportional-nums' }}>
            17.84
            <br />
            19.92
            <br />
            11.11
          </div>
        </figure>
      </div>
    </SubSection>
  );
}

const space = Object.entries(tokens.primitive.space).filter(([key]) => !key.startsWith('$')) as [string, { $value: string; $description: string }][];
const radius = Object.entries(tokens.primitive.radius) as [string, { $value: string; $description: string }][];
const elevation = Object.entries(tokens.elevation) as [string, { $description: string }][];
const borderWidth = Object.entries(tokens.primitive.borderWidth) as [string, { $value: string; $description: string }][];

export function SpacingShape() {
  return (
    <SubSection id="spacing-shape" title="Spacing, radius and elevation" note="Pool-tile corners, a single contact shadow">
      <div className="sb-grid" data-min="wide">
        <div className="sb-card">
          <h4 className="sb-label">Space</h4>
          {space.map(([key, token]) => (
            <div key={key} className="sb-scale-row">
              <code>space-{key}</code>
              <span className="sb-scale-bar" style={{ inlineSize: `var(--sb-space-${key})` }} title={`${token.$value}: ${token.$description}`} />
            </div>
          ))}
        </div>
        <div className="sb-stack">
          <div className="sb-grid">
            {radius.map(([key, token]) => (
              <div key={key} className="sb-shape-tile" style={{ borderRadius: `var(--sb-radius-${key})` }}>
                <span className="sb-body-sm">
                  <code>radius-{key}</code>
                  <br />
                  {token.$description}
                </span>
              </div>
            ))}
          </div>
          <div className="sb-grid">
            {elevation.map(([key, token]) => (
              <div key={key} className="sb-shape-tile" style={{ borderRadius: 'var(--sb-radius-md)', boxShadow: `var(--sb-elevation-${key})` }}>
                <span className="sb-body-sm">
                  <code>elevation-{key}</code>
                  <br />
                  {token.$description}
                </span>
              </div>
            ))}
            {borderWidth.map(([key, token]) => (
              <div key={key} className="sb-shape-tile" style={{ borderRadius: 'var(--sb-radius-md)', borderWidth: `var(--sb-border-width-${key})`, borderColor: 'var(--sb-foreground)' }}>
                <span className="sb-body-sm">
                  <code>border-width-{key}</code>
                  <br />
                  {token.$description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SubSection>
  );
}

type Override = { $value: string | number; $description: string };
const deckOverrides = tokens.themes['splitbook-deck'].overrides as Record<string, Override>;
const compactOverrides = tokens.densityModes.compact.overrides as Record<string, Override>;

/** The value a knob has in the base (Light) theme, read from the token tiers it lives in. */
function baseValue(knob: string): string {
  const component = (tokens.component as Record<string, { $value: string | number }>)[knob];
  if (component) return String(component.$value);
  const density = /^density-(.+)$/.exec(knob);
  if (density) return (tokens.density as Record<string, { $value: string }>)[density[1]].$value;
  const type = /^type-(.+)-(size|line-height)$/.exec(knob);
  if (type) {
    const value = typography[type[1]].$value;
    return String(type[2] === 'size' ? value.fontSize : value.lineHeight);
  }
  return '–';
}

const KNOBS = [...new Set([...Object.keys(deckOverrides), ...Object.keys(compactOverrides)])];

export function DeckKnob() {
  return (
    <SubSection id="deck-knob" title="Deck knob" note="Pace Clock Deck changes sizes as well as colours">
      <p className="sb-measure">
        Deck is a palette and a size knob. Capture screens opt in; desk pages stay Light. Deck raises every Capture target to at least 56 CSS px, Tap Pad keys to{' '}
        {deckOverrides['tap-key-size'].$value}, the running split to {deckOverrides['type-numeral-xl-size'].$value} numerals, and opens up the density. Compact is the
        Admin console&apos;s knob and only ever shrinks to the 24 CSS px floor. Primary actions
        on Capture screens sit in the bottom tray, in the one-handed reach zone, in both themes.
      </p>
      <div className="sb-knob-pair" aria-label="Tap Pad key at Light and Deck sizes" role="group">
        {[
          ['Light', baseValue('tap-key-size')],
          ['Deck', deckOverrides['tap-key-size'].$value],
        ].map(([label, size]) => (
          <div key={label} className="sb-knob-key" style={{ inlineSize: size, blockSize: size }}>
            <span className="sb-body-sm">
              {label}
              <br />
              {size}
            </span>
          </div>
        ))}
        {[
          ['Light', baseValue('type-numeral-xl-size')],
          ['Deck', deckOverrides['type-numeral-xl-size'].$value],
        ].map(([label, size]) => (
          <div key={`n-${label}`} className="sb-stack" data-gap="tight">
            <span className="sb-numeral" style={{ fontSize: size, lineHeight: 'var(--sb-type-numeral-xl-line-height)' }}>
              1:18
            </span>
            <span className="sb-body-sm sb-muted">
              {label} numeral-xl · {size}
            </span>
          </div>
        ))}
      </div>
      <div className="sb-table-wrap" role="region" aria-label="Deck knob comparison table" tabIndex={0}>
        <table className="sb-table sb-knob-table">
          <caption className="sb-body-sm sb-muted">Values from tokens.json; the validator fails if a brief-listed Deck knob is missing or not larger than Light</caption>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col" data-numeric="true">
                Light
              </th>
              <th scope="col" data-numeric="true">
                Deck
              </th>
              <th scope="col" data-numeric="true">
                Compact (Admin)
              </th>
            </tr>
          </thead>
          <tbody>
            {KNOBS.map((knob) => (
              <tr key={knob}>
                <th scope="row">
                  <code>--sb-{knob}</code>
                </th>
                <td data-numeric="true">{baseValue(knob)}</td>
                <td data-numeric="true">{deckOverrides[knob]?.$value ?? '–'}</td>
                <td data-numeric="true">{compactOverrides[knob]?.$value ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SubSection>
  );
}
