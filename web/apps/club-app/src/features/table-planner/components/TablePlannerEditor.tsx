import { KkPlanDesk } from '@furria/ui/KkPlanDesk';
import type { FC } from 'react';
import type { SeatingResponse, TablePlanResponse } from '@/features/hall-plan/schemas';
import { useTablePlanner } from '../hooks/use-table-planner';
import { TablePlannerContext } from '../table-planner-context';
import { DESK_LABEL } from '../table-planner-copy';
import { TablePlannerAddSheet } from './TablePlannerAddSheet';
import { TablePlannerCanvas } from './TablePlannerCanvas';
import { TablePlannerFindingsDrawer } from './TablePlannerFindingsDrawer';
import { TablePlannerInspector } from './TablePlannerInspector';
import { TablePlannerInspectorDrawer } from './TablePlannerInspectorDrawer';
import { TablePlannerRail } from './TablePlannerRail';
import { TablePlannerSettingsDrawer } from './TablePlannerSettingsDrawer';
import { TablePlannerStatus } from './TablePlannerStatus';
import { TablePlannerTouchDesk } from './TablePlannerTouchDesk';

interface TablePlannerEditorProps {
  plan: TablePlanResponse;
  seating: SeatingResponse;
  onConflict: () => void;
}

export const TablePlannerEditor: FC<TablePlannerEditorProps> = ({ plan, seating, onConflict }) => {
  const planner = useTablePlanner(plan, seating, onConflict);
  const desk = planner.isTouch ? (
    <TablePlannerTouchDesk />
  ) : (
    <KkPlanDesk label={DESK_LABEL}>
      <KkPlanDesk.Status>
        <TablePlannerStatus />
      </KkPlanDesk.Status>
      <KkPlanDesk.Rail>
        <TablePlannerRail />
      </KkPlanDesk.Rail>
      <KkPlanDesk.Canvas>
        <TablePlannerCanvas />
      </KkPlanDesk.Canvas>
      <KkPlanDesk.Inspector>
        <TablePlannerInspector />
      </KkPlanDesk.Inspector>
    </KkPlanDesk>
  );

  return (
    <TablePlannerContext.Provider value={planner}>
      {desk}
      <TablePlannerInspectorDrawer />
      <TablePlannerAddSheet />
      <TablePlannerFindingsDrawer />
      <TablePlannerSettingsDrawer />
    </TablePlannerContext.Provider>
  );
};
