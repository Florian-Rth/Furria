import { KkPourEntry } from '@furria/ui/KkPourEntry';
import { KkPourSettle } from '@furria/ui/KkPourSettle';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import { cratesLabel, firstNameOf, STATE_LABELS } from '../pour-copy';
import { enteredByNote, OWN_NAME, settleTextOf } from '../pour-member-copy';
import type { PourCrateEntry, PourEntry } from '../pour-stream';
import { clockOf } from '../pour-time';

interface PourStreamEntryProps {
  entry: PourEntry;
  owner: string;
  freshIds: ReadonlySet<number>;
}

const noteOf = (entry: PourCrateEntry): string | null =>
  entry.enteredById === null
    ? null
    : enteredByNote(firstNameOf(labBeerPersonOf(entry.enteredById)));

export const PourStreamEntry: FC<PourStreamEntryProps> = ({ entry, owner, freshIds }) => {
  const time = clockOf(entry.at);

  if (entry.kind === 'settle') {
    const text = settleTextOf(entry.crateCount, owner);
    const amount = euroOf(entry.cents);

    return <KkPourSettle time={time} text={text} amount={amount} />;
  }

  const person = labBeerPersonOf(entry.personId);
  const name = entry.own ? OWN_NAME : firstNameOf(person);
  const initials = person?.initials ?? '?';
  const note = noteOf(entry);
  const countLabel = cratesLabel(entry.count);
  const stateLabel = entry.state === null ? null : STATE_LABELS[entry.state];
  const fresh = entry.crateIds.some((id) => freshIds.has(id));

  return (
    <KkPourEntry
      time={time}
      initials={initials}
      name={name}
      note={note}
      count={entry.count}
      countLabel={countLabel}
      own={entry.own}
      state={entry.state}
      stateLabel={stateLabel}
      fresh={fresh}
    />
  );
};
