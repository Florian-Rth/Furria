import { KkAvatar } from '@furria/ui/KkAvatar';
import { KkTabTally } from '@furria/ui/KkTabTally';
import { KkWorkQueue } from '@furria/ui/KkWorkQueue';
import type { FC } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import { euroOf } from '@/features/lab-beer/beer-lab-ledger';
import { cratesLabel, FORMER_FACT, OPEN_ROW, PAYMENT_ACTION, sinceDays } from '../beer-a-copy';
import { nameOf } from '../beer-a-format';
import type { BeerAQueueRow } from '../beer-a-queue';
import { openStrokesOf } from '../beer-a-tab';

interface BeerHubAQueueRowProps {
  row: BeerAQueueRow;
  now: string;
  selected: boolean;
  onPay: (personId: number) => void;
}

export const BeerHubAQueueRow: FC<BeerHubAQueueRowProps> = ({ row, now, selected, onPay }) => {
  const person = labBeerPersonOf(row.personId);
  const name = nameOf(person);
  const pay = (): void => {
    onPay(row.personId);
  };
  const facts = row.enrolled
    ? cratesLabel(row.tab.openCount)
    : `${cratesLabel(row.tab.openCount)} · ${FORMER_FACT}`;
  const fact = (
    <>
      <KkTabTally strokes={openStrokesOf(row.tab, now)} label={cratesLabel(row.tab.openCount)} />
      {facts}
    </>
  );
  const mark = <KkAvatar initials={person?.initials ?? ''} size="small" />;
  const action = <KkWorkQueue.Action icon="fees" label={PAYMENT_ACTION} onSelect={pay} />;

  return (
    <KkWorkQueue.Row
      mark={mark}
      title={name}
      fact={fact}
      day={euroOf(row.tab.openCents)}
      relative={sinceDays(row.openDays)}
      whenTone={row.overdue ? 'attention' : 'ink'}
      action={action}
      openLabel={OPEN_ROW}
      selected={selected}
      onOpen={pay}
    />
  );
};
