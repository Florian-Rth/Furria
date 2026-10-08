import { describe, expect, it } from 'vitest';
import { toSeenUpTo } from './start-seen';

describe('toSeenUpTo', () => {
  it.each([
    { label: 'the panel holds nothing', published: [], lastSeen: null, expected: null },
    {
      label: 'she has never looked at the board',
      published: ['2027-01-12T09:00:00Z', '2027-01-15T18:00:00Z'],
      lastSeen: null,
      expected: '2027-01-15T18:00:00Z',
    },
    {
      label: 'the newest lies after her last visit',
      published: ['2027-01-15T18:00:00Z', '2027-01-12T09:00:00Z'],
      lastSeen: '2027-01-13T07:00:00Z',
      expected: '2027-01-15T18:00:00Z',
    },
    {
      label: 'she already marked this very announcement',
      published: ['2027-01-15T19:00:00+01:00'],
      lastSeen: '2027-01-15T18:00:00Z',
      expected: null,
    },
  ])('sends $expected when $label', ({ published, lastSeen, expected }) => {
    expect(
      toSeenUpTo(
        published.map((publishedAt) => ({ publishedAt })),
        lastSeen,
      ),
    ).toBe(expected);
  });
});
