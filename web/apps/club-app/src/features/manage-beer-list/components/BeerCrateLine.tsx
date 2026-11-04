import { KkPourTabLine } from '@furria/ui/KkPourTabLine';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC } from 'react';
import { crateStateOf } from '../beer-hub';
import { crateLineTextOf, crateNoteOf, euroOf } from '../beer-hub-copy';
import { shortDateOf } from '../beer-time';
import type { BeerJournalCrate } from '../schemas';

interface BeerCrateLineProps {
  crate: BeerJournalCrate;
  now: string;
  marked?: boolean;
  sx?: KkSx;
}

export const BeerCrateLine: FC<BeerCrateLineProps> = ({ crate, now, marked = false, sx }) => {
  const date = shortDateOf(crate.bookedAt);
  const text = crateLineTextOf(crate);
  const note = crateNoteOf(crate);
  const amount = euroOf(crate.priceCents);
  const state = crateStateOf(crate, now);

  return (
    <KkPourTabLine
      date={date}
      text={text}
      note={note}
      amount={amount}
      state={state}
      marked={marked}
      sx={sx}
    />
  );
};
