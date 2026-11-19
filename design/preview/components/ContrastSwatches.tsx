'use client';

import { useEffect, useState } from 'react';

/**
 * One swatch. `fill` paints the chip; `ink` sets text on it; `mark` draws a bar in a boundary role. `measure` is the
 * [foreground, background] pair the read-out checks, at text (4.5:1, or the glare grade) or non-text (3:1) level.
 */
export type Swatch = { role: string; description: string; fill: string; ink?: string; mark?: string; measure?: [string, string]; kind?: 'text' | 'non-text' };
export type SwatchGroup = { label: string; swatches: Swatch[] };

function luminance(hex: string) {
  // The CSS pipeline may minify six-digit hex to three digits (and eight to four), so expand short forms first.
  const raw = hex.trim().replace('#', '');
  const digits = (raw.length <= 4 ? [...raw].map((digit) => digit + digit).join('') : raw).slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(digits)) return Number.NaN;
  const [r, g, b] = [0, 2, 4].map((index) => {
    const channel = parseInt(digits.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

const cssVar = (role: string) => `var(--sb-${role})`;

// The colour roles of whichever theme, world, or colour option is painted on <html>, each with its value and a live WCAG
// read-out. Ratios are truncated, never rounded up, like the validator; glare-grade themes hold text to a higher bar.
export function ContrastSwatches({ groups, glare }: { groups: SwatchGroup[]; glare: { minimum: number; themes: string[] } }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [theme, setTheme] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      const style = getComputedStyle(root);
      const next: Record<string, string> = {};
      for (const group of groups) for (const swatch of group.swatches) next[swatch.role] = style.getPropertyValue(`--sb-${swatch.role}`).trim();
      for (const group of groups) for (const swatch of group.swatches) for (const role of swatch.measure ?? []) next[role] = style.getPropertyValue(`--sb-${role}`).trim();
      setValues(next);
      setTheme(root.dataset.theme ?? '');
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-palette'] });
    return () => observer.disconnect();
  }, [groups]);

  const textMinimum = glare.themes.includes(theme) ? glare.minimum : 4.5;

  return (
    <div className="sb-stack">
      {groups.map((group) => (
        <div key={group.label} className="sb-stack" data-gap="tight">
          <h4 className="sb-label">{group.label}</h4>
          <ul className="sb-swatch-grid">
            {group.swatches.map((swatch) => {
              const [a, b] = swatch.measure ?? [];
              const measured = a && b && values[a] && values[b] ? ratio(values[a], values[b]) : Number.NaN;
              const minimum = swatch.kind === 'text' ? textMinimum : 3;
              const pass = measured >= minimum;
              return (
                <li key={swatch.role} className="sb-swatch">
                  <div className="sb-swatch-chip" style={{ background: cssVar(swatch.fill), color: swatch.ink ? cssVar(swatch.ink) : undefined }}>
                    {swatch.ink ? <strong className="sb-numeral">Aa 1:18.42</strong> : null}
                    {swatch.mark ? <span className="sb-scale-bar" style={{ background: cssVar(swatch.mark), inlineSize: '100%' }} aria-hidden="true" /> : null}
                  </div>
                  <div className="sb-swatch-meta">
                    <code>--sb-{swatch.role}</code>
                    <span className="sb-body-sm sb-muted">{values[swatch.role] || '…'}</span>
                    {swatch.measure ? (
                      <span className="sb-ratio sb-body-sm" data-pass={pass ? 'true' : 'false'}>
                        {Number.isNaN(measured) ? '–' : (Math.floor(measured * 100) / 100).toFixed(2)}:1, {a} {swatch.kind === 'text' ? 'on' : 'against'} {b}:{' '}
                        {pass ? 'passes' : 'below'} {minimum}:1
                      </span>
                    ) : (
                      <span className="sb-body-sm">Decorative: no contrast gate.</span>
                    )}
                    <span className="sb-body-sm">{swatch.description}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
