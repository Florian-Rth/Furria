import { KkMeta } from '@furria/ui/KkMeta';
import { KkWorkQueue } from '@furria/ui/KkWorkQueue';
import type { FC } from 'react';
import { FILTER_EMPTY, QUEUE_EMPTY, QUEUE_LABEL } from '../beer-a-copy';
import type { BeerAQueueFilter, BeerAQueueRow, BeerAStockView } from '../beer-a-queue';
import type { BeerASelection } from '../hooks/use-beer-hub-a';
import { BeerHubAQueueRow } from './BeerHubAQueueRow';
import { BeerHubAStockRow } from './BeerHubAStockRow';

interface BeerHubAQueueProps {
  rows: readonly BeerAQueueRow[];
  stock: BeerAStockView;
  filter: BeerAQueueFilter;
  now: string;
  selection: BeerASelection | null;
  onPay: (personId: number) => void;
  onStock: () => void;
}

export const BeerHubAQueue: FC<BeerHubAQueueProps> = ({
  rows,
  stock,
  filter,
  now,
  selection,
  onPay,
  onStock,
}) => {
  const stockRow = stock.warns ? (
    <BeerHubAStockRow
      key="stock"
      view={stock}
      selected={selection?.kind === 'stock'}
      onOpen={onStock}
    />
  ) : null;
  const tabRows = rows.map((row) => (
    <BeerHubAQueueRow
      key={row.personId}
      row={row}
      now={now}
      selected={selection?.kind === 'payment' && selection.personId === row.personId}
      onPay={onPay}
    />
  ));
  const emptyText = filter === 'open' ? QUEUE_EMPTY : FILTER_EMPTY;
  const emptyNote = tabRows.length === 0 ? <KkMeta>{emptyText}</KkMeta> : null;

  return (
    <>
      <KkWorkQueue label={QUEUE_LABEL}>
        {stockRow}
        {tabRows}
      </KkWorkQueue>
      {emptyNote}
    </>
  );
};
