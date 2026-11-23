// Illustrative fixture data for the Command Center Feed specimens. Every Agent, Round, Advisor, path and time is made up;
// the board clock reads 14:06:20 on 2026-11-20. Round ids use the Hub's r_ form.

import { AGENTS, type Agent, type DiffLine } from './fixtures';

/** A second Claude Code session in the same project: the Hub adds a clash suffix from its session id. */
export const CLASH_AGENT: Agent = {
  id: 'a7',
  callsign: 'CLAUDE·api·3f9a',
  slot: 5,
  kind: 'Claude Code',
  sessionId: '3f9a0c55-1e2d-4b7a-8c90-6d5e4f3a2b1c',
  cwd: '~/src/ledger-api',
  branch: 'fix/rounding',
  host: 'this machine',
  transport: 'hermes CLI',
  detection: 'CLAUDE_CODE_SESSION_ID (documented env)',
  resume: 'claude --resume 3f9a0c55-1e2d-4b7a-8c90-6d5e4f3a2b1c',
  lastSeen: '14:06:02',
  state: 'connected',
};

export const [CLAUDE, CODEX, CURSOR] = AGENTS;

export type FeedEntry = {
  id: string;
  agent: Agent;
  project: string;
  title: string;
  /** Time to the next Lock, mm:ss, or the Outcome word once the Round has ended in place. */
  next: string;
  lockSoon?: boolean;
  ended?: 'Cancelled' | 'Expired';
};

export const FEED: FeedEntry[] = [
  { id: 'r_7f3a91c0', agent: CLAUDE, project: 'ledger-api', title: 'Ship the v2 invoices route', next: '00:47', lockSoon: true },
  { id: 'r_e41a6b02', agent: CODEX, project: 'billing', title: 'Pick the Postgres 17 cut-over', next: '08:12' },
  { id: 'r_5b2f90cd', agent: CLASH_AGENT, project: 'ledger-api', title: 'Round half-cents on refunds', next: 'Cancelled', ended: 'Cancelled' },
  { id: 'r_c90d4417', agent: CURSOR, project: 'web-shell', title: 'Rename the shell routes', next: 'Expired', ended: 'Expired' },
];

/** A diff whose unchanged run of 12 lines folds behind "Show 12 unchanged lines". */
export const FOLDED_DIFF: { before: DiffLine[]; folded: DiffLine[]; after: DiffLine[] } = {
  before: [
    { kind: 'context', text: "import { Router } from './router';" },
    { kind: 'remove', text: "router.mount('/invoices', invoices);" },
    { kind: 'add', text: "router.mount('/v2/invoices', invoicesV2);" },
  ],
  folded: Array.from({ length: 12 }, (_, index) => ({ kind: 'context' as const, text: `router.mount('/route-${String(index + 1).padStart(2, '0')}', handlers[${index}]);` })),
  after: [
    { kind: 'add', text: "router.mount('/invoices', deprecated(invoices, '2027-03-01'));" },
    { kind: 'context', text: 'export default router;' },
  ],
};

export const PROPOSAL = 'pnpm db:migrate --env prod --step 0042_invoices_v2';

export const RECOMMENDED_NOTE = 'Invoices move to /v2. The old route answers until 2027-03-01 with a Deprecation header.';

export const ADVISORS = [
  { name: 'codex-review', command: 'codex exec --profile review', timeout: '120 s' },
  { name: 'claude-second-look', command: 'claude -p --output-format json', timeout: '90 s' },
];
