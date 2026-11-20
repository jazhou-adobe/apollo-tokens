import type { Agent } from '../../fixtures';
import { Callsign } from './Callsign';
import { ConnectionStatus } from './ConnectionStatus';

const STATE_WORD: Record<Agent['state'], string> = { connected: 'Connected', idle: 'Idle', gone: 'Gone' };

/** Every Agent the Hub has seen, with the detection details that identified it (client kind, session, cwd/git). */
export function AgentRoster({ agents, detail = true }: { agents: Agent[]; detail?: boolean }) {
  return (
    <ul className="hh-agent-roster">
      {agents.map((agent) => (
        <li key={agent.id} className="hh-agent-card">
          <div className="hh-agent-card-head">
            <Callsign agent={agent} />
            <span className="hh-agent-state">
              {agent.state === 'connected' ? <ConnectionStatus state="live" /> : <span className="hh-badge" data-tone={agent.state === 'gone' ? 'expired' : undefined}>{STATE_WORD[agent.state]}</span>}
            </span>
          </div>
          <dl className="hh-dl">
            <dt>Client</dt>
            <dd>{agent.kind}</dd>
            <dt>Session</dt>
            <dd className="hh-mono-sm">{agent.sessionId}</dd>
            {detail ? (
              <>
                <dt>Resume</dt>
                <dd className="hh-mono-sm">{agent.resume}</dd>
              </>
            ) : null}
            <dt>cwd</dt>
            <dd className="hh-mono-sm">{agent.cwd}</dd>
            <dt>Git</dt>
            <dd className="hh-mono-sm">{agent.branch}</dd>
            {detail ? (
              <>
                <dt>Host</dt>
                <dd>{agent.host}</dd>
                <dt>Transport</dt>
                <dd>{agent.transport}</dd>
                <dt>Detected by</dt>
                <dd>{agent.detection}</dd>
              </>
            ) : null}
            <dt>Last seen</dt>
            <dd className="hh-mono-sm">{agent.lastSeen}</dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}
