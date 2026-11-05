import { KkPlanActionBar } from '@furria/ui/KkPlanActionBar';
import type { FC } from 'react';
import type { TableRow } from '@/features/hall-plan/schemas';
import type { ChairRef } from '@/features/hall-plan/table-layout';
import { useChairPanel } from '../hooks/use-chair-panel';
import { useTablePlannerContext } from '../table-planner-context';
import { ACTION_BAR_LABEL, CHAIR_NOTE_ACTION, CHAIR_NUMBER_ACTION } from '../table-planner-copy';

interface TablePlannerTouchChairBarProps {
  chair: ChairRef;
  row: TableRow;
}

export const TablePlannerTouchChairBar: FC<TablePlannerTouchChairBarProps> = ({ chair, row }) => {
  const planner = useTablePlannerContext();
  const panel = useChairPanel(chair, row);
  const actions = panel.actions.map((action) => (
    <KkPlanActionBar.Button
      key={action.id}
      id={action.id}
      label={action.label}
      icon={action.icon}
      tone={action.tone === 'danger' ? 'danger' : 'ink'}
      onClick={action.onClick}
    />
  ));

  return (
    <KkPlanActionBar label={ACTION_BAR_LABEL}>
      <KkPlanActionBar.Button
        id="number"
        label={CHAIR_NUMBER_ACTION}
        icon="list"
        onClick={planner.inspectSelection}
      />
      <KkPlanActionBar.Button
        id="note"
        label={CHAIR_NOTE_ACTION}
        icon="note"
        onClick={planner.inspectSelection}
      />
      <KkPlanActionBar.Divider />
      {actions}
    </KkPlanActionBar>
  );
};
