import { DragDropProvider } from '@dnd-kit/react';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkStatementList } from '@furria/ui/KkStatementList';
import type { FC } from 'react';
import { POOL_EMPTY, POOL_LABEL, toPoolTitle } from '../group-matcher-hub-copy';
import { usePoolOrder } from '../hooks/use-pool-order';
import { StatementAddForm } from './StatementAddForm';
import { StatementPoolRow } from './StatementPoolRow';

export const StatementPoolSection: FC = () => {
  const order = usePoolOrder();
  const title = toPoolTitle(order.rows.length);
  const rows = order.rows.map((row) => <StatementPoolRow key={row.key} row={row} />);
  const list =
    rows.length === 0 ? (
      <KkNote tone="muted" icon="info">
        {POOL_EMPTY}
      </KkNote>
    ) : (
      <DragDropProvider plugins={order.dragPlugins} onDragEnd={order.onDragEnd}>
        <KkStatementList label={POOL_LABEL}>{rows}</KkStatementList>
      </DragDropProvider>
    );

  return (
    <KkPanelSection title={title}>
      {list}
      <StatementAddForm />
    </KkPanelSection>
  );
};
