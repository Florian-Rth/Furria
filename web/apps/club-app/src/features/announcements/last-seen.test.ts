import { describe, expect, it } from 'vitest';
import { toNewestPublishedAt, toNextLastSeenAt } from './last-seen';

describe('toNewestPublishedAt', () => {
  it.each([
    {
      label: 'offsets hide which instant is later',
      published: ['2027-01-12T10:30:00+01:00', '2027-01-12T09:45:00Z'],
      expected: '2027-01-12T09:45:00Z',
    },
  ])('is $expected when $label', ({ published, expected }) => {
    expect(toNewestPublishedAt(published.map((publishedAt) => ({ publishedAt })))).toBe(expected);
  });
});

describe('toNextLastSeenAt', () => {
  const now = new Date('2027-01-19T18:50:00Z');

  it.each([
    {
      label: 'she saw only older announcements than last time',
      current: '2027-01-18T08:00:00Z',
      seenUpTo: '2027-01-10T08:00:00Z',
      expected: '2027-01-18T08:00:00Z',
    },
    {
      label: 'the seen moment lies in the future',
      current: '2027-01-10T08:00:00Z',
      seenUpTo: '2027-01-20T08:00:00Z',
      expected: '2027-01-19T18:50:00.000Z',
    },
    {
      label: 'the stored moment already lies ahead of now',
      current: '2027-01-19T19:00:00Z',
      seenUpTo: null,
      expected: '2027-01-19T19:00:00Z',
    },
  ])('keeps $expected when $label', ({ current, seenUpTo, expected }) => {
    expect(toNextLastSeenAt(current, seenUpTo, now)).toBe(expected);
  });
});
