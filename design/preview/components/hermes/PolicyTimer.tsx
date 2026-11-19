import type { CSSProperties } from 'react';
import { formatClock, policyText, type Policy } from '../../fixtures';
import { Icon } from '../Icon';

/** Seconds left, as the dispatcher reads it aloud: "06:52 left, then applies recommended". */
export function policyReadout(policy: Policy, remaining: number) {
  if (policy.kind === 'wait') return 'No deadline · keeps waiting';
  const action = policy.kind === 'apply-recommended' ? 'then applies recommended' : 'then cancels';
  return `${formatClock(remaining)} left, ${action}`;
}

/**
 * The Unanswered Policy timer: a track along the strip's bottom edge whose fill shrinks with the time left. A "wait"
 * policy shows a dashed, full track (no deadline). The visible readout lives beside it, never inside a live region.
 */
export function PolicyTimer({ policy, remaining, label }: { policy: Policy; remaining: number; label: string }) {
  const total = policy.kind === 'wait' ? 1 : policy.seconds;
  const fraction = policy.kind === 'wait' ? 1 : Math.max(0, Math.min(1, remaining / total));
  return (
    <span
      className="hh-policy-timer"
      data-policy={policy.kind}
      role="meter"
      aria-label={`Unanswered Policy timer, ${label}`}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={policy.kind === 'wait' ? total : Math.max(0, Math.round(remaining))}
      aria-valuetext={policyReadout(policy, remaining)}
      style={{ '--timer-fraction': fraction } as CSSProperties}
    >
      <span className="hh-policy-timer-fill" />
    </span>
  );
}

/** Policy badge: the declared Unanswered Policy, always visible before a timer can act on it. */
export function PolicyBadge({ policy, remaining }: { policy: Policy; remaining?: number }) {
  return (
    <span className="hh-policy-badge">
      <span className="hh-badge" data-tone={policy.kind === 'cancel' ? 'warning' : undefined}>
        <Icon name="clock" /> {policy.kind === 'wait' ? 'Keeps waiting' : policy.kind === 'apply-recommended' ? 'Applies recommended' : 'Cancels'}
      </span>
      <span className="hh-mono-sm">{remaining === undefined || policy.kind === 'wait' ? policyText(policy) : policyReadout(policy, remaining)}</span>
    </span>
  );
}
