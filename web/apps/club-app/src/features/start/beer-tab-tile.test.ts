import { describe, expect, it } from 'vitest';
import { beerTabLineOf, formatEuroCents, isBeerTabDue } from './beer-tab-tile';

describe('formatEuroCents', () => {
  it.each([
    [3000, '30,00 €'],
    [1350, '13,50 €'],
    [123_400, '1.234,00 €'],
  ])('formats %i cents', (cents, expected) => {
    expect(formatEuroCents(cents)).toBe(expected);
  });
});

describe('isBeerTabDue', () => {
  it.each([
    ['2026-10-28T12:00:00Z', true],
    ['2026-10-28T12:00:01Z', false],
  ])('is due once the oldest open crate from %s is a week old', (oldestOpenBookedAt, expected) => {
    const tab = {
      beerPotId: 4,
      potIsOpen: true,
      openCrates: 1,
      openCents: 1500,
      oldestOpenBookedAt,
      owner: null,
      paymentLink: null,
      paymentNote: null,
    };

    expect(isBeerTabDue([tab], new Date('2026-11-04T12:00:00Z'))).toBe(expected);
  });
});

describe('beerTabLineOf', () => {
  it.each([
    [{ personId: 3, firstName: 'Greta', lastName: 'Gruber' }, 'Greta Gruber'],
    [null, null],
  ])('names the owner the tab is owed to', (owner, expected) => {
    const line = beerTabLineOf({
      beerPotId: 4,
      potIsOpen: true,
      openCrates: 2,
      openCents: 2600,
      oldestOpenBookedAt: '2026-10-26T18:00:00+01:00',
      owner,
      paymentLink: null,
      paymentNote: null,
    });

    expect(line.ownerName).toBe(expected);
  });
});
