import { describe, expect, it } from 'vitest';
import type { CategoryTone, InlineSegment, NewsCategory, NewsPost } from './news-content';
import {
  categoryToneOf,
  parseInlineBold,
  readingMinutesOf,
  resolveArchiveSession,
  selectFollowingPosts,
  selectLeadPost,
  selectRelatedPosts,
} from './news-content';

const post = (slug: string, publishedAt: string): NewsPost => ({
  slug,
  title: slug,
  category: 'Verein',
  publishedAt,
  teaser: 'Teaser',
  body: ['Absatz'],
  image: null,
  author: null,
});

const words = (count: number): string => Array.from({ length: count }, () => 'Wort').join(' ');

describe('selectLeadPost and selectFollowingPosts', () => {
  it('partitions the Meldungen into the newest and the rest', () => {
    const posts = [
      post('older', '2026-05-30'),
      post('newest', '2026-07-18'),
      post('middle', '2026-06-14'),
    ];

    expect(selectLeadPost(posts)?.slug).toBe('newest');
    expect(selectFollowingPosts(posts).map((entry) => entry.slug)).toEqual(['middle', 'older']);
  });
});

describe('selectRelatedPosts', () => {
  it('excludes the open Meldung and caps the rest at three, newest first', () => {
    const related = selectRelatedPosts(
      [
        post('oldest', '2026-05-30'),
        post('open', '2026-07-18'),
        post('middle', '2026-06-14'),
        post('newer', '2026-07-04'),
        post('older', '2026-06-01'),
      ],
      'open',
    );

    expect(related.map((entry) => entry.slug)).toEqual(['newer', 'middle', 'older']);
  });
});

describe('categoryToneOf', () => {
  it.each<[NewsCategory, CategoryTone]>([
    ['Session', 'red'],
    ['Erfolge', 'gold'],
    ['Verein', 'ink'],
  ])('tones the category %s %s', (category, tone) => {
    expect(categoryToneOf(category)).toBe(tone);
  });
});

describe('resolveArchiveSession', () => {
  const duringOpenSession = new Date('2026-07-26T12:00:00');

  it.each<[string, NewsPost[], number | null]>([
    [
      'every Meldung belongs to the open Session',
      [post('sommer', '2026-07-18'), post('winter', '2026-01-20')],
      null,
    ],
    [
      'older Meldungen exist',
      [post('uralt', '2024-02-05'), post('alt', '2025-03-10'), post('aktuell', '2026-07-18')],
      2024,
    ],
  ])('names the newest older Session when %s', (_, posts, startYear) => {
    expect(resolveArchiveSession(posts, duringOpenSession)?.startYear ?? null).toBe(startYear);
  });
});

describe('readingMinutesOf', () => {
  it.each([
    [[words(360)], null],
    [[words(361)], 3],
    [[words(200), words(200), words(200)], 4],
  ])('reads %#. body in %s minutes', (body, minutes) => {
    expect(readingMinutesOf(body)).toBe(minutes);
  });
});

describe('parseInlineBold', () => {
  it.each<[string, InlineSegment[]]>([
    ['Ganz ohne Auszeichnung.', [{ text: 'Ganz ohne Auszeichnung.', bold: false }]],
    [
      'Motto: **Groß Furria hebt ab**, ab November.',
      [
        { text: 'Motto: ', bold: false },
        { text: 'Groß Furria hebt ab', bold: true },
        { text: ', ab November.', bold: false },
      ],
    ],
    [
      '**fett** und **offen',
      [
        { text: 'fett', bold: true },
        { text: ' und ', bold: false },
        { text: '**offen', bold: false },
      ],
    ],
    ['****', []],
  ])('parses %j', (paragraph, segments) => {
    expect(parseInlineBold(paragraph)).toEqual(segments);
  });
});
