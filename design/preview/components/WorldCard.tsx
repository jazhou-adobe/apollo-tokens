'use client';

import { useRef, useState } from 'react';
import { withBase } from '../paths';
import type { World } from '../themes';

// One /worlds gallery card, led by the world itself: a name and one sentence, then a live Capture frame opened mid-Swim
// at Deck sizing, with a control that drives that frame's real Tap Pad. The signature and colour options follow.
export function WorldCard({ world }: { world: World }) {
  const [paletteId, setPaletteId] = useState('');
  const [tapped, setTapped] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const palette = world.palettes.find((option) => option.id === paletteId) ?? world.palettes[0];
  const query = new URLSearchParams({ theme: world.value });
  if (paletteId) query.set('palette', paletteId);
  const frameQuery = new URLSearchParams(query);
  frameQuery.set('density', 'deck');
  frameQuery.set('demo', 'midswim');
  const summary = /^[^.]*\./.exec(world.idea)?.[0] ?? world.idea;

  // The frame is same-origin, so this presses the frame's own Wall key: the world's signature runs on the real controller.
  function tryWallTap() {
    const wall = frameRef.current?.contentDocument?.querySelector<HTMLButtonElement>('[data-tap="wall"]');
    if (!wall || wall.disabled) return;
    wall.click();
    setTapped((count) => count + 1);
  }

  return (
    <li className="sb-world-card">
      <div className="sb-world-card-lead">
        <h2 className="sb-heading-md">{world.label}</h2>
        <p className="sb-body-sm">{summary}</p>
      </div>
      <iframe ref={frameRef} className="sb-world-frame" src={withBase(`/specimen?${frameQuery}`)} title={`${world.label}, ${palette.label}: live Capture, illustrative Swim under way`} loading="lazy" />
      <div className="sb-row">
        <button type="button" className="sb-button" onClick={tryWallTap}>
          Try wall tap
        </button>
        <span className="sb-body-sm sb-muted" role="status">
          {tapped ? `Wall tapped ${tapped} ${tapped === 1 ? 'time' : 'times'} in the frame.` : 'Presses the Wall key in the frame above.'}
        </span>
      </div>
      <div className="sb-stack">
        <p className="sb-body-sm">
          <strong>Signature:</strong> {world.signature}
        </p>
        {world.palettes.length > 1 && (
          <fieldset className="sb-fieldset">
            <legend className="sb-label">Colour</legend>
            {world.palettes.map((option) => (
              <label key={option.id || 'default'} className="sb-palette-option">
                <input type="radio" name={`palette-${world.slug}`} checked={option.id === paletteId} onChange={() => setPaletteId(option.id)} />
                <span className="sb-swatch-strip" aria-hidden="true">
                  {option.swatches.map((swatch) => (
                    <span key={swatch.role} style={{ background: swatch.value }} />
                  ))}
                </span>
                <span className="sb-body-sm">{option.id ? option.label : `${option.label} (recommended)`}</span>
              </label>
            ))}
          </fieldset>
        )}
        <p className="sb-body-sm sb-muted">
          World {world.order} · {palette.label} · {palette.colorScheme} theme
        </p>
      </div>
      <div className="sb-row">
        <a className="sb-button" data-variant="secondary" href={withBase(`/design?${query}`)}>
          Open full system
        </a>
        <a className="sb-button" data-variant="secondary" href={withBase(`/specimen?${frameQuery}`)}>
          Open specimen
        </a>
      </div>
    </li>
  );
}
