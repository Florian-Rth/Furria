import type { KkPourDeltaTone } from '@furria/ui/KkPourJournalRow';
import { KkPourJournalRow } from '@furria/ui/KkPourJournalRow';
import type { FC } from 'react';
import type { BeerJournalEntry } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { firstNameOf, journalCopyOf } from '../beer-hub-copy';
import { clockOf } from '../beer-time';

interface BeerJournalLineProps {
  entry: BeerJournalEntry;
}

const deltaToneOf = (delta: number): KkPourDeltaTone => {
  if (delta === 0) {
    return 'none';
  }

  return delta > 0 ? 'in' : 'out';
};

export const BeerJournalLine: FC<BeerJournalLineProps> = ({ entry }) => {
  const hub = useBeerHubContext();
  const copy = journalCopyOf(entry);
  const time = clockOf(entry.at);
  const entryPerson = entry.person;
  const person =
    entryPerson === null
      ? null
      : {
          name: firstNameOf(entryPerson),
          onSelect: () => {
            hub.openPerson(entryPerson.personId);
          },
        };
  const deltaTone = deltaToneOf(entry.stockDelta);
  const selected = entryPerson !== null && entryPerson.personId === hub.selectedPersonId;

  return (
    <KkPourJournalRow
      kind={entry.kind}
      time={time}
      person={person}
      text={copy.text}
      note={copy.note}
      amount={copy.amount}
      delta={copy.delta}
      deltaTone={deltaTone}
      struck={entry.undone}
      selected={selected}
    />
  );
};
