import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { useHallEditAction } from '../hooks/use-hall-edit-action';
import { useTablePlanHelpViewer } from '../hooks/use-table-plan-help-viewer';
import { useTablePlannerScreen } from '../hooks/use-table-planner-screen';
import { PAGE_TITLE } from '../table-planner-copy';
import { TablePlanHelp } from './TablePlanHelp';
import { TablePlannerStageBody } from './TablePlannerStageBody';

interface TablePlannerScreenProps {
  eventId: number;
}

export const TablePlannerScreen: FC<TablePlannerScreenProps> = ({ eventId }) => {
  const { origin, stage, onConflict } = useTablePlannerScreen(eventId);
  const hallAction = useHallEditAction(stage.kind === 'editing' ? stage.plan.hallId : null);
  const actions = hallAction === null ? undefined : ([hallAction] as const);
  const helpViewer = useTablePlanHelpViewer(stage);
  const help = toScreenHelp(<TablePlanHelp viewer={helpViewer} />);

  return (
    <KkScreen kind="fullscreen" title={PAGE_TITLE} origin={origin} actions={actions} help={help}>
      <KkVisuallyHidden component="h1">{PAGE_TITLE}</KkVisuallyHidden>
      <TablePlannerStageBody stage={stage} eventId={eventId} onConflict={onConflict} />
    </KkScreen>
  );
};
