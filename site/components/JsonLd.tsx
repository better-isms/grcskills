import { serializeJsonLd } from '@/lib/jsonld';

// Data block, not executable script: CSP script-src does not apply to
// type="application/ld+json". Content is escaped so it cannot close the tag.
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
