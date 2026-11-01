import { describe, expect, it } from 'vitest';
import type { PublishedDay } from './news-tile';
import { publishedDayOf } from './news-tile';

describe('publishedDayOf', () => {
  it.each<[string, string, PublishedDay]>([
    ['2026-11-01T08:00:00+01:00', '2026-11-01T19:00:00+01:00', { kind: 'today' }],
    ['2026-10-31T21:00:00+01:00', '2026-11-01T09:00:00+01:00', { kind: 'yesterday' }],
    ['2026-10-28T12:00:00+01:00', '2026-11-01T12:00:00+01:00', { kind: 'date', date: '28. Okt.' }],
  ])('dates a post published at %s seen at %s', (publishedAt, now, expected) => {
    expect(publishedDayOf(publishedAt, new Date(now))).toEqual(expected);
  });
});
