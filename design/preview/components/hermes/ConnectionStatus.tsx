import { Icon } from '../Icon';

export type ConnectionState = 'live' | 'reconnecting' | 'offline';

const WORD: Record<ConnectionState, string> = { live: 'Live', reconnecting: 'Reconnecting', offline: 'Offline' };

/**
 * SSE connection to the Hub. The lamp glows only while live; the word always names the state. `live` marks the surface's
 * one operational readout as a polite status region, so a change ("Reconnecting · retry 3 of 5") is announced without
 * moving focus. Static specimens leave it off so a page of examples does not announce.
 */
export function ConnectionStatus({ state, detail, live = false }: { state: ConnectionState; detail?: string; live?: boolean }) {
  return (
    <span className="hh-connection" data-state={state} role={live ? 'status' : undefined} aria-live={live ? 'polite' : undefined}>
      <span className="hh-connection-lamp" aria-hidden="true" />
      {state === 'offline' ? <Icon name="x" /> : null}
      <span>{WORD[state]}</span>
      {detail ? <span className="hh-connection-detail">{detail}</span> : null}
    </span>
  );
}
