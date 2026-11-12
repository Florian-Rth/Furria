import type { DragEndEvent } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { studioDragPluginsOf } from '@furria/studio/studio-drag-copy';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import { toStatementHead, toStatementMoveLabel, toTallyMeta } from '../group-matcher-hub-copy';
import { movedOrderOf, toCoverageTally } from '../statement-pool';

export interface PoolRow {
  key: string;
  index: number;
  lead: string;
  text: string;
  meta: string;
  moveLabel: string;
  selected: boolean;
  open: () => void;
}

export interface PoolOrder {
  rows: PoolRow[];
  dragPlugins: ReturnType<typeof studioDragPluginsOf>;
  onDragEnd: (event: DragEndEvent) => void;
}

export const usePoolOrder = (): PoolOrder => {
  const { pool, pane, operations, openStatement } = useGroupMatcherHubContext();
  const statementIds = pool.statements.map((statement) => statement.statementId);
  const selectedId = pane?.kind === 'statement' ? pane.statementId : null;
  const headOf = (key: string | number): string => {
    const index = statementIds.indexOf(Number(key));

    return index < 0 ? String(key) : toStatementHead(index);
  };

  const onDragEnd = (event: DragEndEvent): void => {
    const source = event.operation.source;

    if (event.canceled || !isSortable(source)) {
      return;
    }

    const order = movedOrderOf(statementIds, source.initialIndex, source.index);

    if (order !== null) {
      operations.reorder(order);
    }
  };

  const rows = pool.statements.map((statement, index) => ({
    key: String(statement.statementId),
    index,
    lead: String(index + 1),
    text: statement.text,
    meta: toTallyMeta(toCoverageTally(pool, statement.statementId)),
    moveLabel: toStatementMoveLabel(index),
    selected: statement.statementId === selectedId,
    open: () => {
      openStatement(statement.statementId);
    },
  }));

  return {
    rows,
    dragPlugins: studioDragPluginsOf({ itemOf: headOf, targetOf: headOf }),
    onDragEnd,
  };
};
