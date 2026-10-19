import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import CopyButton from '@/components/CopyButton';
import { meta } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Contribute a skill',
  description: 'Write down a GRC job you do well, with your own AI agent. It interviews you, drafts the skill in the library format and opens the pull request; you are credited as the author.',
  alternates: { canonical: '/contribute/' },
};

const repo = meta.repoUrl;

export default function Contribute() {
  return (
    <div className="page">
      <Breadcrumbs items={[{ name: 'Contribute', href: '/contribute/' }]} />
      <header className="page-head">
        <h1>Contribute a skill, with your AI</h1>
        <p className="lead">You do not need to know git. Paste this into your agent and answer its questions about one GRC job you do well.</p>
      </header>

      <div className="pcard">
        <p className="lbl">The contribution prompt</p>
        <pre>{meta.contributePrompt}</pre>
        <div className="prow">
          <small>Your agent shows you every file before it submits anything.</small>
          <div className="ctas">
            <CopyButton text={meta.contributePrompt} label="Copy the prompt" />
            <a className="b2" href={`${repo}/blob/main/CONTRIBUTING.md`}>Read CONTRIBUTING.md</a>
          </div>
        </div>
      </div>

      <section className="section two" aria-labelledby="how">
        <div>
          <h2 id="how">What your agent does</h2>
          <ol className="steps">
            <li><b>Interviews you</b><span>Your thresholds, examples and the mistakes you see, for one job.</span></li>
            <li><b>Drafts the skill</b><span>One SKILL.md in the library format, with a &ldquo;What good looks like&rdquo; section and hard rules.</span></li>
            <li><b>Validates it</b><span>Runs <code>node tools/validate.mjs</code> and fixes every line it reports.</span></li>
            <li><b>Opens the pull request</b><span>Only after you say yes. Without git, it files a &ldquo;Submit a skill&rdquo; issue instead.</span></li>
          </ol>
        </div>
        <div>
          <h2 id="after">What happens after</h2>
          <ol className="steps">
            <li><b>Automatic checks</b><span>CI runs the validator with a read-only token. An outside pull request may only change its own <code>skills/&lt;your-slug&gt;/</code> folder.</span></li>
            <li><b>Security gate</b><span>A skill runs inside other people&rsquo;s environments, so it may never send data off the machine, download or run code, read credentials, address reviewers or skip the reader&rsquo;s approvals.</span></li>
            <li><b>Content review</b><span>No text from any standard, a framework accuracy challenge, and a second model that did not write the skill.</span></li>
            <li><b>The founder approves the merge</b><span>Every outside merge needs his approval of the exact commit. Automated verdicts are advisory and never merge outside text.</span></li>
          </ol>
        </div>
      </section>

      <section className="section two" aria-labelledby="credit">
        <div>
          <h2 id="credit">Credit, not contact details</h2>
          <p className="bio">Your author page shows your name, title, LinkedIn profile and company domain, never an email address. Profiles go live once we confirm the LinkedIn profile is yours. Ask for a correction or removal at any time by opening an issue.</p>
        </div>
        <div>
          <h2 id="report">Found a problem in a skill?</h2>
          <p className="bio">Report it privately through a <a href={`${repo}/security/advisories/new`}>GitHub security advisory</a>, not a public issue. A confirmed bad skill is reverted and a new release is cut.</p>
        </div>
      </section>
    </div>
  );
}
