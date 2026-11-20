'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { FAULTS } from '../fixtures';
import { Icon } from './Icon';
import { formatSplit, LengthStrip, SplitReadout, type LengthCell } from './readouts';
import { FaultFlag, ProfileSwitcher, Rating } from './widgets';

// The Capture preview model shared by the Tap Pad and the Review sheet: one Swim, its Capture events, and its state.
// Undo never deletes an event; it supersedes it (marked undone), as the glossary requires.

type FocusId = 'kicks' | 'strokes';
type Kind = 'wall' | FocusId;
type CaptureEvent = { id: number; kind: Kind; at: number; undone: boolean };
export type CaptureStatus = 'ready' | 'live' | 'ended';
type HeadingLevel = 2 | 3 | 4;

const FOCUS: FocusId[] = ['kicks', 'strokes'];
const NOUN: Record<Kind, string> = { wall: 'wall tap', kicks: 'underwater kick', strokes: 'stroke' };
const NOUNS: Record<FocusId, string> = { kicks: 'underwater kicks', strokes: 'strokes' };
/** Short names for the undo buttons, so three fit a phone row; the full noun is read out with the new count. */
const SHORT_NOUN: Record<FocusId, string> = { kicks: 'kick', strokes: 'stroke' };
const METRIC_LABEL: Record<FocusId, string> = { kicks: 'Underwater kicks', strokes: 'Strokes' };

export type CaptureLength = { number: number; split?: number; kicks: number; strokes: number };

/** A mid-Swim example: two Lengths done, the third under way. Times in ms from the start. */
function midSwimTimeline(): [Kind, number][] {
  const out: [Kind, number][] = [];
  const spread = (kind: Kind, count: number, from: number, to: number) => {
    for (let index = 0; index < count; index += 1) out.push([kind, from + (index * (to - from)) / Math.max(count - 1, 1)]);
  };
  spread('kicks', 6, 400, 2400);
  spread('strokes', 16, 3000, 17000);
  out.push(['wall', 17840]);
  spread('kicks', 5, 18300, 20300);
  spread('strokes', 17, 21000, 37000);
  out.push(['wall', 37760]);
  spread('kicks', 4, 38200, 40000);
  spread('strokes', 6, 41000, 46000);
  return out;
}

/** One Swim being captured: its state, derived Lengths, the last announcement, and the actions the Tap Pad calls. */
export interface Capture {
  lengths: number;
  status: CaptureStatus;
  startedAt: number;
  elapsed: number;
  events: CaptureEvent[];
  walls: CaptureEvent[];
  lengthData: CaptureLength[];
  /** Index of the Length under way (or the last one once the Swim has ended). */
  current: number;
  flash: string | null;
  message: string;
  start(): void;
  seedMidSwim(): void;
  tap(kind: Kind): void;
  undo(kind: Kind, id?: number): void;
  end(): void;
  resume(): void;
}

