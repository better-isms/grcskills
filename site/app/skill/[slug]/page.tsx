import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import InstallPicker from '@/components/InstallPicker';
import JsonLd from '@/components/JsonLd';
import Row from '@/components/Row';
import { copilotUrl, frameworkLabel, getAuthor, getSkill, githubUrl, installCommands, meta, relatedTo, skills, toRow } from '@/lib/content';
import { skillLd } from '@/lib/ld';
import { pageMeta } from '@/lib/seo';

export const dynamicParams = false;
export const generateStaticParams = () => skills.map((s) => ({ slug: s.slug }));

type Props = { params: Promise<{ slug: string }> };

// A rule line from the skill's Rules section, as text: `code` spans become
// <code>, nothing else is interpreted.
function RuleText({ text }: { text: string }) {
  return <>{text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}</>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getSkill((await params).slug);
  if (!s) return {};
  return pageMeta({
    title: `${s.title}: GRC agent skill`,
    description: s.summary,
    path: `/skill/${s.slug}/`,
    image: s.image,
    imageAlt: `${s.title}, a ${s.categoryLabel.toLowerCase()} skill on grcskills`,
    type: 'article',
  });
}

export default async function SkillPage({ params }: Props) {
  const s = getSkill((await params).slug);
  if (!s) notFound();
  const author = getAuthor(s.author);
  const cmd = installCommands(s.slug);
  const related = relatedTo(s);
  return (
    <div className="page">
      <Breadcrumbs items={[{ name: 'Skills', href: '/skills/' }, { name: s.categoryLabel, href: `/category/${s.category}/` }, { name: s.title, href: `/skill/${s.slug}/` }]} />
      <header className="page-head">
        <h1>{s.title}</h1>
        <p className="lead">{s.summary}</p>
        <p className="lead-long trigger"><span className="trigger-lbl">When your agent uses it.</span> {s.description}</p>
        <div className="meta-row">
          <Link className="tag" href={`/category/${s.category}/`}>{s.categoryLabel}</Link>
          <span className="sep" aria-hidden="true" />
          {s.frameworks.map((f) => <Link className="tag" key={f} href={`/framework/${f}/`}>{frameworkLabel(f)}</Link>)}
        </div>
      </header>

      <section className="decide" aria-labelledby="decide">
        <h2 id="decide">Where you decide</h2>
        {s.decisions.length > 0 && (
          <>
            <p>From this skill&apos;s rules: where you decide</p>
            <ul>
              {s.decisions.map((d) => <li key={d}><RuleText text={d} /></li>)}
            </ul>
          </>
        )}
        <p className="boundary">Everything it writes is a draft for a person to review and sign.</p>
      </section>

      <div className="skill-grid">
        <aside className="aside" aria-label="Install and author">
          <section className="card" aria-labelledby="install">
            <h2 id="install">Install</h2>
            <InstallPicker
              tabs={[
                { key: 'npx', label: 'npx', command: cmd.npx, note: 'Claude Code, Cursor, Codex and other agents.' },
                { key: 'plugin', label: 'Claude Code plugin', command: cmd.plugin, note: 'Every skill in the library, pinned to a release.' },
                { key: 'clone', label: 'Clone', command: cmd.clone, note: `Release ${meta.tag}.` },
              ]}
            />
            <div className="actions">
              <a className="b1 b-sm" href={copilotUrl(s.slug)}>Run with ISMS Copilot</a>
              <a className="b2 b-sm" href={githubUrl(s.repoPath)}>View on GitHub</a>
            </div>
            <p className="quiet">ISMS Copilot answers framework questions for this skill. Optional; the skill works without it.</p>
          </section>

          {author && (
            <section className="card" aria-labelledby="author">
              <h2 id="author">Author</h2>
              <div className="by">
                <span className="av" aria-hidden="true">{author.initials}</span>
                <span className="who">
                  <Link href={`/${author.slug}/`}><b>{author.name}</b></Link>
                  <small>{author.title}</small>
                </span>
              </div>
              <p className="quiet">This skill drafts for a human to review and sign; it never marks a control effective.</p>
            </section>
          )}

          {s.references.length > 0 && (
            <section className="card" aria-labelledby="refs">
              <h2 id="refs">References</h2>
              <ul className="refs">
                {s.references.map((r) => <li key={r.slug}><Link href={`/skill/${s.slug}/${r.slug}/`}>{r.title}</Link></li>)}
              </ul>
            </section>
          )}
        </aside>

        <article className="prose" dangerouslySetInnerHTML={{ __html: s.html }} />
      </div>
      {related.length > 0 && (
        <section className="section related" aria-labelledby="related">
          <h2 id="related">Related skills</h2>
          <ul className="rows">{related.map((r) => <Row key={r.slug} r={toRow(r)} />)}</ul>
        </section>
      )}
      <JsonLd data={skillLd(s)} />
    </div>
  );
}
