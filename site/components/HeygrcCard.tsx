import { HEYGRC_URL } from '@/lib/content';

// The heyGRC card: under the Install card on the skill pages in HEYGRC_SKILLS,
// and below the list on the pages in HEYGRC_LIST_PATHS. Text only: the CSP
// allows images from this origin alone.
export default function HeygrcCard({ body, className = '' }: { body: string; className?: string }) {
  return (
    <section className={`card heygrc ${className}`.trim()} aria-labelledby="heygrc">
      <h2 id="heygrc">Evidence on each pull request</h2>
      <p>{body}</p>
      <div className="actions">
        <a className="b2 b-sm" href={HEYGRC_URL}>heyGRC for GRC teams</a>
      </div>
      <p className="quiet">From the same team as grcskills. You pick the frameworks it checks. Optional; the skills work without it.</p>
    </section>
  );
}
