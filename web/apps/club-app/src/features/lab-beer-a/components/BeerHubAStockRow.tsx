import { KkStateBadge } from '@furria/ui/KkStateBadge';
import { KkWorkQueue } from '@furria/ui/KkWorkQueue';
import type { FC } from 'react';
import { DELIVERY_ACTION, OPEN_ROW, stockDays, stockFact, stockTitle } from '../beer-a-copy';
import { dayOf, paceOfDay } from '../beer-a-format';
import type { BeerAStockView } from '../beer-a-queue';

interface BeerHubAStockRowProps {
  view: BeerAStockView;
  selected: boolean;
  onOpen: () => void;
}

export const BeerHubAStockRow: FC<BeerHubAStockRowProps> = ({ view, selected, onOpen }) => {
  const emptyDay = view.emptyOn === null ? '' : dayOf(view.emptyOn);
  const relative = view.daysLeft === null ? undefined : stockDays(view.daysLeft);
  const mark = <KkStateBadge icon="alert" state="overdue" size="small" />;
  const action = <KkWorkQueue.Action icon="add" label={DELIVERY_ACTION} onSelect={onOpen} />;

  return (
    <KkWorkQueue.Row
      mark={mark}
      title={stockTitle(view.stock)}
      fact={stockFact(emptyDay, paceOfDay(view.pacePerDay))}
      day={String(view.stock)}
      relative={relative}
      whenTone="attention"
      action={action}
      openLabel={OPEN_ROW}
      selected={selected}
      onOpen={onOpen}
    />
  );
};
