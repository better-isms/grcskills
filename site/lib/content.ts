// Typed access to the content model written by scripts/build-content.mjs.
// Every string here came from contributor files and passed the schema; HTML
// fields were rendered by markdown-it with raw HTML disabled.
import data from '../.generated/content.json';

export type Reference = { slug: string; title: string; html: string; repoPath: string };
export type Skill = {
  slug: string;
  author: string;
  title: string;
  description: string;
  summary: string;
  category: string;
  categoryLabel: string;
  frameworks: string[];
  tags: string[];
  contributors: string[];
  html: string;
  decisions: string[];
  words: number;
  references: Reference[];
  repoPath: string;
  related: string[];
  dateModified: string | null;
  datePublished: string | null;
  image: string;
};
export type Author = {
  slug: string;
  name: string;
  title: string;
  linkedinUrl: string;
  companyDomain: string;
  bio: string;
  bioHtml: string;
  initials: string;
  skills: string[];
  dateModified: string | null;
};
export type Category = { slug: string; label: string; count: number; intro: string; dateModified: string | null };
export type Framework = { tag: string; label: string; count: number; intro: string; indexable: boolean; dateModified: string | null };
export type Meta = {
  sha: string;
  tag: string;
  builtAt: string;
  dateModified: string | null;
  count: number;
  prompt: string;
  contributePrompt: string;
  repo: string;
  repoUrl: string;
  siteUrl: string;
};

const content = data as unknown as {
  meta: Meta;
  skills: Skill[];
  authors: Author[];
  categories: Category[];
  frameworks: Framework[];
};

export const meta = content.meta;
export const skills = content.skills;
export const authors = content.authors;
export const categories = content.categories;
export const frameworks = content.frameworks;

export const SITE_URL = meta.siteUrl;
export const FEATURED_SLUG = 'grc-setup-review';

export const getSkill = (slug: string) => skills.find((s) => s.slug === slug);
export const getAuthor = (slug: string) => authors.find((a) => a.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getFramework = (tag: string) => frameworks.find((f) => f.tag === tag);
export const frameworkLabel = (tag: string) => getFramework(tag)?.label ?? tag;
export const skillsInCategory = (slug: string) => skills.filter((s) => s.category === slug);
export const skillsWithFramework = (tag: string) => skills.filter((s) => s.frameworks.includes(tag));
export const skillsByAuthor = (slug: string) => skills.filter((s) => s.author === slug);
export const featuredSkill = () => getSkill(FEATURED_SLUG) ?? skills[0];

export const copilotUrl = (slug: string) => `https://www.ismscopilot.com/mcp?ref=grcskills-${slug}`;
export const COPILOT_FOOTER_URL = 'https://www.ismscopilot.com/?ref=grcskills-footer';
// ISMS Copilot, the GRC specialist an agent calls while a skill runs (founder
// ask 2026-10-20). Every claim in COPILOT_* copy is from ismscopilot.com/mcp.
// Each placement carries its own ref so the funnel can tell them apart.
export const COPILOT_MCP_ENDPOINT = 'https://account.ismscopilot.com/v1/account/mcp';
export const COPILOT_HOME_URL = copilotUrl('home');
export const COPILOT_NAV_URL = copilotUrl('nav');
export const COPILOT_LINE = 'The skills are the steps. When a framework question comes up, your AI can ask ISMS Copilot and get the answer with the clause number, not a guess from memory. You check that number before you sign.';

// heyGRC, from the same team: reviews each pull request against the frameworks
// the customer picks, after a skill has run. heyGRC measures by page path, so the link carries no query
// string (founder decisions X3 and X4, 2026-10-20).
export const HEYGRC_URL = 'https://heygrc.com/for/grc-teams';
// The only skill pages that show the heyGRC card: the ones whose output lives
// in pull requests. Any other skill page shows none.
export const HEYGRC_SKILLS: Record<string, string> = {
  'secure-development-policy-from-pipeline': 'Once you sign this policy off, heyGRC reviews each pull request against the frameworks you pick and cites the control behind each finding.',
  'change-management-evidence-sampling': 'Your sample shows how past changes went. heyGRC reviews each pull request as it opens and leaves its check and findings on it, so the next sample starts from records.',
  'policy-gap-review-against-practice': 'Once policy and practice match, look at the next changes too. heyGRC reviews each pull request and gives you the evidence, with the control behind each finding cited.',
  'grc-setup-review': 'Your review names what to fix. For the controls that live in code, heyGRC reviews each pull request and gives you the evidence.',
};
// List pages that show the same card, by path.
export const HEYGRC_LIST_PATHS = ['/category/evidence/', '/category/policies/', '/framework/cra/'];
export const HEYGRC_LINE = 'Your policy says every change is reviewed. heyGRC checks each pull request and gives you the evidence, with the control behind each finding cited.';
// The heyGRC announcement bar above the nav on every page (founder pick
// 2026-10-20; it replaces the footer line). The long copy shows on wide
// screens, the short one on phones. TOPBAR.id is the value public/topbar.js
// stores when a visitor dismisses the bar: change both together, and a new
// bar shows again to visitors who closed the old one.
export const TOPBAR = {
  id: 'heygrc-1',
  long: 'From the grcskills team: heyGRC checks each pull request against your frameworks.',
  short: 'heyGRC: evidence on each pull request.',
  link: 'See how',
  dismiss: 'Dismiss heyGRC announcement',
};
export const githubUrl = (repoPath: string) => `${meta.repoUrl}/blob/${meta.tag}/${repoPath}`;
export const githubFolderUrl = (repoPath: string) => `${meta.repoUrl}/tree/${meta.tag}/${repoPath.replace(/\/SKILL\.md$/, '')}`;
export const relatedTo = (s: Skill) => s.related.map(getSkill).filter((x): x is Skill => Boolean(x));

export const installCommands = (slug: string) => ({
  npx: `npx skills add ${meta.repo}#${meta.tag} --skill ${slug}`,
  plugin: `/plugin marketplace add ${meta.repo}\n/plugin install grcskills@grcskills`,
  clone: `git clone --branch ${meta.tag} ${meta.repoUrl}`,
});

// Plain row data for lists, safe to pass to client components.
export type RowData = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  categoryLabel: string;
  frameworks: string[];
  frameworkLabels: string[];
  author: string;
};
export const toRow = (s: Skill): RowData => ({
  slug: s.slug,
  title: s.title,
  summary: s.summary,
  category: s.category,
  categoryLabel: s.categoryLabel,
  frameworks: s.frameworks,
  frameworkLabels: s.frameworks.map(frameworkLabel),
  author: getAuthor(s.author)?.name ?? s.author,
});
