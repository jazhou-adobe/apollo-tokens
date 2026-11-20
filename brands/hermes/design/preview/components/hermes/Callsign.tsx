import { agentById, type Agent } from '../../fixtures';

/** Agent identity: an identity-colour mark plus the callsign text. Colour never stands alone. */
export function Callsign({ agent, agentId }: { agent?: Agent; agentId?: string }) {
  const resolved = agent ?? agentById(agentId ?? '');
  return (
    <span className="hh-callsign" data-agent={resolved.slot} title={`${resolved.kind} · ${resolved.cwd}`}>
      <span className="hh-callsign-mark" aria-hidden="true" />
      <span className="hh-callsign-text">{resolved.callsign}</span>
    </span>
  );
}
