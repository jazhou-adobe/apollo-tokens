import { Icon } from './Icon';
import { Figure } from './primitives';

// Trends and rows: hook-free, server-rendered. Progress is a plain line or a clock dial, never concentric rings.

type Point = { label: string; value: number };

/**
 * Metric trend: one labelled line over time. Every point prints its value, the axis names its unit, and a sentence says
 * what changed, so the chart never relies on colour or shape alone. Green marks the latest point only when it is a gain.
 */
export function TrendLine({ title, unit, points, better, summary }: { title: string; unit: string; points: Point[]; better: 'higher' | 'lower'; summary: string }) {
  const width = 320;
  const height = 160;
  const pad = { top: 20, right: 16, bottom: 28, left: 16 };
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (index: number) => pad.left + (index * (width - pad.left - pad.right)) / Math.max(points.length - 1, 1);
  const y = (value: number) => pad.top + ((max - value) * (height - pad.top - pad.bottom)) / span;
  const path = points.map((point, index) => `${index ? 'L' : 'M'}${x(index)} ${y(point.value)}`).join(' ');
  const first = values[0];
  const last = values.at(-1) ?? first;
  const gain = better === 'higher' ? last > first : last < first;

  return (
    <figure className="sb-trend-line">
      <figcaption className="sb-stack" data-gap="tight">
        <strong className="sb-label">{title}</strong>
        <span className="sb-body-sm sb-muted">
          {unit} · {better === 'higher' ? 'higher is better' : 'lower is better'}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${points.map((point) => `${point.label} ${point.value}`).join(', ')}. ${summary}`}>
        {[0, 0.5, 1].map((fraction) => (
          <line key={fraction} className="sb-trend-grid" x1={pad.left} x2={width - pad.right} y1={pad.top + fraction * (height - pad.top - pad.bottom)} y2={pad.top + fraction * (height - pad.top - pad.bottom)} vectorEffect="non-scaling-stroke" />
        ))}
        <path className="sb-trend-path" d={path} vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => (
          <g key={point.label}>
            <circle className="sb-trend-point" data-gain={index === points.length - 1 && gain ? 'true' : undefined} cx={x(index)} cy={y(point.value)} r={4} vectorEffect="non-scaling-stroke" />
            <text className="sb-trend-value-label" x={x(index)} y={y(point.value) - 9} textAnchor="middle" fontSize={12}>
              {point.value.toFixed(1)}
            </text>
            <text className="sb-trend-axis-label" x={x(index)} y={height - 6} textAnchor="middle" fontSize={11}>
              {point.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="sb-row">
        {gain ? (
          <span className="sb-badge" data-tone="improvement">
            <Icon name="arrow-up" /> Better
          </span>
        ) : (
          <span className="sb-badge">Holding steady</span>
        )}
        <span>{summary}</span>
      </p>
    </figure>
  );
}

/**
 * Technique trend: a pace-clock dial. The 1–5 rating runs once round the face; the dashed "then" hand and the solid
 * "now" hand sit on the same axis, and both values are printed underneath.
 */
export function TrendDial({ label, then, now, thenLabel, nowLabel }: { label: string; then: number; now: number; thenLabel: string; nowLabel: string }) {
  const centre = 100;
  const angle = (rating: number) => ((rating - 1) / 5) * 2 * Math.PI - Math.PI / 2;
  const hand = (rating: number, length: number) => ({ x2: centre + Math.cos(angle(rating)) * length, y2: centre + Math.sin(angle(rating)) * length });
  const gain = now > then;
  return (
    <figure className="sb-trend-dial">
      <svg viewBox="0 0 200 200" role="img" aria-label={`${label}: ${thenLabel} ${then.toFixed(1)}, ${nowLabel} ${now.toFixed(1)}, out of 5.`}>
        <circle className="sb-dial-face" cx={centre} cy={centre} r={92} />
        {Array.from({ length: 60 }, (_, index) => {
          const major = index % 12 === 0;
          const theta = (index / 60) * 2 * Math.PI - Math.PI / 2;
          const inner = major ? 72 : 80;
          return (
            <line
              key={index}
              className="sb-dial-tick"
              data-major={major ? 'true' : undefined}
              x1={centre + Math.cos(theta) * inner}
              y1={centre + Math.sin(theta) * inner}
              x2={centre + Math.cos(theta) * 86}
              y2={centre + Math.sin(theta) * 86}
            />
          );
        })}
        {[1, 2, 3, 4, 5].map((rating) => (
          <text key={rating} className="sb-dial-number" x={centre + Math.cos(angle(rating)) * 58} y={centre + Math.sin(angle(rating)) * 58} textAnchor="middle" dominantBaseline="central">
            {rating}
          </text>
        ))}
        <line className="sb-dial-hand" data-hand="then" x1={centre} y1={centre} {...hand(then, 64)} />
        <line className="sb-dial-hand" data-hand={gain ? 'now' : undefined} x1={centre} y1={centre} {...hand(now, 76)} />
        <circle className="sb-dial-hub" cx={centre} cy={centre} r={6} />
      </svg>
      <figcaption className="sb-stack" data-gap="tight">
        <strong className="sb-label">{label}</strong>
        <ul className="sb-legend">
          <li>
            <span className="sb-legend-key" data-hand="then" aria-hidden="true" />
            {thenLabel} {then.toFixed(1)}
          </li>
          <li>
            <span className="sb-legend-key" data-hand={gain ? 'now' : undefined} aria-hidden="true" />
            {nowLabel} {now.toFixed(1)}
          </li>
        </ul>
      </figcaption>
    </figure>
  );
}

type SwimRowData = { title: string; detail: string; time: string; strokes: string; kicks: string; rating: number; fault?: string };

/** A Swim in a list: counts lead, the time is shown as the result, a Fault is flagged with its words. */
export function SwimRow({ swim, href }: { swim: SwimRowData; href?: string }) {
  const content = (
    <>
      <span className="sb-list-row-main">
        <span className="sb-swim-row-title">{swim.title}</span>
        <span className="sb-list-row-meta">
          <span>{swim.detail}</span>
          <span>Head position {swim.rating} of 5</span>
          {swim.fault ? (
            <span className="sb-badge" data-tone="fault">
              <Icon name="flag" /> Noted: {swim.fault}
            </span>
          ) : null}
        </span>
      </span>
      <span className="sb-swim-row-figures">
        <Figure value={swim.kicks} label="kicks per wall" tone="metric" />
        <Figure value={swim.strokes} label="strokes per Length" />
        <Figure value={swim.time} label="time" />
      </span>
    </>
  );
  return href ? (
    <a className="sb-swim-row" href={href}>
      {content}
    </a>
  ) : (
    <div className="sb-swim-row">{content}</div>
  );
}

export function SessionRow({ session, href }: { session: { day: string; month: string; title: string; detail: string; focus: string }; href?: string }) {
  return (
    <a className="sb-session-row" href={href ?? '#bp-history'}>
      <span className="sb-session-date">
        <span className="sb-numeral">{session.day}</span>
        <span className="sb-body-sm">{session.month}</span>
      </span>
      <span className="sb-list-row-main">
        <span className="sb-session-row-title">{session.title}</span>
        <span className="sb-list-row-meta">
          <span>{session.detail}</span>
          <span>Focus metric: {session.focus}</span>
        </span>
      </span>
      <Icon name="chevron-right" />
    </a>
  );
}

/** A Set: Swims done as one block, bracketed by an ink rule with the prescription and a summary above. */
export function SetGroup({ title, summary, swims }: { title: string; summary: string; swims: SwimRowData[] }) {
  return (
    <section className="sb-set-group" aria-label={`Set: ${title}`}>
      <div className="sb-set-group-head">
        <strong className="sb-label">Set · {title}</strong>
        <span className="sb-body-sm sb-muted">{summary}</span>
      </div>
      <ul className="sb-list">
        {swims.map((swim, index) => (
          <li key={index}>
            <SwimRow swim={swim} />
          </li>
        ))}
      </ul>
    </section>
  );
}
