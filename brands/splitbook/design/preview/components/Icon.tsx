// Line icons on a 24-unit grid, drawn in currentColor. Decorative by default (aria-hidden); pass `label` when the icon is
// the only content of its control.

export type IconName =
  | 'plus'
  | 'minus'
  | 'undo'
  | 'flag'
  | 'check'
  | 'close'
  | 'chevron-down'
  | 'chevron-right'
  | 'menu'
  | 'wall'
  | 'clock'
  | 'search'
  | 'info'
  | 'warning'
  | 'offline'
  | 'user'
  | 'settings'
  | 'arrow-up'
  | 'home'
  | 'history'
  | 'trend'
  | 'play'
  | 'stop'
  | 'lock'
  | 'pool';

const PATHS: Record<IconName, string> = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  undo: 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  check: 'M5 12.5 10 17 19 7',
  close: 'M6 6l12 12M18 6 6 18',
  'chevron-down': 'M6 9l6 6 6-6',
  'chevron-right': 'M9 6l6 6-6 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  wall: 'M19 4v16M4 12h11M11 8l4 4-4 4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6M12 7.5v.5',
  warning: 'M12 4 2.5 20h19L12 4ZM12 10v4M12 17v.5',
  offline: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 4-2.4M19 13a10 10 0 0 0-2.6-1.8M2 9.5a15 15 0 0 1 4.5-2.8M22 9.5A15 15 0 0 0 11 5.1M12 20h.01',
  user: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21a8 8 0 0 1 16 0',
  settings: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4',
  'arrow-up': 'M12 19V5M6 11l6-6 6 6',
  home: 'M4 11 12 4l8 7v9H4v-9ZM10 20v-5h4v5',
  history: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4M12 8v4l3 2',
  trend: 'M4 18l5-6 4 3 7-9M15 6h5v5',
  play: 'M7 5v14l12-7L7 5Z',
  stop: 'M6 6h12v12H6z',
  lock: 'M6 11h12v9H6v-9ZM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  pool: 'M3 18c2 0 2-1.5 4.5-1.5S9.5 18 12 18s2-1.5 4.5-1.5S18.5 18 21 18M7 15V5M17 15V5M7 8h10M7 12h10',
};

export function Icon({ name, label }: { name: IconName; label?: string }) {
  return (
    <svg
      className="sb-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
