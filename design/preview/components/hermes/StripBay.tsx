'use client';

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ANSWERED_LOG, ROUNDS, agentById, questionCount, type AnswerValue, type LogEntry, type Question, type Round } from '../../fixtures';
import { Icon } from '../Icon';
import { AnsweredLog } from './AnsweredLog';
import { Callsign } from './Callsign';
import { ConnectionStatus, type ConnectionState } from './ConnectionStatus';
import { KbdHints } from './KbdHints';
import { PolicyBadge } from './PolicyTimer';
import { QuestionBlock, isAnswered } from './QuestionBlock';
import { Strip, recommendedText } from './Strip';

type Answers = Record<string, Record<string, AnswerValue>>;

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

const isTyping = (target: EventTarget) =>
  target instanceof HTMLElement && (target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable || (target.tagName === 'INPUT' && !['radio', 'checkbox', 'button'].includes((target as HTMLInputElement).type)));

type StripBayProps = {
  /** Rounds in the bay at load; defaults to the illustrative fixtures. Pass [] for the empty bay. */
  initialRounds?: Round[];
  /** Show demo controls (connection state, reset) and the answered log. */
  controls?: boolean;
  showLog?: boolean;
  heading?: string;
};

/**
 * The working triage screen: the strip bay beside the open Round. Timers tick, Unanswered Policies fire, the Answer bar
 * sends the whole Round, and the keyboard drives it (J/K, 1–9, A/R, ⌘/Ctrl+Enter) while focus is inside it.
 */
