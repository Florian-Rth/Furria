import { KkPlanTouch } from '@furria/ui/KkPlanTouch';
import type { FC } from 'react';
import { useTablePlannerContext } from '../table-planner-context';
import { TablePlannerTouchChairBar } from './TablePlannerTouchChairBar';
import { TablePlannerTouchRowsBar } from './TablePlannerTouchRowsBar';

export const TablePlannerTouchActionBar: FC = () => {
  const { actionBar, target } = useTablePlannerContext();

  if (actionBar === null) {
    return null;
  }

  const bar =
    target.kind === 'chair' ? (
      <TablePlannerTouchChairBar chair={target.chair} row={target.row} />
    ) : (
      <TablePlannerTouchRowsBar />
    );

  return (
    <KkPlanTouch.Float x={actionBar.x} y={actionBar.y} placement={actionBar.placement}>
      {bar}
    </KkPlanTouch.Float>
  );
};
