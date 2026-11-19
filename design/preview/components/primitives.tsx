import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

// Server-safe building blocks shared by the preview sections, blueprints, /specimen, and /tile.

export function Section({ id, kicker, title, lead, children }: { id: string; kicker?: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="sb-section" aria-labelledby={`${id}-title`}>
      <header className="sb-section-head">
        {kicker ? <span className="sb-kicker">{kicker}</span> : null}
        <h2 id={`${id}-title`} className="sb-heading-lg">
          {title}
        </h2>
        {lead ? <p className="sb-body-lg sb-measure">{lead}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function SubSection({ id, title, note, children }: { id: string; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="sb-subsection" aria-labelledby={`${id}-title`}>
      <div className="sb-specimen-label">
        <h3 id={`${id}-title`} className="sb-heading-md">
          {title}
        </h3>
        {note ? <span className="sb-body-sm sb-muted">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** Marks fixture data so nobody reads it as a real Swimmer, venue, or result. */
export function Illustrative() {
  return (
    <span className="sb-badge" data-tone="outline">
      <Icon name="info" /> Illustrative data
    </span>
  );
}

export type Tone = 'info' | 'success' | 'warning' | 'destructive' | 'improvement';

const TONE_ICON: Record<Tone, IconName> = { info: 'info', success: 'check', warning: 'warning', destructive: 'warning', improvement: 'arrow-up' };

export function Alert({ tone = 'info', title, children, role }: { tone?: Tone; title: string; children?: ReactNode; role?: 'status' | 'alert' }) {
  return (
    <div className="sb-alert" data-tone={tone} role={role}>
      <span className="sb-alert-mark">
        <Icon name={TONE_ICON[tone]} />
      </span>
      <div className="sb-alert-body">
        <strong className="sb-label">{title}</strong>
        {children ? <div className="sb-body-sm">{children}</div> : null}
      </div>
    </div>
  );
}

export function Progress({ label, percent, valueText }: { label: string; percent: number; valueText: string }) {
  return (
    <div className="sb-progress">
      <div className="sb-row" data-justify="between">
        <span className="sb-label">{label}</span>
        <span className="sb-body-sm">{valueText}</span>
      </div>
      <div className="sb-progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-valuetext={valueText}>
        <div className="sb-progress-fill" style={{ '--progress': `${percent}%` } as CSSProperties} />
      </div>
    </div>
  );
}

export function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className="sb-field">
      <label htmlFor={id} className="sb-label">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="sb-field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="sb-field-error">
          <Icon name="warning" /> {error}
        </p>
      ) : null}
    </div>
  );
}

/** A labelled figure: number on top in tabular display numerals, its meaning underneath. */
export function Figure({ value, label, tone }: { value: string; label: string; tone?: 'metric' | 'improvement' }) {
  return (
    <span className="sb-figure">
      <span className="sb-numeral" data-tone={tone}>
        {value}
      </span>
      <span className="sb-figure-label">{label}</span>
    </span>
  );
}

/** A blueprint frame: one page of the product, in miniature, with its name and the theme it is designed for. */
export function Frame({ id, title, note, children, flush }: { id: string; title: string; note?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <article id={id} className="sb-frame sb-subsection" aria-labelledby={`${id}-title`}>
      <div className="sb-frame-caption">
        <h3 id={`${id}-title`} className="sb-label">
          {title}
        </h3>
        {note ? <span className="sb-body-sm">{note}</span> : null}
      </div>
      {flush ? children : <div className="sb-frame-body">{children}</div>}
    </article>
  );
}
