import { siteShareImageMeta } from '../website-pictures/share-image-meta';
import { renderHeadHtml } from './head-html';
import type { PageHeadInput, RouteHead } from './route-head';
import {
  absoluteUrlOf,
  indexablePageHead,
  NO_INDEX_META,
  SITE_META,
  SITE_NAME,
} from './route-head';
import { STATIC_PAGES } from './static-pages';

export const PAGE_HEAD_PLACEHOLDER = '<!--page-head-->';

export const APP_SHELL_FILE = 'app-shell.html';
export const CONTENT_PAGE_SHELL_FILE = 'content-page-shell.html';
export const PAGES_SITEMAP_FILE = 'sitemap-pages.xml';
export const CONTENT_SITEMAP_FILE = 'sitemap-content.xml';

export const CONTENT_PAGE_HEAD_INCLUDE =
  '<!--# include virtual="/api/public/page-heads$content_page" -->';

export interface PrerenderedFile {
  fileName: string;
  source: string;
}

const APP_SHELL_HEAD: RouteHead = {
  meta: [
    { title: `${SITE_NAME} — Furrscher Carnevals Club e.V.` },
    NO_INDEX_META,
    ...SITE_META,
    ...siteShareImageMeta([]),
  ],
};

const SITE_FALLBACK_HEAD: RouteHead = { meta: [...SITE_META, ...siteShareImageMeta([])] };

const CONTENT_FALLBACK_HEAD: RouteHead = {
  meta: [
    { property: 'og:locale', content: 'de_DE' },
    { property: 'og:site_name', content: SITE_NAME },
    ...siteShareImageMeta([]),
  ],
};

export const pageFileNameOf = (path: string): string => {
  const directory = path.replace(/^\/+|\/+$/g, '');

  return directory === '' ? 'index.html' : `${directory}/index.html`;
};

const withSiteMeta = (page: PageHeadInput): RouteHead => {
  const head = indexablePageHead(page);

  return { ...head, meta: [...head.meta, ...SITE_FALLBACK_HEAD.meta] };
};

const fillTemplate = (template: string, headHtml: string): string => {
  if (!template.includes(PAGE_HEAD_PLACEHOLDER)) {
    throw new Error(`index.html lacks the ${PAGE_HEAD_PLACEHOLDER} placeholder.`);
  }

  return template.replace(PAGE_HEAD_PLACEHOLDER, headHtml);
};

const renderUrlSet = (urls: readonly string[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

const renderSitemapIndex = (sitemapUrls: readonly string[]): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map((url) => `  <sitemap><loc>${url}</loc></sitemap>`),
    '</sitemapindex>',
    '',
  ].join('\n');

const renderRobots = (sitemapUrl: string): string =>
  ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapUrl}`, ''].join('\n');

export const prerenderedFiles = (template: string): PrerenderedFile[] => {
  const pages: PageHeadInput[] = Object.values(STATIC_PAGES);
  const sitemapIndexUrl = absoluteUrlOf('/sitemap.xml');

  return [
    ...pages.map((page) => ({
      fileName: pageFileNameOf(page.path),
      source: fillTemplate(template, renderHeadHtml(withSiteMeta(page))),
    })),
    { fileName: APP_SHELL_FILE, source: fillTemplate(template, renderHeadHtml(APP_SHELL_HEAD)) },
    {
      fileName: CONTENT_PAGE_SHELL_FILE,
      source: fillTemplate(
        template,
        `${CONTENT_PAGE_HEAD_INCLUDE}\n    ${renderHeadHtml(CONTENT_FALLBACK_HEAD)}`,
      ),
    },
    {
      fileName: PAGES_SITEMAP_FILE,
      source: renderUrlSet(pages.map((page) => absoluteUrlOf(page.path))),
    },
    {
      fileName: 'sitemap.xml',
      source: renderSitemapIndex([
        absoluteUrlOf(`/${PAGES_SITEMAP_FILE}`),
        absoluteUrlOf(`/${CONTENT_SITEMAP_FILE}`),
      ]),
    },
    { fileName: 'robots.txt', source: renderRobots(sitemapIndexUrl) },
  ];
};
