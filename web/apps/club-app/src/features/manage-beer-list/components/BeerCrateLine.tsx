import type { KkPourTabState } from '@furria/ui/KkPourStateGlyph';
import { KkPourTabLine } from '@furria/ui/KkPourTabLine';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC } from 'react';
import { openDaysOf } from '../beer-hub';
import { euroOf, firstNameOf } from '../beer-hub-copy';
import { clockOf, shortDateOf } from '../beer-time';
import type { BeerJournalCrate } from '../schemas';

const OVERDUE_DAYS = 7;

interface BeerCrateLineProps {
  crate: BeerJournalCrate;
  now: string;
  marked?: boolean;
  sx?: KkSx;
}

const noteOf = (crate: BeerJournalCrate): string | null =>
  crate.enteredBy === null || crate.enteredBy.personId === crate.person?.personId
    ? null
    : `eingetragen von ${firstNameOf(crate.enteredBy)}`;

const stateOf = (crate: BeerJournalCrate, now: string): KkPourTabState => {
  if (crate.beerPaymentId !== null) {
    return 'paid';
  }

  return (openDaysOf(crate.bookedAt, now) ?? 0) >= OVERDUE_DAYS ? 'overdue' : 'open';
};

export const BeerCrateLine: FC<BeerCrateLineProps> = ({ crate, now, marked = false, sx }) => {
  const date = shortDateOf(crate.bookedAt);
  const text = `1 Kiste · ${clockOf(crate.bookedAt)}`;

  return (
    <KkPourTabLine
      date={date}
      text={text}
      note={noteOf(crate)}
      amount={euroOf(crate.priceCents)}
      state={stateOf(crate, now)}
      marked={marked}
      sx={sx}
    />
  );
};
