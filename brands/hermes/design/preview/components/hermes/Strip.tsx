'use client';

import { useId, useState, type FocusEventHandler, type MouseEventHandler, type Ref } from 'react';
import { STATUS_WORD, agentById, questionCount, type Question, type Round } from '../../fixtures';
import { Icon } from '../Icon';
import { Callsign } from './Callsign';
import { PolicyTimer, policyReadout } from './PolicyTimer';

export const QUESTION_KIND: Record<Question['kind'], string> = {
  single: 'Choose one',
  multi: 'Choose any',
  text: 'Free text',
  approve: 'Approve or reject',
};

export function recommendedText(question: Question) {
  if (question.recommended === undefined) return null;
  if (question.kind === 'single') return question.options.find((option) => option.id === question.recommended)?.label ?? null;
  if (question.kind === 'multi') return question.options.filter((option) => question.recommended?.includes(option.id)).map((option) => option.label).join(', ');
  if (question.kind === 'approve') return question.recommended === 'approve' ? 'Approve' : 'Reject';
  return question.recommended;
}

/** The strip's accessible name: status word first, then title, callsign, size, and what the policy will do. */
export function stripLabel(round: Round, remaining: number) {
  const tail = round.status === 'pending' ? policyReadout(round.policy, remaining) : round.outcome ?? '';
  return [STATUS_WORD[round.status], round.title, agentById(round.agentId).callsign, questionCount(round), tail].filter(Boolean).join(', ');
}

type StripOptionProps = {
  /** In the bay listbox: the strip is one option; the bay owns keys and focus. */
  mode: 'option';
  selected: boolean;
  tabIndex: number;
  departing?: boolean;
  onClick: MouseEventHandler<HTMLLIElement>;
  onFocus: FocusEventHandler<HTMLLIElement>;
  itemRef: Ref<HTMLLIElement>;
};

/** In the phone pending list: the head is a native button and the whole strip is its target (no roving focus). */
type StripButtonProps = {
  mode: 'button';
  departing?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  onFocus: FocusEventHandler<HTMLButtonElement>;
  itemRef: Ref<HTMLButtonElement>;
};

type StripDisclosureProps = { mode: 'disclosure'; expanded: boolean; onToggle: () => void };

type StripProps = { round: Round; remaining?: number } & (StripOptionProps | StripButtonProps | StripDisclosureProps);

/**
 * One Round as a flight strip in its holder. The holder frames the paper on every side in the status colour; its tab prints
 * the status word and the Unanswered Policy, and the timer runs along its bottom edge. The policy appears there once.
 * In the desktop bay a strip is a listbox option (selecting it opens the Round beside the bay); in the phone pending list
 * its head is a native button that opens the Round sheet; outside the bay it is a disclosure that lists its Questions.
 */
export function Strip(props: StripProps) {
  const { round, remaining = round.remaining } = props;
  const bodyId = `${useId()}-body`;
  const status = STATUS_WORD[round.status];
  const departing = props.mode !== 'disclosure' && props.departing;
  const cells = (
    <>
      <span className="hh-strip-cell" data-cell="callsign">
        <Callsign agentId={round.agentId} />
        <span className="hh-mono-sm">{round.id}</span>
      </span>
      <span className="hh-strip-cell" data-cell="title">
        <span className="hh-strip-header hh-strip-title">{round.title}</span>
        <span className="hh-strip-policy">{questionCount(round)}</span>
      </span>
      <span className="hh-strip-cell" data-cell="meta">
        <span className="hh-mono">{round.received}</span>
        {props.mode === 'disclosure' ? (
          <>
            <Icon name={props.expanded ? 'chevron-down' : 'chevron-right'} />
            <span className="hh-visually-hidden">{props.expanded ? 'Collapse strip' : 'Expand strip'}</span>
          </>
        ) : null}
      </span>
    </>
  );
  const tab = (
    <div className="hh-strip-tab" aria-hidden={props.mode === 'disclosure' ? undefined : true}>
      <span>{status}</span>
      <span className="hh-mono-sm">{departing ? 'Delivered' : round.status === 'pending' ? policyReadout(round.policy, remaining) : round.outcome ?? status}</span>
    </div>
  );
  const timer = round.status === 'pending' ? <PolicyTimer policy={round.policy} remaining={remaining} label={`${round.id}, ${policyReadout(round.policy, remaining)}`} /> : null;

  if (props.mode === 'option') {
    return (
      <li
        ref={props.itemRef}
        className="hh-strip"
        role={departing ? 'none' : 'option'}
        aria-hidden={departing ? true : undefined}
        aria-selected={departing ? undefined : props.selected}
        aria-disabled={round.status === 'pending' || departing ? undefined : true}
        aria-label={departing ? undefined : stripLabel(round, remaining)}
        tabIndex={departing ? -1 : props.tabIndex}
        data-status={round.status}
        data-state={departing ? 'departing' : undefined}
        data-selected={props.selected ? 'true' : undefined}
        data-round={round.id}
        onClick={departing ? undefined : props.onClick}
        onFocus={props.onFocus}
      >
        {tab}
        <div className="hh-strip-paper" aria-hidden="true">
          <div className="hh-strip-head">{cells}</div>
        </div>
        {timer}
      </li>
    );
  }

  if (props.mode === 'button') {
    return (
      <li className="hh-strip" data-mode="button" data-status={round.status} data-state={departing ? 'departing' : undefined} data-round={round.id} aria-hidden={departing ? true : undefined}>
        {tab}
        <div className="hh-strip-paper">
          <button
            ref={props.itemRef}
            type="button"
            className="hh-strip-head"
            aria-label={departing ? undefined : stripLabel(round, remaining)}
            tabIndex={departing ? -1 : undefined}
            onClick={departing ? undefined : props.onClick}
            onFocus={props.onFocus}
          >
            {cells}
          </button>
        </div>
        {timer}
      </li>
    );
  }

  return (
    <li className="hh-strip" data-status={round.status} data-round={round.id}>
      {tab}
      <div className="hh-strip-paper">
        <button type="button" className="hh-strip-head" aria-expanded={props.expanded} aria-controls={bodyId} onClick={props.onToggle}>
          {cells}
        </button>
        <div className="hh-strip-body" id={bodyId} hidden={!props.expanded}>
          <ol className="hh-strip-summary">
            {round.questions.map((question, index) => (
              <li key={question.id}>
                <span className="hh-mono-sm">Q{index + 1}</span>
                <span className="hh-body-sm">
                  <strong>{QUESTION_KIND[question.kind]}.</strong> {question.prompt}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      {timer}
    </li>
  );
}

/** A strip outside the bay (specimens, docs, the phone list): it opens and closes on its own. */
export function ToggleStrip({ round, initiallyExpanded = false }: { round: Round; initiallyExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  return <Strip mode="disclosure" round={round} expanded={expanded} onToggle={() => setExpanded(!expanded)} />;
}
