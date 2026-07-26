import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { findPostBySlug, NEWS_POSTS } from '@/features/news';
import { writeGrantedToSession } from '@/features/preview-access';
import { pageTitle } from '@/lib/seo';
import { markChangelogSeen } from '@/test/changelog';
import { renderAtRoute } from '@/test/render';

beforeEach(() => {
  markChangelogSeen();
});

afterEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
});

const seededPost = (slug: string): { title: string; teaser: string; publishedAt: string } => {
  const post = findPostBySlug(NEWS_POSTS, slug);
  if (post === undefined) {
    throw new Error(`missing seeded Meldung: ${slug}`);
  }
  return post;
};

const headContent = (selector: string, attribute: string): string | null =>
  document.querySelector(selector)?.getAttribute(attribute) ?? null;

describe('news post route', () => {
  it('renders the Meldung behind a known slug', async () => {
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/news/motto-56');

    expect(
      await screen.findByRole('heading', { level: 1, name: seededPost('motto-56').title }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Alle Meldungen' })).toHaveAttribute('href', '/news');
  });

  it('publishes a per-post document head that overrides the site defaults', async () => {
    const post = seededPost('motto-56');
    writeGrantedToSession(window.sessionStorage);
    renderAtRoute('/news/motto-56');

    await screen.findByRole('heading', { level: 1, name: post.title });

    expect(document.title).toBe(pageTitle(post.title));
    expect(headContent('meta[name="description"]', 'content')).toBe(post.teaser);
    expect(headContent('meta[property="og:title"]', 'content')).toBe(pageTitle(post.title));
    expect(headContent('meta[property="og:description"]', 'content')).toBe(post.teaser);
    expect(headContent('meta[property="og:type"]', 'content')).toBe('article');
    expect(headContent('meta[property="article:published_time"]', 'content')).toBe(
      post.publishedAt,
    );
    expect(headContent('link[rel="canonical"]', 'href')).toBe('/news/motto-56');
  });
});
