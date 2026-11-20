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

/** Policy thresholds announced before the policy fires, in seconds left (5 min and 1 min). */
const THRESHOLDS = [300, 60] as const;

const now = () => new Date().toTimeString().slice(0, 5);

/** One Question's value in words, or "not answered". */
function valueText(question: Question, value: AnswerValue | undefined) {
  if (question.kind === 'text') return typeof value === 'string' && value.trim() ? value.trim() : 'no note';
  if (!isAnswered(question, value)) return 'not answered';
  if (question.kind === 'approve') return value === 'approve' ? 'Approve' : 'Reject';
  const ids = Array.isArray(value) ? value : [value];
  return question.options
    .filter((option) => ids.includes(option.id))
    .map((option) => option.label)
    .join(', ');
}

function summarise(round: Round, answers: Record<string, AnswerValue>, notes: string) {
  const parts = round.questions.map((question, index) => {
    const value = answers[question.id];
    if (question.kind === 'text') return typeof value === 'string' && value.trim() ? `Q${index + 1} note given` : `Q${index + 1} no note`;
    return `Q${index + 1} ${valueText(question, value)}`;
  });
  return [...parts, notes.trim() ? `notes: ${notes.trim()}` : ''].filter(Boolean).join(' · ');
}

function hasDraft(answers: Record<string, AnswerValue>, notes: string) {
  return notes.trim().length > 0 || Object.values(answers).some((value) => (Array.isArray(value) ? value.length > 0 : value.trim().length > 0));
}

