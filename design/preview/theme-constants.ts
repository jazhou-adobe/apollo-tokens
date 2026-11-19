// Theme contract shared by the root layout, preview pages, and the client theme switcher.
// Keep this module free of token JSON so client bundles stay small; option lists are built server-side in preview/themes.ts.

export type ThemeGroup = 'Core' | 'Seeded worlds';

/** One colour option of a world. The default palette has id '' (no data-palette attribute). */
export type PaletteOption = { id: string; label: string };

export type ThemeOption = { value: string; label: string; group: ThemeGroup; idea: string; palettes: PaletteOption[] };

export const DEFAULT_THEME = 'splitbook-light';
export const THEME_STORAGE_KEY = 'splitbook-preview-theme';
/** JSON map of theme value → chosen palette id, so each world remembers its own colour option. */
export const PALETTE_STORAGE_KEY = 'splitbook-preview-palettes';
/**
 * Preview density choice, applied as data-density on <html>. Compact belongs to the Admin console; Deck sizing is the Deck
 * size knob on its own, so any theme or world can be seen at Capture sizes.
 */
export const DENSITY_STORAGE_KEY = 'splitbook-preview-density';
export const DENSITIES = [
  { value: '', label: 'Default' },
  { value: 'deck', label: 'Deck sizing (Capture)' },
  { value: 'compact', label: 'Compact (Admin console)' },
] as const;
export const DENSITY_VALUES: string[] = DENSITIES.map((density) => density.value).filter(Boolean);

export function readSavedPalettes(): Record<string, string> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PALETTE_STORAGE_KEY) ?? '{}');
    return saved && typeof saved === 'object' ? (saved as Record<string, string>) : {};
  } catch {
    return {};
  }
}
