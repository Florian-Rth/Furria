import { KkPlanTouch } from '@furria/ui/KkPlanTouch';
import type { FC } from 'react';
import { useTablePlannerContext } from '../table-planner-context';
import { DESK_LABEL } from '../table-planner-copy';
import { TablePlannerCanvas } from './TablePlannerCanvas';
import { TablePlannerInspectorSheet } from './TablePlannerInspectorSheet';
import { TablePlannerTouchActionBar } from './TablePlannerTouchActionBar';
import { TablePlannerTouchDock } from './TablePlannerTouchDock';
import { TablePlannerTouchTop } from './TablePlannerTouchTop';
import { TablePlannerTouchTray } from './TablePlannerTouchTray';

export const TablePlannerTouchDesk: FC = () => {
  const planner = useTablePlannerContext();
  const showsSheet = planner.hasSideSheet && planner.drawer === 'inspector';
  const sheet = showsSheet ? (
    <KkPlanTouch.Sheet>
      <TablePlannerInspectorSheet />
    </KkPlanTouch.Sheet>
  ) : null;

  return (
    <KkPlanTouch label={DESK_LABEL}>
      <KkPlanTouch.Top>
        <TablePlannerTouchTop />
      </KkPlanTouch.Top>
      <KkPlanTouch.Canvas>
        <TablePlannerCanvas />
        <TablePlannerTouchActionBar />
        <TablePlannerTouchTray />
      </KkPlanTouch.Canvas>
      {sheet}
      <KkPlanTouch.Dock>
        <TablePlannerTouchDock />
      </KkPlanTouch.Dock>
    </KkPlanTouch>
  );
};
