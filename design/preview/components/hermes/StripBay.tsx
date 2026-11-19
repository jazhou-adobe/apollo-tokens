'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ANSWERED_LOG, ROUNDS, agentById, questionCount, type AnswerValue, type LogEntry, type Question, type Round } from '../../fixtures';
import { Icon } from '../Icon';
import { AnsweredLog } from './AnsweredLog';
import { Callsign } from './Callsign';
import { ConnectionStatus, type ConnectionState } from './ConnectionStatus';
import { KbdHints } from './KbdHints';
import { PolicyBadge } from './PolicyTimer';
import { QuestionBlock, isAnswered, questionDomId } from './QuestionBlock';
import { Strip, recommendedText } from './Strip';

type Answers = Record<string, Record<string, AnswerValue>>;
type Notice = { tone: 'answered' | 'expired'; text: string; key: number };
type HeadingLevel = 2 | 3 | 4;

const CONNECTION_DETAIL: Record<ConnectionState, string> = {
  live: 'SSE · last event 1 s ago',
  reconnecting: 'retry 3 of 5 · next in 4 s',
  offline: 'Hub not reachable since 09:41',
};

const now = () => new Date().toTimeString().slice(0, 5);

function summarise(round: Round, answers: Record<string, AnswerValue>, notes: string) {
  const parts = round.questions.map((question, index) => {
    const value = answers[question.id];
    if (question.kind === 'approve') return `Q${index + 1} ${value === 'approve' ? 'Approve' : 'Reject'}`;
    if (question.kind === 'text') return typeof value === 'string' && value.trim() ? `Q${index + 1} note given` : `Q${index + 1} no note`;
    const ids = Array.isArray(value) ? value : [value];
    return `Q${index + 1} ${question.options.filter((option) => ids.includes(option.id)).map((option) => option.label).join(', ')}`;
  });
  return [...parts, notes.trim() ? `notes: ${notes.trim()}` : ''].filter(Boolean).join(' · ');
}

/** The Agent's recommended value for every Question that has one (the demo fills a Round with these). */
function recommendedAnswers(round: Round) {
  const answers: Record<string, AnswerValue> = {};
  for (const question of round.questions) if (question.recommended !== undefined) answers[question.id] = question.recommended;
  return answers;
}

const isTyping = (target: EventTarget) =>
  target instanceof HTMLElement && (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable || (target.tagName === 'INPUT' && !['radio', 'checkbox', 'button'].includes((target as HTMLInputElement).type)));

/** --hh-motion-signature in ms as painted now (it collapses to one millisecond under reduced motion). */
function signatureMs() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--hh-motion-signature').trim();
  const match = /^(\d*\.?\d+)(ms|s)$/.exec(value);
  return match ? Number(match[1]) * (match[2] === 's' ? 1000 : 1) : 0;
}

type StripBayProps = {
  /** Rounds in the bay at load; defaults to the illustrative fixtures. Pass [] for the empty bay. */
  initialRounds?: Round[];
  /** Show demo controls (shortcut switch, connection state). */
  controls?: boolean;
  showLog?: boolean;
  heading?: string;
  /** Level of the bay, Round, and log headings, so each page keeps a gap-free outline. */
  headingLevel?: HeadingLevel;
  /** Names this instance's landmarks so repeated demos on one page stay distinguishable. */
  context: string;
  /** Phone flow only: start on the open Round instead of the pending list. */
  initialView?: 'queue' | 'round';
  initialOpenId?: string;
  /** Gallery frames: honour ?view=round (open on the Round sheet) and ?demo=send (answer the first Round with its recommendations and send it). */
  demo?: boolean;
};

/**
 * The working triage screen: the strip bay beside the open Round (or, in a narrow container, the pending list and the Round
 * as a full-width sheet with "Back to pending"). Timers tick and policies fire; the Answer bar sends the whole Round; the
 * answered strip stays mounted as data-state="departing" for --hh-motion-signature so worlds can animate it, then leaves.
 */
