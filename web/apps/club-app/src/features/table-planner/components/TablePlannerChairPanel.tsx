import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import type { TableRow } from '@/features/hall-plan/schemas';
import type { ChairRef } from '@/features/hall-plan/table-plan-ops';
import { useChairPanel } from '../hooks/use-chair-panel';
import { CHAIR_REMOVED_NOTE } from '../table-planner-copy';
import { TablePlannerActions } from './TablePlannerActions';
import { TablePlannerTextFields } from './TablePlannerTextFields';

interface TablePlannerChairPanelProps {
  chair: ChairRef;
  row: TableRow;
}

export const TablePlannerChairPanel: FC<TablePlannerChairPanelProps> = ({ chair, row }) => {
  const panel = useChairPanel(chair, row);
  const removedNote = panel.removed ? <KkNote>{CHAIR_REMOVED_NOTE}</KkNote> : null;

  return (
    <KkFormSection title={panel.title}>
      {removedNote}
      <TablePlannerTextFields
        key={panel.key}
        number={panel.number}
        note={panel.note}
        onNumber={panel.changeNumber}
        onNote={panel.changeNote}
      />
      <TablePlannerActions actions={panel.actions} />
    </KkFormSection>
  );
};
