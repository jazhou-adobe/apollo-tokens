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
    <li className="hh-world-card">
      <div className="hh-stack">
        <h2 className="hh-heading-lg">{world.label}</h2>
        <p className="hh-mono-sm hh-muted">
          World {world.order} · {palette.label} · {palette.colorScheme}
        </p>
        <p className="hh-body-sm">{world.idea}</p>
        <p className="hh-body-sm">
          <strong>Signature:</strong> {world.signature}
        </p>
        {world.palettes.length > 1 ? (
          <fieldset className="hh-field">
            <legend className="hh-label">Colour</legend>
            <div className="hh-palette-options">
              {world.palettes.map((option) => (
                <label key={option.id || 'default'} className="hh-palette-option">
                  <input type="radio" name={`palette-${world.slug}`} checked={option.id === paletteId} onChange={() => setPaletteId(option.id)} />
                  <span className="hh-palette-swatches" aria-hidden="true">
                    {option.swatches.map((swatch) => (
                      <span key={swatch.role} style={{ background: swatch.value }} />
                    ))}
                  </span>
                  <span className="hh-body-sm">{option.id ? option.label : `${option.label} (recommended)`}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>
      <iframe className="hh-world-frame" src={`/specimen?${query}`} title={`${world.label}, ${palette.label}: live specimen`} loading="lazy" />
      <div className="hh-row">
        <a className="hh-button" data-variant="primary" href={`/design?${query}`}>
          Open full system
        </a>
        <a className="hh-button" href={`/specimen?${query}`}>
          Open specimen
        </a>
      </div>
    </li>
  );
}
