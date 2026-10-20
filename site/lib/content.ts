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

// heyGRC, from the same team: keeps a control true on each pull request after
// a skill has run. heyGRC measures by page path, so the link carries no query
// string (founder decisions X3 and X4, 2026-10-20).
export const HEYGRC_URL = 'https://heygrc.com/for/grc-teams';
// The only skill pages that show the heyGRC card: the ones whose output lives
// in pull requests. Any other skill page shows none.
export const HEYGRC_SKILLS: Record<string, string> = {
  'secure-development-policy-from-pipeline': 'Your policy now says how code ships. heyGRC checks each pull request against the frameworks you pick and cites the control it touches, so the policy stays true after today.',
  'change-management-evidence-sampling': 'Your sample shows how past changes went. heyGRC checks each pull request as it opens and leaves the evidence on it, so the next sample starts from records.',
  'policy-gap-review-against-practice': 'Once policy and practice match, keep them matched. heyGRC checks each pull request and gives you the evidence, with the control it touches cited.',
  'grc-setup-review': 'Your review names what to fix. For the controls that live in code, heyGRC checks each pull request and gives you the evidence.',
};
// List pages that show the same card, by path.
export const HEYGRC_LIST_PATHS = ['/category/evidence/', '/category/policies/', '/framework/cra/'];
export const HEYGRC_LINE = 'Your policy says every change is reviewed. heyGRC checks each pull request and gives you the evidence, with the control it touches cited.';
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
