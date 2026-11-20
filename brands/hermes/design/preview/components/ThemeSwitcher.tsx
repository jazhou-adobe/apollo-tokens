'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_THEME,
  DENSITIES,
  DENSITY_STORAGE_KEY,
  PALETTE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  readSavedPalettes,
  type DensityId,
  type ThemeOption,
} from '../theme-constants';

/** Theme, colour option, and density for the whole page. Choices persist in localStorage; ?theme= previews do not. */
export function ThemeSwitcher({ options }: { options: ThemeOption[] }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [palette, setPalette] = useState('');
  const [density, setDensity] = useState<DensityId>('');
  const isTheme = (value: string | null | undefined): value is string => options.some((option) => option.value === value);

  // The root attributes are set before paint by the inline script in app/layout.tsx; sync state after mount.
  useEffect(() => {
    const root = document.documentElement;
    if (isTheme(root.dataset.theme)) setTheme(root.dataset.theme);
    setPalette(root.dataset.palette ?? '');
    setDensity((DENSITIES.find((option) => option.id === root.dataset.density)?.id ?? '') as DensityId);
  }, [options]);

  const active = options.find((option) => option.value === theme);
  const palettes = active?.palettes ?? [];

  function paint(nextTheme: string, nextPalette: string) {
    const root = document.documentElement;
    root.dataset.theme = nextTheme;
    if (nextPalette) root.dataset.palette = nextPalette;
    else delete root.dataset.palette;
    setTheme(nextTheme);
    setPalette(nextPalette);
  }

  function applyTheme(next: string) {
    const safe = isTheme(next) ? next : DEFAULT_THEME;
    const valid = options.find((option) => option.value === safe)?.palettes ?? [];
    const saved = readSavedPalettes()[safe] ?? '';
    paint(safe, valid.some((option) => option.id === saved) ? saved : '');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, safe);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }

  function applyPalette(next: string) {
    const safe = palettes.some((option) => option.id === next) ? next : '';
    paint(theme, safe);
    try {
      const saved = readSavedPalettes();
      if (safe) saved[theme] = safe;
      else delete saved[theme];
      localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Storage can be unavailable; the colour option still applies for this visit.
    }
  }

  function applyDensity(next: DensityId) {
    const root = document.documentElement;
    if (next) root.dataset.density = next;
    else delete root.dataset.density;
    setDensity(next);
    try {
      if (next) localStorage.setItem(DENSITY_STORAGE_KEY, next);
      else localStorage.removeItem(DENSITY_STORAGE_KEY);
    } catch {
      // Storage can be unavailable; the density still applies for this visit.
    }
  }

  const groups = [...new Set(options.map((option) => option.group))];

  return (
    <div className="hh-switchers">
      <div className="hh-field">
        <label htmlFor="theme-select" className="hh-label">
          Theme
        </label>
        <select id="theme-select" className="hh-select" value={theme} aria-describedby="theme-idea" onChange={(event) => applyTheme(event.target.value)}>
          {groups.map((group) => (
            <optgroup key={group} label={group}>
              {options
                .filter((option) => option.group === group)
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <p id="theme-idea" className="hh-hint">
          {active?.idea}
        </p>
      </div>
      {palettes.length > 1 ? (
        <div className="hh-field">
          <label htmlFor="palette-select" className="hh-label">
            Colour
          </label>
          <select id="palette-select" className="hh-select" value={palette} onChange={(event) => applyPalette(event.target.value)}>
            {palettes.map((option) => (
              <option key={option.id || 'default'} value={option.id}>
                {option.id ? option.label : `${option.label} (recommended)`}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <fieldset className="hh-field">
        <legend className="hh-label">Density</legend>
        <div className="hh-segmented">
          {DENSITIES.map((option) => (
            <label key={option.id || 'default'} title={option.hint}>
              <input className="hh-visually-hidden" type="radio" name="density" checked={density === option.id} onChange={() => applyDensity(option.id)} />
              {option.label}
            </label>
          ))}
        </div>
        <p className="hh-hint">{DENSITIES.find((option) => option.id === density)?.hint}</p>
      </fieldset>
    </div>
  );
}
