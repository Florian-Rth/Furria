import { describe, expect, it } from 'vitest';
import type { BeerTabPot, OpenBeerPot } from '../schemas';
import type { BeerBookingPending } from './booking-overlay';
import { pendingPotsOf } from './booking-overlay';

const OPEN_POT: OpenBeerPot = {
  beerPotId: 2,
  owner: { personId: 9, firstName: 'Sabine', lastName: 'Kurz' },
  cratePriceCents: 1800,
  paymentLink: 'https://paypal.me/sabine',
  paymentNote: null,
  openedAt: '2026-09-01T10:00:00Z',
};

const tabPot = (beerPotId: number, isOpen: boolean, crateIds: readonly number[]): BeerTabPot => ({
  beerPotId,
  isOpen,
  openedAt: '2026-09-01T10:00:00Z',
  owner: null,
  paymentLink: null,
  paymentNote: null,
  openCrates: crateIds.length,
  openCents: crateIds.length * 1500,
  paidCrates: 0,
  paidCents: 0,
  crates: crateIds.map((crateId) => ({
    crateId,
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
      label: 'nothing pending keeps the tab',
      pots: [tabPot(2, true, [5])],
      pending: { booked: null, undoneIds: [] },
      expected: [{ potId: 2, crateIds: [5], openCents: 1500 }],
    },
    {
      label: 'a fresh booking the tab does not know yet lands on the open pot',
      pots: [tabPot(2, true, [5]), tabPot(1, false, [3])],
      pending: {
        booked: { crateIds: [7, 8], priceCents: 1800, bookedAt: '2026-11-04T20:00:00Z' },
        undoneIds: [],
      },
      expected: [
        { potId: 2, crateIds: [7, 8, 5], openCents: 5100 },
        { potId: 1, crateIds: [3], openCents: 1500 },
      ],
    },
    {
      label: 'a first booking opens the pot on an empty tab',
      pots: [tabPot(1, false, [3])],
      pending: {
        booked: { crateIds: [7], priceCents: 1800, bookedAt: '2026-11-04T20:00:00Z' },
        undoneIds: [],
      },
      expected: [
        { potId: 2, crateIds: [7], openCents: 1800 },
        { potId: 1, crateIds: [3], openCents: 1500 },
      ],
    },
    {
      label: 'a booking the tab already shows is not counted twice',
      pots: [tabPot(2, true, [7, 5])],
      pending: {
        booked: { crateIds: [7], priceCents: 1800, bookedAt: '2026-11-04T20:00:00Z' },
        undoneIds: [],
      },
      expected: [{ potId: 2, crateIds: [7, 5], openCents: 3000 }],
    },
    {
      label: 'an undone booking leaves the tab before the server confirms it',
      pots: [tabPot(2, true, [7, 5])],
      pending: {
        booked: { crateIds: [7], priceCents: 1500, bookedAt: '2026-11-04T20:00:00Z' },
        undoneIds: [7],
      },
      expected: [{ potId: 2, crateIds: [5], openCents: 1500 }],
    },
    {
      label: 'an earlier undo stays out while the tab still shows it after a new booking',
      pots: [tabPot(2, true, [6, 5])],
      pending: {
        booked: { crateIds: [7], priceCents: 1500, bookedAt: '2026-11-04T20:00:00Z' },
        undoneIds: [6],
      },
      expected: [{ potId: 2, crateIds: [7, 5], openCents: 3000 }],
    },
    {
      label: 'undoing the only crate of a pot drops the pot',
      pots: [tabPot(2, true, [7])],
      pending: {
        booked: { crateIds: [7], priceCents: 1500, bookedAt: '2026-11-04T20:00:00Z' },
        undoneIds: [7],
      },
      expected: [],
    },
  ])('$label', ({ pots, pending, expected }) => {
    expect(shapeOf(pendingPotsOf(pots, OPEN_POT, pending))).toEqual(expected);
  });
});
