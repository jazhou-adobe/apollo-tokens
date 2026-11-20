// Illustrative fixture data for the preview. Every Agent, Round, session id, path, and time below is made up to show the
// components; none of it comes from a running Hub.

export type ClientKind = 'Claude Code' | 'Codex CLI' | 'Cursor IDE' | 'VS Code Copilot' | 'omp' | 'Script';

export type Agent = {
  id: string;
  /** Callsign text shown on every chip: KIND·label. */
  callsign: string;
  /** Identity colour slot, agent-1 … agent-6. */
  slot: 1 | 2 | 3 | 4 | 5 | 6;
  kind: ClientKind;
  sessionId: string;
  cwd: string;
  branch: string;
  host: string;
  transport: string;
  /** Which signal identified the client and session, with its evidence label. */
  detection: string;
  resume: string;
  lastSeen: string;
  state: 'connected' | 'idle' | 'gone';
};

export const AGENTS: Agent[] = [
  {
    id: 'a1',
    callsign: 'CLAUDE·api-refactor',
    slot: 1,
    kind: 'Claude Code',
    sessionId: '7f3c9e21-48d0-4b6a-9c1e-2a7d5f0b1c33',
    cwd: '~/src/ledger-api',
    branch: 'feat/v2-routes',
    host: 'this machine',
    transport: 'hermes CLI',
    detection: 'CLAUDE_CODE_SESSION_ID (documented env)',
    resume: 'claude --resume 7f3c9e21…',
    lastSeen: '09:41:12',
    state: 'connected',
  },
  {
    id: 'a2',
    callsign: 'CODEX·billing-migration',
    slot: 2,
    kind: 'Codex CLI',
    sessionId: '019a4c2e-7b1d-7e90-a3f4-5c6d7e8f9a0b',
    cwd: '~/src/billing',
    branch: 'chore/pg17',
    host: 'this machine',
    transport: 'MCP stdio shim',
    detection: '_meta.threadId on tools/call (source only)',
    resume: 'codex resume 019a4c2e…',
    lastSeen: '09:40:55',
    state: 'connected',
  },
  {
    id: 'a3',
    callsign: 'CURSOR·web-shell',
    slot: 3,
    kind: 'Cursor IDE',
    sessionId: 'c0nv-5521-ab8e',
    cwd: '~/src/web-shell',
    branch: 'main',
    host: 'this machine',
    transport: 'hermes CLI',
    detection: 'CURSOR_CONVERSATION_ID (source only)',
    resume: 'none documented',
    lastSeen: '09:12:40',
    state: 'idle',
  },
  {
    id: 'a4',
    callsign: 'COPILOT·docs-site',
    slot: 4,
    kind: 'VS Code Copilot',
    sessionId: 'vscode.conversationId 3be1…',
    cwd: '~/src/docs-site',
    branch: 'release/4.2',
    host: 'this machine',
    transport: 'MCP stdio shim',
    detection: '_meta["vscode.conversationId"] per call (source only)',
    resume: 'none documented',
    lastSeen: '09:38:02',
    state: 'connected',
  },
  {
    id: 'a5',
    callsign: 'OMP·hub-research',
    slot: 5,
    kind: 'omp',
    sessionId: 'pi-2f8a61',
    cwd: '~/src/hermes-hub',
    branch: 'research/mcp-bun-tasks',
    host: 'devbox (tailnet)',
    transport: 'hermes CLI over tailnet',
    detection: 'PI_SESSION_ID (documented env)',
    resume: 'omp --resume pi-2f8a61',
    lastSeen: '09:41:30',
    state: 'connected',
  },
  {
    id: 'a6',
    callsign: 'SCRIPT·nightly-backup',
    slot: 6,
    kind: 'Script',
    sessionId: 'none (self-declared label)',
    cwd: '/srv/backup',
    branch: 'not a git checkout',
    host: 'nas (tailnet)',
    transport: 'hermes CLI over tailnet',
    detection: 'No client marker; label from --label',
    resume: 'none',
    lastSeen: '02:04:18',
    state: 'gone',
  },
];

export const agentById = (id: string) => AGENTS.find((agent) => agent.id === id) ?? AGENTS[0];

export type Option = { id: string; label: string; detail?: string };

export type DiffLine = { kind: 'add' | 'remove' | 'context'; text: string };

export type Attachment =
  | { kind: 'diff'; title: string; meta: string; lines: DiffLine[] }
  | { kind: 'code'; title: string; meta: string; code: string }
  | { kind: 'file'; title: string; meta: string; path: string }
  | { kind: 'link'; title: string; meta: string; href: string };

export type Question =
  | { id: string; kind: 'single'; prompt: string; options: Option[]; recommended?: string; attachments?: Attachment[] }
  | { id: string; kind: 'multi'; prompt: string; options: Option[]; recommended?: string[]; attachments?: Attachment[] }
  | { id: string; kind: 'text'; prompt: string; placeholder: string; recommended?: string; attachments?: Attachment[] }
  | { id: string; kind: 'approve'; prompt: string; recommended?: 'approve' | 'reject'; attachments?: Attachment[] };

