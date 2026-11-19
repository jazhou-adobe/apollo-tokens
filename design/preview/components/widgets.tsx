'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FAULTS, FOCUS_METRICS, HEAD_POSITION_CUES, SWIMMERS } from '../fixtures';
import { MenuButton } from './demos';
import { Icon } from './Icon';
import { formatSplit, LengthStrip, SplitReadout, type LengthCell } from './readouts';

type FocusId = (typeof FOCUS_METRICS)[number]['id'];
/** One Capture event. Undo never deletes it; it is superseded (marked undone), as the glossary requires. */
type CaptureEvent = { id: number; kind: 'wall' | FocusId; at: number; undone: boolean };

const KIND_LABEL: Record<CaptureEvent['kind'], string> = { wall: 'Wall tap', kicks: 'Underwater kick', strokes: 'Stroke' };

/**
 * The Tap Pad: start a Swim, tap the wall at each turn and finish, and tap one or two Focus-metric counters per Length.
 * Every tap can be undone (the last one, or any one in the log). Nothing here sits behind a dialog.
 */
export function TapPad({ lengths = 4, poolLength = 25, focus = ['kicks', 'strokes'] as FocusId[], swimLabel = '100 m freestyle' }) {
  const [status, setStatus] = useState<'ready' | 'live' | 'finished'>('ready');
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [events, setEvents] = useState<CaptureEvent[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const nextId = useRef(1);
  const titleId = useId();

  useEffect(() => {
    if (status !== 'live') return;
    const timer = window.setInterval(() => setNow(performance.now()), 50);
    return () => window.clearInterval(timer);
  }, [status]);

  const active = events.filter((event) => !event.undone);
  const walls = active.filter((event) => event.kind === 'wall');
  const elapsed = status === 'ready' ? 0 : (status === 'live' ? now : (walls.at(-1)?.at ?? now)) - startedAt;
  const currentLength = Math.min(walls.length + 1, lengths);
  const lastWall = walls.at(-1)?.at ?? startedAt;
  const countSince = (kind: FocusId) => active.filter((event) => event.kind === kind && event.at > lastWall).length;
  const splits = walls.map((wall, index) => wall.at - (index ? walls[index - 1].at : startedAt));

  const cells: LengthCell[] = Array.from({ length: lengths }, (_, index) => ({
    number: index + 1,
    value: splits[index] !== undefined ? formatSplit(splits[index]) : undefined,
    state: index < walls.length ? 'done' : index === walls.length && status === 'live' ? 'current' : 'upcoming',
  }));

  function record(kind: CaptureEvent['kind']) {
    if (status !== 'live') return;
    const at = performance.now();
    const event = { id: nextId.current++, kind, at, undone: false };
    setEvents((current) => [...current, event]);
    setNow(at);
    setFlash(`${kind}-${event.id}`);
    if (kind === 'wall' && walls.length + 1 >= lengths) setStatus('finished');
  }

  function start() {
    const at = performance.now();
    setEvents([]);
    setStartedAt(at);
    setNow(at);
    setFlash(null);
    setStatus('live');
  }

  function undo(id?: number) {
    const target = id ?? active.at(-1)?.id;
    if (target === undefined) return;
    setEvents((current) => current.map((event) => (event.id === target ? { ...event, undone: true } : event)));
    // Undoing the final wall tap reopens the Swim, so a mistaken finish is never final.
    if (status === 'finished' && events.find((event) => event.id === target)?.kind === 'wall') setStatus('live');
    setFlash(null);
  }

  const statusWord = { ready: 'Ready', live: 'Recording', finished: 'Finished' }[status];
  const log = events.slice(-5).reverse();

  return (
    <section className="sb-tap-pad" data-state={status === 'live' ? 'live' : 'idle'} aria-labelledby={titleId}>
      <div className="sb-tap-pad-head">
        <h3 id={titleId} className="sb-heading-md">
          Tap Pad · {swimLabel}
        </h3>
        <span className="sb-live-mark" data-state={status === 'live' ? 'live' : 'idle'} role="status">
          {statusWord}
        </span>
      </div>
      <SplitReadout
        value={formatSplit(elapsed)}
        live={status === 'live'}
        caption={[`Length ${currentLength} of ${lengths}`, `${poolLength} m pool`, status === 'live' ? 'running split' : 'total time']}
      />
      <LengthStrip label="Lengths and splits" cells={cells} unit="seconds" />
      <div className="sb-tap-keys">
        <button
          type="button"
          className="sb-tap-key"
          data-kind="wall"
          data-flash={flash?.startsWith('wall-') ? 'true' : undefined}
          disabled={status !== 'live'}
          onClick={() => record('wall')}
          aria-describedby={`${titleId}-wall`}
        >
          <Icon name="wall" />
          <span className="sb-tap-key-label">Wall tap</span>
          <span id={`${titleId}-wall`} className="sb-body-sm">
            {walls.length + 1 >= lengths ? 'Finish touch' : `Ends Length ${currentLength}`}
          </span>
        </button>
        {FOCUS_METRICS.filter((metric) => focus.includes(metric.id)).map((metric) => (
          <button
            key={metric.id}
            type="button"
            className="sb-tap-key"
            data-kind="counter"
            data-flash={flash?.startsWith(`${metric.id}-`) ? 'true' : undefined}
            disabled={status !== 'live'}
            onClick={() => record(metric.id)}
            aria-label={`${metric.label}: ${countSince(metric.id)} this Length. Tap to add one.`}
          >
            <span className="sb-numeral" data-size="lg">
              {countSince(metric.id)}
            </span>
            <span className="sb-tap-key-label">{metric.label}</span>
          </button>
        ))}
      </div>
      <div className="sb-tray">
        {status === 'ready' ? (
          <button type="button" className="sb-button" data-size="lg" onClick={start}>
            <Icon name="play" /> Start Swim
          </button>
        ) : (
          <>
            <button type="button" className="sb-button" data-variant="secondary" data-size="lg" onClick={() => undo()} disabled={!active.length}>
              <Icon name="undo" /> Undo last tap
            </button>
            {status === 'finished' ? (
              <button type="button" className="sb-button" data-size="lg" onClick={start}>
                <Icon name="play" /> Next Swim
              </button>
            ) : (
              <button type="button" className="sb-button" data-variant="ghost" onClick={() => setStatus('finished')}>
                <Icon name="stop" /> End early
              </button>
            )}
          </>
        )}
      </div>
      {log.length ? (
        <div className="sb-stack" data-gap="tight">
          <h4 className="sb-label">Last taps</h4>
          <ul className="sb-tap-log">
            {log.map((event) => (
              <li key={event.id}>
                <span>
                  {event.undone ? <s>{KIND_LABEL[event.kind]}</s> : KIND_LABEL[event.kind]} · {formatSplit(event.at - startedAt)}
                  {event.undone ? ' · undone' : ''}
                </span>
                {!event.undone ? (
                  <button type="button" className="sb-button" data-variant="ghost" data-size="sm" onClick={() => undo(event.id)}>
                    Undo
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="sb-body-sm sb-muted">Taps appear here, newest first, each with its own Undo.</p>
      )}
    </section>
  );
}

/** A Technique point rated 1–5: numbered steps and the cue text for the chosen level, so no level rests on colour. */
export function Rating({ label, cues = HEAD_POSITION_CUES, defaultValue }: { label: string; cues?: readonly string[]; defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);
  const name = useId();
  return (
    <fieldset className="sb-rating">
      <legend className="sb-label">{label}</legend>
      <div className="sb-rating-steps">
        {cues.map((cue, index) => (
          <label key={cue} className="sb-rating-step">
            <input type="radio" name={name} value={index + 1} checked={value === index + 1} onChange={() => setValue(index + 1)} aria-describedby={`${name}-cue`} />
            <span aria-hidden="true">{index + 1}</span>
            <span className="sb-visually-hidden">
              {index + 1} of {cues.length}: {cue}
            </span>
          </label>
        ))}
      </div>
      <p id={`${name}-cue`} className="sb-rating-cue sb-body-sm" aria-live="polite">
        {value ? (
          <>
            <strong>
              {value} of {cues.length}:
            </strong>{' '}
            {cues[value - 1]}
          </>
        ) : (
          <span className="sb-muted">Not rated yet. 1 is furthest from the cue, 5 matches it.</span>
        )}
      </p>
    </fieldset>
  );
}

/** A Fault as an observer's note: a toggle with a flag shape and a label, never colour alone and never a referee's call. */
export function FaultFlag({ label, note, defaultNoted = false }: { label: string; note: string; defaultNoted?: boolean }) {
  const [noted, setNoted] = useState(defaultNoted);
  return (
    <button type="button" className="sb-fault-flag" aria-pressed={noted} onClick={() => setNoted(!noted)}>
      <Icon name="flag" />
      <span>
        {noted ? 'Noted: ' : 'Note: '}
        {label}
        <span className="sb-body-sm" style={{ display: 'block', fontWeight: 'var(--sb-font-weight-regular)' }}>
          {note} · observer&apos;s note, not an official call
        </span>
      </span>
    </button>
  );
}

/** Count correction on the Review sheet: minus, the value, plus. */
export function Stepper({ label, initial }: { label: string; initial: number }) {
  const [value, setValue] = useState(initial);
  const id = useId();
  return (
    <div className="sb-row" data-justify="between">
      <span id={id} className="sb-label">
        {label}
      </span>
      <span className="sb-stepper" role="group" aria-labelledby={id}>
        <button type="button" className="sb-icon-button" aria-label={`One fewer: ${label}`} onClick={() => setValue(Math.max(0, value - 1))}>
          <Icon name="minus" />
        </button>
        <output className="sb-numeral" aria-live="polite">
          {value}
        </output>
        <button type="button" className="sb-icon-button" aria-label={`One more: ${label}`} onClick={() => setValue(value + 1)}>
          <Icon name="plus" />
        </button>
      </span>
    </div>
  );
}

/** The Review sheet, completed straight after a Swim: corrections, technique rating, Faults, and context. */
export function ReviewSheet({ compact = false }: { compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  const titleId = useId();
  return (
    <form
      className="sb-review-sheet"
      aria-labelledby={titleId}
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
    >
      <div className="sb-card-head">
        <h3 id={titleId} className="sb-heading-md">
          Review sheet
        </h3>
        <span className="sb-body-sm sb-muted">100 m freestyle · 1:18.42</span>
      </div>
      <div className="sb-review-section">
        <h4 className="sb-label">Check the counts</h4>
        <Stepper label="Underwater kicks, Length 4" initial={4} />
        {compact ? null : <Stepper label="Strokes, Length 4" initial={18} />}
      </div>
      <div className="sb-review-section">
        <Rating label="Head position" defaultValue={4} />
      </div>
      <div className="sb-review-section">
        <h4 className="sb-label">Faults you noticed</h4>
        <div className="sb-chip-group">
          {FAULTS.map((fault, index) => (
            <FaultFlag key={fault.id} label={fault.label} note={fault.note} defaultNoted={index === 0} />
          ))}
        </div>
      </div>
      {compact ? null : (
        <div className="sb-review-section">
          <label htmlFor={`${titleId}-notes`} className="sb-label">
            Context
          </label>
          <textarea id={`${titleId}-notes`} className="sb-textarea" defaultValue="Tired after the kick set. Lane shared with two others." />
        </div>
      )}
      <div className="sb-tray">
        <button type="submit" className="sb-button" data-size="lg">
          <Icon name="check" /> Save Swim
        </button>
        <span role="status" className="sb-body-sm">
          {saved ? 'Saved. Metric trends now include this Swim.' : ''}
        </span>
      </div>
    </form>
  );
}

/** Profile switcher: the Swimmer whose Sessions the watcher is looking at. APG menu button with radio items. */
export function ProfileSwitcher() {
  const [current, setCurrent] = useState(SWIMMERS[0].id);
  const swimmer = SWIMMERS.find((candidate) => candidate.id === current) ?? SWIMMERS[0];
  return (
    <div className="sb-profile-switcher">
      <MenuButton
        label={`Swimmer: ${swimmer.name}. Switch Swimmer`}
        className=""
        variant=""
        checkedId={current}
        onSelect={setCurrent}
        items={SWIMMERS.map((candidate) => ({
          id: candidate.id,
          label: (
            <span className="sb-row">
              <span className="sb-avatar" data-size="sm" aria-hidden="true">
                {candidate.initials}
              </span>
              <span>
                {candidate.name}
                <span className="sb-body-sm sb-muted" style={{ display: 'block' }}>
                  {candidate.detail}
                </span>
              </span>
            </span>
          ),
        }))}
      >
        <span className="sb-avatar" aria-hidden="true">
          {swimmer.initials}
        </span>
        {swimmer.name}
        <Icon name="chevron-down" />
      </MenuButton>
    </div>
  );
}

/** Draft/publish bar for the Admin console: the reach choice for a changed formula, then publish. */
export function PublishBar({ changes = 3, nextVersion = 'v15' }: { changes?: number; nextVersion?: string }) {
  const [reach, setReach] = useState<'forward' | 'history'>('forward');
  const [published, setPublished] = useState(false);
  const name = useId();
  return (
    <div className="sb-publish-bar" role="region" aria-label="Draft and publish">
      <div className="sb-stack" data-gap="tight">
        <strong className="sb-label">
          {published ? `Published as ${nextVersion}` : `Draft · ${changes} changes`}
        </strong>
        <span className="sb-body-sm sb-muted">Published Configuration never rewrites recorded Swims.</span>
      </div>
      <fieldset>
        <legend className="sb-visually-hidden">Where the new SWOLF formula applies</legend>
        <label className="sb-radio">
          <input type="radio" name={name} checked={reach === 'forward'} onChange={() => setReach('forward')} /> From {nextVersion} onward
        </label>
        <label className="sb-radio">
          <input type="radio" name={name} checked={reach === 'history'} onChange={() => setReach('history')} /> Recalculate all history
        </label>
      </fieldset>
      <div className="sb-row">
        <button type="button" className="sb-button" data-variant="secondary" data-size="sm">
          Discard Draft
        </button>
        <button type="button" className="sb-button" data-size="sm" onClick={() => setPublished(true)} disabled={published}>
          Publish {nextVersion}
        </button>
      </div>
      <span className="sb-visually-hidden" role="status">
        {published ? `Published as ${nextVersion}, ${reach === 'forward' ? 'applying from this version onward' : 'recalculating all history'}.` : ''}
      </span>
    </div>
  );
}
