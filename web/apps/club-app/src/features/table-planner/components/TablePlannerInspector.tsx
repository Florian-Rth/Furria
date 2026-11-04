import type { FC } from 'react';
import { useTablePlannerContext } from '../table-planner-context';
import { TablePlannerChairPanel } from './TablePlannerChairPanel';
import { TablePlannerGroupPanel } from './TablePlannerGroupPanel';
import { TablePlannerPlanPanel } from './TablePlannerPlanPanel';
import { TablePlannerRowPanel } from './TablePlannerRowPanel';

export const TablePlannerInspector: FC = () => {
  const { target } = useTablePlannerContext();

  switch (target.kind) {
    case 'plan':
      return <TablePlannerPlanPanel />;
    case 'row':
      return <TablePlannerRowPanel row={target.row} />;
    case 'group':
      return <TablePlannerGroupPanel groupId={target.groupId} rowIds={target.rowIds} />;
    case 'rows':
      return <TablePlannerGroupPanel groupId={null} rowIds={target.rowIds} />;
    case 'chair':
      return <TablePlannerChairPanel chair={target.chair} row={target.row} />;
  }
};
