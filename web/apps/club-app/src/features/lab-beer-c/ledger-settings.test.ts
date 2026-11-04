import { describe, expect, it } from 'vitest';
import { centsOfPrice, priceInputOf, settingsOf } from './ledger-settings';

describe('centsOfPrice', () => {
  it.each([
    ['18', 1800],
    ['18,5', 1850],
    ['18,00 €', 1800],
    ['17.90', 1790],
    ['0', null],
    ['abc', null],
    ['18,123', null],
  ])('reads %s', (input, cents) => {
    expect(centsOfPrice(input)).toBe(cents);
  });
});

describe('priceInputOf', () => {
  it('writes cents as a German price', () => {
    expect(priceInputOf(1850)).toBe('18,50');
  });
});

describe('settingsOf', () => {
  it('drops blank payment details', () => {
    expect(settingsOf('18', ' ', 'IBAN')).toEqual({
      priceCents: 1800,
      paymentLink: null,
      paymentNote: 'IBAN',
    });
  });

  it('refuses an invalid price', () => {
    expect(settingsOf('x', '', '')).toBeNull();
  });
});
