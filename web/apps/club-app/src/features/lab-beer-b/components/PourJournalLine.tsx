import type { KkPourDeltaTone } from '@furria/ui/KkPourJournalRow';
import { KkPourJournalRow } from '@furria/ui/KkPourJournalRow';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { firstNameOf } from '../pour-copy';
import { journalCopyOf } from '../pour-hub-copy';
import type { PourJournalEntry } from '../pour-journal';
import { clockOf } from '../pour-time';

interface PourJournalLineProps {
  entry: PourJournalEntry;
  selectedId: number | null;
  onOpen: (personId: number) => void;
}

const deltaToneOf = (delta: number): KkPourDeltaTone => {
  if (delta === 0) {
    return 'none';
  }

  return delta > 0 ? 'in' : 'out';
};

export const PourJournalLine: FC<PourJournalLineProps> = ({ entry, selectedId, onOpen }) => {
  const copy = journalCopyOf(entry);
  const time = clockOf(entry.at);
  const personId = entry.personId;
  const person =
    personId === null
      ? null
      : {
          name: firstNameOf(labBeerPersonOf(personId)),
          onSelect: () => {
            onOpen(personId);
          },
        };
  const deltaTone = deltaToneOf(entry.stockDelta);

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
      selected={personId !== null && personId === selectedId}
    />
  );
};
