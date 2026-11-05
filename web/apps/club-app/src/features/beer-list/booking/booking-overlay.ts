import { centsOf } from '../beer-tab';
import type { BeerTabCrate, BeerTabPot, OpenBeerPot } from '../schemas';

export interface BeerBookedCrates {
  crateIds: readonly number[];
  priceCents: number;
  bookedAt: string;
}

export interface BeerBookingPending {
  booked: BeerBookedCrates | null;
  undoneIds: readonly number[];
}

export const NO_PENDING_BOOKING: BeerBookingPending = { booked: null, undoneIds: [] };

const withTotalsOf = (pot: BeerTabPot, crates: readonly BeerTabCrate[]): BeerTabPot => {
  const open = crates.filter((crate) => crate.paidAt === null);
  const paid = crates.filter((crate) => crate.paidAt !== null);

  return {
    ...pot,
    crates: [...crates],
    openCrates: open.length,
    openCents: centsOf(open),
    paidCrates: paid.length,
    paidCents: centsOf(paid),
  };
};

const emptyTabPotOf = (pot: OpenBeerPot): BeerTabPot => ({
  beerPotId: pot.beerPotId,
  isOpen: true,
  openedAt: pot.openedAt,
  owner: pot.owner,
  paymentLink: pot.paymentLink,
  openCrates: 0,
  openCents: 0,
  paidCrates: 0,
  paidCents: 0,
  crates: [],
});

const missingCratesOf = (
  pots: readonly BeerTabPot[],
  booked: BeerBookedCrates | null,
  undoneIds: readonly number[],
): readonly BeerTabCrate[] => {
  if (booked === null) {
    return [];
  }

  const known = new Set(pots.flatMap((pot) => pot.crates.map((crate) => crate.crateId)));

  return booked.crateIds
    .filter((crateId) => !known.has(crateId) && !undoneIds.includes(crateId))
    .map((crateId) => ({
      crateId,
      priceCents: booked.priceCents,
      bookedAt: booked.bookedAt,
      enteredBy: null,
      paidAt: null,
    }));
};

export const pendingPotsOf = (
  pots: readonly BeerTabPot[],
  openPot: OpenBeerPot | null,
  pending: BeerBookingPending,
): readonly BeerTabPot[] => {
  const missing = missingCratesOf(pots, pending.booked, pending.undoneIds);
  const hasOpenPot = openPot !== null && pots.some((pot) => pot.beerPotId === openPot.beerPotId);
  const withOpenPot =
    missing.length === 0 || openPot === null || hasOpenPot
      ? pots
      : [emptyTabPotOf(openPot), ...pots];

  if (missing.length === 0 && pending.undoneIds.length === 0) {
    return withOpenPot;
  }

  return withOpenPot
    .map((pot) => {
      const kept = pot.crates.filter((crate) => !pending.undoneIds.includes(crate.crateId));
      const added = openPot !== null && pot.beerPotId === openPot.beerPotId ? missing : [];

      return withTotalsOf(pot, [...added, ...kept]);
    })
    .filter((pot) => pot.crates.length > 0);
};