export function useCapture(lengths = 4): Capture {
  const [status, setStatus] = useState<CaptureStatus>('ready');
  const [endedBy, setEndedBy] = useState<'distance' | 'early' | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [endedAt, setEndedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [events, setEvents] = useState<CaptureEvent[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const nextId = useRef(1);

  useEffect(() => {
    if (status !== 'live') return;
    const timer = window.setInterval(() => setNow(performance.now()), 50);
    return () => window.clearInterval(timer);
  }, [status]);

  const active = events.filter((event) => !event.undone);
  const walls = active.filter((event) => event.kind === 'wall');
  const elapsed = status === 'ready' ? 0 : (status === 'live' ? now : endedAt) - startedAt;
  const lengthIndexAt = (at: number) => walls.filter((wall) => wall.at < at).length;
  const lengthData: CaptureLength[] = Array.from({ length: lengths }, (_, index) => {
    const from = index === 0 ? startedAt : (walls[index - 1]?.at ?? Number.POSITIVE_INFINITY);
    const to = walls[index]?.at ?? Number.POSITIVE_INFINITY;
    const count = (kind: FocusId) => active.filter((event) => event.kind === kind && event.at > from && event.at <= to).length;
    return { number: index + 1, split: walls[index] ? walls[index].at - from : undefined, kicks: count('kicks'), strokes: count('strokes') };
  });
  const current = Math.min(walls.length, lengths - 1);

  function begin(at: number, seeded: CaptureEvent[] = []) {
    setEvents(seeded);
    nextId.current = seeded.length + 1;
    setStartedAt(at);
    setNow(performance.now());
    setEndedAt(0);
    setEndedBy(null);
    setFlash(null);
    setStatus('live');
  }

  function start() {
    begin(performance.now());
    setMessage('Recording. Tap the wall at each turn.');
  }

  /** Jump to the illustrative mid-Swim example (used by gallery frames). */
  function seedMidSwim() {
    const startAt = performance.now() - 47000;
    begin(
      startAt,
      midSwimTimeline().map(([kind, offset], index) => ({ id: index + 1, kind, at: startAt + offset, undone: false })),
    );
    setMessage('Example Swim under way: Length 3 of 4.');
  }

  function tap(kind: Kind) {
    if (status !== 'live') return;
    const at = performance.now();
    const event = { id: nextId.current++, kind, at, undone: false };
    setEvents((list) => [...list, event]);
    setNow(at);
    setFlash(`${kind}-${event.id}`);
    if (kind !== 'wall') return;
    const finished = walls.length;
    const from = finished === 0 ? startedAt : walls[finished - 1].at;
    const done = lengthData[finished];
    const summary = `Length ${finished + 1}: ${((at - from) / 1000).toFixed(1)} seconds, ${done.strokes} ${NOUNS.strokes}, ${done.kicks} ${NOUNS.kicks}.`;
    if (finished + 1 >= lengths) {
      setStatus('ended');
      setEndedAt(at);
      setEndedBy('distance');
      setMessage(`${summary} Swim complete at ${formatSplit(at - startedAt)}.`);
    } else {
      setMessage(summary);
    }
  }

  function undo(kind: Kind, id?: number) {
    const target = id !== undefined ? active.find((event) => event.id === id) : [...active].reverse().find((event) => event.kind === kind);
    if (!target) return;
    setEvents((list) => list.map((event) => (event.id === target.id ? { ...event, undone: true } : event)));
    setFlash(null);
    const index = lengthIndexAt(target.at);
    if (target.kind === 'wall') {
      if (status === 'ended' && endedBy === 'distance') {
        setStatus('live');
        setEndedBy(null);
        setEndedAt(0);
      }
      setMessage(`Undid wall tap. Length ${index + 1} is open again.`);
    } else {
      const left = Math.max(0, lengthData[index][target.kind] - 1);
      setMessage(`Undid ${NOUN[target.kind]}. ${METRIC_LABEL[target.kind]}, Length ${index + 1}: ${left}.`);
    }
  }

  function end() {
    if (status !== 'live') return;
    const at = performance.now();
    setStatus('ended');
    setEndedAt(at);
    setEndedBy('early');
    setFlash(null);
    setMessage(`Swim ended at ${formatSplit(at - startedAt)}. Resume to keep recording, or review this Swim.`);
  }

  function resume() {
    if (status !== 'ended') return;
    if (endedBy === 'distance') {
      undo('wall');
      return;
    }
    setStatus('live');
    setEndedBy(null);
    setEndedAt(0);
    setMessage('Recording again.');
  }

  return { lengths, status, startedAt, elapsed, events, walls, lengthData, current, flash, message, start, seedMidSwim, tap, undo, end, resume };
}

function Heading({ level, id, className, children }: { level: HeadingLevel; id: string; className: string; children: ReactNode }) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
}

/**
 * The Tap Pad: counters, then the full-width Wall key, then the undo cluster, all in thumb reach; the tap log grows below
 * so the cluster never moves. Shortcuts work while focus is inside the pad (not in editable fields): Space starts or taps
 * the wall, 1 and 2 add to the counters, Shift + 1 / 2 undo a counter, Backspace undoes the last wall tap. One status
 * line announces each completed Length and each undo. Once the Swim ends the keys give way to a compact count summary,
 * so the ended pad is a result beside the Review sheet rather than a disabled instrument.
 */
export function TapPad({
  capture,
  headingLevel,
  swimLabel = '100 m freestyle',
  poolLength = 25,
  endInHead = true,
  onReview,
  reviewHref,
}: {
  capture: Capture;
  headingLevel: HeadingLevel;
  swimLabel?: string;
  poolLength?: number;
  endInHead?: boolean;
  onReview?: () => void;
  reviewHref?: string;
}) {
  const titleId = useId();
  const hintId = useId();
  const padRef = useRef<HTMLElement>(null);
  const previousStatus = useRef(capture.status);
  const { status, lengths, walls, lengthData, current, flash } = capture;
  const live = status === 'live';
  const counts = lengthData[current];

  // Ending removes the keys (and End Swim); Resume removes itself. When the control that had focus disappears, focus
  // lands on the control that continues the task: Resume after the end, the Wall key after resuming.
  useEffect(() => {
    const was = previousStatus.current;
    previousStatus.current = status;
    if (was === status || (document.activeElement && document.activeElement !== document.body)) return;
    if (status === 'ended') padRef.current?.querySelector<HTMLElement>('[data-action="resume"]')?.focus();
    else if (status === 'live' && was === 'ended') padRef.current?.querySelector<HTMLElement>('[data-tap="wall"]')?.focus();
  }, [status]);

  const cells: LengthCell[] = lengthData.map((length, index) => ({
    number: length.number,
    value: length.split !== undefined ? formatSplit(length.split) : undefined,
    state: index < walls.length ? 'done' : index === walls.length && live ? 'current' : 'upcoming',
  }));

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (event.altKey || event.ctrlKey || event.metaKey || target.closest('input, textarea, select, [contenteditable="true"]')) return;
    // Space keeps its native meaning on the undo cluster, log, and header buttons.
    if (event.key === ' ' && !target.closest('.sb-action-row, .sb-tap-log, .sb-tap-pad-head')) {
      event.preventDefault();
      if (status === 'ready') capture.start();
      else capture.tap('wall');
      return;
    }
    if (event.key === 'Backspace') {
      event.preventDefault();
      capture.undo('wall');
      return;
    }
    const digit = /^Digit([12])$/.exec(event.code)?.[1];
    const kind = digit ? FOCUS[Number(digit) - 1] : undefined;
    if (!kind) return;
    event.preventDefault();
    if (event.shiftKey) capture.undo(kind);
    else capture.tap(kind);
  }

  const statusWord = { ready: 'Ready', live: 'Recording', ended: 'Ended' }[status];
  const log = capture.events.slice(-5).reverse();
  const lastWall = walls.at(-1);

  return (
    <section ref={padRef} className="sb-tap-pad" data-state={live ? 'live' : undefined} data-phase={status} aria-labelledby={titleId} onKeyDown={onKeyDown}>
      <div className="sb-tap-pad-head">
        <Heading level={headingLevel} id={titleId} className="sb-heading-md">
          Tap Pad · {swimLabel}
        </Heading>
        <span className="sb-live-mark" data-state={live ? 'live' : 'idle'}>
          {statusWord}
        </span>
        {endInHead && live ? (
          <button type="button" className="sb-button" data-variant="secondary" data-action="end-swim" onClick={capture.end}>
            <Icon name="stop" /> End Swim
          </button>
        ) : null}
      </div>
      <SplitReadout
        value={formatSplit(capture.elapsed)}
        live={live}
        caption={[`Length ${current + 1} of ${lengths}`, `${poolLength} m pool`, live ? 'running split' : status === 'ended' ? 'final time' : 'ready']}
      />
      <LengthStrip label="Lengths and splits" cells={cells} unit="seconds" />
      {status === 'ended' ? (
        <dl className="sb-tap-summary">
          {FOCUS.map((kind) => (
            <div key={kind}>
              <dt className="sb-label">{METRIC_LABEL[kind]}</dt>
              <dd className="sb-numeral" data-size="lg" data-tone="metric">
                {lengthData.reduce((sum, length) => sum + length[kind], 0)}
              </dd>
            </div>
          ))}
          <div>
            <dt className="sb-label">Lengths</dt>
            <dd>
              <span className="sb-numeral" data-size="lg">
                {walls.length}
              </span>{' '}
              <span className="sb-body-sm">of {lengths}</span>
            </dd>
          </div>
        </dl>
      ) : (
        <div className="sb-tap-keys" role="group" aria-label={`Tap keys, ${swimLabel}`} aria-describedby={hintId}>
          {FOCUS.map((kind, index) => (
            <button
              key={kind}
              type="button"
              className="sb-tap-key"
              data-kind="counter"
              data-tap={kind}
              data-flash={flash?.startsWith(`${kind}-`) ? 'true' : undefined}
              disabled={!live}
              onClick={() => capture.tap(kind)}
              aria-label={`Add ${NOUN[kind]}, now ${counts[kind]}`}
            >
              <span className="sb-numeral" data-size="lg">
                {counts[kind]}
              </span>
              <span className="sb-tap-key-label">{METRIC_LABEL[kind]}</span>
              <kbd className="sb-kbd">{index + 1}</kbd>
            </button>
          ))}
          <button
            type="button"
            className="sb-tap-key"
            data-kind="wall"
            data-tap="wall"
            data-action={live ? undefined : 'start-swim'}
            data-flash={flash?.startsWith('wall-') ? 'true' : undefined}
            onClick={() => (live ? capture.tap('wall') : capture.start())}
          >
            <Icon name={live ? 'wall' : 'play'} />
            <span className="sb-tap-key-label">{live ? 'Wall tap' : 'Start Swim'}</span>
            <span className="sb-body-sm">{live ? (walls.length + 1 >= lengths ? 'Finish touch' : `Ends Length ${current + 1}`) : 'Then tap here at every wall'}</span>
            <kbd className="sb-kbd">Space</kbd>
          </button>
        </div>
      )}
      {/* Keys keep React from reusing Resume's node as "Undo wall tap" (focus would silently move onto a different action). */}
      <div className="sb-action-row">
        {status === 'ended' ? (
          <>
            <button key="resume" type="button" className="sb-button" data-variant="secondary" data-action="resume" onClick={capture.resume}>
              <Icon name="play" /> Resume
            </button>
            {reviewHref ? (
              <a className="sb-button" href={reviewHref}>
                Review this Swim
              </a>
            ) : (
              <button type="button" className="sb-button" onClick={onReview}>
                Review this Swim
              </button>
            )}
          </>
        ) : (
          <>
            <button key="undo-wall" type="button" className="sb-button" data-variant="secondary" disabled={!live || !lastWall} onClick={() => capture.undo('wall')}>
              <Icon name="undo" /> Undo wall tap
            </button>
            {FOCUS.map((kind) => (
              <button key={kind} type="button" className="sb-button" data-variant="secondary" disabled={!live || counts[kind] === 0} onClick={() => capture.undo(kind)}>
                <Icon name="undo" /> Undo {SHORT_NOUN[kind]}
                <span className="sb-visually-hidden">: {NOUN[kind]}, back to {Math.max(0, counts[kind] - 1)}</span>
              </button>
            ))}
          </>
        )}
      </div>
      <p className="sb-tap-status" role="status">
        {capture.message}
      </p>
      {status === 'ended' ? null : (
        <p id={hintId} className="sb-tap-hint sb-body-sm sb-muted">
          Keys: <kbd className="sb-kbd">Space</kbd> wall, <kbd className="sb-kbd">1</kbd> <kbd className="sb-kbd">2</kbd> counters, <kbd className="sb-kbd">Shift</kbd> +{' '}
          <kbd className="sb-kbd">1</kbd> / <kbd className="sb-kbd">2</kbd> undo a counter, <kbd className="sb-kbd">Backspace</kbd> undo the wall tap.
        </p>
      )}
      {log.length ? (
        <div className="sb-stack" data-gap="tight">
          <span className="sb-label">Last taps</span>
          <ul className="sb-tap-log">
            {log.map((event) => (
              <li key={event.id}>
                <span>
                  {event.undone ? <s>{NOUN[event.kind]}</s> : NOUN[event.kind]} · {formatSplit(event.at - capture.startedAt)}
                  {event.undone ? ' · undone' : ''}
                </span>
                {!event.undone && status !== 'ready' ? (
                  <button type="button" className="sb-button" data-variant="ghost" onClick={() => capture.undo(event.kind, event.id)}>
                    Undo <span className="sb-visually-hidden">{NOUN[event.kind]} at {formatSplit(event.at - capture.startedAt)}</span>
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** A Tap Pad with its own preview model, for the component reference. */
export function TapPadDemo({ headingLevel, reviewHref }: { headingLevel: HeadingLevel; reviewHref?: string }) {
  const capture = useCapture();
  return <TapPad capture={capture} headingLevel={headingLevel} reviewHref={reviewHref} />;
}

/** Count correction on the Review sheet: minus, the value, plus. */
function Stepper({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const id = useId();
  return (
    <div className="sb-row" data-justify="between">
      <span id={id} className="sb-label">
        {label}
      </span>
      <span className="sb-stepper" role="group" aria-labelledby={id}>
        <button type="button" className="sb-icon-button" aria-label={`One fewer: ${label}`} onClick={() => onChange(Math.max(0, value - 1))}>
          <Icon name="minus" />
        </button>
        <output className="sb-numeral" aria-live="polite">
          {value}
        </output>
        <button type="button" className="sb-icon-button" aria-label={`One more: ${label}`} onClick={() => onChange(value + 1)}>
          <Icon name="plus" />
        </button>
      </span>
    </div>
  );
}

export type ReviewSwim = { title: string; time: string; lengths: { number: number; split?: string; kicks: number; strokes: number }[] };

/**
 * The Review sheet for one Swim: check each Length's counts, rate technique, note Faults, add context. It shows the Swim
 * it is given (the captured one in /specimen). Saving is simulated and says so; any edit after saving marks it changed.
 */
export function ReviewSheet({ swim, headingLevel, label, compact = false }: { swim: ReviewSwim; headingLevel: HeadingLevel; label: string; compact?: boolean }) {
  const titleId = useId();
  const [selected, setSelected] = useState(() => Math.max(1, swim.lengths.filter((length) => length.split).length));
  // The Length toolbar is one tab stop: the cell last focused keeps tabindex 0, the rest -1 (APG toolbar, roving focus).
  const [rovingNumber, setRovingNumber] = useState(selected);
  const [corrections, setCorrections] = useState<Record<string, number>>({});
  const [saveState, setSaveState] = useState<'unsaved' | 'saved' | 'changed'>('unsaved');
  const edited = () => setSaveState((state) => (state === 'saved' ? 'changed' : state));
  const signature = JSON.stringify(swim);
  const firstSignature = useRef(signature);

  // The captured Swim changed under the sheet (an undo or a resumed Swim): a saved review is no longer current.
  useEffect(() => {
    if (signature !== firstSignature.current) {
      firstSignature.current = signature;
      setSaveState((state) => (state === 'saved' ? 'changed' : state));
    }
  }, [signature]);

  const length = swim.lengths.find((candidate) => candidate.number === selected) ?? swim.lengths[0];
  const tabStop = swim.lengths.some((candidate) => candidate.number === rovingNumber) ? rovingNumber : length.number;
  const valueOf = (kind: FocusId) => corrections[`${length.number}-${kind}`] ?? length[kind];
  const correct = (kind: FocusId, value: number) => {
    setCorrections((current) => ({ ...current, [`${length.number}-${kind}`]: value }));
    edited();
  };

  /** Left/Right move between Lengths (wrapping), Home/End jump to the first/last; Enter and Space select (native buttons). */
  function onLengthKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const cells = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button.sb-length-cell')];
    const from = cells.indexOf(event.target as HTMLButtonElement);
    const moves: Record<string, number | undefined> = { ArrowRight: from + 1, ArrowLeft: from - 1 + cells.length, Home: 0, End: cells.length - 1 };
    const to = moves[event.key];
    if (from < 0 || to === undefined) return;
    event.preventDefault();
    cells[to % cells.length].focus();
  }

  const saveMessage = {
    unsaved: 'Not saved yet.',
    saved: 'Saved in this preview only. Nothing is stored, and no trend changes.',
    changed: 'Changed since you saved. Save again to keep these edits in this preview.',
  }[saveState];

  return (
    <form
      className="sb-review-sheet"
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault();
        setSaveState('saved');
      }}
    >
      <div className="sb-card-head">
        <Heading level={headingLevel} id={titleId} className="sb-heading-md">
          Review sheet
        </Heading>
        <span className="sb-body-sm sb-muted">
          {swim.title} · {swim.time}
        </span>
      </div>
      <div className="sb-review-section">
        <span className="sb-label">Check the counts</span>
        <div className="sb-length-strip" role="toolbar" aria-label="Choose a Length to check" onKeyDown={onLengthKeyDown}>
          {swim.lengths.map((candidate) => (
            <button
              key={candidate.number}
              type="button"
              className="sb-length-cell"
              data-state={candidate.split ? 'done' : 'upcoming'}
              aria-pressed={candidate.number === length.number}
              tabIndex={candidate.number === tabStop ? 0 : -1}
              onFocus={() => setRovingNumber(candidate.number)}
              onClick={() => setSelected(candidate.number)}
            >
              <span className="sb-length-cell-number">L{candidate.number}</span>
              <span className="sb-length-cell-value">{candidate.split ?? '–'}</span>
            </button>
          ))}
        </div>
        <Stepper label={`Underwater kicks, Length ${length.number}`} value={valueOf('kicks')} onChange={(value) => correct('kicks', value)} />
        {compact ? null : <Stepper label={`Strokes, Length ${length.number}`} value={valueOf('strokes')} onChange={(value) => correct('strokes', value)} />}
      </div>
      <div className="sb-review-section">
        <Rating label="Head position" defaultValue={4} onChange={edited} />
      </div>
      <div className="sb-review-section">
        <span className="sb-label">Faults you noticed</span>
        <div className="sb-chip-group">
          {FAULTS.map((fault, index) => (
            <FaultFlag key={fault.id} label={fault.label} note={fault.note} defaultNoted={index === 0} onChange={edited} />
          ))}
        </div>
      </div>
      {compact ? null : (
        <div className="sb-review-section">
          <label htmlFor={`${titleId}-notes`} className="sb-label">
            Context
          </label>
          <textarea id={`${titleId}-notes`} className="sb-textarea" defaultValue="Tired after the kick set. Lane shared with two others." onChange={edited} />
        </div>
      )}
      <div className="sb-action-row">
        <button type="submit" className="sb-button" data-size="lg">
          <Icon name="check" /> Save Swim
        </button>
        <span role="status" className="sb-body-sm">
          {saveMessage}
        </span>
      </div>
    </form>
  );
}

/**
 * /specimen: one Swim shared by the Tap Pad and the Review sheet. The slim app bar holds the Swimmer (locked while
 * recording) and End Swim. Before and while recording the screen is one centred Capture region at every width; once the
 * Swim ends it becomes the out-and-back pair: the ended Tap Pad as a compact result beside (or above) the Review sheet.
 */
export function CaptureSpecimen({ meta }: { meta: ReactNode }) {
  const capture = useCapture();
  const reviewRef = useRef<HTMLDivElement>(null);
  const { status, elapsed, lengthData } = capture;
  const live = status === 'live';
  const seedMidSwim = capture.seedMidSwim;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('demo') === 'midswim') seedMidSwim();
    // Seed once on load; the model owns the Swim from then on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swim: ReviewSwim = useMemo(
    () => ({
      title: '100 m freestyle',
      time: formatSplit(elapsed),
      lengths: lengthData.map((length) => ({ number: length.number, split: length.split !== undefined ? formatSplit(length.split) : undefined, kicks: length.kicks, strokes: length.strokes })),
    }),
    [elapsed, lengthData],
  );

  function openReview() {
    // Land keyboard users on the sheet's first stop, the Length toolbar's current cell.
    reviewRef.current?.querySelector<HTMLElement>('[role="toolbar"] [tabindex="0"]')?.focus();
    reviewRef.current?.scrollIntoView({ block: 'start' });
  }

  return (
    <div className="sb-capture" data-phase={status}>
      <a className="sb-skip-link" href="#main">
        Skip to Capture
      </a>
      <header className="sb-app-bar">
        <span className="sb-wordmark">
          <Icon name="clock" /> Splitbook
        </span>
        <div className="sb-row">
          <ProfileSwitcher locked={live} />
          {live ? (
            <button type="button" className="sb-button" data-variant="secondary" data-action="end-swim" onClick={capture.end}>
              <Icon name="stop" /> End Swim
            </button>
          ) : null}
        </div>
      </header>
      <main className="sb-specimen-body" id="main" tabIndex={-1} aria-labelledby="specimen-title">
        <div className="sb-capture-intro">
          <h1 id="specimen-title" className="sb-heading-lg">
            Tuesday squad · Capture
          </h1>
          {meta}
        </div>
        <div className="sb-pair sb-capture-pair">
          <div className="sb-capture-pad">
            <TapPad capture={capture} headingLevel={2} endInHead={false} onReview={openReview} />
          </div>
          {status === 'ended' ? (
            <>
              <div className="sb-pair-axis" aria-hidden="true" />
              <div className="sb-capture-review" ref={reviewRef}>
                <ReviewSheet key={capture.startedAt} swim={swim} headingLevel={2} label="Review sheet for this Swim" />
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
