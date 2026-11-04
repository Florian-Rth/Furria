import { KkTabLedger } from '@furria/ui/KkTabLedger';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf, openDaysOf } from '@/features/lab-beer/beer-lab-ledger';
import {
  CRATE_LINE,
  cratesLabel,
  enteredByLine,
  OPEN_GROUP,
  openDaysNote,
  paidGroupTitle,
} from '../beer-a-copy';
import { dayOf, shortDayOf } from '../beer-a-format';
import type { BeerAHistoryGroup as HistoryGroup } from '../beer-a-tab';
import { strokeOf } from '../beer-a-tab';

interface BeerAHistoryGroupProps {
  group: HistoryGroup;
  personId: number;
  now: string;
  freshIds: readonly number[];
}

export const BeerAHistoryGroup: FC<BeerAHistoryGroupProps> = ({
  group,
  personId,
  now,
  freshIds,
}) => {
  const states = group.crates.map((entry) => strokeOf(entry, now, freshIds));
  const attention = states.includes('overdue');
  const title =
    group.kind === 'open' ? OPEN_GROUP : paidGroupTitle(shortDayOf(group.payment.bookedAt));
  const lines = group.crates.map((entry, index) => {
    const state = states[index] ?? 'open';
    const label =
      entry.crate.enteredById === personId
        ? CRATE_LINE
        : enteredByLine(labBeerPersonOf(entry.crate.enteredById)?.firstName ?? '');
    const days = openDaysOf(entry.crate.bookedAt, now) ?? 0;
    const note = entry.paidBy === null ? openDaysNote(days) : undefined;

    return (
      <KkTabLedger.Line
        key={entry.crate.id}
        state={state}
        day={dayOf(entry.crate.bookedAt)}
        label={label}
        note={note}
        noteAttention={state === 'overdue'}
        amount={euroOf(entry.crate.priceCents)}
      />
    );
  });

  return (
    <>
      <KkTabLedger.Head
        title={title}
        meta={cratesLabel(group.crates.length)}
        amount={euroOf(group.cents)}
        tone={attention ? 'attention' : 'quiet'}
      />
      {lines}
    </>
  );
};
