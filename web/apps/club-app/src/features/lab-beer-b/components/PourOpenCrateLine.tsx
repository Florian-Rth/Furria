import { KkPourTabLine } from '@furria/ui/KkPourTabLine';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf, isReminderDue } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerTabCrate } from '@/features/lab-beer/beer-lab-types';
import { firstNameOf } from '../pour-copy';
import { enteredByNote } from '../pour-member-copy';
import { clockOf, shortDateOf } from '../pour-time';

interface PourOpenCrateLineProps {
  entry: LabBeerTabCrate;
  now: string;
  marked?: boolean;
}

const noteOf = (entry: LabBeerTabCrate): string | null => {
  if (entry.paidBy !== null) {
    return `bezahlt am ${shortDateOf(entry.paidBy.bookedAt)}`;
  }

  return entry.crate.enteredById === entry.crate.personId
    ? null
    : enteredByNote(firstNameOf(labBeerPersonOf(entry.crate.enteredById)));
};

const stateOf = (entry: LabBeerTabCrate, now: string): 'paid' | 'overdue' | 'open' => {
  if (entry.paidBy !== null) {
    return 'paid';
  }

  return isReminderDue(entry.crate.bookedAt, now) ? 'overdue' : 'open';
};

export const PourOpenCrateLine: FC<PourOpenCrateLineProps> = ({ entry, now, marked = false }) => {
  const date = shortDateOf(entry.crate.bookedAt);
  const text = `1 Kiste · ${clockOf(entry.crate.bookedAt)}`;
  const amount = euroOf(entry.crate.priceCents);
  const note = noteOf(entry);
  const state = stateOf(entry, now);

  return (
    <KkPourTabLine
      date={date}
      text={text}
      note={note}
      amount={amount}
      state={state}
      marked={marked}
    />
  );
};
