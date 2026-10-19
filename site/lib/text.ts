// The first sentence of a maintainer intro, used as the page's meta description.
export const firstSentence = (text: string) => text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
