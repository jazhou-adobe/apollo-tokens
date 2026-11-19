// Illustrative fixture data for the preview. Every screen that shows it carries an "Illustrative data" badge: these are
// not real Swimmers, venues, or results.

export const SECTIONS = [
  {
    id: 'foundations',
    label: 'Foundations',
    items: [
      { id: 'colour-roles', label: 'Colour roles' },
      { id: 'type-numerals', label: 'Type and numerals' },
      { id: 'spacing-shape', label: 'Spacing, radius and elevation' },
      { id: 'deck-knob', label: 'Deck knob' },
    ],
  },
  {
    id: 'core-components',
    label: 'Core components',
    items: [
      { id: 'cc-actions', label: 'Actions and links' },
      { id: 'cc-inputs', label: 'Inputs and fields' },
      { id: 'cc-containers', label: 'Containers' },
      { id: 'cc-navigation', label: 'Navigation' },
      { id: 'cc-feedback', label: 'Feedback' },
      { id: 'cc-overlays', label: 'Overlays' },
      { id: 'cc-data', label: 'Data display' },
    ],
  },
  {
    id: 'domain-widgets',
    label: 'Domain widgets',
    items: [
      { id: 'dw-tap-pad', label: 'Tap Pad' },
      { id: 'dw-readouts', label: 'Length strip and split read-out' },
      { id: 'dw-pickers', label: 'Chip pickers' },
      { id: 'dw-rating', label: 'Rating and fault flag' },
      { id: 'dw-review', label: 'Review sheet' },
      { id: 'dw-rows', label: 'Swim, Session and Set rows' },
      { id: 'dw-trends', label: 'Metric and Technique trends' },
      { id: 'dw-profile', label: 'Profile switcher' },
      { id: 'dw-admin', label: 'Configuration list and publish bar' },
    ],
  },
  {
    id: 'watcher-blueprints',
    label: 'Watcher blueprints',
    items: [
      { id: 'bp-home', label: 'Swimmer home' },
      { id: 'bp-setup', label: 'Pre-Swim setup' },
      { id: 'bp-capture', label: 'Live Capture (Deck)' },
      { id: 'bp-review', label: 'Review sheet' },
      { id: 'bp-history', label: 'Session history' },
      { id: 'bp-swim', label: 'Swim detail' },
      { id: 'bp-metric-trends', label: 'Metric trends' },
      { id: 'bp-technique-trend', label: 'Technique trend' },
      { id: 'bp-defaults', label: 'Profile and Account defaults' },
    ],
  },
  {
    id: 'admin-blueprints',
    label: 'Admin blueprints',
    items: [
      { id: 'bp-config-list', label: 'Configuration list' },
      { id: 'bp-metric-editor', label: 'Metric definition editor' },
      { id: 'bp-publish', label: 'Publish with reach choice' },
      { id: 'bp-versions', label: 'Configuration version history' },
    ],
  },
  {
    id: 'system-states',
    label: 'System states',
    items: [
      { id: 'sys-sign-in', label: 'Sign in' },
      { id: 'sys-empty', label: 'Empty' },
      { id: 'sys-loading', label: 'Loading' },
      { id: 'sys-offline', label: 'Offline' },
      { id: 'sys-error', label: 'Error' },
      { id: 'sys-not-found', label: 'Not found' },
    ],
  },
  { id: 'agent-recipe', label: 'Agent recipe' },
] as const;

export type Swimmer = { id: string; name: string; initials: string; detail: string };

export const SWIMMERS: Swimmer[] = [
  { id: 'mia', name: 'Mia', initials: 'MI', detail: '12 · freestyle and backstroke · 25 m pool' },
  { id: 'leo', name: 'Leo', initials: 'LE', detail: '10 · breaststroke · 25 m pool' },
  { id: 'ava', name: 'Ava', initials: 'AV', detail: '15 · butterfly · 50 m pool' },
];

export const STROKES = ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Medley'] as const;
export const DISTANCES = ['25 m', '50 m', '100 m', '200 m', '400 m'] as const;
export const TRAINING_TYPES = ['Swim', 'Kick', 'Pull', 'Drill: catch-up', 'Drill: 6-kick switch'] as const;

/** Focus metrics a watcher can pick for the Tap Pad (one or two). */
export const FOCUS_METRICS = [
  { id: 'kicks', label: 'Underwater kicks', hint: 'Dolphin kicks off each wall before the first stroke' },
  { id: 'strokes', label: 'Strokes', hint: 'Arm strokes in the Length' },
] as const;