export type AnswerValue = string | string[];

export type Policy = { kind: 'wait' } | { kind: 'apply-recommended'; seconds: number } | { kind: 'cancel'; seconds: number };

export type RoundStatus = 'pending' | 'answered' | 'expired';

export type Round = {
  id: string;
  agentId: string;
  title: string;
  status: RoundStatus;
  received: string;
  policy: Policy;
  /** Seconds left before the Unanswered Policy fires; ignored for "wait". */
  remaining: number;
  questions: Question[];
  /** Expired and answered Rounds: what happened, in dispatcher voice. */
  outcome?: string;
};

export const STATUS_WORD: Record<RoundStatus, string> = { pending: 'Pending', answered: 'Answered', expired: 'Expired' };

export function formatClock(seconds: number) {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safe / 60);
  return `${String(minutes).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

/** Status words before adjectives: "waits 10 min, then applies recommended". */
export function policyText(policy: Policy) {
  if (policy.kind === 'wait') return 'keeps waiting';
  const minutes = policy.seconds % 60 === 0 ? `${policy.seconds / 60} min` : `${policy.seconds} s`;
  return policy.kind === 'apply-recommended' ? `waits ${minutes}, then applies recommended` : `waits ${minutes}, then cancels`;
}

export function questionCount(round: Round) {
  return `${round.questions.length} ${round.questions.length === 1 ? 'Question' : 'Questions'}`;
}

const ROUTE_DIFF: DiffLine[] = [
  { kind: 'context', text: "import { Router } from './router';" },
  { kind: 'remove', text: "router.mount('/invoices', invoices);" },
  { kind: 'add', text: "router.mount('/v2/invoices', invoicesV2);" },
  { kind: 'add', text: "router.mount('/invoices', deprecated(invoices, '2027-03-01'));" },
  { kind: 'context', text: 'export default router;' },
];

export const ROUNDS: Round[] = [
  {
    id: 'R-0142',
    agentId: 'a1',
    title: 'Route versioning for /v2',
    status: 'pending',
    received: '09:38',
    policy: { kind: 'apply-recommended', seconds: 600 },
    remaining: 412,
    questions: [
      {
        id: 'q1',
        kind: 'single',
        prompt: 'Which versioning scheme should the new invoice routes use?',
        recommended: 'prefix',
        options: [
          { id: 'prefix', label: 'URL prefix /v2', detail: 'Matches the three existing public APIs.' },
          { id: 'header', label: 'Accept-Version header', detail: 'Cleaner URLs; clients must send the header.' },
          { id: 'query', label: 'Query parameter ?v=2', detail: 'Cache keys change on every call.' },
        ],
      },
      {
        id: 'q2',
        kind: 'approve',
        prompt: 'Apply this change to src/routes.ts?',
        recommended: 'approve',
        attachments: [{ kind: 'diff', title: 'src/routes.ts', meta: '+2 −1', lines: ROUTE_DIFF }],
      },
      {
        id: 'q3',
        kind: 'text',
        prompt: 'Deprecation note for the old /invoices route (one line, goes in the changelog).',
        placeholder: 'For example: /invoices is deprecated; use /v2/invoices before 1 March 2027.',
      },
    ],
  },
  {
    id: 'R-0143',
    agentId: 'a2',
    title: 'Postgres 17 migration window',
    status: 'pending',
    received: '09:40',
    policy: { kind: 'wait' },
    remaining: 0,
    questions: [
      {
        id: 'q1',
        kind: 'single',
        prompt: 'When should the migration run?',
        recommended: 'tonight',
        options: [
          { id: 'tonight', label: 'Tonight, 02:00–03:00', detail: 'Lowest traffic window this week.' },
          { id: 'saturday', label: 'Saturday, 06:00', detail: 'Two people on call.' },
          { id: 'hold', label: 'Hold until the replica catches up' },
        ],
      },
      {
        id: 'q2',
        kind: 'multi',
        prompt: 'Which tables should be backfilled first?',
        recommended: ['invoices', 'payments'],
        options: [
          { id: 'invoices', label: 'invoices', detail: '41 M rows' },
          { id: 'payments', label: 'payments', detail: '38 M rows' },
          { id: 'audit_log', label: 'audit_log', detail: '212 M rows; can lag a day' },
          { id: 'customers', label: 'customers', detail: '0.9 M rows' },
        ],
      },
      {
        id: 'q3',
        kind: 'approve',
        prompt: 'Run the dry-run against the staging snapshot now?',
        recommended: 'approve',
        attachments: [{ kind: 'code', title: 'migrate.sh --dry-run', meta: 'shell · 4 lines', code: 'pg_dump --schema-only staging > /tmp/schema.sql\npsql -f migrations/017_pg17.sql --set ON_ERROR_STOP=1\n./verify --tables invoices,payments\necho "dry-run complete"' }],
      },
      {
        id: 'q4',
        kind: 'approve',
        prompt: 'Pause the nightly invoice export while the migration runs?',
        recommended: 'approve',
      },
    ],
  },
  {
    id: 'R-0144',
    agentId: 'a5',
    title: 'Publish research note?',
    status: 'pending',
    received: '09:41',
    policy: { kind: 'cancel', seconds: 90 },
    remaining: 75,
    questions: [
      {
        id: 'q1',
        kind: 'approve',
        prompt: 'Push docs/research/mcp-bun-tasks.md to the research branch?',
        attachments: [
          { kind: 'file', title: 'mcp-bun-tasks.md', meta: '18 KB · Markdown', path: 'docs/research/mcp-bun-tasks.md' },
          { kind: 'link', title: 'Draft rendered on devbox', meta: 'tailnet only', href: 'https://devbox.tailnet.example/research/mcp-bun-tasks' },
        ],
      },
    ],
  },
  {
    id: 'R-0145',
    agentId: 'a4',
    title: 'Screenshot set for release notes',
    status: 'pending',
    received: '09:36',
    policy: { kind: 'apply-recommended', seconds: 1800 },
    remaining: 1630,
    questions: [
      {
        id: 'q1',
        kind: 'multi',
        prompt: 'Which screens go into the 4.2 release notes?',
        recommended: ['search', 'export'],
        options: [
          { id: 'search', label: 'New search panel' },
          { id: 'export', label: 'Export to PDF' },
          { id: 'settings', label: 'Settings reorganised' },
        ],
        attachments: [{ kind: 'link', title: 'Preview build', meta: 'docs-site PR 812', href: 'https://example.com/docs-site/pr/812' }],
      },
    ],
  },
  {
    id: 'R-0139',
    agentId: 'a3',
    title: 'Rename feature flag new_shell',
    status: 'expired',
    received: '09:02',
    policy: { kind: 'apply-recommended', seconds: 600 },
    remaining: 0,
    outcome: 'Expired 09:12 · policy applied recommended: shell_v2',
    questions: [
      {
        id: 'q1',
        kind: 'single',
        prompt: 'New name for the new_shell flag?',
        recommended: 'shell_v2',
        options: [
          { id: 'shell_v2', label: 'shell_v2' },
          { id: 'next_shell', label: 'next_shell' },
        ],
      },
    ],
  },
];

export type LogEntry = { id: string; agentId: string; title: string; status: Exclude<RoundStatus, 'pending'>; at: string; summary: string };

export const ANSWERED_LOG: LogEntry[] = [
  { id: 'R-0139', agentId: 'a3', title: 'Rename feature flag new_shell', status: 'expired', at: '09:12', summary: 'Policy applied recommended: shell_v2' },
  { id: 'R-0138', agentId: 'a6', title: 'Prune snapshots older than 30 days?', status: 'answered', at: '02:04', summary: 'Approve · notes: keep the 1 Nov snapshot' },
  { id: 'R-0137', agentId: 'a1', title: 'Error shape for 422 responses', status: 'answered', at: 'Yesterday 17:20', summary: 'RFC 9457 problem details' },
  { id: 'R-0136', agentId: 'a2', title: 'Drop legacy_invoice_v1 table?', status: 'expired', at: 'Yesterday 16:02', summary: 'Cancelled by policy after 15 min' },
];

/** Sections of /design, in order; also the sidebar index. */
export const SECTIONS = [
  { id: 'direction', label: 'Direction' },
  { id: 'colour-roles', label: 'Colour roles' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing, radius and elevation' },
  { id: 'density', label: 'Density modes' },
  {
    id: 'core',
    label: 'Core components',
    items: [
      { id: 'core-chrome', label: 'Chrome and navigation' },
      { id: 'core-actions', label: 'Actions' },
      { id: 'core-inputs', label: 'Inputs and fields' },
      { id: 'core-containers', label: 'Containers' },
      { id: 'core-feedback', label: 'Feedback' },
      { id: 'core-overlays', label: 'Overlays' },
      { id: 'core-data', label: 'Data display' },
    ],
  },
  {
    id: 'domain',
    label: 'Domain widgets',
    items: [
      { id: 'strip-bay', label: 'Strip bay' },
      { id: 'domain-strips', label: 'Round strips' },
      { id: 'domain-questions', label: 'Questions' },
      { id: 'domain-attachments', label: 'Attachments' },
      { id: 'domain-agents', label: 'Callsigns and roster' },
      { id: 'domain-status', label: 'Timer, connection, log' },
    ],
  },
  { id: 'blueprints-command', label: 'Command Center blueprints' },
  { id: 'blueprints-phone', label: 'Phone blueprints' },
  { id: 'blueprints-system', label: 'System blueprints' },
  { id: 'agent-recipe', label: 'Agent recipe' },
] as const;
