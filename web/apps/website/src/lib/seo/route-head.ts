import type { AnyRouteMatch } from '@tanstack/react-router';

export type RouteHead = {
  meta: NonNullable<AnyRouteMatch['meta']>;
  links?: NonNullable<AnyRouteMatch['links']>;
  scripts?: NonNullable<AnyRouteMatch['headScripts']>;
};

export interface PageHeadInput {
  path: string;
  title: string;
  description: string;
}

export const SITE_ORIGIN = 'https://furrscher-carnevals-club.de';

export const SITE_NAME = 'Furrscher Carnevals Club';

export const SITE_ALTERNATE_NAMES = ['FCC Großfurra', 'FCC'];

const PAGE_TITLE_SUFFIX = 'FCC Großfurra';

export const pageTitle = (name: string): string => `${name} · ${PAGE_TITLE_SUFFIX}`;

export const NO_INDEX_META: RouteHead['meta'][number] = { name: 'robots', content: 'noindex' };

export const SITE_META: RouteHead['meta'] = [
  { property: 'og:locale', content: 'de_DE' },
  { property: 'og:site_name', content: SITE_NAME },
  { property: 'og:type', content: 'website' },
  { name: 'twitter:card', content: 'summary_large_image' },
];

export const absoluteUrlOf = (pathOrUrl: string): string => new URL(pathOrUrl, SITE_ORIGIN).href;

export const shareImageMeta = (imageUrl: string, alt: string): RouteHead['meta'] => [
  { property: 'og:image', content: absoluteUrlOf(imageUrl) },
  { property: 'og:image:alt', content: alt },
];

export const jsonLdScript = (data: object): NonNullable<RouteHead['scripts']>[number] => ({
  type: 'application/ld+json',
  children: JSON.stringify(data),
});

export const indexablePageHead = ({ path, title, description }: PageHeadInput): RouteHead => {
  const url = absoluteUrlOf(path);

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
    ],
    links: [{ rel: 'canonical', href: url }],
  };
};
