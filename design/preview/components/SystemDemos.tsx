'use client';

import { useState } from 'react';
import { Icon } from './Icon';
import { ConnectionStatus } from './hermes/ConnectionStatus';

/** Sign-in: a one-time link from the terminal, or a passkey. No passwords. */
export function SignInDemo() {
  const [state, setState] = useState<'idle' | 'waiting' | 'error'>('idle');
  return (
    <div className="hh-card hh-stack">
      <span className="hh-app-bar-brand">
        <Icon name="lock" /> Hermes Hub
      </span>
      <h3 className="hh-heading-lg">Sign in to the Command Center</h3>
      <p className="hh-body-sm">
        Run <code>hermes login</code> in a terminal on this machine to print a one-time link, or use the passkey you registered.
      </p>
      <div className="hh-field">
        <label className="hh-label" htmlFor="signin-code">
          One-time code
        </label>
        <input id="signin-code" className="hh-input hh-mono" placeholder="XXXX-XXXX" aria-invalid={state === 'error'} aria-describedby={state === 'error' ? 'signin-error' : undefined} />
        {state === 'error' ? (
          <p id="signin-error" className="hh-error">
            <span className="hh-badge" data-tone="destructive">
              Error
            </span>
            Code expired after 5 minutes. Run hermes login again.
          </p>
        ) : null}
      </div>
      <div className="hh-row">
        <button type="button" className="hh-button" data-variant="primary" onClick={() => setState('error')}>
          Sign in with code
        </button>
        <button type="button" className="hh-button" onClick={() => setState('waiting')}>
          <Icon name="user" /> Use a passkey
        </button>
      </div>
      {state === 'waiting' ? (
        <p className="hh-row hh-body-sm" role="status">
          <span className="hh-spinner" aria-hidden="true" /> Waiting for your passkey…
        </p>
      ) : null}
    </div>
  );
}

/** Reconnecting: the board stays readable, sends queue, and the state is named. */
export function ReconnectingDemo() {
  const [state, setState] = useState<'reconnecting' | 'live'>('reconnecting');
  return (
    <div className="hh-card hh-stack">
      <ConnectionStatus state={state} detail={state === 'live' ? 'SSE · back after 12 s' : 'retry 3 of 5 · next in 4 s'} />
      <p className="hh-body-sm" role="status">
        {state === 'live' ? 'Live again. 1 new Round arrived while you were away.' : 'Reconnecting to the Hub. Pending Rounds stay on screen; Answers send once the link is back.'}
      </p>
      <button type="button" className="hh-button" onClick={() => setState(state === 'live' ? 'reconnecting' : 'live')}>
        <Icon name="refresh" /> {state === 'live' ? 'Drop the link (demo)' : 'Retry now'}
      </button>
    </div>
  );
}
