'use client';

import { useId, useState } from 'react';
import { HEAD_POSITION_CUES, SWIMMERS } from '../fixtures';
import { MenuButton } from './demos';
import { Icon } from './Icon';

/**
 * A Technique point rated 1–5 (APG radio group on native radios). Each level shows its number and cue text; the chosen
 * one takes ink (foreground) with a check, so the level never rests on colour and `metric` keeps its one job.
 */
export function Rating({
  label,
  cues = HEAD_POSITION_CUES,
  defaultValue,
  onChange,
}: {
  label: string;
  cues?: readonly string[];
  defaultValue?: number;
  onChange?: (value: number) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const name = useId();
  return (
    <fieldset className="sb-rating">
      <legend className="sb-label">{label}</legend>
      <div className="sb-rating-steps">
        {cues.map((cue, index) => (
          <label key={cue} className="sb-rating-step">
            <input
              type="radio"
              name={name}
              value={index + 1}
              checked={value === index + 1}
              onChange={() => {
                setValue(index + 1);
                onChange?.(index + 1);
              }}
              aria-describedby={`${name}-cue`}
            />
            <span className="sb-rating-step-number" aria-hidden="true">
              {index + 1}
            </span>
            <span className="sb-rating-step-cue">
              <span className="sb-visually-hidden">
                {index + 1} of {cues.length}:{' '}
              </span>
              {cue}
            </span>
            <span className="sb-rating-step-check" aria-hidden="true">
              <Icon name="check" />
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
export function FaultFlag({ label, note, defaultNoted = false, onChange }: { label: string; note: string; defaultNoted?: boolean; onChange?: (noted: boolean) => void }) {
  const [noted, setNoted] = useState(defaultNoted);
  return (
    <button
      type="button"
      className="sb-fault-flag"
      aria-pressed={noted}
      onClick={() => {
        setNoted(!noted);
        onChange?.(!noted);
      }}
    >
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

/**
 * Profile switcher: the Swimmer whose Sessions the watcher is looking at (APG menu button with radio items). While a Swim
 * is recording it is read-only, so the Swimmer cannot change mid-Capture.
 */
export function ProfileSwitcher({ locked = false }: { locked?: boolean }) {
  const [current, setCurrent] = useState(SWIMMERS[0].id);
  const swimmer = SWIMMERS.find((candidate) => candidate.id === current) ?? SWIMMERS[0];
  if (locked) {
    return (
      <div className="sb-profile-switcher" data-state="locked">
        <span className="sb-profile-switcher-locked">
          <span className="sb-avatar" aria-hidden="true">
            {swimmer.initials}
          </span>
          {swimmer.name}
          <Icon name="lock" />
          <span className="sb-visually-hidden">: Swimmer locked while recording</span>
        </span>
      </div>
    );
  }
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
export function PublishBar({ label, changes = 3, nextVersion = 'v15' }: { label: string; changes?: number; nextVersion?: string }) {
  const [reach, setReach] = useState<'forward' | 'history'>('forward');
  const [published, setPublished] = useState(false);
  const name = useId();
  return (
    <div className="sb-publish-bar" role="region" aria-label={label}>
      <div className="sb-stack" data-gap="tight">
        <strong className="sb-label">{published ? `Published as ${nextVersion} (in this preview)` : `Draft · ${changes} changes`}</strong>
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
        {published ? `Published as ${nextVersion} in this preview, ${reach === 'forward' ? 'applying from this version onward' : 'recalculating all history'}.` : ''}
      </span>
    </div>
  );
}
