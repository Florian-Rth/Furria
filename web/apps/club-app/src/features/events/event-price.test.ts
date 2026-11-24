import { describe, expect, it } from 'vitest';
import { toPriceCents } from './event-price';

describe('toPriceCents', () => {
  it.each<[string, number | null]>([
    ['22,5', 2_250],
    ['22.05', 2_205],
    ['   ', null],
  ])('reads „%s“ as %s cents', (price, expected) => {
    expect(toPriceCents(price)).toBe(expected);
  });
});
