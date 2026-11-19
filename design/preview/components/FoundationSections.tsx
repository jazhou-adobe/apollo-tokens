import type { CSSProperties } from 'react';
import tokens from '../../tokens/tokens.json';
import { AGENTS, ROUNDS } from '../fixtures';
import { ColourRoles, TokenReadout, type RoleGroup, type RolePair } from './ColourRoles';
import { Callsign } from './hermes/Callsign';
import { ConnectionStatus } from './hermes/ConnectionStatus';
import { ToggleStrip } from './hermes/Strip';

const semantic = tokens.semantic.color as Record<string, { $description: string }>;
const textPairs = tokens.contrast.text.pairs as [string, string][];
const nonTextPairs = tokens.contrast.nonText.pairs as [string, string][];

/** The gated pairs shown under a role's swatch: its own foreground pair, then every documented pair it leads. */
function pairsFor(role: string): RolePair[] {
  const foreground = role === 'background' ? 'foreground' : `${role}-foreground`;
  const pairs: RolePair[] = semantic[foreground] ? [{ foreground, background: role, minimum: 4.5, kind: 'text' }] : [];
  for (const [fg, bg] of textPairs) if ((fg === role || fg === foreground) && !(fg === foreground && bg === role)) pairs.push({ foreground: fg, background: bg, minimum: 4.5, kind: 'text' });
  for (const [fg, bg] of nonTextPairs) if (fg === role) pairs.push({ foreground: fg, background: bg, minimum: 3, kind: 'non-text' });
  return pairs;
}

const GROUPS: { label: string; note: string; roles: string[] }[] = [
  {
    label: 'Board and surfaces',
    note: 'Ops-room slate (dark) or day-shift bay (light). Each surface carries its own foreground at 4.5:1; muted text clears 4.5:1 on every surface.',
    roles: ['background', 'surface-card', 'surface-panel', 'surface-shelf', 'surface-tray', 'muted', 'input', 'border', 'ring'],
  },
  {
    label: 'Actions and status',
    note: 'One primary action per screen. Status roles always print a word beside the colour.',
    roles: ['primary', 'secondary', 'accent', 'destructive', 'success', 'warning', 'info'],
  },
  {
    label: 'Strips and holders',
    note: 'Paper strips in dark ink. Holder colours frame a strip and pass 3:1 against the strip and the board; the tab prints the status word.',
    roles: ['strip', 'pending', 'answered', 'expired', 'recommended', 'live', 'code', 'diff-add', 'diff-remove'],
  },
  {
    label: 'Agent identity',
    note: 'Six identity colours for callsign chips, each 3:1 against card, panel, and board. The callsign text always rides with the colour.',
    roles: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5', 'agent-6'],
  },
  {
    label: 'Charts and utility',
    note: 'Chart series hold 3:1 against card, panel, and board and are also labelled. Shadow and scrim never carry text.',
    roles: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'shadow', 'scrim'],
  },
];

const ROLE_GROUPS: RoleGroup[] = GROUPS.map((group) => ({
  label: group.label,
  note: group.note,
  roles: group.roles.map((role) => ({
    role,
    description: semantic[role]?.$description ?? '',
    pairs: pairsFor(role),
    foreground: semantic[`${role}-foreground`] ? `${role}-foreground` : role === 'background' ? 'foreground' : role === 'diff-add' || role === 'diff-remove' ? 'code-foreground' : undefined,
  })),
}));

export function DirectionSection() {
  return (
    <section id="direction" className="hh-section hh-hero" aria-labelledby="page-title">
      <h1 id="page-title" className="hh-display">
        Every Round is a strip in a holder.
      </h1>
      <p className="hh-body-lg hh-measure">
        The Command Center is the strip board of a carrier&apos;s operations room. Holders give status, and the status word rides with the colour. Callsigns identify each Agent. Live
        values sit in mono, and only live state glows.
      </p>
      <ul className="hh-strip-bay-list" data-density="compact">
        <ToggleStrip round={ROUNDS[0]} />
      </ul>
      <p className="hh-specimen-note">Illustrative data: every Agent, Round, path, and time on this page is made up.</p>
    </section>
  );
}

export function ColourSection() {
  return (
    <section id="colour-roles" className="hh-section" aria-labelledby="colour-roles-title">
      <div className="hh-section-head">
        <h2 id="colour-roles-title" className="hh-heading-lg">
          Colour roles
        </h2>
        <p className="hh-body hh-measure">
          {Object.keys(semantic).length} roles, defined in every theme, world, and colour option. Readouts are measured live from the painted theme with the WCAG formula, truncated, never rounded
          up.
        </p>
      </div>
      <ColourRoles groups={ROLE_GROUPS} />
    </section>
  );
}

const TYPE_SAMPLES: Record<string, string> = {
  display: 'Strip board',
  'heading-lg': 'Pending Rounds',
  'heading-md': 'Agent detail',
  'body-lg': 'Which versioning scheme should the new invoice routes use?',
  body: 'Pending · 2 Questions · waits 10 min, then applies recommended.',
  'body-sm': 'Received 09:38 from ~/src/ledger-api on feat/v2-routes.',
  label: 'Send Answer',
  mono: 'R-0142  06:52  7f3c9e21-48d0',
  'mono-sm': 'CLAUDE·api-refactor',
  'strip-header': 'Route versioning for /v2',
};

