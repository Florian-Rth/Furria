import type { KkNewsTone } from '@furria/ui';
import { describe, expect, it } from 'vitest';
import type { NewsCategory, NewsEvent, NewsPost, NewsSection } from '@/lib/public-news/schemas';
import {
  arrangeNewsFront,
  buildEventTieLine,
  buildSessionLabel,
  categoryToneOf,
  selectRelatedPosts,
  selectTeaserPosts,
} from './news-content';

const post = (slug: string): NewsPost => ({
  slug,
  title: slug,
  teaser: 'Teaser',
  text: 'Absatz',
  category: 'club',
  publishedAt: '2026-07-18T11:11',
  picture: null,
});

const section = (startYear: number, slugs: string[]): NewsSection => ({
  session: { startYear, yearsLabel: `${startYear}/xx`, number: null },
  posts: slugs.map(post),
});

const slugsOf = (posts: NewsPost[]): string[] => posts.map((entry) => entry.slug);

describe('arrangeNewsFront', () => {
  it('leads with the newest post and keeps older sessions apart', () => {
    const front = arrangeNewsFront([
      section(2025, ['newest', 'middle']),
      section(2024, ['old']),
      section(2023, ['oldest']),
    ]);

    expect([
      front?.lead.slug,
      slugsOf(front?.following ?? []),
      front?.olderSections.map((older) => older.session.startYear),
    ]).toEqual(['newest', ['middle'], [2024, 2023]]);
  });

  it('has no front while nothing is published', () => {
    expect(arrangeNewsFront([])).toBeNull();
  });
});

describe('selectRelatedPosts', () => {
  it('reaches into older sessions, skips the open post and caps at three', () => {
    const sections = [
      section(2025, ['open', 'second']),
      section(2024, ['third', 'fourth', 'fifth']),
    ];

    expect(slugsOf(selectRelatedPosts(sections, 'open'))).toEqual(['second', 'third', 'fourth']);
  });
});

describe('selectTeaserPosts', () => {
  it('takes the three newest posts across sessions', () => {
    const sections = [section(2025, ['first']), section(2024, ['second', 'third', 'fourth'])];

    expect(slugsOf(selectTeaserPosts(sections))).toEqual(['first', 'second', 'third']);
  });
});

describe('categoryToneOf', () => {
  it.each<[NewsCategory, KkNewsTone]>([
    ['session', 'red'],
    ['achievements', 'gold'],
    ['club', 'ink'],
    ['groups', 'ink'],
  ])('tones the category %s %s', (category, tone) => {
    expect(categoryToneOf(category)).toBe(tone);
  });
});

describe('buildSessionLabel', () => {
  it.each<[number | null, string]>([
    [67, '67. SESSION 2025/26'],
    [null, 'SESSION 2025/26'],
  ])('labels session number %s as %s', (number, label) => {
    expect(buildSessionLabel({ startYear: 2025, yearsLabel: '2025/26', number })).toBe(label);
  });
});

describe('buildEventTieLine', () => {
  const event: NewsEvent = {
    eventId: 4,
    title: 'Prunksitzung',
    startsAt: '2027-01-23T19:11',
    endsAt: null,
    venueName: 'Dorfgemeindehaus',
    isCancelled: false,
  };

  it.each<[string, NewsEvent, string]>([
    ['a held event', event, 'Sa., 23. Januar 2027 · 19:11 Uhr · Dorfgemeindehaus'],
    [
      'a cancelled event without venue',
      { ...event, venueName: null, isCancelled: true },
      'Sa., 23. Januar 2027 · 19:11 Uhr · Abgesagt',
    ],
  ])('lines up %s', (_, tied, line) => {
    expect(buildEventTieLine(tied)).toBe(line);
  });
});
