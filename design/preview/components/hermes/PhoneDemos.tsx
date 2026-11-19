'use client';

import { useState } from 'react';
import { ROUNDS, agentById, questionCount } from '../../fixtures';
import { Icon } from '../Icon';
import { Callsign } from './Callsign';
import { ConnectionStatus } from './ConnectionStatus';
import { PolicyBadge } from './PolicyTimer';
import { ToggleStrip } from './Strip';

/** Phone (glance): the pending list. Each strip opens in place; the whole row is a thumb target. */
export function PhonePendingList() {
  const pending = ROUNDS.filter((round) => round.status === 'pending');
  return (
    <div className="hh-phone-body">
      <div className="hh-row">
        <h3 className="hh-heading-lg">Pending</h3>
        <span className="hh-live-value" data-live="true">
          {pending.length}
        </span>
      </div>
      <ul className="hh-strip-bay-list" data-density="compact">
        {pending.map((round) => (
          <ToggleStrip key={round.id} round={round} />
        ))}
      </ul>
    </div>
  );
}

/** Phone (glance): one approve / reject Round, answered with a thumb, then sent as a whole. */
export function PhoneApprove() {
  const round = ROUNDS[2];
  const question = round.questions[0];
  const [choice, setChoice] = useState<'approve' | 'reject' | null>(null);
  const [sent, setSent] = useState(false);
  const agent = agentById(round.agentId);

  if (sent) {
    return (
      <div className="hh-phone-body" role="status">
        <span className="hh-badge" data-tone="answered">
          Answered
        </span>
        <p className="hh-heading-md">
          {choice === 'approve' ? 'Approved' : 'Rejected'} · {round.id}
        </p>
        <p className="hh-body">Delivered to {agent.callsign}. The strip moves to the answered log.</p>
        <button type="button" className="hh-button" data-size="lg" onClick={() => setSent(false)}>
          Back to the Round
        </button>
      </div>
    );
  }

  return (
    <div className="hh-phone-body">
      <div className="hh-row">
        <span className="hh-badge" data-tone="pending">
          Pending
        </span>
        <Callsign agent={agent} />
      </div>
      <h3 className="hh-strip-header">{round.title}</h3>
      <p className="hh-mono-sm">
        {round.id} · {questionCount(round)} · received {round.received}
      </p>
      <PolicyBadge policy={round.policy} remaining={round.remaining} />
      <div className="hh-round">
        <div className="hh-question">
          <p className="hh-question-prompt" id="phone-prompt">
            {question.prompt}
          </p>
          <div className="hh-approve-pair" role="group" aria-labelledby="phone-prompt">
            <button type="button" className="hh-button" data-variant="primary" data-size="lg" aria-pressed={choice === 'approve'} onClick={() => setChoice('approve')}>
              <Icon name="check" /> Approve
            </button>
            <button type="button" className="hh-button" data-variant="destructive" data-size="lg" aria-pressed={choice === 'reject'} onClick={() => setChoice('reject')}>
              <Icon name="x" /> Reject
            </button>
          </div>
          <p className="hh-answer-state">{choice ? (choice === 'approve' ? 'Approved, not sent' : 'Rejected, not sent') : 'Not answered'}</p>
        </div>
      </div>
      <button type="button" className="hh-button" data-variant="primary" data-size="lg" aria-disabled={!choice} onClick={() => choice && setSent(true)}>
        <Icon name="send" /> Send Answer
      </button>
      {!choice ? <p className="hh-hint">Choose Approve or Reject first.</p> : null}
      <ConnectionStatus state="live" detail="over tailnet" />
    </div>
  );
}
