import { describe, expect, it } from 'vitest';
import { toPriceCents, toPriceText } from './event-price';

describe('toPriceCents', () => {
  it.each<[string, number | null]>([
    ['22', 2_200],
    ['22,5', 2_250],
    ['22.05', 2_205],
    [' 0 ', 0],
    ['   ', null],
  ])('reads „%s“ as %s cents', (price, expected) => {
    expect(toPriceCents(price)).toBe(expected);
  });
});

describe('toPriceText', () => {
  it.each<[number | null, string]>([
    [2_250, '22,50'],
    [2_205, '22,05'],
    [null, ''],
  ])('writes %s cents as „%s“', (priceCents, expected) => {
    expect(toPriceText(priceCents)).toBe(expected);
  });
});
