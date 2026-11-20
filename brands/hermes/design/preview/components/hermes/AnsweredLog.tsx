import { STATUS_WORD, type LogEntry } from '../../fixtures';
import { Callsign } from './Callsign';

/** Answered and expired Rounds, newest first. Status is a word on a holder-coloured badge, never colour alone. */
export function AnsweredLog({ entries, caption = 'Answered log' }: { entries: LogEntry[]; caption?: string }) {
  return (
    <div className="hh-answered-log hh-table-wrap" data-density="compact" tabIndex={0} role="region" aria-label={caption}>
      <table className="hh-table">
        <caption className="hh-visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Round</th>
            <th scope="col">Agent</th>
            <th scope="col">Status</th>
            <th scope="col">Answer</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="hh-mono">{entry.at}</td>
              <td>
                <span className="hh-mono-sm">{entry.id}</span> {entry.title}
              </td>
              <td>
                <Callsign agentId={entry.agentId} />
              </td>
              <td>
                <span className="hh-badge" data-tone={entry.status}>
                  {STATUS_WORD[entry.status]}
                </span>
              </td>
              <td>{entry.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
