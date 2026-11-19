// Theme contract shared by the root layout, preview pages, and the client switchers.
// Keep this module free of token JSON and node APIs so client bundles stay small; option lists are built server-side in
// preview/themes.ts.

export type ThemeGroup = 'Core' | 'Worlds';

/** One colour option of a world. The recommended default has id '' (it lives in the theme block, so no data-palette). */
export type PaletteOption = { id: string; label: string };

export type ThemeOption = { value: string; label: string; group: ThemeGroup; idea: string; palettes: PaletteOption[] };

export const DEFAULT_THEME = 'hermes-dark';
export const THEME_STORAGE_KEY = 'hermes-preview-theme';
/** JSON map of theme value → chosen palette id, so each world remembers its own colour option. */
export const PALETTE_STORAGE_KEY = 'hermes-preview-palettes';
export const DENSITY_STORAGE_KEY = 'hermes-preview-density';

/** Density modes on <html data-density>. '' is the desktop default (no attribute). */
export const DENSITIES = [
  { id: '', label: 'Default', hint: 'Desktop default' },
  { id: 'compact', label: 'Compact', hint: 'Dense triage lists' },
  { id: 'glance', label: 'Glance', hint: 'Phone: thumb-sized targets' },
] as const;

export type DensityId = (typeof DENSITIES)[number]['id'];

export function readSavedPalettes(): Record<string, string> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PALETTE_STORAGE_KEY) ?? '{}');
    return saved && typeof saved === 'object' ? (saved as Record<string, string>) : {};
  } catch {
    return {};
  }
}
