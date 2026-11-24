import { describe, expect, it } from 'vitest';
import type { BeerTabPot, OpenBeerPot } from '../schemas';
import type { BeerBookingPending } from './booking-overlay';
import { pendingPotsOf } from './booking-overlay';

const OPEN_POT: OpenBeerPot = {
  beerPotId: 2,
  owner: { personId: 9, firstName: 'Sabine', lastName: 'Kurz' },
  paymentLink: 'https://paypal.me/sabine',
  openedAt: '2026-09-01T10:00:00Z',
  drinks: [
    { beerDrinkId: 1, name: 'Bier', cratePriceCents: 1800, hasStock: true, isDefault: false },
  ],
};

const tabPot = (beerPotId: number, isOpen: boolean, crateIds: readonly number[]): BeerTabPot => ({
  beerPotId,
  isOpen,
  openedAt: '2026-09-01T10:00:00Z',
  owner: null,
  paymentLink: null,
  openCrates: crateIds.length,
  openCents: crateIds.length * 1500,
  paidCrates: 0,
  paidCents: 0,
  crates: crateIds.map((crateId) => ({
    crateId,
    beerDrinkId: 1,
    drinkName: 'Bier',
    priceCents: 1500,
    bookedAt: '2026-10-01T20:00:00Z',
    enteredBy: null,
    paidAt: null,
  })),
});

interface PotShape {
  potId: number;
  crateIds: number[];
  openCents: number;
}

const shapeOf = (pots: readonly BeerTabPot[]): PotShape[] =>
  pots.map((pot) => ({
    potId: pot.beerPotId,
    crateIds: pot.crates.map((crate) => crate.crateId),
    openCents: pot.openCents,
  }));

describe('pendingPotsOf', () => {
  it.each<{
    label: string;
    pots: BeerTabPot[];
    pending: BeerBookingPending;
    expected: PotShape[];
  }>([
    {
      label: 'a fresh booking the tab does not know yet lands on the open pot',
      pots: [tabPot(2, true, [5]), tabPot(1, false, [3])],
      pending: {
        booked: {
          beerDrinkId: 1,
          drinkName: 'Bier',
          crateIds: [7, 8],
          priceCents: 1800,
          bookedAt: '2026-11-04T20:00:00Z',
        },
        undoneIds: [],
      },
      expected: [
        { potId: 2, crateIds: [7, 8, 5], openCents: 5100 },
        { potId: 1, crateIds: [3], openCents: 1500 },
      ],
    },
    {
      label: 'a booking the tab already shows is not counted twice',
      pots: [tabPot(2, true, [7, 5])],
      pending: {
        booked: {
          beerDrinkId: 1,
          drinkName: 'Bier',
          crateIds: [7],
          priceCents: 1800,
          bookedAt: '2026-11-04T20:00:00Z',
        },
        undoneIds: [],
      },
      expected: [{ potId: 2, crateIds: [7, 5], openCents: 3000 }],
    },
    {
      label: 'an earlier undo stays out while the tab still shows it after a new booking',
      pots: [tabPot(2, true, [6, 5])],
      pending: {
        booked: {
          beerDrinkId: 1,
          drinkName: 'Bier',
          crateIds: [7],
          priceCents: 1500,
          bookedAt: '2026-11-04T20:00:00Z',
        },
        undoneIds: [6],
      },
      expected: [{ potId: 2, crateIds: [7, 5], openCents: 3000 }],
    },
    {
      label: 'undoing the only crate of a pot drops the pot',
      pots: [tabPot(2, true, [7])],
      pending: {
        booked: {
          beerDrinkId: 1,
          drinkName: 'Bier',
          crateIds: [7],
          priceCents: 1500,
          bookedAt: '2026-11-04T20:00:00Z',
        },
        undoneIds: [7],
      },
      expected: [],
    },
  ])('$label', ({ pots, pending, expected }) => {
    expect(shapeOf(pendingPotsOf(pots, OPEN_POT, pending))).toEqual(expected);
  });
});
