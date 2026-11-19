'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_THEME, DENSITIES, DENSITY_STORAGE_KEY, PALETTE_STORAGE_KEY, THEME_STORAGE_KEY, readSavedPalettes, type ThemeOption } from '../theme-constants';

function store(key: string, value: string | null) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies for this visit.
  }
}

// Theme menu, colour menu (worlds only), and density switch. The root attributes are set before paint by the inline
// script in app/layout.tsx; this component syncs to them after mount and writes them back on change.
export function ThemeSwitcher({ options }: { options: ThemeOption[] }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [palette, setPalette] = useState('');
  const [density, setDensity] = useState('');
  const isTheme = (value: string | null | undefined): value is string => options.some((option) => option.value === value);

  useEffect(() => {
    const root = document.documentElement;
    if (isTheme(root.dataset.theme)) setTheme(root.dataset.theme);
    setPalette(root.dataset.palette ?? '');
    setDensity(root.dataset.density ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    store(THEME_STORAGE_KEY, safe);
  }

  function applyPalette(next: string) {
    const safe = palettes.some((option) => option.id === next) ? next : '';
    paint(theme, safe);
    const saved = readSavedPalettes();
    if (safe) saved[theme] = safe;
    else delete saved[theme];
    store(PALETTE_STORAGE_KEY, JSON.stringify(saved));
  }

  function applyDensity(next: string) {
    const root = document.documentElement;
    if (next === 'compact') root.dataset.density = next;
    else delete root.dataset.density;
    setDensity(next === 'compact' ? next : '');
    store(DENSITY_STORAGE_KEY, next === 'compact' ? next : null);
  }

  const groups = [...new Set(options.map((option) => option.group))];

  return (
    <div className="sb-stack" data-gap="tight">
      <div className="sb-field">
        <label htmlFor="theme-select" className="sb-label">
          Theme
        </label>
        <select id="theme-select" className="sb-select" value={theme} aria-describedby="theme-idea" onChange={(event) => applyTheme(event.target.value)}>
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
        <p id="theme-idea" className="sb-field-hint">
          {active?.idea}
        </p>
      </div>
      {palettes.length > 1 && (
        <div className="sb-field">
          <label htmlFor="palette-select" className="sb-label">
            Colour
          </label>
          <select id="palette-select" className="sb-select" value={palette} onChange={(event) => applyPalette(event.target.value)}>
            {palettes.map((option) => (
              <option key={option.id || 'default'} value={option.id}>
                {option.id ? option.label : `${option.label} (recommended)`}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="sb-field">
        <label htmlFor="density-select" className="sb-label">
          Density
        </label>
        <select id="density-select" className="sb-select" value={density} aria-describedby="density-hint" onChange={(event) => applyDensity(event.target.value)}>
          {DENSITIES.map((option) => (
            <option key={option.value || 'default'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p id="density-hint" className="sb-field-hint">
          Compact belongs to the Admin console only. Switch it here to inspect it across the page.
        </p>
      </div>
    </div>
  );
}
