import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import { useHallEditAction } from '../hooks/use-hall-edit-action';
import { useTablePlannerScreen } from '../hooks/use-table-planner-screen';
import { PAGE_TITLE } from '../table-planner-copy';
import { TablePlannerStageBody } from './TablePlannerStageBody';

interface TablePlannerScreenProps {
  eventId: number;
}

export const TablePlannerScreen: FC<TablePlannerScreenProps> = ({ eventId }) => {
  const { origin, stage, onConflict } = useTablePlannerScreen(eventId);
  const hallAction = useHallEditAction(stage.kind === 'editing' ? stage.plan.hallId : null);
  const actions = hallAction === null ? undefined : ([hallAction] as const);

  return (
    <KkScreen kind="fullscreen" title={PAGE_TITLE} origin={origin} actions={actions}>
      <KkVisuallyHidden component="h1">{PAGE_TITLE}</KkVisuallyHidden>
      <TablePlannerStageBody stage={stage} eventId={eventId} onConflict={onConflict} />
    </KkScreen>
  );
};
