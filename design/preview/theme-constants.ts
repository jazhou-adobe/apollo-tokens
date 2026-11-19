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
/** Preview-only density choice; compact belongs to the Admin console, so the switch exists to inspect it. */
export const DENSITY_STORAGE_KEY = 'splitbook-preview-density';
export const DENSITIES = [
  { value: '', label: 'Default' },
  { value: 'compact', label: 'Compact (Admin console)' },
] as const;

export function readSavedPalettes(): Record<string, string> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PALETTE_STORAGE_KEY) ?? '{}');
    return saved && typeof saved === 'object' ? (saved as Record<string, string>) : {};
  } catch {
    return {};
  }
}
