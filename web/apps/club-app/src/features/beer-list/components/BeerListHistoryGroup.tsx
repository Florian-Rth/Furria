import { KkTabLedger } from '@furria/ui/KkTabLedger';
import type { FC } from 'react';
import { formatEuroCents } from '@/lib/money';
import {
  CRATE_LINE,
  earlierOpenGroup,
  enteredByLine,
  OPEN_GROUP,
  openDaysNote,
  paidGroupTitle,
} from '../beer-list-copy';
import { personNameOf, shortDayOf, weekdayDayOf } from '../beer-list-format';
import type { BeerHistoryGroup } from '../beer-tab';
import { openDaysOf, strokeOf } from '../beer-tab';
import { cratesLabel } from '../booking/booking-copy';
import type { BeerTabCrate } from '../schemas';

interface BeerListHistoryGroupProps {
  group: BeerHistoryGroup;
  myPersonId: number | null;
  now: number;
  freshIds: readonly number[];
}

const titleOf = (group: BeerHistoryGroup): string => {
  if (group.kind === 'paid') {
    return paidGroupTitle(shortDayOf(group.paidAt));
  }

  return group.current ? OPEN_GROUP : earlierOpenGroup(personNameOf(group.owner));
};

const lineLabelOf = (crate: BeerTabCrate, myPersonId: number | null): string =>
  crate.enteredBy === null || crate.enteredBy.personId === myPersonId
    ? CRATE_LINE
    : enteredByLine(crate.enteredBy.firstName);

export const BeerListHistoryGroup: FC<BeerListHistoryGroupProps> = ({
  group,
  myPersonId,
  now,
  freshIds,
}) => {
  const states = group.crates.map((crate) => strokeOf(crate, now, freshIds));
  const tone = states.includes('overdue') ? 'attention' : 'quiet';
  const title = titleOf(group);
  const meta = cratesLabel(group.crates.length);
  const amount = formatEuroCents(group.cents);
  const lines = group.crates.map((crate, index) => {
    const state = states[index] ?? 'open';
    const note = crate.paidAt === null ? openDaysNote(openDaysOf(crate.bookedAt, now)) : undefined;
    const day = weekdayDayOf(crate.bookedAt);
    const label = lineLabelOf(crate, myPersonId);
    const price = formatEuroCents(crate.priceCents);
    const overdue = state === 'overdue';

    return (
      <KkTabLedger.Line
        key={crate.crateId}
        state={state}
        day={day}
        label={label}
        note={note}
        noteAttention={overdue}
        amount={price}
      />
    );
  });

  return (
    <>
      <KkTabLedger.Head title={title} meta={meta} amount={amount} tone={tone} />
      {lines}
    </>
  );
};
