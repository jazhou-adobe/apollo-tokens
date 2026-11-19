'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { withBase } from '../paths';
import type { WorldPalette } from '../themes';

export type OverviewItem = { value: string; label: string; core: boolean; palettes: WorldPalette[] };

// Every world lists its colour options in the same order: the recommended default, two alternatives, then the original.
const POSITIONS = ['Recommended', 'Alternative A', 'Alternative B', 'Original'];

export function OverviewGrid({ items, worldCount }: { items: OverviewItem[]; worldCount: number }) {
  const [position, setPosition] = useState(0);
  return (
    <main className="sb-overview" aria-labelledby="overview-title">
      <header className="sb-overview-head">
        <div className="sb-stack" data-gap="tight">
          <h1 id="overview-title" className="sb-heading-lg">
            Every Splitbook theme
          </h1>
          <p className="sb-body-sm sb-muted sb-measure">
            {items.length} themes, live: {items.length - worldCount} core and {worldCount} seeded worlds. Select a theme to open the design system in it.
          </p>
        </div>
        {worldCount ? (
          <fieldset className="sb-row sb-fieldset">
            <legend className="sb-label">Colour for every world</legend>
            {POSITIONS.map((label, index) => (
              <label key={label} className="sb-radio">
                <input type="radio" name="overview-colour" checked={position === index} onChange={() => setPosition(index)} /> {label}
              </label>
            ))}
          </fieldset>
        ) : null}
        <nav className="sb-row" aria-label="Other previews">
          <a className="sb-link" href={withBase('/worlds')}>
            World gallery
          </a>
          <a className="sb-link" href={withBase('/design')}>
            Design system
          </a>
        </nav>
      </header>
      <ul className="sb-overview-grid" data-count={items.length > 2 ? 'many' : 'few'}>
        {items.map((item) => (
          <Tile key={item.value} item={item} palette={item.palettes[Math.min(position, Math.max(item.palettes.length - 1, 0))]} />
        ))}
      </ul>
    </main>
  );
}

function Tile({ item, palette }: { item: OverviewItem; palette?: WorldPalette }) {
  const frameRef = useRef<HTMLAnchorElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);

  // The thumbnail renders at the virtual viewport set by --sb-layout-thumbnail-*; scale it to the tile's width.
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

  const query = new URLSearchParams({ theme: item.value });
  if (palette?.id) query.set('palette', palette.id);
  const name = palette ? `${item.label}, ${palette.label}` : `${item.label}, core theme`;

  return (
    <li className="sb-overview-tile">
      {/* Mouse shortcut to the caption link's target; the frame itself is inert, so keyboard and screen readers use the caption. */}
      <a ref={frameRef} className="sb-overview-frame" href={withBase(`/design?${query}`)} tabIndex={-1} aria-hidden="true">
        <iframe ref={iframeRef} className="sb-overview-iframe" src={withBase(`/tile?${query}`)} title={`${name} thumbnail`} inert style={{ '--overview-scale': scale } as CSSProperties} />
      </a>
      <div className="sb-overview-caption">
        <a className="sb-link sb-label" href={withBase(`/design?${query}`)}>
          {item.label}
          <span className="sb-visually-hidden">{palette ? `, ${palette.label} colours` : ', core theme'}: open the design system</span>
        </a>
        {palette ? (
          <span className="sb-swatch-strip" aria-hidden="true">
            {palette.swatches.map((swatch) => (
              <span key={swatch.role} style={{ background: swatch.value }} />
            ))}
          </span>
        ) : (
          <span className="sb-body-sm sb-muted">Core theme</span>
        )}
      </div>
    </li>
  );
}
