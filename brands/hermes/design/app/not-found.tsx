import type { Metadata } from 'next';
import { Icon } from '../preview/components/Icon';
import { withBase } from '../preview/paths';

export const metadata: Metadata = { title: 'Not found: Hermes Hub' };

// The preview's 404, built as a system-state screen: the state named first, what probably happened, one way forward.
export default function NotFound() {
  return (
    <main className="hh-gallery" id="top" tabIndex={-1}>
      <div className="hh-empty-state">
        <Icon name="alert" />
        <h1 className="hh-heading-lg">Not found</h1>
        <p className="hh-body">No page at this address. The link may be old, or the route was renamed.</p>
        <a className="hh-button" data-variant="primary" href={withBase('/design')}>
          Open the design system
        </a>
      </div>
    </main>
  );
}
