import { KkLedgerRow } from '@furria/ui/KkLedgerRow';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import {
  enteredByText,
  SETTLEMENT_TITLE,
  STATE_OPEN,
  STATE_PAID,
  settlementMeta,
} from '../ledger-copy';
import { dayOf, timeOf } from '../ledger-format';
import type { LedgerEntry } from '../ledger-statement';

interface LedgerEntryRowProps {
  entry: LedgerEntry;
  fresh: boolean;
}

const firstNameOf = (personId: number): string => labBeerPersonOf(personId)?.firstName ?? '';

const rangeOf = (first: string | null, last: string | null): string => {
  if (first === null || last === null) {
    return '';
  }

  const from = dayOf(first);
  const to = dayOf(last);

  if (from === to) {
    return from;
  }

  return from.slice(3) === to.slice(3) ? `${from.slice(0, 3)}–${to}` : `${from}–${to}`;
};

export const LedgerEntryRow: FC<LedgerEntryRowProps> = ({ entry, fresh }) => {
  const day = dayOf(entry.at);
  const time = timeOf(entry.at);
  const balance = euroOf(entry.balanceCents);

  if (entry.kind === 'payment') {
    const meta = settlementMeta(entry.crateCount, rangeOf(entry.firstCrateAt, entry.lastCrateAt));
    const amount = `−${euroOf(entry.cents)}`;

    return (
      <KkLedgerRow
        kind="settlement"
        rail={entry.rail}
        day={day}
        time={time}
        title={SETTLEMENT_TITLE}
        meta={meta}
        amount={amount}
        balance={balance}
      />
    );
  }

  const state = entry.paid ? 'done' : 'open';
  const stateLabel = entry.paid ? STATE_PAID : STATE_OPEN;
  const meta = entry.enteredById === null ? null : enteredByText(firstNameOf(entry.enteredById));
  const amount = euroOf(entry.priceCents);

  return (
    <KkLedgerRow
      kind="crate"
      rail={entry.rail}
      day={day}
      time={time}
      state={state}
      stateLabel={stateLabel}
      meta={meta}
      amount={amount}
      amountQuiet={entry.paid}
      balance={balance}
      fresh={fresh}
    />
  );
};
