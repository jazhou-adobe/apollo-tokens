'use client';

import { useState } from 'react';
import type { World } from '../themes';

// One /worlds gallery card. Choosing a colour option re-points the live frame and both links at that palette.
export function WorldCard({ world }: { world: World }) {
  const [paletteId, setPaletteId] = useState('');
  const palette = world.palettes.find((option) => option.id === paletteId) ?? world.palettes[0];
  const query = new URLSearchParams({ theme: world.value });
  if (paletteId) query.set('palette', paletteId);

  return (
    <li className="sb-world-card">
      <div className="sb-stack">
        <h2 className="sb-heading-md">{world.label}</h2>
        <p className="sb-body-sm sb-muted">
          World {world.order} · {palette.label} · {palette.colorScheme} theme
        </p>
        <p className="sb-body-sm">{world.idea}</p>
        <p className="sb-body-sm">
          <strong>Signature:</strong> {world.signature}
        </p>
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
      </div>
      <iframe className="sb-world-frame" src={`/specimen?${query}`} title={`${world.label}, ${palette.label}: live specimen`} loading="lazy" />
      <div className="sb-row">
        <a className="sb-button" href={`/design?${query}`}>
          Open full system
        </a>
        <a className="sb-button" data-variant="secondary" href={`/specimen?${query}`}>
          Open specimen
        </a>
      </div>
    </li>
  );
}