export function StripBay({ initialRounds = ROUNDS, controls = true, showLog = true, heading = 'Strip bay' }: StripBayProps) {
  const uid = useId();
  const [rounds, setRounds] = useState<Round[]>(initialRounds);
  const [log, setLog] = useState<LogEntry[]>(ANSWERED_LOG);
  const [openId, setOpenId] = useState<string | null>(initialRounds.find((round) => round.status === 'pending')?.id ?? null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(openId ? [openId] : []));
  const [answers, setAnswers] = useState<Answers>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [shortcuts, setShortcuts] = useState(true);
  const [connection, setConnection] = useState<ConnectionState>('live');
  const [announcement, setAnnouncement] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const heads = useRef(new Map<string, HTMLButtonElement>());

  const pending = rounds.filter((round) => round.status === 'pending');
  const open = rounds.find((round) => round.id === openId && round.status === 'pending') ?? null;

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
    setAnnouncement(due.map((round) => `${round.id} expired. ${outcomes.get(round.id)}.`).join(' '));
  }, [rounds]);

  const openRound = useCallback((id: string, focus = false) => {
    setOpenId(id);
    setCurrentQ(0);
    setError(null);
    setExpanded((previous) => new Set(previous).add(id));
    if (focus) heads.current.get(id)?.focus();
  }, []);

  function toggle(id: string) {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function setAnswer(round: Round, questionId: string, value: AnswerValue) {
    setAnswers((previous) => ({ ...previous, [round.id]: { ...previous[round.id], [questionId]: value } }));
    setError(null);
  }

  function send() {
    if (!open) return;
    if (connection === 'offline') {
      setError('Not sent. The Hub is offline; your Answers stay here until it is back.');
      return;
    }
    const roundAnswers = answers[open.id] ?? {};
    const missing = open.questions.map((question, index) => (isAnswered(question, roundAnswers[question.id]) ? null : `Q${index + 1}`)).filter(Boolean);
    if (missing.length) {
      const message = `Not sent. ${missing.join(', ')} ${missing.length === 1 ? 'needs' : 'need'} an Answer.`;
      setError(message);
      setAnnouncement(message);
      return;
    }
    const at = now();
    const agent = agentById(open.agentId);
    setRounds((previous) => previous.filter((round) => round.id !== open.id));
    setLog((previous) => [{ id: open.id, agentId: open.agentId, title: open.title, status: 'answered', at, summary: summarise(open, roundAnswers, notes[open.id] ?? '') }, ...previous]);
    const message = `Answer sent · ${open.id} · ${questionCount(open)} delivered to ${agent.callsign}.`;
    setToast(message);
    setAnnouncement(message);
    const next = pending.find((round) => round.id !== open.id);
    if (next) openRound(next.id, true);
    else setOpenId(null);
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

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      send();
      return;
    }
    if (!shortcuts || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
    const key = event.key.toLowerCase();
    if (key === 'j' || key === 'k') {
      if (!pending.length) return;
      event.preventDefault();
      const index = pending.findIndex((round) => round.id === openId);
      const next = pending[(index + (key === 'j' ? 1 : -1) + pending.length) % pending.length];
      openRound(next.id, true);
      return;
    }
    if (!open) return;
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      pick(open.questions[currentQ], open, Number(event.key));
      return;
    }
    if (key === 'a' || key === 'r') {
      const current = open.questions[currentQ];
      const target = current?.kind === 'approve' ? current : open.questions.find((question) => question.kind === 'approve');
      if (!target) return;
      event.preventDefault();
      setAnswer(open, target.id, key === 'a' ? 'approve' : 'reject');
    }
  }

  function reset() {
    setRounds(initialRounds);
    setLog(ANSWERED_LOG);
    setAnswers({});
    setNotes({});
    setToast(null);
    setError(null);
    const first = initialRounds.find((round) => round.status === 'pending')?.id ?? null;
    setOpenId(first);
    setExpanded(new Set(first ? [first] : []));
  }

  const openAnswers = open ? answers[open.id] ?? {} : {};
  const answeredCount = open ? open.questions.filter((question) => question.kind !== 'text' && isAnswered(question, openAnswers[question.id])).length : 0;
  const requiredCount = open ? open.questions.filter((question) => question.kind !== 'text').length : 0;

  return (
    <div className="hh-stack">
      <div className="hh-command" onKeyDown={onKeyDown}>
        <section className="hh-strip-bay" aria-labelledby={`${uid}-bay`}>
          <div className="hh-strip-bay-head">
            <h3 id={`${uid}-bay`} className="hh-heading-md">
              {heading}
            </h3>
            <span className="hh-live-value" data-live={connection === 'live' ? 'true' : undefined}>
              {pending.length} pending
            </span>
            <ConnectionStatus state={connection} detail={CONNECTION_DETAIL[connection]} />
          </div>
          {controls ? (
            <div className="hh-row">
              <button type="button" role="switch" aria-checked={shortcuts} className="hh-switch" onClick={() => setShortcuts(!shortcuts)}>
                <span className="hh-switch-track" aria-hidden="true">
                  <span className="hh-switch-thumb" />
                </span>
                <span className="hh-body-sm">Single-key shortcuts {shortcuts ? 'on' : 'off'}</span>
              </button>
              <fieldset className="hh-segmented" aria-label="Connection (demo)">
                {(['live', 'reconnecting', 'offline'] as const).map((state) => (
                  <label key={state}>
                    <input className="hh-visually-hidden" type="radio" name={`${uid}-connection`} checked={connection === state} onChange={() => setConnection(state)} />
                    {state === 'live' ? 'Live' : state === 'reconnecting' ? 'Reconnecting' : 'Offline'}
                  </label>
                ))}
              </fieldset>
            </div>
          ) : null}
          {rounds.length ? (
            <ul className="hh-strip-bay-list" data-density="compact" aria-label="Rounds in the bay">
              {rounds.map((round) => (
                <Strip
                  key={round.id}
                  round={round}
                  expanded={expanded.has(round.id)}
                  selected={round.id === openId && round.status === 'pending'}
                  onToggle={() => toggle(round.id)}
                  onOpen={() => openRound(round.id)}
                  headRef={(element) => {
                    if (element) heads.current.set(round.id, element);
                    else heads.current.delete(round.id);
                  }}
                />
              ))}
            </ul>
          ) : (
            <EmptyBay onReset={controls && initialRounds.length ? reset : undefined} />
          )}
        </section>

        <div className="hh-command-panel">
          {open ? (
            <form
              className="hh-round"
              aria-labelledby={`${uid}-round`}
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              <div className="hh-round-head">
                <div className="hh-row">
                  <span className="hh-badge" data-tone="pending">
                    Pending
                  </span>
                  <Callsign agentId={open.agentId} />
                  <span className="hh-mono-sm">
                    {open.id} · received {open.received}
                  </span>
                </div>
                <h3 id={`${uid}-round`} className="hh-strip-header">
                  {open.title}
                </h3>
                <PolicyBadge policy={open.policy} remaining={open.remaining} />
              </div>
              <ol className="hh-round-questions">
                {open.questions.map((question, index) => (
                  <QuestionBlock
                    key={`${open.id}-${question.id}`}
                    question={question}
                    index={index}
                    scope={`${uid}-${open.id}`}
                    value={openAnswers[question.id]}
                    onChange={(value) => setAnswer(open, question.id, value)}
                    current={index === currentQ}
                    onFocus={() => setCurrentQ(index)}
                    hints={shortcuts}
                  />
                ))}
              </ol>
              <div className="hh-answer-bar">
                <div className="hh-field">
                  <label className="hh-label" htmlFor={`${uid}-notes`}>
                    Notes for {agentById(open.agentId).callsign} (optional)
                  </label>
                  <textarea
                    id={`${uid}-notes`}
                    className="hh-textarea"
                    rows={1}
                    value={notes[open.id] ?? ''}
                    onChange={(event) => setNotes((previous) => ({ ...previous, [open.id]: event.target.value }))}
                  />
                </div>
                <div className="hh-answer-bar-row">
                  <span className="hh-mono-sm">
                    {answeredCount} of {requiredCount} required answered
                  </span>
                  <button type="submit" className="hh-button" data-variant="primary" aria-describedby={error ? `${uid}-error` : undefined}>
                    <Icon name="send" /> Send Answer
                    <kbd className="hh-kbd" aria-hidden="true">
                      ⌘↵
                    </kbd>
                  </button>
                </div>
                {error ? (
                  <p id={`${uid}-error`} className="hh-error">
                    <span className="hh-badge" data-tone="destructive">
                      Error
                    </span>
                    {error}
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
          <KbdHints />
        </div>
      </div>

      {showLog ? (
        <section className="hh-stack" aria-labelledby={`${uid}-log`}>
          <h3 id={`${uid}-log`} className="hh-heading-md">
            Answered log
          </h3>
          <AnsweredLog entries={log} />
        </section>
      ) : null}

      <p className="hh-visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
      {toast ? (
        <div className="hh-toast-region">
          <div className="hh-toast" role="status">
            <span className="hh-badge" data-tone="answered">
              Answered
            </span>
            <span className="hh-body-sm">{toast}</span>
            <button type="button" className="hh-button" data-variant="ghost" data-size="sm" onClick={() => setToast(null)}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function EmptyBay({ onReset }: { onReset?: () => void }) {
  return (
    <div className="hh-strip-bay-empty">
      <div className="hh-empty-state">
        <Icon name="bay" />
        <p className="hh-heading-md">Bay clear</p>
        <p className="hh-body-sm">No Rounds pending. New Rounds land here as Agents send them.</p>
        {onReset ? (
          <button type="button" className="hh-button" data-size="sm" onClick={onReset}>
            <Icon name="refresh" /> Reload the illustrative Rounds
          </button>
        ) : null}
      </div>
      <div className="hh-strip-bay-slot" aria-hidden="true" />
      <div className="hh-strip-bay-slot" aria-hidden="true" />
    </div>
  );
}
