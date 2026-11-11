import { useSortable } from '@dnd-kit/react/sortable';
import { KkStatementList } from '@furria/ui/KkStatementList';
import type { FC } from 'react';
import type { PoolRow } from '../hooks/use-pool-order';

interface StatementPoolRowProps {
  row: PoolRow;
}

export const StatementPoolRow: FC<StatementPoolRowProps> = ({ row }) => {
  const sortable = useSortable({ id: row.key, index: row.index });

  return (
    <KkStatementList.SortRow
      rowRef={sortable.ref}
      handleRef={sortable.handleRef}
      handleLabel={row.moveLabel}
      dragging={sortable.isDragging}
    >
      <KkStatementList.PressRow
        lead={row.lead}
        meta={row.meta}
        selected={row.selected}
        onPress={row.open}
      >
        {row.text}
      </KkStatementList.PressRow>
    </KkStatementList.SortRow>
  );
};
