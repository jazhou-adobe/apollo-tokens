'use client';

import { useEffect, useRef, useState } from 'react';

export type RolePair = { foreground: string; background: string; minimum: number; kind: 'text' | 'non-text' };
export type RoleGroup = { label: string; note: string; roles: { role: string; description: string; pairs: RolePair[]; foreground?: string }[] };

function luminance(hex: string) {
  let digits = hex.trim().replace('#', '');
  if (digits.length === 3) digits = [...digits].map((digit) => digit + digit).join('');
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(digits)) return Number.NaN;
  const [r, g, b] = [0, 2, 4].map((index) => {
    const channel = parseInt(digits.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast, truncated to two decimals (never rounded up), as the validator reports it. */
function ratio(a: string, b: string) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.floor(((high + 0.05) / (low + 0.05)) * 100) / 100;
}

/**
 * Every colour role in the active theme, world, or colour option, with live contrast readouts for the pairs the validator
 * gates. Values are read from the painted <html>, so the readouts follow the theme switcher.
 */
export function ColourRoles({ groups }: { groups: RoleGroup[] }) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      const next: Record<string, string> = {};
      for (const group of groups) {
        for (const { role, pairs } of group.roles) {
          for (const name of [role, ...pairs.flatMap((pair) => [pair.foreground, pair.background])]) next[name] = style.getPropertyValue(`--hh-${name}`).trim();
        }
      }
      setValues(next);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
    return () => observer.disconnect();
  }, [groups]);

  return (
    <div className="hh-stack">
      {groups.map((group) => (
        <div key={group.label} className="hh-subsection">
          <h3 className="hh-heading-md">{group.label}</h3>
          <p className="hh-body-sm hh-muted hh-measure">{group.note}</p>
          <ul className="hh-swatch-grid">
            {group.roles.map(({ role, description, pairs, foreground }) => (
              <li key={role} className="hh-swatch">
                <span className="hh-swatch-chip" style={{ background: `var(--hh-${role})`, color: foreground ? `var(--hh-${foreground})` : undefined }}>
                  {foreground ? 'Aa 09:42' : null}
                </span>
                <span className="hh-swatch-meta">
                  <code>--hh-{role}</code>
                  <span className="hh-mono-sm hh-muted">{values[role] || '…'}</span>
                  <span>{description}</span>
                  {pairs.map((pair) => {
                    const measured = values[pair.foreground] && values[pair.background] ? ratio(values[pair.foreground], values[pair.background]) : Number.NaN;
                    const pass = measured >= pair.minimum;
                    return (
                      <span key={`${pair.foreground}-${pair.background}`} className="hh-ratio">
                        {Number.isNaN(measured) ? '…' : `${measured.toFixed(2)}:1`} {pass ? 'Pass' : Number.isNaN(measured) ? '' : 'Fail'} · {pair.foreground === role ? '' : `${pair.foreground} `}
                        {pair.kind === 'text' ? 'on' : 'vs'} {pair.background} ≥ {pair.minimum}
                      </span>
                    );
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Reads the resolved value of token variables at this element, so density columns show their real numbers. */
export function TokenReadout({ names }: { names: string[] }) {
  const ref = useRef<HTMLDListElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const read = () => {
      const probe = document.createElement('div');
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      element.appendChild(probe);
      const next: Record<string, string> = {};
      for (const name of names) {
        probe.style.width = `var(--hh-${name})`;
        next[name] = getComputedStyle(probe).width;
      }
      probe.remove();
      setValues(next);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-density', 'data-theme'] });
    return () => observer.disconnect();
  }, [names]);

  return (
    <dl ref={ref} className="hh-dl hh-mono-sm">
      {names.map((name) => (
        <div key={name} style={{ display: 'contents' }}>
          <dt>{name}</dt>
          <dd>{values[name] ?? '…'}</dd>
        </div>
      ))}
    </dl>
  );
}
