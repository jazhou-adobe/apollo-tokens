import { Icon } from '../preview/components/Icon';
import { withBase } from '../preview/paths';

export default function NotFound() {
  return (
    <main className="sb-gallery" id="top">
      <div className="sb-empty-state">
        <Icon name="search" />
        <h1 className="sb-heading-lg">We can&apos;t find that page</h1>
        <p>It may have moved, or the link may be incomplete.</p>
        <a className="sb-button" href={withBase('/design')}>
          Go to the design system
        </a>
      </div>
    </main>
  );
}