/** Cue text for the Head position Technique point, one per rating level (1–5). */
export const HEAD_POSITION_CUES = [
  'Head lifted to look forward; hips sink low.',
  'Eyes forward most of the Length; head bobs when breathing.',
  'Head mostly neutral; lifts on some breaths.',
  'Eyes down, water line near the crown; a small lift on a few breaths.',
  'Neutral throughout: eyes down, water line at the crown, breathes with the body roll.',
] as const;

export const FAULTS = [
  { id: 'fifteen', label: 'Head surfaced after 15 m', note: 'Freestyle start or turn' },
  { id: 'touch', label: 'Missed wall touch on the turn', note: 'Feet did not touch the wall' },
] as const;

export type LengthFixture = { number: number; split: string; strokes: number; kicks: number };

export const LENGTHS: LengthFixture[] = [
  { number: 1, split: '17.84', strokes: 16, kicks: 6 },
  { number: 2, split: '19.92', strokes: 17, kicks: 5 },
  { number: 3, split: '20.31', strokes: 17, kicks: 5 },
  { number: 4, split: '20.35', strokes: 18, kicks: 4 },
];

/** The illustrative Swim the stand-alone Review sheet examples show (not the one captured on a Tap Pad). */
export const REVIEW_SWIM = { title: '100 m freestyle (illustrative)', time: '1:18.42', lengths: LENGTHS };

export type SwimFixture = {
  id: string;
  title: string;
  detail: string;
  time: string;
  strokes: string;
  kicks: string;
  rating: number;
  fault?: string;
};

export const SWIMS: SwimFixture[] = [
  { id: 's1', title: '100 m freestyle', detail: 'Swim · push start', time: '1:18.42', strokes: '17.0', kicks: '5.0', rating: 4 },
  { id: 's2', title: '100 m freestyle', detail: 'Swim · push start', time: '1:19.10', strokes: '17.3', kicks: '5.0', rating: 4 },
  { id: 's3', title: '100 m freestyle', detail: 'Swim · push start', time: '1:18.96', strokes: '17.5', kicks: '4.7', rating: 3, fault: 'Head surfaced after 15 m' },
  { id: 's4', title: '50 m kick', detail: 'Kick · board', time: '58.20', strokes: '–', kicks: '3.0', rating: 3 },
];

export const SESSIONS = [
  { id: 'n1', day: '18', month: 'Nov', title: 'Tuesday squad', detail: 'Riverside pool · 25 m · 6 Swims', focus: 'Underwater kicks' },
  { id: 'n2', day: '14', month: 'Nov', title: 'Friday technique', detail: 'Riverside pool · 25 m · 4 Swims', focus: 'Head position' },
  { id: 'n3', day: '11', month: 'Nov', title: 'Tuesday squad', detail: 'Riverside pool · 25 m · 8 Swims', focus: 'Strokes' },
];

/** Average underwater kicks off each wall, by month. */
export const KICK_TREND = [
  { label: 'Jul', value: 3.0 },
  { label: 'Aug', value: 3.4 },
  { label: 'Sep', value: 4.1 },
  { label: 'Oct', value: 5.2 },
  { label: 'Nov', value: 6.0 },
];

/** Average strokes per 25 m Length of freestyle, by month (lower is more efficient). */
export const STROKE_TREND = [
  { label: 'Jul', value: 20.5 },
  { label: 'Aug', value: 20.1 },
  { label: 'Sep', value: 19.2 },
  { label: 'Oct', value: 18.4 },
  { label: 'Nov', value: 17.6 },
];

export const CONFIG_METRICS = [
  { key: 'underwater_kicks', name: 'Underwater kicks', widget: 'Counter', scope: 'Length', status: 'Published' },
  { key: 'stroke_count', name: 'Strokes', widget: 'Counter', scope: 'Length', status: 'Published' },
  { key: 'split', name: 'Split', widget: 'Split', scope: 'Length', status: 'Published' },
  { key: 'swolf', name: 'SWOLF', widget: 'Derived', scope: 'Length', status: 'Changed in Draft' },
  { key: 'head_position', name: 'Head position', widget: 'Rating', scope: 'Swim', status: 'Changed in Draft' },
  { key: 'surfaced_after_15m', name: 'Head surfaced after 15 m', widget: 'Fault', scope: 'Length', status: 'New in Draft' },
] as const;

export const CONFIG_VERSIONS = [
  { version: 'Draft', when: 'Editing now', by: 'Admin', change: '3 changes: SWOLF formula, Head position cues, new Fault' },
  { version: 'v14', when: '12 Nov', by: 'Admin', change: 'Added Kick training types' },
  { version: 'v13', when: '30 Oct', by: 'Admin', change: 'Renamed Breaths to Breaths per Length' },
  { version: 'v12', when: '2 Oct', by: 'Admin', change: 'First swimming Configuration' },
] as const;
