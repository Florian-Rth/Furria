import { describe, expect, it } from 'vitest';
import { payeesOf, tabTotalsOf } from './beer-tab';
import type { BeerTabCrate, BeerTabPot } from './schemas';

const crate = (
  crateId: number,
  bookedAt: string,
  paidAt: string | null = null,
  priceCents = 1500,
): BeerTabCrate => ({
  crateId,
  beerDrinkId: 1,
  drinkName: 'Bier',
  priceCents,
  bookedAt,
  enteredBy: null,
  paidAt,
});

const pot = (
  beerPotId: number,
  isOpen: boolean,
  crates: BeerTabCrate[],
  paymentLink: string | null = null,
): BeerTabPot => ({
  beerPotId,
  isOpen,
  openedAt: '2026-01-01T00:00:00Z',
  owner: null,
  paymentLink,
  openCrates: 0,
  openCents: 0,
  paidCrates: 0,
  paidCents: 0,
  crates,
});

describe('tabTotalsOf', () => {
  it('sums the open crates of every pot and finds the oldest', () => {
    const pots = [
      pot(2, true, [crate(9, '2026-11-02T10:00:00Z', null, 1800)]),
      pot(1, false, [
        crate(3, '2026-10-01T10:00:00Z'),
        crate(1, '2026-09-01T10:00:00Z', '2026-09-10T10:00:00Z'),
      ]),
    ];

    expect(tabTotalsOf(pots)).toEqual({
      openCents: 3300,
      openCount: 2,
      paidCount: 1,
      oldestOpenAt: '2026-10-01T10:00:00Z',
    });
  });
});

describe('payeesOf', () => {
  it.each([['https://paypal.me/sabine', 'https://paypal.me/sabine/33.00EUR']])(
    'asks for the open amount of each owing pot via %s',
    (link, payHref) => {
      const pots = [
        pot(
          2,
          true,
          [crate(9, '2026-11-02T10:00:00Z', null, 1800), crate(8, '2026-11-01T10:00:00Z')],
          link,
        ),
        pot(1, false, [crate(1, '2026-09-01T10:00:00Z', '2026-09-10T10:00:00Z')]),
      ];

      expect(payeesOf(pots).map((payee) => [payee.potId, payee.openCents, payee.payHref])).toEqual([
        [2, 3300, payHref],
      ]);
    },
  );
});
