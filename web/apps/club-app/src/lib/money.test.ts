import { describe, expect, it } from 'vitest';
import { payPalLinkOf } from './money';

describe('payPalLinkOf', () => {
  it.each([['https://paypal.me/getraenkewart/', 1350, 'https://paypal.me/getraenkewart/13.50EUR']])(
    'asks %s for %i cents',
    (link, cents, expected) => {
      expect(payPalLinkOf(link, cents)).toBe(expected);
    },
  );
});
