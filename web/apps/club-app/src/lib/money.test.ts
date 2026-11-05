import { describe, expect, it } from 'vitest';
import { formatEuroCents, payPalLinkOf } from './money';

const NBSP = ' ';

describe('formatEuroCents', () => {
  it.each([
    [3000, `30,00${NBSP}€`],
    [1350, `13,50${NBSP}€`],
    [123_400, `1.234,00${NBSP}€`],
  ])('formats %i cents', (cents, expected) => {
    expect(formatEuroCents(cents)).toBe(expected);
  });
});

describe('payPalLinkOf', () => {
  it.each([
    ['https://paypal.me/getraenkewart', 3000, 'https://paypal.me/getraenkewart/30.00EUR'],
    ['https://paypal.me/getraenkewart/', 1350, 'https://paypal.me/getraenkewart/13.50EUR'],
  ])('asks %s for %i cents', (link, cents, expected) => {
    expect(payPalLinkOf(link, cents)).toBe(expected);
  });
});