/** The unsent draft as plain text for Copy draft: Round, each Question with its value, then the notes. */
function draftText(round: Round, answers: Record<string, AnswerValue>, notes: string) {
  return [
    `${round.id} · ${round.title} · Not sent`,
    ...round.questions.map((question, index) => `Q${index + 1} ${question.prompt} · ${valueText(question, answers[question.id])}`),
    notes.trim() ? `Notes: ${notes.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');
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
  /** Show demo controls (shortcut switch, connection state) and the bay's own connection readout. Without them, the page's app bar carries the one readout. */
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
  /** Gallery frames: honour ?view=round (open on the Round sheet) and ?demo=poll (call the first Round's approve/reject Question with its recommendation and hold the result). */
  demo?: boolean;
};

/**
 * The working triage screen: the strip bay beside the open Round (or, in a narrow container, the phone flow: a list of
 * strip buttons, then the Round as a full-width sheet with "Back to pending", in glance density unless the page sets one).
 * Timers tick, thresholds are announced, and policies fire: an expired Round leaves the bay for the answered log, and if it
 * was open its draft stays on screen as "Not sent" with Copy draft. The Answer bar sends the whole Round; the answered strip
 * stays mounted as data-state="departing" for --hh-motion-signature so worlds can animate it, then leaves.
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
  const [activeId, setActiveId] = useState<string | null>(firstPending);
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
  const [copyState, setCopyState] = useState('');
  // Threshold announcements: polite for the bay, assertive once for the open Round's final minute.
  const [announcement, setAnnouncement] = useState('');
  const [urgent, setUrgent] = useState<{ id: string; text: string } | null>(null);
  // Phone flow: the command grid has one column. Glance applies there unless the page set a density explicitly.
  const [stacked, setStacked] = useState(false);
  const [phoneDensity, setPhoneDensity] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const items = useRef(new Map<string, HTMLElement>());
  const roundRef = useRef<HTMLFormElement>(null);
  const roundHeadingRef = useRef<HTMLHeadingElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const bayHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<(() => void) | null>(null);
  const lastRemaining = useRef(new Map<string, number>());
  const finalMinuteAnnounced = useRef(new Set<string>());

  const pending = rounds.filter((round) => round.status === 'pending');
  // The bay lists actionable Rounds only (plus an answered strip while it departs); expired Rounds live in the answered log.
  const bayRounds = rounds.filter((round) => round.status === 'pending' || departing.has(round.id));
  const focusable = pending.filter((round) => !departing.has(round.id));
  const rovingId = focusable.some((round) => round.id === activeId) ? activeId : focusable[0]?.id ?? null;
  // The open Round stays open when its policy fires, so the Human keeps the draft; only a sent Round closes.
  const open = rounds.find((round) => round.id === openId && round.status !== 'answered') ?? null;
  const ended = open?.status === 'expired';
  const roundVisible = Boolean(open) && (!stacked || view === 'round');

  const isStacked = () => (gridRef.current ? getComputedStyle(gridRef.current).gridTemplateColumns.trim().split(/\s+/).length < 2 : false);

  // Run focus moves after the render that shows their target.
  useEffect(() => {
    const action = focusNext.current;
    focusNext.current = null;
    action?.();
  });

  // Track the phone flow and decide glance: on when stacked, unless <html> carries an explicit density (?density= wins).
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const update = () => {
      const next = isStacked();
      setStacked(next);
      setPhoneDensity(next && !document.documentElement.dataset.density);
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(grid);
    const density = new MutationObserver(update);
    density.observe(document.documentElement, { attributes: true, attributeFilter: ['data-density'] });
    return () => {
      resize.disconnect();
      density.disconnect();
    };
  }, []);

  // Fit the open Round to the viewport space below its top offset, so Send shows on entry and only the Question body
  // scrolls. Deep in a long page (offset past half the viewport) the Round falls back to its sticky fit.
  useEffect(() => {
    const form = roundRef.current;
    if (!form) return;
    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const panel = form.parentElement;
        if (!panel) return;
        const top = panel.getBoundingClientRect().top + window.scrollY;
        if (top < window.innerHeight / 2) form.style.setProperty('--round-top', `${Math.max(0, Math.round(top))}px`);
        else form.style.removeProperty('--round-top');
      });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(document.body);
    window.addEventListener('resize', fit);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [open?.id, view, stacked]);

  // Unanswered Policy clocks. The Hub owns real timers; the preview ticks once a second.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setRounds((previous) =>
        previous.map((round) => (round.status === 'pending' && round.policy.kind !== 'wait' && round.remaining > 0 ? { ...round, remaining: round.remaining - 1 } : round)),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Thresholds: 5 min and 1 min left are announced politely in the bay status region. The open Round's final minute is
  // announced once, assertively, in the Round (when it crosses the minute, or when it is opened inside it).
  useEffect(() => {
    const polite: string[] = [];
    for (const round of rounds) {
      if (round.status !== 'pending' || round.policy.kind === 'wait') continue;
      const before = lastRemaining.current.get(round.id);
      lastRemaining.current.set(round.id, round.remaining);
      const isOpen = round.id === open?.id && roundVisible;
      const action = round.policy.kind === 'cancel' ? 'then cancels' : 'then applies recommended';
      if (isOpen && round.remaining <= 60 && round.remaining > 0 && !finalMinuteAnnounced.current.has(round.id)) {
        finalMinuteAnnounced.current.add(round.id);
        setUrgent({ id: round.id, text: `1 min left on this Round · ${action}` });
      }
      if (before === undefined) continue;
      const crossed = THRESHOLDS.find((threshold) => before > threshold && round.remaining <= threshold);
      if (crossed === undefined || (crossed === 60 && isOpen)) continue;
      polite.push(`${agentById(round.agentId).callsign} · ${crossed === 300 ? '5 min' : '1 min'} left · ${action}`);
    }
    if (polite.length) setAnnouncement(polite.join(' · '));
  }, [rounds, open?.id, roundVisible]);

  // A policy fires at zero: the Round expires, leaves the bay, and joins the answered log with what the policy did. An
  // open Round stays on screen with its draft, marked "Not sent"; the log keeps the draft too.
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
      ...due.map((round) => {
        const draft = answers[round.id] ?? {};
        const note = notes[round.id] ?? '';
        const unsent = hasDraft(draft, note) ? ` · Not sent: ${summarise(round, draft, note)}` : '';
        return { id: round.id, agentId: round.agentId, title: round.title, status: 'expired' as const, at, summary: `${outcomes.get(round.id) ?? ''}${unsent}` };
      }),
      ...previous,
    ]);
    setNotice({ tone: 'expired', text: due.map((round) => `${round.id} · ${outcomes.get(round.id)}`).join(' · '), key: Date.now() });
    if (openId && outcomes.has(openId)) {
      setError(null);
      setInvalid(new Set());
      if (notes[openId]?.trim()) setNotesOpen(true);
    }
    // A focused strip that leaves the bay hands focus to the next pending strip, or to the bay heading.
    if (due.some((round) => items.current.get(round.id)?.contains(document.activeElement))) {
      focusStrip(focusable.find((round) => !outcomes.has(round.id))?.id ?? null);
    }
    // Runs when the clock moves; answers and notes are read as of that tick.
  }, [rounds]);

  function focusStrip(id: string | null) {
    if (!id) {
      focusNext.current = () => bayHeadingRef.current?.focus();
      return;
    }
    setActiveId(id);
    focusNext.current = () => items.current.get(id)?.focus();
  }

  const openRound = useCallback((id: string, moveFocus: boolean) => {
    setOpenId(id);
    setActiveId(id);
    setCurrentQ(0);
    setError(null);
    setInvalid(new Set());
    setNotesOpen(false);
    setCopyState('');
    if (moveFocus && isStacked()) {
      setView('round');
      focusNext.current = () => {
        roundRef.current?.scrollIntoView({ block: 'start' });
        roundHeadingRef.current?.focus({ preventScroll: true });
      };
    }
  }, []);

  function closeRound() {
    if (!open) return;
    if (ended) {
      // The Round has left the bay: close it and return to the first pending strip.
      setOpenId(null);
      setView('queue');
      setCopyState('');
      focusStrip(rovingId);
      return;
    }
    const id = open.id;
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
    if (!open || ended) return;
    // Offline: Send is aria-disabled and its reason is already on screen; the draft stays as it is.
    if (connection === 'offline') return;
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

  async function copyDraft() {
    if (!open) return;
    try {
      await navigator.clipboard.writeText(draftText(open, answers[open.id] ?? {}, notes[open.id] ?? ''));
      setCopyState('Draft copied to the clipboard.');
    } catch {
      setCopyState('Not copied · the browser blocked the clipboard; select the Answers and notes above instead.');
    }
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

  // Strip bay keys. Desktop listbox: one Tab stop, roving focus, selection follows focus. Phone list: each strip is a
  // native button (Tab and swipe reach every one); arrows and J/K still move focus for a keyboard on a narrow window.
  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const index = focusable.findIndex((round) => round.id === rovingId);
    const key = event.key;
    let target: Round | undefined;
    if (key === 'ArrowDown' || (shortcuts && key.toLowerCase() === 'j')) target = focusable[Math.min(index + 1, focusable.length - 1)];
    else if (key === 'ArrowUp' || (shortcuts && key.toLowerCase() === 'k')) target = focusable[Math.max(index - 1, 0)];
    else if (key === 'Home') target = focusable[0];
    else if (key === 'End') target = focusable[focusable.length - 1];
    else if (!stacked && (key === 'Enter' || key === ' ')) {
      event.preventDefault();
      const round = focusable[index];
      if (round) openRound(round.id, true);
      return;
    }
    if (!target) return;
    event.preventDefault();
    focusStrip(target.id);
    // Side by side, selection follows focus so the Round beside the bay always matches the focused strip.
    if (!stacked) openRound(target.id, false);
  }

  function onRoundKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeRound();
      return;
    }
    if (ended) return;
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      send();
      return;
    }
    if (!shortcuts || event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
    const key = event.key.toLowerCase();
    const current = open.questions[currentQ];
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      pick(current, open, Number(event.key));
    } else if (key === 'a' || key === 'r') {
      // A and R act on the focused Question only, and only when it is approve/reject.
      if (current?.kind !== 'approve') return;
      event.preventDefault();
      setAnswer(open, current.id, key === 'a' ? 'approve' : 'reject');
    } else if (key === 'n') {
      event.preventDefault();
      setNotesOpen(true);
      focusNext.current = () => notesRef.current?.focus();
    }
  }

  // Gallery frames: ?view=round opens on the Round sheet (narrow frames would otherwise show only the queue), and
  // ?demo=poll (the /worlds signature trigger) makes the first Round's approve/reject Question the polling position, then
  // calls it with the Agent's recommendation. The called result holds until the frame reloads (replay or colour change).
  useEffect(() => {
    if (!demo) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'round') setView('round');
    if (params.get('demo') !== 'poll') return;
    const round = initialRounds.find((candidate) => candidate.status === 'pending');
    const position = round?.questions.findIndex((question) => question.kind === 'approve') ?? -1;
    if (!round || position < 0) return;
    // Scroll the Round body (never the page around the frame) so the poll module, where the call latches, is in view.
    const reveal = () => {
      const slot = document.getElementById(questionDomId(`${uid}-${round.id}`, round.questions[position].id))?.querySelector('.hh-question-response');
      const body = slot?.closest<HTMLElement>('.hh-round-body');
      if (slot && body) body.scrollTop += slot.getBoundingClientRect().top - body.getBoundingClientRect().top;
    };
    setCurrentQ(position);
    // Once the Round has its fitted height, show the polling position; then call it and keep it in view.
    const poll = window.setTimeout(reveal, signatureMs());
    const call = window.setTimeout(() => {
      setAnswers({ [round.id]: recommendedAnswers(round) });
      focusNext.current = reveal;
    }, signatureMs() * 2);
    return () => {
      window.clearTimeout(poll);
      window.clearTimeout(call);
    };
    // Runs once on mount.
  }, []);

  const openAnswers = open ? answers[open.id] ?? {} : {};
  const answeredCount = open ? open.questions.filter((question) => question.kind !== 'text' && isAnswered(question, openAnswers[question.id])).length : 0;
  const requiredCount = open ? open.questions.filter((question) => question.kind !== 'text').length : 0;
  // Poll tally: only a Round with two or more approve/reject Questions has an aggregate worth stating.
  const positions = open ? open.questions.filter((question) => question.kind === 'approve') : [];
  const go = positions.filter((question) => openAnswers[question.id] === 'approve').length;
  const noGo = positions.filter((question) => openAnswers[question.id] === 'reject').length;
  const scope = open ? `${uid}-${open.id}` : uid;
  const offline = connection === 'offline';
  const reasonId = `${uid}-send-reason`;
  const registerItem = (id: string) => (element: HTMLElement | null) => {
    if (element) items.current.set(id, element);
    else items.current.delete(id);
  };

  return (
    <div className="hh-stack" data-density={phoneDensity ? 'glance' : undefined}>
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

      {/* Bay status region: confirmations and policy outcomes land here, never over the next Round's Answer bar; threshold
          announcements ride along unseen. Empty until something happens. */}
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
        ) : null}
        <span className="hh-visually-hidden">{announcement}</span>
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
              {controls ? <ConnectionStatus state={connection} detail={CONNECTION_DETAIL[connection]} live /> : null}
            </div>
            {bayRounds.length === 0 ? (
              <EmptyBay />
            ) : stacked ? (
              <ul className="hh-strip-bay-list" data-density="compact" aria-label="Pending Rounds" onKeyDown={onListKeyDown}>
                {bayRounds.map((round) => (
                  <Strip
                    key={round.id}
                    mode="button"
                    round={round}
                    departing={departing.has(round.id)}
                    onFocus={() => setActiveId(round.id)}
                    onClick={() => openRound(round.id, true)}
                    itemRef={registerItem(round.id)}
                  />
                ))}
              </ul>
            ) : (
              <ul className="hh-strip-bay-list" data-density="compact" role="listbox" aria-label="Pending Rounds" aria-keyshortcuts="J K ArrowDown ArrowUp Home End Enter" onKeyDown={onListKeyDown}>
                {bayRounds.map((round) => (
                  <Strip
                    key={round.id}
                    mode="option"
                    round={round}
                    selected={round.id === openId}
                    departing={departing.has(round.id)}
                    tabIndex={round.id === rovingId ? 0 : -1}
                    onFocus={() => setActiveId(round.id)}
                    onClick={() => openRound(round.id, true)}
                    itemRef={registerItem(round.id)}
                  />
                ))}
              </ul>
            )}
            <KbdHints label={`Keyboard shortcuts (${context})`} />
          </section>

          <div className="hh-command-panel">
            {open ? (
              <form
                ref={roundRef}
                className="hh-round"
                data-state={ended ? 'ended' : undefined}
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
                    <span className="hh-badge" data-tone={ended ? 'expired' : 'pending'}>
                      {ended ? (open.policy.kind === 'cancel' ? 'Cancelled' : 'Expired') : 'Pending'}
                    </span>
                    <Callsign agentId={open.agentId} />
                    <span className="hh-mono-sm">
                      {open.id} · received {open.received}
                    </span>
                  </div>
                  <Heading ref={roundHeadingRef} tabIndex={-1} className="hh-strip-header">
                    {open.title}
                  </Heading>
                  {ended ? null : (
                    <div className="hh-round-policy">
                      <PolicyBadge policy={open.policy} remaining={open.remaining} />
                    </div>
                  )}
                  <p className="hh-visually-hidden" aria-live="assertive" aria-atomic="true">
                    {urgent?.id === open.id && !ended ? urgent.text : ''}
                  </p>
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
                        current={!ended && index === currentQ}
                        onFocus={() => setCurrentQ(index)}
                        hints={shortcuts && !ended}
                        invalid={invalid.has(question.id)}
                        readOnly={ended}
                      />
                    ))}
                  </ol>
                  <details className="hh-notes" open={notesOpen} onToggle={(event) => setNotesOpen(event.currentTarget.open)}>
                    <summary className="hh-notes-summary">
                      {ended ? `Notes for ${agentById(open.agentId).callsign} (not sent)` : `Add notes for ${agentById(open.agentId).callsign} (optional)`}
                      {shortcuts && !ended ? (
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
                      aria-keyshortcuts={ended ? undefined : 'N'}
                      readOnly={ended}
                      value={notes[open.id] ?? ''}
                      onChange={(event) => setNotes((previous) => ({ ...previous, [open.id]: event.target.value }))}
                    />
                  </details>
                </div>
                <div className="hh-answer-bar">
                  {ended ? (
                    <>
                      {/* Mounted once, when the policy fires, so it is announced once. */}
                      <div className="hh-alert" data-tone="warning" role="alert">
                        <span className="hh-badge" data-tone="expired">
                          Not sent
                        </span>
                        <p className="hh-body-sm">
                          {open.outcome}. Your draft is kept below{hasDraft(openAnswers, notes[open.id] ?? '') ? ' and in the answered log' : ''}.
                        </p>
                      </div>
                      <div className="hh-answer-bar-row">
                        <button type="button" className="hh-button" onClick={copyDraft}>
                          <Icon name="file" /> Copy draft
                        </button>
                        <button type="button" className="hh-button" data-variant="primary" onClick={closeRound}>
                          <Icon name="arrow-left" /> Back to pending
                        </button>
                      </div>
                      <p className="hh-body-sm" role="status">
                        {copyState}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="hh-answer-bar-row">
                        <span className="hh-answer-progress">
                          <span className="hh-mono-sm">
                            {answeredCount} of {requiredCount} required answered
                          </span>
                          {positions.length > 1 ? (
                            <span className="hh-answer-tally hh-mono-sm">
                              Poll · {go} approved · {noGo} rejected · {positions.length - go - noGo} open
                            </span>
                          ) : null}
                        </span>
                        <button
                          type="submit"
                          className="hh-button"
                          data-variant="primary"
                          aria-keyshortcuts="Meta+Enter Control+Enter"
                          aria-disabled={offline ? true : undefined}
                          aria-describedby={offline ? reasonId : undefined}
                        >
                          <Icon name="send" /> Send Answer
                          <kbd className="hh-kbd" aria-hidden="true">
                            ⌘↵
                          </kbd>
                        </button>
                      </div>
                      {offline ? (
                        <p id={reasonId} className="hh-error">
                          <span className="hh-badge" data-tone="expired">
                            Offline
                          </span>
                          Cannot send until the Hub is reachable. Your Answers stay here.
                        </p>
                      ) : null}
                      {error ? (
                        <p key={error.key} className="hh-error" role="alert">
                          <span className="hh-badge" data-tone="destructive">
                            Error
                          </span>
                          {error.text}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              </form>
            ) : (
              <div className="hh-empty-state">
                <Icon name="bay" />
                <p className="hh-heading-md">No Round open</p>
                <p className="hh-body-sm">{pending.length ? 'Pick a strip, or press J.' : 'Nothing is waiting for you.'}</p>
              </div>
            )}
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
