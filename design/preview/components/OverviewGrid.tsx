'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { WorldPalette } from '../themes';

export type OverviewItem = { value: string; label: string; core: boolean; palettes: WorldPalette[] };

// Every world lists its colour options in the same order: the recommended default, two alternatives, then the original.
const POSITIONS = ['Recommended', 'Alternative A', 'Alternative B', 'Original'];

export function OverviewGrid({ items }: { items: OverviewItem[] }) {
  // One colour position for every world, with per-world picks layered on top.
  const [base, setBase] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const uniform = Object.values(picked).every((position) => position === base);
  const worlds = items.filter((item) => !item.core).length;

  return (
    <main className="hh-overview" aria-labelledby="overview-title" data-density="compact">
      <header className="hh-overview-head">
        <div className="hh-stack">
          <h1 id="overview-title" className="hh-heading-lg">
            Every Hermes theme
          </h1>
          <p className="hh-body-sm hh-muted">
            {items.length} themes, live: {items.length - worlds} core{worlds ? `, ${worlds} worlds` : '; no worlds registered yet'}. Select a theme to open the design system in it.
          </p>
        </div>
        {worlds ? (
          <fieldset className="hh-field">
            <legend className="hh-label">Colour for every world</legend>
            <div className="hh-segmented">
              {POSITIONS.map((label, position) => (
                <label key={label}>
                  <input
                    className="hh-visually-hidden"
                    type="radio"
                    name="overview-everywhere"
                    checked={uniform && base === position}
                    onChange={() => {
                      setBase(position);
                      setPicked({});
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        <nav className="hh-row" aria-label="Other previews">
          <a className="hh-link" href="/worlds">
            Worlds
          </a>
          <a className="hh-link" href="/design">
            Design system
          </a>
        </nav>
      </header>
      <ul className="hh-overview-grid">
        {items.map((item) => (
          <Tile
            key={item.value}
            item={item}
            position={Math.min(picked[item.value] ?? base, Math.max(item.palettes.length - 1, 0))}
            onPick={(theme, position) => setPicked((current) => ({ ...current, [theme]: position }))}
          />
        ))}
      </ul>
    </main>
  );
}

/**
 * A live /tile thumbnail scaled to its box. The frame is inert and hidden from assistive technology: it is a mouse shortcut
 * to `href`, and the caption beside it carries the real link.
 */
export function ThumbFrame({ query, href, title }: { query: URLSearchParams; href: string; title: string }) {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);

  // The thumbnail renders at the virtual viewport set by --hh-layout-thumbnail-*; scale it to the frame's width.
  useEffect(() => {
    const frame = frameRef.current;
    const iframe = iframeRef.current;
    if (!frame || !iframe) return;
    const measure = () => setScale(frame.clientWidth / iframe.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <a ref={frameRef} className="hh-overview-frame" href={href} tabIndex={-1} aria-hidden="true">
      <iframe ref={iframeRef} className="hh-overview-iframe" src={`/tile?${query}`} title={title} loading="lazy" inert style={{ '--overview-scale': scale } as CSSProperties} />
    </a>
  );
}

function Tile({ item, position, onPick }: { item: OverviewItem; position: number; onPick: (theme: string, position: number) => void }) {
  const palette = item.palettes[position];
  const query = new URLSearchParams({ theme: item.value });
  if (palette?.id) query.set('palette', palette.id);
  const name = palette ? `${item.label}, ${palette.label}` : `${item.label}, core theme`;

  return (
    <li className="hh-overview-tile">
      <ThumbFrame query={query} href={`/design?${query}`} title={`${name} thumbnail`} />
      <div className="hh-overview-caption">
        <a className="hh-link hh-label" href={`/design?${query}`}>
          {item.label}
          <span className="hh-visually-hidden">{palette ? `, ${palette.label} colours` : ', core theme'}: open the design system</span>
        </a>
        {item.palettes.length > 1 ? (
          <div className="hh-overview-chips" role="radiogroup" aria-label={`${item.label} colour options`}>
            {item.palettes.map((option, index) => (
              <label key={option.id || 'default'} className="hh-overview-chip" title={option.label}>
                <input className="hh-visually-hidden" type="radio" name={`overview-${item.value}`} checked={index === position} onChange={() => onPick(item.value, index)} />
                <span className="hh-palette-swatches" aria-hidden="true">
                  {option.swatches
                    .filter((swatch) => ['background', 'strip', 'pending'].includes(swatch.role))
                    .map((swatch) => (
                      <span key={swatch.role} style={{ background: swatch.value }} />
                    ))}
                </span>
                <span className="hh-visually-hidden">{option.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <span className="hh-mono-sm hh-muted">{item.core ? 'Core' : 'World'}</span>
        )}
      </div>
    </li>
  );
}
