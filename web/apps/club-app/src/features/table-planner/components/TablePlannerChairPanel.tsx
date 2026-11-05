import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import type { TableRow } from '@/features/hall-plan/schemas';
import type { ChairRef } from '@/features/hall-plan/table-layout';
import { useChairPanel } from '../hooks/use-chair-panel';
import { CHAIR_NOTICES } from '../table-planner-copy';
import { TablePlannerActions } from './TablePlannerActions';
import { TablePlannerTextFields } from './TablePlannerTextFields';

interface TablePlannerChairPanelProps {
  chair: ChairRef;
  row: TableRow;
}

export const TablePlannerChairPanel: FC<TablePlannerChairPanelProps> = ({ chair, row }) => {
  const panel = useChairPanel(chair, row);
  const notice = panel.notice === null ? null : <KkNote>{CHAIR_NOTICES[panel.notice]}</KkNote>;

  return (
    <KkFormSection title={panel.title}>
      {notice}
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
