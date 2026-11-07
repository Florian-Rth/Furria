import { cardEyebrowOf, countLengthTextOf } from '@furria/studio/job-copy';
import { describe, expect, it } from 'vitest';

describe('countLengthTextOf', () => {
  it.each([
    [4, '4 Zählzeiten'],
    [16, '16 Zählzeiten · 2 Achter'],
    [15, '15 Zählzeiten · 1 Achter + 7'],
  ])('formats %i counts', (counts, text) => {
    expect(countLengthTextOf(counts)).toBe(text);
  });
});

describe('cardEyebrowOf', () => {
  it.each([
    [1, 13, 'Marsch', 15, 'Schritt 1/13 · Marsch · 1 Achter + 7'],
    [2, 13, null, 4, 'Schritt 2/13 · 4 Zählzeiten'],
    [3, 13, null, 0, 'Schritt 3/13'],
  ] as const)('formats step %i of %i', (number, total, part, counts, text) => {
    expect(cardEyebrowOf(number, total, part, counts)).toBe(text);
  });
});
