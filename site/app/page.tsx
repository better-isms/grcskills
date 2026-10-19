import type { Metadata } from 'next';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import JsonLd from '@/components/JsonLd';
import SearchBox from '@/components/SearchBox';
import SkillCard from '@/components/SkillCard';
import { categories, featuredSkill, meta, SITE_URL, skills, toRow } from '@/lib/content';
import { HOME_DESCRIPTION, HOME_TITLE, pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: '/',
  absoluteTitle: true,
  imageAlt: 'grcskills: one prompt, your setup reviewed',
});

export default function Home() {
  const featured = featuredSkill();
  const n = meta.count;
  return (
    <>
      <section className="hero" aria-labelledby="h1">
        <div>
          <h1 id="h1">One prompt. Your setup, reviewed.</h1>
          <p className="lead">
            Open GRC skills for AI agents. Paste the prompt into your agent; it runs {n} practitioner skills against your files and writes a 30-day plan.
          </p>
          <p className="works">Agent Skills for Claude Code, Codex, Cursor and any agent that reads SKILL.md.</p>
        </div>
        <div className="pcard">
          <p className="lbl">The prompt</p>
          <pre>{meta.prompt}</pre>
          <div className="prow">
            <small>Open source, MIT licensed. Nothing to sign up for.</small>
            <div className="ctas">
              <CopyButton text={meta.prompt} label="Copy the prompt" />
              <Link className="b2" href="/skills/">Browse the skills</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section back" aria-labelledby="back">
        <div>
          <h2 id="back">What comes back</h2>
          <ul className="outs">
            <li>The ten skills that fit your setup, ranked<span>Picked from {n} skills across ten kinds of GRC work.</span></li>
            <li>What looks broken, duplicated or missing<span>Read from your repo, policy folder and the exports your agent can open.</span></li>
            <li>A 30-day plan, written to a file<span>Drafts for you to review. Nothing is marked done for you.</span></li>
          </ul>
        </div>
        {featured && <SkillCard skill={featured} />}
      </section>

      <section className="section find" aria-labelledby="find">
        <div className="find-intro">
          <h2 id="find">Find a skill</h2>
          <p>Each skill is one job a practitioner does, with the steps, the quality bar and the files it writes.</p>
          <Link className="b2" href="/skills/">All {n} skills</Link>
        </div>
        <SearchBox initial={skills.slice(0, 6).map(toRow)} total={n} />
      </section>

      <section className="section" id="categories" aria-labelledby="cats">
        <h2 id="cats">Ten kinds of GRC work</h2>
        <ul className="cats">
          {categories.map((c) => (
            <li key={c.slug}>
              {c.count > 0 ? (
                <Link href={`/category/${c.slug}/`}>
                  <span className="cat-name">{c.label}</span>
                  <span className="cat-n">{c.count} {c.count === 1 ? 'skill' : 'skills'}</span>
                </Link>
              ) : (
                <span className="cat-off"><span>{c.label}</span></span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="section close" aria-labelledby="contrib">
        <div>
          <h2 id="contrib">Know a job well? Write it down with your AI.</h2>
          <p>Your agent interviews you, drafts the skill in the library format and opens the pull request. You are credited as the author.</p>
        </div>
        <Link className="b2" href="/contribute/">How to contribute</Link>
      </section>

      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: 'grcskills',
            alternateName: 'GRC Skills',
            url: `${SITE_URL}/`,
            description: HOME_DESCRIPTION,
            inLanguage: 'en',
            publisher: { '@type': 'Organization', name: 'Better ISMS', url: 'https://betterisms.co' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'grcskills',
            url: `${SITE_URL}/`,
            description: `Open GRC skills for AI agents: ${n} practitioner skills.`,
            isPartOf: { '@id': `${SITE_URL}/#website` },
            image: `${SITE_URL}/og.png`,
            ...(meta.dateModified ? { dateModified: meta.dateModified } : {}),
            license: 'https://opensource.org/licenses/MIT',
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: n,
              itemListElement: skills.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/skill/${s.slug}/`, name: s.title })),
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Better ISMS',
            url: 'https://betterisms.co',
            brand: { '@type': 'Brand', name: 'ISMS Copilot' },
            sameAs: [meta.repoUrl.replace(/\/grcskills$/, '')],
          },
        ]}
      />
    </>
  );
}
