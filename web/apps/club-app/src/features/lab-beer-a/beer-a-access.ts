import type { LabBeerOutcome } from '@/features/lab-beer/beer-lab-actions';
import { bookCorrection, isEnrolled } from '@/features/lab-beer/beer-lab-actions';
import { stockOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';

export type BeerAMemberStanding = 'enrolled' | 'former' | 'outsider';

export type BeerABookingState = 'book' | 'declare' | 'empty';

export interface BeerACountChoice {
  value: number;
  disabled: boolean;
}

const CRATE_COUNTS = [1, 2, 3] as const;
const STOCK_KEEPER_ID = 0;

export const standingOf = (world: LabBeerWorld, personId: number): BeerAMemberStanding => {
  if (isEnrolled(world, personId)) {
    return 'enrolled';
  }

  return world.enrollments.some((enrollment) => enrollment.personId === personId)
    ? 'former'
    : 'outsider';
};

export const bookingStateOf = (world: LabBeerWorld, personId: number): BeerABookingState => {
  if (stockOf(world.movements, world.crates) <= 0) {
    return 'empty';
  }

  return isEnrolled(world, personId) ? 'book' : 'declare';
};

export const countChoicesOf = (stock: number): readonly BeerACountChoice[] =>
  CRATE_COUNTS.map((value) => ({ value, disabled: value > stock }));

export const fittingCountOf = (count: number, stock: number): number =>
  Math.max(1, Math.min(count, stock));

export const bookedIdsOf = (world: LabBeerWorld, count: number): readonly number[] => {
  const firstId = world.crates.reduce((highest, crate) => Math.max(highest, crate.id), 0) + 1;

  return Array.from({ length: count }, (_, index) => firstId + index);
};

export const emptiedWorldOf = (world: LabBeerWorld, at: string): LabBeerWorld => {
  const stock = stockOf(world.movements, world.crates);

  if (stock <= 0) {
    return world;
  }

  const outcome = bookCorrection(world, -stock, 'miscount', STOCK_KEEPER_ID, at);

  return outcome.kind === 'done' ? outcome.world : world;
};

export interface BeerAPotDraft {
  priceCents: number;
  paymentLink: string;
  paymentNote: string;
}

export const withPotSettings = (world: LabBeerWorld, draft: BeerAPotDraft): LabBeerOutcome => ({
  kind: 'done',
  world: {
    ...world,
    pot: {
      ...world.pot,
      priceCents: draft.priceCents,
      paymentLink: draft.paymentLink.trim() === '' ? null : draft.paymentLink.trim(),
      paymentNote: draft.paymentNote.trim() === '' ? null : draft.paymentNote.trim(),
    },
  },
});

const PRICE_PATTERN = /^\s*(\d{1,4})(?:[.,](\d{1,2}))?\s*€?\s*$/;

export const centsFromInput = (input: string): number | null => {
  const match = PRICE_PATTERN.exec(input);

  if (match === null) {
    return null;
  }

  const cents = Number(match[1]) * 100 + Number((match[2] ?? '0').padEnd(2, '0'));

  return cents > 0 ? cents : null;
};

export const inputFromCents = (cents: number): string =>
  `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')}`;
