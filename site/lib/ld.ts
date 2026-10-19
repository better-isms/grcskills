import { getAuthor, SITE_URL, frameworkLabel, type Author, type Skill } from './content';

export const personLd = (a: Author) => ({
  '@type': 'Person',
  name: a.name,
  jobTitle: a.title,
  url: `${SITE_URL}/${a.slug}/`,
  sameAs: [a.linkedinUrl],
});

export const skillLd = (s: Skill) => {
  const a = getAuthor(s.author);
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: s.title,
    description: s.description,
    url: `${SITE_URL}/skill/${s.slug}/`,
    license: 'https://opensource.org/licenses/MIT',
    inLanguage: 'en',
    genre: s.categoryLabel,
    keywords: [...s.frameworks.map(frameworkLabel), ...s.tags].join(', '),
    isPartOf: { '@type': 'CollectionPage', name: 'grcskills', url: `${SITE_URL}/` },
    ...(a ? { author: personLd(a) } : {}),
  };
};
