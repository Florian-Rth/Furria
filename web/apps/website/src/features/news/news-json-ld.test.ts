import { describe, expect, it } from 'vitest';
import type { NewsArticle } from '@/lib/public-news/schemas';
import { buildNewsArticleJsonLd } from './news-json-ld';

const article = (overrides: Partial<NewsArticle>): NewsArticle => ({
  slug: 'motto-2026',
  title: 'Das Motto steht',
  teaser: 'Die Session hat ihr Motto.',
  text: '',
  category: 'session',
  publishedAt: '2026-11-11T11:11',
  picture: null,
  author: null,
  pictureCaption: null,
  mentionedGroups: [],
  mentionedPersons: [],
  event: null,
  album: null,
  ...overrides,
});

describe('buildNewsArticleJsonLd', () => {
  it('describes a post without author or picture as published by the club', () => {
    expect(buildNewsArticleJsonLd(article({}))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: 'Das Motto steht',
      description: 'Die Session hat ihr Motto.',
      datePublished: '2026-11-11T11:11:00+01:00',
      mainEntityOfPage: 'https://furrscher-carnevals-club.de/news/motto-2026',
      author: {
        '@type': 'Organization',
        name: 'Furrscher Carnevals Club',
        url: 'https://furrscher-carnevals-club.de/',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Furrscher Carnevals Club',
        url: 'https://furrscher-carnevals-club.de/',
      },
    });
  });

  it('names the author and the absolute picture when the post has them', () => {
    const jsonLd = buildNewsArticleJsonLd(
      article({
        author: { firstName: 'Anna', lastName: 'Narr' },
        picture: {
          smallUrl: '/api/public/news/pictures/3/small',
          mediumUrl: '/api/public/news/pictures/3/medium',
          largeUrl: '/api/public/news/pictures/3/large',
        },
      }),
    );

    expect([jsonLd.author, jsonLd.image]).toEqual([
      { '@type': 'Person', name: 'Anna Narr' },
      ['https://furrscher-carnevals-club.de/api/public/news/pictures/3/large'],
    ]);
  });
});
