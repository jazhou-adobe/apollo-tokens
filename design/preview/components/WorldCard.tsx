'use client';

import { useState } from 'react';
import type { World } from '../themes';
import { withBase } from '../paths';
import { ThumbFrame } from './OverviewGrid';

// One /worlds card. It leads with the live specimen, then a one-line identity and a button that plays the world's
// signature (the specimen answers its first Round with the recommendations and sends it). Colour options switch the frame
// in place; "Compare all colours" shows the four side by side.
export function WorldCard({ world }: { world: World }) {
  const [paletteId, setPaletteId] = useState('');
  const [run, setRun] = useState(0);
  const palette = world.palettes.find((option) => option.id === paletteId) ?? world.palettes[0];
  const query = new URLSearchParams({ theme: world.value });
  if (paletteId) query.set('palette', paletteId);
  const frameQuery = new URLSearchParams(query);
  frameQuery.set('view', 'round');
  if (run) {
    frameQuery.set('demo', 'send');
    frameQuery.set('run', String(run));
  }
  const identity = world.idea.split(/(?<=\.)\s/)[0];
  const signatureId = `${world.slug}-signature`;

  return (
    <li className="hh-world-card">
      <iframe className="hh-world-frame" src={withBase(`/specimen?${frameQuery}`)} title={`${world.label}, ${palette.label}: live triage specimen`} loading="lazy" />
      <div className="hh-stack">
        <h2 className="hh-heading-lg">{world.label}</h2>
        <p className="hh-body-sm">{identity}</p>
        <div className="hh-row">
          <button type="button" className="hh-button" data-variant="primary" aria-describedby={signatureId} onClick={() => setRun(run + 1)}>
            Play signature
          </button>
          <a className="hh-button" href={withBase(`/design?${query}`)}>
            Open full system
          </a>
        </div>
        <p id={signatureId} className="hh-visually-hidden">
          {world.signature}
        </p>
        {world.palettes.length > 1 ? (
          <fieldset className="hh-field">
            <legend className="hh-label">Colour · {palette.label}</legend>
            <div className="hh-overview-chips">
              {world.palettes.map((option) => (
                <label key={option.id || 'default'} className="hh-overview-chip" title={option.label}>
                  <input className="hh-visually-hidden" type="radio" name={`palette-${world.slug}`} checked={option.id === paletteId} onChange={() => setPaletteId(option.id)} />
                  <span className="hh-palette-swatches" aria-hidden="true">
                    {option.swatches
                      .filter((swatch) => ['background', 'strip', 'pending'].includes(swatch.role))
                      .map((swatch) => (
                        <span key={swatch.role} style={{ background: swatch.value }} />
                      ))}
                  </span>
                  <span className="hh-visually-hidden">{option.id ? option.label : `${option.label} (recommended)`}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        <details className="hh-world-compare">
          <summary className="hh-notes-summary">Compare all colours</summary>
          <ul className="hh-world-compare-grid">
            {world.palettes.map((option) => {
              const optionQuery = new URLSearchParams({ theme: world.value });
              if (option.id) optionQuery.set('palette', option.id);
              return (
                <li key={option.id || 'default'} className="hh-overview-tile">
                  <ThumbFrame query={optionQuery} href={`/design?${optionQuery}`} title={`${world.label}, ${option.label} thumbnail`} />
                  <a className="hh-link hh-body-sm" href={withBase(`/design?${optionQuery}`)}>
                    {option.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </details>
      </div>
    </li>
  );
}