const TYPE_CLASS: Record<string, string> = {
  display: 'hh-display',
  'heading-lg': 'hh-heading-lg',
  'heading-md': 'hh-heading-md',
  'body-lg': 'hh-body-lg',
  body: 'hh-body',
  'body-sm': 'hh-body-sm',
  label: 'hh-label',
  mono: 'hh-mono',
  'mono-sm': 'hh-mono-sm',
  'strip-header': 'hh-strip-header',
};

export function TypographySection() {
  const typography = tokens.typography as Record<string, { $description: string; $value: { fontSize: string; lineHeight: number } }>;
  return (
    <section id="typography" className="hh-section" aria-labelledby="typography-title">
      <div className="hh-section-head">
        <h2 id="typography-title" className="hh-heading-lg">
          Typography
        </h2>
        <p className="hh-body hh-measure">
          Three faces. Schibsted Grotesk reads; Spline Sans Mono carries callsigns, ids, timers, and code with tabular numerals; Big Shoulders sets strip headers and display, condensed like
          a flight-strip block.
        </p>
      </div>
      <div>
        {Object.entries(typography).map(([name, token]) => (
          <div key={name} className="hh-type-specimen">
            <span className="hh-demo-label">
              type-{name} · {token.$value.fontSize} / {token.$value.lineHeight} · {token.$description}
            </span>
            <span className={TYPE_CLASS[name]}>{TYPE_SAMPLES[name]}</span>
          </div>
        ))}
      </div>
      <div className="hh-subsection">
        <h3 className="hh-heading-md">Tabular numerals</h3>
        <p className="hh-mono">
          06:52 · 11:11 · 00:08 · 412 pending
          <br />
          88:88 · 10:01 · 07:47 · 019 answered
        </p>
      </div>
    </section>
  );
}

const SPACE = Object.keys(tokens.primitive.space);
const RADII = Object.keys(tokens.primitive.radius);
const ELEVATIONS = Object.keys(tokens.elevation);

export function SpacingSection() {
  return (
    <section id="spacing" className="hh-section" aria-labelledby="spacing-title">
      <div className="hh-section-head">
        <h2 id="spacing-title" className="hh-heading-lg">
          Spacing, radius and elevation
        </h2>
        <p className="hh-body hh-measure">A quarter-rem rail. Machined radii. Shadows are decorative; the only glow is the live elevation, and it appears only on live state.</p>
      </div>
      <div className="hh-demo-grid">
        <div className="hh-demo">
          <h3 className="hh-heading-md">Space</h3>
          {SPACE.map((step) => (
            <div key={step} className="hh-scale-row">
              <code className="hh-mono-sm">space-{step}</code>
              <span className="hh-scale-bar" style={{ width: `var(--hh-space-${step})` } as CSSProperties} />
            </div>
          ))}
        </div>
        <div className="hh-demo">
          <h3 className="hh-heading-md">Radius</h3>
          <div className="hh-grid">
            {RADII.map((radius) => (
              <div key={radius} className="hh-radius-demo" style={{ borderRadius: `var(--hh-radius-${radius})` }}>
                <code className="hh-mono-sm">radius-{radius}</code>
              </div>
            ))}
          </div>
        </div>
        <div className="hh-demo">
          <h3 className="hh-heading-md">Elevation</h3>
          <div className="hh-grid">
            {ELEVATIONS.filter((name) => name !== 'live').map((name) => (
              <div key={name} className="hh-elevation-demo" style={{ boxShadow: `var(--hh-elevation-${name})` }}>
                <code className="hh-mono-sm">elevation-{name}</code>
              </div>
            ))}
            <div className="hh-elevation-demo">
              <ConnectionStatus state="live" detail="elevation-live" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const DENSITY_KNOBS = ['button-min-target', 'option-row-min-height', 'strip-min-height', 'density-inset', 'density-row-height', 'type-body-size'];

export function DensitySection() {
  return (
    <section id="density" className="hh-section" aria-labelledby="density-title">
      <div className="hh-section-head">
        <h2 id="density-title" className="hh-heading-lg">
          Density modes
        </h2>
        <p className="hh-body hh-measure">
          Compact tightens dense desktop regions (the triage list, the answered log) and keeps every target at or above the 24 CSS pixel floor. Glance is the phone mode: thumb-sized targets (48 CSS pixels), roomier rows, larger body
          text. Glance wins over any compact region inside it. Values below are read from each column.
        </p>
      </div>
      <div className="hh-density-compare">
        {(['', 'compact', 'glance'] as const).map((mode) => (
          <div key={mode || 'default'} className="hh-density-column" data-density={mode || undefined}>
            <h3 className="hh-heading-md">{mode ? `${mode[0].toUpperCase()}${mode.slice(1)}` : 'Default'}</h3>
            <TokenReadout names={DENSITY_KNOBS} />
            <ul className="hh-strip-bay-list">
              <ToggleStrip round={ROUNDS[2]} />
            </ul>
            <label className="hh-option" data-recommended="true">
              <span className="hh-kbd" aria-hidden="true">
                1
              </span>
              <input type="radio" name={`density-${mode || 'default'}`} defaultChecked />
              <span className="hh-option-text">
                <span className="hh-recommended">Recommended</span>
                <span>URL prefix /v2</span>
              </span>
            </label>
            <div className="hh-row">
              <button type="button" className="hh-button" data-variant="primary">
                Approve
              </button>
              <button type="button" className="hh-button" data-variant="destructive">
                Reject
              </button>
              <Callsign agent={AGENTS[4]} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
