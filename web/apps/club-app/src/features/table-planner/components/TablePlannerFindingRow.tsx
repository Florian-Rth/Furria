import { KkFindingLine } from '@furria/ui/KkFindingLine';
import type { FC } from 'react';
import type { FindingItem } from '../hooks/use-findings-list';
import { TablePlannerActions } from './TablePlannerActions';

interface TablePlannerFindingRowProps {
  item: FindingItem;
}

export const TablePlannerFindingRow: FC<TablePlannerFindingRowProps> = ({ item }) => (
  <KkFindingLine
    severity={item.severity}
    title={item.title}
    text={item.value}
    action={<TablePlannerActions actions={item.actions} />}
    actionAt="below"
  />
);
