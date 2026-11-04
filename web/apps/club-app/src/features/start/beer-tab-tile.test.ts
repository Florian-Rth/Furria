import { describe, expect, it } from 'vitest';
import { beerTabLineOf, isBeerTabDue } from './beer-tab-tile';
import type { StartBeerTab } from './schemas';

const NOW = new Date('2026-11-04T12:00:00Z');

describe('isBeerTabDue', () => {
  it.each([
    [['2026-10-28T12:00:00Z'], true],
    [['2026-10-28T12:00:01Z'], false],
    [['2026-11-03T12:00:00Z', '2026-10-20T12:00:00Z'], true],
    [[], false],
  ])('is due once an oldest open crate of %j is a week old', (bookedAts, expected) => {
    const tabs: StartBeerTab[] = bookedAts.map((oldestOpenBookedAt, index) => ({
      beerPotId: index + 1,
      openCrates: 1,
      openCents: 1500,
      oldestOpenBookedAt,
      owner: null,
      paymentLink: null,
      paymentNote: null,
    }));

    expect(isBeerTabDue(tabs, NOW)).toBe(expected);
  });
});

describe('beerTabLineOf', () => {
  it.each([
    ['https://paypal.me/greta', 'https://paypal.me/greta/26.00EUR'],
    [null, null],
  ])('asks PayPal for the open amount when the owner gave %s', (paymentLink, expected) => {
    const line = beerTabLineOf({
      beerPotId: 4,
      openCrates: 2,
      openCents: 2600,
      oldestOpenBookedAt: '2026-10-26T18:00:00+01:00',
      owner: { personId: 3, firstName: 'Greta', lastName: 'Gruber' },
      paymentLink,
      paymentNote: null,
    });

    expect(line.payHref).toBe(expected);
  });
});
