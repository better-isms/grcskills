import { getAuthor, githubFolderUrl, SITE_URL, frameworkLabel, type Author, type Skill } from './content';

export const personLd = (a: Author) => ({
  '@type': 'Person',
  name: a.name,
  jobTitle: a.title,
  url: `${SITE_URL}/${a.slug}/`,
  sameAs: [a.linkedinUrl],
});

// A skill is a SKILL.md an agent reads, so SoftwareSourceCode (a CreativeWork)
// with codeRepository pointing at the skill's folder in the pinned release.
export const skillLd = (s: Skill) => {
  const a = getAuthor(s.author);
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: s.title,
    description: s.summary,
    url: `${SITE_URL}/skill/${s.slug}/`,
    codeRepository: githubFolderUrl(s.repoPath),
    image: `${SITE_URL}${s.image}`,
    license: 'https://opensource.org/licenses/MIT',
    inLanguage: 'en',
    genre: s.categoryLabel,
    keywords: [...s.frameworks.map(frameworkLabel), ...s.tags].join(', '),
    ...(s.datePublished ? { datePublished: s.datePublished } : {}),
    ...(s.dateModified ? { dateModified: s.dateModified } : {}),
    isPartOf: { '@type': 'CollectionPage', name: 'grcskills', url: `${SITE_URL}/` },
    ...(a ? { author: personLd(a) } : {}),
  };
};
