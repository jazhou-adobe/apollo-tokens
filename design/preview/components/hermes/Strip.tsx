'use client';

import { useId, useState, type Ref } from 'react';
import { STATUS_WORD, policyText, questionCount, type Question, type Round } from '../../fixtures';
import { Icon } from '../Icon';
import { Callsign } from './Callsign';
import { PolicyTimer, policyReadout } from './PolicyTimer';

export const QUESTION_KIND: Record<Question['kind'], string> = {
  single: 'Single choice',
  multi: 'Multiple choice',
  text: 'Free text',
  approve: 'Approve / reject',
};

export function recommendedText(question: Question) {
  if (question.recommended === undefined) return null;
  if (question.kind === 'single') return question.options.find((option) => option.id === question.recommended)?.label ?? null;
  if (question.kind === 'multi') return question.options.filter((option) => question.recommended?.includes(option.id)).map((option) => option.label).join(', ');
  if (question.kind === 'approve') return question.recommended === 'approve' ? 'Approve' : 'Reject';
  return question.recommended;
}

type StripProps = {
  round: Round;
  remaining?: number;
  expanded?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  onOpen?: () => void;
  onFocus?: () => void;
  headRef?: Ref<HTMLButtonElement>;
};

/**
 * One Round as a flight strip in its holder. The holder frames the paper on every side in the status colour, and its tab
 * prints the status word. The head is a disclosure button: collapsed it reads as one strip line; expanded it lists each
 * Question with the Agent's recommendation.
 */
export function Strip({ round, remaining = round.remaining, expanded = false, selected = false, onToggle, onOpen, onFocus, headRef }: StripProps) {
  const bodyId = `${useId()}-body`;
  const status = STATUS_WORD[round.status];
  return (
    <li className="hh-strip" data-status={round.status} data-selected={selected ? 'true' : undefined} data-round={round.id}>
      <div className="hh-strip-tab">
        <span>{status}</span>
        <span className="hh-mono-sm">{round.status === 'pending' ? policyReadout(round.policy, remaining) : round.outcome ?? status}</span>
      </div>
      <div className="hh-strip-paper">
        <button ref={headRef} type="button" className="hh-strip-head" aria-expanded={expanded} aria-controls={bodyId} onClick={onToggle} onFocus={onFocus}>
          <span className="hh-strip-cell" data-cell="callsign">
            <Callsign agentId={round.agentId} />
            <span className="hh-mono-sm">{round.id}</span>
          </span>
          <span className="hh-strip-cell" data-cell="title">
            <span className="hh-strip-header hh-strip-title">{round.title}</span>
            <span className="hh-strip-policy">
              {status} · {questionCount(round)} · {round.status === 'pending' ? policyText(round.policy) : round.outcome}
            </span>
          </span>
          <span className="hh-strip-cell" data-cell="meta">
            <span className="hh-mono">{round.received}</span>
            <Icon name={expanded ? 'chevron-down' : 'chevron-right'} />
            <span className="hh-visually-hidden">{expanded ? 'Collapse strip' : 'Expand strip'}</span>
          </span>
        </button>
        <div className="hh-strip-body" id={bodyId} hidden={!expanded}>
          <ol className="hh-strip-summary">
            {round.questions.map((question, index) => {
              const recommended = recommendedText(question);
              return (
                <li key={question.id}>
                  <span className="hh-mono-sm">Q{index + 1}</span>
                  <span className="hh-body-sm">
                    <strong>{QUESTION_KIND[question.kind]}.</strong> {question.prompt}
                    {recommended ? (
                      <>
                        {' '}
                        <span className="hh-recommended">Recommended</span> {recommended}
                      </>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>
          {onOpen && round.status === 'pending' ? (
            <div className="hh-strip-actions">
              <button type="button" className="hh-button" data-size="sm" onClick={onOpen}>
                Open Round <Icon name="arrow-right" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {round.status === 'pending' ? <PolicyTimer policy={round.policy} remaining={remaining} label={`${round.id}, ${policyReadout(round.policy, remaining)}`} /> : null}
    </li>
  );
}

/** A strip outside the bay (specimens, docs): it opens and closes on its own. */
export function ToggleStrip({ round, initiallyExpanded = false }: { round: Round; initiallyExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  return <Strip round={round} expanded={expanded} onToggle={() => setExpanded(!expanded)} />;
}
