import PATHS from '../hermes-icons.json';

// Inline line icons on a 24-unit grid. The path data lives in preview/hermes-icons.json (the file apps copy) and the stroke
// in .hh-icon (hermes-components.css). Decorative by default: every icon sits beside a text label.
export type IconName = keyof typeof PATHS;

export function Icon({ name, label }: { name: IconName; label?: string }) {
  return (
    <svg className="hh-icon" viewBox="0 0 24 24" aria-hidden={label ? undefined : true} role={label ? 'img' : undefined} aria-label={label} focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
