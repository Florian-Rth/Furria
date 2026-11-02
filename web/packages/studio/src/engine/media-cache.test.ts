import { describe, expect, it } from 'vitest';
import type { CachedMedia } from './media-cache';
import { evictionsOf } from './media-cache';

describe('evictionsOf', () => {
  it.each<[string, CachedMedia[], number, number, number[]]>([
    [
      'keeps everything within the budget',
      [
        { key: 1, bytes: 40, usedAt: 1 },
        { key: 2, bytes: 50, usedAt: 2 },
      ],
      100,
      2,
      [],
    ],
    [
      'drops the least recently used first until the budget fits',
      [
        { key: 1, bytes: 40, usedAt: 3 },
        { key: 2, bytes: 50, usedAt: 1 },
        { key: 3, bytes: 60, usedAt: 2 },
        { key: 4, bytes: 30, usedAt: 4 },
      ],
      100,
      4,
      [2, 3],
    ],
    [
      'never drops the media just loaded, even above the budget',
      [
        { key: 1, bytes: 40, usedAt: 1 },
        { key: 2, bytes: 200, usedAt: 2 },
      ],
      100,
      2,
      [1],
    ],
    [
      'skips media still decoding, they hold no memory yet',
      [
        { key: 1, bytes: 0, usedAt: 1 },
        { key: 2, bytes: 80, usedAt: 2 },
        { key: 3, bytes: 80, usedAt: 3 },
      ],
      100,
      3,
      [2],
    ],
  ])('%s', (_, entries, budget, kept, expected) => {
    expect(evictionsOf(entries, budget, kept)).toEqual(expected);
  });
});
