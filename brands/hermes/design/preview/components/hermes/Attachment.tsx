import type { Attachment as AttachmentData } from '../../fixtures';
import { Icon, type IconName } from '../Icon';

const KIND: Record<AttachmentData['kind'], { word: string; icon: IconName }> = {
  diff: { word: 'Diff', icon: 'diff' },
  code: { word: 'Code', icon: 'code' },
  file: { word: 'File', icon: 'file' },
  link: { word: 'Link', icon: 'link' },
};

/** Context an Agent attached to a Question. Code and diffs sit on the opaque code plane; +/- signs mark diff lines. */
export function Attachment({ attachment }: { attachment: AttachmentData }) {
  const kind = KIND[attachment.kind];
  return (
    <figure className="hh-attachment">
      <figcaption className="hh-attachment-head">
        <span className="hh-badge">
          <Icon name={kind.icon} /> {kind.word}
        </span>
        <span className="hh-attachment-title hh-mono">{attachment.title}</span>
        <span className="hh-mono-sm hh-muted">{attachment.meta}</span>
      </figcaption>
      {attachment.kind === 'diff' ? (
        <div className="hh-attachment-body" tabIndex={0} aria-label={`Diff of ${attachment.title}`}>
          <ol className="hh-diff">
            {attachment.lines.map((line, index) => (
              <li key={index} className="hh-diff-line" data-kind={line.kind}>
                <span className="hh-diff-sign" aria-hidden="true">
                  {line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' '}
                </span>
                <span>
                  {line.kind !== 'context' ? <span className="hh-visually-hidden">{line.kind === 'add' ? 'Added: ' : 'Removed: '}</span> : null}
                  {line.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {attachment.kind === 'code' ? (
        <pre className="hh-attachment-body" tabIndex={0} aria-label={`Code: ${attachment.title}`}>
          <code>{attachment.code}</code>
        </pre>
      ) : null}
      {attachment.kind === 'file' ? (
        <div className="hh-attachment-row">
          <Icon name="file" />
          <code>{attachment.path}</code>
        </div>
      ) : null}
      {attachment.kind === 'link' ? (
        <div className="hh-attachment-row">
          <Icon name="link" />
          <a className="hh-link hh-mono-sm" href={attachment.href} rel="noreferrer" target="_blank">
            {attachment.href}
          </a>
        </div>
      ) : null}
    </figure>
  );
}
