import { describe, expect, it } from 'vitest';
import { pageFileNameOf, prerenderedFiles } from './prerendered-files';

const TEMPLATE = '<head><!--page-head--></head>';

describe('pageFileNameOf', () => {
  it.each([
    ['/', 'index.html'],
    ['/club', 'club/index.html'],
    ['/join/apply', 'join/apply/index.html'],
    ['/news/', 'news/index.html'],
  ])('writes %s to %s', (path, fileName) => {
    expect(pageFileNameOf(path)).toBe(fileName);
  });
});

describe('prerenderedFiles', () => {
  it('refuses a template without the page head placeholder', () => {
    expect(() => prerenderedFiles('<head></head>')).toThrow();
  });

  it('gives every static page its own canonical head', () => {
    const club = prerenderedFiles(TEMPLATE).find((file) => file.fileName === 'club/index.html');

    expect(club?.source).toContain(
      '<link data-page-head rel="canonical" href="https://furrscher-carnevals-club.de/club">',
    );
  });

  it('keeps the shell for unknown paths out of the index', () => {
    const shell = prerenderedFiles(TEMPLATE).find((file) => file.fileName === 'app-shell.html');

    expect(shell?.source).toContain('<meta data-page-head name="robots" content="noindex">');
  });

  it('points crawlers at the sitemap index of both sitemaps', () => {
    const files = new Map(prerenderedFiles(TEMPLATE).map((file) => [file.fileName, file.source]));

    expect([files.get('robots.txt'), files.get('sitemap.xml')]).toEqual([
      'User-agent: *\nAllow: /\n\nSitemap: https://furrscher-carnevals-club.de/sitemap.xml\n',
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <sitemap><loc>https://furrscher-carnevals-club.de/sitemap-pages.xml</loc></sitemap>',
        '  <sitemap><loc>https://furrscher-carnevals-club.de/sitemap-content.xml</loc></sitemap>',
        '</sitemapindex>',
        '',
      ].join('\n'),
    ]);
  });
});
