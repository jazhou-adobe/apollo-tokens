import { Icon } from '../Icon';

export type ConnectionState = 'live' | 'reconnecting' | 'offline';

const WORD: Record<ConnectionState, string> = { live: 'Live', reconnecting: 'Reconnecting', offline: 'Offline' };

/** SSE connection to the Hub. The lamp glows only while live; the word always names the state. */
export function ConnectionStatus({ state, detail }: { state: ConnectionState; detail?: string }) {
  return (
    <span className="hh-connection" data-state={state}>
      <span className="hh-connection-lamp" aria-hidden="true" />
      {state === 'offline' ? <Icon name="x" /> : null}
      <span>{WORD[state]}</span>
      {detail ? <span className="hh-connection-detail">{detail}</span> : null}
    </span>
  );
}