export function StripBay({
  initialRounds = ROUNDS,
  controls = true,
  showLog = true,
  heading = 'Strip bay',
  headingLevel = 3,
  context,
  initialView = 'queue',
  initialOpenId,
  demo = false,
}: StripBayProps) {
  const uid = useId();
  const Heading = `h${headingLevel}` as const;
  const firstPending = initialOpenId ?? initialRounds.find((round) => round.status === 'pending')?.id ?? null;
  const [rounds, setRounds] = useState<Round[]>(initialRounds);
  const [departing, setDeparting] = useState<Set<string>>(new Set());
  const [log, setLog] = useState<LogEntry[]>(ANSWERED_LOG);
  const [openId, setOpenId] = useState<string | null>(firstPending);
  const [activeId, setActiveId] = useState<string | null>(firstPending ?? initialRounds[0]?.id ?? null);
  const [view, setView] = useState<'queue' | 'round'>(initialView);
  const [answers, setAnswers] = useState<Answers>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notesOpen, setNotesOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [shortcuts, setShortcuts] = useState(true);
  const [connection, setConnection] = useState<ConnectionState>('live');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [error, setError] = useState<{ text: string; key: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const items = useRef(new Map<string, HTMLLIElement>());
  const roundRef = useRef<HTMLFormElement>(null);
  const roundHeadingRef = useRef<HTMLHeadingElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const bayHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<(() => void) | null>(null);

  const pending = rounds.filter((round) => round.status === 'pending');
  const open = rounds.find((round) => round.id === openId && round.status === 'pending') ?? null;
  const focusable = rounds.filter((round) => !departing.has(round.id));
  const rovingId = focusable.some((round) => round.id === activeId) ? activeId : focusable[0]?.id ?? null;

  // Stacked when the command grid has a single column: the narrow-container (phone) flow.
  const isStacked = () => (gridRef.current ? getComputedStyle(gridRef.current).gridTemplateColumns.trim().split(/\s+/).length < 2 : false);

  // Run focus moves after the render that shows their target.
  useEffect(() => {
    const action = focusNext.current;
    focusNext.current = null;
    action?.();
  });

  // Unanswered Policy clocks. The Hub owns real timers; the preview ticks once a second.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRounds((previous) =>
        previous.map((round) => (round.status === 'pending' && round.policy.kind !== 'wait' && round.remaining > 0 ? { ...round, remaining: round.remaining - 1 } : round)),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // A policy fires at zero: the Round expires and joins the answered log with what the policy did.
  useEffect(() => {
    const due = rounds.filter((round) => round.status === 'pending' && round.policy.kind !== 'wait' && round.remaining <= 0);
    if (!due.length) return;
    const at = now();
    const outcomes = new Map(
      due.map((round) => {
        const first = round.questions.map(recommendedText).find(Boolean);
        return [round.id, round.policy.kind === 'cancel' ? `Cancelled ${at} by policy` : `Expired ${at} · policy applied recommended${first ? `: ${first}` : ''}`];
      }),
    );
    setRounds((previous) => previous.map((round) => (outcomes.has(round.id) ? { ...round, status: 'expired', outcome: outcomes.get(round.id) } : round)));
    setLog((previous) => [
      ...due.map((round) => ({ id: round.id, agentId: round.agentId, title: round.title, status: 'expired' as const, at, summary: outcomes.get(round.id) ?? '' })),
      ...previous,
    ]);
    setNotice({ tone: 'expired', text: due.map((round) => `${round.id} · ${outcomes.get(round.id)}`).join(' · '), key: Date.now() });
  }, [rounds]);

  const focusStrip = (id: string | null) => {
    if (!id) {
      bayHeadingRef.current?.focus();
      return;
    }
    setActiveId(id);
    focusNext.current = () => items.current.get(id)?.focus();
  };

  const openRound = useCallback((id: string, moveFocus: boolean) => {
    setOpenId(id);
    setActiveId(id);
    setCurrentQ(0);
    setError(null);
    setInvalid(new Set());
    setNotesOpen(false);
    if (moveFocus && isStacked()) {
      setView('round');
      focusNext.current = () => {
        roundRef.current?.scrollIntoView({ block: 'start' });
        roundHeadingRef.current?.focus({ preventScroll: true });
      };
    }
  }, []);

  function closeRound() {
    if (!openId) return;
    const id = openId;
    if (isStacked()) setView('queue');
    else setOpenId(null);
    focusStrip(id);
  }

  function setAnswer(round: Round, questionId: string, value: AnswerValue) {
    setAnswers((previous) => ({ ...previous, [round.id]: { ...previous[round.id], [questionId]: value } }));
    setInvalid((previous) => {
      if (!previous.has(questionId)) return previous;
      const next = new Set(previous);
      next.delete(questionId);
      return next;
    });
  }

  function sendRound(round: Round, roundAnswers: Record<string, AnswerValue>) {
    const at = now();
    const agent = agentById(round.agentId);
    // The answered strip stays on the board as "departing" for the signature duration, then leaves.
    setRounds((previous) => previous.map((candidate) => (candidate.id === round.id ? { ...candidate, status: 'answered', outcome: `Answered ${at} · delivered` } : candidate)));
    setDeparting((previous) => new Set(previous).add(round.id));
    window.setTimeout(() => {
      setRounds((previous) => previous.filter((candidate) => candidate.id !== round.id));
      setDeparting((previous) => {
        const next = new Set(previous);
        next.delete(round.id);
        return next;
      });
    }, signatureMs());
    setLog((previous) => [{ id: round.id, agentId: round.agentId, title: round.title, status: 'answered', at, summary: summarise(round, roundAnswers, notes[round.id] ?? '') }, ...previous]);
    setNotice({ tone: 'answered', text: `${round.id} · ${questionCount(round)} delivered to ${agent.callsign}.`, key: Date.now() });
    setError(null);
    const next = pending.find((candidate) => candidate.id !== round.id);
    if (isStacked()) {
      setView('queue');
      setOpenId(next?.id ?? null);
      focusStrip(next?.id ?? null);
    } else if (next) {
      openRound(next.id, false);
      focusStrip(next.id);
    } else {
      setOpenId(null);
      focusStrip(null);
    }
  }

  function send() {
    if (!open) return;
    if (connection === 'offline') {
      setError({ text: 'Not sent. The Hub is offline; your Answers stay here until it is back.', key: Date.now() });
      return;
    }
    const roundAnswers = answers[open.id] ?? {};
    const missing = open.questions.filter((question) => !isAnswered(question, roundAnswers[question.id]));
    if (missing.length) {
      const labels = missing.map((question) => `Q${open.questions.indexOf(question) + 1}`);
      setInvalid(new Set(missing.map((question) => question.id)));
      setError({ text: `Not sent. ${labels.join(', ')} ${labels.length === 1 ? 'needs' : 'need'} an Answer.`, key: Date.now() });
      setCurrentQ(open.questions.indexOf(missing[0]));
      focusNext.current = () => document.getElementById(questionDomId(`${uid}-${open.id}`, missing[0].id))?.querySelector<HTMLElement>('input, textarea')?.focus();
      return;
    }
    sendRound(open, roundAnswers);
  }

  function pick(question: Question | undefined, round: Round, digit: number) {
    if (!question || (question.kind !== 'single' && question.kind !== 'multi')) return;
    const option = question.options[digit - 1];
    if (!option) return;
    if (question.kind === 'single') setAnswer(round, question.id, option.id);
    else {
      const current = answers[round.id]?.[question.id];
      const list = Array.isArray(current) ? current : [];
      setAnswer(round, question.id, list.includes(option.id) ? list.filter((id) => id !== option.id) : [...list, option.id]);
    }
  }

  // Strip bay listbox: one Tab stop, roving focus. Arrows always; J/K while single-key shortcuts are on.
  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const index = focusable.findIndex((round) => round.id === rovingId);
    const key = event.key;
    let target: Round | undefined;
    if (key === 'ArrowDown' || (shortcuts && key.toLowerCase() === 'j')) target = focusable[Math.min(index + 1, focusable.length - 1)];
    else if (key === 'ArrowUp' || (shortcuts && key.toLowerCase() === 'k')) target = focusable[Math.max(index - 1, 0)];
    else if (key === 'Home') target = focusable[0];
    else if (key === 'End') target = focusable[focusable.length - 1];
    else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const round = focusable[index];
      if (round?.status === 'pending') openRound(round.id, true);
      return;
    }
    if (!target) return;
    event.preventDefault();
    focusStrip(target.id);
    // Side by side, selection follows focus so the Round beside the bay always matches the focused strip.
    if (target.status === 'pending' && !isStacked()) openRound(target.id, false);
  }

  function onRoundKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (!open) return;
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      send();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      closeRound();
      return;
    }
    if (!shortcuts || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
    const key = event.key.toLowerCase();
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      pick(open.questions[currentQ], open, Number(event.key));
    } else if (key === 'a' || key === 'r') {
      const current = open.questions[currentQ];
      const target = current?.kind === 'approve' ? current : open.questions.find((question) => question.kind === 'approve');
      if (!target) return;
      event.preventDefault();
      setAnswer(open, target.id, key === 'a' ? 'approve' : 'reject');
    } else if (key === 'n') {
      event.preventDefault();
      setNotesOpen(true);
      focusNext.current = () => notesRef.current?.focus();
    }
  }

  // Gallery frames: ?view=round opens on the Round sheet (narrow frames would otherwise show only the queue), and
  // ?demo=send (the /worlds signature trigger) fills the first Round with its recommendations, holds, then sends it.
  useEffect(() => {
    if (!demo) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'round') setView('round');
    if (params.get('demo') !== 'send') return;
    const round = initialRounds.find((candidate) => candidate.status === 'pending');
    if (!round) return;
    const filled = recommendedAnswers(round);
    setAnswers({ [round.id]: filled });
    const timer = window.setTimeout(() => sendRound(round, filled), 1500);
    return () => window.clearTimeout(timer);
    // Runs once on mount; sendRound only reads state through functional setters.
  }, []);

  const openAnswers = open ? answers[open.id] ?? {} : {};
  const answeredCount = open ? open.questions.filter((question) => question.kind !== 'text' && isAnswered(question, openAnswers[question.id])).length : 0;
  const requiredCount = open ? open.questions.filter((question) => question.kind !== 'text').length : 0;
  const scope = open ? `${uid}-${open.id}` : uid;

  return (
    <div className="hh-stack">
      {controls ? (
        <div className="hh-row">
          <button type="button" role="switch" aria-checked={shortcuts} className="hh-switch" onClick={() => setShortcuts(!shortcuts)}>
            <span className="hh-switch-track" aria-hidden="true">
              <span className="hh-switch-thumb" />
            </span>
            <span className="hh-body-sm">Single-key shortcuts {shortcuts ? 'on' : 'off'}</span>
          </button>
          <fieldset className="hh-segmented" aria-label={`Connection (demo, ${context})`}>
            {(['live', 'reconnecting', 'offline'] as const).map((state) => (
              <label key={state}>
                <input className="hh-visually-hidden" type="radio" name={`${uid}-connection`} checked={connection === state} onChange={() => setConnection(state)} />
                {state === 'live' ? 'Live' : state === 'reconnecting' ? 'Reconnecting' : 'Offline'}
              </label>
            ))}
          </fieldset>
        </div>
      ) : null}

      {/* Reserved bay-status region: confirmations and policy outcomes land here, never over the next Round's Answer bar. */}
      <div className="hh-bay-status" role="status">
        {notice ? (
          <div key={notice.key} className="hh-toast" data-placement="inline">
            <span className="hh-badge" data-tone={notice.tone}>
              {notice.tone === 'answered' ? 'Answered' : 'Expired'}
            </span>
            <span className="hh-body-sm">{notice.tone === 'answered' ? `Answer sent · ${notice.text}` : notice.text}</span>
            <button type="button" className="hh-button" data-variant="ghost" data-size="sm" onClick={() => setNotice(null)}>
              Dismiss
            </button>
          </div>
        ) : (
          <p className="hh-body-sm hh-muted">No Answer sent yet.</p>
        )}
      </div>

      <div className="hh-command" data-view={view}>
        <div className="hh-command-grid" ref={gridRef}>
          <section className="hh-strip-bay" aria-label={`${heading} (${context})`}>
            <div className="hh-strip-bay-head">
              <Heading ref={bayHeadingRef} tabIndex={-1} className="hh-heading-md">
                {heading}
              </Heading>
              <span className="hh-live-value" data-live={connection === 'live' ? 'true' : undefined}>
                {pending.length} pending
              </span>
              <ConnectionStatus state={connection} detail={CONNECTION_DETAIL[connection]} />
            </div>
            {rounds.length ? (
              <ul className="hh-strip-bay-list" data-density="compact" role="listbox" aria-label="Pending Rounds" aria-keyshortcuts="J K ArrowDown ArrowUp Home End Enter" onKeyDown={onListKeyDown}>
                {rounds.map((round) => (
                  <Strip
                    key={round.id}
                    mode="option"
                    round={round}
                    selected={round.id === openId && round.status === 'pending'}
                    departing={departing.has(round.id)}
                    tabIndex={round.id === rovingId ? 0 : -1}
                    onFocus={() => setActiveId(round.id)}
                    onClick={() => {
                      setActiveId(round.id);
                      if (round.status === 'pending') openRound(round.id, true);
                    }}
                    itemRef={(element) => {
                      if (element) items.current.set(round.id, element);
                      else items.current.delete(round.id);
                    }}
                  />
                ))}
              </ul>
            ) : (
              <EmptyBay />
            )}
          </section>

          <div className="hh-command-panel">
            {open ? (
              <form
                ref={roundRef}
                className="hh-round"
                aria-label={`Round ${open.id} (${context})`}
                onKeyDown={onRoundKeyDown}
                onSubmit={(event) => {
                  event.preventDefault();
                  send();
                }}
              >
                <div className="hh-round-head">
                  <button type="button" className="hh-button hh-round-back" data-variant="ghost" aria-keyshortcuts="Escape" onClick={closeRound}>
                    <Icon name="arrow-left" /> Back to pending
                  </button>
                  <div className="hh-row">
                    <span className="hh-badge" data-tone="pending">
                      Pending
                    </span>
                    <Callsign agentId={open.agentId} />
                    <span className="hh-mono-sm">
                      {open.id} · received {open.received}
                    </span>
                  </div>
                  <Heading ref={roundHeadingRef} tabIndex={-1} className="hh-strip-header">
                    {open.title}
                  </Heading>
                  <div className="hh-round-policy">
                    <PolicyBadge policy={open.policy} remaining={open.remaining} />
                  </div>
                </div>
                <div className="hh-round-body">
                  <ol className="hh-round-questions">
                    {open.questions.map((question, index) => (
                      <QuestionBlock
                        key={`${open.id}-${question.id}`}
                        question={question}
                        index={index}
                        scope={scope}
                        value={openAnswers[question.id]}
                        onChange={(value) => setAnswer(open, question.id, value)}
                        current={index === currentQ}
                        onFocus={() => setCurrentQ(index)}
                        hints={shortcuts}
                        invalid={invalid.has(question.id)}
                      />
                    ))}
                  </ol>
                  <details className="hh-notes" open={notesOpen} onToggle={(event) => setNotesOpen(event.currentTarget.open)}>
                    <summary className="hh-notes-summary">
                      Add notes for {agentById(open.agentId).callsign} (optional)
                      {shortcuts ? (
                        <kbd className="hh-kbd" aria-hidden="true">
                          N
                        </kbd>
                      ) : null}
                    </summary>
                    <label className="hh-visually-hidden" htmlFor={`${uid}-notes`}>
                      Notes for {agentById(open.agentId).callsign}
                    </label>
                    <textarea
                      ref={notesRef}
                      id={`${uid}-notes`}
                      className="hh-textarea"
                      aria-keyshortcuts="N"
                      value={notes[open.id] ?? ''}
                      onChange={(event) => setNotes((previous) => ({ ...previous, [open.id]: event.target.value }))}
                    />
                  </details>
                </div>
                <div className="hh-answer-bar">
                  <div className="hh-answer-bar-row">
                    <span className="hh-mono-sm">
                      {answeredCount} of {requiredCount} required answered
                    </span>
                    <button type="submit" className="hh-button" data-variant="primary" aria-keyshortcuts="Meta+Enter Control+Enter">
                      <Icon name="send" /> Send Answer
                      <kbd className="hh-kbd" aria-hidden="true">
                        ⌘↵
                      </kbd>
                    </button>
                  </div>
                  {error ? (
                    <p key={error.key} className="hh-error" role="alert">
                      <span className="hh-badge" data-tone="destructive">
                        Error
                      </span>
                      {error.text}
                    </p>
                  ) : null}
                </div>
              </form>
            ) : (
              <div className="hh-empty-state">
                <Icon name="bay" />
                <p className="hh-heading-md">No Round open</p>
                <p className="hh-body-sm">{pending.length ? 'Pick a strip, or press J.' : 'Nothing is waiting for you.'}</p>
              </div>
            )}
            <KbdHints label={`Keyboard shortcuts (${context})`} />
          </div>
        </div>
      </div>

      {showLog ? (
        <div className="hh-stack">
          <Heading className="hh-heading-md">Answered log</Heading>
          <AnsweredLog entries={log} caption={`Answered log (${context})`} />
        </div>
      ) : null}
    </div>
  );
}

export function EmptyBay() {
  return (
    <div className="hh-strip-bay-empty">
      <div className="hh-empty-state">
        <Icon name="bay" />
        <p className="hh-heading-md">Bay clear</p>
        <p className="hh-body-sm">No Rounds pending. New Rounds land here as Agents send them.</p>
      </div>
      <div className="hh-strip-bay-slot" aria-hidden="true" />
      <div className="hh-strip-bay-slot" aria-hidden="true" />
    </div>
  );
}
