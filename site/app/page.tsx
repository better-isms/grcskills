import type { Metadata } from 'next';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';
import JsonLd from '@/components/JsonLd';
import SearchBox from '@/components/SearchBox';
import SkillCard from '@/components/SkillCard';
import { categories, COPILOT_HOME_URL, COPILOT_LINE, COPILOT_MCP_ENDPOINT, featuredSkill, HEYGRC_LINE, HEYGRC_URL, meta, SITE_URL, skills, toRow } from '@/lib/content';
import { HOME_DESCRIPTION, HOME_H1, HOME_SUBLINE, HOME_TITLE, pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: '/',
  absoluteTitle: true,
  imageAlt: 'grcskills: open GRC skills for AI agents. It does the legwork. You make the calls.',
});

export default function Home() {
  const featured = featuredSkill();
  const n = meta.count;
  return (
    <>
      <section className="hero" aria-labelledby="h1">
        <div>
          <h1 id="h1">{HOME_H1}</h1>
          <p className="lead">{HOME_SUBLINE}</p>
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
            <li>A ranked shortlist for you to judge<span>The ten skills that look most useful for your setup, picked from {n} across ten kinds of GRC work.</span></li>
            <li>What looks broken, duplicated or missing, for you to confirm<span>Read from your repo, policy folder and the exports your agent can open.</span></li>
            <li>A 30-day plan draft. You decide what goes in it.<span>Written to a file. Nothing is marked done for you.</span></li>
          </ul>
        </div>
        {featured && <SkillCard skill={featured} />}
      </section>

      <section className="section copilot-band" aria-labelledby="specialist">
        <div>
          <h2 id="specialist">While a skill runs: the GRC specialist your AI calls</h2>
          <p>{COPILOT_LINE}</p>
          <p className="quiet">Optional. The skills work without it, and they never send it file contents, secrets, personal data or evidence.</p>
        </div>
        <div className="pcard">
          <p className="lbl">Add this URL to your AI once</p>
          <pre>{COPILOT_MCP_ENDPOINT}</pre>
          <div className="prow">
            <small>Claude and ChatGPT: sign in and approve. Cursor and Codex: a personal access token. Every ISMS Copilot plan, Free included.</small>
            <div className="ctas">
              <CopyButton text={COPILOT_MCP_ENDPOINT} label="Copy the URL" className="b2" />
              <a className="b1" href={COPILOT_HOME_URL}>Connect your AI</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section close heygrc-band" aria-labelledby="after">
        <div>
          <h2 id="after">After the skill: evidence on each pull request</h2>
          <p>{HEYGRC_LINE}</p>
          <p className="two-jobs">Also from us. ISMS Copilot answers framework questions while a skill runs. heyGRC reviews each pull request after it, against the frameworks you pick.</p>
        </div>
        <a className="b2" href={HEYGRC_URL}>heyGRC for GRC teams</a>
      </section>

      <section className="section find" aria-labelledby="find">
        <div className="find-intro">
          <h2 id="find">Find a skill</h2>
          <p>Each skill is the steps an experienced GRC person follows for one piece of work: the quality bar, the files it writes, and where you decide.</p>
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
          <h2 id="contrib">Publish how you do the work, under your name.</h2>
          <p>Your agent interviews you, writes your method down in the library format and opens the pull request. The skill carries your name as its author.</p>
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
            description: `Open GRC skills for AI agents: ${n} skills written the way experienced GRC people do the work.`,
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
