import type { Metadata } from 'next';
import Link from 'next/link';

// Next marks the 404 page noindex itself.
export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="page">
      <header className="page-head">
        <h1>Page not found</h1>
        <p className="lead">The skill or page you asked for is not here. It may have been renamed.</p>
      </header>
      <div className="ctas">
        <Link className="b1" href="/skills/">Browse the skills</Link>
        <Link className="b2" href="/">Home</Link>
      </div>
    </div>
  );
}
